import React from 'react';
import { Link } from 'react-router-dom';
import useAccessibility from '../hooks/useAccessibility';

const NotFoundPage = () => {
  const { speak } = useAccessibility();

  const handleGoHome = () => {
    speak('Navigating to home page');
  };

  return (
    <div style={{ 
      backgroundColor: '#f0f9ff', 
      minHeight: '100vh', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      lineHeight: '1.6'
    }}>
      {/* Screen reader announcement area */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        style={{ 
          position: 'absolute', 
          left: '-10000px', 
          width: '1px', 
          height: '1px', 
          overflow: 'hidden' 
        }}
      >
        Page not found
      </div>

      <div style={{ 
        maxWidth: '1000px', 
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '30px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '2px solid #3b82f6'
      }}>
        <header style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 
            style={{ 
              fontSize: '28px', 
              fontWeight: 'bold', 
              color: '#1e40af',
              marginBottom: '10px',
              borderBottom: '3px solid #3b82f6',
              paddingBottom: '10px'
            }}
            tabIndex="0"
          >
            Page Not Found
          </h1>
          <p 
            style={{ 
              fontSize: '16px', 
              color: '#4b5563',
              fontStyle: 'italic'
            }}
            tabIndex="0"
          >
            The page you're looking for doesn't exist
          </p>
        </header>

        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          backgroundColor: '#f9fafb', 
          border: '2px dashed #d1d5db',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <div style={{ fontSize: '48px', color: '#3b82f6', marginBottom: '20px' }}>🔍</div>
          <div style={{ fontSize: '24px', color: '#374151', marginBottom: '15px' }}>404 Error</div>
          <div style={{ color: '#6b7280', marginBottom: '25px' }}>
            We couldn't find the page you're looking for. It might have been moved or deleted.
          </div>
          <Link
            to="/home"
            onClick={handleGoHome}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: '2px solid #2563eb',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '16px',
              display: 'inline-block'
            }}
            tabIndex="0"
          >
            Go to Home Page
          </Link>
        </div>

        {/* Helpful Links Section */}
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#e0f2fe', 
          border: '2px solid #0ea5e9',
          borderRadius: '8px' 
        }}>
          <h2 
            style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#0284c7',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center'
            }}
            tabIndex="0"
          >
            <span style={{ fontSize: '24px', marginRight: '10px' }}>ℹ️</span>
            Helpful Links
          </h2>
          <ul style={{ 
            color: '#0284c7',
            paddingLeft: '20px',
            fontSize: '14px'
          }}>
            <li style={{ marginBottom: '8px' }} tabIndex="0">
              <Link 
                to="/home" 
                onClick={handleGoHome}
                style={{ color: '#0284c7', textDecoration: 'underline' }}
                tabIndex="0"
              >
                Home Page
              </Link>
            </li>
            <li style={{ marginBottom: '8px' }} tabIndex="0">
              <Link 
                to="/medicines" 
                style={{ color: '#0284c7', textDecoration: 'underline' }}
                tabIndex="0"
              >
                My Medicines
              </Link>
            </li>
            <li style={{ marginBottom: '8px' }} tabIndex="0">
              <Link 
                to="/reminders" 
                style={{ color: '#0284c7', textDecoration: 'underline' }}
                tabIndex="0"
              >
                Medication Reminders
              </Link>
            </li>
            <li style={{ marginBottom: '8px' }} tabIndex="0">
              <Link 
                to="/settings" 
                style={{ color: '#0284c7', textDecoration: 'underline' }}
                tabIndex="0"
              >
                Settings
              </Link>
            </li>
            <li tabIndex="0">
              <Link 
                to="/profile" 
                style={{ color: '#0284c7', textDecoration: 'underline' }}
                tabIndex="0"
              >
                Profile
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;