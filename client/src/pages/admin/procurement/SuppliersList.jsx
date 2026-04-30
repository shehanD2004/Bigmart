import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  useGetSuppliersQuery, useCreateSupplierMutation, 
  useUpdateSupplierMutation, useToggleSupplierStatusMutation,
  useDeleteSupplierMutation
} from '../../../features/api/adminApiSlice';
import { 
  Plus, Search, Pencil, Ban, CheckCircle, Truck,
  ChevronLeft, ChevronRight, AlertCircle, Loader2, X, Save, Star, Trash2
} from 'lucide-react';
import ConfirmModal from '../../../components/ConfirmModal';

const SuppliersList = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', email: '', phone: '', contactPerson: '', paymentTerms: 'Net 30', rating: 3 });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', action: null, variant: 'primary' });

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(searchTerm); setPage(1); }, 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { data, isLoading, isError, error } = useGetSuppliersQuery({ page, search: debouncedSearch });
  const [createSupplier, { isLoading: isCreating }] = useCreateSupplierMutation();
  const [updateSupplier, { isLoading: isUpdating }] = useUpdateSupplierMutation();
  const [toggleStatus] = useToggleSupplierStatusMutation();
  const [deleteSupplier] = useDeleteSupplierMutation();

  const handleOpenModal = (sup = null) => {
    if (sup) {
      setEditingSupplier(sup);
      setFormData({ name: sup.name, code: sup.code, email: sup.email || '', phone: sup.phone || '', contactPerson: sup.contactPerson || '', paymentTerms: sup.paymentTerms || 'Net 30', rating: sup.rating || 3 });
    } else {
      setEditingSupplier(null);
      setFormData({ name: '', code: '', email: '', phone: '', contactPerson: '', paymentTerms: 'Net 30', rating: 3 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phone && !/^\+?[0-9\s\-()]{7,15}$/.test(formData.phone)) {
      toast.warning('Please enter a valid phone number (7-15 digits, +, -, spaces allowed).');
      return;
    }
    try {
      if (editingSupplier) {
        await updateSupplier({ id: editingSupplier._id, ...formData }).unwrap();
        toast.success(`Supplier "${formData.name}" updated successfully`);
      } else {
        await createSupplier(formData).unwrap();
        toast.success(`Supplier "${formData.name}" added successfully`);
      }
      setIsModalOpen(false);
    } catch (err) { toast.error(err.data?.message || 'Failed to save supplier'); }
  };

  const handleToggle = async (sup) => {
    const action = sup.isActive ? 'deactivate' : 'activate';
    setConfirmModal({
      isOpen: true,
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Supplier`,
      message: `Are you sure you want to ${action} ${sup.name}?`,
      variant: action === 'deactivate' ? 'warning' : 'primary',
      action: async () => {
        try {
          await toggleStatus(sup._id).unwrap();
          toast.success(`Supplier "${sup.name}" ${action}d successfully`);
        }
        catch (err) { toast.error(err.data?.message || 'Failed to toggle status'); }
        setConfirmModal({ isOpen: false });
      }
    });
  };

  const handleDelete = async (sup) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Supplier',
      message: `Are you sure you want to permanently delete ${sup.name}? This action cannot be undone.`,
      variant: 'danger',
      action: async () => {
        try {
          await deleteSupplier(sup._id).unwrap();
          toast.success(`Supplier "${sup.name}" deleted successfully`);
        } catch (err) {
          toast.error(err.data?.message || 'Failed to delete supplier');
        }
        setConfirmModal({ isOpen: false });
      }
    });
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-electric w-12 h-12" /></div>;

  const suppliers = data?.data || [];
  const pagination = { page: data?.page || 1, pages: data?.pages || 1 };

  const renderStars = (rating) => (
    <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} className={`w-3.5 h-3.5 ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />)}</div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight">Suppliers</h1>
          <p className="text-slate-500 mt-1">Manage vendor relationships and supplier information.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-electric hover:bg-electric-dark text-white px-5 py-2.5 rounded-xl font-semibold flex items-center transition-colors shadow-sm">
          <Plus className="w-5 h-5 mr-2" /> Add Supplier
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input type="text" placeholder="Search by name or code..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric transition-all text-sm" />
          </div>
        </div>

        <div className="overflow-x-auto">
          {suppliers.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <Truck className="w-16 h-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-800 mb-2">No suppliers found</h3>
              <button onClick={() => handleOpenModal()} className="text-electric font-semibold hover:text-electric-dark">+ Add a new supplier</button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                  <th className="p-4 px-6">Supplier</th>
                  <th className="p-4 px-6">Code</th>
                  <th className="p-4 px-6">Contact</th>
                  <th className="p-4 px-6">Rating</th>
                  <th className="p-4 px-6 text-center">Status</th>
                  <th className="p-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.map(sup => (
                  <tr key={sup._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4 px-6">
                      <Link to={`/admin/suppliers/${sup._id}`} className="font-bold text-slate-900 hover:text-electric transition-colors">{sup.name}</Link>
                      <div className="text-xs text-slate-500">{sup.contactPerson}</div>
                    </td>
                    <td className="p-4 px-6 font-mono text-sm text-slate-500">{sup.code}</td>
                    <td className="p-4 px-6">
                      <div className="text-sm text-slate-800">{sup.email}</div>
                      <div className="text-xs text-slate-500">{sup.phone}</div>
                    </td>
                    <td className="p-4 px-6">{renderStars(sup.rating)}</td>
                    <td className="p-4 px-6 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold leading-none border ${sup.isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {sup.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(sup)} className="p-2 text-slate-400 hover:text-electric hover:bg-electric/10 rounded-lg transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleToggle(sup)} className={`p-2 rounded-lg transition-colors ${sup.isActive ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`} title={sup.isActive ? 'Deactivate' : 'Activate'}>
                          {sup.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleDelete(sup)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
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
            <span className="text-sm text-slate-500 font-medium">Page <span className="text-slate-900">{pagination.page}</span> of <span className="text-slate-900">{pagination.pages}</span></span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Supplier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
            <div className="px-8 py-6 flex justify-between items-center border-b border-slate-100">
              <h2 className="text-xl font-heading font-extrabold text-slate-900">{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-slate-800 mb-1.5">Name*</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric" /></div>
                <div><label className="block text-sm font-bold text-slate-800 mb-1.5">Code*</label>
                  <input type="text" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric uppercase" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-slate-800 mb-1.5">Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric" /></div>
                <div><label className="block text-sm font-bold text-slate-800 mb-1.5">Phone</label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric" /></div>
              </div>
              <div><label className="block text-sm font-bold text-slate-800 mb-1.5">Contact Person</label>
                <input type="text" value={formData.contactPerson} onChange={(e) => setFormData({...formData, contactPerson: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-slate-800 mb-1.5">Payment Terms</label>
                  <select value={formData.paymentTerms} onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric">
                    <option>Net 15</option><option>Net 30</option><option>Net 45</option><option>Net 60</option><option>Due on Receipt</option>
                  </select></div>
                <div><label className="block text-sm font-bold text-slate-800 mb-1.5">Rating</label>
                  <select value={formData.rating} onChange={(e) => setFormData({...formData, rating: Number(e.target.value)})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric">
                    {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>)}
                  </select></div>
              </div>
              <div className="pt-2 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
                <button type="submit" disabled={isCreating || isUpdating} className="flex-[1.5] py-3.5 bg-electric hover:bg-electric-dark text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-70">
                  {isCreating || isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} {editingSupplier ? 'Update' : 'Save'}
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
          confirmText="Yes, Proceed"
          cancelText="Cancel"
          variant={confirmModal.variant}
        />
      )}
    </div>
  );
};

export default SuppliersList;
