// Dashboard.tsx
import { SectionCards } from "@/components/section-cards";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import  RecentActivities  from "./RecentActivities"; // Add this line
export default function Dashboard(){
  return (
    <>
      <SectionCards />
      <ChartAreaInteractive />
      <RecentActivities /> 
    </>
  );
}