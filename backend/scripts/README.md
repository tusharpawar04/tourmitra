# Tourmitra Backend Scripts

## Manual Guide Verification (Alpha Only)

### Quick Guide Verification for Alpha Launch

For the initial alpha launch, use this script to quickly verify your first 5-10 guides without waiting for the admin UI.

**Usage:**
```bash
node scripts/manualVerify.js <guide_email>
```

**Example:**
```bash
node scripts/manualVerify.js guide@example.com
```

**What it does:**
1. Finds the guide by email
2. Creates/updates verification record with status="verified"
3. Sets `User.verified = true` and `User.verification_status = 'verified'`
4. Adds entry to verification history
5. Guide immediately shows "Verified" badge on profile

**Important Notes:**
- Only works for users with `role: 'guide'`
- Cannot verify tourists or admins
- Safe to run multiple times (idempotent)
- Should be deleted after admin UI is proven during alpha

**Prerequisites:**
- MongoDB connection must be configured in `.env`
- Guide must already be registered with `role: 'guide'`

**After Alpha:**
Once the admin dashboard is working and tested, delete this script and use the web UI for all future verifications.

---

## Creating an Admin User

To create your first admin user, use MongoDB directly:

```javascript
// In MongoDB shell or Compass
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

Or create a similar script if needed.
