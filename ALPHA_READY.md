# 🎉 Tourmitra Alpha - Ready for Testing

## ✅ Alpha Setup Complete

**Database:** Cleared and reset with alpha configuration  
**Destinations:** Only Agra active, others showing "Coming Soon"  
**Users:** Zero guides, zero tourists (fresh start)  
**Admin:** admin@tourmitra.com / admin123

---

## 🚀 What's Working

### Core Features
- ✅ **User Authentication** - Sign up as Tourist or Guide
- ✅ **Destination Browsing** - Agra active, others "Coming Soon"
- ✅ **Guide Profiles** - Create profile with real photo required
- ✅ **Package System** - Guides create 2hr/4hr/8hr packages
- ✅ **Booking Flow** - Complete flow (TEST MODE, no payment)
- ✅ **Request System** - Tourist requests → Guide accepts/declines
- ✅ **Dashboards** - Tourist, Guide, and Admin dashboards
- ✅ **Verification** - Admin approves guide verifications
- ✅ **Earnings Tracking** - Ledger with 15% platform fee (test mode)
- ✅ **Reviews** - Tourists can leave reviews after trips
- ✅ **404 Page** - Invalid routes redirect properly

### Alpha Restrictions
- 🔒 **Payment:** TEST MODE - Booking flow visible, no actual payment
- 🔒 **Destinations:** Only Agra active for guide onboarding
- 🔒 **Sample Data:** All cleared - real guides only

---

## 📍 Active Destinations

| Destination | Status | Description |
|-------------|---------|-------------|
| **Agra** | ✅ ACTIVE | Home of the Taj Mahal - Ready for guides! |
| Jaipur | 🔜 Coming Soon | Launching soon with heritage storytellers |
| Varanasi | 🔜 Coming Soon | Spiritual guides onboarding |
| Goa | 🔜 Coming Soon | Beach season coming |
| Kerala | 🔜 Coming Soon | Backwaters and wellness guides |
| Ladakh | 🔜 Coming Soon | Summer 2027 launch |
| Udaipur | 🔜 Coming Soon | Royal heritage awaits |
| Delhi | 🔜 Coming Soon | Food and heritage walks |

---

## 🧪 Test Flows

### Flow 1: Guide Onboarding (Agra)
1. Sign up as Guide role
2. Complete onboarding form:
   - Personal info
   - Upload documents (Aadhaar, PAN, photo, etc.)
   - Select specialties (Heritage, Photography, etc.)
   - Configure 3 default packages with pricing
3. Submit for verification
4. **As Admin:** Go to `/admin/dashboard` → Approve verification
5. Guide status changes to "verified" ✅
6. Packages are now visible on guide profile

### Flow 2: Tourist Booking
1. Sign up as Tourist
2. Browse `/explore` → Click Agra (only active destination)
3. View `/destination/:id` → See Agra details
4. Click `/guides` → Browse verified Agra guides
5. Click guide profile → View packages
6. Click "Book Now" on a package
7. **Booking Flow:**
   - Step 1: Select date, time slot, number of guests
   - Step 2: See server-calculated quote with breakdown
   - Step 3: See payment options (TEST MODE banner)
   - Step 4: Submit request (no actual payment)
8. Check `/dashboard` → See "Pending" booking

### Flow 3: Guide Accepts Booking
1. Login as Guide
2. Go to `/guide/dashboard`
3. See "Pending Requests" tab
4. Click "Accept" on booking
5. Slot gets confirmed atomically
6. Tourist sees status change to "Confirmed"

### Flow 4: Cancel & Earnings
1. **As Tourist:** Cancel booking (policy applies)
2. **As Guide:** View earnings in "Earnings" tab
3. See ledger breakdown with platform fee

---

## 🔑 Test Credentials

```
Admin:
Email: admin@tourmitra.com
Password: admin123

(No test users - create fresh accounts)
```

---

## 🛠️ Running Locally

```bash
# Backend (Terminal 1)
cd backend
npm start
# Running on http://localhost:5000

# Frontend (Terminal 2)
cd frontend
npm run dev
# Running on http://localhost:5173
```

**Frontend:** http://localhost:5173  
**Backend:** http://localhost:5000  
**Admin Dashboard:** http://localhost:5173/admin/dashboard

---

## 📋 Alpha Test Checklist

- [ ] Sign up as Guide (Agra location)
- [ ] Complete onboarding with real photo
- [ ] Admin approves verification
- [ ] Create custom packages
- [ ] Sign up as Tourist
- [ ] Browse Agra destination
- [ ] View guide profile with packages
- [ ] Complete booking flow (see TEST MODE)
- [ ] Guide accepts booking request
- [ ] Tourist views confirmed booking
- [ ] Test cancellation policy
- [ ] Guide views earnings ledger
- [ ] Test "Coming Soon" destinations (non-clickable)
- [ ] Test invalid routes (404 page)

---

## 🚨 Known Limitations (Alpha)

1. **Payment:** TEST MODE only - no real transactions
2. **Locations:** Only Agra active
3. **Sample Data:** Cleared - need real guide signups
4. **Notifications:** Bell icon placeholder only
5. **Photo Upload:** Simulated (not actual file upload yet)
6. **DigiLocker:** Manual verification only
7. **Live Chat:** Not implemented
8. **Email/SMS:** Not configured

---

## 📊 Database State

```
✅ All collections cleared
✅ 8 destinations created (1 active, 7 coming soon)
✅ 1 admin user created
✅ 0 guides (ready for onboarding)
✅ 0 tourists (ready for signups)
✅ 0 bookings (fresh start)
```

---

## 🎯 Next Steps for Beta

1. **Payment Integration** - Razorpay/Stripe for live payments
2. **Photo Upload** - Real Cloudinary/S3 integration
3. **Email/SMS** - SendGrid + Twilio notifications
4. **More Cities** - Enable Jaipur, Varanasi, etc.
5. **DigiLocker** - Automated ID verification
6. **Live Chat** - Tourist ↔ Guide messaging
7. **Mobile App** - React Native version

---

## 🐛 Report Issues

Found a bug? Note these details:
- What were you trying to do?
- What happened instead?
- User role (Tourist/Guide/Admin)
- Browser console errors (F12)
- Screenshot if UI issue

---

**Alpha Version:** 1.0.0  
**Last Updated:** October 25, 2026  
**Database:** MongoDB Atlas (Cleared for Alpha)  
**Mode:** TEST MODE (No real payments)

🚀 Ready to test!
