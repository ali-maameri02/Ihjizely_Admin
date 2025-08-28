import * as React from "react";
import {
  IconHome2,
  IconUsers,
  IconBuilding,
  IconReceipt2,
  IconCurrencyDollar,
  IconMoon,
  IconLogout2, IconCalendarClock,
  IconReport, IconLocationPlus
} from "@tabler/icons-react";
import logo from "../assets/ihjzlyapplogo.png";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { authService } from '@/API/auth'; // Import your auth service

const data = {
  user: {
    name: "Ali Maamri",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "لوحة القيادة",
      url: "/Admin",
      icon: IconHome2,
    },
    {
      title: "المستخدمين",
      url: "/Admin/users",
      icon: IconUsers,
    },
    {
      title: "إدارة الوحدات",
      url: "/Admin/units",
      icon: IconBuilding,
    },
    {
      title: "إدارة الحجوزات",
      url: "/Admin/reservations",
      icon: IconCalendarClock,
    },
    {
      title: "إدارة الاشتراكات",
      url: "/Admin/subscriptions",
      icon: IconReceipt2,
    },
    {
      title: "إدارة المحافظ",
      url: "/Admin/wallets",
      icon: IconCurrencyDollar,
    },
    {
      title: "إدارة التقارير",
      url: "/Admin/reports",
      icon: IconReport,
    },
    {
      title: "إدارة المواقع و المدن",
      url: "/Admin/Locations",
      icon: IconLocationPlus,
    },
   
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState<string | null>(
    localStorage.getItem("activeSidebarItem") || "/Admin"
  );

  const handleItemClick = (url: string) => {
    setActiveItem(url);
    localStorage.setItem("activeSidebarItem", url);
    navigate(url);
  };

  // Handle logout function
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    // Clear the access token using the auth service
    authService.logout();
    // Navigate to login page
    navigate('/');
    // Optional: You might want to clear other localStorage items here
    localStorage.removeItem('activeSidebarItem');
  };

  return (
    <Sidebar collapsible="icon" {...props} className="z-[99999] group-data-[collapsible=icon]:z-[9999999]">
      {/* Header Section */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex flex-row items-center justify-end group-data-[collapsible=icon]:justify-start group-data-[collapsible=icon]:w-[5rem] w-[20rem] h-11 overflow-hidden transition-all duration-300">
              <SidebarTrigger />
            </div>

            {/* Logo and Title */}
            <a
              href="#"
              className="flex z-[99999] flex-col items-center justify-center gap-2 w-full h-24 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center"
            >
              <img src={logo} className="w-12 h-12 group-data-[collapsible=icon]:!size-9" alt="Logo" />
              <h1 className="font-bold text-[#5D7285] group-data-[collapsible=icon]:text-sm group-data-[collapsible=icon]:hidden">
                إحجزلي
              </h1>
            </a>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content Section */}
      <SidebarContent>
        <SidebarMenu>
          {data.navMain.map((item, index) => (
            <SidebarMenuItem key={index}>
              <SidebarMenuButton
                asChild
                className="flex text-[bold] items-center w-full p-3 text-sm font- rounded-lg transition-colors group sidebarcontent"
              >
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleItemClick(item.url);
                  }}
                  className={cn(
                    "flex items-center w-full text-[bold]",
                    activeItem === item.url
                      ? "bg-purple-500 text-white"
                      : "text-gray-700 hover:bg-[#AD46FF] hover:text-white"
                  )}
                >
                  <span className="mr-3">{React.createElement(item.icon, { className: "h-5 w-5" })}</span>
                  <span className="group-data-[collapsible=icon]:sr-only">{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer Section */}
      <SidebarFooter className="flex justify-center items-center">
        <div className="flex flex-col items-start py-3 space-y-2">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center w-full px-3 py-2 text-sm font- rounded-lg transition-colors group"
          >
            <div className="flex items-center w-full justify-between group-data-[collapsible=icon]:flex-col">
              <span className="flex items-center">
                <IconMoon className="h-5 w-5 mr-3" />
                <span className="group-data-[collapsible=icon]:hidden">الوضع المظلم</span>
              </span>

              {/* Toggle Switch */}
              <div
                className={`relative w-10 h-5 border-2 rounded-full cursor-pointer ${
                  isDarkMode ? "bg-purple-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform ${
                    isDarkMode ? "translate-x-5" : ""
                  }`}
                />
              </div>
            </div>
          </button>

          {/* Logout Button */}
          <SidebarMenuButton
            asChild
            className="hover:bg-[#667A8A] w-full h-full m-0"
          >
            <a
              href="#"
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font- rounded-lg transition-colors hover:bg-[#667A8A]"
            >
              <span className="mr-3">
                <IconLogout2 />
              </span>
              <span className="group-data-[collapsible=icon]:hidden">تسجيل الخروج</span>
            </a>
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}