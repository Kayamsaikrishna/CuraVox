import React, { useState, useEffect } from 'react';

const TimePickerModal = ({ reminder, setReminder, onSave, onClose, isEditing }) => {
  const [selectedTime, setSelectedTime] = useState('');
  const [availableTimes, setAvailableTimes] = useState(reminder.times || []);
  const [selectedDays, setSelectedDays] = useState(reminder.days || [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ]);

  const daysOfWeek = [
    { key: 'sunday', label: 'Sun' },
    { key: 'monday', label: 'Mon' },
    { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' },
    { key: 'saturday', label: 'Sat' }
  ];

  // Generate time options in 30-minute intervals
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const formattedTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      timeOptions.push({ value: timeString, label: formattedTime });
    }
  }

  useEffect(() => {
    if (reminder) {
      setAvailableTimes(reminder.times || []);
      setSelectedDays(reminder.days || [
        'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
      ]);
    }
  }, [reminder]);

  const handleAddTime = () => {
    if (selectedTime && !availableTimes.includes(selectedTime)) {
      setAvailableTimes([...availableTimes, selectedTime]);
    }
  };

  const handleRemoveTime = (timeToRemove) => {
    setAvailableTimes(availableTimes.filter(time => time !== timeToRemove));
  };

  const toggleDaySelection = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSave = () => {
    setReminder(prev => ({
      ...prev,
      times: availableTimes,
      days: selectedDays
    }));
    onSave();
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '25px',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          border: '2px solid #3b82f6'
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="time-picker-title"
        tabIndex="-1"
      >
        <h2 
          id="time-picker-title"
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1e40af',
            marginBottom: '20px',
            borderBottom: '2px solid #3b82f6',
            paddingBottom: '10px'
          }}
          tabIndex="0"
        >
          {isEditing ? 'Edit Reminder' : 'Set New Reminder'}
        </h2>

        {/* Medicine Name and Dosage Inputs */}
        <div style={{ marginBottom: '20px' }}>
          <label 
            htmlFor="medicineName" 
            style={{ 
              display: 'block', 
              fontWeight: '600', 
              color: '#374151', 
              marginBottom: '8px',
              fontSize: '16px'
            }}
            tabIndex="0"
          >
            Medicine Name
          </label>
          <input
            id="medicineName"
            type="text"
            value={reminder.medicineName || ''}
            onChange={(e) => setReminder(prev => ({ ...prev, medicineName: e.target.value }))}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #3b82f6',
              borderRadius: '6px',
              fontSize: '16px',
              backgroundColor: 'white'
            }}
            placeholder="Enter medicine name"
            tabIndex="0"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label 
            htmlFor="dosage" 
            style={{ 
              display: 'block', 
              fontWeight: '600', 
              color: '#374151', 
              marginBottom: '8px',
              fontSize: '16px'
            }}
            tabIndex="0"
          >
            Dosage
          </label>
          <input
            id="dosage"
            type="text"
            value={reminder.dosage || ''}
            onChange={(e) => setReminder(prev => ({ ...prev, dosage: e.target.value }))}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #3b82f6',
              borderRadius: '6px',
              fontSize: '16px',
              backgroundColor: 'white'
            }}
            placeholder="Enter dosage (e.g., Take 1 tablet)"
            tabIndex="0"
          />
        </div>

        {/* Time Selection */}
        <div style={{ marginBottom: '20px' }}>
          <h3 
            style={{ 
              fontWeight: '600', 
              color: '#374151', 
              marginBottom: '12px',
              fontSize: '18px'
            }}
            tabIndex="0"
          >
            Select Time(s)
          </h3>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              style={{
                padding: '10px',
                border: '2px solid #3b82f6',
                borderRadius: '6px',
                fontSize: '16px',
                backgroundColor: 'white',
                flex: 1
              }}
              tabIndex="0"
            >
              <option value="">Select a time</option>
              {timeOptions.map((time) => (
                <option key={time.value} value={time.value}>
                  {time.label}
                </option>
              ))}
            </select>
            
            <button
              onClick={handleAddTime}
              style={{
                padding: '10px 15px',
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
              Add Time
            </button>
          </div>

          {/* Selected Times Display */}
          {availableTimes.length > 0 && (
            <div style={{ marginTop: '15px' }}>
              <p style={{ fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Selected Times:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {availableTimes.map((time) => {
                  const formattedTime = new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  });
                  return (
                    <div
                      key={time}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        padding: '8px 12px',
                        borderRadius: '20px',
                        fontSize: '14px'
                      }}
                    >
                      {formattedTime}
                      <button
                        onClick={() => handleRemoveTime(time)}
                        style={{
                          marginLeft: '8px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        aria-label={`Remove time ${formattedTime}`}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Day Selection */}
        <div style={{ marginBottom: '25px' }}>
          <h3 
            style={{ 
              fontWeight: '600', 
              color: '#374151', 
              marginBottom: '12px',
              fontSize: '18px'
            }}
            tabIndex="0"
          >
            Select Days
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {daysOfWeek.map((day) => (
              <button
                key={day.key}
                onClick={() => toggleDaySelection(day.key)}
                style={{
                  padding: '10px',
                  backgroundColor: selectedDays.includes(day.key) ? '#3b82f6' : '#f3f4f6',
                  color: selectedDays.includes(day.key) ? 'white' : '#4b5563',
                  border: '2px solid #3b82f6',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: selectedDays.includes(day.key) ? '600' : 'normal',
                  fontSize: '14px'
                }}
                tabIndex="0"
                aria-pressed={selectedDays.includes(day.key)}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 20px',
              backgroundColor: '#9ca3af',
              color: 'white',
              border: '2px solid #6b7280',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '16px'
            }}
            tabIndex="0"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSave}
            style={{
              padding: '12px 20px',
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
            Save Reminder
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimePickerModal;