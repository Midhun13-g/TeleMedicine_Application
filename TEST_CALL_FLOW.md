# 📞 Call Flow Test Guide

## 🎯 Testing the Complete Call Flow

### Step 1: Start All Services
```bash
START_WITH_CALLS.bat
```

### Step 2: Open Two Browser Windows

#### Window 1 - Doctor:
1. Go to: http://localhost:5173
2. Login with: `dr.sharma@teleasha.com` / `password123`
3. Click **"Go Online"** button
4. Verify status shows: "✅ Connected"

#### Window 2 - Patient:
1. Go to: http://localhost:5173
2. Login with: `patient1@teleasha.com` / `password123`
3. Check "Available Doctors" section
4. Verify you see: "Dr. Rajesh Sharma" with "🟢 Online" status

### Step 3: Test Call Request
1. **Patient**: Click **"Video Call"** button
2. **Patient**: Should see "Request Pending..." status
3. **Doctor**: Should receive notification: "New Consultation Request"
4. **Doctor**: Should see "📋 Live Consultation Requests" section

### Step 4: Test Call Acceptance
1. **Doctor**: Click **"✅ Accept"** button
2. **Both**: Should automatically navigate to call page
3. **Both**: Should see full-screen video call interface
4. **Both**: Should see "Back to Dashboard" button in top-left

### Step 5: Test Call Controls
1. **Either user**: Click video/audio toggle buttons
2. **Either user**: Verify controls work (mute/unmute)
3. **Either user**: Click **"End Call"** button
4. **Both**: Should automatically return to dashboard

### Step 6: Test Call Rejection
1. **Patient**: Request another call
2. **Doctor**: Click **"❌ Reject"** button  
3. **Patient**: Should see "Consultation Rejected" notification
4. **Patient**: Should return to normal state

## ✅ Expected Results

### When Call is Accepted:
- ✅ Both users navigate to full-screen call page
- ✅ Video streams appear (or placeholders if no camera)
- ✅ Call controls work (video/audio toggle)
- ✅ "Back to Dashboard" button visible

### When Call Ends:
- ✅ Both users automatically return to dashboard
- ✅ No pending requests remain
- ✅ Doctor can accept new requests
- ✅ Patient can make new requests

### When Call is Rejected:
- ✅ Patient gets rejection notification
- ✅ Patient returns to normal state
- ✅ Doctor remains available for new requests

## 🔧 Troubleshooting

### Issue: "❌ Server Offline"
**Solution**: Call server not running
```bash
node unified-call-server.js
```

### Issue: Call page doesn't load
**Solution**: Check browser console for errors, refresh page

### Issue: Video doesn't work
**Solution**: Allow camera/microphone permissions in browser

### Issue: Users don't return to dashboard
**Solution**: Click "Back to Dashboard" button manually

## 🎉 Success Indicators

When everything works correctly:
1. **Real-time doctor status** updates instantly
2. **Call requests** appear immediately for doctors
3. **Call acceptance** navigates both users to call page
4. **Call ending** returns both users to dashboard
5. **No stuck states** - system resets properly

---

**🎯 The complete call flow should work seamlessly from request to end!**