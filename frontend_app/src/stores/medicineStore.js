import { create } from 'zustand';

const useMedicineStore = create((set, get) => ({
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