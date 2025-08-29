import * as React from "react";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CSS } from "@dnd-kit/utilities";
import { IconTrash, IconUserOff } from "@tabler/icons-react";
import {  InfoIcon,  PlusCircle, ThumbsDownIcon, ThumbsUpIcon, TrashIcon } from "lucide-react";
import Swal from 'sweetalert2';
import {
  DialogFooter,
  DialogHeader,

} from './ui/dialog';

import {
  
  AlertTriangleIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  UserIcon,
  MailIcon,
  CalendarIcon,

} from 'lucide-react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { z } from "zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import logo from '../assets/ihjzlyapplogo.png';
import '../index.css';
import { Property, unitsService } from "@/API/UnitsService";
import { useState } from "react";
import { subscriptionsService } from "@/API/SubscriptionsService";
import { walletsService } from "@/API/walletsService";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogOverlay, Portal } from "@radix-ui/react-dialog";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { usersService } from "@/API/UsersService";
import { PropertyDetailsModal } from "./Admin/PropertyDetailsModal";
import { reservationService } from "@/API/ReservationService";
// Define schemas
export const userSchema = z.object({
  id: z.string(), // Change from number to string
  name: z.string(),
  username: z.string(),
  role: z.string(),
  email: z.string(),
  date: z.string(),
  image: z.string(),
  isBlocked: z.boolean() // Add this
});

export const unitSchema = z.object({
  id: z.string(),
  type: z.string(),
  isAd: z.boolean(), // Change from Boolean to boolean
  unitName: z.string(),
  image: z.string(),
  owner: z.string(),
  location: z.string(),
  status: z.enum(['Pending', 'Accepted', 'Refused']), // Add this
  subscriptionStatus: z.boolean(),
  registrationDate: z.string(),
  premiumSubscription: z.boolean(),
  businessOwnerFirstName: z.string(),
  businessOwnerLastName: z.string(),
});


export const subscriptionSchema = z.object({
  id: z.string(),
  businessOwnerId: z.string(),
  planId: z.string(),
  planName: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  price: z.object({
    amount: z.number(),
    currencyCode: z.string(),
  }),
  maxAds: z.number(),
  usedAds: z.number(),
  isActive: z.boolean(),
  hasAdQuota: z.boolean(),
});


export const walletSchema = z.object({
  id: z.number(),
  name: z.string(),
  walletId: z.string(), // Add this line

  balance: z.string(),
  registrationDate: z.string(),
  email: z.string(),
});
export const bookingSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  name: z.string(),
  phoneNumber: z.string(),
  propertyId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  totalPrice: z.number(),
  currency: z.string(),
  status: z.enum(['Pending', 'Confirmed', 'Rejected', 'Completed']),
  reservedAt: z.string(),
  propertyDetails: z.object({
    id: z.string(),
    title: z.string(),
    type: z.string(),
    subtype: z.string().optional(),
    images: z.array(z.object({ url: z.string() })).optional()
  }).optional()
});

export type BookingRow = z.infer<typeof bookingSchema>;
export type UserRow = z.infer<typeof userSchema>;
export type UnitRow = z.infer<typeof unitSchema>;
export type SubscriptionRow = z.infer<typeof subscriptionSchema>;
export type WalletRow = z.infer<typeof walletSchema>;

// Generic DraggableRow component
function DraggableRow<TData>({ row }: { row: Row<TData> }) {
  const id = (row.original as { id: number }).id.toString();
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id,
  });

  return (
    <TableRow
      ref={setNodeRef}
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

// Generic DataTable component
interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
}

export function DataTable<TData extends { id: string  }>({
  data,
  columns,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [internalData, setInternalData] = React.useState<TData[]>(data);
  React.useEffect(() => {
    setInternalData(data);
  }, [data]);
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const dataIds = React.useMemo(
    () => internalData.map((item) => item.id.toString()),
    [internalData]
  );

  const table = useReactTable({
    data: internalData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setInternalData((prevData) => {
        const oldIndex = dataIds.indexOf(active.id.toString());
        const newIndex = dataIds.indexOf(over.id.toString());
        return arrayMove(prevData, oldIndex, newIndex);
      });
    }
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          <SortableContext
            items={dataIds}
            strategy={verticalListSortingStrategy}
          >
            {table.getRowModel().rows.map((row) => (
              <DraggableRow key={row.id} row={row} />
            ))}
          </SortableContext>
        </TableBody>
      </Table>
    </DndContext>
  );
}

// User-specific table
export default function UserTable({ data }: { data: UserRow[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'all' | 'blocked' | 'unblocked'>('all');
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [warningCounts, setWarningCounts] = useState<Record<string, number>>({});
  const itemsPerPage = 10;

  // Filter data based on active tab
  const filteredData = React.useMemo(() => {
    if (activeTab === 'all') return data;
    return data.filter(user => 
      activeTab === 'blocked' ? user.isBlocked : !user.isBlocked
    );
  }, [data, activeTab]);

  // Calculate paginated data
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handleInfoClick = async (user: UserRow) => {
    try {
      setLoading(true);
      const warningKey = `block-warning-${user.id}`;
      const countString = localStorage.getItem(warningKey); // Get the string or null
      const count = countString ? parseInt(countString) : 0; // Properly handle null case
      
      const userDetails = await usersService.getUserById(user.id);
      
      setSelectedUser({
        ...user,
        ...userDetails,
      });
      
      setWarningCounts(prev => ({
        ...prev,
        [user.id]: count
      }));
      
      setIsDialogOpen(true);
    } catch (error) {
      toast.error('Failed to load user details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId: string, userName: string) => {
    try {

      setLoading(true);
      const warningKey = `block-warning-${userId}`;
      const warningCountString = localStorage.getItem(warningKey);
      const warningCount = warningCountString ? parseInt(warningCountString) : 0;
      if (warningCount < 2) {
        await usersService.blockUser(userId);

        await Swal.fire({
          title: 'تحذير',
          text: `سيتم حظر المستخدم ${userName} بعد ${2 - warningCount} تحذير${warningCount === 1 ? '' : 'ين'}`,
          icon: 'warning',
          confirmButtonText: 'حسناً',
          confirmButtonColor: '#3085d6',
        });
  
        localStorage.setItem(warningKey, (warningCount + 1).toString());
        return;
      }
  
      const confirmResult = await Swal.fire({
        title: 'تأكيد الحظر',
        text: `سيتم حظر المستخدم ${userName} نهائياً!`,
        icon: 'error',
        showCancelButton: true,
        confirmButtonText: 'تأكيد الحظر',
        cancelButtonText: 'إلغاء',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
      });
  
      if (!confirmResult.isConfirmed) return;
  
      await usersService.blockUser(userId);
      console.log(userId)
      localStorage.removeItem(warningKey);
      
      await Swal.fire({
        title: 'تم الحظر بنجاح',
        text: `تم حظر المستخدم ${userName} بنجاح`,
        icon: 'success',
        confirmButtonText: 'حسناً'
      });
      
      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error('Block user failed:', error);
      let errorMessage = 'فشل في حظر المستخدم';
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid user ID')) {
          errorMessage = 'معرف المستخدم غير صحيح';
        } else if (error.message.includes('already')) {
          errorMessage = 'المستخدم محظور بالفعل';
        } else {
          errorMessage = error.message;
        }
      }
      
      await Swal.fire({
        title: 'خطأ',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'حسناً'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleUnblockUser = async (userId: string, userName: string) => {
    try {
      setLoading(true);
      
      const result = await Swal.fire({
        title: 'تأكيد فك الحظر',
        text: `هل أنت متأكد من رغبتك في فك حظر ${userName}؟`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'نعم، فك الحظر',
        cancelButtonText: 'إلغاء',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
      });
  
      if (!result.isConfirmed) return;
  
      await usersService.unblockUser(userId);
      
      await Swal.fire({
        title: 'تم فك الحظر بنجاح',
        text: `تم فك حظر المستخدم ${userName} بنجاح`,
        icon: 'success',
        confirmButtonText: 'حسناً'
      });
  
      // Refresh data
      window.location.reload();
    } catch (error) {
      await Swal.fire({
        title: 'خطأ',
        text: error instanceof Error ? error.message : 'فشل في فك حظر المستخدم',
        icon: 'error',
        confirmButtonText: 'حسناً'
      });
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<UserRow>[] = [
    {
      accessorKey: "name",
      header: "الاسم",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={row.original.image} alt="User" />
            <AvatarFallback>{row.original.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{row.original.name}</span>
            <span className="text-sm text-muted-foreground">
              {row.original.username}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "الدور",
      cell: ({ row }) => <Badge variant="default">{row.original.role}</Badge>,
    },
    {
      accessorKey: "email",
      header: "رقم الهاتف",
      cell: ({ row }) => <span>{row.original.username}</span>,
    },
    {
      accessorKey: "date",
      header: "تاريخ الإنشاء",
      cell: ({ row }) => <span>{row.original.date}</span>,
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => (
        <Badge variant={row.original.isBlocked ? "destructive" : "default"}>
          {row.original.isBlocked ? "محظور" : "نشط"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleInfoClick(row.original)}
          >
            <InfoIcon className="w-4 h-4 text-blue-500" />
          </Button>
          
          {row.original.isBlocked ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleUnblockUser(
                row.original.id,
                row.original.name
              )}
              disabled={loading}
            >
              <ThumbsUpIcon className="w-4 h-4 text-green-500" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleBlockUser(
                row.original.id,
                row.original.name
              )}
              disabled={loading}
            >
              <IconUserOff className="w-4 h-4 text-red-500" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={async () => {
              const confirmDelete = await Swal.fire({
                title: 'تأكيد الحذف',
                text: `هل أنت متأكد من رغبتك في حذف ${row.original.name}؟`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'نعم، احذف',
                cancelButtonText: 'إلغاء',
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
              });
              
              if (!confirmDelete.isConfirmed) return;

              try {
                await usersService.deleteUser(row.original.id);
                toast.success('تم حذف المستخدم بنجاح');
                window.location.reload();
              } catch (error) {
                toast.error('فشل في حذف المستخدم');
              }
            }}
          >
            <IconTrash className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Tabs for filtering */}
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'all' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}`}
          onClick={() => {
            setActiveTab('all');
            setCurrentPage(1);
          }}
        >
          الكل
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'blocked' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}`}
          onClick={() => {
            setActiveTab('blocked');
            setCurrentPage(1);
          }}
        >
          المحظورين
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'unblocked' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}`}
          onClick={() => {
            setActiveTab('unblocked');
            setCurrentPage(1);
          }}
        >
          النشطين
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      )}

      {!loading && (
        <>
          <DataTable data={paginatedData} columns={columns} />
          
          {/* Pagination controls */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              السابق
            </Button>
            <span>
              الصفحة {currentPage} من {totalPages}
            </span>
            <Button 
              variant="outline" 
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              التالي
            </Button>
          </div>
        </>
      )}

      {/* User Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
  <DialogOverlay className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
    <DialogContent className="container p-12 sm:max-w-[600px] w-full rounded-lg bg-white shadow-xl border border-gray-200">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <UserIcon className="w-5 h-5" />
          <span>تفاصيل المستخدم</span>
        </DialogTitle>
        <DialogDescription>
          عرض المعلومات الكاملة للمستخدم وسجل التحذيرات
        </DialogDescription>
      </DialogHeader>
      
      {selectedUser && (
        <div className="grid gap-6 py-4">
          {/* User Profile Section */}
          <div className="flex items-start gap-4">
            <Avatar className="w-20 h-20 border-2 border-purple-100">
              <AvatarImage 
                src={selectedUser.image || '/default-avatar.png'} 
                alt={selectedUser.name} 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-avatar.png';
                }}
              />
              <AvatarFallback className="bg-purple-100 text-purple-600 text-2xl">
                {selectedUser.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 grid gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                <Badge variant={selectedUser.isBlocked ? "destructive" : "default"}>
                  {selectedUser.isBlocked ? "محظور" : "نشط"}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ShieldAlertIcon className="w-4 h-4" />
                <span>
                  {warningCounts[selectedUser.id] || 0} تحذير(ات)
                </span>
              </div>
              
              {selectedUser.isBlocked && (
                <div className="flex items-center gap-2 text-sm text-red-500">
                  <AlertTriangleIcon className="w-4 h-4" />
                  <span>هذا المستخدم محظور حالياً</span>
                </div>
              )}
            </div>
          </div>
          
          {/* User Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">الاسم الكامل</p>
                <p className="font-medium">
                  {selectedUser.name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <MailIcon className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                <p className="font-medium">{selectedUser.email || 'غير متوفر'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">تاريخ التسجيل</p>
                <p className="font-medium">
                  {new Date(selectedUser.date).toLocaleDateString() || 'غير معروف'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">الدور</p>
                <p className="font-medium">{selectedUser.role || 'مستخدم'}</p>
              </div>
            </div>
          </div>
          
          {/* Warning History Section */}
          <div className="border-t pt-4">
            <h4 className="flex items-center gap-2 font-medium mb-2">
              <AlertTriangleIcon className="w-5 h-5 text-yellow-500" />
              <span>سجل التحذيرات</span>
            </h4>
            
            {warningCounts[selectedUser.id] > 0 ? (
              <div className="space-y-2">
                {Array.from({ length: warningCounts[selectedUser.id] }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm p-2 bg-yellow-50 rounded">
                    <AlertTriangleIcon className="w-4 h-4 text-yellow-500" />
                    <span>تحذير #{i + 1} - تاريخ: {new Date().toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">لا يوجد تحذيرات لهذا المستخدم</p>
            )}
          </div>
        </div>
      )}
      
      <DialogFooter className="mt-4">
        <Button 
          variant="outline" 
          onClick={() => setIsDialogOpen(false)}
          className="border-purple-500 text-purple-600 hover:bg-purple-50"
        >
          إغلاق
        </Button>
      </DialogFooter>
    </DialogContent>
  </DialogOverlay>
</Dialog>
    </div>
  );
}

// Unit-specific table
// UnitTable component in data-table.tsx

interface UnitTableProps {
  data: UnitRow[];
}

export function UnitTable({ data }: UnitTableProps) {
  const [filterType, setFilterType] = useState<string>("");
  const [filterSubtype, setFilterSubtype] = useState<string>("");
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'ads'>('all');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [internalData, setInternalData] = useState<UnitRow[]>(data);
  const [loading, setLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    open: false,
    unitId: null as string | null,
    unitName: '',
  });

  const propertyTypes = unitsService.getPropertyTypes();

  React.useEffect(() => {
    setInternalData(data);
  }, [data]);

  React.useEffect(() => {
    const fetchFilteredData = async () => {
      try {
        setLoading(true);
        let filteredData: UnitRow[] = [];
  
        // Use the API endpoint for filtering by type/subtype
        if (filterSubtype) {
          // For subtypes, use the API endpoint
          filteredData = await unitsService.getUnitsByType(filterSubtype);
        } else if (filterType) {
          // For main types, also use the API endpoint
          filteredData = await unitsService.getUnitsByType(filterType);
        } else {
          // For status-based filtering, use the existing methods
          switch (activeTab) {
            case 'pending':
              filteredData = await unitsService.getUnitsByStatus('Pending');
              break;
            case 'approved':
              filteredData = await unitsService.getUnitsByStatus('Accepted');
              break;
            case 'rejected':
              filteredData = await unitsService.getUnitsByStatus('Refused');
              break;
            case 'ads':
              // Fetch all units and filter for ads on the client side
              const allUnits = await unitsService.getAllUnits();
              filteredData = allUnits.filter(unit => unit.isAd);
              break;
            default:
              filteredData = await unitsService.getAllUnits();
              break;
          }
        }
  
        setInternalData(filteredData);
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to filter units');
      } finally {
        setLoading(false);
      }
    };
  
    fetchFilteredData();
  }, [filterSubtype, filterType, activeTab]);

  const handleViewDetails = async (unitId: string) => {
    try {
      const property = await unitsService.getUnitById(unitId);
      setSelectedProperty(property);
    } catch (err) {
      toast.error('Failed to load property details');
    }
  };

  const handleStatusUpdate = async (propertyId: string, status: 'Accepted' | 'Refused' | 'Pending') => {
    try {
      setLoading(true);
      
      setInternalData(prev => prev.map(item => 
        item.id.toString() === propertyId 
          ? { ...item, status, subscriptionStatus: status === 'Accepted' }
          : item
      ));

      await unitsService.updatePropertyStatus(propertyId, status);
      if (status === 'Accepted'){
        setActiveTab('approved');
      }
      toast.success(`تم ${status === 'Accepted' ? 'قبول' : 'رفض'} الوحدة بنجاح`);
      
      const refreshData = await unitsService.getAllUnits();
      if (status === 'Accepted'){
        setActiveTab('approved');
      }
      if (status === 'Refused'){
        setActiveTab('rejected');
      }
      if (status === 'Pending'){
        setActiveTab('pending');
      }
      // else {
      //   setActiveTab('pending');
      // }
      setInternalData(refreshData);
    } catch (error) {
      setInternalData(prev => prev.map(item => 
        item.id.toString() === propertyId 
          ? { ...item, status: 'Pending', subscriptionStatus: false }
          : item
      ));
      
      toast.error(
        error instanceof Error 
          ? error.message 
          : `حدث خطأ أثناء ${status === 'Accepted' ? 'القبول' : 'الرفض'}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUnit = async (unitId: string, unitName: string) => {
    try {
      setLoading(true);
      await unitsService.deleteUnit(unitId);
      setInternalData(prev => prev.filter(item => item.id.toString() !== unitId));
      toast.success(`تم حذف الوحدة "${unitName}" بنجاح`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء حذف الوحدة');
    } finally {
      setLoading(false);
      setDeleteConfirmation({ open: false, unitId: null, unitName: '' });
    }
  };

  const columns : ColumnDef<UnitRow>[] = [
    {
      accessorKey: "unitName",
      header: "الوحدة",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <img 
            src={row.original.image || '/placeholder-property.jpg'} 
            className="rounded-md w-16 h-12 object-cover border" 
            alt={row.original.unitName}
            onError={(e) => {
              e.currentTarget.src = '/placeholder-property.jpg';
              e.currentTarget.onerror = null;
            }}
          />
          <span className="font-medium">{row.original.unitName}</span>
        </div>
      ),
    },
    {
      accessorKey: "owner",
      header: "صاحب العمل",
      cell: ({ row }) => (
        <span>{row.original.businessOwnerFirstName} {row.original.businessOwnerLastName}</span>
      ),
    },
    {
      accessorKey: "location",
      header: "الموقع",
      cell: ({ row }) => <span>{row.original.location}</span>,
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => (
        <Badge 
          variant={
            row.original.status === 'Accepted' ? 'default' : 
            row.original.status === 'Refused' ? 'destructive' : 'secondary'
          }
        >
          {row.original.status === 'Accepted' ? 'مقبول' : 
           row.original.status === 'Refused' ? 'مرفوض' : 'قيد الانتظار'}
        </Badge>
      ),
    },
    {
      accessorKey: "isAd",
      header: " إعلان",
      cell: ({ row }) => (
        <Badge
          style={{
            backgroundColor: row.original.isAd ? "#45DB4F" : "red",
            color: "white",
          }}
        >
          {row.original.isAd ? "إعلان" : "غير مفعل"}
        </Badge>
      ),
    },
    {
      accessorKey: "registrationDate",
      header: "تاريخ التسجيل",
      cell: ({ row }) => <span>{row.original.registrationDate}</span>,
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => {
        const isAccepted = row.original.status === 'Accepted';
        const isRefused = row.original.status === 'Refused';
        
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleViewDetails(row.original.id.toString())}
            >
              <InfoIcon className="w-4 h-4 text-blue-500" />
            </Button>    
            <Button
              variant={isAccepted ? "default" : "ghost"}
              size="icon"
              onClick={() => handleStatusUpdate(
                row.original.id.toString(), 
                'Accepted',
              )}
              disabled={isAccepted}
            >
              <ThumbsUpIcon className={`w-4 h-4 ${isAccepted ? 'text-white' : 'text-green-500'}`} />
            </Button>
            
            <Button
              variant={isRefused ? "destructive" : "ghost"}
              size="icon"
              onClick={() => handleStatusUpdate(
                row.original.id.toString(), 
                'Refused'
              )}
              disabled={isRefused}
            >
              <ThumbsDownIcon className={`w-4 h-4 ${isRefused ? 'text-white' : 'text-red-500'}`} />
            </Button>
    
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteConfirmation({
                open: true,
                unitId: row.original.id.toString(),
                unitName: row.original.unitName
              })}
              disabled={loading}
            >
              <TrashIcon className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        );
      }
    }
  ];

  const table = useReactTable({
    data: internalData,
    columns,
    state: { 
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex border-b">
        {(['all', 'pending', 'approved', 'rejected', 'ads'] as const).map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 font-medium ${
              activeTab === tab 
                ? 'border-b-2 border-purple-500 text-purple-600' 
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'all' && 'الكل'}
            {tab === 'pending' && 'قيد الانتظار'}
            {tab === 'approved' && 'المقبولة'}
            {tab === 'rejected' && 'المرفوضة'}
            {tab === 'ads' && 'الإعلانات'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1 text-right">
            نوع الوحدة الرئيسي
          </label>
          <select
            id="type-filter"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setFilterSubtype("");
            }}
            className="border rounded px-3 py-2 w-full text-right"
            disabled={loading || activeTab === 'ads'}
          >
            <option value="">الكل</option>
            {propertyTypes.map((type) => (
              <option key={type.type} value={type.type}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="subtype-filter" className="block text-sm font-medium text-gray-700 mb-1 text-right">
            النوع الفرعي
          </label>
          <select
            id="subtype-filter"
            value={filterSubtype}
            onChange={(e) => setFilterSubtype(e.target.value)}
            className="border rounded px-3 py-2 w-full text-right"
            disabled={!filterType || loading || activeTab === 'ads'}
          >
            <option value="">الكل</option>
            {filterType && propertyTypes
              .find(type => type.type === filterType)
              ?.subtypes?.map(subtype => (
                <option key={subtype} value={subtype}>
                  {unitsService.getSubtypeLabel(subtype)}
                </option>
              ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      {activeTab === 'ads' 
                        ? 'لا توجد إعلانات متاحة'
                        : filterSubtype 
                          ? `لا توجد وحدات من نوع ${unitsService.getSubtypeLabel(filterSubtype)}`
                          : "لا توجد بيانات متاحة"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                السابق
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                التالي
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <div>الصفحة</div>
                <strong>
                  {table.getState().pagination.pageIndex + 1} من {table.getPageCount()}
                </strong>
              </span>
              
              <select
                value={table.getState().pagination.pageSize}
                onChange={e => {
                  table.setPageSize(Number(e.target.value));
                }}
                className="border rounded px-2 py-1"
              >
                {[10, 20, 30, 40, 50].map(pageSize => (
                  <option key={pageSize} value={pageSize}>
                    عرض {pageSize}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}

      <AlertDialog 
        open={deleteConfirmation.open} 
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmation({ open: false, unitId: null, unitName: '' });
        }}
      >
        <AlertDialogContent >
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد أنك تريد حذف الوحدة "{deleteConfirmation.unitName}"؟ هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (deleteConfirmation.unitId) {
                  handleDeleteUnit(deleteConfirmation.unitId, deleteConfirmation.unitName);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PropertyDetailsModal 
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
      />
    </div>
  );
}
// Subscription-specific table
export function SubscriptionTable({ }: { data: SubscriptionRow[] }) {
  const [internalData, setInternalData] = React.useState<(SubscriptionRow & { ownerName: string })[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  React.useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        setLoading(true);
        // First get subscriptions with plans
        const subscriptionsWithPlans = await subscriptionsService.getSubscriptionsWithPlans();
        
        // Then fetch owner details for each subscription
        const subscriptionsWithOwnerNames = await Promise.all(
          subscriptionsWithPlans.map(async (sub) => {
            try {
              const userDetails = await subscriptionsService.getUserDetails(sub.businessOwnerId);
              return {
                ...sub,
                ownerName: `${userDetails.firstName} ${userDetails.lastName}`
              };
            } catch (error) {
              console.error(`Failed to fetch user details for ${sub.businessOwnerId}`, error);
              return {
                ...sub,
                ownerName: sub.businessOwnerId // Fallback to ID if name fetch fails
              };
            }
          })
        );
        
        setInternalData(subscriptionsWithOwnerNames);
      } catch (error) {
        toast.error('Failed to load subscription data');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, []);

  const columns: ColumnDef<SubscriptionRow & { ownerName: string }>[] = [
    {
      accessorKey: "ownerName",
      header: "صاحب العمل",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.ownerName}</div>
      ),
    },
    {
      accessorKey: "planName",
      header: "خطة الاشتراك",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "outline"}>
          {row.original.planName}
        </Badge>
      ),
    },
    {
      accessorKey: "price",
      header: "السعر",
      cell: ({ row }) => (
        <div>
          {row.original.price.amount} {row.original.price.currencyCode}
        </div>
      ),
    },
    {
      accessorKey: "period",
      header: "الفترة",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span>من: {new Date(row.original.startDate).toLocaleDateString()}</span>
          <span>إلى: {new Date(row.original.endDate).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      accessorKey: "ads",
      header: "الإعلانات",
      cell: ({ row }) => (
        <div>
          {row.original.usedAds} / {row.original.maxAds}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "destructive"}>
          {row.original.isActive ? "نشط" : "منتهي"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8"
          onClick={() => toast.info(`تفاصيل اشتراك ${row.original.ownerName}`)}
        >
          <InfoIcon className="w-4 h-4 text-blue-500" />
        </Button>
      ),
    },
  ];

  const table = useReactTable({
    data: internalData,
    columns,
    state: { 
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div>
      {loading && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      )}

      {!loading && (
        <>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                    لا توجد بيانات متاحة
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between px-2 mt-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                السابق
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                التالي
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <div>الصفحة</div>
                <strong>
                  {table.getState().pagination.pageIndex + 1} من {table.getPageCount()}
                </strong>
              </span>
              
              <select
                value={table.getState().pagination.pageSize}
                onChange={e => {
                  table.setPageSize(Number(e.target.value))
                }}
                className="border rounded px-2 py-1"
              >
                {[10, 20, 30, 40, 50].map(pageSize => (
                  <option key={pageSize} value={pageSize}>
                    عرض {pageSize}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
export function WalletTable({ data }: { data: WalletRow[] }) {
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rechargeDialogOpen, setRechargeDialogOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletRow | null>(null);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Adfali' | 'PayPal' | 'Stripe' | 'Masarat'>('PayPal');
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
 // In your WalletTable component
// In your WalletTable component
const handleRecharge = async () => {
  if (!selectedWallet || !rechargeAmount) return;
  
  try {
    setLoading(true);
    const amount = parseFloat(rechargeAmount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Please enter a valid positive amount');
    }

    await walletsService.addFunds({
      walletId: selectedWallet.walletId, // Use walletId instead of id
      amount: amount,
      currency: 'LYD',
      description: `Admin recharge for ${selectedWallet.name}`
    });

    toast.success(`Successfully added ${amount} LYD to ${selectedWallet.name}'s wallet`);
    setRechargeDialogOpen(false);
    setRechargeAmount('');
    
  } catch (error) {
    console.error('Recharge error:', error);
    let errorMessage = 'Failed to add funds';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
};

  const table = useReactTable({
    data,
    columns: [
      {
        accessorKey: "name",
        header: "الاسم",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarFallback>{row.original.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{row.original.name}</span>
              <span className="text-sm text-muted-foreground">
                {row.original.email}
              </span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "balance",
        header: "رصيد",
        cell: ({ row }) => (
          <Badge variant="default" className="bg-green-600">
            {row.original.balance}
          </Badge>
        ),
      },
      {
        accessorKey: "registrationDate",
        header: "تاريخ التسجيل",
        cell: ({ row }) => <span>{row.original.registrationDate}</span>,
      },
      {
        id: "actions",
        header: "الإجراءات",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toast.info(`تفاصيل محفظة ${row.original.name}`)}
            >
              <InfoIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedWallet(row.original);
                setRechargeDialogOpen(true);
              }}
            >
              <PlusCircle className="w-4 h-4 text-green-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toast.error(`تم حذف محفظة ${row.original.name}`)}
            >
              <IconTrash />
            </Button>
          </div>
        ),
      },
    ],
    state: { 
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (loading) {
    return <div>Loading wallets...</div>;
  }

  return (
    <div>
         <Dialog open={rechargeDialogOpen} onOpenChange={setRechargeDialogOpen}>
         <DialogContent className={`
  fixed top-32 right-76 m-auto 
  z-[1000] 
  w-[90%] max-w-md 
  p-6 
  bg-white 
  rounded-lg 
  shadow-xl
  border border-gray-200 dark:border-gray-700
  overflow-visible // Add this to allow select dropdown to overflow
`}>
          <DialogTitle className="text-xl font-bold mb-2">
            إعادة شحن المحفظة
          </DialogTitle>
          <DialogDescription className="mb-4 text-gray-600 dark:text-gray-300">
            إعادة شحن محفظة {selectedWallet?.name}
          </DialogDescription>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">المبلغ</label>
              <Input
                type="number"
                value={rechargeAmount}
                onChange={(e) => setRechargeAmount(e.target.value)}
                placeholder="أدخل المبلغ"
                className="w-full"
              />
            </div>

            <div className="relative ">
  <label className="block text-sm font-medium mb-1">طريقة الدفع</label>
  <Select
    value={paymentMethod}
    onValueChange={(value: 'Adfali' | 'PayPal' | 'Stripe' | 'Masarat') => 
      setPaymentMethod(value)
    }
  >
    <SelectTrigger className="w-full">
      <SelectValue placeholder="اختر طريقة الدفع" />
    </SelectTrigger>
    {/* Wrap SelectContent in Portal */}
    <Portal>
      <SelectContent className="z-[1001] bg-white border border-gray-200 rounded-md shadow-lg mt-1">
        <SelectItem value="Adfali">Adfali</SelectItem>
        <SelectItem value="PayPal">PayPal</SelectItem>
        <SelectItem value="Stripe">Stripe</SelectItem>
        <SelectItem value="Masarat">Masarat</SelectItem>
      </SelectContent>
    </Portal>
  </Select>
</div> <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setRechargeDialogOpen(false)}
                className="px-4"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleRecharge}
                disabled={loading || !rechargeAmount}
                className="px-4"
              >
                {loading ? 'جاري المعالجة...' : 'تأكيد الشحن'}
              </Button>
            </div>
          </div>
        </DialogContent>
        
        {/* Backdrop with blur effect */}
        <DialogOverlay className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm" />
      </Dialog>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                لا توجد بيانات متاحة
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    

      <div className="flex items-center justify-between px-2 mt-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            السابق
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            التالي
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <div>الصفحة</div>
            <strong>
              {table.getState().pagination.pageIndex + 1} من {table.getPageCount()}
            </strong>
          </span>
          
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => {
              table.setPageSize(Number(e.target.value))
            }}
            className="border rounded px-2 py-1"
          >
            {[10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                عرض {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>


    </div>
  );
}
// Add to data-table.tsx
export function BookingTable({ data }: { data: BookingRow[] }) {
  const [internalData, setInternalData] = React.useState<BookingRow[]>(data);
  const [loading, setLoading] = React.useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [activeTab, setActiveTab] = React.useState<
  'all' | 'confirmed' | 'pending' | 'rejected' | 'completed'
>('all');
  // Filter data based on active tab
  const filteredData = React.useMemo(() => {
    if (activeTab === 'all') return internalData;
    
    // Map tab values to status values
    const statusMap = {
      'confirmed': 'Confirmed',
      'pending': 'Pending',
      'rejected': 'Rejected',
      'completed': 'Completed'
    };
    
    return internalData.filter(booking => 
      booking.status.toLowerCase() === statusMap[activeTab].toLowerCase()
    );
  }, [internalData, activeTab]);
  // Update the handleStatusUpdate function
const handleStatusUpdate = async (bookingId: string, newStatus: 'Pending' | 'Confirmed' | 'Rejected' | 'Completed') => {
  try {
    await reservationService.updateBookingStatus(bookingId, newStatus);

    setLoading(true);
    setInternalData(prev => prev.map(booking => 
      booking.id === bookingId ? { ...booking, status: newStatus } : booking
    ));
    
    toast.success(`Booking status updated to ${getStatusText(newStatus)}`);
    
    // Update the active tab based on the new status
    const statusToTabMap = {
      'Confirmed': 'confirmed',
      'Rejected': 'rejected',
      'Completed': 'completed',
      'Pending': 'pending'
    } as const;
    
    // Add type assertion to ensure it's a valid tab value
    const newTab = statusToTabMap[newStatus] as 'all' | 'confirmed' | 'pending' | 'rejected' | 'completed';
    setActiveTab(newTab);
  } catch (error) {
    console.error('Status update failed:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to update booking status');
  } finally {
    setLoading(false);
  }
};

  const getStatusText = (status: string) => {
    switch(status) {
      case 'Pending': return 'قيد الانتظار';
      case 'Confirmed': return 'تم التأكيد';
      case 'Rejected': return 'ملغى';
      case 'Completed': return 'مكتمل';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  

  const columns: ColumnDef<BookingRow>[] = [
    {
      accessorKey: "propertyDetails",
      header: "الوحدة",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.propertyDetails?.images?.[0]?.url && (
            <img 
              src={row.original.propertyDetails.images[0].url} 
              alt={row.original.propertyDetails.title}
              className="w-12 h-12 rounded-md object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = logo;
              }}
            />
          )}
          <div className="flex flex-col">
            <span className="font-medium">{row.original.propertyDetails?.title || 'غير معروف'}</span>
            <span className="text-sm text-gray-500">
              {row.original.propertyDetails?.type}
              {row.original.propertyDetails?.subtype && ` - ${row.original.propertyDetails.subtype}`}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "client",
      header: "العميل",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-sm text-gray-500">{row.original.phoneNumber}</span>
        </div>
      ),
    },
    {
      accessorKey: "period",
      header: "الفترة",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span>من: {new Date(row.original.startDate).toLocaleDateString()}</span>
          <span>إلى: {new Date(row.original.endDate).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: "السعر",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.totalPrice} {row.original.currency}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => (
        <Badge className={`${getStatusColor(row.original.status)}`}>
          {getStatusText(row.original.status)}
        </Badge>
      ),
    },
    {
      accessorKey: "reservedAt",
      header: "تاريخ الحجز",
      cell: ({ row }) => (
        <span>{new Date(row.original.reservedAt).toLocaleDateString()}</span>
      ),
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => {
        const isConfirmed = row.original.status === 'Confirmed';
        const isPending = row.original.status === 'Pending';
        
        return (
          <div className="flex items-center gap-2">
            <Button
              variant={isPending ? "default" : "ghost"}
              size="sm"
              onClick={() => handleStatusUpdate(row.original.id, 'Confirmed')}
              disabled={isConfirmed || loading}
            >
              تأكيد
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleStatusUpdate(row.original.id, 'Rejected')}
              disabled={row.original.status === 'Rejected' || loading}
            >
              إلغاء
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredData, // Use filteredData instead of internalData
    columns,
    state: { 
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div>
      {/* Status Tabs */}
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'all' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('all')}
        >
          الكل
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'confirmed' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('confirmed')}
        >
          المؤكدة
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'pending' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('pending')}
        >
          قيد الانتظار
        </button>
        <button
  className={`px-4 py-2 font-medium ${activeTab === 'rejected' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}`}
  onClick={() => setActiveTab('rejected')}
>
  الملغية
</button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'completed' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('completed')}
        >
          المكتملة
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      )}

      {!loading && (
        <>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                    {activeTab === 'all' 
                      ? "لا توجد بيانات متاحة" 
                      : `لا توجد حجوزات ${getStatusText(activeTab.toUpperCase())}`}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between px-2 mt-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                السابق
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                التالي
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <div>الصفحة</div>
                <strong>
                  {table.getState().pagination.pageIndex + 1} من {table.getPageCount()}
                </strong>
              </span>
              
              <select
                value={table.getState().pagination.pageSize}
                onChange={e => {
                  table.setPageSize(Number(e.target.value))
                }}
                className="border rounded px-2 py-1"
              >
                {[10, 20, 30, 40, 50].map(pageSize => (
                  <option key={pageSize} value={pageSize}>
                    عرض {pageSize}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
// Main component that switches between tables
export function DynamicTable({
  data,
  tableType,
}: {
  data: (UserRow | UnitRow | SubscriptionRow | WalletRow | BookingRow)[];
  tableType: "users" | "units" | "subscriptions" | "wallets" | "bookings";
}) {
  const filteredData = React.useMemo(() => {
    switch (tableType) {
      case "users":
        return data.filter((item): item is UserRow => "name" in item);
      case "units":
        return data.filter((item): item is UnitRow => "unitName" in item);
      case "subscriptions":
        return data.filter((item): item is SubscriptionRow => "subscriptionType" in item);
      case "wallets":
        return data.filter((item): item is WalletRow => "balance" in item);
      case "bookings":
        return data.filter((item): item is BookingRow => "propertyId" in item);
      default:
        return [];
    }
  }, [data, tableType]);

  return (
    <div className="w-full">
      {tableType === "users" && <UserTable data={filteredData as UserRow[]} />}
      {tableType === "units" && <UnitTable data={filteredData as UnitRow[]} />}
      {tableType === "subscriptions" && <SubscriptionTable data={filteredData as SubscriptionRow[]} />}
      {tableType === "wallets" && <WalletTable data={filteredData as WalletRow[]} />}
      {tableType === "bookings" && <BookingTable data={filteredData as BookingRow[]} />}
    </div>
  );
}