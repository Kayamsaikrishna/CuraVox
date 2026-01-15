import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SkipNavigation from '../common/SkipNavigation';
import VoiceFeedbackToggle from '../accessibility/VoiceFeedbackToggle';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Simplified navigation (includes main app sections for easy top-level access)
  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Scan Medicine', href: '/scan' },
    { name: 'My Medicines', href: '/medicines' },
    { name: 'Medication Reminders', href: '/reminders' },
    { name: 'Games', href: '/games' },
    { name: 'Profile', href: '/profile' },
    { name: 'Settings', href: '/settings' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Skip link for keyboard users */}
      <SkipNavigation />

      {/* Accessible header / banner */}
      <header role="banner" aria-label="Site header" style={{
        backgroundColor: '#0f172a',
        padding: '18px 12px',
        color: 'white'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700 }}>MediAssist</h1>
            <p style={{ margin: 0, color: '#c7d2fe', fontSize: '14px' }} aria-hidden="true">— Accessible Medical Assistant</p>
          </div>

          <nav aria-label="Main navigation" role="navigation">
            <ul style={{
              display: 'flex',
              listStyle: 'none',
              margin: 0,
              padding: 0,
              gap: '14px',
              alignItems: 'center'
            }}>
              {navigation.map((item) => (
                <li key={item.name} role="none">
                  <Link 
                    to={item.href} 
                    role="menuitem"
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    style={{ 
                      color: 'white', 
                      textDecoration: 'none',
                      fontWeight: isActive(item.href) ? '700' : '500',
                      fontSize: '16px',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      outline: 'none'
                    }}
                    tabIndex={0}
                    onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.25)'}
                    onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                    aria-label={item.name}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}

              <li role="none">
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '8px' }}>
                  {/* Voice feedback toggle placed in header for quick access */}
                  <div aria-hidden={false}>
                    <VoiceFeedbackToggle />
                  </div>

                  {/* Quick link to accessibility settings */}
                  <Link to={'/settings'} aria-label="Accessibility settings" style={{
                    color: '#0f172a',
                    backgroundColor: '#f8fafc',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 600
                  }}>
                    Accessibility
                  </Link>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main id="main-content" role="main" tabIndex={-1} style={{ 
        padding: '28px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;