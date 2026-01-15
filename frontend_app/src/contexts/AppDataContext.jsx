import React, { createContext, useContext, useReducer, useEffect } from 'react';
import reminderService from '../services/reminderService';

// Initial state
const initialState = {
  medicines: [
    {
      id: 1,
      name: "Paracetamol",
      activeIngredients: ["Paracetamol 500mg"],
      dosage: "Take 1-2 tablets every 4-6 hours",
      usage: "As needed for pain or fever. Do not exceed 8 tablets in 24 hours.",
      sideEffects: ["Nausea", "Stomach pain", "Liver damage if taken in excess"],
      expiryDate: "2025-12-31",
      manufacturer: "Generic Pharmaceuticals",
      warnings: ["Do not take with alcohol", "Consult doctor if symptoms persist"],
      storage: "Store in a cool, dry place away from direct sunlight"
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
      warnings: ["Inform doctor about any allergies", "Do not stop early even if feeling better"],
      storage: "Store at room temperature, protect from moisture"
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
      warnings: ["Do not take on empty stomach", "Avoid if you have stomach ulcers"],
      storage: "Store in a cool, dry place"
    }
  ],
  reminders: [],
  profile: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    emergencyContact: '+1 (555) 987-6543',
    emergencyContactName: 'Jane Doe',
    address: '123 Main Street, Anytown, ST 12345',
    dateOfBirth: '1980-01-01',
    bloodType: 'O+',
    medicalConditions: 'Hypertension, Diabetes',
    allergies: 'Penicillin',
    medications: 'Metformin, Lisinopril'
  },
  loading: {
    medicines: false,
    reminders: false,
    profile: false
  },
  stats: {
    medicines: 0,
    activeReminders: 0,
    dosesToday: 0,
    expired: 0
  }
};

// Action types
const actionTypes = {
  SET_MEDICINES: 'SET_MEDICINES',
  ADD_MEDICINE: 'ADD_MEDICINE',
  UPDATE_MEDICINE: 'UPDATE_MEDICINE',
  REMOVE_MEDICINE: 'REMOVE_MEDICINE',
  SET_REMINDERS: 'SET_REMINDERS',
  ADD_REMINDER: 'ADD_REMINDER',
  UPDATE_REMINDER: 'UPDATE_REMINDER',
  REMOVE_REMINDER: 'REMOVE_REMINDER',
  MARK_AS_TAKEN: 'MARK_AS_TAKEN',
  SET_PROFILE: 'SET_PROFILE',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  SET_LOADING: 'SET_LOADING',
  UPDATE_STATS: 'UPDATE_STATS',
  REFRESH_ALL: 'REFRESH_ALL'
};

// Reducer function
function appDataReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_MEDICINES:
      return {
        ...state,
        medicines: action.payload,
        loading: { ...state.loading, medicines: false }
      };

    case actionTypes.ADD_MEDICINE:
      return {
        ...state,
        medicines: [...state.medicines, action.payload],
        loading: { ...state.loading, medicines: false }
      };

    case actionTypes.UPDATE_MEDICINE:
      return {
        ...state,
        medicines: state.medicines.map(med =>
          med.id === action.payload.id ? { ...med, ...action.payload } : med
        ),
        loading: { ...state.loading, medicines: false }
      };

    case actionTypes.REMOVE_MEDICINE:
      return {
        ...state,
        medicines: state.medicines.filter(med => med.id !== action.payload),
        loading: { ...state.loading, medicines: false }
      };

    case actionTypes.SET_REMINDERS:
      return {
        ...state,
        reminders: action.payload,
        loading: { ...state.loading, reminders: false }
      };

    case actionTypes.ADD_REMINDER:
      return {
        ...state,
        reminders: [...state.reminders, action.payload],
        loading: { ...state.loading, reminders: false }
      };

    case actionTypes.UPDATE_REMINDER:
      return {
        ...state,
        reminders: state.reminders.map(rem =>
          rem.id === action.payload.id ? { ...rem, ...action.payload } : rem
        ),
        loading: { ...state.loading, reminders: false }
      };

    case actionTypes.REMOVE_REMINDER:
      return {
        ...state,
        reminders: state.reminders.filter(rem => rem.id !== action.payload),
        loading: { ...state.loading, reminders: false }
      };

    case actionTypes.MARK_AS_TAKEN:
      return {
        ...state,
        reminders: state.reminders.map(rem =>
          rem.id === action.payload.id
            ? { ...rem, lastTaken: action.payload.lastTaken, nextDue: action.payload.nextDue }
            : rem
        ),
        loading: { ...state.loading, reminders: false }
      };

    case actionTypes.SET_PROFILE:
      return {
        ...state,
        profile: action.payload,
        loading: { ...state.loading, profile: false }
      };

    case actionTypes.UPDATE_PROFILE:
      return {
        ...state,
        profile: { ...state.profile, ...action.payload },
        loading: { ...state.loading, profile: false }
      };

    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: { ...state.loading, [action.payload.section]: action.payload.status }
      };

    case actionTypes.UPDATE_STATS:
      return {
        ...state,
        stats: { ...state.stats, ...action.payload }
      };

    case actionTypes.REFRESH_ALL:
      return {
        ...state,
        medicines: action.payload.medicines || state.medicines,
        reminders: action.payload.reminders || state.reminders,
        profile: action.payload.profile || state.profile,
        stats: action.payload.stats || state.stats
      };

    default:
      return state;
  }
}

// Context
const AppDataContext = createContext();

// Provider component
export const AppDataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appDataReducer, initialState);

  // Update stats when medicines or reminders change
  useEffect(() => {
    const updateStats = () => {
      const medicinesCount = state.medicines.length;
      const activeReminders = state.reminders.filter(r => r.isActive).length;
      const dosesToday = state.reminders.filter(rem =>
        rem.lastTaken &&
        new Date(rem.lastTaken).toDateString() === new Date().toDateString()
      ).length;
      const expired = state.medicines.filter(med =>
        new Date(med.expiryDate) <= new Date()
      ).length;

      dispatch({
        type: actionTypes.UPDATE_STATS,
        payload: {
          medicines: medicinesCount,
          activeReminders,
          dosesToday,
          expired
        }
      });
    };

    updateStats();
  }, [state.medicines.length, state.reminders.length]); // Only re-run when the lengths change to avoid infinite loop


  // Refresh reminders periodically
  useEffect(() => {
    const refreshReminders = () => {
      const allReminders = reminderService.getAllReminders();
      dispatch({
        type: actionTypes.SET_REMINDERS,
        payload: allReminders
      });
    };

    // Initial load
    refreshReminders();

    // Set up periodic refresh
    const interval = setInterval(refreshReminders, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Subscribe to reminder service events
  useEffect(() => {
    // This would be where we listen for events from the reminder service
    // For now, we're using the interval approach above
  }, []);

  // Actions to update data
  const actions = {
    // Medicine actions
    setMedicines: (medicines) => dispatch({ type: actionTypes.SET_MEDICINES, payload: medicines }),
    addMedicine: (medicine) => dispatch({ type: actionTypes.ADD_MEDICINE, payload: medicine }),
    updateMedicine: (medicine) => dispatch({ type: actionTypes.UPDATE_MEDICINE, payload: medicine }),
    removeMedicine: (id) => dispatch({ type: actionTypes.REMOVE_MEDICINE, payload: id }),

    // Reminder actions
    setReminders: (reminders) => dispatch({ type: actionTypes.SET_REMINDERS, payload: reminders }),
    addReminder: (reminder) => dispatch({ type: actionTypes.ADD_REMINDER, payload: reminder }),
    updateReminder: (reminder) => dispatch({ type: actionTypes.UPDATE_REMINDER, payload: reminder }),
    removeReminder: (id) => dispatch({ type: actionTypes.REMOVE_REMINDER, payload: id }),
    markAsTaken: (id) => {
      const reminder = state.reminders.find(r => r.id === id);
      if (reminder) {
        reminderService.markAsTaken(id);
        const updatedReminders = reminderService.getAllReminders();
        dispatch({
          type: actionTypes.MARK_AS_TAKEN,
          payload: {
            id,
            lastTaken: new Date(),
            nextDue: updatedReminders.find(r => r.id === id)?.nextDue
          }
        });
      }
    },

    // Profile actions
    setProfile: (profile) => dispatch({ type: actionTypes.SET_PROFILE, payload: profile }),
    updateProfile: (profile) => dispatch({ type: actionTypes.UPDATE_PROFILE, payload: profile }),

    // Loading actions
    setLoading: (section, status) => dispatch({
      type: actionTypes.SET_LOADING,
      payload: { section, status }
    }),

    // Refresh all data
    refreshAll: () => {
      const allReminders = reminderService.getAllReminders();
      dispatch({
        type: actionTypes.REFRESH_ALL,
        payload: {
          reminders: allReminders,
          stats: {
            medicines: state.medicines.length,
            activeReminders: allReminders.filter(r => r.isActive).length,
            dosesToday: allReminders.filter(rem =>
              rem.lastTaken &&
              new Date(rem.lastTaken).toDateString() === new Date().toDateString()
            ).length,
            expired: state.medicines.filter(med =>
              new Date(med.expiryDate) <= new Date()
            ).length
          }
        }
      });
    }
  };

  const contextValue = React.useMemo(() => ({ state, actions }), [state]);

  return (
    <AppDataContext.Provider value={contextValue}>
      {children}
    </AppDataContext.Provider>
  );
};

// Custom hook to use the context
export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};