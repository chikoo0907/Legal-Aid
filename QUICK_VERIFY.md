# Quick Verification Guide

## 🚀 Fastest Way to Verify Lawyers

### Step 1: List Pending Lawyers
```bash
node list-pending-lawyers.js
```

This will show you all lawyers waiting for verification with their IDs.

### Step 2: Verify a Lawyer
```bash
node verify-lawyer.js <lawyer-id>
```

Replace `<lawyer-id>` with the ID from Step 1.

### Example:
```bash
# Step 1: List pending
node list-pending-lawyers.js

# Output:
# 📋 Found 2 pending lawyer(s):
# 1. John Doe
#    ID: abc123-def456-ghi789
#    Email: john@example.com
#    ...

# Step 2: Verify
node verify-lawyer.js abc123-def456-ghi789

# Output:
# ✅ Lawyer verified successfully!
#    Name: John Doe
#    Email: john@example.com
#    ...
```

---

## 🎯 Alternative: Using Prisma Studio (Visual)

1. Run: `npx prisma studio`
2. Open browser: `http://localhost:5555`
3. Click "Lawyer" table
4. Find lawyer with `isVerified = false`
5. Click Edit (pencil icon)
6. Check `isVerified` box
7. Click Save

---

## 📋 Alternative: Using SQL

```sql
-- Find pending lawyers
SELECT id, "barCouncilNumber", u.email, u.name
FROM "Lawyer" l
JOIN "User" u ON l."userId" = u.id
WHERE l."isVerified" = false;

-- Verify by ID
UPDATE "Lawyer"
SET "isVerified" = true, "verifiedAt" = NOW()
WHERE id = 'lawyer-id-here';
```

---

## 🌐 Alternative: Using API

```bash
# List pending
curl http://localhost:4000/admin/pending-lawyers

# Verify
curl -X POST http://localhost:4000/admin/verify-lawyer/{lawyer-id}
```

---

**That's it!** Once verified, the lawyer will appear in the "Find Lawyers" section for users. ✅
