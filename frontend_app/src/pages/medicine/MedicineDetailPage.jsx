import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAppData } from '../../contexts/AppDataContext';
import useAccessibility from '../../hooks/useAccessibility';
import MedicineInteractionChecker from '../../components/medicine/MedicineInteractionChecker';

const MedicineDetailPage = () => {
  const { id } = useParams();
  const { state, actions } = useAppData();
  const [medicine, setMedicine] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [announcedText, setAnnouncedText] = useState('');
  const { speak } = useAccessibility();
  const mainRef = useRef(null);

  useEffect(() => {
    // Focus main content area for screen readers
    if (mainRef.current) {
      mainRef.current.focus();
    }

    // Find the medicine based on the ID from URL
    const foundMedicine = state.medicines.find(med => med.id === parseInt(id));
    if (foundMedicine) {
      setMedicine(foundMedicine);
      setAnnouncedText(`Viewing details for ${foundMedicine.name}`);
      speak(`Viewing details for ${foundMedicine.name}. Category: ${foundMedicine.category}. Dosage: ${foundMedicine.dosage}`);
    } else {
      // If not found, redirect to medicine list or show error
      speak('Medicine not found. Redirecting to medicine list.');
      setTimeout(() => {
        window.location.hash = '#/medicines';
      }, 2000);
    }
  }, [id, state.medicines, speak]);

  // Function to announce section details for screen readers
  const announceSectionDetails = (section) => {
    const sectionNames = {
      info: 'Medicine Information',
      usage: 'Usage Instructions',
      effects: 'Side Effects',
      interactions: 'Drug Interactions'
    };
    setAnnouncedText(`Viewing ${sectionNames[section]} section`);
    speak(`Viewing ${sectionNames[section]} section`);
  };

  // Function to handle setting a reminder for this medicine
  const handleSetReminder = () => {
    if (medicine) {
      speak(`Setting reminder for ${medicine.name}. ${medicine.dosage}`);
      // In a real app, this would set an actual reminder
      alert(`Reminder set for ${medicine.name}: ${medicine.dosage}`);
    }
  };

  // Function to handle updating the medicine
  const handleUpdateMedicine = (updatedMedicine) => {
    actions.updateMedicine(updatedMedicine);
    setMedicine(updatedMedicine);
    setAnnouncedText('Medicine information updated successfully');
    speak('Medicine information updated successfully');
  };

  // Function to handle deleting the medicine
  const handleDeleteMedicine = () => {
    if (medicine) {
      if (window.confirm(`Are you sure you want to delete ${medicine.name}?`)) {
        actions.removeMedicine(medicine.id);
        setAnnouncedText(`${medicine.name} deleted successfully`);
        speak(`${medicine.name} deleted successfully`);
        setTimeout(() => {
          window.location.hash = '#/medicines';
        }, 1000);
      }
    }
  };

  if (!medicine) {
    return (
      <div style={{ 
        backgroundColor: '#f0f9ff', 
        minHeight: '100vh', 
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.6'
      }}>
        <div style={{ 
          maxWidth: '1000px', 
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '30px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '2px solid #3b82f6'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px',
            textAlign: 'center'
          }}>
            <div>
              <div style={{
                fontSize: '24px',
                color: '#3b82f6',
                marginBottom: '10px'
              }}>Medicine Not Found</div>
              <div style={{ color: '#6b7280' }}>The requested medicine could not be found.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            {medicine.name}
          </h1>
          <p 
            style={{ 
              fontSize: '16px', 
              color: '#4b5563',
              fontStyle: 'italic'
            }}
            tabIndex="0"
          >
            {medicine.category} • {medicine.manufacturer}
          </p>
        </header>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '15px', 
          marginBottom: '25px' 
        }}>
          <button
            onClick={handleSetReminder}
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
            Set Reminder
          </button>
          <button
            onClick={handleDeleteMedicine}
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
            Delete Medicine
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '5px', 
          marginBottom: '25px',
          borderBottom: '2px solid #d1d5db'
        }}>
          <button
            onClick={() => {
              setActiveTab('info');
              announceSectionDetails('info');
            }}
            style={{
              padding: '12px 20px',
              backgroundColor: activeTab === 'info' ? '#3b82f6' : '#f3f4f6',
              color: activeTab === 'info' ? 'white' : '#4b5563',
              border: '1px solid #d1d5db',
              borderRight: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              borderRadius: '6px 0 0 6px'
            }}
            tabIndex="0"
          >
            Medicine Info
          </button>
          <button
            onClick={() => {
              setActiveTab('usage');
              announceSectionDetails('usage');
            }}
            style={{
              padding: '12px 20px',
              backgroundColor: activeTab === 'usage' ? '#3b82f6' : '#f3f4f6',
              color: activeTab === 'usage' ? 'white' : '#4b5563',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              fontWeight: '600'
            }}
            tabIndex="0"
          >
            Usage Instructions
          </button>
          <button
            onClick={() => {
              setActiveTab('effects');
              announceSectionDetails('effects');
            }}
            style={{
              padding: '12px 20px',
              backgroundColor: activeTab === 'effects' ? '#3b82f6' : '#f3f4f6',
              color: activeTab === 'effects' ? 'white' : '#4b5563',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              fontWeight: '600'
            }}
            tabIndex="0"
          >
            Side Effects
          </button>
          <button
            onClick={() => {
              setActiveTab('interactions');
              announceSectionDetails('interactions');
            }}
            style={{
              padding: '12px 20px',
              backgroundColor: activeTab === 'interactions' ? '#3b82f6' : '#f3f4f6',
              color: activeTab === 'interactions' ? 'white' : '#4b5563',
              border: '1px solid #d1d5db',
              borderLeft: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              borderRadius: '0 6px 6px 0'
            }}
            tabIndex="0"
          >
            Drug Interactions
          </button>
        </div>

        {/* Medicine Information Section */}
        {activeTab === 'info' && (
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
              <span style={{ fontSize: '28px', marginRight: '10px' }}>💊</span>
              Medicine Information
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '20px' 
            }}>
              <div style={{ marginBottom: '15px' }}>
                <p style={{ fontWeight: '500', color: '#374151', marginBottom: '5px', fontSize: '16px' }}>
                  Medicine Name:
                </p>
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
                  {medicine.name}
                </div>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <p style={{ fontWeight: '500', color: '#374151', marginBottom: '5px', fontSize: '16px' }}>
                  Category:
                </p>
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
                  {medicine.category}
                </div>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <p style={{ fontWeight: '500', color: '#374151', marginBottom: '5px', fontSize: '16px' }}>
                  Manufacturer:
                </p>
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
                  {medicine.manufacturer}
                </div>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <p style={{ fontWeight: '500', color: '#374151', marginBottom: '5px', fontSize: '16px' }}>
                  Active Ingredients:
                </p>
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
                  {medicine.activeIngredients.join(', ')}
                </div>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <p style={{ fontWeight: '500', color: '#374151', marginBottom: '5px', fontSize: '16px' }}>
                  Dosage:
                </p>
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
                  {medicine.dosage}
                </div>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <p style={{ fontWeight: '500', color: '#374151', marginBottom: '5px', fontSize: '16px' }}>
                  Frequency:
                </p>
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
                  {medicine.frequency}
                </div>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <p style={{ fontWeight: '500', color: '#374151', marginBottom: '5px', fontSize: '16px' }}>
                  Expiry Date:
                </p>
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
                  {new Date(medicine.expiryDate).toLocaleDateString()}
                </div>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <p style={{ fontWeight: '500', color: '#374151', marginBottom: '5px', fontSize: '16px' }}>
                  Last Taken:
                </p>
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
                  {new Date(medicine.lastTaken).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Usage Instructions Section */}
        {activeTab === 'usage' && (
          <div style={{ 
            padding: '25px', 
            backgroundColor: '#e0f2fe', 
            border: '2px solid #0ea5e9',
            borderRadius: '8px',
            marginBottom: '25px'
          }}>
            <h2 
              style={{ 
                fontSize: '22px', 
                fontWeight: '600', 
                color: '#0284c7',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center'
              }}
              tabIndex="0"
            >
              <span style={{ fontSize: '28px', marginRight: '10px' }}>📝</span>
              Usage Instructions
            </h2>
            
            <div style={{ marginBottom: '15px' }}>
              <p style={{ fontWeight: '500', color: '#0284c7', marginBottom: '5px', fontSize: '16px' }}>
                How to Use:
              </p>
              <div 
                style={{ 
                  padding: '15px', 
                  backgroundColor: 'white', 
                  border: '2px solid #0ea5e9', 
                  borderRadius: '6px',
                  fontSize: '16px',
                  lineHeight: '1.8'
                }}
                tabIndex="0"
              >
                {medicine.usage}
              </div>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <p style={{ fontWeight: '500', color: '#0284c7', marginBottom: '5px', fontSize: '16px' }}>
                Important Warnings:
              </p>
              <div 
                style={{ 
                  padding: '15px', 
                  backgroundColor: 'white', 
                  border: '2px solid #0ea5e9', 
                  borderRadius: '6px',
                  fontSize: '16px',
                  lineHeight: '1.8'
                }}
                tabIndex="0"
              >
                {medicine.warnings}
              </div>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <p style={{ fontWeight: '500', color: '#0284c7', marginBottom: '5px', fontSize: '16px' }}>
                Storage Instructions:
              </p>
              <div 
                style={{ 
                  padding: '15px', 
                  backgroundColor: 'white', 
                  border: '2px solid #0ea5e9', 
                  borderRadius: '6px',
                  fontSize: '16px',
                  lineHeight: '1.8'
                }}
                tabIndex="0"
              >
                {medicine.storage}
              </div>
            </div>
          </div>
        )}

        {/* Side Effects Section */}
        {activeTab === 'effects' && (
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
              <span style={{ fontSize: '28px', marginRight: '10px' }}>⚠️</span>
              Side Effects
            </h2>
            
            <div style={{ marginBottom: '15px' }}>
              <p style={{ fontWeight: '500', color: '#b91c1c', marginBottom: '5px', fontSize: '16px' }}>
                Common Side Effects:
              </p>
              <div 
                style={{ 
                  padding: '15px', 
                  backgroundColor: 'white', 
                  border: '2px solid #fecaca', 
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
                tabIndex="0"
              >
                <ul style={{ paddingLeft: '20px' }}>
                  {medicine.sideEffects.map((effect, index) => (
                    <li key={index} style={{ marginBottom: '8px' }}>{effect}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div style={{ 
              padding: '15px', 
              backgroundColor: '#fef2f2', 
              border: '2px solid #fecaca', 
              borderRadius: '6px'
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#b91c1c',
                marginBottom: '10px'
              }}>
                When to Seek Medical Attention
              </h3>
              <ul style={{ 
                color: '#b91c1c',
                paddingLeft: '20px',
                fontSize: '14px'
              }}>
                <li style={{ marginBottom: '8px' }} tabIndex="0">Severe allergic reactions (difficulty breathing, swelling)</li>
                <li style={{ marginBottom: '8px' }} tabIndex="0">Persistent or severe side effects</li>
                <li style={{ marginBottom: '8px' }} tabIndex="0">Signs of liver problems (yellowing of skin/eyes)</li>
                <li style={{ marginBottom: '8px' }} tabIndex="0">Unusual bleeding or bruising</li>
                <li tabIndex="0">Any concerning symptoms not listed here</li>
              </ul>
            </div>
          </div>
        )}

        {/* Drug Interactions Section */}
        {activeTab === 'interactions' && (
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
              <span style={{ fontSize: '28px', marginRight: '10px' }}>🔄</span>
              Drug Interactions
            </h2>
            
            <div style={{ marginBottom: '20px' }}>
              <p style={{ 
                color: '#065f46', 
                fontSize: '16px', 
                lineHeight: '1.6',
                marginBottom: '15px'
              }} tabIndex="0">
                {medicine.name} may interact with other medications. Use the interaction checker below to see potential interactions with your other medicines.
              </p>
              
              <MedicineInteractionChecker />
            </div>
            
            <div style={{ 
              padding: '15px', 
              backgroundColor: '#f0fdf4', 
              border: '2px solid #a7f3d0', 
              borderRadius: '6px'
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#065f46',
                marginBottom: '10px'
              }}>
                Important Interaction Information
              </h3>
              <ul style={{ 
                color: '#065f46',
                paddingLeft: '20px',
                fontSize: '14px'
              }}>
                <li style={{ marginBottom: '8px' }} tabIndex="0">Always inform your doctor about all medications you're taking</li>
                <li style={{ marginBottom: '8px' }} tabIndex="0">Include over-the-counter drugs, vitamins, and supplements</li>
                <li style={{ marginBottom: '8px' }} tabIndex="0">Some interactions may increase side effects</li>
                <li style={{ marginBottom: '8px' }} tabIndex="0">Some interactions may reduce effectiveness</li>
                <li tabIndex="0">Never stop or change medications without consulting your doctor</li>
              </ul>
            </div>
          </div>
        )}

        {/* Audio Feedback Section */}
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
            <span style={{ fontSize: '24px', marginRight: '10px' }}>🔊</span>
            Audio Information
          </h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                const info = `Medicine: ${medicine.name}. Category: ${medicine.category}. Dosage: ${medicine.dosage}. Usage: ${medicine.usage}. Side effects include: ${medicine.sideEffects.join(', ')}.`;
                speak(info);
              }}
              style={{
                padding: '10px 15px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: '2px solid #2563eb',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
              tabIndex="0"
            >
              Read Full Details
            </button>
            <button
              onClick={() => speak(`Dosage for ${medicine.name}: ${medicine.dosage}`)}
              style={{
                padding: '10px 15px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: '2px solid #2563eb',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
              tabIndex="0"
            >
              Read Dosage
            </button>
            <button
              onClick={() => speak(`Usage instructions: ${medicine.usage}`)}
              style={{
                padding: '10px 15px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: '2px solid #2563eb',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
              tabIndex="0"
            >
              Read Usage
            </button>
          </div>
        </div>

        {/* Emergency Information */}
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#fef2f2', 
          border: '2px solid #fecaca',
          borderRadius: '8px' 
        }}>
          <h2 
            style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#b91c1c',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center'
            }}
            tabIndex="0"
          >
            <span style={{ fontSize: '24px', marginRight: '10px' }}>🚨</span>
            Emergency Information
          </h2>
          <ul style={{ 
            color: '#b91c1c',
            paddingLeft: '20px',
            fontSize: '14px'
          }}>
            <li style={{ marginBottom: '8px' }} tabIndex="0">In case of overdose, call emergency services immediately</li>
            <li style={{ marginBottom: '8px' }} tabIndex="0">If you experience severe side effects, seek medical attention</li>
            <li style={{ marginBottom: '8px' }} tabIndex="0">Keep this medicine's information available for emergency responders</li>
            <li style={{ marginBottom: '8px' }} tabIndex="0">Contact your doctor if you have concerns about this medicine</li>
            <li tabIndex="0">Always carry a list of your current medications</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MedicineDetailPage;