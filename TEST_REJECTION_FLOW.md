# ❌ Consultation Rejection Test

## 🎯 Testing Rejection Notification

### Step 1: Setup
1. Start services: `START_WITH_CALLS.bat`
2. Open two browser windows
3. **Window 1**: Login as Doctor (`dr.sharma@teleasha.com`)
4. **Window 2**: Login as Patient (`patient1@teleasha.com`)

### Step 2: Doctor Goes Online
1. **Doctor**: Click "Go Online"
2. **Patient**: Verify doctor appears in "Available Doctors"

### Step 3: Patient Requests Call
1. **Patient**: Click "Video Call" button
2. **Patient**: Should see "Consultation Request Pending"
3. **Doctor**: Should see "📋 Live Consultation Requests"

### Step 4: Doctor Rejects Call
1. **Doctor**: Click "❌ Reject" button
2. **Doctor**: Enter rejection reason (or leave default)
3. **Doctor**: Click OK

### Step 5: Verify Patient Notification
**Patient should immediately see:**
- ✅ "Consultation Rejected" toast notification
- ✅ Pending request disappears
- ✅ Can make new requests again
- ✅ Rejection reason displayed in notification

### Step 6: Test Different Rejection Reasons
1. **Patient**: Make another request
2. **Doctor**: Reject with custom reason: "Currently with another patient"
3. **Patient**: Should see custom reason in notification

## ✅ Expected Results

### When Doctor Rejects:
- ✅ Patient gets instant notification
- ✅ "Request Pending" status disappears
- ✅ Patient can make new requests
- ✅ Custom rejection reason shows in notification

### Patient Notification Should Show:
- **Title**: "Consultation Rejected" or "Call Request Rejected"
- **Description**: Doctor's reason or default message
- **Type**: Red/destructive notification
- **Duration**: Visible for several seconds

## 🔧 Troubleshooting

### Issue: Patient doesn't get rejection notification
**Check:**
1. Call server is running (`node unified-call-server.js`)
2. Both users show "✅ Connected" status
3. Browser console for socket errors

### Issue: Notification shows but request still pending
**Solution:** 
- Refresh patient page
- Check if `pendingConsultation` state is cleared

### Issue: Custom rejection reason not showing
**Solution:**
- Ensure doctor enters reason in prompt
- Check browser console for socket events

## 🎯 Success Indicators

✅ **Instant notification** when doctor rejects
✅ **Clear rejection message** with reason
✅ **Pending state cleared** immediately  
✅ **Can make new requests** after rejection
✅ **Doctor confirmation** that patient was notified

---

**The rejection flow should provide clear, immediate feedback to patients!**