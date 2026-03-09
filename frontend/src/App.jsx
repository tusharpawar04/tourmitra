import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SunsetBackground from './components/SunsetBackground';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load all pages for faster initial load
const HomePage = lazy(() => import('./pages/HomePage'));
const ExplorePage = lazy(() => import('./pages/ExplorePage'));
const DestinationDetailPage = lazy(() => import('./pages/DestinationDetailPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const GuideDiscoveryPage = lazy(() => import('./pages/GuideDiscoveryPage'));
const GuideProfilePage = lazy(() => import('./pages/GuideProfilePage'));
const ForGuidesPage = lazy(() => import('./pages/ForGuidesPage'));
const AITripPlannerPage = lazy(() => import('./pages/AITripPlannerPage'));
const TouristDashboardPage = lazy(() => import('./pages/TouristDashboardPage'));
const BookingFlowPage = lazy(() => import('./pages/BookingFlowPage'));
const GuideOnboardingPage = lazy(() => import('./pages/GuideOnboardingPage'));
const GuideDashboardPage = lazy(() => import('./pages/GuideDashboardPage'));

// Minimal loading spinner
const PageLoader = () => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '60vh', zIndex: 10, position: 'relative',
  }}>
    <div style={{
      width: '40px', height: '40px', borderRadius: '50%',
      border: '3px solid rgba(245, 166, 35, 0.15)',
      borderTopColor: 'var(--burnt-orange)',
      animation: 'spin 0.7s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

function App() {
  return (
    <Router>
      {/* Sunset SVG — always behind everything */}
      <SunsetBackground />

      {/* Navbar — always visible */}
      <Navbar />

      {/* Page routes — lazy loaded */}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/destination/:id" element={<DestinationDetailPage />} />
          <Route path="/guides" element={<GuideDiscoveryPage />} />
          <Route path="/guides/:id" element={<GuideProfilePage />} />
          <Route path="/for-guides" element={
            <ProtectedRoute denyRole="tourist" redirect="/explore">
              <ForGuidesPage />
            </ProtectedRoute>
          } />
          <Route path="/plan" element={
            <ProtectedRoute role="tourist">
              <AITripPlannerPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute role="tourist">
              <TouristDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/book/:id" element={
            <ProtectedRoute requireAuth>
              <BookingFlowPage />
            </ProtectedRoute>
          } />
          <Route path="/guide/onboard" element={
            <ProtectedRoute role="guide">
              <GuideOnboardingPage />
            </ProtectedRoute>
          } />
          <Route path="/guide/dashboard" element={
            <ProtectedRoute role="guide">
              <GuideDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
        </Routes>
      </Suspense>

      {/* Footer — always visible */}
      <Footer />
    </Router>
  );
}

export default App;
