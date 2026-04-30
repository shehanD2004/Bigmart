import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Ban, CheckCircle, Loader2, Save, X } from 'lucide-react';
import {
  useGetWarehousesQuery,
  useGetWarehouseQuery,
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
} from '../../features/api/adminApiSlice';

const WAREHOUSE_TYPES = ['warehouse', 'shelf', 'zone', 'bin'];

const WarehousesList = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'warehouse',
    address: { street: '', city: '', state: '', zip: '', country: 'US' },
    capacity: 0,
    managerName: '',
    phone: '',
    notes: '',
  });

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 450);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { data, isLoading, isError, error } = useGetWarehousesQuery({ page, search: debouncedSearch });
  const [createWarehouse, { isLoading: isCreating }] = useCreateWarehouseMutation();
  const [updateWarehouse, { isLoading: isUpdating }] = useUpdateWarehouseMutation();

  const warehouses = data?.data || [];
  const pagination = { page: data?.page || 1, pages: data?.pages || 1 };

  const openModal = (warehouse = null) => {
    if (warehouse) {
      setEditingWarehouse(warehouse);
      setFormData({
        name: warehouse.name || '',
        code: warehouse.code || '',
        type: warehouse.type || 'warehouse',
        address: {
          street: warehouse.address?.street || '',
          city: warehouse.address?.city || '',
          state: warehouse.address?.state || '',
          zip: warehouse.address?.zip || '',
          country: warehouse.address?.country || 'US',
        },
        capacity: warehouse.capacity || 0,
        managerName: warehouse.managerName || '',
        phone: warehouse.phone || '',
        notes: warehouse.notes || '',
      });
    } else {
      setEditingWarehouse(null);
      setFormData({
        name: '',
        code: '',
        type: 'warehouse',
        address: { street: '', city: '', state: '', zip: '', country: 'US' },
        capacity: 0,
        managerName: '',
        phone: '',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingWarehouse) {
        await updateWarehouse({ id: editingWarehouse._id, ...formData }).unwrap();
      } else {
        await createWarehouse(formData).unwrap();
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err?.data?.message || 'Failed to save warehouse');
    }
  };

  const handleToggleStatus = async (warehouse) => {
    if (!warehouse) return;
    const action = warehouse.isActive ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} warehouse ${warehouse.name}?`)) return;
    try {
      await updateWarehouse({ id: warehouse._id, isActive: !warehouse.isActive }).unwrap();
    } catch (err) {
      alert(err?.data?.message || 'Failed to update status');
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-electric w-12 h-12" /></div>;
  if (isError) return <div className="text-red-600">Error: {error?.data?.message || 'Unable to load warehouses'}</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-400 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight">Warehouses</h1>
          <p className="text-slate-500 mt-1">Manage stock locations and movement points.</p>
        </div>
        <button onClick={() => openModal()} className="bg-electric hover:bg-electric-dark text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-colors shadow-sm">
          <Plus className="w-5 h-5" /> Add Warehouse
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search warehouses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {warehouses.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No warehouses found.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                  <th className="p-4 px-6">Name</th>
                  <th className="p-4 px-6">Code</th>
                  <th className="p-4 px-6">Type</th>
                  <th className="p-4 px-6">Capacity</th>
                  <th className="p-4 px-6">Manager</th>
                  <th className="p-4 px-6 text-center">Status</th>
                  <th className="p-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {warehouses.map((warehouse) => (
                  <tr key={warehouse._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4 px-6">
                      <div className="font-bold text-slate-900">{warehouse.name}</div>
                      <div className="text-xs text-slate-400">{warehouse.address?.city || ''} {warehouse.address?.state ? `, ${warehouse.address.state}` : ''}</div>
                    </td>
                    <td className="p-4 px-6 font-mono text-sm text-slate-500">{warehouse.code}</td>
                    <td className="p-4 px-6 text-sm text-slate-600">{warehouse.type}</td>
                    <td className="p-4 px-6 text-sm text-slate-600">{warehouse.capacity || '—'}</td>
                    <td className="p-4 px-6 text-sm text-slate-600">{warehouse.managerName || '—'}</td>
                    <td className="p-4 px-6 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold leading-none border ${warehouse.isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {warehouse.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal(warehouse)} className="p-2 text-slate-400 hover:text-electric hover:bg-electric/10 rounded-lg transition-colors" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleToggleStatus(warehouse)} className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors" title="Toggle status">
                          {warehouse.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
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
            <span className="text-sm text-slate-500 font-medium">Page <span className="text-slate-900">{pagination.page}</span> of <span className="text-slate-900">{pagination.pages}</span></span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">Prev</button>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
            <div className="px-8 py-6 flex justify-between items-center border-b border-slate-100">
              <h2 className="text-xl font-heading font-extrabold text-slate-900">{editingWarehouse ? 'Edit Warehouse' : 'Add Warehouse'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Name*</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Code*</label>
                  <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric">
                    {WAREHOUSE_TYPES.map(type => <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Capacity</label>
                  <input type="number" min="0" value={formData.capacity} onChange={e => setFormData({...formData, capacity: Number(e.target.value)})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Manager</label>
                  <input type="text" value={formData.managerName} onChange={e => setFormData({...formData, managerName: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Phone</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Street</label>
                  <input type="text" value={formData.address.street} onChange={e => setFormData({...formData, address: {...formData.address, street: e.target.value}})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">City</label>
                  <input type="text" value={formData.address.city} onChange={e => setFormData({...formData, address: {...formData.address, city: e.target.value}})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">State</label>
                  <input type="text" value={formData.address.state} onChange={e => setFormData({...formData, address: {...formData.address, state: e.target.value}})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Zip</label>
                  <input type="text" value={formData.address.zip} onChange={e => setFormData({...formData, address: {...formData.address, zip: e.target.value}})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Country</label>
                  <input type="text" value={formData.address.country} onChange={e => setFormData({...formData, address: {...formData.address, country: e.target.value}})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">Notes</label>
                <textarea rows="3" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric" />
              </div>

              <div className="pt-2 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
                <button type="submit" disabled={isCreating || isUpdating} className="flex-[1.5] py-3.5 bg-electric hover:bg-electric-dark text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-70">
                  {isCreating || isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} {editingWarehouse ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehousesList;
