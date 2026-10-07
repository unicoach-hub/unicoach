const WritingSession = require('../models/WritingSession');
const IeltsAttempt = require('../models/IeltsAttempt');
const User = require('../models/User');

/**
 * POST /api/writing/session
 * Save a new typing/writing test session
 */
exports.saveWritingSession = async (req, res) => {
  try {
    const { type, wpm, accuracy, score, textTitle, charactersTyped, timeSpent } = req.body;
    
    if (wpm === undefined || accuracy === undefined || score === undefined) {
      return res.status(400).json({ message: 'Missing required session metrics (wpm, accuracy, score)' });
    }

    const session = new WritingSession({
      user: req.user.id,
      type: type || 'typing-test',
      wpm,
      accuracy,
      score,
      textTitle,
      charactersTyped,
      timeSpent
    });

    await session.save();
    return res.status(201).json({ message: 'Session saved successfully', session });
  } catch (err) {
    console.error('Error saving writing session:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/writing/history
 * Retrieve writing history for the logged-in student
 */
exports.getWritingHistory = async (req, res) => {
  try {
    const history = await WritingSession.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    return res.json(history);
  } catch (err) {
    console.error('Error retrieving writing history:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/writing/stats
 * Fetch aggregate writing stats
 */
exports.getWritingStats = async (req, res) => {
  try {
    const sessions = await WritingSession.find({ user: req.user.id });
    
    if (sessions.length === 0) {
      return res.json({
        totalTests: 0,
        avgWpm: 0,
        bestWpm: 0,
        avgAccuracy: 0,
        bestScore: 0
      });
    }

    let totalWpm = 0;
    let totalAccuracy = 0;
    let bestWpm = 0;
    let bestScore = 0;

    sessions.forEach(s => {
      totalWpm += s.wpm;
      totalAccuracy += s.accuracy;
      if (s.wpm > bestWpm) bestWpm = s.wpm;
      if (s.score > bestScore) bestScore = s.score;
    });

    return res.json({
      totalTests: sessions.length,
      avgWpm: Math.round(totalWpm / sessions.length),
      bestWpm,
      avgAccuracy: Math.round(totalAccuracy / sessions.length),
      bestScore
    });
  } catch (err) {
    console.error('Error fetching writing stats:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PUT /api/writing/profile
 * Update student profile fields
 */
exports.updateStudentProfile = async (req, res) => {
  try {
    const { dreamCountry, preferredIntake, highestEducation, currentCity, dreamCourse, targetExam, targetScore } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { 
        dreamCountry, 
        preferredIntake, 
        highestEducation, 
        currentCity, 
        dreamCourse, 
        targetExam, 
        targetScore 
      },
      { new: true }
    ).select('-passwordHash -otp');

    return res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error('Error updating student profile:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PUT /api/writing/checklist
 * Update student checklist items
 */
exports.updateChecklist = async (req, res) => {
  try {
    const { checklistState } = req.body;

    if (!Array.isArray(checklistState)) {
      return res.status(400).json({ message: 'checklistState must be an array' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { checklistState },
      { new: true }
    ).select('-passwordHash -otp');

    return res.json({ message: 'Checklist updated successfully', user: updatedUser });
  } catch (err) {
    console.error('Error updating checklist:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * DELETE /api/writing/session/:id
 * Delete a single writing test session
 */
exports.deleteWritingSession = async (req, res) => {
  try {
    const session = await WritingSession.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!session) {
      return res.status(404).json({ error: 'Session not found or unauthorized' });
    }
    return res.json({ success: true, message: 'Session deleted successfully' });
  } catch (err) {
    console.error('Error deleting writing session:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * DELETE /api/writing/history
 * Clear all writing test sessions for user
 */
exports.clearWritingHistory = async (req, res) => {
  try {
    await WritingSession.deleteMany({ user: req.user.id });
    return res.json({ success: true, message: 'All writing history cleared successfully' });
  } catch (err) {
    console.error('Error clearing writing history:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/writing/ielts
 * Save a new IELTS practice writing attempt
 */
exports.saveIeltsAttempt = async (req, res) => {
  try {
    const { prompt, essay, wordCount, timeSpent } = req.body;

    if (!prompt || !essay || wordCount === undefined || timeSpent === undefined) {
      return res.status(400).json({ message: 'Missing required essay metrics (prompt, essay, wordCount, timeSpent)' });
    }

    const attempt = new IeltsAttempt({
      user: req.user.id,
      prompt,
      essay,
      wordCount,
      timeSpent
    });

    await attempt.save();
    return res.status(201).json({ message: 'IELTS attempt saved successfully', attempt });
  } catch (err) {
    console.error('Error saving IELTS attempt:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/writing/ielts/history
 * Retrieve IELTS practice history for the logged-in student
 */
exports.getIeltsHistory = async (req, res) => {
  try {
    const history = await IeltsAttempt.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30);
    return res.json(history);
  } catch (err) {
    console.error('Error retrieving IELTS attempts history:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * DELETE /api/writing/ielts/:id
 * Delete a single IELTS attempt
 */
exports.deleteIeltsAttempt = async (req, res) => {
  try {
    const attempt = await IeltsAttempt.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found or unauthorized' });
    }
    return res.json({ success: true, message: 'IELTS attempt deleted successfully' });
  } catch (err) {
    console.error('Error deleting IELTS attempt:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * DELETE /api/writing/ielts/history
 * Clear all IELTS attempts for user
 */
exports.clearIeltsHistory = async (req, res) => {
  try {
    await IeltsAttempt.deleteMany({ user: req.user.id });
    return res.json({ success: true, message: 'All IELTS attempts cleared successfully' });
  } catch (err) {
    console.error('Error clearing IELTS history:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
