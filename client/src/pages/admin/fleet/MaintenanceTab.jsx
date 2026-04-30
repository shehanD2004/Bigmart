import React, { useState } from 'react';
import { 
  useGetMaintenanceLogsQuery,
  useGetVehiclesQuery,
  useCreateMaintenanceLogMutation, 
  useUpdateMaintenanceLogMutation, 
  useDeleteMaintenanceLogMutation 
} from '../../../features/api/adminApiSlice';
import { Loader2, Plus, Pencil, Trash2, PenTool, X, Save } from 'lucide-react';

const MaintenanceTab = () => {
  const { data: maintenanceData, isLoading } = useGetMaintenanceLogsQuery();
  const { data: vehiclesData } = useGetVehiclesQuery({ page: 1 });
  
  const [createMaintenance, { isLoading: isCreating }] = useCreateMaintenanceLogMutation();
  const [updateMaintenance, { isLoading: isUpdating }] = useUpdateMaintenanceLogMutation();
  const [deleteMaintenance] = useDeleteMaintenanceLogMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const todayStr = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    vehicle: '', type: 'service', description: '', cost: '', vendor: '', 
    scheduledDate: todayStr, status: 'scheduled'
  });

  const maintenance = maintenanceData?.data || [];
  const vehicles = (vehiclesData?.data || []).filter(v => v.status !== 'retired');

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        vehicle: item.vehicle?._id || '',
        type: item.type || 'service',
        description: item.description || '',
        cost: item.cost || '',
        vendor: item.vendor || '',
        scheduledDate: item.scheduledDate ? new Date(item.scheduledDate).toISOString().split('T')[0] : todayStr,
        status: item.status || 'scheduled'
      });
    } else {
      setEditingItem(null);
      setFormData({ vehicle: '', type: 'service', description: '', cost: '', vendor: '', scheduledDate: todayStr, status: 'scheduled' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateMaintenance({ id: editingItem._id, ...formData }).unwrap();
      } else {
        await createMaintenance(formData).unwrap();
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err.data?.message || 'Failed to save maintenance log');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to permanently delete this maintenance log?`)) {
      try {
        await deleteMaintenance(id).unwrap();
      } catch (err) {
        alert(err.data?.message || 'Failed to delete maintenance log');
      }
    }
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-electric" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => handleOpenModal()} className="bg-electric hover:bg-electric-dark text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center transition-colors">
          <Plus className="w-4 h-4 mr-2" /> Add Record
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
              <th className="p-4">Vehicle</th>
              <th className="p-4">Date</th>
              <th className="p-4">Cost</th>
              <th className="p-4">Description</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {maintenance.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-slate-500">No maintenance records found.</td></tr>
            ) : maintenance.map(item => (
              <tr key={item._id} className="hover:bg-slate-50 group">
                <td className="p-4 font-bold text-slate-900">{item.vehicle?.registrationNumber || '-'}</td>
                <td className="p-4 text-slate-600">{new Date(item.scheduledDate || item.completedDate || item.createdAt).toLocaleDateString()}</td>
                <td className="p-4 text-slate-600">Rs. {item.cost?.toFixed(2) || '0.00'}</td>
                <td className="p-4 text-slate-600 max-w-[200px] truncate" title={item.description}>{item.description || '-'}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                    item.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(item)} className="p-2 text-slate-400 hover:text-electric hover:bg-electric/10 rounded-lg transition-colors" title="Edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
            <div className="px-8 py-6 flex justify-between items-center border-b border-slate-100">
              <h2 className="text-xl font-heading font-extrabold text-slate-900">{editingItem ? 'Edit Maintenance Record' : 'Log Maintenance'}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Vehicle*</label>
                  <select required value={formData.vehicle} onChange={e => setFormData({...formData, vehicle: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50">
                    <option value="">Select Vehicle</option>
                    {vehicles.map(v => <option key={v._id} value={v._id}>{v.registrationNumber}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Type</label>
                  <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50">
                    <option value="service">Service</option>
                    <option value="repair">Repair</option>
                    <option value="fuel">Fuel</option>
                    <option value="inspection">Inspection</option>
                    <option value="tire">Tire Replacement</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-bold text-slate-800 mb-1.5">Scheduled Date*</label>
                   <input type="date" required value={formData.scheduledDate} onChange={e => setFormData({...formData, scheduledDate: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Status</label>
                  <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50">
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Cost ($)</label>
                  <input type="number" step="0.01" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Vendor/Shop Name</label>
                  <input type="text" value={formData.vendor} onChange={e => setFormData({...formData, vendor: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">Description</label>
                <textarea rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50"></textarea>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
                <button type="submit" disabled={isCreating || isUpdating} className="flex-[1.5] py-3 bg-electric hover:bg-electric-dark text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-70">
                  {isCreating || isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceTab;
