// RecentActivities.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon } from "lucide-react";
import { Button } from "../ui/button";
import logo from '../../assets/20250625_093712.jpg'
import room from '../../assets/hotel room with beachfront view.jpg'
export default function RecentActivities() {
  return (
    <div className="space-y-6 px-5 pt-2 h-full">
      <h2 className="text-xl font-bold text-left mb-4 mt-2">أحدث الإحصائيات</h2>
      <div className="flex flex-row justify-between items-center gap-12 w-full  ">
      <div className="cards flex flex-col w-1/2 gap-2">
      <Card className="flex flex-row items-center w-[35rem] p-0 text-[#404B51]  ">
        <div className="flex flex-row items-center">
        <img src={room} className="rounded-l-2xl w-52 h-36" alt="" />
       
        </div>
        <div className="flex flex-col justify-around gap-2 items-start p-0">

        <CardTitle>
        Hotel Elkheyam
        </CardTitle>
        <CardContent className="flex flex-row justify-between items-center p-0 w-full gap-4 ">
            
        <Avatar>
          <AvatarImage src={logo} alt="User" />
          <AvatarFallback>
            <span>JD</span>
          </AvatarFallback>
        </Avatar>      
        <span className="text-[15px] text-[#737373]">Ali Maamri</span>
        <span>-Room 58</span>
        <span className="text-[12px]">12 min ago</span>
        </CardContent>
        </div>
       
       </Card>



       <Card className="flex flex-row items-center w-[35rem] p-0 text-[#404B51]">
        <div className="flex flex-row items-center">
        <img src={room} className="rounded-l-2xl w-52 h-36" alt="" />
       
        </div>
        <div className="flex flex-col justify-around gap-2 items-start p-0">

        <CardTitle>
        Hotel Elkheyam
        </CardTitle>
        <CardContent className="flex flex-row justify-between items-center p-0 w-full gap-4 ">
            
        <Avatar>
          <AvatarImage src={logo} alt="User" />
          <AvatarFallback>
            <span>JD</span>
          </AvatarFallback>
        </Avatar>      
        <span className="text-[15px] text-[#737373]">Ali Maamri</span>
        <span>-Room 58</span>
        <span className="text-[12px]">12 min ago</span>
        </CardContent>
        </div>
       
       </Card>

      </div>



      <div className="grid w-full grid-flow-col grid-rows-2 gap-4 justify-items-end-safe justify-end">

<Card className="flex flex-col justify-center items-center bg-white hover:bg-[#4facfe]
 hover:text-white transition-all duration-500 ease-in-out rounded-2xl p-6 text-base text-center h-24 w-full hover:-translate-y-2">
  <CardTitle className="text-lg font-semibold mb-2">الغرف المتاحة في الفنادق</CardTitle>
  <h1 className="text-xl font-bold">650</h1>
</Card>

<Card className="flex flex-col justify-center items-center bg-white hover:bg-[#4facfe] 
hover:text-white transition-all duration-500 ease-in-out rounded-2xl p-6 text-base text-center h-24 w-full hover:-translate-y-2">
  <CardTitle className="text-lg font-semibold mb-2">شقق سكنية متاحة</CardTitle>
  <h1 className="text-xl font-bold">650</h1>
</Card>

<Card className="flex flex-col justify-center items-center bg-white hover:bg-[#4facfe] 
hover:text-white transition-all duration-500 ease-in-out rounded-2xl p-6 text-base text-center h-24 w-full hover:-translate-y-2">
  <CardTitle className="text-lg font-semibold mb-2">قاعة المناسبات المتاحة</CardTitle>
  <h1 className="text-xl font-bold">650</h1>
</Card>

<Card className="flex flex-col justify-center items-center bg-white hover:bg-[#4facfe]
 hover:text-white transition-all duration-500 ease-in-out rounded-2xl p-6 text-base text-center h-24 w-full hover:-translate-y-2">
  <CardTitle className="text-lg font-semibold mb-2">المنتجعات المتاحة</CardTitle>
  <h1 className="text-xl font-bold">650</h1>
</Card>

</div>

      </div>
     
      
     
    </div>
  );
}