import { create } from 'zustand';

const useMedicineStore = create((set, get) => ({
  medicines: [],

  // Methods
  addMedicine: (medicine) => set((state) => ({
    medicines: [...state.medicines, { ...medicine, id: Date.now() }]
  })),

  updateMedicine: (id, updatedMedicine) => set((state) => ({
    medicines: state.medicines.map(med => med.id === id ? { ...med, ...updatedMedicine } : med)
  })),

  removeMedicine: (id) => set((state) => ({
    medicines: state.medicines.filter(med => med.id !== id)
  })),

  getMedicineById: (id) => {
    const state = get();
    return state.medicines.find(med => med.id === id);
  },

  searchMedicines: (query) => {
    const state = get();
    return state.medicines.filter(med =>
      med.name.toLowerCase().includes(query.toLowerCase()) ||
      med.activeIngredients.some(ingredient =>
        ingredient.toLowerCase().includes(query.toLowerCase())
      )
    );
  }
}));

export { useMedicineStore };