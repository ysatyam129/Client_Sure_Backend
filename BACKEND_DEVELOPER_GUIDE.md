# 🚀 Client Sure Backend - Developer Guide 

## 📋 Backend Overview 

Client Sure ka backend ek powerful Node.js aur Express.js based REST API hai jo complete lead management, user authentication, payment processing, aur resource management provide karta hai. Ye MongoDB database use karta hai aur production mein Vercel par deployed hai.

---

## 🏗️ Backend Architecture 

```
Backend/
├── src/                          # Main source code
│   ├── index.js                  # Server entry point
│   ├── config/                   # Configuration files
│   │   └── db.js                 # Database connection
│   ├── models/                   # MongoDB schemas
│   ├── controllers/              # Business logic
│   ├── routes/                   # API endpoints
│   ├── middleware/               # Authentication & validation
│   ├── services/                 # Background services
│   └── utils/                    # Helper functions
├── api/                          # Vercel serverless functions
├── scripts/                      # Database migration scripts
├── package.json                  # Dependencies
├── vercel.json                   # Deployment configuration
└── .env                          # Environment variables
```

---

## 🎯 Core Technologies 

### Backend Stack:
- **Node.js** - JavaScript runtime environment
- **Express.js v5.1.0** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose v8.19.2** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt v6.0.0** - Password hashing
- **Multer v2.0.2** - File upload handling
- **Cloudinary v2.8.0** - File storage service
- **Nodemailer v6.10.1** - Email service
- **Node-cron v3.0.3** - Scheduled tasks
- **XLSX v0.18.5** - Excel file processing

---

## 📁 Detailed File Structure 

### 🔹 Entry Point (`src/index.js`)

**Main Server Configuration:**
```javascript
// Key Features:
- Express server setup
- CORS configuration for frontend communication
- Database connection
- Route mounting
- Middleware setup
- Cron job initialization
- Error handling
```

**Important Points:**
- Server runs on PORT 5000 (development) or environment PORT
- CORS configured for multiple origins (localhost + Vercel)
- Automatic database connection on startup
- Cron jobs start automatically for token refresh aur subscription monitoring

### 🔹 Database Configuration (`src/config/db.js`)

```javascript
// Features:
- MongoDB connection using Mongoose
- Connection error handling
- Environment variable support
- Connection logging
```

**Connection Details:**
- Uses MONGO_URI from environment variables
- Automatic reconnection on failure
- Connection status logging

---

## 📊 Database Models 

### 1. **User Model (`src/models/User.js`)**

**Complete User Schema:**
```javascript
// Main Fields:
- name, email, phone, avatar (Basic info)
- passwordHash (Encrypted password)
- tokens, tokensUsedTotal, tokensUsedToday (Token system)
- monthlyTokensTotal, monthlyTokensUsed, monthlyTokensRemaining
- subscription (Plan details, dates, status)
- accessedResources, accessedLeads (Usage tracking)
- points, communityActivity (Community features)
- notifications, unreadNotificationCount
- referralCode, referrals, referralStats (Referral system)
- milestoneRewards, temporaryTokens (Reward system)
```

**Key Features:**
- Complete user profile management
- Token-based resource access system
- Subscription management with dates
- Community engagement tracking
- Referral system with rewards
- Notification system

### 2. **Other Important Models:**

#### **Plan Model** - Subscription plans
#### **Order Model** - Payment orders
#### **Lead Model** - Lead management
#### **Resource Model** - File resources
#### **EmailFeedback Model** - Email tracking
#### **TokenPackage Model** - Token purchase packages

---

## 🛣️ API Routes Structure 

### 1. **Authentication Routes (`/api/auth`)**

```javascript
// User Authentication:
POST /api/auth/register        // User registration
POST /api/auth/login          // User login
POST /api/auth/logout         // User logout
POST /api/auth/request-reset  // Password reset request
POST /api/auth/reset/:token   // Password reset

// Resource Access:
POST /api/auth/access/:id     // Access resource
GET /api/auth/accessed-resources // Get accessed resources
GET /api/auth/profile         // Get user profile
PUT /api/auth/profile         // Update profile

// Lead Management:
GET /api/auth/leads           // Get available leads
POST /api/auth/leads/:id/access // Access lead
POST /api/auth/leads/bulk-access // Bulk lead access
POST /api/auth/leads/send-email // Send bulk emails
```

### 2. **Admin Routes (`/api/admin`)**

```javascript
// Admin Authentication:
POST /api/admin/login         // Admin login
GET /api/admin/profile        // Admin profile

// User Management:
GET /api/admin/users          // Get all users
PUT /api/admin/users/:id/tokens // Update user tokens

// Resource Management:
POST /api/admin/resources     // Upload resources
GET /api/admin/resources      // Get all resources
PUT /api/admin/resources/:id  // Update resource
DELETE /api/admin/resources/:id // Delete resource

// Lead Management:
POST /api/admin/leads/upload  // Bulk lead upload
GET /api/admin/leads          // Get all leads

// Analytics:
GET /api/admin/analytics      // System analytics
```

### 3. **Payment Routes (`/api/payments`)**

```javascript
POST /api/payments/create-order // Create payment order
POST /api/payments/webhook     // Payment webhook handler
```

---

## 🔧 Key Backend Files Analysis 

### 1. **Server Entry Point (`index.js`)**

**Main Responsibilities:**
```javascript
// Server Setup:
- Express app initialization
- Middleware configuration (CORS, JSON parsing, cookies)
- Database connection
- Route mounting
- Cron job startup
- Error handling
```

**CORS Configuration:**
- Multiple allowed origins for development aur production
- Credentials support for authentication
- Comprehensive headers support
- Production-friendly fallbacks

### 2. **Payment Controller (`paymentController.js`)**

**Core Functions:**
```javascript
// createOrder():
- Plan validation
- User registration/update
- Order creation
- Email sending
- Referral processing
```

**Payment Flow:**
1. Validate plan aur user data
2. Create/update user account
3. Generate order with unique ID
4. Send welcome email with password setup
5. Return payment URL for frontend

### 3. **Cron Jobs Service (`cronJobs.js`)**

**Automated Tasks:**
```javascript
// Daily Token Refresh (1:00 AM IST):
- Reset daily tokens for active users
- Clean expired prize tokens
- Auto-renew expired subscriptions

// Subscription Monitoring (2:00 AM IST):
- Send expiry warnings (7, 3, 1 days before)
- Deactivate expired subscriptions
- Send renewal reminders (3, 7, 14 days after)
```

**Business Logic:**
- Automatic token refresh for active subscriptions
- Email notifications for subscription status
- Graceful handling of expired accounts

---

## 🔐 Authentication & Security 

### 1. **JWT Authentication:**

```javascript
// Token Generation:
- User login generates JWT token
- Token contains userId, email, planId
- 7-day expiry for user tokens
- 24-hour expiry for admin tokens

// Token Validation:
- Middleware checks token on protected routes
- Automatic user lookup and validation
- Subscription status verification
```

### 2. **Password Security:**

```javascript
// Password Hashing:
- Bcrypt with 12 salt rounds
- Secure password storage
- Password reset via email tokens
- Temporary email-based passwords
```

### 3. **Role-Based Access:**

```javascript
// User Roles:
- Regular users: Limited access to own data
- Admin users: Full system access
- Separate authentication middleware
```

---

## 📧 Email System 

### 1. **Email Services:**

```javascript
// Nodemailer Configuration:
- Gmail SMTP integration
- HTML email templates
- Retry mechanism for failed sends
- Professional email styling

// Email Types:
- Welcome emails with password setup
- Password reset emails
- Subscription expiry warnings
- Bulk lead emails
- System notifications
```

### 2. **Email Templates:**

```javascript
// Features:
- Responsive HTML design
- ClientSure branding
- Dynamic content insertion
- Professional styling
- Mobile-friendly layout
```

---

## 📁 File Management 

### 1. **File Upload System:**

```javascript
// Multer Configuration:
- Memory storage for processing
- File type validation
- Size limits (10MB for general, 50MB for Excel)
- Multiple file type support

// Cloudinary Integration:
- Automatic file upload to cloud
- Image optimization
- PDF thumbnail generation
- Secure file URLs
```

### 2. **Supported File Types:**

```javascript
// Resource Files:
- PDF documents
- Video files (MP4, AVI)
- Images (JPEG, PNG, GIF)

// Data Files:
- Excel files (.xlsx, .xls)
- CSV files
```

---

## 🔄 Background Services 

### 1. **Cron Jobs:**

```javascript
// Token Refresh (Daily 1:00 AM):
- Reset daily tokens for active users
- Clean expired temporary tokens
- Update subscription status

// Subscription Monitoring (Daily 2:00 AM):
- Check subscription expiry dates
- Send warning emails
- Deactivate expired accounts
- Send renewal reminders
```

### 2. **Email Services:**

```javascript
// Automated Emails:
- Subscription expiry warnings
- Account deactivation notices
- Renewal reminders
- Welcome emails
```

---

## 🎯 Business Logic 

### 1. **Token System:**

```javascript
// Token Types:
- Daily Tokens: Reset every day at 1:00 AM
- Monthly Tokens: Based on subscription plan
- Temporary Tokens: Prize/reward tokens (24-hour expiry)

// Token Usage:
- Resource access: Deducts tokens
- Lead access: Requires tokens
- Priority system: Daily → Temporary → Monthly
```

### 2. **Subscription Management:**

```javascript
// Subscription Flow:
- Plan selection → Payment → Account activation
- Daily token refresh for active users
- Automatic expiry handling
- Email notifications for status changes
```

### 3. **Referral System:**

```javascript
// Referral Features:
- Unique referral codes for each user
- Milestone-based rewards (8, 15, 25 referrals)
- Cycle-based system (repeatable rewards)
- Automatic reward distribution
```

---

## 📊 Database Operations 

### 1. **User Management:**

```javascript
// User Operations:
- Registration with email verification
- Profile updates with file uploads
- Token balance management
- Subscription tracking
- Activity logging
```

### 2. **Lead Management:**

```javascript
// Lead Operations:
- Bulk Excel upload processing
- Lead assignment to users
- Access tracking
- Email campaign management
- Export functionality
```

### 3. **Resource Management:**

```javascript
// Resource Operations:
- File upload to Cloudinary
- Access control based on subscription
- Download tracking
- Resource categorization
```

---

## 🔧 Middleware Functions 

### 1. **Authentication Middleware (`auth.js`):**

```javascript
// Features:
- JWT token validation
- User lookup and verification
- Subscription status check
- Request user attachment
```

### 2. **Admin Authentication (`adminAuth.js`):**

```javascript
// Features:
- Admin-specific token validation
- Role-based access control
- Admin user verification
```

### 3. **File Upload Middleware:**

```javascript
// Upload Types:
- General file upload (images, PDFs, videos)
- Excel file upload (leads)
- Community image upload
- File type validation
- Size limit enforcement
```

---

## 🛠️ Utility Functions 

### 1. **Email Utils (`emailUtils.js`):**

```javascript
// Functions:
- createTransporter(): SMTP setup
- sendEmailWithRetry(): Reliable email sending
- sendWelcomeEmail(): User onboarding
- sendPasswordResetConfirmationEmail()
```

### 2. **Token Utils (`tokenUtils.js`):**

```javascript
// Functions:
- calculateEffectiveTokens(): Total available tokens
- deductTokensWithPriority(): Smart token deduction
- cleanExpiredTokens(): Remove expired tokens
```

### 3. **Referral Utils (`referralUtils.js`):**

```javascript
// Functions:
- generateReferralCode(): Unique code generation
- validateReferralCode(): Code verification
- checkReferralMilestones(): Reward processing
- getMilestoneProgress(): Progress tracking
```

---

## 🚀 API Response Patterns 

### 1. **Success Responses:**

```javascript
// Standard Success:
{
  success: true,
  message: "Operation completed successfully",
  data: { ... },
  pagination: { ... } // For paginated results
}

// Authentication Success:
{
  user: { id, name, email, ... },
  token: "jwt_token_here",
  subscription: { ... }
}
```

### 2. **Error Responses:**

```javascript
// Validation Errors:
{
  error: "Validation failed",
  details: "Specific error message"
}

// Authentication Errors:
{
  error: "Access denied",
  needsRenewal: true // For expired subscriptions
}
```

---

## 🔍 Error Handling /

### 1. **Global Error Handling:**

```javascript
// Error Types:
- Validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Server errors (500)

// Error Logging:
- Console logging for development
- Structured error messages
- User-friendly error responses
```

### 2. **Database Error Handling:**

```javascript
// MongoDB Errors:
- Connection failures
- Validation errors
- Duplicate key errors
- Cast errors (invalid ObjectIds)
```

---

## 📈 Performance Optimization 

### 1. **Database Optimization:**

```javascript
// Strategies:
- Indexed queries on frequently accessed fields
- Lean queries for better performance
- Pagination for large datasets
- Aggregation pipelines for complex queries
```

### 2. **File Handling:**

```javascript
// Optimization:
- Memory storage for processing
- Cloudinary for file storage
- Image optimization
- File size limits
```

---

## 🧪 Testing & Debugging 

### 1. **Development Tools:**

```javascript
// Available Scripts:
npm run dev          // Development server with nodemon
npm run test:email   // Test email functionality
npm run test:login   // Test authentication
npm run test:webhook // Test payment webhooks
```

### 2. **Debugging Features:**

```javascript
// Logging:
- Comprehensive console logging
- Request/response logging
- Error stack traces
- Database operation logging
```

---

## 🌐 Deployment Configuration 

### 1. **Vercel Configuration (`vercel.json`):**

```javascript
// Features:
- Serverless function setup
- Cron job configuration
- Environment variable support
- Route configuration
```

### 2. **Environment Variables:**

```javascript
// Required Variables:
MONGO_URI              // MongoDB connection string
JWT_SECRET             // JWT signing secret
SMTP_USER              // Email service user
SMTP_PASS              // Email service password
CLOUDINARY_CLOUD_NAME  // File storage
CLOUDINARY_API_KEY     // File storage API key
CLOUDINARY_API_SECRET  // File storage secret
BASE_URL               // Frontend URL
```

---

## 🔧 Development Workflow 

### 1. **Local Development Setup:**

```bash
# Backend Setup:
cd Client_Sure_Backend/Backend
npm install
# Configure .env file with all required variables
npm run dev  # Starts server on port 5000
```

### 2. **Development Guidelines:**

```javascript
// Code Structure:
- Controllers: Business logic
- Routes: API endpoint definitions
- Models: Database schemas
- Middleware: Authentication & validation
- Services: Background tasks
- Utils: Helper functions

// Best Practices:
- Use async/await for database operations
- Implement proper error handling
- Add comprehensive logging
- Validate all inputs
- Use middleware for common functionality
```

---

## 🚨 Common Issues & Solutions 

### 1. **Database Connection Issues:**

```javascript
// Problem: MongoDB connection fails
// Solution: Check MONGO_URI in .env file
// Verify MongoDB Atlas IP whitelist
// Check network connectivity
```

### 2. **Authentication Problems:**

```javascript
// Problem: JWT token validation fails
// Solution: Check JWT_SECRET in environment
// Verify token format in frontend
// Check token expiry
```

### 3. **Email Service Issues:**

```javascript
// Problem: Emails not sending
// Solution: Verify SMTP credentials
// Check Gmail app password setup
// Test email service configuration
```

### 4. **File Upload Problems:**

```javascript
// Problem: File uploads failing
// Solution: Check Cloudinary configuration
// Verify file size limits
// Check file type validation
```

---

## 📚 API Documentation 

### 1. **Authentication Endpoints:**

```javascript
// User Registration:
POST /api/auth/register
Body: { name, email, phone, planId, referralCode }
Response: { success, user, token }

// User Login:
POST /api/auth/login
Body: { email, password }
Response: { user, userToken }

// Password Reset:
POST /api/auth/request-reset
Body: { email }
Response: { message }
```

### 2. **Resource Management:**

```javascript
// Access Resource:
POST /api/auth/access/:id
Headers: { Authorization: "Bearer token" }
Response: { resource, tokensRemaining }

// Get Accessed Resources:
GET /api/auth/accessed-resources
Headers: { Authorization: "Bearer token" }
Response: { resources[] }
```

### 3. **Lead Management:**

```javascript
// Get Available Leads:
GET /api/auth/leads?page=1&limit=20
Headers: { Authorization: "Bearer token" }
Response: { leads[], pagination }

// Access Lead:
POST /api/auth/leads/:id/access
Headers: { Authorization: "Bearer token" }
Response: { lead, tokensRemaining }
```

---

## 🎯 Next Steps for New Developers 

### 1. **Understanding the Codebase:**

```javascript
// Start with:
1. Read this guide thoroughly
2. Explore src/index.js (server entry point)
3. Understand models/User.js (main data structure)
4. Study routes/auth.js (authentication flow)
5. Examine controllers/paymentController.js (business logic)
```

### 2. **Development Environment:**

```javascript
// Setup Steps:
1. Install Node.js (v18+)
2. Setup MongoDB (local or Atlas)
3. Configure environment variables
4. Install dependencies: npm install
5. Start development server: npm run dev
```

### 3. **Contributing Guidelines:**

```javascript
// Best Practices:
- Follow existing code patterns
- Add proper error handling
- Include comprehensive logging
- Test all changes thoroughly
- Document new features
- Use meaningful commit messages
```

---

## 📞 Support & Resources

### 1. **Documentation:**
- Read all MD files in project root
- Check inline code comments
- Review API endpoint documentation

### 2. **Learning Resources:**
- **Node.js**: [Official Documentation](https://nodejs.org/docs/)
- **Express.js**: [Express Guide](https://expressjs.com/guide/)
- **MongoDB**: [MongoDB Manual](https://docs.mongodb.com/)
- **Mongoose**: [Mongoose Docs](https://mongoosejs.com/docs/)

### 3. **Getting Help:**
- Check console logs for errors
- Use debugging tools and breakpoints
- Review error messages carefully
- Test API endpoints with Postman
- Contact team lead for complex issues

---

**Happy Backend Development! 🎉**

*Last Updated: December 2024*
*Version: 1.0.0*

add all your dependencies on .env file in backend and try to use all new crendential of your own regarding mongodb string and smtp email and token password section and etc 