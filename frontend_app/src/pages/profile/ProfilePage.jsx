import React, { useState, useEffect, useRef } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import useAccessibility from '../../hooks/useAccessibility';

const ProfilePage = () => {
  const { state, actions } = useAppData();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...state.profile });
  const [activeSection, setActiveSection] = useState('personal');
  const [announcedText, setAnnouncedText] = useState('');
  const { speak } = useAccessibility();
  const mainRef = useRef(null);

  useEffect(() => {
    // Focus main content area for screen readers
    if (mainRef.current) {
      mainRef.current.focus();
    }
  }, []);

  useEffect(() => {
    setEditForm({ ...state.profile });
  }, [state.profile]);

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    actions.updateProfile(editForm);
    setIsEditing(false);
    setAnnouncedText('Profile updated successfully');
    speak('Profile updated successfully');
  };

  const handleCancel = () => {
    setEditForm({ ...state.profile });
    setIsEditing(false);
    setAnnouncedText('Profile editing cancelled');
    speak('Profile editing cancelled');
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setAnnouncedText('Entering edit mode for profile');
    speak('Entering edit mode for profile');
  };

  // Function to announce section details for screen readers
  const announceSectionDetails = (section) => {
    const sectionNames = {
      personal: 'Personal Information',
      emergency: 'Emergency Contacts',
      medical: 'Medical Information'
    };
    setAnnouncedText(`Viewing ${sectionNames[section]} section`);
    speak(`Viewing ${sectionNames[section]} section`);
  };

  return (
    <div 
      style={{ 
        backgroundColor: '#f0f9ff', 
        minHeight: '100vh', 
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.6'
      }}
      tabIndex="-1"
      ref={mainRef}
    >
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
        {announcedText}
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
            My Profile
          </h1>
          <p 
            style={{ 
              fontSize: '16px', 
              color: '#4b5563',
              fontStyle: 'italic'
            }}
            tabIndex="0"
          >
            Manage your personal information and medical details
          </p>
        </header>

        {/* Navigation Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '5px', 
          marginBottom: '25px',
          borderBottom: '2px solid #d1d5db'
        }}>
          <button
            onClick={() => {
              setActiveSection('personal');
              announceSectionDetails('personal');
            }}
            style={{
              padding: '12px 20px',
              backgroundColor: activeSection === 'personal' ? '#3b82f6' : '#f3f4f6',
              color: activeSection === 'personal' ? 'white' : '#4b5563',
              border: '1px solid #d1d5db',
              borderRight: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              borderRadius: '6px 0 0 6px'
            }}
            tabIndex="0"
          >
            Personal Info
          </button>
          <button
            onClick={() => {
              setActiveSection('emergency');
              announceSectionDetails('emergency');
            }}
            style={{
              padding: '12px 20px',
              backgroundColor: activeSection === 'emergency' ? '#3b82f6' : '#f3f4f6',
              color: activeSection === 'emergency' ? 'white' : '#4b5563',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              fontWeight: '600'
            }}
            tabIndex="0"
          >
            Emergency Contacts
          </button>
          <button
            onClick={() => {
              setActiveSection('medical');
              announceSectionDetails('medical');
            }}
            style={{
              padding: '12px 20px',
              backgroundColor: activeSection === 'medical' ? '#3b82f6' : '#f3f4f6',
              color: activeSection === 'medical' ? 'white' : '#4b5563',
              border: '1px solid #d1d5db',
              borderLeft: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              borderRadius: '0 6px 6px 0'
            }}
            tabIndex="0"
          >
            Medical Info
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '15px', 
          marginBottom: '25px' 
        }}>
          {!isEditing ? (
            <button
              onClick={handleEditClick}
              style={{
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: '2px solid #2563eb',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '16px'
              }}
              tabIndex="0"
            >
              Edit Profile
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSave}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: '2px solid #059669',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '16px'
                }}
                tabIndex="0"
              >
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: '2px solid #dc2626',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '16px'
                }}
                tabIndex="0"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Personal Information Section */}
        {activeSection === 'personal' && (
          <div style={{ 
            padding: '25px', 
            backgroundColor: '#f9fafb', 
            border: '2px solid #d1d5db',
            borderRadius: '8px',
            marginBottom: '25px'
          }}>
            <h2 
              style={{ 
                fontSize: '22px', 
                fontWeight: '600', 
                color: '#374151',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center'
              }}
              tabIndex="0"
            >
              <span style={{ fontSize: '28px', marginRight: '10px' }}>👤</span>
              Personal Information
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '20px' 
            }}>
              <div style={{ marginBottom: '15px' }}>
                <label 
                  htmlFor="name" 
                  style={{ 
                    display: 'block', 
                    fontWeight: '500', 
                    color: '#374151', 
                    marginBottom: '5px',
                    fontSize: '16px'
                  }}
                  tabIndex="0"
                >
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    id="name"
                    type="text"
                    value={editForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #3b82f6',
                      borderRadius: '6px',
                      fontSize: '16px',
                      backgroundColor: 'white'
                    }}
                    tabIndex="0"
                  />
                ) : (
                  <div 
                    style={{ 
                      padding: '10px', 
                      backgroundColor: 'white', 
                      border: '2px solid #d1d5db', 
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                    tabIndex="0"
                  >
                    {state.profile.name}
                  </div>
                )}
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label 
                  htmlFor="email" 
                  style={{ 
                    display: 'block', 
                    fontWeight: '500', 
                    color: '#374151', 
                    marginBottom: '5px',
                    fontSize: '16px'
                  }}
                  tabIndex="0"
                >
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    id="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #3b82f6',
                      borderRadius: '6px',
                      fontSize: '16px',
                      backgroundColor: 'white'
                    }}
                    tabIndex="0"
                  />
                ) : (
                  <div 
                    style={{ 
                      padding: '10px', 
                      backgroundColor: 'white', 
                      border: '2px solid #d1d5db', 
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                    tabIndex="0"
                  >
                    {state.profile.email}
                  </div>
                )}
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label 
                  htmlFor="phone" 
                  style={{ 
                    display: 'block', 
                    fontWeight: '500', 
                    color: '#374151', 
                    marginBottom: '5px',
                    fontSize: '16px'
                  }}
                  tabIndex="0"
                >
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    id="phone"
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #3b82f6',
                      borderRadius: '6px',
                      fontSize: '16px',
                      backgroundColor: 'white'
                    }}
                    tabIndex="0"
                  />
                ) : (
                  <div 
                    style={{ 
                      padding: '10px', 
                      backgroundColor: 'white', 
                      border: '2px solid #d1d5db', 
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                    tabIndex="0"
                  >
                    {state.profile.phone}
                  </div>
                )}
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label 
                  htmlFor="dateOfBirth" 
                  style={{ 
                    display: 'block', 
                    fontWeight: '500', 
                    color: '#374151', 
                    marginBottom: '5px',
                    fontSize: '16px'
                  }}
                  tabIndex="0"
                >
                  Date of Birth
                </label>
                {isEditing ? (
                  <input
                    id="dateOfBirth"
                    type="date"
                    value={editForm.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #3b82f6',
                      borderRadius: '6px',
                      fontSize: '16px',
                      backgroundColor: 'white'
                    }}
                    tabIndex="0"
                  />
                ) : (
                  <div 
                    style={{ 
                      padding: '10px', 
                      backgroundColor: 'white', 
                      border: '2px solid #d1d5db', 
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                    tabIndex="0"
                  >
                    {new Date(state.profile.dateOfBirth).toLocaleDateString()}
                  </div>
                )}
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label 
                  htmlFor="address" 
                  style={{ 
                    display: 'block', 
                    fontWeight: '500', 
                    color: '#374151', 
                    marginBottom: '5px',
                    fontSize: '16px'
                  }}
                  tabIndex="0"
                >
                  Address
                </label>
                {isEditing ? (
                  <textarea
                    id="address"
                    value={editForm.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #3b82f6',
                      borderRadius: '6px',
                      fontSize: '16px',
                      backgroundColor: 'white',
                      resize: 'vertical'
                    }}
                    tabIndex="0"
                  />
                ) : (
                  <div 
                    style={{ 
                      padding: '10px', 
                      backgroundColor: 'white', 
                      border: '2px solid #d1d5db', 
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                    tabIndex="0"
                  >
                    {state.profile.address}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Emergency Contacts Section */}
        {activeSection === 'emergency' && (
          <div style={{ 
            padding: '25px', 
            backgroundColor: '#fef2f2', 
            border: '2px solid #fecaca',
            borderRadius: '8px',
            marginBottom: '25px'
          }}>
            <h2 
              style={{ 
                fontSize: '22px', 
                fontWeight: '600', 
                color: '#b91c1c',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center'
              }}
              tabIndex="0"
            >
              <span style={{ fontSize: '28px', marginRight: '10px' }}>🚨</span>
              Emergency Contacts
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '20px' 
            }}>
              <div style={{ marginBottom: '15px' }}>
                <label 
                  htmlFor="emergencyContactName" 
                  style={{ 
                    display: 'block', 
                    fontWeight: '500', 
                    color: '#b91c1c', 
                    marginBottom: '5px',
                    fontSize: '16px'
                  }}
                  tabIndex="0"
                >
                  Emergency Contact Name
                </label>
                {isEditing ? (
                  <input
                    id="emergencyContactName"
                    type="text"
                    value={editForm.emergencyContactName}
                    onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #b91c1c',
                      borderRadius: '6px',
                      fontSize: '16px',
                      backgroundColor: 'white'
                    }}
                    tabIndex="0"
                  />
                ) : (
                  <div 
                    style={{ 
                      padding: '10px', 
                      backgroundColor: 'white', 
                      border: '2px solid #fecaca', 
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                    tabIndex="0"
                  >
                    {state.profile.emergencyContactName}
                  </div>
                )}
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label 
                  htmlFor="emergencyContact" 
                  style={{ 
                    display: 'block', 
                    fontWeight: '500', 
                    color: '#b91c1c', 
                    marginBottom: '5px',
                    fontSize: '16px'
                  }}
                  tabIndex="0"
                >
                  Emergency Contact Phone
                </label>
                {isEditing ? (
                  <input
                    id="emergencyContact"
                    type="tel"
                    value={editForm.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #b91c1c',
                      borderRadius: '6px',
                      fontSize: '16px',
                      backgroundColor: 'white'
                    }}
                    tabIndex="0"
                  />
                ) : (
                  <div 
                    style={{ 
                      padding: '10px', 
                      backgroundColor: 'white', 
                      border: '2px solid #fecaca', 
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                    tabIndex="0"
                  >
                    {state.profile.emergencyContact}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Medical Information Section */}
        {activeSection === 'medical' && (
          <div style={{ 
            padding: '25px', 
            backgroundColor: '#f0fdf4', 
            border: '2px solid #a7f3d0',
            borderRadius: '8px',
            marginBottom: '25px'
          }}>
            <h2 
              style={{ 
                fontSize: '22px', 
                fontWeight: '600', 
                color: '#065f46',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center'
              }}
              tabIndex="0"
            >
              <span style={{ fontSize: '28px', marginRight: '10px' }}>⚕️</span>
              Medical Information
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '20px' 
            }}>
              <div style={{ marginBottom: '15px' }}>
                <label 
                  htmlFor="bloodType" 
                  style={{ 
                    display: 'block', 
                    fontWeight: '500', 
                    color: '#065f46', 
                    marginBottom: '5px',
                    fontSize: '16px'
                  }}
                  tabIndex="0"
                >
                  Blood Type
                </label>
                {isEditing ? (
                  <input
                    id="bloodType"
                    type="text"
                    value={editForm.bloodType}
                    onChange={(e) => handleInputChange('bloodType', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #065f46',
                      borderRadius: '6px',
                      fontSize: '16px',
                      backgroundColor: 'white'
                    }}
                    tabIndex="0"
                  />
                ) : (
                  <div 
                    style={{ 
                      padding: '10px', 
                      backgroundColor: 'white', 
                      border: '2px solid #a7f3d0', 
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                    tabIndex="0"
                  >
                    {state.profile.bloodType}
                  </div>
                )}
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label 
                  htmlFor="medicalConditions" 
                  style={{ 
                    display: 'block', 
                    fontWeight: '500', 
                    color: '#065f46', 
                    marginBottom: '5px',
                    fontSize: '16px'
                  }}
                  tabIndex="0"
                >
                  Medical Conditions
                </label>
                {isEditing ? (
                  <textarea
                    id="medicalConditions"
                    value={editForm.medicalConditions}
                    onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #065f46',
                      borderRadius: '6px',
                      fontSize: '16px',
                      backgroundColor: 'white',
                      resize: 'vertical'
                    }}
                    tabIndex="0"
                  />
                ) : (
                  <div 
                    style={{ 
                      padding: '10px', 
                      backgroundColor: 'white', 
                      border: '2px solid #a7f3d0', 
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                    tabIndex="0"
                  >
                    {state.profile.medicalConditions}
                  </div>
                )}
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label 
                  htmlFor="allergies" 
                  style={{ 
                    display: 'block', 
                    fontWeight: '500', 
                    color: '#065f46', 
                    marginBottom: '5px',
                    fontSize: '16px'
                  }}
                  tabIndex="0"
                >
                  Allergies
                </label>
                {isEditing ? (
                  <textarea
                    id="allergies"
                    value={editForm.allergies}
                    onChange={(e) => handleInputChange('allergies', e.target.value)}
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #065f46',
                      borderRadius: '6px',
                      fontSize: '16px',
                      backgroundColor: 'white',
                      resize: 'vertical'
                    }}
                    tabIndex="0"
                  />
                ) : (
                  <div 
                    style={{ 
                      padding: '10px', 
                      backgroundColor: 'white', 
                      border: '2px solid #a7f3d0', 
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                    tabIndex="0"
                  >
                    {state.profile.allergies}
                  </div>
                )}
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label 
                  htmlFor="medications" 
                  style={{ 
                    display: 'block', 
                    fontWeight: '500', 
                    color: '#065f46', 
                    marginBottom: '5px',
                    fontSize: '16px'
                  }}
                  tabIndex="0"
                >
                  Current Medications
                </label>
                {isEditing ? (
                  <textarea
                    id="medications"
                    value={editForm.medications}
                    onChange={(e) => handleInputChange('medications', e.target.value)}
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #065f46',
                      borderRadius: '6px',
                      fontSize: '16px',
                      backgroundColor: 'white',
                      resize: 'vertical'
                    }}
                    tabIndex="0"
                  />
                ) : (
                  <div 
                    style={{ 
                      padding: '10px', 
                      backgroundColor: 'white', 
                      border: '2px solid #a7f3d0', 
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                    tabIndex="0"
                  >
                    {state.profile.medications}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Summary Section */}
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#e0f2fe', 
          border: '2px solid #0ea5e9',
          borderRadius: '8px',
          marginBottom: '20px'
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
            <span style={{ fontSize: '24px', marginRight: '10px' }}>📋</span>
            Profile Summary
          </h2>
          <ul style={{ 
            color: '#0284c7',
            paddingLeft: '20px',
            fontSize: '14px'
          }}>
            <li style={{ marginBottom: '8px' }} tabIndex="0">Manage your personal information securely</li>
            <li style={{ marginBottom: '8px' }} tabIndex="0">Keep emergency contacts up to date</li>
            <li style={{ marginBottom: '8px' } } tabIndex="0">Maintain current medical information</li>
            <li style={{ marginBottom: '8px' }} tabIndex="0">Review your information regularly</li>
            <li tabIndex="0">Update information when there are changes</li>
          </ul>
        </div>

        {/* Accessibility Features */}
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
            <span style={{ fontSize: '24px', marginRight: '10px' }}>♿</span>
            Accessibility Features
          </h2>
          <ul style={{ 
            color: '#0284c7',
            paddingLeft: '20px',
            fontSize: '14px'
          }}>
            <li style={{ marginBottom: '8px' }} tabIndex="0">All form fields properly labeled for screen readers</li>
            <li style={{ marginBottom: '8px' }} tabIndex="0">High contrast between text and backgrounds</li>
            <li style={{ marginBottom: '8px' }} tabIndex="0">Large, readable font sizes</li>
            <li style={{ marginBottom: '8px' }} tabIndex="0">Clear focus indicators on interactive elements</li>
            <li style={{ marginBottom: '8px' }} tabIndex="0">Logical tab order through the form</li>
            <li style={{ marginBottom: '8px' }} tabIndex="0">Audio feedback for important actions</li>
            <li tabIndex="0">Keyboard navigation support throughout</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;