import { useState, useEffect } from "react";
import { DownloadCloudIcon, FilterIcon, MoreVertical, UserIcon, CalendarIcon, TagIcon, PencilIcon } from "lucide-react";
import { SubscriptionRow, SubscriptionTable } from "../data-table";
import { Link } from "react-router-dom";
import { subscriptionsService } from "@/API/SubscriptionsService";
import { toast } from "sonner";

export default function Subscription() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState(['businessOwnerId', 'planName', 'startDate']);
  const [apiData, setApiData] = useState<SubscriptionRow[]>([]); // Store original API data
  const [filteredData, setFilteredData] = useState<SubscriptionRow[]>([]); // Store filtered data
  const [, setIsLoading] = useState(true);
  
  // Fetch data once on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await subscriptionsService.getSubscriptionsWithPlans();
        setApiData(data);
        setFilteredData(data); // Initialize filteredData with all data
      } catch (error) {
        toast.error('Failed to load subscription data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Apply filters whenever search query, selected filters, or apiData changes
  useEffect(() => {
    const searchLower = searchQuery.toLowerCase();
    
    const filtered = apiData.filter(item => {
      return selectedFilters.some(filter => {
        switch(filter) {
          case 'businessOwnerId':
            return item.businessOwnerId.toLowerCase().includes(searchLower);
          case 'planName':
            return item.planName.toLowerCase().includes(searchLower);
          case 'startDate':
            return item.startDate.includes(searchQuery);
          default:
            return false;
        }
      });
    });
    
    setFilteredData(filtered);
  }, [searchQuery, selectedFilters, apiData]); // Now depends on apiData instead of filteredData

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  }

  const downloadCSV = () => {
    // Create CSV content
    const headers = ['معرف صاحب العمل', 'اسم الخطة', 'تاريخ البدء', 'تاريخ الانتهاء', 'السعر', 'الإعلانات المستخدمة', 'الحالة'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(item => [
        item.businessOwnerId,
        item.planName,
        item.startDate,
        item.endDate,
        `${item.price.amount} ${item.price.currencyCode}`,
        `${item.usedAds}/${item.maxAds}`,
        item.isActive ? 'نشط' : 'غير نشط'
      ].join(','))
    ].join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'subscriptions.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-col justify-between md:items-center gap-4 mb-6">
        <div className="flex items-center gap-2 justify-between w-full">
          <div className="">  
            <h1 className="text-2xl font-bold"> إدارة اﻟﺎﺷﺘﺮاﻛﺎت</h1>
            <p className="text-gray-600 mt-1">إدارة جميع إﺷﺘﺮاﻛﺎت المستخدمين في النظام</p>
          </div>
          <Link to={'/Admin/subscription-plans'}>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center justify-between gap-2 cursor-pointer">
              <span>تعديل اشتراك</span>
              <PencilIcon/>
            </button>
          </Link>
        </div>

        <div className="flex items-end gap-2 w-full md:w-full">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="بحث..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-right"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <button
            onClick={downloadCSV}
            className="bg-gray-100 cursor-pointer p-2 flex flex-row gap-2 rounded-lg hover:bg-[#2196F3] hover:text-white"
            title="تحميل البيانات"
          >
            <span>تحميل</span>
            <DownloadCloudIcon className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="bg-purple-100 text-purple-600 px-4 py-2 rounded-lg flex items-center gap-1 cursor-pointer"
          >
            فلتر
            <FilterIcon className="h-4 w-4" />
          </button>

          <button className="bg-gray-100 p-2 rounded-lg">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {isFilterOpen && (
        <div className="bg-white w-64 shadow-md rounded-lg p-4 mb-4 border border-gray-200 float-right mr-12">
          <div className="space-y-2 flex flex-col items-end w-full">
            {/* Owner Filter */}
            <div 
              className={`flex flex-row text-[#959595] text-right items-center w-full justify-end gap-4 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                selectedFilters.includes('businessOwnerId') ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => toggleFilter('businessOwnerId')}
            >
              <span>معرف صاحب العمل</span>
              <UserIcon className="h-5 w-5" />
            </div>

            {/* Subscription Type Filter */}
            <div 
              className={`flex flex-row text-right text-[#959595] items-center w-full justify-end gap-4 rounded-lg px-3 py-2 cursor-pointer transition-colors ${
                selectedFilters.includes('planName') ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => toggleFilter('planName')}
            >
              <span>اسم الخطة</span>
              <TagIcon className="h-5 w-5" />
            </div>

            {/* Registration Date Filter */}
            <div 
              className={`flex flex-row text-right text-[#959595] items-center w-full justify-end gap-4  px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                selectedFilters.includes('startDate') ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => toggleFilter('startDate')}
            >
              <span>تاريخ البدء</span>
              <CalendarIcon className="h-5 w-5" />
            </div>
          </div>
        </div>
      )}
      
      <SubscriptionTable data={filteredData} />
    </div>
  );
}