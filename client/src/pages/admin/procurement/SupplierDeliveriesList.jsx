import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  useGetSupplierDeliveriesQuery,
  useGetSuppliersQuery,
  useGetPurchaseOrdersQuery,
  useCreateSupplierDeliveryMutation,
  useDeleteSupplierDeliveryMutation,
} from '../../../features/api/adminApiSlice';
import {
  Truck, Package, Plus, Search, Filter, Loader2, AlertCircle,
  ChevronLeft, ChevronRight, Trash2, X, Save, Eye,
} from 'lucide-react';
import ConfirmModal from '../../../components/ConfirmModal';

const STATUS_COLORS = {
  pending:  'bg-slate-100 text-slate-700 border-slate-200',
  partial:  'bg-amber-100 text-amber-700 border-amber-200',
  complete: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  disputed: 'bg-rose-100 text-rose-700 border-rose-200',
};

const SupplierDeliveriesList = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewDelivery, setViewDelivery] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', action: null, variant: 'primary' });

  const [form, setForm] = useState({
    purchaseOrder: '', supplier: '', status: 'complete',
    deliveryDate: new Date().toISOString().slice(0, 10),
    qualityNotes: '', deliveredItems: [],
  });

  const { data, isLoading } = useGetSupplierDeliveriesQuery({ page, status: statusFilter, supplier: supplierFilter });
  const { data: suppliersData } = useGetSuppliersQuery({ isActive: true });
  const { data: posData } = useGetPurchaseOrdersQuery({ status: 'acknowledged,partially_received', supplier: supplierFilter || undefined });
  const [createDelivery, { isLoading: isCreating }] = useCreateSupplierDeliveryMutation();
  const [deleteDelivery] = useDeleteSupplierDeliveryMutation();

  const deliveries = data?.data || [];
  const pagination = { page: data?.page || 1, pages: data?.pages || 1 };
  const suppliers = suppliersData?.data || [];
  const openPOs  = posData?.data || [];

  // When PO selected, pre-fill deliveredItems from PO items
  const handlePOSelect = (poId) => {
    const po = openPOs.find(p => p._id === poId);
    if (!po) { setForm(f => ({ ...f, purchaseOrder: poId, deliveredItems: [] })); return; }
    const items = (po.items || []).map(i => ({
      product: i.product?._id || i.product,
      productName: i.product?.name || i.description,
      expectedQty: i.orderedQty - (i.receivedQty || 0),
      receivedQty: i.orderedQty - (i.receivedQty || 0),
      rejectedQty: 0,
      condition: 'good',
    }));
    setForm(f => ({
      ...f,
      purchaseOrder: poId,
      supplier: po.supplier?._id || po.supplier,
      deliveredItems: items,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.purchaseOrder) { toast.warning('Please select a Purchase Order'); return; }
    if (form.deliveredItems.length === 0) { toast.warning('No items to deliver'); return; }
    const hasInvalidQty = form.deliveredItems.some(i => Number(i.receivedQty) < 0);
    if (hasInvalidQty) { toast.error('Received quantity cannot be negative'); return; }
    try {
      await createDelivery({
        ...form,
        deliveredItems: form.deliveredItems.map(i => ({
          product: i.product,
          expectedQty: Number(i.expectedQty) || 0,
          receivedQty: Number(i.receivedQty) || 0,
          rejectedQty: Number(i.rejectedQty) || 0,
          condition: i.condition || 'good',
        })),
      }).unwrap();
      toast.success('Delivery recorded successfully — stock updated');
      setIsModalOpen(false);
      setForm({ purchaseOrder: '', supplier: '', status: 'complete', deliveryDate: new Date().toISOString().slice(0, 10), qualityNotes: '', deliveredItems: [] });
    } catch (err) { toast.error(err.data?.message || 'Failed to record delivery'); }
  };

  const handleDelete = async (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Delivery Record',
      message: 'Are you sure you want to permanently delete this delivery record?',
      variant: 'danger',
      action: async () => {
        try {
          await deleteDelivery(id).unwrap();
          toast.success('Delivery record deleted');
        } catch (err) { toast.error(err.data?.message || 'Failed to delete delivery'); }
        setConfirmModal({ isOpen: false });
      }
    });
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-electric w-10 h-10" /></div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight">Supplier Deliveries</h1>
          <p className="text-slate-500 mt-1">Track incoming stock deliveries from suppliers.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-electric hover:bg-electric-dark text-white px-5 py-2.5 rounded-xl font-semibold flex items-center transition-colors shadow-sm">
          <Plus className="w-5 h-5 mr-2" /> Record Delivery
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Filters */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 bg-slate-50">
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 text-sm w-full sm:w-48">
            <option value="">All Statuses</option>
            {['pending', 'partial', 'complete', 'disputed'].map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <select value={supplierFilter} onChange={e => { setSupplierFilter(e.target.value); setPage(1); }}
            className="p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 text-sm w-full sm:w-56">
            <option value="">All Suppliers</option>
            {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          {deliveries.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <Truck className="w-16 h-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-800 mb-2">No deliveries found</h3>
              <p className="text-slate-500">Record deliveries when goods arrive from suppliers.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                  <th className="p-4 px-6">PO Number</th>
                  <th className="p-4 px-6">Supplier</th>
                  <th className="p-4 px-6">Warehouse</th>
                  <th className="p-4 px-6">Items</th>
                  <th className="p-4 px-6">Date</th>
                  <th className="p-4 px-6">Status</th>
                  <th className="p-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deliveries.map(d => (
                  <tr key={d._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4 px-6 font-bold text-slate-900 text-sm">
                      {d.purchaseOrder?.poNumber || '—'}
                    </td>
                    <td className="p-4 px-6">
                      <div className="text-sm font-medium text-slate-800">{d.supplier?.name || '—'}</div>
                      <div className="text-xs text-slate-500 font-mono">{d.supplier?.code}</div>
                    </td>
                    <td className="p-4 px-6 text-sm text-slate-600">{d.warehouse?.name || '—'}</td>
                    <td className="p-4 px-6 text-sm text-slate-600 flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-slate-400" /> {d.deliveredItems?.length || 0}
                    </td>
                    <td className="p-4 px-6 text-sm text-slate-500">
                      {d.deliveryDate ? new Date(d.deliveryDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="p-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[d.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="p-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setViewDelivery(d)}
                          className="p-2 text-slate-400 hover:text-electric hover:bg-electric/10 rounded-lg transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(d._id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {pagination.pages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
            <span className="text-sm text-slate-500">Page <span className="text-slate-900">{pagination.page}</span> of <span className="text-slate-900">{pagination.pages}</span></span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Create Delivery Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300 max-h-[90vh] flex flex-col">
            <div className="px-8 py-6 flex justify-between items-center border-b border-slate-100 shrink-0">
              <h2 className="text-xl font-heading font-extrabold text-slate-900">Record Delivery</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Supplier</label>
                  <select value={form.supplier} onChange={e => { setForm(f => ({ ...f, supplier: e.target.value, purchaseOrder: '', deliveredItems: [] })); setPage(1); }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50">
                    <option value="">— Select Supplier —</option>
                    {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Purchase Order*</label>
                  <select value={form.purchaseOrder} onChange={e => handlePOSelect(e.target.value)} required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50">
                    <option value="">— Select PO —</option>
                    {openPOs.map(po => <option key={po._id} value={po._id}>{po.poNumber}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Delivery Date</label>
                  <input type="date" value={form.deliveryDate} onChange={e => setForm(f => ({ ...f, deliveryDate: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50">
                    {['pending', 'partial', 'complete', 'disputed'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              {/* Item rows */}
              {form.deliveredItems.length > 0 && (
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Delivered Items</label>
                  <div className="space-y-2">
                    {form.deliveredItems.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="col-span-4 text-sm font-semibold text-slate-800">{item.productName}</div>
                        <div>
                          <label className="text-xs text-slate-500 font-bold">Expected</label>
                          <input type="number" min="0" value={item.expectedQty}
                            onChange={e => { const items = [...form.deliveredItems]; items[idx].expectedQty = Number(e.target.value); setForm(f => ({ ...f, deliveredItems: items })); }}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 font-bold">Received</label>
                          <input type="number" min="0" max={item.expectedQty} value={item.receivedQty}
                            onChange={e => { const items = [...form.deliveredItems]; items[idx].receivedQty = Number(e.target.value); setForm(f => ({ ...f, deliveredItems: items })); }}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 font-bold">Rejected</label>
                          <input type="number" min="0" value={item.rejectedQty}
                            onChange={e => { const items = [...form.deliveredItems]; items[idx].rejectedQty = Number(e.target.value); setForm(f => ({ ...f, deliveredItems: items })); }}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 font-bold">Condition</label>
                          <select value={item.condition}
                            onChange={e => { const items = [...form.deliveredItems]; items[idx].condition = e.target.value; setForm(f => ({ ...f, deliveredItems: items })); }}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm">
                            {['good', 'damaged', 'expired'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">Quality Notes</label>
                <textarea value={form.qualityNotes} onChange={e => setForm(f => ({ ...f, qualityNotes: e.target.value }))} rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 text-sm resize-none" />
              </div>

              <div className="pt-2 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl">Cancel</button>
                <button type="submit" disabled={isCreating} className="flex-[1.5] py-3.5 bg-electric hover:bg-electric-dark text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-70">
                  {isCreating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Record Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Delivery Modal */}
      {viewDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
            <div className="px-8 py-6 flex justify-between items-center border-b border-slate-100">
              <h2 className="text-xl font-heading font-extrabold text-slate-900">Delivery Details</h2>
              <button onClick={() => setViewDelivery(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-500">PO</span><p className="font-bold">{viewDelivery.purchaseOrder?.poNumber || '—'}</p></div>
                <div><span className="text-slate-500">Supplier</span><p className="font-bold">{viewDelivery.supplier?.name || '—'}</p></div>
                <div><span className="text-slate-500">Warehouse</span><p className="font-bold">{viewDelivery.warehouse?.name || '—'}</p></div>
                <div><span className="text-slate-500">Date</span><p className="font-bold">{viewDelivery.deliveryDate ? new Date(viewDelivery.deliveryDate).toLocaleDateString() : '—'}</p></div>
                <div><span className="text-slate-500">Status</span><p className="font-bold capitalize">{viewDelivery.status}</p></div>
              </div>
              {viewDelivery.qualityNotes && (
                <div><span className="text-slate-500 text-sm">Quality Notes</span><p className="text-sm text-slate-700 mt-1">{viewDelivery.qualityNotes}</p></div>
              )}
              <div>
                <span className="text-slate-500 text-sm font-bold block mb-2">Delivered Items</span>
                <div className="space-y-2">
                  {(viewDelivery.deliveredItems || []).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <span className="font-medium text-slate-800">{item.product?.name || '—'}</span>
                      <span className="text-slate-500">Rcvd: <span className="font-bold text-emerald-600">{item.receivedQty}</span> / {item.expectedQty}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmModal.isOpen && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false })}
          onConfirm={confirmModal.action}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText="Yes, Delete"
          cancelText="Cancel"
          variant={confirmModal.variant}
        />
      )}
    </div>
  );
};

export default SupplierDeliveriesList;
