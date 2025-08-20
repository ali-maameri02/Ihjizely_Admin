import { Card, CardContent, CardTitle } from "@/components/ui/card";
// import logo from '../../assets/20250625_093712.jpg';
import roomPlaceholder from '../../assets/hotel room with beachfront view.jpg';
import { useEffect, useState } from "react";
import { reservationService, Booking } from "../../API/ReservationService";
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { unitsService } from "../../API/UnitsService";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import axios from 'axios';
import { authService } from "../../API/auth";

export default function RecentActivities() {
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    availableRooms: 0,
    availableApartments: 0,
    availableChalets: 0,
    availableHotelApartments: 0,
    availableResorts: 0,
    availableRestHouses: 0,
    availableEventHallsSmall: 0,
    availableEventHallsLarge: 0,
    availableMeetingRooms: 0
  });
  const [showAllStats, setShowAllStats] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = authService.getAuthToken();
        if (!token) throw new Error('No authentication token found');

        // Fetch all confirmed bookings first
        const allBookings = await reservationService.getAllBookings();
        const confirmedBookings = allBookings.filter(booking => booking.status === 'Confirmed');
        const bookedPropertyIds = confirmedBookings.map(booking => booking.propertyId);

        // Fetch properties by type and filter out booked ones
        const fetchAvailableProperties = async (type: string) => {
          try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/AllProperties/by-type/${type}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'accept': '*/*'
              }
            });
            const properties = response.data;
            return properties.filter((property: any) => !bookedPropertyIds.includes(property.id));
          } catch (error) {
            console.error(`Error fetching ${type} properties:`, error);
            return [];
          }
        };

        const [bookings, rooms, apartments, chalets, hotelApartments, resorts, restHouses, 
               smallHalls, largeHalls, meetingRooms] = await Promise.all([
          reservationService.getRecentBookings(),
          fetchAvailableProperties('HotelRoom'),
          fetchAvailableProperties('Apartment'),
          fetchAvailableProperties('Chalet'),
          fetchAvailableProperties('HotelApartment'),
          fetchAvailableProperties('Resort'),
          fetchAvailableProperties('RestHouse'),
          fetchAvailableProperties('EventHallSmall'),
          fetchAvailableProperties('EventHallLarge'),
          fetchAvailableProperties('Meeting Room')
        ]);

        setRecentBookings(bookings);
        setStats({
          availableRooms: rooms.length,
          availableApartments: apartments.length,
          availableChalets: chalets.length,
          availableHotelApartments: hotelApartments.length,
          availableResorts: resorts.length,
          availableRestHouses: restHouses.length,
          availableEventHallsSmall: smallHalls.length,
          availableEventHallsLarge: largeHalls.length,
          availableMeetingRooms: meetingRooms.length
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
      if (subtype === 'HotelRoom' && roomNumber) {
        return `-غرفة ${roomNumber}`;
      }
      if (subtype === 'Apartment' && roomNumber) {
        return `-شقة ${roomNumber}`;
      }
      return `-${unitsService.getSubtypeLabel(subtype || '')}`;
    }
    
    return `-${unitsService.getSubtypeLabel(subtype || '')}`;
  };

  const statsEntries = [
    { key: 'availableRooms', label: 'غرف فندقية متاحة' },
    { key: 'availableApartments', label: 'شقق سكنية متاحة' },
    { key: 'availableChalets', label: 'شاليهات متاحة' },
    { key: 'availableHotelApartments', label: 'شقق فندقية متاحة' },
    { key: 'availableResorts', label: 'منتجعات متاحة' },
    { key: 'availableRestHouses', label: 'بيوت ريفية متاحة' },
    { key: 'availableEventHallsSmall', label: 'قاعات أحداث صغيرة متاحة' },
    { key: 'availableEventHallsLarge', label: 'قاعات أحداث كبيرة متاحة' },
    { key: 'availableMeetingRooms', label: 'غرف اجتماعات متاحة' }
  ];

  const visibleStats = showAllStats ? statsEntries : statsEntries.slice(0, 4);

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
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 w-full">
        <div className="cards flex flex-col w-full lg:w-1/2 gap-2">
          {recentBookings.map((booking) => (
            <Card key={booking.id} className="flex flex-col sm:flex-row items-center w-full sm:w-[35rem] p-0 text-[#404B51]">
              <div className="flex flex-row items-center w-full sm:w-auto">
                <img 
                  src={getPropertyImage(booking)} 
                  className="rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none w-full sm:w-52 h-36 object-cover" 
                  alt="Property" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = roomPlaceholder;
                  }}
                />
              </div>
              <div className="flex flex-col justify-around gap-2 items-start p-0 w-full">
                <CardTitle className="px-4 pt-2">
                  {booking.propertyDetails?.title || 'فندق '}
                </CardTitle>
                <CardContent className="flex flex-col sm:flex-row justify-between items-center p-0 px-4 pb-2 w-full gap-4">
                  {/* <Avatar>
                    <AvatarImage src={logo} alt="User" />
                    <AvatarFallback>
                      {booking.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar> */}
                  <span className="text-[15px] text-[#737373]">{booking.name}</span>
                  <span>{getRoomInfo(booking)}</span>
                  <span className="text-[12px] whitespace-nowrap">
                    {formatTimeAgo(booking.reservedAt)}
                  </span>
                </CardContent>
              </div>
            </Card>
          ))}
          <Link to={'/Admin/reservations'} className="w-full flex justify-center">
            <Button className="bg-[#AD46FF] cursor-pointer">
              راجع جميع الحجوزات
            </Button>
          </Link>
        </div>

        <div className="w-full lg:w-1/2 px-24 pr-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
            {visibleStats.map((stat) => (
              <Card 
                key={stat.key} 
                className="flex flex-col justify-center items-center bg-white hover:bg-[#4facfe] hover:text-white transition-all duration-500 ease-in-out rounded-2xl p-4 sm:p-6 text-base text-center h-30 w-full hover:-translate-y-2"
              >
                <CardTitle className="text-sm sm:text-lg font-semibold mb-2">
                  {stat.label}
                </CardTitle>
                <h1 className="text-lg sm:text-xl font-bold">
                  {stats[stat.key as keyof typeof stats]}
                </h1>
              </Card>
            ))}
          </div>
          {statsEntries.length > 4 && (
            <div className="flex justify-center mt-4">
              <Button 
                className="bg-[#4facfe] hover:bg-[#3a9bed] cursor-pointer"
                onClick={() => setShowAllStats(!showAllStats)}
              >
                {showAllStats ? 'عرض أقل' : 'عرض المزيد'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}