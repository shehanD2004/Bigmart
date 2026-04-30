import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  useGetPurchaseOrdersQuery, useAutoGeneratePOsMutation,
} from '../../../features/api/adminApiSlice';
import {
  Search, Clock, Package, Loader2,
  ChevronLeft, ChevronRight, Filter, Plus, Zap, ShoppingCart, Eye, Warehouse,
} from 'lucide-react';
import ConfirmModal from '../../../components/ConfirmModal';

const PurchaseOrdersList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(searchTerm); setPage(1); }, 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { data, isLoading } = useGetPurchaseOrdersQuery({ page, search: debouncedSearch, status: statusFilter });
  const [autoGenerate, { isLoading: isGenerating }] = useAutoGeneratePOsMutation();

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', action: null });

  const handleAutoGenerate = async () => {
    setConfirmModal({
      isOpen: true,
      title: 'Auto-Generate POs',
      message: 'Are you sure you want to auto-generate POs for all low-stock products?',
      action: async () => {
        try {
          const result = await autoGenerate().unwrap();
          if (result.created > 0) {
            toast.success(`Created ${result.created} PO(s): ${result.purchaseOrders?.join(', ')}`);
          } else {
            toast.info(result.message || 'No POs were needed — stock levels are healthy.');
          }
          if (result.skippedProducts?.length > 0) {
            toast.warning(`Skipped ${result.skippedProducts.length} product(s) without eligible suppliers.`);
          }
        } catch (err) { toast.error(err.data?.message || 'Auto-generate failed'); }
        setConfirmModal({ isOpen: false });
      }
    });
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-electric w-12 h-12" /></div>;

  const orders = data?.data || [];
  const pagination = { page: data?.page || 1, pages: data?.pages || 1 };
  const statusOptions = ['draft', 'sent', 'acknowledged', 'partially_received', 'received', 'cancelled', 'closed'];

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-slate-100 text-slate-700 border-slate-200',
      sent: 'bg-blue-100 text-blue-700 border-blue-200',
      acknowledged: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      partially_received: 'bg-orange-100 text-orange-700 border-orange-200',
      received: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
      closed: 'bg-slate-100 text-slate-600 border-slate-200',
    };
    return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight">Purchase Orders</h1>
          <p className="text-slate-500 mt-1">Manage vendor purchase orders and track deliveries.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleAutoGenerate} disabled={isGenerating}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center transition-colors shadow-sm disabled:opacity-70 text-sm">
            {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />} Auto-Generate
          </button>
          <Link to="/admin/purchase-orders/new"
            className="bg-electric hover:bg-electric-dark text-white px-5 py-2.5 rounded-xl font-semibold flex items-center transition-colors shadow-sm text-sm">
            <Plus className="w-5 h-5 mr-2" /> Create PO
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-50">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input type="text" placeholder="Search by PO number..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 text-sm" />
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <Filter className="text-slate-400 w-5 h-5 hidden sm:block" />
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full lg:w-48 p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 text-sm">
              <option value="">All Statuses</option>
              {statusOptions.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1).replace(/_/g, ' ')}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {orders.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <ShoppingCart className="w-16 h-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-800 mb-2">No purchase orders found</h3>
              <p className="text-slate-500">Create your first PO or use Auto-Generate to fill low stock.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                  <th className="p-4 px-6">PO Details</th>
                  <th className="p-4 px-6">Supplier</th>
                  <th className="p-4 px-6">Warehouse</th>
                  <th className="p-4 px-6">Items</th>
                  <th className="p-4 px-6">Total</th>
                  <th className="p-4 px-6">Status</th>
                  <th className="p-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map(po => (
                  <tr key={po._id}
                    onClick={() => navigate(`/admin/purchase-orders/${po._id}`)}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer">
                    <td className="p-4 px-6">
                      <div className="font-bold text-slate-900 text-sm">{po.poNumber}</div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(po.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4 px-6">
                      <div className="text-sm font-medium text-slate-800">{po.supplier?.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-500 font-mono">{po.supplier?.code}</div>
                    </td>
                    <td className="p-4 px-6">
                      <div className="text-sm text-slate-700 flex items-center gap-1">
                        <Warehouse className="w-3.5 h-3.5 text-slate-400" />
                        {po.warehouse?.name || <span className="text-slate-400 italic">None</span>}
                      </div>
                    </td>
                    <td className="p-4 px-6 text-sm text-slate-600">
                      <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5 text-slate-400" /> {po.items?.length || 0} items</span>
                    </td>
                    <td className="p-4 px-6 font-bold text-slate-900">Rs. {po.pricing?.grandTotal?.toFixed(2)}</td>
                    <td className="p-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold leading-none border ${getStatusColor(po.status)}`}>
                        {po.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4 px-6 text-right">
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/purchase-orders/${po._id}`); }}
                        className="p-2 text-slate-400 hover:text-electric hover:bg-electric/10 rounded-lg transition-colors"
                        title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {pagination.pages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
            <span className="text-sm text-slate-500 font-medium">Page <span className="text-slate-900">{pagination.page}</span> of <span className="text-slate-900">{pagination.pages}</span></span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {confirmModal.isOpen && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, action: null })}
          onConfirm={confirmModal.action}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText="Yes, Proceed"
          cancelText="Cancel"
          isLoading={isGenerating}
        />
      )}
    </div>
  );
};

export default PurchaseOrdersList;
