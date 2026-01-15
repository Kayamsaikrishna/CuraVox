import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useMedicineStore } from '../../stores/medicineStore';
import reminderService from '../../services/reminderService';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Alert } from '../common/Alert';

const VibrantDashboard = () => {
  const { medicines } = useMedicineStore();
  const [reminders, setReminders] = useState([]);
  const [stats, setStats] = useState({
    totalMedicines: 0,
    upcomingDoses: 0,
    takenToday: 0,
    expiredMedicines: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load reminders and calculate stats
  useEffect(() => {
    try {
      const allReminders = reminderService.getAllReminders();
      setReminders(allReminders);
      
      // Calculate stats
      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const todayEnd = new Date(now.setHours(23, 59, 59, 999));
      
      const upcomingDoses = allReminders.filter(reminder => 
        new Date(reminder.nextDue) >= todayStart && 
        new Date(reminder.nextDue) <= todayEnd
      ).length;
      
      const takenToday = allReminders.filter(reminder => 
        reminder.lastTaken && 
        new Date(reminder.lastTaken) >= todayStart && 
        new Date(reminder.lastTaken) <= todayEnd
      ).length;
      
      const expiredMedicines = medicines?.filter(medicine => 
        new Date(medicine.expiryDate) < new Date()
      ).length || 0;
      
      setStats({
        totalMedicines: medicines?.length || 0,
        upcomingDoses,
        takenToday,
        expiredMedicines
      });
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message);
      setIsLoading(false);
    }
  }, [medicines]);

  // Stats cards with vibrant colors
  const statCards = [
    {
      title: 'Total Medicines',
      value: stats.totalMedicines,
      color: 'from-blue-500 to-cyan-500',
      icon: '💊'
    },
    {
      title: 'Upcoming Doses',
      value: stats.upcomingDoses,
      color: 'from-purple-500 to-indigo-500',
      icon: '⏰'
    },
    {
      title: 'Taken Today',
      value: stats.takenToday,
      color: 'from-green-500 to-emerald-500',
      icon: '✅'
    },
    {
      title: 'Expired',
      value: stats.expiredMedicines,
      color: 'from-red-500 to-rose-500',
      icon: '⚠️'
    }
  ];

  // Upcoming doses
  const upcomingDoses = reminders
    .filter(reminder => {
      try {
        return reminder?.nextDue && new Date(reminder.nextDue) > new Date();
      } catch (e) {
        console.error('Error filtering upcoming doses:', e);
        return false;
      }
    })
    .sort((a, b) => {
      try {
        return new Date(a.nextDue) - new Date(b.nextDue);
      } catch (e) {
        console.error('Error sorting upcoming doses:', e);
        return 0;
      }
    })
    .slice(0, 3);

  // Format time
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="vibrant-dashboard space-y-6">
      {isLoading && (
        <div className="flex justify-center items-center min-h-[300px]">
          <LoadingSpinner size="lg" />
        </div>
      )}
      
      {error && (
        <Alert type="error" message={`Error loading dashboard: ${error}`} />
      )}
      
      {!isLoading && !error && (
        <>
          {/* Header with vibrant background */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white">
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
              <p className="text-indigo-100">Your health assistant is here to help you manage your medications</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20"></div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, index) => (
              <Card 
                key={index} 
                className={`p-5 bg-gradient-to-br ${stat.color} text-white transform hover:scale-105 transition-transform duration-300`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">{stat.title}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <span className="text-4xl">{stat.icon}</span>
                </div>
              </Card>
            ))}
          </div>

          {/* Upcoming Doses and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Doses */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
              <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                <span className="mr-2">⏰</span>
                Upcoming Doses
              </h2>
              
              {upcomingDoses.length > 0 ? (
                <div className="space-y-3">
                  {upcomingDoses.map((reminder, index) => (
                    <div 
                      key={index} 
                      className="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-100 hover:shadow-md transition-shadow"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">{reminder.medicineName}</h3>
                        <p className="text-sm text-gray-600">{reminder.dosage}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-blue-700">{formatTime(reminder.nextDue)}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(reminder.nextDue).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">😴</div>
                  <p className="text-gray-600">No upcoming doses scheduled</p>
                  <p className="text-sm text-gray-500 mt-1">Set reminders for your medicines</p>
                </div>
              )}
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
              <h2 className="text-xl font-bold text-purple-800 mb-4 flex items-center">
                <span className="mr-2">⚡</span>
                Quick Actions
              </h2>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="primary" 
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 h-full"
                  onClick={() => window.location.href = '/scan'}
                >
                  <span className="text-xl">📷</span>
                  <span className="ml-2">Scan</span>
                </Button>
                
                <Button 
                  variant="primary" 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 h-full"
                  onClick={() => window.location.href = '/reminders'}
                >
                  <span className="text-xl">🔔</span>
                  <span className="ml-2">Reminders</span>
                </Button>
                
                <Button 
                  variant="primary" 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 h-full"
                  onClick={() => window.location.href = '/medicines'}
                >
                  <span className="text-xl">💊</span>
                  <span className="ml-2">Medicines</span>
                </Button>
                
                <Button 
                  variant="primary" 
                  className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 h-full"
                  onClick={() => window.location.href = '/profile'}
                >
                  <span className="text-xl">👤</span>
                  <span className="ml-2">Profile</span>
                </Button>
              </div>
              
              <div className="mt-4 pt-4 border-t border-purple-200">
                <Button 
                  variant="outline" 
                  className="w-full border-purple-500 text-purple-700 hover:bg-purple-50"
                  onClick={() => window.location.href = '/settings'}
                >
                  ⚙️ Settings
                </Button>
              </div>
            </Card>
          </div>

          {/* Medicine Categories */}
          <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
            <h2 className="text-xl font-bold text-yellow-800 mb-4 flex items-center">
              <span className="mr-2">📊</span>
              Medicine Categories
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
            { name: 'Pain Relief', count: medicines?.filter(m => m?.name?.toLowerCase().includes('paracetamol') || m?.name?.toLowerCase().includes('ibuprofen'))?.length || 0, color: 'bg-red-500' },
            { name: 'Antibiotics', count: medicines?.filter(m => m?.name?.toLowerCase().includes('amoxicillin') || m?.name?.toLowerCase().includes('antibiotic'))?.length || 0, color: 'bg-blue-500' },
            { name: 'Vitamins', count: medicines?.filter(m => m?.name?.toLowerCase().includes('vitamin'))?.length || 0, color: 'bg-green-500' },
            { name: 'Others', count: medicines?.filter(m => !m?.name?.toLowerCase().includes('paracetamol') && !m?.name?.toLowerCase().includes('ibuprofen') && !m?.name?.toLowerCase().includes('amoxicillin') && !m?.name?.toLowerCase().includes('antibiotic') && !m?.name?.toLowerCase().includes('vitamin'))?.length || 0, color: 'bg-purple-500' }
          ].map((category, index) => (
            <div key={index} className="text-center p-4 bg-white rounded-lg border border-yellow-100">
              <div className={`${category.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold`}>
                {category.count}
              </div>
              <h3 className="font-medium text-gray-900">{category.name}</h3>
              <p className="text-sm text-gray-600">{category.count} medicines</p>
            </div>
          ))}
        </div>
      </Card>
      </>
    )}
    </div>
  );
};

export default VibrantDashboard;