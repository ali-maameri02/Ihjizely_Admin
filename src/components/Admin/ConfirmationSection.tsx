// src/components/ConfirmationSection.tsx
import { Button } from "@/components/ui/button";

interface Plan {
  id: string;
  name: string;
  color: string;
}

interface ConfirmationSectionProps {
  selectedPlan: string;
  plans: Plan[];
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmationSection({ 
  selectedPlan, 
  plans, 
  onCancel, 
  onConfirm 
}: ConfirmationSectionProps) {
  const currentPlan = plans.find(p => p.id === selectedPlan);
  
  return (
    <div className="mt-12 p-6 bg-white border rounded-xl shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">الخطة المختارة</h3>
          {currentPlan && (
            <div className="flex items-center gap-3 mt-2">
              <div className={`${currentPlan.color} w-8 h-8 rounded-full`}></div>
              <p className="text-lg font-medium">
                {currentPlan.name}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="px-8 py-3"
          >
            إلغاء
          </Button>
          <Button 
            className="bg-purple-600 hover:bg-purple-700 px-8 py-3"
            onClick={onConfirm}
          >
            تأكيد تغيير الاشتراك
          </Button>
        </div>
      </div>
    </div>
  );
}