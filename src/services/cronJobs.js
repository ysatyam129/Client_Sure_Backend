import cron from 'node-cron';
import { User } from '../models/index.js';

// Daily token refresh at 01:00 IST
export const startTokenRefreshCron = () => {
  cron.schedule('0 1 * * *', async () => {
    try {
      console.log('Starting daily token refresh...');
      
      const now = new Date();
      
      // Find all users with subscriptions (active or expired)
      const allUsers = await User.find({
        'subscription.planId': { $exists: true }
      }).populate('subscription.planId');

      let refreshedCount = 0;
      let renewedCount = 0;

      for (const user of allUsers) {
        const isActive = user.subscription.endDate && user.subscription.endDate > now;
        
        if (isActive) {
          // Active subscription - reset daily tokens only
          const plan = user.subscription.planId;
          user.tokens = plan ? plan.dailyTokens : 100;
          user.tokensUsedToday = 0;
          user.subscription.lastRefreshedAt = now;
          
          await user.save();
          refreshedCount++;
          
        } else if (user.subscription.endDate && user.subscription.endDate <= now) {
          // Expired subscription - check for auto-renewal
          const plan = user.subscription.planId;
          
          if (plan) {
            // Auto-renew the plan (reset monthly tokens)
            const monthlyAllocation = plan.durationDays * plan.dailyTokens;
            
            user.tokens = plan.dailyTokens;
            user.tokensUsedToday = 0;
            user.monthlyTokensTotal = monthlyAllocation;
            user.monthlyTokensUsed = 0;
            user.monthlyTokensRemaining = monthlyAllocation;
            
            // Extend subscription
            user.subscription.startDate = now;
            user.subscription.endDate = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
            user.subscription.lastRefreshedAt = now;
            
            await user.save();
            renewedCount++;
            
            console.log(`🔄 Auto-renewed plan for ${user.email}: ${monthlyAllocation} monthly tokens`);
          }
        }
      }

      console.log(`Token refresh completed: ${refreshedCount} daily refreshed, ${renewedCount} plans renewed at ${now.toISOString()}`);
      
    } catch (error) {
      console.error('Token refresh cron error:', error);
    }
  }, {
    timezone: 'Asia/Kolkata'
  });

  console.log('Daily token refresh + auto plan renewal cron job started (01:00 IST)');
};

// Manual token refresh function (for testing)
export const manualTokenRefresh = async () => {
  try {
    console.log('Manual token refresh started...');
    
    const now = new Date();
    
    const activeUsers = await User.find({
      'subscription.endDate': { $gt: now },
      'subscription.planId': { $exists: true }
    }).populate('subscription.planId');

    let refreshedCount = 0;

    for (const user of activeUsers) {
      // Reset ONLY daily tokens, keep monthly tokens as is
      const plan = user.subscription.planId;
      user.tokens = plan ? plan.dailyTokens : 100;
      user.tokensUsedToday = 0;
      user.subscription.lastRefreshedAt = now;
      
      await user.save();
      refreshedCount++;
      
      console.log(`Refreshed daily tokens for ${user.email}: ${user.tokens} tokens (Monthly: ${user.monthlyTokensRemaining})`);
    }

    console.log(`Manual refresh completed: ${refreshedCount} users refreshed`);
    return { success: true, refreshedCount };
    
  } catch (error) {
    console.error('Manual token refresh error:', error);
    return { success: false, error: error.message };
  }
};

// Manual plan renewal function
export const manualPlanRenewal = async (userEmail) => {
  try {
    console.log(`Manual plan renewal for: ${userEmail}`);
    
    const user = await User.findOne({ email: userEmail }).populate('subscription.planId');
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    if (!user.subscription.planId) {
      return { success: false, error: 'No plan found' };
    }
    
    const plan = user.subscription.planId;
    const monthlyAllocation = plan.durationDays * plan.dailyTokens;
    const now = new Date();
    
    // Reset monthly tokens (plan renewal)
    user.tokens = plan.dailyTokens;
    user.tokensUsedToday = 0;
    user.monthlyTokensTotal = monthlyAllocation;
    user.monthlyTokensUsed = 0;
    user.monthlyTokensRemaining = monthlyAllocation;
    
    // Extend subscription
    user.subscription.startDate = now;
    user.subscription.endDate = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
    user.subscription.lastRefreshedAt = now;
    
    await user.save();
    
    console.log(`✅ Plan renewed for ${userEmail}: ${monthlyAllocation} monthly tokens`);
    return { 
      success: true, 
      monthlyTokens: monthlyAllocation,
      newEndDate: user.subscription.endDate 
    };
    
  } catch (error) {
    console.error('Manual plan renewal error:', error);
    return { success: false, error: error.message };
  }
};