# Troubleshooting 404 Error - Lawyer Registration

## 🔍 Quick Diagnosis

If you're getting a **404 error** when registering as a lawyer, follow these steps:

### Step 1: Verify Server is Running

1. **Check if the server is running:**
   ```bash
   # In your terminal, you should see:
   # "Server running on 4000"
   ```

2. **Test the server:**
   - Open browser and go to: `http://localhost:4000/test`
   - You should see: `{"message":"Server is running",...}`
   - If you get "Cannot connect", the server is NOT running

3. **Start the server if needed:**
   ```bash
   npm run server
   # or
   node app/server/index.js
   ```

### Step 2: Check API Base URL

1. **Check your API configuration:**
   - File: `app/config/api.js`
   - The default should be: `http://localhost:4000` (for iOS/Web)
   - Or: `http://10.0.2.2:4000` (for Android emulator)

2. **For physical device:**
   - You need to use your computer's LAN IP address
   - Example: `http://192.168.1.100:4000`
   - Set in `.env` file: `EXPO_PUBLIC_API_BASE_URL=http://YOUR_IP:4000`

### Step 3: Verify Route Exists

1. **Check the route is registered:**
   - File: `app/server/index.js` should have: `app.use("/auth", auth);`
   - File: `app/server/routes/auth.js` should have: `router.post("/register-lawyer", ...)`

2. **Test the endpoint directly:**
   ```bash
   # Using curl (if available)
   curl http://localhost:4000/auth/register-lawyer
   # Should return an error (not 404) since we're not sending data
   ```

### Step 4: Check Console Logs

1. **Server console:**
   - When you try to register, check the server terminal
   - You should see: "Lawyer registration request received"
   - If you don't see this, the request isn't reaching the server

2. **App console:**
   - Check React Native debugger or Expo logs
   - Look for: "Sending lawyer registration request to: ..."
   - Check for any error messages

### Step 5: Common Issues & Fixes

#### Issue: Server not running
**Fix:**
```bash
cd C:\VEDANG\Legal-Aid
npm run server
```

#### Issue: Wrong API URL
**Fix:**
- Check `app/config/api.js`
- For Android emulator: Should be `http://10.0.2.2:4000`
- For iOS simulator: Should be `http://localhost:4000`
- For physical device: Use your computer's IP

#### Issue: Port conflict
**Fix:**
- Check if port 4000 is already in use
- Change port in `app/server/index.js`: `const PORT = process.env.PORT || 4001;`
- Update API config accordingly

#### Issue: Database not connected
**Fix:**
- Check `.env` file has `DATABASE_URL`
- Run: `npx prisma generate`
- Run: `npx prisma migrate dev`

#### Issue: Route not found (404)
**Possible causes:**
1. Server not restarted after adding route
2. Route path mismatch
3. Middleware blocking the request

**Fix:**
1. Restart the server
2. Verify route path matches exactly: `/auth/register-lawyer`
3. Check server logs for any middleware errors

---

## 🧪 Testing Steps

### Test 1: Server Health Check
```bash
# In browser or using curl
GET http://localhost:4000/test

# Expected response:
{
  "message": "Server is running",
  "timestamp": "...",
  "routes": {
    "auth": "/auth",
    "lawyers": "/lawyers",
    "registerLawyer": "/auth/register-lawyer"
  }
}
```

### Test 2: Auth Route Check
```bash
# Test if auth routes are accessible
GET http://localhost:4000/auth/login
# Should return an error (not 404) - method not allowed or missing data
```

### Test 3: Check Server Logs
When you try to register, the server console should show:
```
Lawyer registration request received
Request body keys: [...]
Request files: [...]
```

If you don't see this, the request isn't reaching the server.

---

## 🔧 Quick Fixes

### Fix 1: Restart Everything
```bash
# Stop the server (Ctrl+C)
# Stop the app

# Start server
npm run server

# Start app (in another terminal)
npm start
```

### Fix 2: Clear Cache
```bash
# Clear Expo cache
npx expo start -c

# Or clear React Native cache
npm start -- --reset-cache
```

### Fix 3: Verify File Structure
Make sure these files exist:
- ✅ `app/server/index.js`
- ✅ `app/server/routes/auth.js`
- ✅ `app/services/api.js`
- ✅ `app/screens/LawyerRegister.jsx`

---

## 📝 Debug Checklist

- [ ] Server is running (check terminal)
- [ ] Server shows "Server running on 4000"
- [ ] `/test` endpoint works
- [ ] API base URL is correct
- [ ] Database is connected
- [ ] Prisma client is generated
- [ ] Route exists in `auth.js`
- [ ] Route is registered in `index.js`
- [ ] No port conflicts
- [ ] Network connectivity (for physical device)

---

## 🆘 Still Not Working?

1. **Check server logs** for detailed error messages
2. **Check app console** for request details
3. **Verify network** - can the app reach the server?
4. **Test with Postman** - try the endpoint directly:
   ```
   POST http://localhost:4000/auth/register-lawyer
   Content-Type: multipart/form-data
   ```

5. **Check file permissions** - ensure server can read route files

---

## 📞 Additional Help

If the issue persists:
1. Share the **exact error message** from the app
2. Share the **server console logs**
3. Share the **API base URL** you're using
4. Share whether you're using **emulator or physical device**
