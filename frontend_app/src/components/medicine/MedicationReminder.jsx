import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ToggleSwitch } from '../common/ToggleSwitch';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Alert } from '../common/Alert';
import { LoadingSpinner } from '../common/LoadingSpinner';
import reminderService from '../../services/reminderService';

const MedicationReminder = ({ medicine }) => {
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [schedule, setSchedule] = useState({ times: ['08:00', '12:00', '18:00'] });
  const [customTime, setCustomTime] = useState('08:00');
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Initialize reminder settings
  useEffect(() => {
    // Check if reminder exists for this medicine
    const existingReminder = reminderService.getAllReminders().find(r => r.medicineId === medicine.id);
    if (existingReminder) {
      setReminderEnabled(existingReminder.isActive);
      setSchedule(existingReminder.schedule);
    }
  }, [medicine.id]);

  // Update notification permission status
  useEffect(() => {
    const handlePermissionChange = () => {
      setNotificationPermission(Notification.permission);
    };

    // Listen for permission changes
    window.addEventListener('notificationpermissionchange', handlePermissionChange);

    return () => {
      window.removeEventListener('notificationpermissionchange', handlePermissionChange);
    };
  }, []);

  // Handle toggle for reminder
  const handleToggleReminder = async (enabled) => {
    setReminderEnabled(enabled);
    
    if (enabled) {
      // Enable reminders
      reminderService.toggleReminders(true);
      
      // Add or update reminder
      const reminder = {
        id: medicine.id,
        name: medicine.name,
        dosage: medicine.dosage,
        schedule: schedule
      };
      
      reminderService.addReminder(reminder);
      setSuccessMessage('Reminder enabled successfully!');
    } else {
      // Disable reminders for this medicine
      reminderService.toggleReminders(false);
      setSuccessMessage('Reminder disabled');
    }
    
    // Clear messages after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
      setErrorMessage('');
    }, 3000);
  };

  // Handle adding a custom time
  const handleAddTime = () => {
    if (!schedule.times.includes(customTime)) {
      const newSchedule = {
        ...schedule,
        times: [...schedule.times, customTime]
      };
      setSchedule(newSchedule);
      setSuccessMessage('Time added to schedule');
      
      // Update reminder with new schedule
      const allReminders = reminderService.getAllReminders();
      const reminder = allReminders.find(r => r.medicineId === medicine.id);
      if (reminder) {
        reminderService.updateReminderSchedule(reminder.id, newSchedule);
      }
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setErrorMessage('Time already exists in schedule');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  // Handle removing a time
  const handleRemoveTime = (timeToRemove) => {
    const newSchedule = {
      ...schedule,
      times: schedule.times.filter(time => time !== timeToRemove)
    };
    setSchedule(newSchedule);
    setSuccessMessage('Time removed from schedule');
    
    // Update reminder with new schedule
    const allReminders = reminderService.getAllReminders();
    const reminder = allReminders.find(r => r.medicineId === medicine.id);
    if (reminder) {
      reminderService.updateReminderSchedule(reminder.id, newSchedule);
    }
    
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        setSuccessMessage('Notifications enabled');
      } else {
        setErrorMessage('Notifications disabled - some features may not work');
      }
      setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 3000);
    }
  };

  // Format time for display
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-indigo-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-indigo-800">Medication Reminder</h3>
        <ToggleSwitch
          checked={reminderEnabled}
          onChange={handleToggleReminder}
          label={reminderEnabled ? 'Reminders ON' : 'Reminders OFF'}
          labelPosition="left"
          className="bg-indigo-600"
        />
      </div>

      {successMessage && (
        <Alert type="success" message={successMessage} className="mb-4" />
      )}
      
      {errorMessage && (
        <Alert type="error" message={errorMessage} className="mb-4" />
      )}

      {!reminderEnabled && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
          <p className="text-yellow-800 font-medium">Reminders are currently disabled</p>
          <p className="text-yellow-700 text-sm">Enable reminders to receive notifications for taking your medication</p>
        </div>
      )}

      {reminderEnabled && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg border border-indigo-200">
            <h4 className="font-semibold text-indigo-700 mb-2">Current Schedule</h4>
            <div className="flex flex-wrap gap-2">
              {schedule.times.map((time, index) => (
                <div 
                  key={index} 
                  className="flex items-center bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm"
                >
                  <span>{formatTime(time)}</span>
                  <button
                    onClick={() => handleRemoveTime(time)}
                    className="ml-2 text-red-600 hover:text-red-800"
                    aria-label={`Remove time ${time}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Custom Time
              </label>
              <Input
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="self-end">
              <Button 
                onClick={handleAddTime}
                variant="primary"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                Add Time
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-indigo-200">
            <h4 className="font-semibold text-indigo-700 mb-2">Notification Settings</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Browser Notifications</span>
                <Button 
                  onClick={requestNotificationPermission}
                  variant={notificationPermission === 'granted' ? 'secondary' : 'primary'}
                  size="sm"
                >
                  {notificationPermission === 'granted' ? 'Enabled' : 'Enable'}
                </Button>
              </div>
              <p className="text-sm text-gray-600">
                {notificationPermission === 'granted' 
                  ? 'You will receive browser notifications for medication reminders.'
                  : 'Enable browser notifications for additional reminder alerts.'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-indigo-200">
        <h4 className="font-semibold text-indigo-700 mb-2">Upcoming Doses</h4>
        <div className="space-y-2">
          {reminderEnabled && schedule.times.slice(0, 3).map((time, index) => {
            const [hours, minutes] = time.split(':');
            const nextDate = new Date();
            const currentTime = new Date();
            currentTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            
            if (currentTime < new Date()) {
              nextDate.setDate(nextDate.getDate() + 1);
            }
            
            nextDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            
            return (
              <div key={index} className="flex justify-between items-center p-2 bg-indigo-50 rounded-lg">
                <span className="font-medium">{formatTime(time)}</span>
                <span className="text-sm text-gray-600">
                  {nextDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
            );
          })}
          {(!reminderEnabled || schedule.times.length === 0) && (
            <p className="text-gray-600 italic">Enable reminders to see upcoming doses</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MedicationReminder;