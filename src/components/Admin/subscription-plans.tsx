// src/components/Admin/subscription-plans.tsx
import { useState, lazy, Suspense, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { subscriptionsService } from "@/API/SubscriptionsService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

// Lazy-loaded components
const PlanCard = lazy(() => import("./PlanCard"));
const ConfirmationSection = lazy(() => import("./ConfirmationSection"));

export interface Plan {
  id: string;
  name: string;
  tagline: string;
  price: number;
  currency: string;
  period: string;
  features: string[];
  icon: string;
  color: string;
  maxAds?: number;
  duration?: string;
  durationInDays: number; // Add this required field
  isActive?: boolean;
}

export default function SubscriptionPlans() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    durationInDays: 1, // Change to number and match API field name
    amount: 0,
    currency: 'LYD',
    maxAds: 0
  });
  

  // Helper function to convert duration string to days
 // In subscription-plans.tsx, update the convertDurationToDays function:

const convertDurationToDays = (duration: string | number): number => {
  if (!duration) return 30;
  
  // If it's a number, return it directly
  if (typeof duration === 'number') {
    return duration;
  }
  
  // If it's a string that's just a number, parse it
  if (/^\d+$/.test(duration)) {
    return parseInt(duration);
  }
  
  // If it's in TimeSpan format (like "5.00:00:00" for 5 days)
  if (/^\d+\.\d{2}:\d{2}:\d{2}$/.test(duration)) {
    const [days] = duration.split('.');
    return parseInt(days);
  }
  
  // If it's in HH:MM:SS format, convert to days
  if (/^\d{2}:\d{2}:\d{2}$/.test(duration)) {
    const [hours] = duration.split(':').map(Number);
    return Math.ceil(hours / 24);
  }
  
  return 30;
};

// Update the formatDurationForDisplay function:
const formatDurationForDisplay = (duration: string | number): string => {
  const days = convertDurationToDays(duration);
  
  if (days === 30) return "شهر";
  if (days === 90) return "3 أشهر";
  if (days === 180) return "6 أشهر";
  if (days === 365) return "سنة";
  return `${days} يوم`;
};



 

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setIsLoading(true);
        const apiPlans = await subscriptionsService.getAllPlans();
        
        // Transform API plans to match our UI structure
      // In the fetchPlans function, update the transformation:
// In the fetchPlans function:
const transformedPlans = apiPlans.map(plan => ({
  id: plan.id,
  name: plan.name,
  tagline: getPlanTagline(plan.name),
  price: plan.amount,
  currency: plan.currency,
  period: formatDurationForDisplay(plan.duration), // Use the returned duration
  features: [
    plan.maxAds 
      ? `يمكنك إضافة ${plan.maxAds} إعلانات`
      : "عدد غير محدد من الإعلانات",
    `المدة: ${formatDurationForDisplay(plan.duration)}` // Use the returned duration
  ],
  icon: getPlanIcon(plan.name),
  color: getPlanColor(plan.name),
  maxAds: plan.maxAds,
  duration: plan.duration,
  durationInDays: convertDurationToDays(plan.duration), // Convert the returned duration to days
  isActive: plan.isActive
}));
        
        setPlans(transformedPlans);
        if (transformedPlans.length > 0) {
          setSelectedPlan(transformedPlans[0].id);
        }
      } catch (error) {
        toast.error('فشل تحميل خطط الاشتراك');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const getPlanTagline = (name: string) => {
    switch(name) {
      case "الذهبية": return "الحل الأمثل لبداية صحيحة";
      case "الفضية": return "مثالي للاستخدام المتوسط";
      case "البرونزية": return "البداية المثالية";
      default: return "خطة مميزة لاحتياجاتك";
    }
  };

  const getPlanIcon = (name: string) => {
    switch(name) {
      case "الذهبية": return "Star";
      case "الفضية": return "Medal";
      case "البرونزية": return "Diamond";
      default: return "Star";
    }
  };

  const getPlanColor = (name: string) => {
    switch(name) {
      case "الذهبية": return "bg-gradient-to-r from-yellow-400 to-yellow-600";
      case "الفضية": return "bg-gradient-to-r from-gray-300 to-gray-500";
      case "البرونزية": return "bg-gradient-to-r from-amber-700 to-amber-900";
      default: return "bg-gradient-to-r from-purple-400 to-purple-600";
    }
  };
  const handleDeletePlan = async (planId: string) => {
    try {
      await subscriptionsService.deletePlan(planId);
      setPlans(prev => prev.filter(p => p.id !== planId));
      toast.success("تم حذف الخطة بنجاح");
    } catch (error) {
      toast.error('فشل حذف الخطة');
    }
  };
 // Update the handleCreatePlan function:
const handleCreatePlan = async () => {
  try {
    setIsLoading(true);
    
    const createdPlan = await subscriptionsService.createPlan({
      name: newPlan.name,
      durationInDays: newPlan.durationInDays,
      amount: newPlan.amount,
      currency: newPlan.currency,
      maxAds: newPlan.maxAds
    });
    
    const transformedPlan = {
      id: createdPlan.id,
      name: createdPlan.name,
      tagline: getPlanTagline(createdPlan.name),
      price: createdPlan.amount,
      currency: createdPlan.currency,
      period: formatDurationForDisplay(createdPlan.duration), // Use the returned duration
      features: [
        createdPlan.maxAds 
          ? `يمكنك إضافة ${createdPlan.maxAds} إعلانات`
          : "عدد غير محدد من الإعلانات",
        `المدة: ${formatDurationForDisplay(createdPlan.duration)}` // Use the returned duration
      ],
      icon: getPlanIcon(createdPlan.name),
      color: getPlanColor(createdPlan.name),
      maxAds: createdPlan.maxAds,
      duration: createdPlan.duration,
      durationInDays: convertDurationToDays(createdPlan.duration), // Convert the returned duration to days
      isActive: true
    };
    
    setPlans(prev => [...prev, transformedPlan]);
    setIsCreateDialogOpen(false);
    setNewPlan({
      name: '',
      durationInDays: 1,
      amount: 0,
      currency: 'LYD',
      maxAds: 0
    });
    toast.success("تم إنشاء الخطة بنجاح");
  } catch (error) {
    toast.error('فشل إنشاء الخطة');
  } finally {
    setIsLoading(false);
  }
};
// Update the handleUpdatePlan function:
const handleUpdatePlan = async (updatedPlan: Plan) => {
  try {
    const { id, name, price, currency, maxAds, durationInDays } = updatedPlan;
    
    await subscriptionsService.updatePlan(id, {
      name,
      durationInDays, // Send as number
      amount: price,
      currency,
      maxAds
    });
    
    setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
    toast.success("تم تحديث الخطة بنجاح");
  } catch (error) {
    toast.error('فشل تحديث الخطة');
  }
};
  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleConfirm = () => {
    const planName = plans.find(p => p.id === selectedPlan)?.name || "";
    toast.success(`تم تغيير الاشتراك إلى الخطة ${planName}`);
    navigate("/Admin/subscriptions");
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((_, idx) => (
            <div key={idx} className="border rounded-2xl shadow-xl overflow-hidden h-[420px] bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">إدارة الاشتراكات</h1>
          <p className="text-gray-600 mt-2">اختر الخطة المناسبة لاحتياجاتك التجارية</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate("/Admin/subscriptions")}
            className="flex items-center gap-2"
          >
            رجوع إلى الاشتراكات
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                إنشاء خطة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex justify-between items-center">
                  <span>إنشاء خطة جديدة</span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DialogTitle>
              </DialogHeader>
              
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم الخطة</label>
                    <input
                      type="text"
                      value={newPlan.name}
                      onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                      className="w-full p-2 border rounded"
                      placeholder="أدخل اسم الخطة"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      المدة (أيام)
                      <span className="text-xs text-gray-500 block">أدخل عدد الأيام (1-365)</span>
                    </label>
                    <input
  type="number"
  min="1"
  max="365"
  value={newPlan.durationInDays}
  onChange={(e) => {
    const value = Math.min(365, Math.max(1, parseInt(e.target.value) || 1));
    setNewPlan({...newPlan, durationInDays: value});
  }}
  className="w-full p-2 border rounded"
  placeholder="أدخل عدد الأيام"
/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">السعر</label>
                    <input
                      type="number"
                      min="0"
                      value={newPlan.amount}
                      onChange={(e) => setNewPlan({...newPlan, amount: Number(e.target.value)})}
                      className="w-full p-2 border rounded"
                      placeholder="أدخل سعر الخطة"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">العملة</label>
                    <select
                      value={newPlan.currency}
                      onChange={(e) => setNewPlan({...newPlan, currency: e.target.value})}
                      className="w-full p-2 border rounded"
                    >
                      <option value="LYD">الدينار الليبي</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الحد الأقصى للإعلانات (اختياري)</label>
                    <input
                      type="number"
                      min="0"
                      value={newPlan.maxAds}
                      onChange={(e) => setNewPlan({...newPlan, maxAds: Number(e.target.value)})}
                      className="w-full p-2 border rounded"
                      placeholder="أدخل الحد الأقصى للإعلانات"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    إلغاء
                  </Button>
                  <Button 
                    onClick={handleCreatePlan} 
                    disabled={!newPlan.name || !newPlan.durationInDays || !newPlan.amount}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    حفظ الخطة
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((_, idx) => (
          <div key={idx} className="border rounded-2xl shadow-xl overflow-hidden h-[420px] bg-gray-100 animate-pulse" />
        ))}
      </div>}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map(plan => (
  <PlanCard 
    key={plan.id}
    plan={plan}
    isSelected={selectedPlan === plan.id}
    isAdmin={true}
    onSelect={handleSelectPlan}
    onUpdate={handleUpdatePlan}
    onDelete={handleDeletePlan} // Add this prop
  />
))}
        </div>
      </Suspense>

      {plans.length > 0 && (
        <Suspense fallback={<div className="mt-12 p-6 bg-white border rounded-xl shadow-sm h-28 bg-gray-100 animate-pulse" />}>
          <ConfirmationSection 
            selectedPlan={selectedPlan}
            plans={plans}
            onCancel={() => navigate("/Admin/subscriptions")}
            onConfirm={handleConfirm}
          />
        </Suspense>
      )}
    </div>
  );
}