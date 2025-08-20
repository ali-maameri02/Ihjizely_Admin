// users-table.tsx
import React, { Suspense, useState, useEffect } from 'react';
import { UserRow } from '../data-table';
import { usersService } from '@/API/UsersService';
import adduserIcon from '../../assets/add_user.svg';
import { X, Filter, User, Calendar, Ban } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogOverlay, DialogPortal } from '@radix-ui/react-dialog';
import { toast } from 'sonner';

const UserTable = React.lazy(() => import('../data-table'));

// Helper function to check if date is within range (moved outside component)
const isWithinDateRange = (dateString: string, range: string) => {
  const date = new Date(dateString);
  const now = new Date();
  
  switch (range) {
    case 'today':
      return date.toDateString() === now.toDateString();
    case 'week':
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return date >= weekAgo;
    case 'month':
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      return date >= monthAgo;
    case 'year':
      const yearAgo = new Date(now);
      yearAgo.setFullYear(now.getFullYear() - 1);
      return date >= yearAgo;
    default:
      return true;
  }
};

export default function Users() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
 

  // Filter states
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    dateRange: '',
    emailVerified: ''
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await usersService.getAllUsers();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch users');
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      user.name.toLowerCase().includes(searchLower) ||
      user.username.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower);

    const matchesRole = !filters.role || user.role === filters.role;
    const matchesStatus = !filters.status || 
      (filters.status === 'active' && !user.isBlocked) ||
      (filters.status === 'blocked' && user.isBlocked);

    // Date range filtering
    const matchesDateRange = !filters.dateRange || isWithinDateRange(user.date, filters.dateRange);

    return matchesSearch && matchesRole && matchesStatus && matchesDateRange;
  });

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      role: '',
      status: '',
      dateRange: '',
      emailVerified: ''
    });
  };





  if (loading) {
    return <div className="p-6 flex items-center justify-center h-64">جاري تحميل البيانات...</div>;
  }

  if (error) {
    return <div className="p-6 flex items-center justify-center h-64 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      {/* Add User Modal */}
      <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999] w-full" />
          <DialogContent className="fixed w-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[450px] max-h-[85vh] bg-white p-6 rounded-xl shadow-lg z-[99999] focus:outline-none">
            {/* ... existing modal content ... */}
          </DialogContent>
        </DialogPortal>
      </Dialog>

      {/* Main Content */}
      <div className="flex flex-col md:flex-col justify-between md:items-center gap-4 mb-6">
        <div className="flex items-center gap-2 justify-between w-full">
          <div>           
            <h1 className='text-2xl font-bold text-gray-800'>المستخدمين</h1>
            <p className="text-gray-600 mt-1">إدارة جميع المستخدمين في النظام</p>
          </div>
          <Button 
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center justify-between gap-2 cursor-pointer"
            onClick={() => setIsAddUserModalOpen(true)}
          >
            <span>أضف جديد</span>
            <img src={adduserIcon} alt="Add User" className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-end gap-2 w-full md:w-full">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="بحث..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-right"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="bg-purple-100 text-purple-600 px-4 py-2 rounded-lg flex items-center gap-1 cursor-pointer"
          >
            <Filter size={18} />
            فلتر
          </button>

          
        </div>
      </div>

      {isFilterOpen && (
        <div className="bg-white w-full md:w-80 shadow-lg rounded-lg p-4 mb-4 border border-gray-200 float-right">
          <div className="space-y-4 flex flex-col items-end w-full">
            <div className="flex justify-between items-center w-full mb-2">
              <h3 className="font-semibold text-right flex items-center gap-2">
                <Filter size={18} />
                فلترة المستخدمين
              </h3>
              <button 
                onClick={() => setIsFilterOpen(false)} 
                className="text-gray-500 hover:bg-gray-100 p-1 rounded-full"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Role Filter */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 text-right mb-1 flex items-center justify-end gap-2">
                <User size={16} />
                الدور
              </label>
              <div className="relative">
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-right appearance-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={filters.role}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                >
                  <option value="">جميع الأدوار</option>
                  <option value="Client">عميل</option>
                  <option value="BusinessOwner">صاحب عمل</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-gray-700">
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

       
            {/* Registration Date Filter */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 text-right mb-1 flex items-center justify-end gap-2">
                <Calendar size={16} />
                تاريخ التسجيل
              </label>
              <div className="relative">
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-right appearance-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                >
                  <option value="">جميع التواريخ</option>
                  <option value="today">اليوم</option>
                  <option value="week">هذا الأسبوع</option>
                  <option value="month">هذا الشهر</option>
                  <option value="year">هذه السنة</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-gray-700">
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Clear Filters Button */}
            <button
              className="w-full bg-gray-100 text-gray-700 px-3 py-2 rounded-lg mt-2 hover:bg-gray-200 text-right flex items-center justify-center gap-2 transition-colors"
              onClick={clearFilters}
            >
              <Ban size={16} />
              مسح الفلاتر
            </button>
          </div>
        </div>
      )}
      
      <Suspense fallback={<div className="flex items-center justify-center h-64">جاري تحميل الجدول...</div>}>
        <UserTable data={filteredUsers} />
      </Suspense>
    </div>
  );
}