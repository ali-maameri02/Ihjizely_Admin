// locations.tsx
import React, { useState, useEffect } from 'react';
import { locationsService } from '@/API/LocationService';
// import addLocationIcon from '../../assets/add_location.svg';
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

export interface LocationRow {
  id: string;
  city: string;
  state: string;
  country: string;
}

export default function Locations() {
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationRow | null>(null);
  const [formData, setFormData] = useState({
    city: '',
    state: '',
    country: ''
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

  const filteredLocations = locations.filter(location => {
    // const searchLower = searchQuery.toLowerCase();
    return (
      location.city,
      location.state,
      location.country );
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await locationsService.addLocation(formData);
      // Refetch all locations
      const data = await locationsService.getAllLocations();
      setLocations(data);
      toast.success('تم إضافة الموقع بنجاح');
      setFormData({ city: '', state: '', country: 'Libya' });
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
      await locationsService.updateLocation(currentLocation.id, formData);
      // Refetch all locations
      const data = await locationsService.getAllLocations();
      setLocations(data);
      toast.success('تم تحديث الموقع بنجاح');
      setCurrentLocation(null);
      setFormData({ city: '', state: '', country: '' });
      setIsEditModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update location');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    try {
      setLoading(true);
      await locationsService.deleteLocation(id);
      // Refetch all locations
      const data = await locationsService.getAllLocations();
      setLocations(data);
      toast.success('تم حذف الموقع بنجاح');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete location');
    } finally {
      setLoading(false);
    }
  };
  const openEditModal = (location: LocationRow) => {
    setCurrentLocation(location);
    setFormData({
      city: location.city,
      state: location.state,
      country: location.country
    });
    setIsEditModalOpen(true);
  };

  const columns: ColumnDef<LocationRow>[] = [
    {
      accessorKey: "city",
      header: "الحي",
      cell: ({ row }) => <span>{row.original.city}</span>,
    },
    {
      accessorKey: "state",
      header: "المدينة",
      cell: ({ row }) => <span>{row.original.state}</span>,
    },
    {
      accessorKey: "country",
      header: "البلد",
      cell: ({ row }) => <span>{row.original.country}</span>,
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openEditModal(row.original)}
          >
            <EditIcon className="w-4 h-4 text-blue-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (confirm(`هل أنت متأكد من حذف ${row.original.city}؟`)) {
                handleDeleteLocation(row.original.id);
              }
            }}
          >
            <IconTrash className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

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
                  placeholder="أدخل اسم المدينة"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state" className="text-right block">
                المدينة
                </Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  className="text-right"
                  placeholder="أدخل اسم الولاية"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country" className="text-right block">
                  البلد
                </Label>
                <Input
                  id="country"
                  name="country"
                  value="Libya"
                  onChange={handleInputChange}
                  required
                  className="text-right "
                  placeholder="أدخل اسم البلد"
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
                <Label htmlFor="edit-city" className="text-right block">
                  المدينة
                </Label>
                <Input
                  id="edit-city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="text-right"
                  placeholder="أدخل اسم المدينة"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-state" className="text-right block">
                  الولاية
                </Label>
                <Input
                  id="edit-state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  className="text-right"
                  placeholder="أدخل اسم الولاية"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-country" className="text-right block">
                  البلد
                </Label>
                <Input
                  id="edit-country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  className="text-right"
                  placeholder="أدخل اسم البلد"
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
        <DataTable data={filteredLocations} columns={columns} />
      </div>
    </div>
  );
};