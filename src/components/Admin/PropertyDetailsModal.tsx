// components/PropertyDetailsModal.tsx
import React from 'react';
import { Property } from '@/API/UnitsService';
import { Button } from '../ui/button';
import { X } from 'lucide-react';

interface PropertyDetailsModalProps {
  property: Property | null;
  onClose: () => void;
}

export const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({ property, onClose }) => {
  if (!property) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div>
              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-2">الوصف</h3>
                <p className="text-gray-600">{property.description}</p>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-2">الموقع</h3>
                <p className="text-gray-600">
                  {property.location.city}, {property.location.state}, {property.location.country}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  خط العرض: {property.location.latitude}, خط الطول: {property.location.longitude}
                </p>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-2">التفاصيل</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-medium">السعر:</span> {property.price} {property.currency}
                  </div>
                  <div>
                    <span className="font-medium">الحالة:</span> {property.status}
                  </div>
                  {property.discount && (
                    <div>
                      <span className="font-medium">الخصم:</span> {property.discount.value}%
                    </div>
                  )}
                  <div>
                    <span className="font-medium">تاريخ الإنشاء:</span> {new Date(property.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-2">المرافق</h3>
                <div className="flex flex-wrap gap-2">
                  {property.facilities.map((facility, index) => (
                    <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                      {facility.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-2">التفاصيل الإضافية</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(property.details).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-medium">{key}:</span> {String(value)}
                    </div>
                  ))}
                </div>
              </div>

              {property.unavailableDays && property.unavailableDays.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-2">الأيام غير المتاحة</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.unavailableDays.map((day, index) => (
                      <span key={index} className="bg-red-100 px-3 py-1 rounded-full text-sm text-red-800">
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end">
          <Button onClick={onClose}>إغلاق</Button>
        </div>
      </div>
    </div>
  );
};