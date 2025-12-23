# 📋 Client Sure - Complete Project Description

## 🎯 **Project Overview / परियोजना अवलोकन**

**Client Sure** एक comprehensive lead management और resource sharing platform है जो businesses को अपने clients के साथ effectively communicate करने और resources share करने में help करता है।

---

## 🏗️ **System Architecture / सिस्टम आर्किटेक्चर**

### **Frontend (Next.js + TypeScript)**
- **Framework**: Next.js 16.0.1 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Port**: 3000

### **Backend (Node.js + Express)**
- **Framework**: Express.js v5.1.0
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcrypt
- **Port**: 5000

---

## 👥 **User Roles / यूजर रोल्स**

### 1. **Admin Users**
- Complete system control
- User management
- Lead management
- Resource management (PDF, Videos)
- Analytics dashboard
- Payment tracking

### 2. **Regular Users**
- Personal dashboard
- Access to purchased resources
- Lead management for their data
- Profile management
- Subscription management

---

## 🔄 **Core Features / मुख्य फीचर्स**

### **1. Authentication System**
```
✅ User Registration/Login
✅ Admin Login (Separate)
✅ Password Reset
✅ JWT Token Management
✅ Role-based Access Control
```

### **2. Payment Integration**
```
✅ Pricing Plans (Multiple tiers)
✅ Purchase Modal with Form
✅ Dummy Payment Gateway
✅ Payment Success/Failure Handling
✅ Webhook Integration
✅ Order Management
```

### **3. Dashboard System**

#### **Admin Dashboard:**
- **Users Management**: View, edit, delete users
- **Leads Management**: Bulk lead upload via Excel
- **Resources Management**: Upload PDFs, videos
- **Analytics**: User statistics, payment tracking
- **System Settings**: Plan management

#### **User Dashboard:**
- **Personal Stats**: Subscription status, token balance
- **Resources Access**: Download PDFs, watch videos
- **Lead Management**: View assigned leads
- **Profile Settings**: Update personal information

### **4. Resource Management**
```
✅ PDF Document Upload/Download
✅ Video Course Management
✅ File Storage (Cloudinary Integration)
✅ Access Control based on Subscription
```

### **5. Lead Management**
```
✅ Excel File Upload for Bulk Leads
✅ Lead Assignment to Users
✅ Lead Tracking and Status Updates
✅ Lead Analytics and Reporting
```

---

## 💳 **Payment Flow / पेमेंट फ्लो**

```
Homepage → Select Plan → Fill Form → Payment Gateway → Success Page → Login → Dashboard
```

### **Detailed Steps:**
1. **Plan Selection**: User chooses subscription plan
2. **Form Submission**: Name, email, phone details
3. **Payment Processing**: Dummy gateway simulation
4. **Account Creation**: Automatic user account setup
5. **Success Notification**: Payment confirmation page
6. **Dashboard Access**: Full platform access

---

## 📊 **Database Schema / डेटाबेस स्कीमा**

### **Collections:**

#### **Users**
```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  role: String (admin/user),
  subscription: {
    plan: String,
    status: String,
    expiryDate: Date,
    tokens: Number
  },
  createdAt: Date
}
```

#### **Orders**
```javascript
{
  userId: ObjectId,
  planId: ObjectId,
  amount: Number,
  status: String,
  paymentId: String,
  createdAt: Date
}
```

#### **Leads**
```javascript
{
  name: String,
  email: String,
  phone: String,
  assignedTo: ObjectId,
  status: String,
  source: String,
  createdAt: Date
}
```

#### **Resources**
```javascript
{
  title: String,
  type: String (pdf/video),
  url: String,
  description: String,
  accessLevel: String,
  uploadedBy: ObjectId,
  createdAt: Date
}
```

#### **Plans**
```javascript
{
  name: String,
  price: Number,
  duration: Number,
  tokens: Number,
  features: [String],
  isActive: Boolean
}
```

---

## 🛠️ **Technical Implementation / तकनीकी कार्यान्वयन**

### **Backend APIs:**

#### **Authentication Routes** (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /admin-login` - Admin login
- `POST /reset-password` - Password reset

#### **Payment Routes** (`/api/payments`)
- `POST /create-order` - Create payment order
- `POST /webhook` - Payment webhook handler
- `GET /orders` - Get user orders

#### **User Routes** (`/api/user`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update profile
- `GET /resources` - Get accessible resources
- `GET /leads` - Get assigned leads

#### **Admin Routes** (`/api/admin`)
- `GET /users` - Get all users
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `POST /leads/upload` - Bulk lead upload
- `POST /resources/upload` - Upload resources

### **Frontend Pages:**

#### **Public Pages:**
- `/` - Homepage with pricing
- `/auth/login` - Login page
- `/auth/admin` - Admin login
- `/payment-success` - Payment success page

#### **User Pages:**
- `/user/dashboard` - User dashboard
- `/user/resources` - Resources library
- `/user/leads` - Lead management
- `/user/profile` - Profile settings

#### **Admin Pages:**
- `/admin/dashboard` - Admin dashboard
- `/admin/users` - User management
- `/admin/leads` - Lead management
- `/admin/resources` - Resource management

---

## 🔧 **Development Setup / डेवलपमेंट सेटअप**

### **Prerequisites:**
- Node.js (v18+)
- MongoDB
- Git

### **Installation Steps:**

#### **Backend Setup:**
```bash
cd Client_Sure_Backend/Backend
npm install
cp .env.example .env  # Configure environment variables
npm run dev  # Starts on port 5000
```

#### **Frontend Setup:**
```bash
cd Client_SureF/client-sure
npm install
npm run dev  # Starts on port 3000
```

### **Environment Variables:**
```env
# Backend (.env)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/clientsure
JWT_SECRET=your_jwt_secret
BASE_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

---

## 🚀 **Deployment / डिप्लॉयमेंट**

### **Production Checklist:**
- [ ] Environment variables configured
- [ ] Database connection secured
- [ ] File upload limits set
- [ ] CORS properly configured
- [ ] SSL certificates installed
- [ ] Payment gateway integrated (real)
- [ ] Email service configured
- [ ] Monitoring setup

---

## 📈 **Future Enhancements / भविष्य की संभावनाएं**

### **Phase 2 Features:**
- Real payment gateway integration (Razorpay/Stripe)
- Advanced analytics dashboard
- Email marketing automation
- Mobile app development
- API rate limiting
- Advanced user permissions
- Notification system
- Chat/Support system

### **Technical Improvements:**
- Redis caching
- Database optimization
- CDN integration
- Load balancing
- Automated testing
- CI/CD pipeline
- Docker containerization

---

## 🐛 **Known Issues / ज्ञात समस्याएं**

1. **Dummy Payment**: Currently using dummy payment gateway
2. **Email Service**: Needs production email service setup
3. **File Size Limits**: Need to implement proper file size restrictions
4. **Error Handling**: Some edge cases need better error handling

---

## 📞 **Support / सहायता**

### **Development Team:**
- **Backend Developer**: Node.js, MongoDB, Express
- **Frontend Developer**: Next.js, TypeScript, Tailwind
- **DevOps**: Deployment and server management

### **Contact:**
- **Email**: support@clientsure.com
- **Documentation**: Available in project repository
- **Issue Tracking**: GitHub Issues

---

## 📄 **License / लाइसेंस**

This project is proprietary software developed for Client Sure platform.

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Status**: Development Complete, Ready for Production