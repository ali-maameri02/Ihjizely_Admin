// locations.tsx
import React, { useState, useEffect } from 'react';
import { locationsService } from '@/API/LocationService';
import { DownloadCloudIcon, MoreVertical } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogTitle } from '@radix-ui/react-dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { DataTable } from '../data-table';
import { ColumnDef } from '@tanstack/react-table';
import { IconLocationPlus, IconTrash } from '@tabler/icons-react';
import { EditIcon } from 'lucide-react';
import { DialogHeader, DialogFooter } from '../ui/dialog';

export interface LocationRow {
  id: string;
  city: string;
  state: string;
  country: string;
}

type TabType = 'cities' | 'states' | 'state-cities';

type TableDataItem = {
  id: string;
  name: string;
  state?: string;
  cities?: string[];
  citiesDisplay?: string;
  type: string;
};

export default function Locations() {
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<LocationRow | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationRow | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('cities');
  const [formData, setFormData] = useState({
    city: '',
    state: '',
    country: 'Libya',
    isNewState: false,
    newState: ''
  });

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const data = await locationsService.getAllLocations();
        setLocations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch locations');
        toast.error('Failed to load locations');
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // Get unique states for dropdown
  const uniqueStates = Array.from(new Set(locations.map(location => location.state)));

  const filteredLocations = locations.filter(location => {
    const searchLower = searchQuery.toLowerCase();
    return (
      location.city.toLowerCase().includes(searchLower) ||
      location.state.toLowerCase().includes(searchLower) ||
      location.country.toLowerCase().includes(searchLower)
    );
  });

  // Group locations by state for the state-cities tab
  const locationsByState = filteredLocations.reduce((acc, location) => {
    if (!acc[location.state]) {
      acc[location.state] = [];
    }
    acc[location.state].push(location);
    return acc;
  }, {} as Record<string, LocationRow[]>);

  // Prepare data for different tabs
  const getTableData = (): TableDataItem[] => {
    switch (activeTab) {
      case 'cities':
        return filteredLocations.map(location => ({
          id: location.id,
          name: location.city,
          state: location.state,
          type: 'city'
        }));
      case 'states':
        return uniqueStates.map(state => ({
          id: state,
          name: state,
          type: 'state'
        }));
      case 'state-cities':
        return Object.entries(locationsByState).map(([state, cities]) => ({
          id: state,
          name: state,
          cities: cities.map(c => c.city),
          citiesDisplay: cities.map(c => c.city).join('، '),
          type: 'state-with-cities'
        }));
      default:
        return [];
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
      // Reset state field when switching between modes
      ...(name === 'isNewState' && checked ? { state: '' } : { newState: '' })
    }));
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Use the selected state or the new state value
      const locationData = {
        city: formData.city,
        state: formData.isNewState ? formData.newState : formData.state,
        country: formData.country
      };
      
      await locationsService.addLocation(locationData);
      // Refetch all locations
      const data = await locationsService.getAllLocations();
      setLocations(data);
      toast.success('تم إضافة الموقع بنجاح');
      setFormData({ 
        city: '', 
        state: '', 
        country: 'Libya',
        isNewState: false,
        newState: ''
      });
      setIsAddLocationModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add location');
    } finally {
      setLoading(false);
    }
  };

  const handleEditLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLocation) return;
    
    try {
      setLoading(true);
      
      // Use the selected state or the new state value
      const locationData = {
        city: formData.city,
        state: formData.isNewState ? formData.newState : formData.state,
        country: formData.country
      };
      
      await locationsService.updateLocation(currentLocation.id, locationData);
      // Refetch all locations
      const data = await locationsService.getAllLocations();
      setLocations(data);
      toast.success('تم تحديث الموقع بنجاح');
      setCurrentLocation(null);
      setFormData({ 
        city: '', 
        state: '', 
        country: 'Libya',
        isNewState: false,
        newState: ''
      });
      setIsEditModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update location');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLocation = async () => {
    if (!locationToDelete) return;
    
    try {
      setLoading(true);
      await locationsService.deleteLocation(locationToDelete.id);
      // Refetch all locations
      const data = await locationsService.getAllLocations();
      setLocations(data);
      toast.success('تم حذف الموقع بنجاح');
      setIsDeleteDialogOpen(false);
      setLocationToDelete(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete location');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (location: LocationRow) => {
    setLocationToDelete(location);
    setIsDeleteDialogOpen(true);
  };

  const openEditModal = (location: LocationRow) => {
    setCurrentLocation(location);
    setFormData({
      city: location.city,
      state: location.state,
      country: location.country,
      isNewState: false,
      newState: ''
    });
    setIsEditModalOpen(true);
  };

  // Create different column sets for different tabs
  const getColumns = (): ColumnDef<TableDataItem>[] => {
    switch (activeTab) {
      case 'cities':
        return [
          {
            accessorKey: "name",
            header: "الحي",
            cell: ({ row }) => <span>{row.original.name}</span>,
          },
          {
            accessorKey: "state",
            header: "المدينة",
            cell: ({ row }) => <span>{row.original.state}</span>,
          },
          {
            id: "actions",
            header: "الإجراءات",
            cell: ({ row }) => {
              const location = locations.find(l => l.id === row.original.id);
              if (!location) return null;
              
              return (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditModal(location)}
                  >
                    <EditIcon className="w-4 h-4 text-blue-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openDeleteDialog(location)}
                  >
                    <IconTrash className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              );
            },
          }
        ];
        
      case 'states':
        return [
          {
            accessorKey: "name",
            header: "المدينة",
            cell: ({ row }) => <span>{row.original.name}</span>,
          }
        ];
        
      case 'state-cities':
        return [
          {
            accessorKey: "name",
            header: "المدينة",
            cell: ({ row }) => <span>{row.original.name}</span>,
          },
          {
            accessorKey: "citiesDisplay",
            header: "الأحياء",
            cell: ({ row }) => (
              <div className="text-right">
                {row.original.cities?.map((city: string, index: number) => (
                  <span key={city}>
                    {city}
                    {index < (row.original.cities?.length || 0) - 1 && '، '}
                  </span>
                )) || <span className="text-gray-400">لا توجد أحياء</span>}
              </div>
            ),
          }
        ];
        
      default:
        return [];
    }
  };

  if (loading) {
    return <div className="p-6 flex items-center justify-center h-64">جاري تحميل البيانات...</div>;
  }

  if (error) {
    return <div className="p-6 flex items-center justify-center h-64 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      {/* Add Location Modal */}
      <Dialog open={isAddLocationModalOpen} onOpenChange={setIsAddLocationModalOpen}>
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999]" />
          <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[450px] max-h-[85vh] bg-white p-6 rounded-xl shadow-lg z-[99999] focus:outline-none">
            <DialogTitle className="text-right text-xl font-bold">
              إضافة موقع جديد
            </DialogTitle>
            <DialogDescription className="text-right text-gray-600 mt-2">
              أضف موقع جديد إلى النظام
            </DialogDescription>

            <form onSubmit={handleAddLocation} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-right block">
                  المدينة
                </Label>
                
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="isNewState"
                    name="isNewState"
                    checked={formData.isNewState}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isNewState" className="text-sm">
                    إضافة مدينة جديدة
                  </Label>
                </div>
                
                {!formData.isNewState ? (
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-right"
                  >
                    <option value="">اختر المدينة</option>
                    {uniqueStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                ) : (
                  <Input
                    name="newState"
                    value={formData.newState}
                    onChange={handleInputChange}
                    required
                    className="text-right"
                    placeholder="أدخل اسم مدينة جديدة"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-right block">
                  الحي
                </Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="text-right"
                  placeholder="أدخل اسم الحي"
                />
              </div>

              <div className="space-y-2 hidden">
                <Label htmlFor="country" className="text-right block">
                  البلد
                </Label>
                <Input
                  id="country"
                  name="country"
                  value="Libya"
                  onChange={handleInputChange}
                  required
                  className="text-right"
                  readOnly
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsAddLocationModalOpen(false)}
                >
                  إلغاء
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  إضافة
                </Button>
              </div>
            </form>
          </DialogContent>
        </DialogPortal>
      </Dialog>

      {/* Edit Location Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999]" />
          <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[450px] max-h-[85vh] bg-white p-6 rounded-xl shadow-lg z-[99999] focus:outline-none">
            <DialogTitle className="text-right text-xl font-bold">
              تعديل الموقع
            </DialogTitle>
            <DialogDescription className="text-right text-gray-600 mt-2">
              تعديل بيانات الموقع
            </DialogDescription>

            <form onSubmit={handleEditLocation} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-right block">
                  المدينة
                </Label>
                
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="edit-isNewState"
                    name="isNewState"
                    checked={formData.isNewState}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="edit-isNewState" className="text-sm">
                    إضافة مدينة جديدة
                  </Label>
                </div>
                
                {!formData.isNewState ? (
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-right"
                  >
                    <option value="">اختر المدينة</option>
                    {uniqueStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                ) : (
                  <Input
                    name="newState"
                    value={formData.newState}
                    onChange={handleInputChange}
                    required
                    className="text-right"
                    placeholder="أدخل اسم مدينة جديدة"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-city" className="text-right block">
                  الحي
                </Label>
                <Input
                  id="edit-city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="text-right"
                  placeholder="أدخل اسم الحي"
                />
              </div>

              <div className="space-y-2 hidden">
                <Label htmlFor="edit-country" className="text-right block">
                  البلد
                </Label>
                <Input
                  id="edit-country"
                  name="country"
                  value="Libya"
                  onChange={handleInputChange}
                  required
                  className="text-right"
                  readOnly
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  إلغاء
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  حفظ التغييرات
                </Button>
              </div>
            </form>
          </DialogContent>
        </DialogPortal>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999]" />
          <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[450px] max-h-[85vh] bg-white p-6 rounded-xl shadow-lg z-[99999] focus:outline-none">
            <DialogHeader>
              <DialogTitle className="text-right text-xl font-bold">
                تأكيد الحذف
              </DialogTitle>
              <DialogDescription className="text-right text-gray-600 mt-2">
                هل أنت متأكد من رغبتك في حذف الموقع؟
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-right">
              {locationToDelete && (
                <>
                  <p className="font-medium">الحي: {locationToDelete.city}</p>
                  <p className="font-medium">المدينة: {locationToDelete.state}</p>
                  <p className="text-gray-600 mt-2">هذا الإجراء لا يمكن التراجع عنه.</p>
                </>
              )}
            </div>

            <DialogFooter className="flex justify-between pt-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                إلغاء
              </Button>
              <Button 
                type="button" 
                className="bg-red-600 hover:bg-red-700"
                onClick={handleDeleteLocation}
              >
                حذف
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogPortal>
      </Dialog>

      {/* Main Content */}
      <div className="flex flex-col md:flex-col justify-between md:items-center gap-4 mb-6">
        <div className="flex items-center gap-2 justify-between w-full">
          <div>           
            <h1 className='text-2xl font-bold text-gray-800'>المواقع</h1>
            <p className="text-gray-600 mt-1">إدارة جميع المواقع في النظام</p>
          </div>
          <Button 
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center justify-between gap-2 cursor-pointer"
            onClick={() => setIsAddLocationModalOpen(true)}
          >
            <span>أضف جديد</span>
            <IconLocationPlus/>
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 w-full">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'cities' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('cities')}
          >
            الأحياء
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'states' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('states')}
          >
            المدن
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'state-cities' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('state-cities')}
          >
            المدن مع أحيائها
          </button>
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
            فلتر
            <DownloadCloudIcon/>
          </button>

          <button className="bg-gray-100 p-2 rounded-lg">
            <MoreVertical/>
          </button>
        </div>
      </div>

      {isFilterOpen && (
        <div className="bg-white w-64 shadow-md rounded-lg p-4 mb-4 border border-gray-200 float-right mr-12">
          <div className="space-y-2 flex flex-col items-end w-full">
            {/* Filter options can be added here */}
          </div>
        </div>
      )}
      
      <div className="rounded-md border">
        <DataTable data={getTableData()} columns={getColumns()} />
      </div>
    </div>
  );
};