import React, { useState, useEffect, useRef } from 'react';
import { Navbar} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faChevronDown, faChevronUp} from '@fortawesome/free-solid-svg-icons';
import bob_logo_2 from '../../assets/new_bob_logo.png'
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetAllStates } from '../../store/index';
import authApi from '../../components/auth/services/auth.api';

const Header = ({ hideIcons, activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.user?.user?.data);
  const isProfileCompleted = user?.user?.isProfileCompleted;
  const canAccessJobs = Boolean(isProfileCompleted);

  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // const notifications = [
  //   { id: 1, message: "📢 Bank of Baroda posted a new opening.", time: "1h ago", read: true },
  //   { id: 2, message: "✅ Application submitted successfully.", time: "3h ago", read: true },
  // ];

  const getInitials = (fullName = "") => {
    if (!fullName.trim()) return "";
    const parts = fullName.trim().split(" ").filter(Boolean);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();   // Single word → first letter
    }
    // More than one word → take first letter of first two words
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      
      dispatch(resetAllStates());
      navigate("/login");
    } catch(e) {
      console.error("Logout failed:", e);
    }
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
      // if (notificationRef.current && !notificationRef.current.contains(e.target)) setShowNotification(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* TOP HEADER BAR */}
      <Navbar
        sticky="top"
        bg="warning"
        variant="light"
        expand="lg"
        className="py-2"
        style={{ zIndex: 1030, height: "64px" }}
      >
        <div className="container-fluid px-4">
          <Navbar.Brand className="fw-bold logobob">
            {/* <img src={logo_Bob} alt="BobApp Logo" className="me-2" /> */}
            <img src={bob_logo_2} style={{ width: '155px', height: '40px' }} alt="Bank of Baroda Logo" />
          </Navbar.Brand>

          {!hideIcons && (
            <div className="d-flex align-items-center">

              {/* Notifications */}
              {/* <Button
                variant="link"
                className="me-2 position-relative"
                style={{
                  backgroundColor: "white",
                  borderRadius: "20%",
                  width: "35px",
                  height: "35px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={() => setShowNotification((prev) => !prev)}
              >
                <FontAwesomeIcon icon={faBell} size="1x" style={{ color: "#42579f" }} />
              </Button> */}

              {/* Notification Popup */}
              {/* {showNotification && (
                <Card
                  ref={notificationRef}
                  className="position-absolute"
                  style={{
                    top: "60px",
                    right: "80px",
                    width: "350px",
                    maxHeight: "400px",
                    borderRadius: "10px",
                    boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
                    overflow: "hidden",
                  }}
                >
                  <Card.Header className="bg-white">
                    <h6 className="fw-bold mb-0">Notifications</h6>
                  </Card.Header>
                  <Card.Body className="p-0" style={{ maxHeight: "350px", overflowY: "auto" }}>
                    {notifications.map((note) => (
                      <div key={note.id} className="p-3 border-bottom">
                        <p className="mb-1">{note.message}</p>
                        <small className="text-muted">{note.time}</small>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              )} */}

              {/* USER ICON */}
              <div className="position-relative" ref={dropdownRef}>
                <div className='d-flex align-items-center gap-2' onClick={() => setShowDropdown((prev) => !prev)} style={{ cursor: 'pointer' }}>
                  <div
                    style={{
                      backgroundColor: "white",
                      borderRadius: "20%",
                      width: "35px",
                      height: "35px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    {/* <FontAwesomeIcon icon={faUser} size="1x" style={{ color: "orangered" }} /> */}
                    <p className='mb-0' style={{ fontSize: '0.875rem', fontWeight: 600, color: '#42579f' }}>{getInitials(user?.user?.name)}</p>
                  </div>
                  {showDropdown ? (
                    <div>
                      <p style={{ color: '#fff', marginTop: '0.75rem', fontWeight: 500, paddingLeft: '0.5rem' }}>{user?.user?.name} <FontAwesomeIcon icon={faChevronUp} style={{ paddingLeft: '0.5rem' }} /></p>
                    </div>
                  ) : (
                    <div>
                      <p style={{ color: '#fff', marginTop: '0.75rem', fontWeight: 500, paddingLeft: '0.5rem' }}>{user?.user?.name} <FontAwesomeIcon icon={faChevronDown} style={{ paddingLeft: '0.5rem' }} /></p>
                    </div>
                  )}
                </div>

                {showDropdown && (
                  <div className="position-absolute end-0 mt-2 p-2 bg-white border rounded shadow" style={{ minWidth: "200px" }}>
                    <p className="mb-1">{user?.user?.name}</p>
                    <p className="my-2 border-bottom text-muted">{user?.role}</p>
                    {/* <hr /> */}
                    <p
                      style={{ cursor: "pointer" }}
                      onClick={handleLogout}
                      className='mb-1'
                    >
                      Logout
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Navbar>

      {/* 👇 STICKY MENU BELOW HEADER */}
      {!hideIcons && (
        <div
          className="bg-white border-bottom"
          style={{ position: "sticky", top: "64px", zIndex: 1029 }}
        >
          <div className="container-fluid px-3 d-flex align-items-center">

            {/* HAMBURGER (MOBILE ONLY) */}
            <button
              className="btn d-lg-none"
              onClick={() => setShowMobileMenu(prev => !prev)}
            >
              ☰
            </button>

            {/* DESKTOP TABS */}
            <ul className="nav nav-tabs navbarupload d-none d-lg-flex">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'info' ? 'active' : ''}`}
                  onClick={() => setActiveTab('info')}
                >
                  My Profile
                </button>
              </li>

              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'jobs' ? 'active' : ''} ${!canAccessJobs ? 'disabled' : ''}`}
                  onClick={() => canAccessJobs && setActiveTab('jobs')}
                  style={{
                    cursor: canAccessJobs ? 'pointer' : 'not-allowed',
                    opacity: canAccessJobs ? 1 : 0.5
                  }}
                >
                  Current Opportunities
                </button>
              </li>

              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'applied-jobs' ? 'active' : ''} ${!canAccessJobs ? 'disabled' : ''}`}
                  onClick={() => canAccessJobs && setActiveTab('applied-jobs')}
                  style={{
                    cursor: canAccessJobs ? 'pointer' : 'not-allowed',
                    opacity: canAccessJobs ? 1 : 0.5
                  }}
                >
                  Applied Jobs
                </button>
              </li>
            </ul>
          </div>

          {/* MOBILE DROPDOWN MENU */}
          {showMobileMenu && (
            <ul className="nav flex-column d-lg-none border-top">
              {[
                { key: 'info', label: 'My Profile' },
                { key: 'jobs', label: 'Current Opportunities' },
                { key: 'applied-jobs', label: 'Applied Jobs' },
              ].map(tab => (
                <li key={tab.key} className="nav-item">
                  <button
                    className={`nav-link text-start w-100 ${activeTab === tab.key ? 'active' : ''} ${
                      !canAccessJobs && tab.key !== 'info' ? 'disabled' : ''
                    }`}
                    style={{
                      cursor: !canAccessJobs && tab.key !== 'info' ? 'not-allowed' : 'pointer',
                      opacity: !canAccessJobs && tab.key !== 'info' ? 0.5 : 1
                    }}
                    onClick={() => {
                      if (!canAccessJobs && tab.key !== 'info') return;
                      setActiveTab(tab.key);
                      setShowMobileMenu(false);
                    }}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
};

export default Header;
