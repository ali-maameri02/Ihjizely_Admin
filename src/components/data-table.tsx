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
import { CSS } from "@dnd-kit/utilities";
import { IconThumbDownFilled, IconThumbUpFilled, IconTrash } from "@tabler/icons-react";
import { InfoIcon, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
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
import '../index.css'
import { Property, unitsService } from "@/API/UnitsService";
import { useState } from "react";
import { PropertyDetailsModal } from "./Admin/PropertyDetailsModal";
// Define schemas
export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  role: z.string(),
  email: z.string(),
  date: z.string(),
  image: z.string()
});

export const unitSchema = z.object({
  id: z.string(),
  type: z.string(),
  unitName: z.string(),
  image: z.string(),
  owner: z.string(),
  location: z.string(),
  status: z.enum(['Pending', 'Accepted', 'Refused']), // Add this
  subscriptionStatus: z.boolean(),
  registrationDate: z.string(),
  premiumSubscription: z.boolean(),
});


export const subscriptionSchema = z.object({
  id: z.number(),
  owner: z.string(),
  subscriptionType: z.string(),
  registrationDate: z.string(),
  status: z.string(),
});


export const walletSchema = z.object({
  id: z.number(),
  name: z.string(),
  balance: z.string(),
  registrationDate: z.string(),
  email: z.string(),
});

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

function DataTable<TData extends { id: number }>({
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
              @{row.original.username}
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
      header: "البريد الإلكتروني",
      cell: ({ row }) => <span>{row.original.email}</span>,
    },
    {
      accessorKey: "date",
      header: "تاريخ الإنشاء",
      cell: ({ row }) => <span>{row.original.date}</span>,
    },
    {
      id: "actions",
      header: () => null,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toast.info(`تفاصيل ${row.original.name}`)}
          >
            <InfoIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toast.error(`تم حذف ${row.original.name}`)}
          >
            <IconTrash />
          </Button>
        </div>
      ),
    },
  ];

  return <DataTable data={data} columns={columns} />;
}

// Unit-specific table
// UnitTable component in data-table.tsx

export function UnitTable({ data }: { data: UnitRow[] }) {
  const [filterType, setFilterType] = React.useState<string>("");
  const [filterSubtype, setFilterSubtype] = React.useState<string>("");
  const [activeTab, setActiveTab] = React.useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [internalData, setInternalData] = React.useState<UnitRow[]>(data);
  const [loading, setLoading] = React.useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
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

        if (filterSubtype) {
          filteredData = await unitsService.getUnitsByType(filterSubtype);
        } else if (filterType) {
          filteredData = await unitsService.getUnitsByType(filterType);
        } else {
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
            default:
              filteredData = await unitsService.getAllUnits();
              break;
          }
        }

        if (filterType && !filterSubtype) {
          filteredData = filteredData.filter(item => 
            item.type === filterType || item.type === filterType
          );
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

  const handleStatusUpdate = async (
    propertyId: string, 
    status: 'Accepted' | 'Refused' | 'Pending'
  ) => {
    try {
      setLoading(true);
      
      setInternalData(prev => prev.map(item => 
        item.id.toString() === propertyId 
          ? { ...item, status, subscriptionStatus: status === 'Accepted' }
          : item
      ));

      await unitsService.updatePropertyStatus(propertyId, status);
      
      toast.success(`تم ${status === 'Accepted' ? 'قبول' : 'رفض'} الوحدة بنجاح`);
      
      const refreshData = await unitsService.getAllUnits();
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
      
      setInternalData(prev => prev.filter(item => item.id.toString() !== unitId));
      
      await unitsService.deleteUnit(unitId);
      
      toast.success(`تم حذف الوحدة "${unitName}" بنجاح`);
    } catch (error) {
      setInternalData(data);
      
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'حدث خطأ أثناء حذف الوحدة'
      );
    } finally {
      setLoading(false);
    }
  };

  const table = useReactTable({
    data: internalData,
    columns: [
      {
        accessorKey: "unitName",
        header: "الوحدة",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <img 
              src={row.original.image || logo} 
              className="rounded-md w-16 h-12 object-cover border" 
              alt={row.original.unitName}
              onError={(e) => {
                e.currentTarget.src = logo;
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
        cell: ({ row }) => <span>{row.original.owner}</span>,
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
        accessorKey: "premiumSubscription",
        header: "اشتراك مميز",
        cell: ({ row }) => (
          <Badge
            style={{
              backgroundColor: row.original.premiumSubscription ? "#45DB4F" : "red",
              color: "white",
            }}
          >
            {row.original.premiumSubscription ? "مفعل" : "غير مفعل"}
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
                  'Accepted'
                )}
                disabled={isAccepted}
              >
                <IconThumbUpFilled className={`w-4 h-4 ${isAccepted ? 'text-white' : 'text-green-500'}`} />
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
                <IconThumbDownFilled className={`w-4 h-4 ${isRefused ? 'text-white' : 'text-red-500'}`} />
              </Button>
      
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteUnit(
                  row.original.id.toString(),
                  row.original.unitName
                )}
                disabled={loading}
              >
                <IconTrash className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          );
        }
      }
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

  return (
    <div>
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'all' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('all')}
        >
          الكل
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'pending' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('pending')}
        >
          قيد الانتظار
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'approved' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('approved')}
        >
          المقبولة
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'rejected' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('rejected')}
        >
          المرفوضة
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4">
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
            className="border rounded px-3 py-1 w-full text-right"
            disabled={loading}
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
            className="border rounded px-3 py-1 w-full text-right"
            disabled={!filterType || loading}
          >
            <option value="">الكل</option>
            {filterType && propertyTypes
              .find(type => type.type === filterType)
              ?.subtypes.map(subtype => (
                <option key={subtype} value={subtype}>
                  {unitsService.getSubtypeLabel(subtype)}
                </option>
              ))}
          </select>
        </div>
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
                    {filterSubtype 
                      ? `لا توجد وحدات من نوع ${unitsService.getSubtypeLabel(filterSubtype)}`
                      : "لا توجد بيانات متاحة"}
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

      <PropertyDetailsModal 
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
      />
    </div>
  );
}
// Subscription-specific table
export function SubscriptionTable({ data }: { data: SubscriptionRow[] }) {
  const columns: ColumnDef<SubscriptionRow>[] = [
    {
      accessorKey: "owner",
      header: "صاحب العمل",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.owner}</div>
      ),
    },
    {
      accessorKey: "subscriptionType",
      header: "نوع الاشتراك",
      cell: ({ row }) => (
        <Badge 
          variant={
            row.original.subscriptionType === "GOLD" ? "default" : 
            row.original.subscriptionType === "SILVER" ? "secondary" : "outline"
          }
        >
          {row.original.subscriptionType}
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
        <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8"
            onClick={() => toast.info(`تفاصيل اشتراك ${row.original.owner}`)}
          >
            <InfoIcon className="w-4 h-4 text-blue-500" />
          </Button>
      ),
    },
  ];

  return <DataTable data={data} columns={columns} />;
}
export function WalletTable({ data }: { data: WalletRow[] }) {
  const columns: ColumnDef<WalletRow>[] = [
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
            onClick={() => toast.error(`تم حذف محفظة ${row.original.name}`)}
          >
            <IconTrash />
          </Button>
        </div>
      ),
    },
  ];

  return <DataTable data={data} columns={columns} />;
}

// Main component that switches between tables
export function DynamicTable({
  data,
  tableType,
}: {
  data: (UserRow | UnitRow | SubscriptionRow | WalletRow)[];
  tableType: "users" | "units" | "subscriptions" | "wallets";
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
      
    </div>
  );
}