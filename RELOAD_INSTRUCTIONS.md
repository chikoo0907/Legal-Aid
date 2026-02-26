# How to Check Changes and Reload the App

## Step 1: Apply Database Migration

The Appointment model migration needs to be applied to your database:

```bash
npx prisma migrate dev
```

If the database connection times out, make sure:
- Your database server is running
- Your `.env` file has the correct `DATABASE_URL`
- The database is accessible

## Step 2: Restart the Backend Server

1. **Stop the current server** (if running):
   - Press `Ctrl+C` in the terminal where the server is running

2. **Start the server again**:
   ```bash
   npm run server
   ```
   OR on Windows:
   ```bash
   npm run server:win
   ```

3. **Verify the server is running**:
   - Check terminal for: `Server running on 4000` (or your PORT)
   - Visit: `http://localhost:4000/test` in browser
   - Should see JSON response with routes

## Step 3: Reload the React Native App

### Option A: Using Expo (Recommended)
1. **In the Expo terminal**, press:
   - `r` - Reload the app
   - `R` - Reload and clear cache
   - `Ctrl+C` then `npm start` - Restart Expo

2. **On your device/emulator**:
   - **Android**: Shake device → "Reload"
   - **iOS**: Shake device → "Reload"
   - Or pull down to refresh

### Option B: Full Restart
```bash
# Stop Expo (Ctrl+C)
npm start
# Then press 'a' for Android or 'i' for iOS
```

## Step 4: Verify Changes Are Applied

### Check Backend:
1. **Test appointments endpoint**:
   ```bash
   curl http://localhost:4000/appointments/lawyer/test-id
   ```
   Should return JSON (even if empty array)

2. **Check server logs** for any errors

### Check Frontend:
1. **Login as a lawyer** (user with `role: "lawyer"`)
2. **You should see**:
   - Lawyer name in header (instead of "NyayaSahayak")
   - "Appointments" card
   - "Chat with Users" card
   - "Ask Legal Assistant" card

3. **Navigate to Appointments**:
   - Should show appointment list (empty if no appointments yet)
   - Filter tabs: All, Pending, Completed

4. **Navigate to Chat with Users**:
   - Should show list of users with appointments

## Quick Verification Checklist

- [ ] Database migration applied (`npx prisma migrate status` shows all migrations applied)
- [ ] Backend server restarted and running
- [ ] Expo app reloaded
- [ ] Login as lawyer user
- [ ] See LawyerHome screen (not regular Home)
- [ ] Can navigate to Appointments screen
- [ ] Can navigate to Chat with Users screen

## Troubleshooting

### If changes don't appear:
1. **Clear Expo cache**:
   ```bash
   npx expo start -c
   ```

2. **Clear React Native cache**:
   ```bash
   npm start -- --reset-cache
   ```

3. **Restart everything**:
   - Stop server (Ctrl+C)
   - Stop Expo (Ctrl+C)
   - Restart server: `npm run server`
   - Restart Expo: `npm start`

### If you see errors:
- Check server terminal for backend errors
- Check Expo terminal for frontend errors
- Verify database connection in `.env`
- Make sure all dependencies are installed: `npm install`
