import axios from 'axios';
import { authService } from './auth';

export type PropertyType = 'Residence' | 'Hall';
export type PropertyStatus = 'Pending' | 'Accepted' | 'Refused';

export type Property = {
    id: string;
    title: string;
    description: string;
    location: {
      city: string;
      state: string;
      country: string;
      latitude: number;
      longitude: number;
    };
    price: number;
    currency: string;
    discount?: {
      value: number;
    };
    facilities: Array<{ name: string }>;
    type: PropertyType;
    unavailableDays: string[];
    unavailableDateTimeRanges: Array<{
      start: string;
      end: string;
    }>;
    createdAt: string;
    updatedAt: string;
    details: Record<string, any>;
    images?: Array<{ url: string }>;
    status?: PropertyStatus;
};

export type UnitRow = {
  id: string;
  type: string;
  unitName: string;
  image: string;
  owner: string;
  location: string;
  status: PropertyStatus;
  subscriptionStatus: boolean;
  registrationDate: string;
  premiumSubscription: boolean;
  propertyType: string;
};

export const unitsService = {
    async getAllUnits(): Promise<UnitRow[]> {
        try {
            const token = authService.getAuthToken();
            if (!token) throw new Error('No authentication token found');
            
            const response = await axios.get<Property[]>(
                `${import.meta.env.VITE_API_URL}/AllProperties/all`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                }
            );
            
            return response.data.map(property => 
                this.transformPropertyToUnitRow(property)
            );
        } catch (error) {
            throw this.handleApiError(error, 'Failed to fetch units');
        }
    },

    async getUnitsByStatus(status: PropertyStatus): Promise<UnitRow[]> {
        try {
            const token = authService.getAuthToken();
            if (!token) throw new Error('No authentication token found');
            
            const response = await axios.get<Property[]>(
                `${import.meta.env.VITE_API_URL}/AllProperties/all/status/${status}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                }
            );
            
            return response.data.map(property => 
                this.transformPropertyToUnitRow(property)
            );
        } catch (error) {
            throw this.handleApiError(error, 'Failed to fetch units by status');
        }
    },

    async getUnitsByOwner(ownerId: string): Promise<UnitRow[]> {
        try {
            const token = authService.getAuthToken();
            if (!token) throw new Error('No authentication token found');
            
            const response = await axios.get<Property[]>(
                `${import.meta.env.VITE_API_URL}/AllProperties/by-owner/${ownerId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                }
            );
            
            return response.data.map(property => 
                this.transformPropertyToUnitRow(property)
            );
        } catch (error) {
            throw this.handleApiError(error, 'Failed to fetch units by owner');
        }
    },

    async getUnitById(id: string): Promise<Property> {
        try {
            const token = authService.getAuthToken();
            if (!token) throw new Error('No authentication token found');
            
            const response = await axios.get<Property>(
                `${import.meta.env.VITE_API_URL}/AllProperties/${id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                }
            );
            
            return response.data;
        } catch (error) {
            throw this.handleApiError(error, 'Failed to fetch unit');
        }
    },

    async getUnitsByType(type: string): Promise<UnitRow[]> {
        try {
          const token = authService.getAuthToken();
          if (!token) throw new Error('No authentication token found');
          
          const isMainType = this.getPropertyTypes().some(t => t.type === type);
          
          if (isMainType) {
            const allUnits = await this.getAllUnits();
            return allUnits.filter(unit => unit.propertyType === type);
          } else {
            const mainType = this.getPropertyTypes().find(t => 
              t.subtypes.includes(type)
            )?.type;
            
            if (!mainType) {
              throw new Error(`Invalid property type: ${type}`);
            }
            
            const mainTypeUnits = await this.getAllUnits();
            return mainTypeUnits.filter(unit => 
              unit.type === this.getSubtypeLabel(type) || 
              unit.propertyType === type
            );
          }
        } catch (error) {
          throw this.handleApiError(error, 'Failed to fetch units by type');
        }
    },

    async updatePropertyStatus(
        id: string, 
        status: PropertyStatus
    ): Promise<void> {
        try {
            const token = authService.getAuthToken();
            if (!token) throw new Error('No authentication token found');
            
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/AllProperties/${id}/status`,
                `"${status}"`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const serverMessage = error.response?.data?.message || error.response?.data;
                throw new Error(serverMessage || 'Failed to update status');
            }
            throw this.handleApiError(error, 'Failed to update status');
        }
    },

    async updateProperty(
        id: string,
        updates: Partial<Property>
    ): Promise<UnitRow> {
        try {
            const token = authService.getAuthToken();
            if (!token) throw new Error('No authentication token found');
            
            const response = await axios.patch<Property>(
                `${import.meta.env.VITE_API_URL}/AllProperties/${id}`,
                updates,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            return this.transformPropertyToUnitRow(response.data);
        } catch (error) {
            throw this.handleApiError(error, 'Failed to update property');
        }
    },

    async deleteUnit(id: string): Promise<void> {
        try {
            const token = authService.getAuthToken();
            if (!token) throw new Error('No authentication token found');
            
            if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
                throw new Error('Invalid ID format. Expected UUID.');
            }
            
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/AllProperties/${id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
        } catch (error) {
            throw this.handleApiError(error, 'Failed to delete unit');
        }
    },

    transformPropertyToUnitRow(property: Property): UnitRow {
        return {
            id: property.id,
            type: this.getPropertyTypeLabel(property.type),
            unitName: property.title,
            image: property.images?.[0]?.url || '',
            owner: 'Business Owner',
            location: `${property.location.city}, ${property.location.country}`,
            status: property.status || 'Pending',
            subscriptionStatus: property.status === 'Accepted',
            registrationDate: new Date(property.createdAt).toLocaleDateString(),
            premiumSubscription: property.discount ? property.discount.value > 0 : false,
            propertyType: property.type
        };
    },

    handleApiError(error: unknown, defaultMessage: string): Error {
        if (axios.isAxiosError(error)) {
            return new Error(error.response?.data?.message || defaultMessage);
        }
        return new Error(defaultMessage);
    },

    getPropertyTypeLabel(type: PropertyType): string {
        const typeMap: Record<PropertyType, string> = {
            'Residence': 'وحدات سكنية',
            'Hall': 'قاعات'
        };
        return typeMap[type] || type;
    },

    getPropertyTypes(): { type: PropertyType; label: string; subtypes: string[] }[] {
        return [
            {
                type: 'Residence',
                label: 'وحدات سكنية',
                subtypes: [
                    'Apartment',
                    'Chalet',
                    'Hotel Room',
                    'Hotel Apartment',
                    'Resort',
                    'Rest House'
                ]
            },
            {
                type: 'Hall',
                label: 'قاعات',
                subtypes: [
                    'Event Hall Small',
                    'Event Hall Large',
                    'Meeting Room'
                ]
            }
        ];
    },

    getSubtypeLabel(subtype: string): string {
        const subtypeMap: Record<string, string> = {
            'Apartment': 'شقق',
            'Chalet': 'شاليهات',
            'Hotel Room': 'غرف فندقية',
            'Hotel Apartment': 'شقق فندقية',
            'Resort': 'منتجعات',
            'Rest House': 'بيوت ريفية',
            'Event Hall Small': 'قاعة أحداث صغيرة',
            'Event Hall Large': 'قاعة أحداث كبيرة',
            'Meeting Room': 'غرفة اجتماعات'
        };
        return subtypeMap[subtype] || subtype;
    }
};