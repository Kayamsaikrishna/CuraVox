import { speak } from '../utils/speech';

class ReminderService {
  constructor() {
    this.reminders = [];
    this.timers = new Map();
    this.loadFromLocalStorage();
    this.startMonitoring();
  }

  // Load reminders from localStorage
  loadFromLocalStorage() {
    try {
      const storedReminders = localStorage.getItem('medicationReminders');
      if (storedReminders) {
        this.reminders = JSON.parse(storedReminders);
        // Update nextDue times based on current time
        this.reminders.forEach(reminder => {
          if (reminder.isActive && reminder.times && reminder.days) {
            reminder.nextDue = this.calculateNextDue(reminder.times, reminder.days);
          }
        });
      }
    } catch (error) {
      console.error('Error loading reminders from localStorage:', error);
    }
  }

  // Save reminders to localStorage
  saveToLocalStorage() {
    try {
      localStorage.setItem('medicationReminders', JSON.stringify(this.reminders));
    } catch (error) {
      console.error('Error saving reminders to localStorage:', error);
    }
  }

  // Get all reminders
  getAllReminders() {
    return this.reminders;
  }

  // Add a new reminder
  addReminder(reminderData) {
    const newReminder = {
      id: Date.now(),
      ...reminderData,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastTaken: null,
      nextDue: null
    };

    // Calculate the next due time
    if (newReminder.times && newReminder.days) {
      newReminder.nextDue = this.calculateNextDue(newReminder.times, newReminder.days);
    }

    this.reminders.push(newReminder);
    this.saveToLocalStorage();
    this.scheduleReminder(newReminder);

    // Notify user
    this.notifyUser(`Reminder added for ${newReminder.medicineName}`, 'info');

    return newReminder;
  }

  // Update an existing reminder
  updateReminder(id, reminderData) {
    const index = this.reminders.findIndex(rem => rem.id === id);
    if (index !== -1) {
      // Clear existing timer for this reminder
      this.clearReminderTimer(id);

      const updatedReminder = {
        ...this.reminders[index],
        ...reminderData
      };

      // Recalculate next due time if times/days changed
      if (reminderData.times || reminderData.days) {
        updatedReminder.nextDue = this.calculateNextDue(
          reminderData.times || this.reminders[index].times,
          reminderData.days || this.reminders[index].days
        );
      }

      this.reminders[index] = updatedReminder;
      this.saveToLocalStorage();
      
      // Reschedule if active
      if (updatedReminder.isActive) {
        this.scheduleReminder(updatedReminder);
      }

      // Notify user
      this.notifyUser(`Reminder updated for ${updatedReminder.medicineName}`, 'info');

      return updatedReminder;
    }
    return null;
  }

  // Remove a reminder
  removeReminder(id) {
    const index = this.reminders.findIndex(rem => rem.id === id);
    if (index !== -1) {
      const removedReminder = this.reminders.splice(index, 1)[0];
      this.clearReminderTimer(id);
      this.saveToLocalStorage();

      // Notify user
      this.notifyUser(`Reminder removed for ${removedReminder.medicineName}`, 'info');

      return removedReminder;
    }
    return null;
  }

  // Toggle reminder activation
  toggleReminder(id) {
    const reminder = this.reminders.find(rem => rem.id === id);
    if (reminder) {
      reminder.isActive = !reminder.isActive;
      
      if (reminder.isActive) {
        // Recalculate next due time
        if (reminder.times && reminder.days) {
          reminder.nextDue = this.calculateNextDue(reminder.times, reminder.days);
        }
        this.scheduleReminder(reminder);
        this.notifyUser(`Reminder activated for ${reminder.medicineName}`, 'success');
      } else {
        this.clearReminderTimer(id);
        this.notifyUser(`Reminder deactivated for ${reminder.medicineName}`, 'info');
      }
      
      this.saveToLocalStorage();
      return reminder;
    }
    return null;
  }

  // Mark a reminder as taken
  markAsTaken(id) {
    const reminder = this.reminders.find(rem => rem.id === id);
    if (reminder) {
      reminder.lastTaken = new Date().toISOString();
      
      // Calculate next due time
      if (reminder.times && reminder.days) {
        reminder.nextDue = this.calculateNextDue(reminder.times, reminder.days);
      }
      
      this.saveToLocalStorage();

      // Notify user
      this.notifyUser(`Dose marked as taken for ${reminder.medicineName}`, 'success');

      return reminder;
    }
    return null;
  }

  // Calculate the next due time for a reminder
  calculateNextDue(times, days) {
    if (!times || !days || times.length === 0 || days.length === 0) {
      return null;
    }

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

    // Convert day strings to numbers
    const dayNumbers = days.map(day => typeof day === 'string' ? dayMap[day.toLowerCase()] : day);

    // First, check if today is one of the scheduled days
    if (dayNumbers.includes(currentDay)) {
      // Look for any remaining times today
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
      if (dayNumbers.includes(nextDay)) {
        const nextDue = new Date(now);
        nextDue.setDate(now.getDate() + i);
        // Use the first scheduled time for that day
        const [hours, minutes] = times[0].split(':').map(Number);
        nextDue.setHours(hours, minutes, 0, 0);
        return nextDue.toISOString();
      }
    }

    // Fallback to the first time in the week
    if (dayNumbers.length > 0 && times.length > 0) {
      const nextDay = dayNumbers[0];
      const daysUntil = nextDay >= currentDay ? nextDay - currentDay : (7 - currentDay) + nextDay;
      const nextDue = new Date(now);
      nextDue.setDate(now.getDate() + daysUntil);
      const [hours, minutes] = times[0].split(':').map(Number);
      nextDue.setHours(hours, minutes, 0, 0);
      return nextDue.toISOString();
    }

    return null;
  }

  // Schedule a reminder
  scheduleReminder(reminder) {
    if (!reminder.isActive || !reminder.nextDue) {
      return;
    }

    const nextDueDate = new Date(reminder.nextDue);
    const now = new Date();
    const timeUntilDue = nextDueDate.getTime() - now.getTime();

    // Clear existing timer if any
    this.clearReminderTimer(reminder.id);

    if (timeUntilDue > 0) {
      const timerId = setTimeout(() => {
        this.triggerReminder(reminder);
        // Reschedule the next occurrence
        if (reminder.isActive) {
          const newNextDue = this.calculateNextDue(reminder.times, reminder.days);
          if (newNextDue) {
            reminder.nextDue = newNextDue;
            this.scheduleReminder(reminder);
            this.saveToLocalStorage();
          }
        }
      }, timeUntilDue);

      this.timers.set(reminder.id, timerId);
    }
  }

  // Trigger a reminder notification
  triggerReminder(reminder) {
    // Show browser notification
    this.showNotification(reminder);

    // Play audio alert
    this.playAudioAlert();

    // Speak the reminder
    speak(`Time to take your ${reminder.medicineName}. ${reminder.dosage}`);
  }

  // Show browser notification
  showNotification(reminder) {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(`Medication Reminder: ${reminder.medicineName}`, {
          body: `${reminder.dosage}\nTime: ${new Date(reminder.nextDue).toLocaleTimeString()}`,
          icon: '/favicon.ico',
          tag: `reminder-${reminder.id}`
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(`Medication Reminder: ${reminder.medicineName}`, {
              body: `${reminder.dosage}\nTime: ${new Date(reminder.nextDue).toLocaleTimeString()}`,
              icon: '/favicon.ico',
              tag: `reminder-${reminder.id}`
            });
          }
        });
      }
    }
  }

  // Play audio alert
  playAudioAlert() {
    try {
      const audio = new Audio('/path/to/alert-sound.mp3'); // Replace with actual path
      audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (e) {
      console.log('Audio initialization failed:', e);
    }
  }

  // Clear a reminder timer
  clearReminderTimer(id) {
    if (this.timers.has(id)) {
      clearTimeout(this.timers.get(id));
      this.timers.delete(id);
    }
  }

  // Start monitoring for reminders
  startMonitoring() {
    // Refresh schedules periodically
    setInterval(() => {
      this.rescheduleAllActiveReminders();
    }, 60000); // Check every minute
  }

  // Reschedule all active reminders
  rescheduleAllActiveReminders() {
    this.reminders.forEach(reminder => {
      if (reminder.isActive) {
        const newNextDue = this.calculateNextDue(reminder.times, reminder.days);
        if (newNextDue && newNextDue !== reminder.nextDue) {
          reminder.nextDue = newNextDue;
          this.scheduleReminder(reminder);
        }
      }
    });
    this.saveToLocalStorage();
  }

  // Notify user with multiple channels
  notifyUser(message, type = 'info') {
    // Log to console
    console.log(`[${type.toUpperCase()}] ${message}`);

    // Speak the message
    speak(message);

    // You can extend this to show toast notifications, etc.
  }

  // Clear all timers (call this when the app unmounts)
  clearAllTimers() {
    for (let timerId of this.timers.values()) {
      clearTimeout(timerId);
    }
    this.timers.clear();
  }
}

// Export a singleton instance
const reminderService = new ReminderService();
export default reminderService;