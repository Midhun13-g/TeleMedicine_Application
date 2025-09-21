# 🔧 TeleMedicine Application - Troubleshooting Guide

## 🚨 Common Issues & Solutions

### Issue 1: Frontend Not Loading / Blank Page

**Symptoms:**
- Browser shows blank page
- Console errors about missing modules
- Build failures

**Solutions:**
```bash
# 1. Install dependencies
cd project
npm install socket.io-client@4.7.2
npm install

# 2. Clear cache and rebuild
npm run build
```

### Issue 2: Backend Not Starting

**Symptoms:**
- Spring Boot fails to start
- Database connection errors
- Port already in use

**Solutions:**
```bash
# 1. Check if port 8080 is free
netstat -an | findstr :8080

# 2. Kill process using port 8080 (if needed)
taskkill /f /im java.exe

# 3. Rebuild backend
cd projectbackend
mvn clean install -DskipTests
mvn spring-boot:run
```

### Issue 3: Database Connection Issues

**Problem:** MySQL connection errors

**Solution:** We've switched to H2 in-memory database
- No MySQL installation needed
- Database auto-creates on startup
- Access H2 console at: http://localhost:8080/h2-console

**H2 Console Login:**
- JDBC URL: `jdbc:h2:mem:teleasha`
- Username: `sa`
- Password: `password`

### Issue 4: Socket.IO Connection Errors

**Symptoms:**
- Real-time features not working
- Console errors about WebSocket connections

**Solutions:**
```bash
# 1. Ensure call server is running
node unified-call-server.js

# 2. Check if port 5002 is available
netstat -an | findstr :5002

# 3. Restart call server if needed
```

### Issue 5: CORS Errors

**Symptoms:**
- API calls failing from frontend
- CORS policy errors in browser console

**Solution:** Already configured in application.properties:
```properties
spring.web.cors.allowed-origins=http://localhost:5173,http://127.0.0.1:5173
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true
```

## 🔍 Step-by-Step Debugging

### 1. Check All Services Are Running

```bash
# Check frontend (should show Vite dev server)
netstat -an | findstr :5173

# Check backend (should show Spring Boot)
netstat -an | findstr :8080

# Check call server (should show Node.js)
netstat -an | findstr :5002
```

### 2. Test API Endpoints

Open browser and test:
- Backend health: http://localhost:8080/api/auth/login
- H2 Console: http://localhost:8080/h2-console
- Frontend: http://localhost:5173

### 3. Check Browser Console

Press F12 and look for:
- ✅ No red errors
- ✅ WebSocket connection successful
- ✅ API calls returning data

### 4. Test Login Flow

Use these test credentials:

**Doctor:**
- Email: `dr.sharma@teleasha.com`
- Password: `password123`

**Patient:**
- Email: `patient1@teleasha.com`
- Password: `password123`

## 🛠️ Manual Setup (If Scripts Fail)

### Frontend Setup:
```bash
cd project
npm install
npm install socket.io-client@4.7.2
npm run dev
```

### Backend Setup:
```bash
cd projectbackend
mvn clean install -DskipTests
mvn spring-boot:run
```

### Call Server Setup:
```bash
npm install
node unified-call-server.js
```

## 📊 System Requirements

- **Node.js**: 16+ (for frontend and call server)
- **Java**: 17+ (for Spring Boot backend)
- **Maven**: 3.6+ (for backend build)
- **Browser**: Chrome/Firefox/Edge (latest versions)

## 🔧 Port Configuration

| Service | Port | URL |
|---------|------|-----|
| Frontend | 5173 | http://localhost:5173 |
| Backend | 8080 | http://localhost:8080 |
| Call Server | 5002 | http://localhost:5002 |
| H2 Console | 8080 | http://localhost:8080/h2-console |

## 🚀 Quick Fixes

### Reset Everything:
```bash
# Stop all services (Ctrl+C in each terminal)
# Then run:
COMPLETE_FIX.bat
```

### Clear All Caches:
```bash
# Frontend
cd project
rm -rf node_modules
npm install

# Backend
cd projectbackend
mvn clean
mvn install -DskipTests
```

### Check Logs:
- **Frontend**: Browser console (F12)
- **Backend**: Terminal running Spring Boot
- **Call Server**: Terminal running Node.js

## 📞 Feature Testing Checklist

### ✅ Basic Login:
- [ ] Doctor can login with test credentials
- [ ] Patient can login with test credentials
- [ ] Dashboard loads correctly

### ✅ Real-time Features:
- [ ] Doctor can go online/offline
- [ ] Patient sees available doctors
- [ ] Consultation requests work
- [ ] Video call connects

### ✅ Prescription System:
- [ ] Doctor can add prescription
- [ ] Patient receives notification
- [ ] Prescription appears in patient portal

## 🆘 Still Having Issues?

1. **Run the test script first:**
   ```bash
   TEST_SYSTEM.bat
   ```

2. **Check all services are running:**
   ```bash
   # Should see 3 command windows open:
   # - Call Server (Node.js)
   # - Spring Backend (Java)
   # - React Frontend (Vite)
   ```

3. **Verify database:**
   - Go to: http://localhost:8080/h2-console
   - Login with: sa / password
   - Check if USER table has data

4. **Test API directly:**
   ```bash
   # Test login endpoint
   curl -X POST http://localhost:8080/api/auth/login \
   -H "Content-Type: application/json" \
   -d '{"email":"patient1@teleasha.com","password":"password123"}'
   ```

## 🎯 Success Indicators

When everything is working correctly:

✅ **Frontend**: Loads at http://localhost:5173 without errors
✅ **Backend**: Spring Boot starts and shows "Started ProjectbackendApplication"
✅ **Call Server**: Shows "🚀 Unified Call Server running on port 5002"
✅ **Database**: H2 console accessible with test data
✅ **Login**: Test credentials work and redirect to dashboards
✅ **Real-time**: Doctor online status updates instantly
✅ **Prescriptions**: Added by doctor, appear immediately for patient

---

**🎉 If all indicators are green, your TeleMedicine Application is fully functional!**