# 🗺️ Itineraries Marketplace Feature

## Feature Overview

**Separate from AI Trip Planner** - This is a marketplace where real guides and experienced travelers can create, share, and sell detailed itineraries with maps that other travelers can purchase.

---

## 🎯 Key Concepts

### 1. **AI Trip Planner** (Existing)
- AI generates personalized trip plans
- Free feature for users
- Located at `/plan` route

### 2. **Itineraries Marketplace** (NEW)
- Real people create detailed day-by-day itineraries
- Include route maps (uploaded images)
- Travelers purchase for a small fee (₹49-₹499)
- Creators earn 85% (platform takes 15%)

---

## 🏗️ Backend Implementation

### Models Created

#### **Itinerary Model**
```javascript
{
  title: String,
  creator: User (ref),
  destination: Destination (ref),
  
  // Basic
  duration: Number (days),
  difficulty: 'easy' | 'moderate' | 'challenging',
  category: 'Heritage' | 'Adventure' | etc.,
  description: String,
  highlights: [String],
  
  // Pricing
  price: Number (to purchase itinerary),
  estimatedTripCost: Number (total cost to follow it),
  
  // Map & Route
  coverImage: String,
  routeMapUrl: String (uploaded map image),
  mapData: {
    center: { lat, lng },
    markers: [{ name, lat, lng, day }]
  },
  
  // Day-by-day breakdown
  days: [{
    day: Number,
    title: String,
    activities: [{
      time, activity, location,
      coordinates: { lat, lng },
      duration, cost, notes
    }],
    meals: [{ type, restaurant, cost }],
    accommodation: { name, cost }
  }],
  
  // Engagement
  rating: Number,
  purchaseCount: Number,
  viewCount: Number,
  
  // Status
  status: 'draft' | 'published' | 'archived',
  isVerified: Boolean (admin approved),
  isFeatured: Boolean
}
```

#### **ItineraryPurchase Model**
```javascript
{
  itinerary: Itinerary (ref),
  buyer: User (ref),
  amount: Number,
  platformFee: Number (15%),
  creatorEarning: Number (85%),
  paymentStatus: 'pending' | 'completed' | 'refunded',
  accessGranted: Boolean,
  
  // Review
  rating: Number,
  review: String,
  wasHelpful: Boolean
}
```

---

## 🚀 API Endpoints

### Public Endpoints
```
GET  /api/itineraries              # Browse all published
GET  /api/itineraries/:id          # View single (preview if not purchased)
GET  /api/itineraries/:id/reviews  # Get reviews
```

### Private Endpoints (User)
```
GET  /api/itineraries/my           # My created itineraries
GET  /api/itineraries/purchased    # My purchased itineraries
POST /api/itineraries              # Create new
PUT  /api/itineraries/:id          # Update (owner only)
PUT  /api/itineraries/:id/publish  # Publish itinerary
DELETE /api/itineraries/:id        # Delete (owner only)
POST /api/itineraries/:id/purchase # Purchase itinerary (TEST MODE)
POST /api/itineraries/:id/review   # Leave review (if purchased)
```

---

## 💡 How It Works

### For Creators (Guides/Travelers)

1. **Create Itinerary**
   - Title: "5-Day Agra Heritage Circuit"
   - Duration: 5 days
   - Price: ₹299
   - Estimated trip cost: ₹15,000

2. **Add Details**
   - Day-by-day breakdown
   - Activity timings with GPS coordinates
   - Restaurant recommendations
   - Accommodation suggestions
   - Packing list
   - Travel tips

3. **Upload Route Map**
   - Upload image showing the route
   - Or add GPS markers for automatic map generation

4. **Publish**
   - Status changes from 'draft' to 'published'
   - Visible in marketplace

5. **Earn Money**
   - Get 85% of each purchase
   - Example: ₹299 itinerary = ₹254 to creator, ₹45 to platform

### For Buyers (Tourists)

1. **Browse Marketplace**
   - Filter by destination, duration, price, category
   - See creator ratings and purchase count
   - Preview first day only

2. **Purchase Itinerary**
   - Pay small fee (₹49-₹499)
   - Get full access to all days
   - Download/save for offline use

3. **Follow the Plan**
   - Day-by-day activities with timings
   - GPS locations for each stop
   - Restaurant and hotel recommendations
   - Budgeting guidance

4. **Leave Review**
   - Rate the itinerary
   - Mark as "helpful" or not
   - Write review for future buyers

---

##🔒 Access Control

### Preview Mode (Not Purchased)
- See only Day 1 (first 2 activities)
- Cover image and basic details visible
- Map is blurred/hidden
- Cannot see GPS coordinates

### Full Access (Purchased or Owner)
- All days unlocked
- Full activity details with GPS
- Download map
- Save for offline use

---

## 💰 Pricing Strategy

| Type | Price Range | Use Case |
|------|-------------|----------|
| **Quick Guide** | ₹49-₹99 | Half-day or single-day plans |
| **Weekend Trip** | ₹99-₹199 | 2-3 day itineraries |
| **Week Long** | ₹199-₹399 | 5-7 day detailed plans |
| **Epic Journey** | ₹399-₹999 | 10+ days, multi-city |

**Platform Revenue:** 15% of each sale

---

## 🎨 Frontend Pages (To Be Created)

### 1. **Itineraries Marketplace** (`/itineraries`)
- Browse all published itineraries
- Filter: destination, days, price, category
- Sort: popular, recent, highest rated
- Grid/List view with cover images

### 2. **Itinerary Detail** (`/itineraries/:id`)
- Cover image, title, creator info
- Overview: duration, difficulty, highlights
- Price and purchase button
- Day-by-day preview (Day 1 only if not purchased)
- Reviews section
- Similar itineraries

### 3. **Create/Edit Itinerary** (`/itineraries/create`, `/itineraries/:id/edit`)
- Multi-step form:
  - Step 1: Basic Info (title, destination, duration, price)
  - Step 2: Overview (description, highlights, what's included)
  - Step 3: Day-by-day breakdown (activities, timing, locations)
  - Step 4: Upload map image & set markers
  - Step 5: Review & Publish
- Save as draft functionality
- Image upload for route map

### 4. **My Itineraries** (`/dashboard/itineraries`)
- Created itineraries (draft/published)
- Edit/Delete/Analytics
- Earnings from sales

### 5. **Purchased Itineraries** (`/dashboard/purchased`)
- List of purchased itineraries
- Quick access to full details
- Download/Print options
- Leave reviews

---

## 📊 Example Itinerary Structure

```javascript
{
  "title": "Taj Mahal Sunrise & Agra Fort Explorer",
  "creator": "64f2a...",
  "destination": "64e1b...",
  "duration": 2,
  "difficulty": "easy",
  "category": "Heritage",
  "price": 149,
  "estimatedTripCost": 3500,
  "coverImage": "https://...",
  "routeMapUrl": "https://...",
  
  "days": [
    {
      "day": 1,
      "title": "Taj Mahal at Sunrise & Agra Fort",
      "activities": [
        {
          "time": "05:30 AM",
          "activity": "Taj Mahal Sunrise Tour",
          "location": "Taj Mahal, Agra",
          "coordinates": { "lat": 27.1751, "lng": 78.0421 },
          "duration": "3 hours",
          "cost": 1050,
          "notes": "Book tickets online to skip queue"
        },
        {
          "time": "09:00 AM",
          "activity": "Breakfast at Joney's Place",
          "location": "Taj Ganj",
          "coordinates": { "lat": 27.1742, "lng": 78.0425 },
          "duration": "1 hour",
          "cost": 300
        }
      ],
      "meals": [
        { "type": "breakfast", "restaurant": "Joney's Place", "estimatedCost": 300 }
      ]
    },
    {
      "day": 2,
      "title": "Fatehpur Sikri & Local Markets",
      "activities": [ ... ]
    }
  ],
  
  "highlights": [
    "Taj Mahal sunrise photography spots",
    "Secret Agra Fort chambers",
    "Best local food joints",
    "Marble craft workshops"
  ],
  
  "included": [
    "Detailed day-by-day plan",
    "GPS coordinates for all locations",
    "Restaurant recommendations",
    "Budget breakdown",
    "Packing list",
    "Local transport tips"
  ],
  
  "packingList": [
    "Comfortable walking shoes",
    "Sunscreen & sunglasses",
    "Camera with extra battery",
    "Light jacket for early morning"
  ],
  
  "travelTips": [
    "Book Taj tickets online to save 2+ hours",
    "Hire guide at Agra Fort for ₹500 (worth it)",
    "Avoid touts near Taj entrance",
    "Best season: October to March"
  ]
}
```

---

## ✅ Backend Status

✅ Models created (`Itinerary`, `ItineraryPurchase`)  
✅ All API routes implemented  
✅ Access control (preview vs full access)  
✅ Purchase logic with platform fee (TEST MODE)  
✅ Review system  
✅ Creator earnings tracking  

---

## 🚧 Frontend Status

❌ Not implemented yet  
❌ Need to create 5 pages (see above)  
❌ Map upload functionality  
❌ Day-by-day builder interface  

---

## 🎯 Next Steps

1. **Create Frontend Pages:**
   - `/itineraries` - Marketplace browse page
   - `/itineraries/:id` - Detail page with purchase
   - `/itineraries/create` - Multi-step creator form
   - Add tabs to Tourist/Guide dashboards

2. **Map Integration:**
   - Image upload for route maps
   - GPS marker placement UI
   - Or integrate Google Maps API for live maps

3. **Search & Filters:**
   - Advanced filtering
   - Search by keywords
   - Sort options

4. **Analytics Dashboard:**
   - Creator can see views, purchases
   - Earnings breakdown
   - Popular itineraries

---

## 💡 Unique Selling Points

1. **Real Experience** - Created by people who've actually done the trip
2. **Detailed Planning** - Hour-by-hour breakdown, not just highlights
3. **Local Insights** - Hidden gems, budget tips, practical advice
4. **GPS Coordinates** - Exact locations, no getting lost
5. **Affordable** - ₹49-₹499 vs. hiring a planner for ₹5000+
6. **Support Creators** - 85% goes to the person who made it

---

## 📈 Revenue Potential

**Example:** 
- 100 itineraries @ avg ₹200 each
- Each sells 50 times/year
- Total: 100 × 50 × ₹200 = ₹10,00,000
- Platform (15%): ₹1,50,000
- Creators (85%): ₹8,50,000

---

**Backend Ready ✅ | Frontend Pending 🚧**
