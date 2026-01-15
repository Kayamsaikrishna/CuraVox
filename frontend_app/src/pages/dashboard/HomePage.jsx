import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../../contexts/AppDataContext';
import useAccessibility from '../../hooks/useAccessibility';

const HomePage = () => {
  const { state, actions } = useAppData();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [announcedText, setAnnouncedText] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const { speak } = useAccessibility();
  const mainRef = useRef(null);
  const skipLinkRef = useRef(null);

  useEffect(() => {
    // Focus main content area for screen readers
    if (mainRef.current) {
      mainRef.current.focus();
    }

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    // Refresh data periodically
    const refreshTimer = setInterval(() => {
      actions.refreshAll();
    }, 15000); // Refresh every 15 seconds
    
    // Initial refresh
    actions.refreshAll();
    
    // Announce welcome message
    const welcomeMessage = `Welcome to Medical Assistant. Today is ${currentTime.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}. You have ${state.stats.medicines} medicines, ${state.stats.activeReminders} active reminders, and ${state.stats.dosesToday} doses taken today.`;
    setAnnouncedText(welcomeMessage);
    speak(welcomeMessage);
    
    return () => {
      clearInterval(timer);
      clearInterval(refreshTimer);
    };
  }, [speak, currentTime, actions, state.stats]);

  // Function to announce text for screen readers
  const announce = (text) => {
    setAnnouncedText(text);
    speak(text);
  };

  // Function to handle keyboard shortcuts
  const handleKeyDown = (e) => {
    // Alt + O for overview section
    if (e.altKey && e.key === 'o') {
      setActiveSection('overview');
      const element = document.getElementById('overview-section');
      if (element) element.focus();
      announce('Navigated to overview section');
    }
    // Alt + Q for quick actions section
    if (e.altKey && e.key === 'q') {
      setActiveSection('quick-actions');
      const element = document.getElementById('quick-actions-section');
      if (element) element.focus();
      announce('Navigated to quick actions section');
    }
    // Alt + R for reminders section
    if (e.altKey && e.key === 'r') {
      setActiveSection('reminders');
      const element = document.getElementById('reminders-section');
      if (element) element.focus();
      announce('Navigated to reminders section');
    }
    // Alt + E for emergency section
    if (e.altKey && e.key === 'e') {
      setActiveSection('emergency');
      const element = document.getElementById('emergency-section');
      if (element) element.focus();
      announce('Navigated to emergency information section');
    }
  };

  // Skip to main content function
  const skipToMainContent = () => {
    if (skipLinkRef.current) {
      skipLinkRef.current.focus();
    }
  };

  // Quick action cards data
  const quickActions = [
    {
      id: 1,
      title: "Scan Medicine",
      description: "Use camera to scan medicine packages",
      icon: "📷",
      link: "/scan",
      color: "#3b82f6",
      bgColor: "#dbeafe",
      shortcut: "Alt+S"
    },
    {
      id: 2,
      title: "My Medicines",
      description: "View and manage your medicines",
      icon: "💊",
      link: "/medicines",
      color: "#10b981",
      bgColor: "#dcfce7",
      shortcut: "Alt+M"
    },
    {
      id: 3,
      title: "Medication Reminders",
      description: "Set and manage your medication schedule",
      icon: "⏰",
      link: "/reminders",
      color: "#8b5cf6",
      bgColor: "#ede9fe",
      shortcut: "Alt+R"
    },
    {
      id: 4,
      title: "Settings",
      description: "Customize accessibility preferences",
      icon: "⚙️",
      link: "/settings",
      color: "#f59e0b",
      bgColor: "#fef3c7",
      shortcut: "Alt+E"
    }
  ];

  // Stats cards data
  const statsCards = [
    {
      id: 1,
      title: "Medicines",
      value: state.stats.medicines,
      color: "#1e40af",
      bgColor: "#dbeafe",
      description: "Total medicines in your collection"
    },
    {
      id: 2,
      title: "Active Reminders",
      value: state.stats.activeReminders,
      color: "#16a34a",
      bgColor: "#dcfce7",
      description: "Currently active medication reminders"
    },
    {
      id: 3,
      title: "Today's Doses",
      value: state.stats.dosesToday,
      color: "#ea580c",
      bgColor: "#fed7aa",
      description: "Scheduled doses for today"
    },
    {
      id: 4,
      title: "Expired",
      value: state.stats.expired,
      color: "#be185d",
      bgColor: "#fbcfe8",
      description: "Medicines that have expired"
    }
  ];

  // Get upcoming reminders from state
  const upcomingReminders = state.reminders.filter(reminder => 
    reminder.isActive && 
    new Date(reminder.nextDue) > new Date()
  );

  return (
    <div 
      style={{ 
        backgroundColor: '#f0f9ff', 
        minHeight: '100vh', 
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.6'
      }}
      onKeyDown={handleKeyDown}
      tabIndex="-1"
      ref={mainRef}
    >
      {/* Skip link for screen readers */}
      <a 
        href="#main-content" 
        onClick={skipToMainContent}
        style={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          zIndex: 1000
        }}
        onFocus={(e) => {
          e.target.style.position = 'fixed';
          e.target.style.top = '10px';
          e.target.style.left = '10px';
          e.target.style.width = 'auto';
          e.target.style.height = 'auto';
          e.target.style.overflow = 'visible';
          e.target.style.backgroundColor = '#3b82f6';
          e.target.style.color = 'white';
          e.target.style.padding = '10px';
          e.target.style.borderRadius = '4px';
          e.target.style.zIndex = 1000;
        }}
        onBlur={(e) => {
          e.target.style.position = 'absolute';
          e.target.style.left = '-10000px';
          e.target.style.width = '1px';
          e.target.style.height = '1px';
          e.target.style.overflow = 'hidden';
        }}
      >
        Skip to main content
      </a>

      {/* Screen reader announcement area */}
      <div 
        aria-live="assertive" 
        aria-atomic="true" 
        style={{ 
          position: 'absolute', 
          left: '-10000px', 
          width: '1px', 
          height: '1px', 
          overflow: 'hidden' 
        }}
      >
        {announcedText}
      </div>

      <div 
        id="main-content"
        style={{ 
          maxWidth: '1000px', 
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '30px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '4px solid #3b82f6'
        }}
        ref={skipLinkRef}
        tabIndex="-1"
      >
        <header style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 
            style={{ 
              fontSize: '36px', 
              fontWeight: 'bold', 
              color: '#1e40af',
              marginBottom: '10px',
              borderBottom: '4px solid #3b82f6',
              paddingBottom: '10px'
            }}
            tabIndex="0"
          >
            Medical Assistant
          </h1>
          <p 
            style={{ 
              fontSize: '22px', 
              color: '#4b5563',
              marginBottom: '5px'
            }}
            tabIndex="0"
          >
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          <p 
            style={{ 
              fontSize: '18px', 
              color: '#6b7280' 
            }}
            tabIndex="0"
          >
            {currentTime.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </header>

        {/* Keyboard Shortcuts Info */}
        <section style={{ 
          marginBottom: '25px', 
          padding: '20px', 
          backgroundColor: '#e0f2fe', 
          border: '3px solid #0ea5e9',
          borderRadius: '8px' 
        }}>
          <h2 
            style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#0284c7',
              marginBottom: '10px'
            }}
            tabIndex="0"
          >
            Keyboard Shortcuts: 
            <span style={{ fontSize: '16px', fontWeight: 'normal', display: 'block', marginTop: '5px' }}>
              Alt+O (Overview) • Alt+Q (Quick Actions) • Alt+R (Reminders) • Alt+E (Emergency)
            </span>
          </h2>
        </section>

        {/* Stats Cards */}
        <section 
          id="overview-section"
          style={{ marginBottom: '30px' }}
          aria-labelledby="overview-heading"
          tabIndex="-1"
        >
          <h2 
            id="overview-heading"
            style={{ 
              fontSize: '26px', 
              fontWeight: '600', 
              color: '#374151',
              marginBottom: '20px',
              borderBottom: '4px solid #60a5fa',
              paddingBottom: '5px',
              display: 'flex',
              alignItems: 'center'
            }}
            tabIndex="0"
          >
            <span style={{ fontSize: '32px', marginRight: '10px' }}>📊</span>
            Today's Overview
            <button
              onClick={() => {
                setActiveSection('overview');
                announce('Overview section activated');
              }}
              style={{
                marginLeft: 'auto',
                padding: '8px 15px',
                backgroundColor: '#60a5fa',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
              tabIndex="0"
              aria-label="Jump to overview section"
            >
              Jump
            </button>
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: '25px' 
          }}>
            {statsCards.map((stat) => (
              <div 
                key={stat.id}
                role="region"
                aria-labelledby={`stat-title-${stat.id}`}
                style={{
                  padding: '30px',
                  backgroundColor: stat.bgColor,
                  border: `4px solid ${stat.color}`,
                  borderRadius: '12px',
                  textAlign: 'center',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div 
                  id={`stat-title-${stat.id}`}
                  style={{ fontSize: '36px', fontWeight: 'bold', color: stat.color, marginBottom: '12px' }}
                >
                  {stat.value}
                </div>
                <div style={{ color: stat.color, fontWeight: '600', fontSize: '20px', marginBottom: '8px' }}>
                  {stat.title}
                </div>
                <div style={{ color: stat.color, fontSize: '16px' }}>
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section 
          id="quick-actions-section"
          style={{ marginBottom: '30px' }}
          aria-labelledby="quick-actions-heading"
          tabIndex="-1"
        >
          <h2 
            id="quick-actions-heading"
            style={{ 
              fontSize: '26px', 
              fontWeight: '600', 
              color: '#374151',
              marginBottom: '20px',
              borderBottom: '4px solid #60a5fa',
              paddingBottom: '5px',
              display: 'flex',
              alignItems: 'center'
            }}
            tabIndex="0"
          >
            <span style={{ fontSize: '32px', marginRight: '10px' }}>⚡</span>
            Quick Actions
            <button
              onClick={() => {
                setActiveSection('quick-actions');
                announce('Quick actions section activated');
              }}
              style={{
                marginLeft: 'auto',
                padding: '8px 15px',
                backgroundColor: '#60a5fa',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
              tabIndex="0"
              aria-label="Jump to quick actions section"
            >
              Jump
            </button>
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '25px' 
          }}>
            {quickActions.map(action => (
              <Link 
                key={action.id}
                to={action.link}
                onClick={() => {
                  announce(`Navigate to ${action.title} page. ${action.description}`);
                }}
                style={{
                  display: 'block',
                  padding: '35px',
                  backgroundColor: action.bgColor,
                  border: `4px solid ${action.color}`,
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: action.color,
                  fontWeight: '600',
                  fontSize: '22px',
                  textAlign: 'center',
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                tabIndex="0"
                role="button"
                aria-label={`${action.title}. ${action.description}. Press enter to navigate.`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    announce(`Navigate to ${action.title} page. ${action.description}`);
                  }
                }}
              >
                <div style={{ fontSize: '44px', marginBottom: '18px' }}>{action.icon}</div>
                <div>{action.title}</div>
                <div style={{ fontSize: '18px', fontWeight: 'normal', marginTop: '12px' }}>
                  {action.description}
                </div>
                <div style={{ 
                  position: 'absolute', 
                  top: '12px', 
                  right: '12px', 
                  backgroundColor: action.color, 
                  color: 'white', 
                  padding: '6px 10px', 
                  borderRadius: '6px', 
                  fontSize: '14px' 
                }}>
                  {action.shortcut}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Upcoming Reminders */}
        <section 
          id="reminders-section"
          style={{ marginBottom: '30px' }}
          aria-labelledby="reminders-heading"
          tabIndex="-1"
        >
          <h2 
            id="reminders-heading"
            style={{ 
              fontSize: '26px', 
              fontWeight: '600', 
              color: '#374151',
              marginBottom: '20px',
              borderBottom: '4px solid #60a5fa',
              paddingBottom: '5px',
              display: 'flex',
              alignItems: 'center'
            }}
            tabIndex="0"
          >
            <span style={{ fontSize: '32px', marginRight: '10px' }}>🔔</span>
            Upcoming Reminders
            <button
              onClick={() => {
                setActiveSection('reminders');
                announce('Reminders section activated');
              }}
              style={{
                marginLeft: 'auto',
                padding: '8px 15px',
                backgroundColor: '#60a5fa',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
              tabIndex="0"
              aria-label="Jump to reminders section"
            >
              Jump
            </button>
          </h2>
          
          {upcomingReminders.length > 0 ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr', 
              gap: '25px' 
            }}>
              {upcomingReminders.map(reminder => (
                <div 
                  key={reminder.id}
                  role="article"
                  aria-labelledby={`reminder-title-${reminder.id}`}
                  style={{
                    padding: '30px',
                    backgroundColor: '#e0f2fe',
                    border: '4px solid #0ea5e9',
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div id={`reminder-title-${reminder.id}`}>
                    <h3 style={{ 
                      fontSize: '22px', 
                      fontWeight: '600', 
                      color: '#0284c7',
                      marginBottom: '10px'
                    }}>
                      {reminder.medicineName}
                    </h3>
                    <p style={{ color: '#0284c7', fontSize: '18px', marginBottom: '10px' }}>
                      <strong>Dosage:</strong> {reminder.dosage}
                    </p>
                    <p style={{ color: '#0284c7', fontWeight: '600', fontSize: '20px' }}>
                      <strong>Due Time:</strong> {new Date(reminder.nextDue).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                      onClick={() => announce(`Reminder for ${reminder.medicineName} at ${new Date(reminder.nextDue).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}. ${reminder.dosage}`)}
                      style={{
                        backgroundColor: '#0ea5e9',
                        color: 'white',
                        border: '3px solid #0284c7',
                        borderRadius: '10px',
                        width: '60px',
                        height: '60px',
                        cursor: 'pointer',
                        fontSize: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      tabIndex="0"
                      aria-label={`Read reminder details for ${reminder.medicineName}`}
                    >
                      🔊
                    </button>
                    <Link
                      to="/reminders"
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: '3px solid #2563eb',
                        borderRadius: '10px',
                        padding: '10px 15px',
                        fontSize: '16px',
                        textAlign: 'center',
                        textDecoration: 'none',
                        fontWeight: '600'
                      }}
                      tabIndex="0"
                    >
                      View All
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              padding: '35px',
              textAlign: 'center',
              backgroundColor: '#f9fafb',
              border: '4px dashed #d1d5db',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '22px', color: '#6b7280' }}>No upcoming reminders</div>
              <p style={{ color: '#6b7280', marginTop: '12px' }}>Set medication reminders in the Reminders section</p>
              <Link
                to="/reminders"
                style={{
                  display: 'inline-block',
                  marginTop: '18px',
                  padding: '15px 28px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: '3px solid #2563eb',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '18px'
                }}
                tabIndex="0"
              >
                Set Reminders
              </Link>
            </div>
          )}
        </section>

        {/* Accessibility Features */}
        <section style={{ 
          backgroundColor: '#e0f2fe', 
          border: '4px solid #0ea5e9',
          borderRadius: '12px', 
          padding: '35px',
          marginBottom: '25px'
        }}>
          <h2 
            style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              color: '#0284c7',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center'
            }}
            tabIndex="0"
          >
            <span style={{ fontSize: '32px', marginRight: '10px' }}>♿</span>
            Accessibility Features
          </h2>
          <ul style={{ 
            color: '#0284c7',
            paddingLeft: '30px',
            fontSize: '18px',
            lineHeight: '1.8'
          }}>
            <li style={{ marginBottom: '15px' }} tabIndex="0">
              <strong>Keyboard Navigation:</strong> Press Tab to move between interactive elements, Enter/Space to activate
            </li>
            <li style={{ marginBottom: '15px' }} tabIndex="0">
              <strong>Screen Reader:</strong> All elements properly labeled with ARIA attributes for optimal screen reader experience
            </li>
            <li style={{ marginBottom: '15px' }} tabIndex="0">
              <strong>High Contrast:</strong> High contrast color scheme with clear visual separation between elements
            </li>
            <li style={{ marginBottom: '15px' }} tabIndex="0">
              <strong>Large Text:</strong> Sufficiently large fonts (minimum 18px) with appropriate spacing for easy reading
            </li>
            <li style={{ marginBottom: '15px' }} tabIndex="0">
              <strong>Focus Indicators:</strong> Clear, visible focus indicators (4px borders) for all interactive elements
            </li>
            <li style={{ marginBottom: '15px' }} tabIndex="0">
              <strong>Audio Feedback:</strong> Audio descriptions available for all important information
            </li>
            <li style={{ marginBottom: '15px' }} tabIndex="0">
              <strong>Keyboard Shortcuts:</strong> Alt+O (Overview), Alt+Q (Quick Actions), Alt+R (Reminders), Alt+E (Emergency)
            </li>
            <li tabIndex="0">
              <strong>Skip Links:</strong> Use skip links to navigate directly to main content sections
            </li>
          </ul>
        </section>

        {/* Emergency Information */}
        <section 
          id="emergency-section"
          style={{ 
            padding: '35px', 
            backgroundColor: '#fef2f2', 
            border: '4px solid #fecaca',
            borderRadius: '12px' 
          }}
          tabIndex="-1"
        >
          <h2 
            style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              color: '#b91c1c',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center'
            }}
            tabIndex="0"
          >
            <span style={{ fontSize: '32px', marginRight: '10px' }}>🚨</span>
            Emergency Information
          </h2>
          <ul style={{ 
            color: '#b91c1c',
            paddingLeft: '30px',
            fontSize: '18px',
            lineHeight: '1.8'
          }}>
            <li style={{ marginBottom: '12px' }} tabIndex="0">
              <strong>Emergency Number:</strong> Call 911 or your local emergency number immediately
            </li>
            <li style={{ marginBottom: '12px' }} tabIndex="0">
              <strong>Medication List:</strong> Keep an updated list of all medications for emergency responders
            </li>
            <li style={{ marginBottom: '12px' }} tabIndex="0">
              <strong>Pharmacy Contact:</strong> Have your pharmacy's phone number readily available
            </li>
            <li style={{ marginBottom: '12px' }} tabIndex="0">
              <strong>Doctor's Number:</strong> Contact your healthcare provider for non-emergency concerns
            </li>
            <li tabIndex="0">
              <strong>Allergy Information:</strong> Inform emergency responders of any known allergies
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default HomePage;