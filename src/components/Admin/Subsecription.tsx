import { useState, useEffect } from "react";
import { DownloadCloudIcon, FilterIcon, MoreVertical, UserIcon, CalendarIcon, TagIcon, EditIcon, PencilIcon } from "lucide-react";
import { SubscriptionTable } from "../data-table";
import adduserIcon from '../../assets/add_user.svg';
import { Link } from "react-router-dom";

const subscriptionData = [
  {
    id: 1,
    owner: "Ali Maanni",
    subscriptionType: "BRONZE",
    registrationDate: "5/27/15",
    status: "active"
  },
  {
    id: 2,
    owner: "Chemouri Abd EL Motalib",
    subscriptionType: "GOLD",
    registrationDate: "5/19/12",
    status: "active"
  },
  {
    id: 3,
    owner: "Benouerzeg Mohamed Ali",
    subscriptionType: "BRONZE",
    registrationDate: "3/4/16",
    status: "active"
  },
  {
    id: 4,
    owner: "Ali Maanni",
    subscriptionType: "BRONZE",
    registrationDate: "3/4/16",
    status: "active"
  },
  {
    id: 5,
    owner: "Benouerzeg Mohamed Ali",
    subscriptionType: "GOLD",
    registrationDate: "7/27/13",
    status: "active"
  },
  {
    id: 6,
    owner: "Benouerzeg Mohamed Ali",
    subscriptionType: "BRONZE",
    registrationDate: "5/27/15",
    status: "active"
  },
];

export default function Subscription() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState(['owner', 'subscriptionType', 'registrationDate']);
  const [filteredData, setFilteredData] = useState(subscriptionData);
  
  // Apply filters whenever search query or selected filters change
  useEffect(() => {
    const searchLower = searchQuery.toLowerCase();
    
    const filtered = subscriptionData.filter(item => {
      return selectedFilters.some(filter => {
        switch(filter) {
          case 'owner':
            return item.owner.toLowerCase().includes(searchLower);
          case 'subscriptionType':
            return item.subscriptionType.toLowerCase().includes(searchLower);
          case 'registrationDate':
            return item.registrationDate.includes(searchQuery);
          default:
            return false;
        }
      });
    });
    
    setFilteredData(filtered);
  }, [searchQuery, selectedFilters]);

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  }

  const downloadCSV = () => {
    // Create CSV content
    const headers = ['صاحب العمل', 'نوع الاشتراك', 'تاريخ التسجيل'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(item => [item.owner, item.subscriptionType, item.registrationDate].join(','))
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
                selectedFilters.includes('owner') ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => toggleFilter('owner')}
            >
              <span>صاحب العمل</span>
              <UserIcon className="h-5 w-5" />
            </div>

            {/* Subscription Type Filter */}
            <div 
              className={`flex flex-row text-right text-[#959595] items-center w-full justify-end gap-4 rounded-lg px-3 py-2 cursor-pointer transition-colors ${
                selectedFilters.includes('subscriptionType') ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => toggleFilter('subscriptionType')}
            >
              <span>نوع الاشتراك</span>
              <TagIcon className="h-5 w-5" />
            </div>

            {/* Registration Date Filter */}
            <div 
              className={`flex flex-row text-right text-[#959595] items-center w-full justify-end gap-4  px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                selectedFilters.includes('registrationDate') ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => toggleFilter('registrationDate')}
            >
              <span>تاريخ التسجيل</span>
              <CalendarIcon className="h-5 w-5" />
            </div>
          </div>
        </div>
      )}
      
      <SubscriptionTable data={filteredData} />
    </div>
  );
}