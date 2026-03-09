import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Route guard component.
 *
 * Props:
 *  - children   : The page element to render
 *  - role       : 'tourist' | 'guide' — restrict to this role only (requires login)
 *  - denyRole   : 'tourist' | 'guide' — block this specific role (allows non-logged-in)
 *  - requireAuth: boolean (default true when role is set) — must be logged in
 *  - redirect   : where to send unauthorized users (default context-dependent)
 */
const ProtectedRoute = ({ children, role, denyRole, requireAuth, redirect }) => {
  const { user, loading } = useAuth();

  // Still checking auth — show nothing (Suspense loader covers this)
  if (loading) return null;

  // Explicit role requirement — must be logged in with that role
  if (role) {
    if (!user) {
      return <Navigate to={redirect || '/login'} replace />;
    }
    if (user.role !== role) {
      const fallback = user.role === 'guide' ? '/guide/dashboard' : '/explore';
      return <Navigate to={redirect || fallback} replace />;
    }
    return children;
  }

  // Deny a specific role (but allow everyone else, including not-logged-in)
  if (denyRole && user && user.role === denyRole) {
    const fallback = user.role === 'guide' ? '/guide/dashboard' : '/explore';
    return <Navigate to={redirect || fallback} replace />;
  }

  // requireAuth only (no role check)
  if (requireAuth && !user) {
    return <Navigate to={redirect || '/login'} replace />;
  }

  return children;
};

export default ProtectedRoute;
