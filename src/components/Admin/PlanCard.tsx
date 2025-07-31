// src/components/PlanCard.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PencilIcon, CheckIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

export interface Plan {
  id: string;
  name: string;
  tagline: string;
  price: number; // Changed to number
  currency: string;
  period: string;
  features: string[];
  icon: string;
  color: string;
}

interface PlanCardProps {
  plan: Plan;
  isSelected: boolean;
  isAdmin?: boolean;
  onSelect: (planId: string) => void;
  onUpdate: (updatedPlan: Plan) => void;
}

export default function PlanCard({ 
  plan, 
  isSelected, 
  isAdmin = false,
  onSelect, 
  onUpdate 
}: PlanCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlan, setEditedPlan] = useState(plan);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate important fields
    if (!editedPlan.name.trim()) {
      newErrors.name = "اسم الخطة مطلوب";
    }
    
    if (editedPlan.price <= 0 || isNaN(editedPlan.price)) {
      newErrors.price = "يجب أن يكون السعر رقمًا موجبًا";
    }
    
    if (editedPlan.features.length === 0) {
      newErrors.features = "يجب إضافة ميزة واحدة على الأقل";
    } else {
      for (let i = 0; i < editedPlan.features.length; i++) {
        if (!editedPlan.features[i].trim()) {
          newErrors[`feature-${i}`] = "الميزة لا يمكن أن تكون فارغة";
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedPlan(plan);
    setErrors({});
  };

  const handleSave = () => {
    if (!validateForm()) {
      toast.error("يوجد أخطاء في المدخلات");
      return;
    }
    
    onUpdate(editedPlan);
    setIsEditing(false);
    setErrors({});
  };

  const handleCancel = () => {
    setEditedPlan(plan);
    setIsEditing(false);
    setErrors({});
  };

  const handleChange = (field: keyof Plan, value: string | number) => {
    setEditedPlan(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when field changes
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    setEditedPlan(prev => {
      const newFeatures = [...prev.features];
      newFeatures[index] = value;
      return { ...prev, features: newFeatures };
    });
    
    // Clear feature error
    if (errors[`feature-${index}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`feature-${index}`];
        return newErrors;
      });
    }
  };

  const addFeature = () => {
    setEditedPlan(prev => ({
      ...prev,
      features: [...prev.features, ""]
    }));
  };

  const removeFeature = (index: number) => {
    if (editedPlan.features.length <= 1) return;
    
    setEditedPlan(prev => {
      const newFeatures = [...prev.features];
      newFeatures.splice(index, 1);
      return { ...prev, features: newFeatures };
    });
  };

  return (
    <div 
      className={`border rounded-2xl shadow-xl overflow-hidden transition-all duration-300 relative ${
        isSelected 
          ? "ring-4 ring-purple-500 scale-[1.02]" 
          : "hover:shadow-lg"
      }`}
    >
      {/* Admin edit button */}
      {isAdmin && !isEditing && (
        <Button 
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 rounded-full bg-white/80 hover:bg-white"
          onClick={handleEdit}
        >
          <PencilIcon className="w-5 h-5 text-gray-700" />
        </Button>
      )}

      <div className={`${plan.color} p-6 text-white`}>
        <div className="flex justify-between items-center">
          <div>
            {isEditing ? (
              <div>
                <input
                  type="text"
                  value={editedPlan.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`text-2xl font-bold bg-white/20 rounded px-2 py-1 w-full ${errors.name ? 'border-2 border-red-500' : ''}`}
                  placeholder="اسم الخطة"
                />
                {errors.name && <p className="text-red-300 text-sm mt-1">{errors.name}</p>}
              </div>
            ) : (
              <h2 className="text-2xl font-bold">{plan.name}</h2>
            )}
            
            {isEditing ? (
              <input
                type="text"
                value={editedPlan.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="mt-1 bg-white/20 rounded px-2 py-1 w-full"
                placeholder="وصف الخطة"
              />
            ) : (
              <p className="mt-1">{plan.tagline}</p>
            )}
          </div>
          <div className="bg-white/20 p-3 rounded-full">
            <div className="w-6 h-6" />
          </div>
        </div>
      </div>
      
      <div className="p-6 border-b">
        <div className="text-center">
          {isEditing ? (
            <div>
              <div className="flex items-center justify-center gap-2">
                <input
                  type="number"
                  value={editedPlan.price}
                  onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                  className={`text-4xl font-bold mt-2 bg-gray-100 rounded px-3 py-2 w-32 text-center ${errors.price ? 'border-2 border-red-500' : ''}`}
                  step="0.01"
                  min="0"
                />
                <span className="text-4xl font-bold mt-2">{editedPlan.currency} / {editedPlan.period}</span>
              </div>
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>
          ) : (
            <p className="text-4xl font-bold mt-2">{plan.price} {plan.currency} / {plan.period}</p>
          )}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="font-medium mb-3">المميزات:</h3>
        {errors.features && <p className="text-red-500 text-sm mb-2">{errors.features}</p>}
        
        <ul className="space-y-3">
          {editedPlan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              
              {isEditing ? (
                <div className="flex-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      className={`flex-1 bg-gray-100 rounded px-2 py-1 ${errors[`feature-${index}`] ? 'border-2 border-red-500' : ''}`}
                      placeholder="ميزة جديدة"
                    />
                    <Button 
                      variant="destructive"
                      size="icon"
                      className="w-8 h-8"
                      onClick={() => removeFeature(index)}
                      disabled={editedPlan.features.length <= 1}
                    >
                      <XIcon className="w-4 h-4" />
                    </Button>
                  </div>
                  {errors[`feature-${index}`] && <p className="text-red-500 text-sm mt-1">{errors[`feature-${index}`]}</p>}
                </div>
              ) : (
                <span>{feature}</span>
              )}
            </li>
          ))}
          
          {isEditing && (
            <li className="flex justify-center mt-4">
              <Button 
                variant="outline"
                className="text-sm py-1 px-3"
                onClick={addFeature}
              >
                + إضافة ميزة
              </Button>
            </li>
          )}
        </ul>
        
        {isEditing ? (
          <div className="flex gap-2 mt-6">
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={handleSave}
            >
              <CheckIcon className="w-4 h-4 mr-2" />
              حفظ
            </Button>
            <Button 
              variant="outline"
              className="flex-1"
              onClick={handleCancel}
            >
              <XIcon className="w-4 h-4 mr-2" />
              إلغاء
            </Button>
          </div>
        ) : (
          <Button 
            className={`w-full mt-6 ${
              isSelected 
                ? "bg-purple-600 hover:bg-purple-700" 
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
            onClick={() => onSelect(plan.id)}
          >
            {isSelected ? "الخطة المختارة" : "اختر هذه الخطة"}
          </Button>
        )}
      </div>
    </div>
  );
}