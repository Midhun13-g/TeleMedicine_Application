# 🛡️ Admin Dashboard Setup Guide

## Overview
The TeleAsha platform now includes a comprehensive admin dashboard for managing users and system settings.

## Default Admin Account
A default admin account is automatically created when the system starts:

- **Email:** `admin@teleasha.com`
- **Password:** `admin123`
- **Role:** Administrator

## Admin Features

### 1. User Management
- **View All Users:** See complete list of patients, doctors, and pharmacies
- **User Statistics:** Real-time counts and analytics
- **Search & Filter:** Find users by name, email, role, or status
- **Account Actions:**
  - Suspend user accounts (prevents login)
  - Unsuspend suspended accounts
  - Delete user accounts (permanent)
  - View user details and registration info

### 2. System Analytics
- User distribution by role
- Account status breakdown
- Registration trends
- System health monitoring

### 3. Security Features
- Admin accounts cannot be suspended or deleted by other admins
- Admin registration requires secret key: `TELEASHA_ADMIN_2024`
- Audit trail for all admin actions
- Protected endpoints with role validation

## Creating Additional Admin Accounts

### Method 1: Through Registration Form
1. Go to the registration page
2. Select "Administrator" role
3. Enter the admin secret key: `TELEASHA_ADMIN_2024`
4. Complete registration

### Method 2: Direct Database Creation
The system automatically creates the default admin account on startup.

## API Endpoints

### Admin Management Endpoints
```
POST /api/auth/admin/suspend/{userId}    - Suspend a user
POST /api/auth/admin/unsuspend/{userId}  - Unsuspend a user
DELETE /api/auth/admin/delete/{userId}   - Delete a user
GET /api/auth/users                      - Get all users
```

### Authentication
```
POST /api/auth/login     - Login (supports admin role)
POST /api/auth/register  - Register (with admin key for admin role)
```

## Testing Admin Functionality

### Using the Test Page
1. Open `test-admin.html` in your browser
2. Start the backend server (`http://localhost:8080`)
3. Test admin login with default credentials
4. Try user management operations

### Manual Testing Steps
1. **Login Test:**
   ```bash
   curl -X POST http://localhost:8080/api/auth/login \
   -H "Content-Type: application/json" \
   -d '{"email":"admin@teleasha.com","password":"admin123"}'
   ```

2. **Get All Users:**
   ```bash
   curl -X GET http://localhost:8080/api/auth/users
   ```

3. **Suspend User:**
   ```bash
   curl -X POST http://localhost:8080/api/auth/admin/suspend/2
   ```

## Dashboard Features

### User Management Tab
- **Real-time Statistics:** Total, active, suspended users by role
- **Advanced Filtering:** Search by name/email, filter by role/status
- **Bulk Actions:** Manage multiple users efficiently
- **User Details:** Complete profile information display

### Analytics Tab
- **User Distribution Charts:** Visual breakdown by role
- **Status Analytics:** Active vs suspended accounts
- **Growth Metrics:** Registration trends over time

### Settings Tab
- **System Information:** Database status, user counts
- **Configuration Options:** System-wide settings
- **Security Notices:** Important admin alerts

## Security Considerations

### Admin Key Protection
- The admin key `TELEASHA_ADMIN_2024` should be kept secure
- Consider changing it in production environments
- Only share with trusted system administrators

### User Privacy
- Admin actions are logged for audit purposes
- User data should be handled according to privacy policies
- Deletion is permanent and cannot be undone

### Access Control
- Admin dashboard only accessible to ADMIN role users
- Regular users cannot access admin endpoints
- Suspended admins cannot perform admin actions

## Troubleshooting

### Common Issues

1. **Admin Login Fails**
   - Verify backend is running on port 8080
   - Check default credentials: admin@teleasha.com / admin123
   - Ensure database is connected

2. **User Management Not Working**
   - Confirm admin role is properly set
   - Check API endpoints are accessible
   - Verify CORS settings for frontend

3. **Admin Registration Fails**
   - Verify admin key: TELEASHA_ADMIN_2024
   - Check email is not already registered
   - Ensure all required fields are filled

### Backend Logs
Monitor console output for:
- User registration attempts
- Admin key validation
- Database operations
- Authentication failures

## Production Deployment

### Security Checklist
- [ ] Change default admin password
- [ ] Update admin secret key
- [ ] Enable HTTPS
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Enable audit logging
- [ ] Configure rate limiting

### Environment Variables
Consider using environment variables for:
- Admin secret key
- Database credentials
- JWT secrets (if implemented)
- CORS origins

## Support

For issues or questions regarding the admin dashboard:
1. Check the troubleshooting section above
2. Review backend console logs
3. Test with the provided test page
4. Verify API endpoints with curl commands

## Version History

- **v1.0** - Initial admin dashboard implementation
  - User management (suspend/unsuspend/delete)
  - Basic analytics and statistics
  - Default admin account creation
  - Admin registration with secret key