import React, { useState } from 'react';
import { 
  useGetVehiclesQuery, 
  useCreateVehicleMutation, 
  useUpdateVehicleMutation, 
  useDeleteVehicleMutation 
} from '../../../features/api/adminApiSlice';
import { Loader2, Plus, Pencil, Ban, CheckCircle, Navigation, X, Save } from 'lucide-react';

const VehiclesTab = () => {
  const { data: vehiclesData, isLoading } = useGetVehiclesQuery({ page: 1 });
  const [createVehicle, { isLoading: isCreating }] = useCreateVehicleMutation();
  const [updateVehicle, { isLoading: isUpdating }] = useUpdateVehicleMutation();
  const [deleteVehicle] = useDeleteVehicleMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    registrationNumber: '', make: '', model: '', year: '', type: 'van', status: 'available'
  });

  const vehicles = vehiclesData?.data || [];

  const handleOpenModal = (vehicle = null) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        registrationNumber: vehicle.registrationNumber,
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year || '',
        type: vehicle.type || 'van',
        status: vehicle.status || 'available'
      });
    } else {
      setEditingVehicle(null);
      setFormData({ registrationNumber: '', make: '', model: '', year: '', type: 'van', status: 'available' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVehicle) {
        await updateVehicle({ id: editingVehicle._id, ...formData }).unwrap();
      } else {
        await createVehicle(formData).unwrap();
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err.data?.message || 'Failed to save vehicle');
    }
  };

  const handleToggleStatus = async (vehicle) => {
    const newStatus = vehicle.status === 'retired' ? 'available' : 'retired';
    if (window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
      try {
        await updateVehicle({ id: vehicle._id, status: newStatus }).unwrap();
      } catch (err) {
        alert(err.data?.message || 'Failed to update vehicle status');
      }
    }
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-electric" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => handleOpenModal()} className="bg-electric hover:bg-electric-dark text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center transition-colors">
          <Plus className="w-4 h-4 mr-2" /> Add Vehicle
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
              <th className="p-4">Registration</th>
              <th className="p-4">Make / Model</th>
              <th className="p-4">Type</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vehicles.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-slate-500">No vehicles found.</td></tr>
            ) : vehicles.map(item => (
              <tr key={item._id} className={`hover:bg-slate-50 group ${item.status === 'retired' ? 'opacity-70 grayscale' : ''}`}>
                <td className="p-4 font-bold text-slate-900">{item.registrationNumber}</td>
                <td className="p-4 text-slate-600">{item.make} {item.model}</td>
                <td className="p-4 text-slate-600 capitalize">{item.type}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                    item.status === 'available' ? 'bg-emerald-100 text-emerald-700' :
                    item.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                    item.status === 'maintenance' ? 'bg-amber-100 text-amber-700' :
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
                    <button onClick={() => handleToggleStatus(item)} className={`p-2 rounded-lg transition-colors ${item.status !== 'retired' ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`} title={item.status !== 'retired' ? 'Retire' : 'Reactivate'}>
                      {item.status !== 'retired' ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
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
              <h2 className="text-xl font-heading font-extrabold text-slate-900">{editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">Registration Number*</label>
                <input type="text" required value={formData.registrationNumber} onChange={e => setFormData({...formData, registrationNumber: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Make</label>
                  <input type="text" value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Model</label>
                  <input type="text" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Year</label>
                  <input type="number" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50">
                    <option value="truck">Truck</option>
                    <option value="van">Van</option>
                    <option value="bike">Bike</option>
                    <option value="car">Car</option>
                    <option value="motorcycle">Motorcycle</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50">
                  <option value="available">Available</option>
                  <option value="assigned">Assigned</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="retired">Retired</option>
                </select>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
                <button type="submit" disabled={isCreating || isUpdating} className="flex-[1.5] py-3 bg-electric hover:bg-electric-dark text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-70">
                  {isCreating || isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} {editingVehicle ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiclesTab;
