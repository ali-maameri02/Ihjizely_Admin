// units.tsx
import { Suspense, useState, useEffect } from 'react';
import { UnitTable } from '../data-table';
import { UnitRow, unitsService } from '@/API/UnitsService';
// import { DownloadCloudIcon, FilterIcon } from 'lucide-react';
import { MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
// import { PropertyDetailsModal } from './PropertyDetailsModal';  // Adjust path as needed
export default function Units() {
  const [units, setUnits] = useState<UnitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setLoading(true);
        const data = await unitsService.getAllUnits();
        setUnits(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch units');
        toast.error('Failed to load units');
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, []);

  // Filter only by search query here
  const filteredUnits = units.filter(unit => {
    const searchLower = searchQuery.toLowerCase();
    return unit.unitName?.toLowerCase().includes(searchLower);
  });

  if (loading) {
    return <div className="p-6 flex items-center justify-center h-64">جاري تحميل الوحدات...</div>;
  }

  if (error) {
    return <div className="p-6 flex items-center justify-center h-64 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      {/* Header Buttons */}
      <div className="flex flex-row md:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex flex-row justify-start w-full items-start">
          <div>
            <h1 className="text-2xl text-left font-bold text-gray-800">إدارة الوحدات</h1>
            <p className="text-gray-600 mt-1">إدارة جميع الوحدات في النظام</p>
          </div>
        </div>

        <div className="flex flex-row justify-end w-full items-end gap-2 w-full md:w-full">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="بحث..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-right"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Other Buttons */}
          <button className="bg-gray-100 p-2 rounded-lg">
            <MoreVertical />
          </button>
        </div>
      </div>

      {/* Table - Type filtering now handled inside UnitTable */}
      <Suspense fallback={<div className="flex items-center justify-center h-64">جاري تحميل الجدول...</div>}>
        <UnitTable data={filteredUnits} />
      </Suspense>
      
    </div>
  );
}