# Tourmitra: Platform Overview & Architecture

## 1. What is Tourmitra?
Tourmitra is a modern, full-stack web platform designed to bridge the gap between enthusiastic tourists and knowledgeable local guides. It acts as a dual-sided marketplace and travel companion, providing tourists with rich destination exploration tools, AI-powered itinerary planning, and seamless guide booking, while empowering local experts to monetize their knowledge, manage customized tours, and build their professional reputation.

The platform is designed with a premium, glassmorphism UI aesthetic, emphasizing stunning visuals and smooth micro-animations to create an immersive pre-travel experience.

---

## 2. Core User Personas & Flows

### A. The Tourist (Explorer)
Tourists use the platform to discover the world and connect with locals who know it best.
*   **Discovery**: Browse destinations via the [ExplorePage](file:///d:/TM/src/pages/ExplorePage.jsx#13-270) with robust filtering (by region, budget, top-rated).
*   **Deep Dives**: View rich `DestinationDetailPages` complete with high-quality galleries, historical highlights, pricing estimates, and real-time lists of verified guides available in that specific area.
*   **AI Planning**: Access the [AITripPlannerPage](file:///d:/TM/src/pages/AITripPlannerPage.jsx#24-399) to generate custom day-by-day itineraries based on preferences (e.g., "3 days in Jaipur for a family of 4, focused on history").
*   **Booking**: Initiate the [BookingFlowPage](file:///d:/TM/src/pages/BookingFlowPage.jsx#6-275) from a guide's profile, selecting dates, trip types (half-day, full-day), and group sizes, culminating in a transparent pricing breakdown.
*   **Management**: Track upcoming and past trips via the [TouristDashboardPage](file:///d:/TM/src/pages/TouristDashboardPage.jsx#6-306).

### B. The Local Guide (Expert)
Guides use the platform to run their personal tour business.
*   **Onboarding**: Aspiring guides use the [ForGuidesPage](file:///d:/TM/src/pages/ForGuidesPage.jsx#5-276) to apply, leading to the [GuideOnboardingPage](file:///d:/TM/src/pages/GuideOnboardingPage.jsx#4-296) where they submit verification documents (Aadhaar/ID), set their custom pricing, languages, and specialties.
*   **Profile**: Guides have a public [GuideProfilePage](file:///d:/TM/src/pages/GuideProfilePage.jsx#13-410) showcasing their bio, verified badges, past tourist reviews, and active tours.
*   **Management**: The [GuideDashboardPage](file:///d:/TM/src/pages/GuideDashboardPage.jsx#5-308) provides a central hub to view incoming booking requests (accept/decline), track monthly earnings, and manage availability.

---

## 3. What Has Been Built So Far?

The application has been built from the ground up, transitioning from a static frontend mockup to a fully integrated, dynamic full-stack application.

### Frontend (React + Vite)
The front-end is complete and functional, featuring a responsive, highly animated UI using standard CSS and Framer Motion.
*   **Core Pages Developed**:
    *   [HomePage](file:///d:/TM/src/pages/HomePage.jsx#14-514): Hero section, popular destinations, top guides, and testimonials.
    *   [ExplorePage](file:///d:/TM/src/pages/ExplorePage.jsx#13-270): Advanced layout for browsing numerous destinations with active tag filtering.
    *   [DestinationDetailPage](file:///d:/TM/src/pages/DestinationDetailPage.jsx#13-415): Dynamic rendering of destination data, fetching associated guides and reviews from the backend.
    *   [GuideDiscoveryPage](file:///d:/TM/src/pages/GuideDiscoveryPage.jsx#13-226): Grid of available guides with search and filter capabilities.
    *   [GuideProfilePage](file:///d:/TM/src/pages/GuideProfilePage.jsx#13-410): Deep dive into a specific guide's offerings, reviews, and booking CTA.
    *   [BookingFlowPage](file:///d:/TM/src/pages/BookingFlowPage.jsx#6-275): Step-by-step form for creating booking requests with auto-calculated pricing based on the guide's daily rate.
    *   [AuthPage](file:///d:/TM/src/pages/AuthPage.jsx#7-403): Dual login/signup form with integrated Google OAuth support.
    *   `User Dashboards`: Custom dashboard views for both Tourists and Guides.
*   **Integration Status**: All static [mockData.js](file:///d:/TM/src/data/mockData.js) imports have been successfully replaced. All pages are connected to the live Node.js backend via the centralized [src/services/api.js](file:///d:/TM/src/services/api.js) service layer.

### Backend (Node.js + Express + MongoDB)
A robust, secure backend REST API has been built to support the frontend.
*   **Database Schema (Mongoose)**:
    *   [User.js](file:///d:/TM/backend/models/User.js): Handles both Tourist and Guide roles seamlessly in a single collection.
    *   [Destination.js](file:///d:/TM/backend/models/Destination.js): Stores rich destination metadata, galleries, and statistics.
    *   [Booking.js](file:///d:/TM/backend/models/Booking.js): Manages the state machine of tour requests (pending -> confirmed -> completed/cancelled).
    *   [Review.js](file:///d:/TM/backend/models/Review.js): Handles poly-morphic reviews tied to both destinations and specific guides.
*   **Authentication Flow**:
    *   Standard Email/Password signup with Bcrypt hashing.
    *   Full Google Sign-In integration using `@react-oauth/google` on the frontend and `google-auth-library` on the backend to verify ID tokens.
    *   JSON Web Token (JWT) based session management securely protecting private routes.
*   **API Routes**: Fully functional CRUD endpoints covering destinations, guide browsing, booking creation, review submission, and profile updates.

---

## 4. Technical Stack Summary

*   **Frontend**:
    *   React.js (via Vite) for rendering.
    *   React Router DOM for seamless client-side navigation.
    *   Framer Motion for complex layout animations and micro-interactions.
    *   Vanilla CSS (Variables, Flexbox, Grid) utilizing a custom glassmorphism design system.
*   **Backend**:
    *   Node.js runtime with Express framework.
    *   MongoDB as the primary NoSQL data store.
    *   Mongoose ODM for strict schema validation and query building.
*   **Security & Auth**:
    *   Bcryptjs for password hashing.
    *   JSON Web Tokens (JWT) for stateless authentication.
    *   Google OAuth 2.0 integration.

---

## 5. Current State of the Project

**Phase 4 (Frontend Integration) is Complete.**
The application is no longer a static prototype. It is a fully functional web application where data flows from the MongoDB Atlas cluster, through the Express API, and is dynamically rendered into the React UI components. Features like user authentication (including Google login), destination browsing, and guide profile viewing are fully operational end-to-end.

*(Next logical phases could involve deploying the application to production, finalizing the AI integration for the Trip Planner, or implementing a real payment gateway like Stripe or Razorpay for bookings.)*
