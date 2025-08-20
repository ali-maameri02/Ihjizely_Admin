// components/PropertyDetailsModal.tsx
import React from 'react';
import { Property } from '@/API/UnitsService';
import { Button } from '../ui/button';
import { X, Home, MapPin, DollarSign, User, Calendar, Bed, Users, Ruler, Star } from 'lucide-react';

interface PropertyDetailsModalProps {
  property: Property | null;
  onClose: () => void;
}

export const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({ property, onClose }) => {
  if (!property) return null;

  // Helper function to render detail items
  const DetailItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="text-purple-600">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="font-semibold text-gray-800">{value || 'غير متوفر'}</p>
      </div>
    </div>
  );

  // Render type-specific details based on property type and details
  const renderTypeSpecificDetails = () => {
    const { type, details } = property;

    switch (type) {
      case 'Residence':
        return (
          <>
            {details.NumberOfAdults && (
              <DetailItem
                icon={<Users className="w-5 h-5" />}
                label="عدد البالغين"
                value={details.NumberOfAdults}
              />
            )}
            {details.NumberOfChildren && (
              <DetailItem
                icon={<Users className="w-5 h-5" />}
                label="عدد الأطفال"
                value={details.NumberOfChildren}
              />
            )}
            {/* Apartment specific */}
            {details.apartmentType !== undefined && (
              <DetailItem
                icon={<Home className="w-5 h-5" />}
                label="نوع الشقة"
                value={getApartmentTypeLabel(details.apartmentType)}
              />
            )}
            {/* Hotel Room specific */}
            {details.hotelRoomType !== undefined && (
              <DetailItem
                icon={<Bed className="w-5 h-5" />}
                label="نوع الغرفة"
                value={getHotelRoomTypeLabel(details.hotelRoomType)}
              />
            )}
            {details.clasification !== undefined && (
              <DetailItem
                icon={<Star className="w-5 h-5" />}
                label="التصنيف"
                value={`${details.clasification} نجوم`}
              />
            )}
            {/* Hotel Apartment specific */}
            {details.hotalApartmentType !== undefined && (
              <DetailItem
                icon={<Home className="w-5 h-5" />}
                label="نوع الشقة الفندقية"
                value={getHotelApartmentTypeLabel(details.hotalApartmentType)}
              />
            )}
            {/* Resort specific */}
            {details.resortType !== undefined && (
              <DetailItem
                icon={<Home className="w-5 h-5" />}
                label="نوع المنتجع"
                value={getResortTypeLabel(details.resortType)}
              />
            )}
          </>
        );

      case 'Hall':
        return (
          <>
            {details.NumberOfGuests && (
              <DetailItem
                icon={<Users className="w-5 h-5" />}
                label="سعة الاستيعاب"
                value={`${details.NumberOfGuests} ضيف`}
              />
            )}
            {details.Features && Array.isArray(details.Features) && (
              <DetailItem
                icon={<Star className="w-5 h-5" />}
                label="المميزات"
                value={details.Features.map(getHallFeatureLabel).join('، ')}
              />
            )}
            {details.Area && (
              <DetailItem
                icon={<Ruler className="w-5 h-5" />}
                label="المساحة"
                value={`${details.Area} م²`}
              />
            )}
          </>
        );

      default:
        return Object.entries(details).map(([key, value]) => (
          <DetailItem
            key={key}
            icon={<Star className="w-5 h-5" />}
            label={key}
            value={String(value)}
          />
        ));
    }
  };

  // Helper functions for type labels
  const getApartmentTypeLabel = (type: number) => {
    const types = ['استوديو', 'شقة صغيرة', 'شقة كبيرة', 'بنتهاوس'];
    return types[type] || `نوع ${type}`;
  };

  const getHotelRoomTypeLabel = (type: number) => {
    const types = ['غرفة فردية', 'غرفة مزدوجة', 'جناح', 'غرفة عائلية'];
    return types[type] || `نوع ${type}`;
  };

  const getHotelApartmentTypeLabel = (type: number) => {
    const types = ['استوديو', 'غرفة نوم واحدة', 'غرفتي نوم', 'ثلاث غرف نوم'];
    return types[type] || `نوع ${type}`;
  };

  const getResortTypeLabel = (type: number) => {
    const types = ['منتجع شاطئي', 'منتجع جبلي', 'منتجع صحراوي', 'منتجع غابي'];
    return types[type] || `نوع ${type}`;
  };

  const getHallFeatureLabel = (feature: number) => {
    const features = [
      'تكييف مركزي',
      'شاشات عرض',
      'نظام صوتي',
      'إضاءة متطورة',
      'مطبخ مجهز',
      'موقف سيارات'
    ];
    return features[feature] || `ميزة ${feature}`;
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">{property.title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Images Gallery */}
          {property.images && property.images.length > 0 && (
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.images.map((image, index) => (
                  <div key={index} className="rounded-lg overflow-hidden">
                    <img 
                      src={image.url} 
                      alt={`Property ${index + 1}`}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-property.jpg';
                        e.currentTarget.onerror = null;
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div>
              <h3 className="font-semibold text-lg mb-4">المعلومات الأساسية</h3>
              
              <div className="space-y-3">
                <DetailItem
                  icon={<Home className="w-5 h-5" />}
                  label="النوع"
                  value={property.type === 'Residence' ? 'وحدات سكنية' : 'قاعات'}
                />
                
                <DetailItem
                  icon={<MapPin className="w-5 h-5" />}
                  label="الموقع"
                  value={`${property.location.city}, ${property.location.state}, ${property.location.country}`}
                />
                
                <DetailItem
                  icon={<DollarSign className="w-5 h-5" />}
                  label="السعر"
                  value={`${property.price} ${property.currency || 'د.ك'}`}
                />
                
                {property.discount && property.discount.value > 0 && (
                  <DetailItem
                    icon={<DollarSign className="w-5 h-5" />}
                    label="الخصم"
                    value={`${property.discount.value}%`}
                  />
                )}
                
                <DetailItem
                  icon={<User className="w-5 h-5" />}
                  label="صاحب العمل"
                  value={`${property.businessOwnerFirstName} ${property.businessOwnerLastName}`}
                />
                
                <DetailItem
                  icon={<Calendar className="w-5 h-5" />}
                  label="تاريخ الإنشاء"
                  value={new Date(property.createdAt).toLocaleDateString()}
                />
                
                <DetailItem
                  icon={<Calendar className="w-5 h-5" />}
                  label="تاريخ التحديث"
                  value={new Date(property.updatedAt).toLocaleDateString()}
                />
              </div>
            </div>

            {/* Right Column - Type Specific Details */}
            <div>
              <h3 className="font-semibold text-lg mb-4">التفاصيل الخاصة بالنوع</h3>
              <div className="space-y-3">
                {renderTypeSpecificDetails()}
              </div>

              {/* Facilities */}
              {property.facilities && property.facilities.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-lg mb-3">المرافق</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.facilities.map((facility, index) => (
                      <span
                        key={index}
                        className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                      >
                        {facility.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-3">الوصف</h3>
              <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                {property.description}
              </p>
            </div>
          )}

          {/* Unavailable Days */}
          {property.unavailableDays && property.unavailableDays.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-3">الأيام غير المتاحة</h3>
              <div className="flex flex-wrap gap-2">
                {property.unavailableDays.map((day, index) => (
                  <span
                    key={index}
                    className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm"
                  >
                    {new Date(day).toLocaleDateString()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end">
          <Button onClick={onClose}>إغلاق</Button>
        </div>
      </div>
    </div>
  );
};