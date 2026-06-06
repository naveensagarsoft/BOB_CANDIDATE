import React from 'react';
import { Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faFileAlt,
  faBriefcase,
  faUserFriends,
  faCalendarAlt,
  faFileInvoiceDollar,
  faCog,
  faQuestionCircle,
} from '@fortawesome/free-solid-svg-icons';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { icon: faHome, text: 'Overview', path: '/overview' },
    { icon: faFileAlt, text: 'Job Creation', path: '/job-creation' },
    { icon: faBriefcase, text: 'Job Postings', path: '/job-postings' },
    { icon: faUserFriends, text: 'Candidate Shortlist', path: '/candidates' },
    { icon: faUserFriends, text: 'IBPS Integration', path: '/ibps' },
    { icon: faCalendarAlt, text: 'Schedule Interview', path: '/interviews' },
    { icon: faFileInvoiceDollar, text: 'Roll Offer', path: '/offers' },
    { icon: faFileInvoiceDollar, text: 'Payments', path: '/payments' },
    { icon: faCog, text: 'Relaxation Policy', path: '/policy' },
  ];

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div
      className="sidebar d-flex flex-column align-items-center bg-white pt-3"
      style={{ width: '99px', borderRight: '1px solid #dee2e6', height: '100vh' }}
    >
      <Nav className="flex-column text-center w-100">
        {menuItems.map((item, index) => (
          <Nav.Link
            key={index}
            as={Link}
            to={item.path}
            className={`d-flex flex-column align-items-center justify-content-center py-3 nav-item-custom ${isActive(item.path)}`}
            style={{
              color: isActive(item.path) ? '#FF4D00' : '#6c757d',
              backgroundColor: isActive(item.path) ? '#FFF' : 'transparent',
              fontWeight: isActive(item.path) ? '600' : '400',
              fontSize: '0.75rem',
              textDecoration: 'none',
              height: '60px',
            }}
          >
            <FontAwesomeIcon icon={item.icon} style={{ fontSize: '0.8rem' }} />
            <span className="mt-1">{item.text}</span>
          </Nav.Link>
        ))}
      </Nav>

      {/* Bottom Help section */}
      <div className="mt-auto mb-3 w-100">
        <Nav.Link
          as={Link}
          to="/help"
          className="d-flex flex-column align-items-center justify-content-center py-3"
          style={{
            color: '#6c757d',
            fontSize: '0.75rem',
            textDecoration: 'none',
            height: '70px',
          }}
        >
          <FontAwesomeIcon icon={faQuestionCircle} style={{ fontSize: '0.8rem' }} />
          <span className="mt-1">Help</span>
        </Nav.Link>
      </div>
    </div>
  );
};

export default Sidebar;
