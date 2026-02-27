# Quick Start Guide - Legal Aid Registration System

## 🎯 Quick Reference

### For Regular Users
```
Splash → Login → Create Account → Select "User" → Fill Form → Done ✅
```

### For Lawyers
```
Splash → Login → Create Account → Select "Lawyer" → Fill Basic Info → 
Fill Lawyer Form + Upload Documents → Submit → Wait for Verification ⏳
```

---

## 📋 Step-by-Step Instructions

### 👤 Registering as a USER

1. **Open the app**
2. **Tap "Get Started"** on Splash screen
3. **Tap "Create Account"** on Login screen
4. **Select "User"** option
5. **Fill the form**:
   - Enter your full name
   - Enter your email
   - Enter your phone number
   - Create a password
6. **Tap "Create Account"**
7. **You're done!** ✅ You'll be automatically logged in

**Time to complete:** ~30 seconds

---

### ⚖️ Registering as a LAWYER

#### Part 1: Basic Registration
1. **Open the app**
2. **Tap "Get Started"** on Splash screen
3. **Tap "Create Account"** on Login screen
4. **Select "Lawyer"** option
5. **Fill basic information**:
   - Full Name
   - Email
   - Phone Number
   - Password
6. **Tap "Create Account"**

#### Part 2: Lawyer Profile & Documents
7. **Fill lawyer-specific information**:
   - **Bar Council Number** ⚠️ (Required)
   - Specialization (optional)
   - Years of Experience (optional)
   - Bio/Description (optional)
   - Address, City, State, Pincode (optional)

8. **Upload 3 required documents** ⚠️:
   - **Bar Council Certificate** (tap to upload image)
   - **ID Proof** (Aadhar/PAN - tap to upload image)
   - **Profile Photo** (tap to upload image)

9. **Tap "Submit for Verification"**
10. **See confirmation message**: "Registration Submitted"
11. **You can login**, but your profile won't be visible to users yet

**Time to complete:** ~5-10 minutes

#### Part 3: Verification (Admin Task)
12. **Admin verifies your documents** (manual process)
13. **Once verified**, your profile appears in "Find Lawyers" section
14. **Users can now find and contact you** ✅

---

## 🔍 Finding Lawyers (For Users)

1. **Login to the app**
2. **Go to Home screen**
3. **Tap "Find Lawyers"** card
4. **Browse verified lawyers**:
   - See lawyer profiles
   - View specializations
   - See locations
   - Read bios
5. **Use search/filter**:
   - Search by name or specialization
   - Filter by city
   - Filter by specialization
6. **Tap on a lawyer** to see full details:
   - Contact information
   - Complete profile
   - Location details

---

## ⚙️ Admin: How to Verify a Lawyer

### Method 1: Using Database Query (PostgreSQL)

```sql
-- Step 1: Find the lawyer by email
SELECT l.id, l."barCouncilNumber", u.name, u.email, l."isVerified"
FROM "Lawyer" l
JOIN "User" u ON l."userId" = u.id
WHERE u.email = 'lawyer@example.com';

-- Step 2: Verify the lawyer
UPDATE "Lawyer"
SET "isVerified" = true, "verifiedAt" = NOW()
WHERE "userId" = (
  SELECT id FROM "User" WHERE email = 'lawyer@example.com'
);
```

### Method 2: Using Prisma Studio (Visual)

1. **Install Prisma Studio** (if not already installed):
   ```bash
   npx prisma studio
   ```

2. **Open browser** → Navigate to `http://localhost:5555`

3. **Go to "Lawyer" table**

4. **Find the lawyer** you want to verify

5. **Edit the record**:
   - Set `isVerified` to `true`
   - Set `verifiedAt` to current date/time

6. **Save changes**

### Method 3: Create Admin API Endpoint

Create a new file: `app/server/routes/admin.js`

```javascript
import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// Add authentication middleware here
// router.use(authenticateAdmin);

// Verify a lawyer
router.post("/verify-lawyer/:lawyerId", async (req, res) => {
  try {
    const lawyer = await prisma.lawyer.update({
      where: { id: req.params.lawyerId },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: "Lawyer verified successfully",
      lawyer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to verify lawyer" });
  }
});

// Get all pending lawyers
router.get("/pending-lawyers", async (req, res) => {
  try {
    const lawyers = await prisma.lawyer.findMany({
      where: { isVerified: false },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(lawyers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch pending lawyers" });
  }
});

export default router;
```

Then add to `app/server/index.js`:
```javascript
import admin from "./routes/admin.js";
// ...
app.use("/admin", admin);
```

---

## 📊 Status Indicators

### User Account
- ✅ **Active**: Can use all features immediately
- ✅ **Visible**: Profile visible to self only

### Lawyer Account
- ⏳ **Pending**: `isVerified = false`
  - Can login
  - Profile NOT visible to users
  - Waiting for admin verification

- ✅ **Verified**: `isVerified = true`
  - Can login
  - Profile visible in "Find Lawyers"
  - Users can see and contact lawyer

---

## 🧪 Testing Checklist

### Test User Flow
- [ ] Can register as user
- [ ] Can login immediately after registration
- [ ] Can access all user features
- [ ] Can see "Find Lawyers" option

### Test Lawyer Flow
- [ ] Can select "Lawyer" option
- [ ] Can fill basic registration
- [ ] Can fill lawyer form
- [ ] Can upload all 3 documents
- [ ] Can submit registration
- [ ] Can login after registration
- [ ] Profile NOT visible before verification
- [ ] Profile visible after verification

### Test Finding Lawyers
- [ ] Can access "Find Lawyers" screen
- [ ] Can see verified lawyers only
- [ ] Can search lawyers
- [ ] Can filter by city/specialization
- [ ] Can view lawyer details

---

## 🐛 Common Issues & Solutions

### Issue: Lawyer registration fails
**Solution**: 
- Check all required fields are filled
- Verify all 3 documents are uploaded
- Check server logs for errors
- Ensure email is unique

### Issue: Lawyer not appearing in search
**Solution**:
- Check `isVerified = true` in database
- Verify lawyer was created successfully
- Check API endpoint returns the lawyer
- Clear app cache and restart

### Issue: Document upload fails
**Solution**:
- Check image format (JPEG/PNG)
- Verify file size (should be reasonable)
- Check device storage permissions
- Restart app and try again

### Issue: Can't find "Find Lawyers" option
**Solution**:
- Ensure you're logged in as a regular user
- Check Home screen for the card
- Update app if using old version

---

## 📱 App Screens Reference

1. **Splash** - Initial screen
2. **Login** - Login or create account
3. **RoleSelection** - Choose User or Lawyer
4. **Register** - Basic registration form
5. **LawyerRegister** - Lawyer-specific form with documents
6. **Home** - Main dashboard
7. **Lawyers** - Browse verified lawyers
8. **Profile** - User profile

---

## 🔗 Related Files

- **Schema**: `prisma/schema.prisma`
- **User Registration**: `app/screens/Register.jsx`
- **Lawyer Registration**: `app/screens/LawyerRegister.jsx`
- **Lawyers List**: `app/screens/Lawyers.jsx`
- **API Routes**: `app/server/routes/auth.js`, `app/server/routes/lawyers.js`
- **API Service**: `app/services/api.js`

---

## 💡 Tips

1. **For Lawyers**: Have your documents ready before starting registration
2. **For Admins**: Use Prisma Studio for easy verification
3. **For Testing**: Create test accounts with different roles
4. **For Debugging**: Check server console logs for detailed errors

---

**Last Updated**: Based on current implementation
**Version**: 1.0
