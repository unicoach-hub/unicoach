const IeltsAttempt = require('../models/IeltsAttempt');
const Lead = require('../models/Lead');
const {
  gradeIeltsEssay,
  generateSOP,
  studyAbroadChat,
  explainScholarshipMatch,
  evaluateVisaAnswer,
  evaluateDetWriting,
  generateStudyRoadmap,
  explainUniversityMatch,
  generateBlogPost,
  scoreLeadAI,
  generateLeadSmartReply
} = require('../utils/aiService');

/**
 * POST /api/ai/grade-ielts
 */
exports.gradeIelts = async (req, res) => {
  try {
    const { prompt, essay, timeSpent, wordCount } = req.body;

    if (!essay || !essay.trim()) {
      return res.status(400).json({ error: 'Essay content is required for evaluation.' });
    }

    const calculatedWordCount = wordCount || essay.trim().split(/\s+/).filter(Boolean).length;
    const spentTime = timeSpent || 0;

    const evaluation = await gradeIeltsEssay({
      prompt: prompt || 'IELTS Academic Writing Task 2 Essay',
      essay,
      timeSpent: spentTime,
      wordCount: calculatedWordCount
    });

    let savedAttempt = null;
    if (req.user) {
      try {
        const attempt = new IeltsAttempt({
          user: req.user._id,
          prompt: prompt || 'IELTS Academic Task 2',
          essay,
          wordCount: calculatedWordCount,
          timeSpent: spentTime,
          aiEvaluation: evaluation
        });
        savedAttempt = await attempt.save();
      } catch (dbErr) {
        console.error('Failed to persist IELTS attempt to MongoDB:', dbErr);
      }
    }

    return res.json({
      success: true,
      evaluation,
      savedAttemptId: savedAttempt?._id || null,
      message: 'IELTS essay evaluated successfully by AI examiner.'
    });
  } catch (err) {
    console.error('Error in /api/ai/grade-ielts:', err);
    return res.status(500).json({
      error: 'Failed to evaluate essay with AI. Please check your network and try again.',
      details: err.message
    });
  }
};

/**
 * POST /api/ai/generate-sop
 */
exports.generateSop = async (req, res) => {
  try {
    const {
      fullName,
      targetCountry,
      targetUniversity,
      targetDegree,
      targetMajor,
      academicBackground,
      gpaOrScore,
      workExperience,
      keyProjects,
      careerGoals,
      specialInterests,
      tone
    } = req.body;

    const applicantName = fullName || req.user?.name || 'Applicant';

    const sopResult = await generateSOP({
      fullName: applicantName,
      targetCountry: targetCountry || 'USA',
      targetUniversity,
      targetDegree,
      targetMajor: targetMajor || 'Computer Science',
      academicBackground,
      gpaOrScore,
      workExperience,
      keyProjects,
      careerGoals,
      specialInterests,
      tone: tone || 'Academic & Professional'
    });

    return res.json({
      success: true,
      data: sopResult,
      message: 'Statement of Purpose generated successfully.'
    });
  } catch (err) {
    console.error('Error in /api/ai/generate-sop:', err);
    return res.status(500).json({
      error: 'Failed to generate SOP with AI.',
      details: err.message
    });
  }
};

/**
 * POST /api/ai/chat
 */
exports.chat = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message && (!conversationHistory || conversationHistory.length === 0)) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    let history = [...conversationHistory];
    if (message) {
      history.push({ role: 'user', content: message });
    }

    const studentProfile = req.user ? {
      dreamCountry: req.user.dreamCountry,
      dreamCourse: req.user.dreamCourse,
      targetExam: req.user.targetExam,
      targetScore: req.user.targetScore,
      highestEducation: req.user.highestEducation
    } : {};

    const chatResponse = await studyAbroadChat({
      conversationHistory: history,
      studentProfile
    });

    return res.json({
      success: true,
      reply: chatResponse.reply,
      modelUsed: chatResponse.modelUsed
    });
  } catch (err) {
    console.error('Error in /api/ai/chat:', err);
    return res.status(500).json({
      error: 'UniBot is momentarily unavailable. Please try again.',
      details: err.message
    });
  }
};

/**
 * POST /api/ai/explain-scholarship
 */
exports.explainScholarship = async (req, res) => {
  try {
    const { scholarship, studentProfile } = req.body;

    if (!scholarship) {
      return res.status(400).json({ error: 'Scholarship data is required.' });
    }

    const profile = studentProfile || (req.user ? {
      name: req.user.name,
      dreamCountry: req.user.dreamCountry,
      highestEducation: req.user.highestEducation,
      targetScore: req.user.targetScore
    } : {});

    const explanation = await explainScholarshipMatch({
      studentProfile: profile,
      scholarship
    });

    return res.json({
      success: true,
      explanation
    });
  } catch (err) {
    console.error('Error in /api/ai/explain-scholarship:', err);
    return res.status(500).json({
      error: 'Failed to explain scholarship match.',
      details: err.message
    });
  }
};

/**
 * POST /api/ai/evaluate-visa
 */
exports.evaluateVisa = async (req, res) => {
  try {
    const { country, visaType, question, studentAnswer, studentProfile } = req.body;

    if (!question || !studentAnswer) {
      return res.status(400).json({ error: 'Both question and student answer are required.' });
    }

    const profile = studentProfile || (req.user ? {
      targetUniversity: req.user.dreamUniversity || req.user.targetUniversity,
      targetMajor: req.user.dreamCourse,
      dreamCountry: req.user.dreamCountry
    } : {});

    const evaluation = await evaluateVisaAnswer({
      country: country || 'USA',
      visaType: visaType || 'F-1 Student Visa',
      question,
      studentAnswer,
      studentProfile: profile
    });

    return res.json({
      success: true,
      evaluation
    });
  } catch (err) {
    console.error('Error in /api/ai/evaluate-visa:', err);
    return res.status(500).json({
      error: 'Failed to evaluate visa interview answer.',
      details: err.message
    });
  }
};

const DET_MAX_ANSWER_CHARS = 1500;

/**
 * POST /api/ai/evaluate-det-writing (signed-in students)
 * Duolingo English Test practice: AI feedback on "Write About the Photo"
 */
exports.evaluateDetWriting = async (req, res) => {
  const photoDescription = typeof req.body?.photoDescription === 'string' ? req.body.photoDescription.trim().slice(0, 400) : '';
  const response = typeof req.body?.response === 'string' ? req.body.response.trim() : '';

  if (!photoDescription || !response) {
    return res.status(400).json({ error: 'Please write about the photo first.' });
  }
  if (response.length > DET_MAX_ANSWER_CHARS) {
    return res.status(400).json({ error: `Please keep your answer under ${DET_MAX_ANSWER_CHARS} characters.` });
  }

  try {
    const evaluation = await evaluateDetWriting({ photoDescription, response });
    return res.json({ success: true, evaluation });
  } catch (err) {
    // No invented score when the AI can't be reached: the student is asked to try again
    console.error('Error in /api/ai/evaluate-det-writing:', err.message);
    return res.status(503).json({ error: 'AI feedback is not available right now. Please try again in a minute.' });
  }
};

/**
 * POST /api/ai/generate-roadmap
 */
exports.generateRoadmap = async (req, res) => {
  try {
    const { targetIntake, targetCountry, targetDegree, targetMajor, currentStage, targetExam, currentGpa } = req.body;

    const roadmap = await generateStudyRoadmap({
      targetIntake: targetIntake || 'Fall 2026',
      targetCountry: targetCountry || req.user?.dreamCountry || 'USA',
      targetDegree: targetDegree || req.user?.highestEducation || "Master's",
      targetMajor: targetMajor || req.user?.dreamCourse || 'Computer Science',
      currentStage: currentStage || 'Exploring & Profile Building',
      targetExam: targetExam || req.user?.targetExam || 'IELTS',
      currentGpa: currentGpa || req.user?.targetScore || ''
    });

    return res.json({
      success: true,
      roadmap
    });
  } catch (err) {
    console.error('Error in /api/ai/generate-roadmap:', err);
    return res.status(500).json({
      error: 'Failed to generate study abroad roadmap.',
      details: err.message
    });
  }
};

/**
 * POST /api/ai/explain-university
 */
exports.explainUniversity = async (req, res) => {
  try {
    const { university, studentProfile } = req.body;

    if (!university) {
      return res.status(400).json({ error: 'University data is required.' });
    }

    const profile = studentProfile || (req.user ? {
      name: req.user.name,
      dreamCountry: req.user.dreamCountry,
      dreamCourse: req.user.dreamCourse,
      highestEducation: req.user.highestEducation,
      targetScore: req.user.targetScore
    } : {});

    const explanation = await explainUniversityMatch({
      university,
      studentProfile: profile
    });

    return res.json({
      success: true,
      explanation
    });
  } catch (err) {
    console.error('Error in /api/ai/explain-university:', err);
    return res.status(500).json({
      error: 'Failed to explain university match.',
      details: err.message
    });
  }
};

/**
 * POST /api/ai/generate-blog
 */
exports.generateBlog = async (req, res) => {
  try {
    const { topic, category, targetCountry, targetAudience, tone, includeFaq } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Article topic or keyword is required.' });
    }

    const blogData = await generateBlogPost({
      topic,
      category: category || 'Study Abroad Guide',
      targetCountry: targetCountry || 'Global',
      targetAudience: targetAudience || 'Indian Students & Aspirants',
      tone: tone || 'Authoritative & Actionable',
      includeFaq: includeFaq !== false
    });

    return res.json({
      success: true,
      blog: blogData
    });
  } catch (err) {
    console.error('Error in /api/ai/generate-blog:', err);
    return res.status(500).json({
      error: 'Failed to generate AI blog article.',
      details: err.message
    });
  }
};

/**
 * POST /api/ai/score-lead
 */
exports.scoreLead = async (req, res) => {
  try {
    const { lead, leadId } = req.body;
    let targetLead = lead;

    if (!targetLead && leadId) {
      targetLead = await Lead.findById(leadId);
    }

    if (!targetLead) {
      return res.status(400).json({ error: 'Lead details or leadId is required.' });
    }

    const scoring = await scoreLeadAI({ lead: targetLead });

    if (leadId || targetLead._id) {
      const idToUpdate = leadId || targetLead._id;
      await Lead.findByIdAndUpdate(idToUpdate, {
        aiScoring: {
          ...scoring,
          scoredAt: new Date()
        }
      });
    }

    return res.json({
      success: true,
      scoring
    });
  } catch (err) {
    console.error('Error in /api/ai/score-lead:', err);
    return res.status(500).json({
      error: 'Failed to score lead with AI.',
      details: err.message
    });
  }
};

/**
 * POST /api/ai/suggest-lead-reply
 */
exports.suggestLeadReply = async (req, res) => {
  try {
    const { lead, channel = 'whatsapp', goal = 'book_call', counselorName, customPrompt } = req.body;

    if (!lead) {
      return res.status(400).json({ error: 'Lead data is required.' });
    }

    const reply = await generateLeadSmartReply({
      lead,
      channel,
      goal,
      counselorName: counselorName || req.user?.name || 'UniCoach Senior Counselor',
      customPrompt
    });

    return res.json({
      success: true,
      reply
    });
  } catch (err) {
    console.error('Error in /api/ai/suggest-lead-reply:', err);
    return res.status(500).json({
      error: 'Failed to generate AI smart reply.',
      details: err.message
    });
  }
};

/**
 * POST /api/ai/batch-score-leads
 */
exports.batchScoreLeads = async (req, res) => {
  try {
    const { limit = 15 } = req.body;
    const unscoredLeads = await Lead.find({
      $or: [
        { 'aiScoring.score': { $exists: false } },
        { 'aiScoring.score': null }
      ]
    }).limit(limit);

    const scoredResults = [];

    for (const lead of unscoredLeads) {
      try {
        const scoring = await scoreLeadAI({ lead });
        lead.aiScoring = {
          ...scoring,
          scoredAt: new Date()
        };
        await lead.save();
        scoredResults.push({ id: lead._id, name: lead.name, ...scoring });
      } catch (e) {
        console.warn(`Failed to score lead ${lead._id}:`, e.message);
      }
    }

    return res.json({
      success: true,
      processedCount: scoredResults.length,
      results: scoredResults
    });
  } catch (err) {
    console.error('Error in /api/ai/batch-score-leads:', err);
    return res.status(500).json({
      error: 'Failed to batch score leads with AI.',
      details: err.message
    });
  }
};
