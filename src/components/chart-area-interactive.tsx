import  { useState, useEffect } from "react";
import {
  AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Area, ResponsiveContainer} from "recharts";
import { authService } from '@/API/auth';
import { fetchStatistics } from '@/API/Statistics';

// Assets
import userclient from '../assets/contacts_product_53.98dp_2196F3_FILL0_wght400_GRAD0_opsz48.png';
import userowner from '../assets/contacts_product_53.98dp_88417A_FILL0_wght400_GRAD0_opsz48.png';
// import unitPendingIcon from '../assets/pending.svg';
// import unitNewIcon from '../assets/new.svg';
// import unitAcceptedIcon from '../assets/accepted.svg';
import '../index.css';

// Mock data for charts
const chartData = [
  { name: "Sun", clients: 30, businessOwners: 200 },
  { name: "Mon", clients: 10, businessOwners: 50 },
  { name: "Tue", clients: 100, businessOwners: 40 },
  { name: "Wed", clients: 60, businessOwners: 250 },
  { name: "Thu", clients: 250, businessOwners: 30 },
  { name: "Fri", clients: 80, businessOwners: 100 },
  { name: "Sat", clients: 90, businessOwners: 80 },
];


// const revenueData = [
//   { day: 'Sat', value: 8 },
//   { day: 'Sun', value: 5 },
//   { day: 'Mon', value: 10 },
//   { day: 'Tue', value: 6 },
//   { day: 'Wed', value: 9 },
//   { day: 'Thu', value: 3 },
//   { day: 'Fri', value: 4 },
// ];

// const monthlyData = [
//   { day: 'Week 1', value: 35 },
//   { day: 'Week 2', value: 45 },
//   { day: 'Week 3', value: 28 },
//   { day: 'Week 4', value: 50 },
// ];

// const unitIcons: Record<string, string> = {
//   "وحدات جديدة": unitNewIcon,
//   "الوحدات معلقة": unitPendingIcon,
//   "الوحدات مقبولة": unitAcceptedIcon,
// };


export function ChartAreaInteractive() {
  // const [isWeekly, setIsWeekly] = useState(true);
  const [userStats, setUserStats] = useState({
    totalClients: 0,
    totalBusinessOwners: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate percentages for the chart based on real stats
  const normalizedChartData = chartData.map(day => ({
    ...day,
    clients: Math.round((day.clients / 820) * userStats.totalClients),
    businessOwners: Math.round((day.businessOwners / 750) * userStats.totalBusinessOwners)
  }));


  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = authService.getAuthToken();
        if (!token) {
          throw new Error('No authentication token found');
        }

        const stats = await fetchStatistics(token);
        
        setUserStats({
          totalClients: stats.clients,
          totalBusinessOwners: stats.businessOwners,
          totalUsers: stats.totalUsers
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 w-full p-4">
      {/* ROW 1: AREA CHART + STATISTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        {/* AREA CHART */}
        <div className="bg-white p-6 rounded-lg shadow w-full">
          <h2 className="text-lg font-semibold mb-1">إجمالي المستخدمين</h2>
          <p className="text-sm text-muted-foreground mb-4">
            النسبة الأسبوعية بناءً على الإجمالي: {userStats.totalUsers} مستخدم
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={normalizedChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis hide />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'العملاء') return [value, `العملاء (${userStats.totalClients} إجمالي)`];
                  if (name === 'أصحاب الأعمال') return [value, `أصحاب الأعمال (${userStats.totalBusinessOwners} إجمالي)`];
                  return [value, name];
                }}
              />
              <defs>
                <linearGradient id="clientGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ownerGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="clients" 
                stroke="#6366f1" 
                fill="url(#clientGradient)" 
                name="العملاء" 
              />
              <Area 
                type="monotone" 
                dataKey="businessOwners" 
                stroke="#8b5cf6" 
                fill="url(#ownerGradient)" 
                name="أصحاب الأعمال" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* STATISTICS CARDS */}
        <div className="flex flex-col justify-around gap-4">
          <div className="bg-white shadow p-4 rounded-lg flex items-center justify-between">
            <img src={userclient} className="w-10 h-10" alt="user" />
            <div className="flex flex-col text-right font-semibold">
              <span>إجمالي العملاء</span>
              <span>{userStats.totalClients.toLocaleString()}</span>
            </div>
          </div>
          <div className="bg-white shadow p-4 rounded-lg flex items-center justify-between">
            <img src={userowner} className="w-10 h-10" alt="owner" />
            <div className="flex flex-col text-right font-semibold">
              <span>إجمالي أصحاب الأعمال</span>
              <span>{userStats.totalBusinessOwners.toLocaleString()}</span>
            </div>
          </div>
         
        </div>
      </div>

      {/* ROW 2: DONUT + BAR CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        {/* <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center relative">
          <h3 className="text-lg font-semibold mb-2">الوحدات</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={donutChartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {donutChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomDonutTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 w-full flex flex-col gap-2 px-4">
            {donutChartData.map((entry, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm"
                style={{ color: entry.color }}
              >
                <img src={unitIcons[entry.name]} alt={entry.name} className="w-5 h-5" />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-gray-700">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center justify-between">
          <div className="w-full flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">{title}</h3>
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={() => setIsWeekly(true)}
                className={`px-3 py-1 rounded-full ${isWeekly ? "bg-[#007AFF] text-white" : "bg-gray-100 text-gray-800"} cursor-pointer`}
              >
                أسبوعي
              </button>
              <button
                onClick={() => setIsWeekly(false)}
                className={`px-3 py-1 rounded-full ${!isWeekly ? "bg-[#007AFF] text-white" : "bg-gray-100 text-gray-800"} cursor-pointer`}
              >
                شهري
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={displayedData} barCategoryGap={20}>
              <CartesianGrid strokeDasharray="4 3" />
              <defs>
                <linearGradient id="weeklyBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#007AFF" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#007AFF" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar
                dataKey="value"
                fill="url(#weeklyBarGradient)"
                radius={[6, 6, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>

          <button className="bg-[#E3F2FD] text-[#1976D2] font-semibold rounded-md px-4 py-1 mt-2">
            View Details
          </button>
        </div> */}
      </div>
    </div>
  );
}