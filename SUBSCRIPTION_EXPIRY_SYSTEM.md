# Subscription Expiry Email System

## Overview
Professional automated subscription management system with email notifications for ClientSure platform.

## Features

### 🔄 **Automated Cron Jobs**
- **Token Refresh**: Daily at 1:00 AM IST
- **Subscription Monitor**: Daily at 2:00 AM IST

### 📧 **Email Notifications**

#### **Pre-Expiry Warnings**
- **7 days before**: Yellow warning with renewal link
- **3 days before**: Orange urgent warning
- **1 day before**: Red critical warning

#### **Expiry Day**
- **Account deactivation**: Sets tokens to 0, isActive to false
- **Expiry notification**: Professional email with reactivation link

#### **Post-Expiry Reminders**
- **3 days after**: Welcome back offer (10% extra tokens)
- **7 days after**: Special offer (5% extra tokens)
- **14 days after**: Final reminder with welcome bonus

## Technical Implementation

### **Files Created/Modified**
1. `src/services/subscriptionEmailService.js` - Email templates and sending logic
2. `src/services/cronJobs.js` - Extended with expiry monitoring
3. `src/models/User.js` - Added `isActive` field to subscription
4. `src/route/admin.js` - Added manual testing endpoint
5. `src/index.js` - Started new cron job

### **Email Templates**
- Professional HTML design with ClientSure branding
- Responsive layout for mobile devices
- Dynamic content based on subscription status
- Clear call-to-action buttons
- Gradient backgrounds matching urgency levels

### **Cron Job Logic**
```javascript
// Daily at 2:00 AM IST
cron.schedule('0 2 * * *', async () => {
  // Check all users with subscriptions
  // Calculate days until/since expiry
  // Send appropriate emails
  // Update subscription status
});
```

## API Endpoints

### **Admin Testing**
```
POST /api/admin/check-subscriptions
Body: { "email": "user@example.com" } // Optional
```

### **Manual Functions**
- `manualSubscriptionCheck(email)` - Test specific user or all users
- `sendExpiryWarningEmail(user, daysLeft)` - Send warning email
- `sendSubscriptionExpiredEmail(user)` - Send expiry notification
- `sendRenewalReminderEmail(user, daysExpired)` - Send reminder

## Business Logic

### **Subscription States**
1. **Active**: `endDate > now && isActive = true`
2. **Expiring**: `endDate - now <= 7 days`
3. **Expired**: `endDate <= now && isActive = false`
4. **Grace Period**: `0-14 days after expiry`

### **Token Management**
- **Active**: Daily tokens refresh, monthly tokens available
- **Expired**: All tokens set to 0, no refresh
- **Reactivated**: Full token allocation restored

## Email Content Strategy

### **Warning Emails**
- Urgency-based color coding
- Clear expiry date display
- Current token status
- Easy renewal process
- Professional tone

### **Expired Emails**
- Account status explanation
- Data safety assurance
- Reactivation benefits
- Special offers for quick return

### **Reminder Emails**
- Emotional reconnection ("We miss you")
- Time-sensitive offers
- Feature highlights
- Respectful opt-out option

## Security & Performance

### **Email Delivery**
- Retry mechanism with exponential backoff
- SMTP transporter verification
- Error logging and monitoring
- Rate limiting protection

### **Database Efficiency**
- Indexed queries on subscription.endDate
- Batch processing for large user bases
- Minimal database updates
- Optimized date calculations

## Testing

### **Manual Testing**
```bash
# Test specific user
curl -X POST http://localhost:5000/api/admin/check-subscriptions \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Test all users
curl -X POST http://localhost:5000/api/admin/check-subscriptions
```

### **Cron Job Testing**
- Use manual functions for immediate testing
- Check email delivery in development
- Verify database updates
- Monitor console logs

## Monitoring & Logs

### **Console Output**
```
⚠️ Expiry warning sent to user@example.com (3 days left)
🔴 Subscription expired and deactivated for user@example.com
💙 Renewal reminder sent to user@example.com (7 days expired)
```

### **Success Metrics**
- Warnings sent count
- Expired notifications count
- Reminders sent count
- Deactivated accounts count

## Future Enhancements

### **Potential Additions**
- SMS notifications for critical warnings
- In-app notification system
- Subscription analytics dashboard
- A/B testing for email templates
- Personalized renewal offers
- Auto-renewal option
- Grace period customization

## Configuration

### **Environment Variables**
```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
BASE_URL=http://localhost:3000
```

### **Timezone Settings**
All cron jobs run in `Asia/Kolkata` timezone for consistent IST timing.

---

**Status**: ✅ Fully Implemented and Production Ready
**Last Updated**: December 2024
**Version**: 1.0.0