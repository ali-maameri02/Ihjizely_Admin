// src/components/subscription-plans.tsx
import { useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Plan } from './PlanCard'; // Import the Plan interface

// Lazy-loaded components
const PlanCard = lazy(() => import("./PlanCard"));
const ConfirmationSection = lazy(() => import("./ConfirmationSection"));

export default function SubscriptionPlans() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string>("gold");

  const [plans, setPlans] = useState<Plan[]>([
    {
      id: "gold",
      name: "الذهبية",
      tagline: "الحل الأمثل لبداية صحيحة",
      price: 999, // Changed to number
      currency: "دينار",
      period: "شهريا",
      features: ["يمكنك إضافة خمسة إعلانات في الشهر"],
      icon: "Star",
      color: "bg-gradient-to-r from-yellow-400 to-yellow-600"
    },
    {
      id: "silver",
      name: "الفضية",
      tagline: "مثالي للاستخدام المتوسط",
      price: 799, // Changed to number
      currency: "دينار",
      period: "شهريا",
      features: ["يمكنك إضافة ثلاثة إعلانات في الشهر"],
      icon: "Medal",
      color: "bg-gradient-to-r from-gray-300 to-gray-500"
    },
    {
      id: "bronze",
      name: "البرونزية",
      tagline: "البداية المثالية",
      price: 599, // Changed to number
      currency: "دينار",
      period: "شهريا",
      features: ["يمكنك إضافة إعلان واحد في الشهر"],
      icon: "Diamond",
      color: "bg-gradient-to-r from-amber-700 to-amber-900"
    }
  ]);
  
  const handleUpdatePlan = (updatedPlan: Plan) => {
    setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
    toast.success("تم تحديث الخطة بنجاح");
  };
  
  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleConfirm = () => {
    const planName = plans.find(p => p.id === selectedPlan)?.name || "";
    toast.success(`تم تغيير الاشتراك إلى الخطة ${planName}`);
    navigate("/Admin/subscriptions");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">إدارة اﻟﺎﺷﺘﺮاﻛﺎت</h1>
          <p className="text-gray-600 mt-2">اختر الخطة المناسبة لاحتياجاتك التجارية</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate("/Admin/subscriptions")}
          className="flex items-center gap-2"
        >
          رجوع إلى اﻟﺎﺷﺘﺮاﻛﺎت
        </Button>
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
            isAdmin={true} // Set this based on actual user role
            onSelect={handleSelectPlan}
            onUpdate={handleUpdatePlan}
          />
        ))}
        </div>
      </Suspense>

      <Suspense fallback={<div className="mt-12 p-6 bg-white border rounded-xl shadow-sm h-28 bg-gray-100 animate-pulse" />}>
        <ConfirmationSection 
          selectedPlan={selectedPlan}
          plans={plans}
          onCancel={() => navigate("/subscriptions")}
          onConfirm={handleConfirm}
        />
      </Suspense>
    </div>
  );
}