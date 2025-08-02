import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logo from '../../assets/20250625_093712.jpg';
import roomPlaceholder from '../../assets/hotel room with beachfront view.jpg';
import { useEffect, useState } from "react";
import { reservationService, Booking } from "../../API/ReservationService";
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { unitsService } from "../../API/UnitsService";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

export default function RecentActivities() {
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    availableRooms: 0,
    availableApartments: 0,
    availableHalls: 0,
    availableResorts: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookings, rooms, apartments, halls, resorts] = await Promise.all([
          reservationService.getRecentBookings(),
          unitsService.getUnitsByType('Hotel Room'),
          unitsService.getUnitsByType('Apartment'),
          unitsService.getUnitsByType('Hall'),
          unitsService.getUnitsByType('Resort')
        ]);

        setRecentBookings(bookings);
        setStats({
          availableRooms: rooms.length,
          availableApartments: apartments.length,
          availableHalls: halls.length,
          availableResorts: resorts.length
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ar
    });
  };

  const getPropertyImage = (booking: Booking) => {
    return booking.propertyDetails?.images?.[0]?.url || roomPlaceholder;
  };

  const getRoomInfo = (booking: Booking) => {
    if (!booking.propertyDetails) return '';
    
    const { type, subtype, roomNumber } = booking.propertyDetails;
    
    if (type === 'Residence') {
      if (subtype === 'Hotel Room' && roomNumber) {
        return `-غرفة ${roomNumber}`;
      }
      if (subtype === 'Apartment' && roomNumber) {
        return `-شقة ${roomNumber}`;
      }
      return `-${unitsService.getSubtypeLabel(subtype || '')}`;
    }
    
    return `-${unitsService.getSubtypeLabel(subtype || '')}`;
  };

  if (loading) {
    return (
      <div className="space-y-6 px-5 pt-2 h-full">
        <h2 className="text-xl font-bold text-left mb-4 mt-2">أحدث الإحصائيات</h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 px-5 pt-2 h-full">
        <h2 className="text-xl font-bold text-left mb-4 mt-2">أحدث الإحصائيات</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-5 pt-2 h-full">
      <h2 className="text-xl font-bold text-left mb-4 mt-2">أحدث الإحصائيات</h2>
      <div className="flex flex-row justify-between items-center gap-12 w-full">
        <div className="cards flex flex-col w-1/2 gap-2">
          {recentBookings.map((booking) => (
            <Card key={booking.id} className="flex flex-row items-center w-[35rem] p-0 text-[#404B51]">
              <div className="flex flex-row items-center">
                <img 
                  src={getPropertyImage(booking)} 
                  className="rounded-l-2xl w-52 h-36 object-cover" 
                  alt="Property" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = roomPlaceholder;
                  }}
                />
              </div>
              <div className="flex flex-col justify-around gap-2 items-start p-0 w-full">
                <CardTitle className="px-4 pt-2">
                  {booking.propertyDetails?.title || 'فندق الخيام'}
                </CardTitle>
                <CardContent className="flex flex-row justify-between items-center p-0 px-4 pb-2 w-full gap-4">
                  <Avatar>
                    <AvatarImage src={logo} alt="User" />
                    <AvatarFallback>
                      {booking.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[15px] text-[#737373]">{booking.name}</span>
                  <span>{getRoomInfo(booking)}</span>
                  <span className="text-[12px] whitespace-nowrap">
                    {formatTimeAgo(booking.reservedAt)}
                  </span>
                </CardContent>
              </div>
            </Card>
          ))}
          <Link to={'/Admin/reservations'} className="w-full flex justify-center ">
          <Button className="bg-[#AD46FF] cursor-pointer" >
          راجع  جميع الحجوزات
          </Button>
          </Link>
        </div>

        <div className="grid w-full grid-flow-col grid-rows-2 gap-4 justify-items-end-safe justify-end">
          <Card className="flex flex-col justify-center items-center bg-white hover:bg-[#4facfe] hover:text-white transition-all duration-500 ease-in-out rounded-2xl p-6 text-base text-center h-24 w-full hover:-translate-y-2">
            <CardTitle className="text-lg font-semibold mb-2">الغرف المتاحة في الفنادق</CardTitle>
            <h1 className="text-xl font-bold">{stats.availableRooms}</h1>
          </Card>

          <Card className="flex flex-col justify-center items-center bg-white hover:bg-[#4facfe] hover:text-white transition-all duration-500 ease-in-out rounded-2xl p-6 text-base text-center h-24 w-full hover:-translate-y-2">
            <CardTitle className="text-lg font-semibold mb-2">شقق سكنية متاحة</CardTitle>
            <h1 className="text-xl font-bold">{stats.availableApartments}</h1>
          </Card>

          <Card className="flex flex-col justify-center items-center bg-white hover:bg-[#4facfe] hover:text-white transition-all duration-500 ease-in-out rounded-2xl p-6 text-base text-center h-24 w-full hover:-translate-y-2">
            <CardTitle className="text-lg font-semibold mb-2">قاعة المناسبات المتاحة</CardTitle>
            <h1 className="text-xl font-bold">{stats.availableHalls}</h1>
          </Card>

          <Card className="flex flex-col justify-center items-center bg-white hover:bg-[#4facfe] hover:text-white transition-all duration-500 ease-in-out rounded-2xl p-6 text-base text-center h-24 w-full hover:-translate-y-2">
            <CardTitle className="text-lg font-semibold mb-2">المنتجعات المتاحة</CardTitle>
            <h1 className="text-xl font-bold">{stats.availableResorts}</h1>
          </Card>
        </div>
      </div>
    </div>
  );
}