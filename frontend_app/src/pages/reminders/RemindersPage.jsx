import React, { useState, useEffect, useRef } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import useAccessibility from '../../hooks/useAccessibility';
import TimePickerModal from '../../components/reminders/TimePickerModal';

const RemindersPage = () => {
  const { state, actions } = useAppData();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [tempReminder, setTempReminder] = useState({
    medicineName: '',
    dosage: '',
    times: [],
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  });
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const { speak } = useAccessibility();
  const mainRef = useRef(null);

  useEffect(() => {
    // Focus main content area for screen readers
    if (mainRef.current) {
      mainRef.current.focus();
    }
  }, []);

  // Filter reminders based on activeTab, searchTerm, and filter
  const filteredReminders = state.reminders.filter(reminder => {
    // Apply search filter
    const matchesSearch = !searchTerm || 
      reminder.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reminder.dosage.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply activeTab filter
    let matchesTab = true;
    if (activeTab === 'upcoming') {
      matchesTab = reminder.isActive && new Date(reminder.nextDue) >= new Date();
    } else if (activeTab === 'taken') {
      matchesTab = reminder.lastTaken && new Date(reminder.lastTaken).toDateString() === new Date().toDateString();
    } else if (activeTab === 'all') {
      matchesTab = true;
    }
    
    // Apply status filter
    let matchesStatus = true;
    if (filter === 'active') {
      matchesStatus = reminder.isActive;
    } else if (filter === 'inactive') {
      matchesStatus = !reminder.isActive;
    }
    
    return matchesSearch && matchesTab && matchesStatus;
  });

  const handleAddReminder = () => {
    setIsAdding(true);
    setEditingReminder(null);
    setTempReminder({
      medicineName: '',
      dosage: '',
      times: [],
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    });
    setShowTimePicker(true);
    speak('Adding new reminder. Please enter medicine name and dosage.');
  };

  const handleEditReminder = (reminder) => {
    setIsAdding(false);
    setEditingReminder(reminder);
    setTempReminder({
      medicineName: reminder.medicineName,
      dosage: reminder.dosage,
      times: reminder.times || [],
      days: reminder.days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    });
    setShowTimePicker(true);
    speak(`Editing reminder for ${reminder.medicineName}`);
  };

  const handleSaveReminder = () => {
    const newReminder = {
      id: editingReminder ? editingReminder.id : Date.now(),
      medicineName: tempReminder.medicineName,
      dosage: tempReminder.dosage,
      times: tempReminder.times,
      days: tempReminder.days,
      isActive: true,
      createdAt: editingReminder ? editingReminder.createdAt : new Date().toISOString(),
      lastTaken: null,
      nextDue: tempReminder.times.length > 0 ? calculateNextDue(tempReminder.times, tempReminder.days) : null
    };

    if (editingReminder) {
      actions.updateReminder(newReminder);
      speak(`Reminder for ${newReminder.medicineName} updated successfully`);
    } else {
      actions.addReminder(newReminder);
      speak(`New reminder for ${newReminder.medicineName} added successfully`);
    }

    setShowTimePicker(false);
    setTempReminder({
      medicineName: '',
      dosage: '',
      times: [],
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    });
  };

  const handleDeleteReminder = (id) => {
    actions.removeReminder(id);
    speak('Reminder deleted successfully');
  };

  const handleToggleReminder = (id) => {
    const reminder = state.reminders.find(r => r.id === id);
    if (reminder) {
      const updatedReminder = { ...reminder, isActive: !reminder.isActive };
      actions.updateReminder(updatedReminder);
      speak(`${reminder.medicineName} reminder ${updatedReminder.isActive ? 'activated' : 'deactivated'}`);
    }
  };

  const handleMarkAsTaken = (id) => {
    actions.markAsTaken(id);
    speak('Dose marked as taken');
  };

  const calculateNextDue = (times, days) => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    
    // Map days to numbers (Monday = 1, Sunday = 0)
    const dayMap = {
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6
    };
    
    const todayIndex = days.indexOf(dayMap[currentDay]);
    
    // First, check if there are any remaining times for today
    if (todayIndex !== -1) {
      for (const time of times.sort()) {
        const [hours, minutes] = time.split(':').map(Number);
        if (hours > currentHours || (hours === currentHours && minutes > currentMinutes)) {
          const nextDue = new Date(now);
          nextDue.setHours(hours, minutes, 0, 0);
          return nextDue.toISOString();
        }
      }
    }
    
    // If no remaining times today, find the next day with scheduled times
    for (let i = 1; i <= 7; i++) {
      const nextDay = (currentDay + i) % 7;
      if (days.includes(nextDay)) {
        const nextDue = new Date(now);
        nextDue.setDate(now.getDate() + i);
        // Use the first scheduled time for that day
        const [hours, minutes] = times[0].split(':').map(Number);
        nextDue.setHours(hours, minutes, 0, 0);
        return nextDue.toISOString();
      }
    }
    
    // Fallback to the first time in the week
    if (days.length > 0 && times.length > 0) {
      const nextDay = days[0];
      const daysUntil = nextDay > currentDay ? nextDay - currentDay : (7 - currentDay) + nextDay;
      const nextDue = new Date(now);
      nextDue.setDate(now.getDate() + daysUntil);
      const [hours, minutes] = times[0].split(':').map(Number);
      nextDue.setHours(hours, minutes, 0, 0);
      return nextDue.toISOString();
    }
    
    return null;
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const getDayName = (dayNumber) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber] || '';
  };

  // Function to announce reminder details for screen readers
  const announceReminderDetails = (reminder) => {
    const details = `${reminder.medicineName}. Dosage: ${reminder.dosage}. Next due: ${formatTime(reminder.nextDue)}. ${reminder.isActive ? 'Active' : 'Inactive'} reminder.`;
    speak(details);
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
            Medication Reminders
          </h1>
          <p 
            style={{ 
              fontSize: '16px', 
              color: '#4b5563',
              fontStyle: 'italic'
            }}
            tabIndex="0"
          >
            Set and manage your medication schedule with customizable alerts
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
            <input
              type="text"
              placeholder="Search reminders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
          </div>
          <button
            onClick={handleAddReminder}
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
            Add Reminder
          </button>
        </div>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '5px', 
          marginBottom: '25px',
          borderBottom: '2px solid #d1d5db'
        }}>
          <button
            onClick={() => {
              setActiveTab('upcoming');
              speak('Showing upcoming reminders');
            }}
            style={{
              padding: '12px 20px',
              backgroundColor: activeTab === 'upcoming' ? '#3b82f6' : '#f3f4f6',
              color: activeTab === 'upcoming' ? 'white' : '#4b5563',
              border: '1px solid #d1d5db',
              borderRight: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              borderRadius: '6px 0 0 6px'
            }}
            tabIndex="0"
          >
            Upcoming ({state.reminders.filter(r => r.isActive && new Date(r.nextDue) >= new Date()).length})
          </button>
          <button
            onClick={() => {
              setActiveTab('taken');
              speak('Showing taken medicines');
            }}
            style={{
              padding: '12px 20px',
              backgroundColor: activeTab === 'taken' ? '#3b82f6' : '#f3f4f6',
              color: activeTab === 'taken' ? 'white' : '#4b5563',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              fontWeight: '600'
            }}
            tabIndex="0"
          >
            Taken Today ({state.reminders.filter(rem => 
              rem.lastTaken && 
              new Date(rem.lastTaken).toDateString() === new Date().toDateString()
            ).length})
          </button>
          <button
            onClick={() => {
              setActiveTab('all');
              speak('Showing all reminders');
            }}
            style={{
              padding: '12px 20px',
              backgroundColor: activeTab === 'all' ? '#3b82f6' : '#f3f4f6',
              color: activeTab === 'all' ? 'white' : '#4b5563',
              border: '1px solid #d1d5db',
              borderLeft: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              borderRadius: '0 6px 6px 0'
            }}
            tabIndex="0"
          >
            All ({state.reminders.length})
          </button>
        </div>

        {/* Filter Controls */}
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          marginBottom: '25px',
          padding: '15px',
          backgroundColor: '#f0f9ff',
          borderRadius: '8px',
          border: '2px solid #bae6fd'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#1e40af' }}>Status:</label>
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
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
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
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e40af' }}>{state.reminders.length}</div>
            <div style={{ color: '#1e40af', fontWeight: '500' }}>Total Reminders</div>
          </div>
          <div style={{
            padding: '15px',
            backgroundColor: '#dcfce7',
            border: '2px solid #22c55e',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>
              {state.reminders.filter(r => r.isActive).length}
            </div>
            <div style={{ color: '#16a34a', fontWeight: '500' }}>Active Reminders</div>
          </div>
          <div style={{
            padding: '15px',
            backgroundColor: '#fed7aa',
            border: '2px solid #f97316',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ea580c' }}>
              {state.reminders.filter(rem => 
                rem.lastTaken && 
                new Date(rem.lastTaken).toDateString() === new Date().toDateString()
              ).length}
            </div>
            <div style={{ color: '#ea580c', fontWeight: '500' }}>Taken Today</div>
          </div>
        </div>

        {/* Loading State */}
        {state.loading.reminders && (
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
              }}>Loading reminders...</div>
              <div style={{ color: '#6b7280' }}>Please wait while we load your medication reminders</div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!state.loading.reminders && state.reminders.length === 0 && (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: '#f9fafb',
            border: '2px dashed #d1d5db',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '24px', color: '#6b7280', marginBottom: '10px' }}>No Reminders Yet</div>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
              You haven't set any medication reminders yet. Click "Add Reminder" to get started.
            </p>
            <button
              onClick={handleAddReminder}
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
              Add Your First Reminder
            </button>
          </div>
        )}

        {/* Reminders List */}
        {!state.loading.reminders && state.reminders.length > 0 && (
          <>
            <div style={{ marginBottom: '15px' }}>
              <p style={{ color: '#4b5563' }}>
                Showing {filteredReminders.length} of {state.reminders.length} reminders
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: '20px',
              marginBottom: '25px'
            }}>
              {filteredReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  style={{
                    border: `2px solid ${reminder.isActive ? '#3b82f6' : '#d1d5db'}`,
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
                          color: reminder.isActive ? '#1e40af' : '#6b7280',
                          marginBottom: '5px'
                        }}
                        tabIndex="0"
                      >
                        {reminder.medicineName}
                      </h3>
                      <p style={{ color: '#6b7280', fontSize: '14px' }}>
                        {reminder.dosage}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => announceReminderDetails(reminder)}
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
                        aria-label={`Read details for ${reminder.medicineName} reminder`}
                      >
                        🔊
                      </button>
                      <button
                        onClick={() => handleEditReminder(reminder)}
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
                        aria-label={`Edit ${reminder.medicineName} reminder`}
                      >
                        ✏️
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ fontWeight: '500', color: '#374151', marginBottom: '5px' }}>Schedule:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {reminder.times.map((time, idx) => (
                        <span
                          key={idx}
                          style={{
                            backgroundColor: '#dbeafe',
                            color: '#1e40af',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}
                        >
                          {formatTime(time)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ fontWeight: '500', color: '#374151', marginBottom: '5px' }}>Days:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {reminder.days.map((day, idx) => (
                        <span
                          key={idx}
                          style={{
                            backgroundColor: '#d1fae5',
                            color: '#065f46',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}
                        >
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ fontWeight: '500', color: '#374151', marginBottom: '5px' }}>Next Due:</p>
                    <p style={{ color: '#6b7280', fontWeight: '600' }}>
                      {reminder.nextDue ? `${formatTime(reminder.nextDue)} on ${formatDate(reminder.nextDue)}` : 'Not scheduled'}
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
                      onClick={() => handleToggleReminder(reminder.id)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: reminder.isActive ? '#ef4444' : '#10b981',
                        color: 'white',
                        border: '2px solid ' + (reminder.isActive ? '#dc2626' : '#059669'),
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        flex: 1,
                        minWidth: '100px'
                      }}
                      tabIndex="0"
                    >
                      {reminder.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    
                    <button
                      onClick={() => handleMarkAsTaken(reminder.id)}
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
                      Mark Taken
                    </button>
                    
                    <button
                      onClick={() => handleDeleteReminder(reminder.id)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#9ca3af',
                        color: 'white',
                        border: '2px solid #6b7280',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        flex: 1,
                        minWidth: '100px'
                      }}
                      tabIndex="0"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Time Picker Modal */}
        {showTimePicker && (
          <TimePickerModal
            reminder={tempReminder}
            setReminder={setTempReminder}
            onSave={handleSaveReminder}
            onClose={() => {
              setShowTimePicker(false);
              setTempReminder({
                medicineName: '',
                dosage: '',
                times: [],
                days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
              });
            }}
            isEditing={!!editingReminder}
          />
        )}

        {/* Instructions Section */}
        <div style={{ 
          marginTop: '30px', 
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
            How to Use Reminders
          </h3>
          <ul style={{ 
            color: '#0284c7',
            paddingLeft: '20px',
            fontSize: '14px'
          }}>
            <li style={{ marginBottom: '8px' }} tabIndex="0">Click "Add Reminder" to create a new medication reminder</li>
            <li style={{ marginBottom: '8px' }} tabIndex="0">Set the medicine name, dosage, times, and days for your reminder</li>
            <li style={{ marginBottom: '8px' }} tabIndex="0">Use the toggle to activate or deactivate reminders as needed</li>
            <li style={{ marginBottom: '8px' }} tabIndex="0">Mark doses as taken to track your medication schedule</li>
            <li style={{ marginBottom: '8px' }} tabIndex="0">View upcoming reminders to stay on schedule</li>
            <li style={{ marginBottom: '8px' }} tabIndex="0">Check "Taken Today" to see what you've already taken</li>
            <li tabIndex="0">Use the search bar to quickly find specific reminders</li>
          </ul>
        </div>

        {/* Emergency Information Section */}
        <div style={{ 
          marginTop: '20px', 
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
            <li style={{ marginBottom: '8px' }} tabIndex="0">Never skip important medications without consulting your doctor</li>
            <li style={{ marginBottom: '8px' }} tabIndex="0">If you miss a dose, follow your doctor's instructions</li>
            <li style={{ marginBottom: '8px' }} tabIndex="0">Keep a backup supply of critical medications</li>
            <li style={{ marginBottom: '8px' }} tabIndex="0">Inform emergency responders of your medications</li>
            <li tabIndex="0">Contact your doctor immediately if you experience severe side effects</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RemindersPage;