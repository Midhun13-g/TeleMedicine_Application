# 🚀 TeleMedicine Application - Startup Guide

## ⚡ Quick Start (3 Steps)

### Step 1: Start Call Server
```bash
# Open Terminal 1
START_CALL_SERVER.bat
```
**Expected Output:** `🚀 Unified Call Server running on port 5002`

### Step 2: Start Backend
```bash
# Open Terminal 2  
START_BACKEND.bat
```
**Expected Output:** `Started ProjectbackendApplication in X.XXX seconds`

### Step 3: Start Frontend
```bash
# Open Terminal 3
START_FRONTEND.bat
```
**Expected Output:** `Local: http://localhost:5173/`

## 🌐 Access the Application

Open your browser and go to: **http://localhost:5173**

## 🔑 Test Login Credentials

### Doctor Login:
- **Email:** `dr.sharma@teleasha.com`
- **Password:** `password123`

### Patient Login:
- **Email:** `patient1@teleasha.com`
- **Password:** `password123`

## ✅ Connection Status Check

After logging in, check the connection status:

### For Patients:
- Look for "Call Server: ✅ Connected" in the Available Doctors section
- If you see "❌ Server Offline", the call server is not running

### For Doctors:
- Look for "Call Server: ✅ Connected" in the status banner
- If you see "❌ Server Offline", the call server is not running

## 🔧 Troubleshooting

### Issue: "❌ Server Offline" or "❌ Disconnected"

**Solution:** The call server is not running. 

1. **Check if call server is running:**
   ```bash
   netstat -an | findstr :5002
   ```
   
2. **If no output, start the call server:**
   ```bash
   START_CALL_SERVER.bat
   ```

3. **Refresh the browser page**

### Issue: Backend not starting

**Solution:** 
1. **Check if port 8080 is free:**
   ```bash
   netstat -an | findstr :8080
   ```

2. **If port is busy, kill the process:**
   ```bash
   taskkill /f /im java.exe
   ```

3. **Restart backend:**
   ```bash
   START_BACKEND.bat
   ```

### Issue: Frontend build errors

**Solution:**
1. **Install dependencies:**
   ```bash
   cd project
   npm install
   ```

2. **Start frontend:**
   ```bash
   npm run dev
   ```

## 🎯 Testing Real-time Features

### Test Doctor-Patient Connection:

1. **Open two browser windows**
2. **Window 1:** Login as Doctor → Click "Go Online"
3. **Window 2:** Login as Patient → Check "Available Doctors" section
4. **Verify:** Connection status shows "✅ Connected" in both windows

### Test Prescription System:

1. **Doctor:** Add a prescription in the Prescriptions tab
2. **Patient:** Check if prescription appears in Medicines tab
3. **Verify:** Real-time notification appears

## 📊 System Status Indicators

### ✅ Everything Working:
- Call Server: `🚀 Unified Call Server running on port 5002`
- Backend: `Started ProjectbackendApplication`
- Frontend: `Local: http://localhost:5173/`
- Connection: "✅ Connected" in both dashboards

### ❌ Issues:
- Call Server: No output or error messages
- Backend: Port 8080 errors or database connection issues
- Frontend: Build errors or blank page
- Connection: "❌ Server Offline" or "❌ Disconnected"

## 🔄 Complete Restart Process

If everything is broken:

1. **Stop all services** (Ctrl+C in all terminals)
2. **Wait 5 seconds**
3. **Start in order:**
   - Call Server (Terminal 1)
   - Backend (Terminal 2) 
   - Frontend (Terminal 3)
4. **Wait for each to fully start before starting the next**

## 📱 Features Available

### ✅ Working Features:
- User Authentication (Login/Register)
- Doctor/Patient Dashboards
- Appointment Booking
- Prescription Management
- Medicine Search
- Symptom Checker
- H2 Database Console

### 🔄 Real-time Features (Requires Call Server):
- Doctor Online/Offline Status
- Live Consultation Requests
- Real-time Prescription Updates
- Video/Audio Call Integration

## 🆘 Still Having Issues?

1. **Check all three services are running:**
   ```bash
   netstat -an | findstr :5002  # Call Server
   netstat -an | findstr :8080  # Backend  
   netstat -an | findstr :5173  # Frontend
   ```

2. **Check browser console (F12) for errors**

3. **Verify login credentials are correct**

4. **Try refreshing the browser page**

---

**🎉 When you see "✅ Connected" in both Doctor and Patient dashboards, all real-time features are working!**