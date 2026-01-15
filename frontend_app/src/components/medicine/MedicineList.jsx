import React from 'react';
import MedicineCard from './MedicineCard';
import LoadingSpinner from '../common/LoadingSpinner';
import Alert from '../common/Alert';
import EmptyState from '../common/EmptyState';

const MedicineList = ({ 
  medicines, 
  onDetailsClick, 
  onSetReminder, 
  isLoading, 
  error,
  searchTerm = '' 
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert type="error" message={`Error loading medicines: ${error}`} />
    );
  }

  if (!medicines || medicines.length === 0) {
    return (
      <EmptyState 
        title="No Medicines Found" 
        description="You don't have any medicines saved yet. Scan a medicine package to get started."
        primaryAction={{
          label: "Scan Medicine",
          onClick: () => window.location.hash = '#/scan'
        }}
      />
    );
  }

  // Filter medicines based on search term if provided
  const filteredMedicines = searchTerm 
    ? medicines.filter(medicine => 
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (medicine.activeIngredients && 
         medicine.activeIngredients.some(ingredient => 
           ingredient.toLowerCase().includes(searchTerm.toLowerCase())
         )
        )
      )
    : medicines;

  if (filteredMedicines.length === 0) {
    return (
      <EmptyState 
        title="No Results Found" 
        description={`No medicines match your search for "${searchTerm}". Try a different search term.`}
      />
    );
  }

  return (
    <div className="medicine-list space-y-4">
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredMedicines.length} of {medicines.length} medicines
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMedicines.map((medicine) => (
          <MedicineCard
            key={medicine.id}
            medicine={medicine}
            onDetailsClick={onDetailsClick}
            onSetReminder={onSetReminder}
          />
        ))}
      </div>
    </div>
  );
};

export default MedicineList;