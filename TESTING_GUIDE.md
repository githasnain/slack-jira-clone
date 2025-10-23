# Testing Guide - VertexAi Tec Project Management System

## 🧪 Testing Overview

This guide provides comprehensive testing instructions for the VertexAi Tec Project Management System, covering both Admin and User roles, access control validation, and system functionality.

## 🔑 Test Credentials

### Admin Access
- **Email**: `admin@workspace.com`
- **Password**: `admin123`
- **Role**: `ADMIN`
- **Access Level**: Full system access

### User Access
- **Email**: `user1@workspace.com` to `user5@workspace.com`
- **Password**: `user123`
- **Role**: `MEMBER`
- **Access Level**: Limited to assigned projects/teams

## 🎯 Test Scenarios

### 1. Admin Role Testing

#### Test 1.1: Admin Login and Dashboard Access
**Objective**: Verify admin can access full system
**Steps**:
1. Navigate to `http://localhost:3000/login`
2. Enter admin credentials:
   - Email: `admin@workspace.com`
   - Password: `admin123`
3. Click "Sign In"
4. Verify redirect to dashboard
5. Navigate to `/admin`
6. Verify admin dashboard loads with all data

**Expected Results**:
- ✅ Successful login
- ✅ Access to admin dashboard
- ✅ View all projects (Cup Streaming, Tiptok)
- ✅ View all teams (6 teams total)
- ✅ View all tickets (6 tickets total)
- ✅ Access to audit trail

#### Test 1.2: Admin Project Management
**Objective**: Verify admin can manage all projects
**Steps**:
1. Login as admin
2. Navigate to `/admin`
3. Click "Projects" tab
4. Verify all projects visible
5. Check project details and team assignments

**Expected Results**:
- ✅ All projects visible
- ✅ Project details displayed
- ✅ Team assignments shown
- ✅ Member counts accurate

#### Test 1.3: Admin Ticket Assignment
**Objective**: Verify admin can assign tickets
**Steps**:
1. Login as admin
2. Navigate to `/admin`
3. Click "Tickets" tab
4. Find a ticket to reassign
5. Use admin API to assign ticket to different user
6. Verify assignment successful

**Expected Results**:
- ✅ All tickets visible
- ✅ Assignment functionality works
- ✅ Changes reflected immediately
- ✅ Audit trail updated

### 2. User Role Testing

#### Test 2.1: User Login and Limited Access
**Objective**: Verify user has limited access
**Steps**:
1. Navigate to `http://localhost:3000/login`
2. Enter user credentials:
   - Email: `user1@workspace.com`
   - Password: `user123`
3. Click "Sign In"
4. Verify redirect to dashboard
5. Check accessible projects and teams

**Expected Results**:
- ✅ Successful login
- ✅ Limited project access
- ✅ Limited team access
- ❌ No admin dashboard access

#### Test 2.2: User Ticket Management
**Objective**: Verify user can manage own tickets
**Steps**:
1. Login as user
2. Navigate to `/tickets`
3. Create a new ticket
4. Edit the ticket
5. Try to edit another user's ticket

**Expected Results**:
- ✅ Can create tickets in assigned projects
- ✅ Can edit own tickets
- ❌ Cannot edit others' tickets
- ❌ Cannot access other projects

#### Test 2.3: User Project Access
**Objective**: Verify user sees only assigned projects
**Steps**:
1. Login as user
2. Navigate to `/projects`
3. Check visible projects
4. Try to access admin features

**Expected Results**:
- ✅ Only assigned projects visible
- ❌ Cannot see other projects
- ❌ Cannot access admin features
- ❌ Cannot assign tickets to others

### 3. Access Control Testing

#### Test 3.1: Data Isolation
**Objective**: Verify users cannot access other users' data
**Steps**:
1. Login as `user1@workspace.com`
2. Note accessible projects and tickets
3. Login as `user2@workspace.com`
4. Compare accessible data
5. Verify data isolation

**Expected Results**:
- ✅ Different users see different data
- ✅ No cross-user data leakage
- ✅ Proper project/team isolation

#### Test 3.2: Permission Boundaries
**Objective**: Verify proper permission enforcement
**Steps**:
1. Login as regular user
2. Try to access `/admin`
3. Try to access admin API endpoints
4. Try to edit others' tickets
5. Try to assign tickets

**Expected Results**:
- ❌ Cannot access admin dashboard
- ❌ Cannot access admin APIs
- ❌ Cannot edit others' tickets
- ❌ Cannot assign tickets

#### Test 3.3: API Security
**Objective**: Verify API endpoint security
**Steps**:
1. Test API endpoints without authentication
2. Test with invalid credentials
3. Test with user credentials on admin endpoints
4. Test with admin credentials on user endpoints

**Expected Results**:
- ❌ Unauthenticated requests rejected
- ❌ Invalid credentials rejected
- ❌ User cannot access admin endpoints
- ✅ Admin can access all endpoints

### 4. System Functionality Testing

#### Test 4.1: Ticket Lifecycle
**Objective**: Verify complete ticket management
**Steps**:
1. Create a new ticket
2. Update ticket status
3. Assign ticket to user
4. Complete ticket
5. Delete ticket

**Expected Results**:
- ✅ Ticket creation successful
- ✅ Status updates work
- ✅ Assignment functionality works
- ✅ Completion tracking accurate
- ✅ Deletion successful

#### Test 4.2: Real-time Updates
**Objective**: Verify live data synchronization
**Steps**:
1. Open two browser windows
2. Login as different users
3. Create/update tickets in one window
4. Verify updates in other window
5. Test filter updates

**Expected Results**:
- ✅ Changes reflected immediately
- ✅ Filters update in real-time
- ✅ No data inconsistencies

#### Test 4.3: Error Handling
**Objective**: Verify proper error handling
**Steps**:
1. Test invalid form submissions
2. Test network errors
3. Test permission errors
4. Test validation errors

**Expected Results**:
- ✅ Proper error messages displayed
- ✅ Graceful error handling
- ✅ User-friendly error descriptions

## 🔍 Manual Testing Checklist

### Authentication & Authorization
- [ ] Admin login works correctly
- [ ] User login works correctly
- [ ] Logout functionality works
- [ ] Session persistence works
- [ ] Role-based redirects work
- [ ] Permission boundaries enforced

### Admin Features
- [ ] Admin dashboard accessible
- [ ] All projects visible
- [ ] All teams visible
- [ ] All tickets visible
- [ ] Audit trail functional
- [ ] Ticket assignment works
- [ ] User management works

### User Features
- [ ] User dashboard accessible
- [ ] Limited project access
- [ ] Limited team access
- [ ] Ticket creation works
- [ ] Own ticket editing works
- [ ] Cannot edit others' tickets
- [ ] Cannot access admin features

### Data Integrity
- [ ] Data isolation maintained
- [ ] No cross-user data leakage
- [ ] Proper project/team filtering
- [ ] Real-time updates work
- [ ] Database consistency maintained

### UI/UX Testing
- [ ] Responsive design works
- [ ] Dark mode toggle works
- [ ] Navigation highlights correctly
- [ ] Forms validation works
- [ ] Error messages clear
- [ ] Loading states appropriate

## 🚨 Common Issues and Solutions

### Issue 1: Login Failures
**Symptoms**: Cannot login with provided credentials
**Solutions**:
1. Verify database is seeded: `npx prisma db seed`
2. Check database connection
3. Verify environment variables
4. Clear browser cache

### Issue 2: Permission Errors
**Symptoms**: Users can access admin features
**Solutions**:
1. Check role assignment in database
2. Verify API permission checks
3. Test with different user accounts
4. Check session data

### Issue 3: Data Not Loading
**Symptoms**: Empty dashboards or missing data
**Solutions**:
1. Check database connection
2. Verify access control logic
3. Check API endpoint responses
4. Review browser console for errors

### Issue 4: Real-time Updates Not Working
**Symptoms**: Changes not reflected immediately
**Solutions**:
1. Refresh the page
2. Check network connectivity
3. Verify API responses
4. Test with different browsers

## 📊 Performance Testing

### Load Testing
1. **Multiple Users**: Test with multiple concurrent users
2. **Large Datasets**: Test with many projects/teams/tickets
3. **API Response Times**: Monitor endpoint performance
4. **Database Queries**: Check query optimization

### Browser Compatibility
1. **Chrome**: Test on latest Chrome version
2. **Firefox**: Test on latest Firefox version
3. **Safari**: Test on latest Safari version
4. **Edge**: Test on latest Edge version

### Mobile Testing
1. **Responsive Design**: Test on various screen sizes
2. **Touch Interactions**: Test mobile interactions
3. **Performance**: Check mobile performance
4. **Navigation**: Test mobile navigation

## 🎯 Test Data Setup

### Database Seeding
```bash
# Reset and seed database
npx prisma db push
npx prisma db seed
```

### Test Users Created
- **Admin**: `admin@workspace.com` (password: `admin123`)
- **User 1**: `user1@workspace.com` (password: `user123`)
- **User 2**: `user2@workspace.com` (password: `user123`)
- **User 3**: `user3@workspace.com` (password: `user123`)
- **User 4**: `user4@workspace.com` (password: `user123`)
- **User 5**: `user5@workspace.com` (password: `user123`)

### Test Projects
- **Cup Streaming**: Live streaming platform
- **Tiptok**: Social media platform

### Test Teams (per project)
- **Designing**: UI/UX design team
- **Frontend**: React/Next.js development team
- **Backend**: API and server development team

## 📝 Test Reporting

### Test Results Template
```
Test Case: [Test Name]
Date: [Date]
Tester: [Name]
Status: [Pass/Fail]
Notes: [Additional comments]
Screenshots: [If applicable]
```

### Bug Report Template
```
Bug ID: [Unique identifier]
Title: [Brief description]
Severity: [Critical/High/Medium/Low]
Steps to Reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]
Expected Result: [What should happen]
Actual Result: [What actually happened]
Screenshots: [If applicable]
```

---

**Testing Guide Version**: 1.0  
**Last Updated**: October 2024  
**Maintained by**: VertexAi Tec Development Team

