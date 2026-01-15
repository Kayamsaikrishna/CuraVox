import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Search from '../../components/common/Search';
import { Button } from '../../components/common/Button';
import useAccessibility from '../../hooks/useAccessibility';
import { useAppData } from '../../contexts/AppDataContext';
import MedicineInteractionChecker from '../../components/medicine/MedicineInteractionChecker';
import PillIdentificationGame from '../../components/medicine/PillIdentificationGame';

const MedicineListPage = () => {
  const { state, actions } = useAppData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, expired
  const [sortBy, setSortBy] = useState('name'); // name, expiry, dosage
  const [showInteractionChecker, setShowInteractionChecker] = useState(false);
  const [showPillGame, setShowPillGame] = useState(false);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const { speak } = useAccessibility();

  useEffect(() => {
    // Load medicines if not already loaded
    if (state.medicines.length === 0) {
      actions.setLoading('medicines', true);
      // Simulate loading delay
      setTimeout(() => {
        actions.setMedicines([
          {
            id: 1,
            name: "Paracetamol",
            activeIngredients: ["Paracetamol 500mg"],
            dosage: "Take 1-2 tablets every 4-6 hours",
            usage: "As needed for pain or fever. Do not exceed 8 tablets in 24 hours.",
            sideEffects: ["Nausea", "Stomach pain", "Liver damage if taken in excess"],
            expiryDate: "2025-12-31",
            manufacturer: "Generic Pharmaceuticals",
            category: "Pain Relief",
            frequency: "As needed",
            lastTaken: "2024-01-10"
          },
          {
            id: 2,
            name: "Amoxicillin",
            activeIngredients: ["Amoxicillin 250mg"],
            dosage: "Take one capsule three times daily",
            usage: "For bacterial infection. Complete full course even if feeling better.",
            sideEffects: ["Diarrhea", "Nausea", "Skin rash"],
            expiryDate: "2024-10-15",
            manufacturer: "HealthPlus Labs",
            category: "Antibiotic",
            frequency: "Three times daily",
            lastTaken: "2024-01-10"
          },
          {
            id: 3,
            name: "Ibuprofen",
            activeIngredients: ["Ibuprofen 400mg"],
            dosage: "Take 1 tablet every 6-8 hours",
            usage: "For pain relief and inflammation. Take with food to avoid stomach upset.",
            sideEffects: ["Stomach pain", "Heartburn", "Dizziness"],
            expiryDate: "2025-05-20",
            manufacturer: "Wellness Pharma",
            category: "Anti-inflammatory",
            frequency: "Every 6-8 hours",
            lastTaken: "2024-01-09"
          },
          {
            id: 4,
            name: "Metformin",
            activeIngredients: ["Metformin 500mg"],
            dosage: "Take one tablet twice daily with meals",
            usage: "For diabetes management. Take with food to reduce stomach upset.",
            sideEffects: ["Nausea", "Diarrhea", "Metallic taste"],
            expiryDate: "2024-08-30",
            manufacturer: "Diabetes Care Inc",
            category: "Diabetes",
            frequency: "Twice daily",
            lastTaken: "2024-01-10"
          },
          {
            id: 5,
            name: "Lisinopril",
            activeIngredients: ["Lisinopril 10mg"],
            dosage: "Take one tablet daily in the morning",
            usage: "For blood pressure management. Take at the same time each day.",
            sideEffects: ["Dizziness", "Dry cough", "Fatigue"],
            expiryDate: "2025-03-15",
            manufacturer: "Cardio Health",
            category: "Blood Pressure",
            frequency: "Once daily",
            lastTaken: "2024-01-10"
          }
        ]);
        actions.setLoading('medicines', false);
      }, 1000);
    }
  }, [state.medicines, actions]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleDetailsClick = (medicineId) => {
    window.location.hash = `#/medicines/${medicineId}`;
  };

  const handleSetReminder = (medicine) => {
    speak(`Reminder set for ${medicine.name}. ${medicine.dosage}`);
    // In a real app, this would set an actual reminder
    alert(`Reminder set for ${medicine.name}: ${medicine.dosage}`);
  };

  const handleAddMedicine = () => {
    speak('Adding new medicine');
    window.location.hash = `#/scan`;
  };

  const toggleMedicineSelection = (medicineId) => {
    if (selectedMedicines.includes(medicineId)) {
      setSelectedMedicines(selectedMedicines.filter(id => id !== medicineId));
    } else {
      setSelectedMedicines([...selectedMedicines, medicineId]);
    }
  };

  const toggleInteractionChecker = () => {
    const newState = !showInteractionChecker;
    setShowInteractionChecker(newState);
    speak(newState ? 'Medicine interaction checker opened' : 'Medicine interaction checker closed');
  };

  const togglePillGame = () => {
    const newState = !showPillGame;
    setShowPillGame(newState);
    speak(newState ? 'Pill identification game opened' : 'Pill identification game closed');
  };

  // Filter medicines based on search term and filter
  const filteredMedicines = state.medicines.filter(medicine => {
    const matchesSearch = !searchTerm || 
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (medicine.activeIngredients && 
       medicine.activeIngredients.some(ingredient => 
         ingredient.toLowerCase().includes(searchTerm.toLowerCase())
       )
      ) ||
      medicine.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filter === 'active') {
      matchesFilter = new Date(medicine.expiryDate) > new Date();
    } else if (filter === 'expired') {
      matchesFilter = new Date(medicine.expiryDate) <= new Date();
    }
    
    return matchesSearch && matchesFilter;
  });

  // Sort medicines
  const sortedMedicines = [...filteredMedicines].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'expiry') {
      return new Date(a.expiryDate) - new Date(b.expiryDate);
    } else if (sortBy === 'dosage') {
      return a.frequency.localeCompare(b.frequency);
    }
    return 0;
  });

  // Calculate statistics
  const activeMedicines = state.medicines.filter(med => new Date(med.expiryDate) > new Date()).length;
  const expiredMedicines = state.medicines.filter(med => new Date(med.expiryDate) <= new Date()).length;
  const totalMedicines = state.medicines.length;

  // Function to announce medicine details for screen readers
  const announceMedicineDetails = (medicine) => {
    const details = `${medicine.name}. Category: ${medicine.category}. Dosage: ${medicine.dosage}. Expiry: ${new Date(medicine.expiryDate).toLocaleDateString()}. Last taken: ${new Date(medicine.lastTaken).toLocaleDateString()}`;
    speak(details);
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
      />

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
            My Medicines
          </h1>
          <p 
            style={{ 
              fontSize: '16px', 
              color: '#4b5563',
              fontStyle: 'italic'
            }}
            tabIndex="0"
          >
            Manage your medications and get important information at a glance
          </p>
        </header>

        {/* Action Bar */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '15px', 
          marginBottom: '25px',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ flex: '1', minWidth: '250px' }}>
            <Search 
              placeholder="Search medicines by name, ingredient, or category..." 
              onSearch={handleSearch}
              style={{ width: '100%', padding: '10px' }}
            />
          </div>
          <button
            onClick={handleAddMedicine}
            style={{
              padding: '12px 20px',
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
            Add New Medicine
          </button>
        </div>

        {/* Filters and Sorting */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '15px', 
          marginBottom: '25px',
          padding: '15px',
          backgroundColor: '#f0f9ff',
          borderRadius: '8px',
          border: '2px solid #bae6fd'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#1e40af' }}>Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                padding: '8px',
                border: '2px solid #3b82f6',
                borderRadius: '4px',
                backgroundColor: 'white',
                color: '#1e40af',
                fontSize: '14px'
              }}
              tabIndex="0"
            >
              <option value="all">All Medicines</option>
              <option value="active">Active Medicines</option>
              <option value="expired">Expired Medicines</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#1e40af' }}>Sort By:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '8px',
                border: '2px solid #3b82f6',
                borderRadius: '4px',
                backgroundColor: 'white',
                color: '#1e40af',
                fontSize: '14px'
              }}
              tabIndex="0"
            >
              <option value="name">Name</option>
              <option value="expiry">Expiry Date</option>
              <option value="dosage">Frequency</option>
            </select>
          </div>
          
          <button
            onClick={toggleInteractionChecker}
            style={{
              padding: '12px 15px',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: '2px solid #7c3aed',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              alignSelf: 'flex-end'
            }}
            tabIndex="0"
          >
            {showInteractionChecker ? 'Hide' : 'Show'} Interaction Checker
          </button>
          
          <button
            onClick={togglePillGame}
            style={{
              padding: '12px 15px',
              backgroundColor: '#10b981',
              color: 'white',
              border: '2px solid #059669',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              alignSelf: 'flex-end'
            }}
            tabIndex="0"
          >
            {showPillGame ? 'Hide' : 'Show'} Pill Game
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px',
          marginBottom: '25px'
        }}>
          <div style={{
            padding: '15px',
            backgroundColor: '#dbeafe',
            border: '2px solid #3b82f6',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e40af' }}>{totalMedicines}</div>
            <div style={{ color: '#1e40af', fontWeight: '500' }}>Total Medicines</div>
          </div>
          <div style={{
            padding: '15px',
            backgroundColor: '#dcfce7',
            border: '2px solid #22c55e',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>{activeMedicines}</div>
            <div style={{ color: '#16a34a', fontWeight: '500' }}>Active Medicines</div>
          </div>
          <div style={{
            padding: '15px',
            backgroundColor: '#fed7aa',
            border: '2px solid #f97316',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ea580c' }}>{expiredMedicines}</div>
            <div style={{ color: '#ea580c', fontWeight: '500' }}>Expired Medicines</div>
          </div>
        </div>

        {/* Interaction Checker Panel */}
        {showInteractionChecker && (
          <div style={{
            marginBottom: '25px',
            padding: '20px',
            backgroundColor: '#ede9fe',
            border: '2px solid #8b5cf6',
            borderRadius: '8px'
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#7c3aed',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '24px', marginRight: '10px' }}>⚠️</span>
              Medicine Interaction Checker
            </h2>
            <MedicineInteractionChecker />
          </div>
        )}

        {/* Pill Identification Game Panel */}
        {showPillGame && (
          <div style={{
            marginBottom: '25px',
            padding: '20px',
            backgroundColor: '#f0fdf4',
            border: '2px solid #4ade80',
            borderRadius: '8px'
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#16a34a',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '24px', marginRight: '10px' }}>🎯</span>
              Pill Identification Game
            </h2>
            <PillIdentificationGame />
          </div>
        )}

        {/* Loading State */}
        {state.loading.medicines && (
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
              }}>Loading medicines...</div>
              <div style={{ color: '#6b7280' }}>Please wait while we load your medicine information</div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{
            padding: '20px',
            backgroundColor: '#fee2e2',
            border: '2px solid #ef4444',
            borderRadius: '8px',
            color: '#dc2626',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Empty State */}
        {!state.loading.medicines && state.medicines.length === 0 && (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: '#f9fafb',
            border: '2px dashed #d1d5db',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '24px', color: '#6b7280', marginBottom: '10px' }}>No Medicines Found</div>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
              You don't have any medicines saved yet. Scan a medicine package to get started.
            </p>
            <button
              onClick={handleAddMedicine}
              style={{
                padding: '12px 24px',
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
              Scan Medicine
            </button>
          </div>
        )}

        {/* Medicine List */}
        {!state.loading.medicines && state.medicines.length > 0 && (
          <>
            <div style={{ marginBottom: '15px' }}>
              <p style={{ color: '#4b5563' }}>
                Showing {sortedMedicines.length} of {state.medicines.length} medicines
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: '20px',
              marginBottom: '25px'
            }}>
              {sortedMedicines.map((medicine) => {
                const isExpired = new Date(medicine.expiryDate) <= new Date();
                return (
                  <div
                    key={medicine.id}
                    style={{
                      border: `2px solid ${isExpired ? '#ef4444' : '#3b82f6'}`,
                      borderRadius: '8px',
                      padding: '20px',
                      backgroundColor: 'white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                      <div>
                        <h3 
                          style={{ 
                            fontSize: '18px', 
                            fontWeight: '600', 
                            color: isExpired ? '#dc2626' : '#1e40af',
                            marginBottom: '5px'
                          }}
                          tabIndex="0"
                        >
                          {medicine.name}
                        </h3>
                        <p style={{ color: '#6b7280', fontSize: '14px' }}>
                          {medicine.category} • {medicine.manufacturer}
                        </p>
                        {isExpired && (
                          <div style={{
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            display: 'inline-block',
                            marginTop: '5px'
                          }}>
                            EXPIRED
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => announceMedicineDetails(medicine)}
                        style={{
                          backgroundColor: '#f0f9ff',
                          border: '2px solid #3b82f6',
                          borderRadius: '50%',
                          width: '36px',
                          height: '36px',
                          cursor: 'pointer',
                          fontSize: '16px'
                        }}
                        tabIndex="0"
                        aria-label={`Read details for ${medicine.name}`}
                      >
                        🔊
                      </button>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <p style={{ fontWeight: '500', color: '#374151', marginBottom: '5px' }}>Active Ingredients:</p>
                      <p style={{ color: '#6b7280' }}>{medicine.activeIngredients.join(', ')}</p>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <p style={{ fontWeight: '500', color: '#374151', marginBottom: '5px' }}>Dosage:</p>
                      <p style={{ color: '#6b7280' }}>{medicine.dosage}</p>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <p style={{ fontWeight: '500', color: '#374151', marginBottom: '5px' }}>Usage:</p>
                      <p style={{ color: '#6b7280' }}>{medicine.usage}</p>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <p style={{ fontWeight: '500', color: '#374151', marginBottom: '5px' }}>Expiry Date:</p>
                      <p style={{ color: isExpired ? '#dc2626' : '#6b7280' }}>
                        {new Date(medicine.expiryDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      gap: '10px', 
                      flexWrap: 'wrap',
                      paddingTop: '15px',
                      borderTop: '1px solid #e5e7eb'
                    }}>
                      <button
                        onClick={() => handleDetailsClick(medicine.id)}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: '2px solid #2563eb',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          flex: 1,
                          minWidth: '100px'
                        }}
                        tabIndex="0"
                      >
                        View Details
                      </button>
                      
                      <button
                        onClick={() => handleSetReminder(medicine)}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: '2px solid #059669',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          flex: 1,
                          minWidth: '100px'
                        }}
                        tabIndex="0"
                      >
                        Set Reminder
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Emergency Information Section */}
        <div style={{ 
          marginTop: '30px', 
          padding: '20px', 
          backgroundColor: '#fef2f2', 
          border: '2px solid #fecaca',
          borderRadius: '8px' 
        }}>
          <h3 
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
          </h3>
          <ul style={{ 
            color: '#b91c1c',
            paddingLeft: '20px',
            fontSize: '14px'
          }}>
            <li style={{ marginBottom: '8px' }} tabIndex="0">Call emergency services if experiencing severe allergic reactions</li>
            <li style={{ marginBottom: '8px' }} tabIndex="0">Keep a list of all medications for emergency responders</li>
            <li style={{ marginBottom: '8px' }} tabIndex="0">Know the location of your emergency medications</li>
            <li tabIndex="0">Contact your doctor immediately if experiencing severe side effects</li>
          </ul>
        </div>

        {/* Accessibility Tips */}
        <div style={{ 
          marginTop: '20px', 
          padding: '20px', 
          backgroundColor: '#e0f2fe', 
          border: '2px solid #0ea5e9',
          borderRadius: '8px' 
        }}>
          <h3 
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
            Medicine Management Tips
          </h3>
          <ul style={{ 
            color: '#0284c7',
            paddingLeft: '20px',
            fontSize: '14px'
          }}>
            <li style={{ marginBottom: '8px' }} tabIndex="0">Always check expiry dates before taking any medicine</li>
            <li style={{ marginBottom: '8px' }} tabIndex="0">Store medicines in a cool, dry place away from direct sunlight</li>
            <li style={{ marginBottom: '8px' }} tabIndex="0">Follow the prescribed dosage and timing for best results</li>
            <li style={{ marginBottom: '8px' }} tabIndex="0">Use the reminder feature to stay on schedule</li>
            <li tabIndex="0">Contact your healthcare provider if you experience severe side effects</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MedicineListPage;