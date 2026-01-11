import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthenticateProvider";

function AuthProtected({ children }) {

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // If user is authenticated and trying to access auth routes, redirect to home
  if (isAuthenticated && (location.pathname.includes('/auth/') || location.pathname.includes('/signup') || location.pathname.includes('/login'))) {
    navigate("/");
    return null;
  }
  
  // If user is not authenticated, allow access to auth routes
  if (!isAuthenticated) {
    return (
        <>
        {children}
        <Outlet/>
        </>
    );
  } else {
    // User is authenticated but not on auth route, don't render anything
    return null;
  }
}

export default AuthProtected;
