import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Bell, MessageSquare, Settings, LogOut, User, Users, Briefcase, Shield, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { logout, fetchUserProfile } from "../redux/AuthSlice";

const Navbar = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.Auth.user);
  const isAuthenticated = !!user;
  const token = localStorage.getItem('authToken'); // Get token from localStorage

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const navigate = useNavigate();
  const location = useLocation(); // Add this line to get the current location

  // Fetch user profile from API
  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthenticated && user?.role === 'client' && token) {
        console.log("Attempting to fetch profile with token:", token);
        try {
          const response = await fetch(`http://localhost:5000/api/user-profile/${user._id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          setUserProfile(data.data.user);
          localStorage.setItem('userStatus', data.data.user.clientVerification.status); // Store profile in localStorage
        } catch (error) {
          console.error('Error fetching user profile:', error.message);
          // If the token is invalid, you might want to log the user out
          if (error.message.includes('401')) {
            console.log("Token seems to be invalid. Logging out.");
            handleLogout();
          }
        }
      }
    };

    fetchProfile();
  }, [isAuthenticated, user, token]);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      if (!target.closest(".profile-menu") && !target.closest(".profile-trigger")) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, isAuthenticated]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    console.log("logout is clicked")
    dispatch(logout());
    navigate('/');
    setIsProfileOpen(false);
  };

  // Navigation links based on user role
  const getNavLinks = () => {
    if (!isAuthenticated) {
      return [
        { name: "Home", href: "/" },
        { name: "About Us", href: "/about-us" },
        { name: "Find Talent", href: "/talent" },
        { name: "How It Works", href: "/how-it-works" },
      ];
    }

    switch (user?.role) {
      case "admin":
        return [
          { name: "Dashboard", href: "/admin" },
          { name: "Users", href: "/admin/users" },
          { name: "Verify Users", href: "/admin/verify-users" },
          { name: "Issues", href: "/admin/issues" },
          { name: "Reports", href: "/admin/reports" },
          { name: "Settings", href: "/admin/settings" },
        ];
      case "client":
        return [

          { name: "Find Job", href: "/jobs" },
          { name: "Post Job", href: "/company-member/post-job" },
          { name: "My Applications", href: "/company-member/my-applications" },
          { name: "Support", href: "/company-member/support" },
        ];
      case "freelancer":
        return [

          { name: "Find Job", href: "/jobs" },
          { name: "My Applications", href: "/member/my-proposals" },

          { name: "Support", href: "/member/support" },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  const getVerificationStatus = () => {
    if (!isAuthenticated || user?.role !== 'client' || !userProfile) {
      return null;
    }

    const clientVerification = userProfile.clientVerification || {};


    switch (clientVerification.status) {
      case 'not-verified':
        return {
          text: 'Verify Your Company',
          icon: <Shield size={16} className="mr-2 text-yellow-500" />,
          action: () => navigate('/client/verify-company')
        };
      case 'pending':
        return {
          text: 'Verification Pending',
          icon: <Clock size={16} className="mr-2 text-blue-500" />
        };
      case 'verified':
        return {
          text: 'Company Verified',
          icon: <CheckCircle size={16} className="mr-2 text-green-500" />
        };
      case 'rejected':
        return {
          text: 'Verification Rejected',
          icon: <AlertCircle size={16} className="mr-2 text-red-500" />,
          action: () => navigate('/verify-company')
        };
      default:
        return null;
    }
  };

  const verificationStatus = getVerificationStatus();

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b border-slate-200 transition-all duration-200 ${isScrolled ? "bg-white/95 backdrop-blur" : "bg-white"
        }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">

          <span className="text-xl font-bold text-[#12a1e2]">Membership Benefits</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link, index) => (
            <Link
              key={index}
              to={link.href}
              className={`text-sm font-medium transition-colors ${location.pathname === link.href
                ? "text-[#12a1e2]" // Highlighted state
                : "text-slate-900 hover:text-[#12a1e2]" // Normal state
                }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons or User Profile */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* Notification Icon - Only for logged in users */}
              {/* <button className="relative text-slate-900 hover:text-[#12a1e2] transition-colors">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#12a1e2] text-[10px] text-slate-900">
                  3
                </span>
              </button> */}

              {/* Messages Icon - Only for logged in users */}

              {/* User Profile Dropdown */}
              <div className="relative">
                <button onClick={toggleProfile} className="profile-trigger flex items-center gap-2 focus:outline-none">
                  <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-[#12a1e2]">
                    <img
                      src={

                        "https://cdn-icons-png.freepik.com/256/12225/12225828.png?ga=GA1.1.929895557.1769420934&semt=ais_white_label"}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-slate-900">{user?.name}</span>
                  <ChevronDown size={16} className="text-slate-900" />
                </button>

                {isProfileOpen && (
                  <div className="profile-menu absolute right-0 mt-2 w-56 rounded-md bg-white border border-slate-200 shadow-lg py-1 z-50">
                    <div className="px-4 py-3 border-b border-slate-200">
                      <p className="text-sm text-slate-900">{userProfile?.name || user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{userProfile?.email || user?.email}</p>

                    </div>
                    {/* Role switcher for demo purposes */}
                    <div className=" border-slate-200 mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-slate-900 hover:bg-slate-100 transition-colors"
                      >
                        <LogOut size={16} className="mr-2" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-900 hover:text-[#12a1e2] transition-colors">
                Log in
              </Link>
              <Link
                to="/signup"
                className="rounded-md bg-[#12a1e2] px-4 py-2 text-sm font-medium text-white hover:bg-[#0e8cd4] transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}

          {/* Mobile menu button */}
          <button onClick={toggleMenu} className="md:hidden text-slate-900 hover:text-[#12a1e2] transition-colors">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link, index) => (
              <Link
                key={index}
                to={link.href}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${location.pathname === link.href
                  ? "bg-slate-100 text-[#12a1e2]" // Highlighted state
                  : "text-slate-900 hover:bg-slate-100" // Normal state
                  }`}
                onClick={closeMenu}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;