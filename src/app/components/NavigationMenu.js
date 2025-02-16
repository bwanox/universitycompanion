"use client";  // This line tells Next.js that this component should be rendered on the client side

import Link from 'next/link';
import React from 'react';
import '../styles/NavigationMenu.scss';

const NavigationMenu = () => {
  // When a link is clicked, set the checkbox to checked (which hides the menu via CSS)
  const handleLinkClick = () => {
    const toggle = document.getElementById('toggle');
    if (toggle) {
      toggle.checked = true;
    }
  };

  return (
    <div className="container">
      <input type="checkbox" id="toggle" defaultChecked />
      <label className="button" htmlFor="toggle">
        <nav className="nav">
          <ul>
            <li>
              <Link href="/" onClick={handleLinkClick}>
                <img
                  src="https://img.icons8.com/ios-filled/50/ffffff/home.png"
                  alt="Home"
                />
              </Link>
            </li>
            <li>
              <Link href="/pages/routine" onClick={handleLinkClick}>
                <img
                  src="https://img.icons8.com/ios-filled/50/ffffff/calendar.png"
                  alt="Routine"
                />
              </Link>
            </li>
            <li>
              <Link href="/pages/grades" onClick={handleLinkClick}>
                <img
                  src="https://img.icons8.com/ios-filled/50/ffffff/graduation-cap.png"
                  alt="Grades"
                />
              </Link>
            </li>
            <li>
              <Link href="/pages/assignments" onClick={handleLinkClick}>
                <img
                  src="https://img.icons8.com/ios-filled/50/ffffff/task.png"
                  alt="Assignments"
                />
              </Link>
            </li>
            <li>
              <Link href="/pages/profile" onClick={handleLinkClick}>
                <img
                  src="https://img.icons8.com/ios-filled/50/ffffff/user.png"
                  alt="Profile"
                />
              </Link>
            </li>
          </ul>
        </nav>
      </label>
    </div>
  );
};

export default NavigationMenu;
