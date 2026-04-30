import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  useGetSupplierQuery, useGetSupplierPerformanceQuery,
  useGetSupplierProductsQuery, useUpsertSupplierProductMutation,
  useDeleteSupplierProductMutation, useGetAdminProductsQuery,
  useGetPurchaseOrdersQuery,
} from '../../../features/api/adminApiSlice';
import {
  ChevronLeft, Package, ShoppingCart, Star, Loader2, AlertCircle,
  Plus, Trash2, Save, X, TrendingUp, Clock, CheckCircle, BarChart3
} from 'lucide-react';
import ConfirmModal from '../../../components/ConfirmModal';

const SupplierDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('products');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkForm, setLinkForm] = useState({ product: '', unitCost: '', leadTimeDays: 7, minOrderQty: 1 });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', action: null, variant: 'primary' });

  const { data: supData, isLoading } = useGetSupplierQuery(id);
  const { data: perfData } = useGetSupplierPerformanceQuery(id);
  const { data: spData, isLoading: spLoading } = useGetSupplierProductsQuery(id);
  const { data: poData } = useGetPurchaseOrdersQuery({ supplier: id });
  const { data: productsData } = useGetAdminProductsQuery({ page: 1, search: '' });
  const [upsertSP, { isLoading: isSaving }] = useUpsertSupplierProductMutation();
  const [deleteSP] = useDeleteSupplierProductMutation();

  const supplier = supData?.data;
  const perf = perfData?.data;
  const linkedProducts = spData?.data || [];
  const purchaseOrders = poData?.data || [];
  const allProducts = productsData?.data || [];

  if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-electric w-12 h-12" /></div>;
  if (!supplier) return <div className="p-8 text-center"><AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" /><h2 className="text-xl font-bold">Supplier not found</h2></div>;

  const handleLinkProduct = async (e) => {
    e.preventDefault();
    try {
      await upsertSP({ supplier: id, ...linkForm, unitCost: Number(linkForm.unitCost), leadTimeDays: Number(linkForm.leadTimeDays), minOrderQty: Number(linkForm.minOrderQty) }).unwrap();
      toast.success('Product linked to supplier successfully');
      setShowLinkModal(false);
      setLinkForm({ product: '', unitCost: '', leadTimeDays: 7, minOrderQty: 1 });
    } catch (err) { toast.error(err.data?.message || 'Failed to link product'); }
  };

  const handleUnlink = async (spId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Product Mapping',
      message: 'Are you sure you want to remove this product from the supplier catalog?',
      variant: 'danger',
      action: async () => {
        try {
          await deleteSP(spId).unwrap();
          toast.success('Product mapping removed');
        } catch (err) { toast.error(err.data?.message || 'Failed to unlink product'); }
        setConfirmModal({ isOpen: false });
      }
    });
  };

  const renderStars = (rating) => (
    <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />)}</div>
  );

  const getStatusColor = (status) => {
    const colors = { draft: 'bg-slate-100 text-slate-700', sent: 'bg-blue-100 text-blue-700', acknowledged: 'bg-indigo-100 text-indigo-700', partially_received: 'bg-orange-100 text-orange-700', received: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-rose-100 text-rose-700', closed: 'bg-slate-100 text-slate-600' };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <Link to="/admin/suppliers" className="inline-flex items-center text-sm text-slate-500 hover:text-electric mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Suppliers
      </Link>

      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-heading font-extrabold text-slate-900">{supplier.name}</h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${supplier.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{supplier.isActive ? 'Active' : 'Inactive'}</span>
            </div>
            <p className="text-slate-500 font-mono text-sm">{supplier.code}</p>
            <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
              {supplier.contactPerson && <span>{supplier.contactPerson}</span>}
              {supplier.email && <span>• {supplier.email}</span>}
              {supplier.phone && <span>• {supplier.phone}</span>}
            </div>
            <div className="mt-3">{renderStars(supplier.rating)}</div>
          </div>

          {/* Performance Stats */}
          {perf && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Deliveries', value: perf.totalDeliveries, icon: Package, color: 'bg-blue-50 text-blue-600' },
                { label: 'On-Time %', value: `${perf.onTimeRate}%`, icon: Clock, color: 'bg-emerald-50 text-emerald-600' },
                { label: 'Quality %', value: `${perf.qualityScore}%`, icon: CheckCircle, color: 'bg-indigo-50 text-indigo-600' },
                { label: 'Calc Rating', value: perf.calculatedRating, icon: TrendingUp, color: 'bg-amber-50 text-amber-600' },
              ].map(stat => (
                <div key={stat.label} className={`p-4 rounded-xl ${stat.color} text-center min-w-[100px]`}>
                  <stat.icon className="w-5 h-5 mx-auto mb-1.5 opacity-70" />
                  <div className="text-2xl font-extrabold">{stat.value}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1 w-fit">
        {[{ key: 'products', label: 'Linked Products', icon: Package }, { key: 'orders', label: 'Purchase Orders', icon: ShoppingCart }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === tab.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-800">Linked Products ({linkedProducts.length})</h3>
            <button onClick={() => setShowLinkModal(true)} className="text-sm bg-electric hover:bg-electric-dark text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors">
              <Plus className="w-4 h-4" /> Link Product
            </button>
          </div>
          {linkedProducts.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No products linked yet.</div>
          ) : (
            <table className="w-full text-left">
              <thead><tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="p-4 px-6">Product</th><th className="p-4 px-6">Unit Cost</th><th className="p-4 px-6">Lead Time</th><th className="p-4 px-6">MOQ</th><th className="p-4 px-6 text-right">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {linkedProducts.map(sp => (
                  <tr key={sp._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 px-6 font-bold text-slate-900">{sp.product?.name || 'Unknown'}</td>
                    <td className="p-4 px-6 text-slate-700">Rs. {sp.unitCost?.toFixed(2)}</td>
                    <td className="p-4 px-6 text-slate-500">{sp.leadTimeDays} days</td>
                    <td className="p-4 px-6 text-slate-500">{sp.minOrderQty}</td>
                    <td className="p-4 px-6 text-right">
                      <button onClick={() => handleUnlink(sp._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800">Purchase Order History ({purchaseOrders.length})</h3>
          </div>
          {purchaseOrders.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No purchase orders for this supplier.</div>
          ) : (
            <table className="w-full text-left">
              <thead><tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="p-4 px-6">PO #</th><th className="p-4 px-6">Items</th><th className="p-4 px-6">Total</th><th className="p-4 px-6">Status</th><th className="p-4 px-6">Date</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseOrders.map(po => (
                  <tr key={po._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 px-6 font-bold text-slate-900">{po.poNumber}</td>
                    <td className="p-4 px-6 text-slate-500">{po.items?.length || 0} items</td>
                    <td className="p-4 px-6 font-bold text-slate-900">Rs. {po.pricing?.grandTotal?.toFixed(2)}</td>
                    <td className="p-4 px-6"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(po.status)}`}>{po.status?.replace(/_/g, ' ')}</span></td>
                    <td className="p-4 px-6 text-sm text-slate-500">{new Date(po.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Link Product Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
            <div className="px-8 py-6 flex justify-between items-center border-b border-slate-100">
              <h2 className="text-xl font-heading font-extrabold text-slate-900">Link Product</h2>
              <button onClick={() => setShowLinkModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
            </div>
            <form onSubmit={handleLinkProduct} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">Product*</label>
                <select value={linkForm.product} onChange={(e) => setLinkForm({...linkForm, product: e.target.value})} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50">
                  <option value="">Select a product...</option>
                  {allProducts.map(p => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-sm font-bold text-slate-800 mb-1.5">Cost ($)*</label>
                  <input type="number" step="0.01" min="0.01" value={linkForm.unitCost} onChange={(e) => setLinkForm({...linkForm, unitCost: e.target.value})} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50" /></div>
                <div><label className="block text-sm font-bold text-slate-800 mb-1.5">Lead (days)</label>
                  <input type="number" min="0" value={linkForm.leadTimeDays} onChange={(e) => setLinkForm({...linkForm, leadTimeDays: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50" /></div>
                <div><label className="block text-sm font-bold text-slate-800 mb-1.5">MOQ</label>
                  <input type="number" min="1" value={linkForm.minOrderQty} onChange={(e) => setLinkForm({...linkForm, minOrderQty: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50" /></div>
              </div>
              <div className="pt-2 flex gap-4">
                <button type="button" onClick={() => setShowLinkModal(false)} className="flex-1 py-3.5 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-[1.5] py-3.5 bg-electric hover:bg-electric-dark text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-70">
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Link Product
                </button>
              </div>
            </form>
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
          confirmText="Yes, Remove"
          cancelText="Cancel"
          variant={confirmModal.variant}
        />
      )}
    </div>
  );
};

export default SupplierDetail;
