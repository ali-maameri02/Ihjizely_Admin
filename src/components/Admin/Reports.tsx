// src/components/Admin/Reports.tsx
import { useState, useEffect } from 'react';
import { reportsService } from '@/API/ReportService';
import { toast } from 'sonner';
import { DataTable } from '../data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogOverlay, DialogTitle } from '../ui/dialog';
import { useNavigate, useParams } from 'react-router-dom';
import { IconTrash } from '@tabler/icons-react';

export interface ReportRow {
  id: string;
  userId: string;
  reason: string;
  content: string;
  createdAt: string;
}

export default function Reports() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<ReportRow | null>(null);
  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch all reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await reportsService.getAllReports();
        setReports(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch reports');
        toast.error('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Handle when URL changes (when clicking on a report)
  useEffect(() => {
    if (id) {
      const report = reports.find(r => r.id === id);
      if (report) {
        setSelectedReport(report);
      }
    } else {
      setSelectedReport(null);
    }
  }, [id, reports]);

  // Filter reports based on search query
  const filteredReports = reports.filter(report => {
    const searchLower = searchQuery.toLowerCase();
    return (
      report.reason.toLowerCase().includes(searchLower) ||
      report.content.toLowerCase().includes(searchLower) ||
      report.createdAt.toLowerCase().includes(searchLower)
    );
  });

  // Handle report deletion
  const handleDeleteReport = async (id: string) => {
    try {
      setLoading(true);
      await reportsService.deleteReport(id);
      setReports(prev => prev.filter(report => report.id !== id));
      toast.success('تم حذف التقرير بنجاح');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete report');
    } finally {
      setLoading(false);
    }
  };

  // Close modal handler
  const handleCloseModal = () => {
    navigate('/Admin/reports');
  };

  // Table columns configuration
  const columns: ColumnDef<ReportRow>[] = [
    {
      accessorKey: "reason",
      header: "السبب",
      cell: ({ row }) => <span>{row.original.reason}</span>,
    },
    {
      accessorKey: "content",
      header: "المحتوى",
      cell: ({ row }) => <span className="truncate max-w-xs">{row.original.content}</span>,
    },
    {
      accessorKey: "createdAt",
      header: "تاريخ الإنشاء",
      cell: ({ row }) => <span>{new Date(row.original.createdAt).toLocaleDateString()}</span>,
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => navigate(`/Admin/reports/${row.original.id}`)}
          >
            عرض التفاصيل
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (confirm(`هل أنت متأكد من حذف هذا التقرير؟`)) {
                handleDeleteReport(row.original.id);
              }
            }}
          >
            <IconTrash className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <div className="p-6 flex items-center justify-center h-64">جاري تحميل البيانات...</div>;
  }

  if (error) {
    return <div className="p-6 flex items-center justify-center h-64 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      {/* Main Content */}
      <div className="flex flex-col md:flex-col justify-between md:items-center gap-4 mb-6">
        <div className="flex items-center gap-2 justify-between w-full">
          <div>           
            <h1 className='text-2xl font-bold text-gray-800'>التقارير</h1>
            <p className="text-gray-600 mt-1">إدارة جميع التقارير في النظام</p>
          </div>
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
        </div>
      </div>
      
      {/* Reports Table */}
      <div className="rounded-md border">
        <DataTable data={filteredReports} columns={columns} />
      </div>

      {/* Report Detail Modal */}
      <Dialog open={!!selectedReport} onOpenChange={handleCloseModal}>
        <DialogOverlay className='z-[99999]'>
        <DialogContent className="sm:max-w-[625px] max-h-[80vh] overflow-y-auto z-[9999999]">
          <DialogHeader>
            <DialogTitle>تفاصيل التقرير</DialogTitle>
            <DialogDescription>معلومات كاملة عن التقرير المحدد</DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <h4 className="font-medium">السبب:</h4>
                <p className="text-gray-600 break-words">{selectedReport.reason}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">المحتوى:</h4>
                <p className="text-gray-600 whitespace-pre-line break-words">{selectedReport.content}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">تاريخ الإنشاء:</h4>
                <p className="text-gray-600">
                  {new Date(selectedReport.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">معرف المستخدم:</h4>
                <p className="text-gray-600 break-all">{selectedReport.userId}</p>
              </div>
            </div>
          )}
        </DialogContent>
        </DialogOverlay>
      </Dialog>
    </div>
  );
}