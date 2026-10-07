const cron = require('node-cron');
const Course = require('../models/Course');
const University = require('../models/University');
const { fetchCleanPageText, extractCourseDataWithAI, syncSingleCourseFromUrl } = require('./courseCrawlerService');
const { clearShortlistCache } = require('../utils/cache');

// State tracking for Admin Inspection
let schedulerState = {
  initialized: false,
  lastRunAt: null,
  lastRunSummary: null,
  isRunning: false,
  activeSeason: 'GENERAL',
  cronJobs: []
};

/**
 * Determines current global university academic intake season
 */
function getAcademicUpdateSeason() {
  const currentMonth = new Date().getMonth() + 1; // 1 to 12

  // Peak Season 1: Fall Launch & New Year Tuition Fee Publications (Aug, Sep, Oct)
  if (currentMonth >= 8 && currentMonth <= 10) {
    return {
      season: 'PEAK_FALL_FEE_REVISION',
      description: 'Fall intake opening & next academic year tuition fee publication window',
      cadence: 'Weekly (Every Sunday 02:00 AM IST)'
    };
  }

  // Peak Season 2: Spring Intake & Round 2/3 Deadlines (Jan, Feb)
  if (currentMonth === 1 || currentMonth === 2) {
    return {
      season: 'SPRING_INTAKE_AND_DEADLINES',
      description: 'Spring semester launch & round-2 scholarship deadline revisions',
      cadence: 'Bi-Weekly (1st and 15th at 02:00 AM IST)'
    };
  }

  // Peak Season 3: Pre-Fall Final Confirmation & Visa Prep (May, Jun)
  if (currentMonth === 5 || currentMonth === 6) {
    return {
      season: 'SUMMER_FINAL_ADMISSIONS',
      description: 'Final tuition deposit and late application round revision',
      cadence: 'Bi-Weekly (1st and 15th at 02:00 AM IST)'
    };
  }

  // Off-Peak Months: Stable period (Nov, Dec, Mar, Apr, Jul)
  return {
    season: 'OFF_PEAK_MONITORING',
    description: 'General baseline monitoring for rolling admission updates',
    cadence: 'Monthly (1st of month at 02:30 AM IST)'
  };
}

/**
 * Runs a polite, autonomous sweep of all existing courses to detect page revisions
 */
async function runAutonomousCourseUpdateSweep(options = {}) {
  if (schedulerState.isRunning) {
    console.log('⚠️ [CourseScheduler] An update sweep is already actively running. Skipping concurrent trigger.');
    return { status: 'ALREADY_RUNNING' };
  }

  schedulerState.isRunning = true;
  const startTime = Date.now();
  console.log(`\n======================================================`);
  console.log(`🔄 [CourseScheduler] Starting University Courses & Fees Update Sweep`);
  console.log(`⏰ Time: ${new Date().toISOString()}`);
  console.log(`======================================================\n`);

  const summary = {
    startedAt: new Date(),
    completedAt: null,
    durationSeconds: 0,
    totalInspected: 0,
    unchangedCount: 0,
    updatedCount: 0,
    errorCount: 0,
    details: []
  };

  try {
    // 1. Fetch courses sorted by oldest verified first
    const batchLimit = options.limit || 500;
    const courses = await Course.find({ sourceUrl: { $exists: true, $ne: '' } })
      .populate('university', 'name website country')
      .sort({ lastVerifiedAt: 1 })
      .limit(batchLimit);

    summary.totalInspected = courses.length;
    console.log(`🔍 [CourseScheduler] Found ${courses.length} courses to inspect.`);

    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      const logPrefix = `[${i + 1}/${courses.length}]`;

      try {
        // Step 1: Clean text & calculate fresh SHA-256 fingerprint
        const { cleanText, contentHash: newHash } = await fetchCleanPageText(course.sourceUrl);

        // Step 2: Compare with existing hash
        if (course.contentHash && course.contentHash === newHash) {
          // Unchanged! Update verified timestamp with 0 LLM tokens spent
          await Course.findByIdAndUpdate(course._id, {
            $set: {
              lastVerifiedAt: new Date(),
              syncStatus: 'ACTIVE'
            }
          });
          summary.unchangedCount++;
          console.log(`   ${logPrefix} ⚡ UNCHANGED: "${course.courseName}" (${course.universityName || 'University'}) — Hash matched. Zero tokens used.`);
        } else {
          // Page modified or first-time hash: Re-extract with Groq AI!
          console.log(`   ${logPrefix} 🔔 MODIFIED: "${course.courseName}" — Page change detected! Re-extracting with AI...`);
          const prevFee = course.annualFee?.amount;
          const updatedDoc = await syncSingleCourseFromUrl(course.sourceUrl, course.university?._id || course.university);
          const newFee = updatedDoc.annualFee?.amount;

          summary.updatedCount++;
          const feeDiffNote = (prevFee !== newFee) ? ` [Fee changed: ${course.annualFee?.currency} ${prevFee} -> ${newFee}]` : '';
          summary.details.push({
            id: course._id,
            name: course.courseName,
            university: course.universityName,
            status: 'UPDATED',
            note: `Updated successfully.${feeDiffNote}`
          });
          console.log(`   ${logPrefix} ✅ UPDATED: "${updatedDoc.courseName}"${feeDiffNote}`);
        }

        // Polite delay (1.2 seconds) to avoid throttling by university web servers
        await new Promise(r => setTimeout(r, 1200));
      } catch (itemErr) {
        summary.errorCount++;
        console.warn(`   ${logPrefix} ❌ Error inspecting ${course.sourceUrl}:`, itemErr.message);
        summary.details.push({
          id: course._id,
          name: course.courseName,
          university: course.universityName,
          status: 'ERROR',
          note: itemErr.message
        });

        // If page returned 404 or moved, mark for advisory review
        if (itemErr.message.includes('404') || itemErr.message.includes('410')) {
          await Course.findByIdAndUpdate(course._id, {
            $set: { syncStatus: 'NEEDS_REVIEW' }
          });
        }
      }
    }

    clearShortlistCache();
  } catch (err) {
    console.error('❌ [CourseScheduler] Critical error in update sweep:', err.message);
  } finally {
    summary.completedAt = new Date();
    summary.durationSeconds = Math.round((Date.now() - startTime) / 1000);
    schedulerState.isRunning = false;
    schedulerState.lastRunAt = new Date();
    schedulerState.lastRunSummary = summary;

    console.log(`\n======================================================`);
    console.log(`🎉 [CourseScheduler] Sweep Finished in ${summary.durationSeconds}s`);
    console.log(`📊 Inspected: ${summary.totalInspected} | Unchanged: ${summary.unchangedCount} | Updated: ${summary.updatedCount} | Errors: ${summary.errorCount}`);
    console.log(`======================================================\n`);
  }

  return summary;
}

/**
 * Initializes and schedules node-cron tasks matched to academic intake seasons
 */
function initCourseUpdateScheduler() {
  if (schedulerState.initialized) {
    return;
  }

  const seasonInfo = getAcademicUpdateSeason();
  schedulerState.activeSeason = seasonInfo.season;

  console.log(`\n🤖 [CourseScheduler] Initializing Autonomous University Update Engine...`);
  console.log(`📅 Current Academic Window: ${seasonInfo.season} (${seasonInfo.description})`);
  console.log(`⏱️ Schedule Policy: ${seasonInfo.cadence}`);

  // Schedule 1: Peak Fall Admission Months (August, September, October) -> Runs weekly every Sunday at 02:00 AM IST
  const jobFallWeekly = cron.schedule('0 2 * 8-10 0', async () => {
    console.log('⏰ [Cron: Peak Fall Intake] Triggering Sunday fee & intake update sweep...');
    await runAutonomousCourseUpdateSweep();
  }, { timezone: 'Asia/Kolkata' });

  // Schedule 2: Spring & Summer Months (January, February, May, June) -> Runs on 1st & 15th at 02:00 AM IST
  const jobSpringBiWeekly = cron.schedule('0 2 1,15 1,2,5,6 *', async () => {
    console.log('⏰ [Cron: Spring/Summer Deadlines] Triggering bi-weekly course update sweep...');
    await runAutonomousCourseUpdateSweep();
  }, { timezone: 'Asia/Kolkata' });

  // Schedule 3: Baseline Monthly Sweep for all other months (March, April, July, November, December) -> 1st at 02:30 AM IST
  const jobOffPeakMonthly = cron.schedule('30 2 1 3,4,7,11,12 *', async () => {
    console.log('⏰ [Cron: Monthly Baseline] Triggering monthly baseline course update sweep...');
    await runAutonomousCourseUpdateSweep();
  }, { timezone: 'Asia/Kolkata' });

  schedulerState.cronJobs = [jobFallWeekly, jobSpringBiWeekly, jobOffPeakMonthly];
  schedulerState.initialized = true;
  console.log(`✅ [CourseScheduler] Engine active. Monitoring 3,670+ university endpoints.\n`);
}

/**
 * Get current health and status of the update engine
 */
function getSchedulerStatus() {
  const seasonInfo = getAcademicUpdateSeason();
  return {
    initialized: schedulerState.initialized,
    isRunning: schedulerState.isRunning,
    activeSeason: seasonInfo.season,
    seasonDescription: seasonInfo.description,
    scheduleCadence: seasonInfo.cadence,
    lastRunAt: schedulerState.lastRunAt,
    lastRunSummary: schedulerState.lastRunSummary,
    timezone: 'Asia/Kolkata'
  };
}

module.exports = {
  initCourseUpdateScheduler,
  runAutonomousCourseUpdateSweep,
  getSchedulerStatus,
  getAcademicUpdateSeason
};
