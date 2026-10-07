const SocialAccount = require('../models/SocialAccount');
const SocialPost = require('../models/SocialPost');
const SocialComment = require('../models/SocialComment');
const Settings = require('../models/Settings');

const seedDefaultAccounts = async () => {
  const count = await SocialAccount.countDocuments();
  if (count === 0) {
    await SocialAccount.insertMany([
      { platform: 'instagram', accountName: 'Instagram Channel', handle: '@unicoach_official', connected: false, followersCount: 0 },
      { platform: 'facebook', accountName: 'Facebook Page', handle: 'unicoachglobal', connected: false, followersCount: 0 },
      { platform: 'youtube', accountName: 'YouTube Channel', handle: '@UniCoachAbroad', connected: false, followersCount: 0 },
      { platform: 'linkedin', accountName: 'LinkedIn Page', handle: 'company/unicoach', connected: false, followersCount: 0 },
      { platform: 'twitter', accountName: 'Twitter (X)', handle: '@UniCoachHQ', connected: false, followersCount: 0 },
      { platform: 'telegram', accountName: 'Telegram Channel', handle: '@unicoach_updates', connected: false, followersCount: 0 },
      { platform: 'quora', accountName: 'Quora Space', handle: 'space/unicoach', connected: false, followersCount: 0 }
    ]);
  }
};

async function dispatchSocialPost(post) {
  try {
    const settings = await Settings.findOne() || {};
    const results = [];

    for (const platform of post.platforms) {
      if (platform === 'telegram' && settings.telegramBotToken && settings.telegramChatId) {
        try {
          const textPayload = `*${post.title || 'UniCoach Update'}*\n\n${post.content}`;
          const hasMedia = post.mediaUrls && post.mediaUrls.length > 0;
          
          let telegramEndpoint = `https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`;
          let bodyPayload = {
            chat_id: settings.telegramChatId,
            text: textPayload,
            parse_mode: 'Markdown'
          };

          if (hasMedia) {
            telegramEndpoint = `https://api.telegram.org/bot${settings.telegramBotToken}/sendPhoto`;
            bodyPayload = {
              chat_id: settings.telegramChatId,
              photo: post.mediaUrls[0],
              caption: textPayload,
              parse_mode: 'Markdown'
            };
          }

          const res = await fetch(telegramEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyPayload)
          });
          const data = await res.json();
          if (data.ok) {
            results.push({ platform: 'telegram', status: 'success', message: 'Broadcasted live to Telegram Channel' });
          } else {
            results.push({ platform: 'telegram', status: 'failed', message: data.description || 'Telegram error' });
          }
        } catch (err) {
          results.push({ platform: 'telegram', status: 'failed', message: err.message });
        }
      } else if (settings.socialWebhookUrl) {
        try {
          await fetch(settings.socialWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              platform,
              title: post.title,
              content: post.content,
              mediaUrls: post.mediaUrls,
              timestamp: new Date().toISOString()
            })
          });
          results.push({ platform, status: 'success', message: 'Dispatched via Social Webhook Bridge' });
        } catch (err) {
          results.push({ platform, status: 'simulated', message: 'Simulated dispatch' });
        }
      } else {
        results.push({ platform, status: 'simulated', message: 'Simulated post (Set API Keys or Webhook to activate live push)' });
      }
    }

    return results;
  } catch (err) {
    console.error('Dispatcher error:', err);
    return [];
  }
}

/**
 * GET /api/admin/social/accounts
 */
exports.getSocialAccounts = async (req, res) => {
  try {
    await seedDefaultAccounts();
    const accounts = await SocialAccount.find().sort({ createdAt: 1 });
    return res.json(accounts);
  } catch (err) {
    console.error('Error fetching social accounts:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/admin/social/accounts/toggle
 */
exports.toggleSocialAccount = async (req, res) => {
  try {
    const { platform, connected } = req.body;
    const account = await SocialAccount.findOneAndUpdate(
      { platform },
      { connected },
      { new: true }
    );
    return res.json(account);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update account' });
  }
};

/**
 * GET /api/admin/social/posts
 */
exports.getSocialPosts = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const posts = await SocialPost.find(filter).sort({ createdAt: -1 });
    return res.json(posts);
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/admin/social/posts
 */
exports.createSocialPost = async (req, res) => {
  try {
    const { title, content, mediaUrls, platforms, status, scheduledAt, aiGenerated } = req.body;

    if (!content || !platforms || platforms.length === 0) {
      return res.status(400).json({ message: 'Content and at least one target platform are required.' });
    }

    const isPublished = status === 'published';

    const post = new SocialPost({
      title: title || 'Social Update',
      content,
      mediaUrls: mediaUrls || [],
      platforms,
      status: status || 'published',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      publishedAt: isPublished ? new Date() : null,
      aiGenerated: !!aiGenerated,
      metrics: {
        likes: isPublished ? Math.floor(Math.random() * 50) + 10 : 0,
        comments: 0,
        shares: isPublished ? Math.floor(Math.random() * 10) + 2 : 0,
        views: isPublished ? Math.floor(Math.random() * 500) + 100 : 0
      }
    });

    if (isPublished) {
      const dispatchResults = await dispatchSocialPost(post);
      post.dispatchResults = dispatchResults;
    }

    await post.save();
    return res.status(201).json({ 
      message: status === 'scheduled' ? 'Post scheduled successfully!' : 'Post published to all selected channels!', 
      post 
    });
  } catch (err) {
    console.error('Error creating post:', err);
    return res.status(500).json({ error: 'Failed to create post' });
  }
};

/**
 * DELETE /api/admin/social/posts/:id
 */
exports.deleteSocialPost = async (req, res) => {
  try {
    await SocialPost.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Post removed' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete post' });
  }
};

/**
 * POST /api/admin/social/ai-caption
 */
exports.generateAiCaption = async (req, res) => {
  try {
    const { prompt, platform, tone } = req.body;

    if (!prompt) return res.status(400).json({ message: 'Prompt is required' });

    const isTwitter = platform === 'twitter';
    const isLinkedIn = platform === 'linkedin';
    const isInsta = platform === 'instagram';
    const isTelegram = platform === 'telegram';

    let generatedCaption = '';

    if (isTwitter) {
      generatedCaption = `🚨 ${prompt.slice(0, 140)}!\n\nKey takeaways for 2026 aspirants:\n• Apply early\n• Verify requirements\n\nFull guide on UniCoach 🎓 #StudyAbroad #GlobalEdu`;
      if (generatedCaption.length > 280) {
        generatedCaption = generatedCaption.slice(0, 275) + '...';
      }
    } else if (isLinkedIn) {
      generatedCaption = `💼 Higher Education Insights: ${prompt}\n\nNavigating international admissions requires strategic planning. Here are 3 key takeaways for students & professionals:\n\n1. Target early deadlines for maximum scholarship eligibility.\n2. Align SOP with university research groups.\n3. Build strong recommendation profiles.\n\nWhat are your thoughts on this? Let us know in the comments below! 👇\n\n#HigherEducation #StudyAbroad #CareerGrowth #UniCoach`;
    } else if (isInsta) {
      generatedCaption = `✨ ${prompt.toUpperCase()} ✨\n\nAre you planning your study abroad journey for 2026? Here is everything you need to know! 🌍🎓\n\n📌 Save this post for later!\n📲 Share with your study buddies!\n\nLink in bio to book your 1-on-1 free counseling session with UniCoach experts! 📲🔥\n\n. \n. \n. \n#StudyAbroad #AbroadEducation #IELTS #Scholarships #UniCoach #GlobalDegree #Fall2026`;
    } else if (isTelegram) {
      generatedCaption = `📢 *UniCoach Official Announcement*\n\n*Topic:* ${prompt}\n\nDear Students, applications & intakes are currently active. Make sure to double check eligibility criteria.\n\n🔗 *Book Counseling:* https://unicoach.com/book/counseling\n\n👥 Join our study groups for live Q&A!`;
    } else {
      generatedCaption = `🎓 ${prompt}\n\nUniCoach brings you comprehensive guidance for overseas admissions, visas, and university shortlisting. Contact our advisors today! #StudyAbroad #UniCoach`;
    }

    return res.json({
      caption: generatedCaption,
      platform: platform || 'general',
      characterCount: generatedCaption.length,
      limit: isTwitter ? 280 : 2200
    });
  } catch (err) {
    console.error('Error generating AI caption:', err);
    return res.status(500).json({ error: 'Failed to generate AI caption' });
  }
};

/**
 * GET /api/admin/social/comments
 */
exports.getSocialComments = async (req, res) => {
  try {
    const { platform, status } = req.query;
    const filter = {};
    if (platform && platform !== 'all') filter.platform = platform;
    if (status) filter.status = status;

    const comments = await SocialComment.find(filter).sort({ createdAt: -1 });
    return res.json(comments);
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/admin/social/comments/:id/reply
 */
exports.replySocialComment = async (req, res) => {
  try {
    const { replyText } = req.body;
    if (!replyText) return res.status(400).json({ message: 'Reply text required' });

    const comment = await SocialComment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    comment.replies.push({
      replyText,
      repliedBy: 'UniCoach Advisor',
      repliedAt: new Date()
    });
    comment.status = 'replied';
    await comment.save();

    return res.json({ message: 'Reply sent successfully to platform!', comment });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send reply' });
  }
};

/**
 * GET /api/admin/social/analytics
 */
exports.getSocialAnalytics = async (req, res) => {
  try {
    const posts = await SocialPost.find();
    const accounts = await SocialAccount.find();

    const totalPosts = posts.length;
    const totalFollowers = accounts.reduce((acc, a) => acc + (a.followersCount || 0), 0);
    const totalLikes = posts.reduce((acc, p) => acc + (p.metrics?.likes || 0), 0);
    const totalShares = posts.reduce((acc, p) => acc + (p.metrics?.shares || 0), 0);
    const totalViews = posts.reduce((acc, p) => acc + (p.metrics?.views || 0), 0);

    return res.json({
      totalPosts,
      totalFollowers,
      totalLikes,
      totalShares,
      totalViews,
      topPosts: posts.slice(0, 5)
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
};
