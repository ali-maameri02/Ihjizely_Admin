// components/SectionCards.tsx
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import usericon from '../assets/3-Friends.svg';
import propertyicon from '../assets/night_shelter.svg';
import calendar from '../assets/free_cancellation.svg';
import { useStatistics } from '../hooks/useStatistics';

// Simple inline loading spinner component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

// Simple inline error message component
const ErrorMessage = ({ message }: { message: string }) => (
  <div className="p-4 text-red-600 bg-red-100 rounded-md">
    Error: {message}
  </div>
);

export function SectionCards() {
  const { statistics, loading, error } = useStatistics();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!statistics) return <ErrorMessage message="No statistics data available" />;

  return (
    <div className="grid grid-cols-1 gap-3 px-4 sm:grid-cols-2 lg:grid-cols-3"> {/* Changed to 4 columns */}
      <StatCard 
        icon={usericon} 
        value={statistics.totalUsers} 
        label="إجمالي المستخدمين" 
        alt="Users"
      />
      
      <StatCard 
        icon={propertyicon} 
        value={statistics.totalProperties} 
        label="مجموع الوحدات" 
        alt="Properties"
      />
      
      <StatCard 
        icon={calendar} 
        value={statistics.reserved} 
        label="محجوز (مؤكد)" 
        alt="Reservations"
      />

    
    </div>
  );
}

interface StatCardProps {
  icon: string;
  value: number;
  label: string;
  alt: string;
}

const StatCard = ({ icon, value, label, alt }: StatCardProps) => (
  <Card className="flex flex-row items-center justify-between bg-white from-primary/5 to-card dark:bg-card shadow-xs transition-transform hover:scale-[1.01] p-4">
    <div className="mr-4">
      <img src={icon} alt={alt} className="w-10 h-10"/>
    </div>
    <div className="flex-1">
      <CardHeader className="p-0 text-right">
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value}
        </CardTitle>
        <CardDescription>{label}</CardDescription>
      </CardHeader>
    </div>
  </Card>
);