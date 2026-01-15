import React, { useState, useEffect } from 'react';
import useAccessibility from '../../hooks/useAccessibility';

const MedicineInteractionChecker = () => {
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [potentialInteractions, setPotentialInteractions] = useState([]);
  const [allMedicines, setAllMedicines] = useState([]);
  const { speak } = useAccessibility();

  // Mock medicine data
  const mockMedicines = [
    { id: 1, name: "Warfarin", category: "Blood Thinner" },
    { id: 2, name: "Aspirin", category: "Pain Relief" },
    { id: 3, name: "Ibuprofen", category: "Anti-inflammatory" },
    { id: 4, name: "Simvastatin", category: "Cholesterol" },
    { id: 5, name: "Metformin", category: "Diabetes" },
    { id: 6, name: "Lisinopril", category: "Blood Pressure" },
    { id: 7, name: "Levothyroxine", category: "Thyroid" },
    { id: 8, name: "Albuterol", category: "Asthma" }
  ];

  // Mock interactions data
  const mockInteractions = [
    {
      medicines: ["Warfarin", "Aspirin"],
      severity: "High",
      description: "Increased risk of bleeding when taken together",
      recommendation: "Consult your doctor before combining these medications"
    },
    {
      medicines: ["Warfarin", "Ibuprofen"],
      severity: "Moderate",
      description: "May increase bleeding risk",
      recommendation: "Monitor for signs of bleeding"
    },
    {
      medicines: ["Simvastatin", "Warfarin"],
      severity: "Moderate",
      description: "May increase risk of muscle damage",
      recommendation: "Regular monitoring of liver enzymes recommended"
    },
    {
      medicines: ["Lisinopril", "Ibuprofen"],
      severity: "Low",
      description: "May reduce effectiveness of Lisinopril",
      recommendation: "Monitor blood pressure regularly"
    }
  ];

  useEffect(() => {
    setAllMedicines(mockMedicines);
  }, []);

  useEffect(() => {
    if (selectedMedicines.length >= 2) {
      const foundInteractions = mockInteractions.filter(interaction => 
        interaction.medicines.every(med => selectedMedicines.includes(med))
      );
      setPotentialInteractions(foundInteractions);
      
      if (foundInteractions.length > 0) {
        speak(`Found ${foundInteractions.length} potential interactions between selected medicines.`);
      } else {
        speak('No known interactions found between selected medicines.');
      }
    } else {
      setPotentialInteractions([]);
    }
  }, [selectedMedicines, speak]);

  const toggleMedicineSelection = (medicineName) => {
    if (selectedMedicines.includes(medicineName)) {
      setSelectedMedicines(selectedMedicines.filter(name => name !== medicineName));
    } else {
      setSelectedMedicines([...selectedMedicines, medicineName]);
    }
  };

  const clearSelection = () => {
    setSelectedMedicines([]);
    speak('Selection cleared');
  };

  return (
    <div style={{ 
      backgroundColor: '#ede9fe', 
      border: '2px solid #8b5cf6', 
      borderRadius: '8px', 
      padding: '24px' 
    }}>
      <h2 
        style={{ 
          fontSize: '20px', 
          fontWeight: '600', 
          color: '#7c3aed',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center'
        }}
        tabIndex="0"
      >
        <span style={{ fontSize: '24px', marginRight: '10px' }}>⚠️</span>
        Medicine Interaction Checker
      </h2>
      
      <p style={{ 
        color: '#7c3aed', 
        marginBottom: '16px',
        fontSize: '16px'
      }} tabIndex="0">
        Select medicines to check for potential interactions:
      </p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
        gap: '12px',
        marginBottom: '20px'
      }}>
        {allMedicines.map(medicine => (
          <button
            key={medicine.id}
            onClick={() => toggleMedicineSelection(medicine.name)}
            style={{
              padding: '10px',
              backgroundColor: selectedMedicines.includes(medicine.name) ? '#8b5cf6' : '#e9d5ff',
              color: selectedMedicines.includes(medicine.name) ? 'white' : '#7c3aed',
              border: '2px solid #8b5cf6',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: selectedMedicines.includes(medicine.name) ? '600' : 'normal',
              textAlign: 'center',
              transition: 'all 0.2s'
            }}
            tabIndex="0"
            aria-pressed={selectedMedicines.includes(medicine.name)}
          >
            {medicine.name}
          </button>
        ))}
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <p style={{ 
          color: '#7c3aed', 
          fontWeight: '500',
          fontSize: '14px'
        }} tabIndex="0">
          Selected: {selectedMedicines.length} medicine(s)
        </p>
        <button
          onClick={clearSelection}
          style={{
            padding: '8px 12px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: '2px solid #dc2626',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
          tabIndex="0"
        >
          Clear Selection
        </button>
      </div>
      
      {potentialInteractions.length > 0 ? (
        <div>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#b91c1c',
            marginBottom: '12px'
          }} tabIndex="0">
            Potential Interactions Found
          </h3>
          
          {potentialInteractions.map((interaction, index) => (
            <div 
              key={index}
              style={{
                backgroundColor: interaction.severity === 'High' ? '#fee2e2' : 
                               interaction.severity === 'Moderate' ? '#ffedd5' : '#fef3c7',
                border: `2px solid ${interaction.severity === 'High' ? '#fecaca' : 
                         interaction.severity === 'Moderate' ? '#fed1a4' : '#fde68a'}`,
                borderRadius: '6px',
                padding: '16px',
                marginBottom: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h4 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: interaction.severity === 'High' ? '#dc2626' : 
                         interaction.severity === 'Moderate' ? '#ea580c' : '#ca8a04'
                }}>
                  {interaction.medicines.join(' + ')}
                </h4>
                <span style={{
                  padding: '4px 8px',
                  backgroundColor: interaction.severity === 'High' ? '#dc2626' : 
                                 interaction.severity === 'Moderate' ? '#ea580c' : '#ca8a04',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {interaction.severity.toUpperCase()} RISK
                </span>
              </div>
              
              <p style={{ color: interaction.severity === 'High' ? '#dc2626' : 
                         interaction.severity === 'Moderate' ? '#ea580c' : '#ca8a04', 
                         marginBottom: '8px' }}>
                <strong>Description:</strong> {interaction.description}
              </p>
              
              <p style={{ color: interaction.severity === 'High' ? '#dc2626' : 
                         interaction.severity === 'Moderate' ? '#ea580c' : '#ca8a04' }}>
                <strong>Recommendation:</strong> {interaction.recommendation}
              </p>
            </div>
          ))}
        </div>
      ) : selectedMedicines.length >= 2 ? (
        <div style={{
          backgroundColor: '#dcfce7',
          border: '2px solid #86efac',
          borderRadius: '6px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <p style={{ 
            color: '#16a34a', 
            fontWeight: '600',
            fontSize: '16px'
          }} tabIndex="0">
            No known interactions found between selected medicines.
          </p>
          <p style={{ color: '#16a34a', marginTop: '8px' }} tabIndex="0">
            Always consult your healthcare provider before combining medications.
          </p>
        </div>
      ) : selectedMedicines.length === 1 ? (
        <div style={{
          backgroundColor: '#fffbeb',
          border: '2px solid #fbbf24',
          borderRadius: '6px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <p style={{ 
            color: '#d97706', 
            fontWeight: '600',
            fontSize: '16px'
          }} tabIndex="0">
            Select at least one more medicine to check for interactions.
          </p>
        </div>
      ) : (
        <div style={{
          backgroundColor: '#e0f2fe',
          border: '2px solid #7dd3fc',
          borderRadius: '6px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <p style={{ 
            color: '#0284c7', 
            fontWeight: '600',
            fontSize: '16px'
          }} tabIndex="0">
            Select medicines from the list above to check for potential interactions.
          </p>
        </div>
      )}
      
      <div style={{ 
        marginTop: '20px', 
        padding: '16px', 
        backgroundColor: '#f0f9ff', 
        border: '2px solid #bae6fd',
        borderRadius: '6px' 
      }}>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          color: '#0284c7',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center'
        }} tabIndex="0">
          <span style={{ fontSize: '18px', marginRight: '8px' }}>💡</span>
          Important Note
        </h3>
        <p style={{ color: '#0284c7', fontSize: '14px' }} tabIndex="0">
          This interaction checker is for informational purposes only. 
          Always consult your healthcare provider or pharmacist for personalized advice 
          about potential drug interactions.
        </p>
      </div>
    </div>
  );
};

export default MedicineInteractionChecker;