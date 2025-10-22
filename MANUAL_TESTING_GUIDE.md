# 🔐 Manual Testing Guide - Authentication System

## 🚀 **Quick Start**

### **Step 1: Access the Application**
1. Open your web browser
2. Go to: **http://localhost:3000**
3. You should see the login page

### **Step 2: Admin Login Credentials**
```
Email: john@example.com
Password: password123
Role: ADMIN
```

---

## 🧪 **Complete Testing Scenarios**

### **🔑 Test 1: Admin Login**
1. **Go to**: http://localhost:3000/auth/signin
2. **Enter**:
   - Email: `john@example.com`
   - Password: `password123`
3. **Click**: "Sign In"
4. **Expected**: You should be logged in as an admin and redirected to the dashboard

### **🔑 Test 2: Password Reset Flow**
1. **Go to**: http://localhost:3000/auth/signin
2. **Click**: "Forgot your password?" link
3. **Enter email**: `john@example.com`
4. **Click**: "Send Reset Instructions"
5. **Expected**: You should see "Check Your Email" message
6. **Check console**: Look for the email content in your terminal (development mode)

### **🔑 Test 3: OTP Verification**
1. **From Test 2**: After requesting password reset
2. **Click**: "Use OTP Code from Email"
3. **Enter**:
   - Email: `john@example.com`
   - OTP: Check your terminal for the 6-digit code
4. **Click**: "Verify OTP"
5. **Expected**: You should be able to set a new password

### **🔑 Test 4: Admin User Management**
1. **Login as admin** (from Test 1)
2. **Navigate to**: User Management section
3. **Expected**: You should see a list of users
4. **Try**: Changing a user's role
5. **Try**: Searching for users
6. **Expected**: You should have full control over users

### **🔑 Test 5: Role-Based Access Control**
1. **Login as admin** (from Test 1)
2. **Try accessing**: Project creation
3. **Expected**: You should be able to create projects
4. **Try accessing**: User management
5. **Expected**: You should see admin-only features

### **🔑 Test 6: Security Features**
1. **Go to**: http://localhost:3000/api/auth/role
2. **Expected**: Should return 401 Unauthorized (without login)
3. **Go to**: http://localhost:3000/unauthorized
4. **Expected**: Should show "Access Denied" page

---

## 🎯 **Testing Checklist**

### **✅ Authentication Features**
- [ ] Admin login works
- [ ] Password reset request works
- [ ] OTP verification works
- [ ] Password reset form works
- [ ] New password setting works

### **✅ Admin Features**
- [ ] User management interface loads
- [ ] Can view all users
- [ ] Can change user roles
- [ ] Can delete users (except self)
- [ ] Search and filter users works

### **✅ Security Features**
- [ ] Unauthorized access blocked
- [ ] Role-based UI rendering
- [ ] Admin-only features protected
- [ ] Session management works

### **✅ UI/UX Features**
- [ ] Responsive design
- [ ] Loading states
- [ ] Error messages
- [ ] Success confirmations
- [ ] Form validation

---

## 🔧 **Troubleshooting**

### **If Login Doesn't Work:**
1. **Check**: Database has admin user
2. **Run**: `npx prisma studio` to check users
3. **Create admin user** if needed:
   ```sql
   INSERT INTO "User" (id, email, password, role, name, createdAt, updatedAt)
   VALUES ('admin-1', 'john@example.com', '$2b$10$hashedpassword', 'ADMIN', 'John Admin', NOW(), NOW());
   ```

### **If Password Reset Doesn't Work:**
1. **Check**: Console for email content
2. **Verify**: Database has reset tokens
3. **Check**: OTP codes in database

### **If Admin Features Don't Show:**
1. **Check**: User role is 'ADMIN'
2. **Check**: Session is active
3. **Refresh**: Browser page

---

## 📱 **Browser Testing**

### **Recommended Browsers:**
- Chrome (latest)
- Firefox (latest)
- Edge (latest)
- Safari (latest)

### **Test on Different Devices:**
- Desktop
- Tablet
- Mobile

---

## 🎯 **Expected Results**

### **✅ Successful Admin Login:**
- Redirected to dashboard
- Admin badge visible
- User management accessible
- Project creation available

### **✅ Successful Password Reset:**
- Email sent (console shows content)
- OTP code generated
- Reset form accessible
- New password accepted

### **✅ Successful User Management:**
- User list loads
- Role changes work
- User deletion works
- Search/filter works

---

## 🚨 **Common Issues & Solutions**

### **Issue: "User not found"**
**Solution**: Create admin user in database

### **Issue: "Invalid credentials"**
**Solution**: Check password hashing in database

### **Issue: "Access denied"**
**Solution**: Check user role is 'ADMIN'

### **Issue: "Session expired"**
**Solution**: Refresh page and login again

---

## 📊 **Test Results Tracking**

### **Test Date**: ___________
### **Tester**: ___________
### **Browser**: ___________

#### **Authentication Tests:**
- [ ] Admin Login
- [ ] Password Reset
- [ ] OTP Verification
- [ ] New Password Setting

#### **Admin Features Tests:**
- [ ] User Management
- [ ] Role Management
- [ ] User Search/Filter
- [ ] User Deletion

#### **Security Tests:**
- [ ] Unauthorized Access Blocked
- [ ] Role-Based UI
- [ ] Session Management
- [ ] API Protection

#### **Overall Status:**
- [ ] ✅ All Tests Passed
- [ ] ⚠️ Some Issues Found
- [ ] ❌ Major Issues Found

---

## 🎉 **Success Criteria**

The authentication system is working correctly if:
- ✅ Admin can login with provided credentials
- ✅ Password reset flow works end-to-end
- ✅ Admin can manage users
- ✅ Role-based access control works
- ✅ Security features are active
- ✅ UI is responsive and user-friendly

**🚀 Ready for production use!**
