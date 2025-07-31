import { useState, useEffect } from "react";
import { toast } from "sonner";
import { WalletRow, WalletTable } from "../data-table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { 
  Dialog, 
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger
} from '@radix-ui/react-dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuPortal, 
  DropdownMenuTrigger 
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { SearchIcon, DownloadIcon, PlusIcon, UserIcon, X } from "lucide-react";

// Define user type
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  hasWallet: boolean;
}

export default function WalletManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [walletData, setWalletData] = useState<WalletRow[]>([]);
  const [filteredData, setFilteredData] = useState<WalletRow[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(true); // Default open

  // Sample wallet data
  const sampleData: WalletRow[] = [
    {
      id: 1,
      name: "All Maamri",
      balance: "3000 LYD",
      registrationDate: "5/27/15",
      email: "all.maamri@example.com"
    },
    {
      id: 2,
      name: "Chemouri Abd EL Motailb",
      balance: "3000 LYD",
      registrationDate: "5/19/12",
      email: "chemouri@example.com"
    },
    {
      id: 3,
      name: "Benouerzeg Mohamed Ali",
      balance: "3000 LYD",
      registrationDate: "3/4/16",
      email: "benouerzeg@example.com"
    },
  ];

  // Sample user data
  const sampleUsers: User[] = [
    {
      id: 1,
      firstName: "Jane",
      lastName: "Cooper",
      email: "jane.cooper@example.com",
      avatar: "",
      hasWallet: true // Already has wallet
    },
    {
      id: 2,
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      avatar: "",
      hasWallet: false
    },
    {
      id: 3,
      firstName: "Robert",
      lastName: "Johnson",
      email: "robert.j@example.com",
      avatar: "",
      hasWallet: false
    },
    {
      id: 4,
      firstName: "Emily",
      lastName: "Smith",
      email: "emily.smith@example.com",
      avatar: "",
      hasWallet: true // Already has wallet
    },
    {
      id: 5,
      firstName: "Michael",
      lastName: "Brown",
      email: "michael.b@example.com",
      avatar: "",
      hasWallet: false
    }
  ];

  // Initialize data
  useEffect(() => {
    setWalletData(sampleData);
    setFilteredData(sampleData);
    setUsers(sampleUsers);
  }, []);

  // Filter data based on search term
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredData(walletData);
    } else {
      const filtered = walletData.filter(wallet =>
        wallet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wallet.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [searchTerm, walletData]);

  const handleAddWallet = () => {
    setIsDialogOpen(true);
    setSelectedUser(null); // Reset selection when opening dialog
    setIsDropdownOpen(true); // Ensure dropdown is open when dialog opens
  };

  const handleDownload = () => {
    toast.info("جارٍ تحميل بيانات المحافظ...");
  };

  const handleCreateWallet = () => {
    if (!selectedUser) {
      toast.error("الرجاء اختيار مستخدم");
      return;
    }
    
    // Create wallet for selected user
    const newWallet: WalletRow = {
      id: walletData.length + 1,
      name: `${selectedUser.firstName} ${selectedUser.lastName}`,
      balance: "0 LYD",
      registrationDate: new Date().toLocaleDateString('en-GB'),
      email: selectedUser.email
    };
    
    setWalletData(prev => [...prev, newWallet]);
    setFilteredData(prev => [...prev, newWallet]);
    
    // Update user to mark as having a wallet
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === selectedUser.id ? {...user, hasWallet: true} : user
      )
    );
    
    toast.success(`تم إنشاء محفظة لـ ${selectedUser.firstName} ${selectedUser.lastName}`);
    setIsDialogOpen(false);
  };

  return (
    <div className="w-full p-6 min-h-screen">
      {/* Wallet Creation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
  <DialogPortal>
    {/* Blurred Backdrop */}
    <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999]" />
    
    {/* Dialog Content */}
    <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md max-h-[80vh] bg-white p-6 rounded-xl shadow-lg z-[100999] focus:outline-none">
      <div className="absolute left-4 top-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => {
            setIsDialogOpen(false);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <DialogTitle className="text-2xl font-bold text-right mb-2">
        إضافة محفظة جديدة
      </DialogTitle>
      <DialogDescription className="text-right mb-6 text-gray-600">
        اختر مستخدمًا لإنشاء محفظة جديدة له
      </DialogDescription>

      <div className="mb-6 relative">
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <div className="border rounded-lg p-3 cursor-pointer">
              {selectedUser ? (
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-right">
                    <p className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</p>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-right">اختر مستخدمًا من القائمة</p>
              )}
            </div>
          </DropdownMenuTrigger>
          
          {/* Portal for dropdown content to escape dialog stacking context */}
          <DropdownMenuPortal>
            <DropdownMenuContent 
              className="w-full max-h-60 overflow-y-auto z-[999999]"
              align="end"
              style={{ 
                zIndex: 999999,
                width: "var(--radix-dropdown-menu-trigger-width)"
              }}
            >
              {users.map(user => (
                <DropdownMenuItem
                  key={user.id}
                  className={`flex items-center gap-3 p-3 ${user.hasWallet ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100'}`}
                  onSelect={(e) => {
                    e.preventDefault();
                    if (!user.hasWallet) {
                      setSelectedUser(user);
                      setIsDropdownOpen(false);
                    }
                  }}
                  disabled={user.hasWallet}
                >
                  <Avatar>
                    <AvatarFallback>
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-right flex-1">
                    <p className="font-medium">
                      {user.firstName} {user.lastName}
                      {user.hasWallet && (
                        <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                          لديه محفظة
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button 
          variant="outline"
          onClick={() => setIsDialogOpen(false)}
        >
          إلغاء
        </Button>
        <Button 
          className="bg-purple-600 hover:bg-purple-700"
          onClick={handleCreateWallet}
          disabled={!selectedUser}
        >
          إنشاء محفظة
        </Button>
      </div>
    </DialogContent>
  </DialogPortal>
</Dialog>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة المحافظ</h1>
          <p className="text-gray-600 mt-1">إدارة جميع محافظ المستخدمين في النظام</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="بحث..."
              className="pr-10 text-right"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handleDownload}
            >
              <DownloadIcon className="h-4 w-4" />
              <span>تحميل</span>
            </Button>
            
            <Button 
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
              onClick={handleAddWallet}
            >
              <PlusIcon className="h-4 w-4" />
              <span>إضافة محفظة</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-600">إجمالي المحافظ</h3>
              <p className="text-3xl font-bold mt-2">{walletData.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <UserIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-600">إجمالي الأرصدة</h3>
              <p className="text-3xl font-bold mt-2">
                {walletData.reduce((sum, wallet) => {
                  const amount = parseInt(wallet.balance);
                  return isNaN(amount) ? sum : sum + amount;
                }, 0).toLocaleString()} LYD
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-600">متوسط الرصيد</h3>
              <p className="text-3xl font-bold mt-2">
                {walletData.length > 0 
                  ? (walletData.reduce((sum, wallet) => {
                      const amount = parseInt(wallet.balance);
                      return isNaN(amount) ? sum : sum + amount;
                    }, 0) / walletData.length).toLocaleString(undefined, {
                      maximumFractionDigits: 0
                    }) 
                  : 0} LYD
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Wallet Table */}
      <div className="bg-white rounded-xl border shadow-sm">
        <WalletTable data={filteredData} />
        
        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-gray-700">
            عرض 1 إلى {Math.min(5, filteredData.length)} من {filteredData.length} نتائج
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              السابق
            </Button>
            <Button variant="outline" size="sm" className="bg-blue-100 text-blue-700">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              التالي
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}