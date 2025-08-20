import { Suspense, useState, useEffect } from 'react';
import { reservationService } from '@/API/ReservationService';
import { toast } from 'sonner';
import { BookingRow, BookingTable } from '../data-table';

export default function Bookings() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await reservationService.getAllBookings();
        
        // Transform the API data to match the BookingRow type
        const transformedData = data.map(booking => ({
          id: booking.id,
          clientId: booking.clientId,
          name: booking.name,
          phoneNumber: booking.phoneNumber,
          propertyId: booking.propertyId,
          startDate: booking.startDate,
          endDate: booking.endDate,
          totalPrice: booking.totalPrice,
          currency: booking.currency,
          status: booking.status === "Cancelled" ? "Rejected" : booking.status,
          reservedAt: booking.reservedAt,
          propertyDetails: booking.propertyDetails
        }));
        
        setBookings(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
        toast.error('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(booking => {
    const searchLower = searchQuery.toLowerCase();
    return (
      booking.name.toLowerCase().includes(searchLower) ||
      booking.phoneNumber.toLowerCase().includes(searchLower) ||
      (booking.propertyDetails?.title?.toLowerCase()?.includes(searchLower) ?? false)
    );
  });

  if (loading) {
    return <div className="p-6 flex items-center justify-center h-64">جاري تحميل البيانات...</div>;
  }

  if (error) {
    return <div className="p-6 flex items-center justify-center h-64 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-col justify-between md:items-center gap-4 mb-6">
        <div className="flex items-center gap-2 justify-between w-full">
          <div>           
            <h1 className='text-2xl font-bold text-gray-800'>الحجوزات</h1>
            <p className="text-gray-600 mt-1">إدارة جميع حجوزات الوحدات</p>
          </div>
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
        </div>
      </div>
      
      <Suspense fallback={<div className="flex items-center justify-center h-64">جاري تحميل الجدول...</div>}>
        <BookingTable data={filteredBookings} />
      </Suspense>
    </div>
  );
}