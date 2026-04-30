import React, { useState } from 'react';
import { 
  useGetDeliveryTripsQuery,
  useGetVehiclesQuery,
  useGetStaffQuery,
  useCreateDeliveryTripMutation, 
  useUpdateDeliveryTripMutation, 
  useDeleteDeliveryTripMutation 
} from '../../../features/api/adminApiSlice';
import { Loader2, Plus, Pencil, Trash2, Navigation, X, Save } from 'lucide-react';

const TripsTab = () => {
  const { data: tripsData, isLoading } = useGetDeliveryTripsQuery();
  const { data: vehiclesData } = useGetVehiclesQuery({ page: 1 });
  const { data: staffData } = useGetStaffQuery({ page: 1, role: 'driver' });
  
  const [createTrip, { isLoading: isCreating }] = useCreateDeliveryTripMutation();
  const [updateTrip, { isLoading: isUpdating }] = useUpdateDeliveryTripMutation();
  const [deleteTrip] = useDeleteDeliveryTripMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const todayStr = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    vehicle: '', driver: '', plannedDate: todayStr, plannedStartTime: '09:00', plannedEndTime: '12:00', status: 'planned'
  });

  const trips = tripsData?.data || [];
  const vehicles = (vehiclesData?.data || []).filter(v => v.status !== 'retired');
  const staffs = staffData?.data || [];

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        vehicle: item.vehicle?._id || '',
        driver: item.driver?._id || '',
        plannedDate: item.plannedDate ? new Date(item.plannedDate).toISOString().split('T')[0] : todayStr,
        plannedStartTime: item.plannedStartTime || '09:00',
        plannedEndTime: item.plannedEndTime || '12:00',
        status: item.status || 'planned'
      });
    } else {
      setEditingItem(null);
      setFormData({ vehicle: '', driver: '', plannedDate: todayStr, plannedStartTime: '09:00', plannedEndTime: '12:00', status: 'planned' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateTrip({ id: editingItem._id, ...formData }).unwrap();
      } else {
        await createTrip(formData).unwrap();
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err.data?.message || 'Failed to save trip');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to permanently delete this trip?`)) {
      try {
        await deleteTrip(id).unwrap();
      } catch (err) {
        alert(err.data?.message || 'Failed to delete trip');
      }
    }
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-electric" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => handleOpenModal()} className="bg-electric hover:bg-electric-dark text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center transition-colors">
          <Plus className="w-4 h-4 mr-2" /> Add Trip
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
              <th className="p-4">Trip Code</th>
              <th className="p-4">Vehicle</th>
              <th className="p-4">Driver</th>
              <th className="p-4">Planned Date</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {trips.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-slate-500">No trips found.</td></tr>
            ) : trips.map(item => (
              <tr key={item._id} className="hover:bg-slate-50 group">
                <td className="p-4 font-bold text-slate-900 text-sm">{item.tripCode || item._id.substring(0, 8)}</td>
                <td className="p-4 text-slate-600">{item.vehicle?.registrationNumber || '-'}</td>
                <td className="p-4 text-slate-600">{item.driver?.name || '-'}</td>
                <td className="p-4 text-slate-600">{item.plannedDate ? new Date(item.plannedDate).toLocaleDateString() : '-'}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                    item.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 
                    item.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                    'bg-slate-100 text-slate-600'
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
              <h2 className="text-xl font-heading font-extrabold text-slate-900">{editingItem ? 'Edit Trip' : 'Create Trip'}</h2>
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
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Driver*</label>
                  <select required value={formData.driver} onChange={e => setFormData({...formData, driver: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50">
                    <option value="">Select Driver</option>
                    {staffs.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-bold text-slate-800 mb-1.5">Planned Date*</label>
                   <input type="date" required value={formData.plannedDate} onChange={e => setFormData({...formData, plannedDate: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Status</label>
                  <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50">
                    <option value="planned">Planned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Planned Start Time</label>
                  <input type="time" value={formData.plannedStartTime} onChange={e => setFormData({...formData, plannedStartTime: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Planned End Time</label>
                  <input type="time" value={formData.plannedEndTime} onChange={e => setFormData({...formData, plannedEndTime: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50" />
                </div>
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

export default TripsTab;
