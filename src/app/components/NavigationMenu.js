"use client";

import Link from 'next/link';
import React, { useState } from 'react';
import '../styles/NavigationMenu.scss';

const NavigationMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="nav-menu-container">
      {/* Hamburger Button */}
      <button 
        className={`hamburger-button ${isOpen ? 'open' : ''}`}
        onClick={toggleMenu}
        aria-label="Navigation Menu"
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="menu-overlay" onClick={toggleMenu}></div>
      )}

      {/* Side Menu */}
      <nav className={`side-menu ${isOpen ? 'open' : ''}`}>
        <div className="menu-header">
          <h2 className="menu-title">Menu</h2>
          <button className="close-button" onClick={toggleMenu}>
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <ul className="menu-list">
          <li className="menu-item">
            <Link href="/" onClick={handleLinkClick} className="menu-link home-link">
              <div className="menu-icon">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
              </div>
              <span className="menu-text">Home</span>
            </Link>
          </li>
          <li className="menu-item">
            <Link href="/pages/routine" onClick={handleLinkClick} className="menu-link routine-link">
              <div className="menu-icon">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2v-6H3v6a2 2 0 002 2z"/>
                </svg>
              </div>
              <span className="menu-text">My Space</span>
            </Link>
          </li>
          <li className="menu-item">
            <Link href="/pages/assignments" onClick={handleLinkClick} className="menu-link assignments-link">
              <div className="menu-icon">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6M9 8h6M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z"/>
                </svg>
              </div>
              <span className="menu-text">Assignments</span>
            </Link>
          </li>
          <li className="menu-item">
            <Link href="/pages/grades" onClick={handleLinkClick} className="menu-link grades-link">
              <div className="menu-icon">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l9-5-9-5-9 5 9 5z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l6.16-3.422A12.083 12.083 0 0112 21.5 12.083 12.083 0 015.84 10.578L12 14z"/>
                </svg>
              </div>
              <span className="menu-text">Grades</span>
            </Link>
          </li>
          <li className="menu-item">
            <Link href="/pages/profile" onClick={handleLinkClick} className="menu-link profile-link">
              <div className="menu-icon">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <span className="menu-text">Profile</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default NavigationMenu;
