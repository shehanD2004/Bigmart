import React, { useState } from 'react';
import { 
  useGetStaffQuery, 
  useCreateStaffMutation, 
  useUpdateStaffMutation, 
  useDeleteStaffMutation 
} from '../../../features/api/adminApiSlice';
import { Loader2, Plus, Pencil, Ban, CheckCircle, Users, X, Save } from 'lucide-react';

const StaffTab = () => {
  const { data: staffData, isLoading } = useGetStaffQuery({ page: 1 });
  const [createStaff, { isLoading: isCreating }] = useCreateStaffMutation();
  const [updateStaff, { isLoading: isUpdating }] = useUpdateStaffMutation();
  const [deleteStaff] = useDeleteStaffMutation(); // Technically a deactivate

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '', employeeId: '', role: 'driver', phone: '', email: '', isAvailable: true
  });

  const staff = staffData?.data || [];

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingStaff(item);
      setFormData({
        name: item.name || '',
        employeeId: item.employeeId || '',
        role: item.role || 'driver',
        phone: item.phone || '',
        email: item.email || '',
        isAvailable: item.isAvailable !== false
      });
    } else {
      setEditingStaff(null);
      setFormData({ name: '', employeeId: '', role: 'driver', phone: '', email: '', isAvailable: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        await updateStaff({ id: editingStaff._id, ...formData }).unwrap();
      } else {
        await createStaff(formData).unwrap();
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err.data?.message || 'Failed to save staff');
    }
  };

  const handleToggleActive = async (item) => {
    if (window.confirm(`Are you sure you want to deactivate ${item.name}?`)) {
      try {
        await deleteStaff(item._id).unwrap();
      } catch (err) {
        alert(err.data?.message || 'Failed to deactivate staff');
      }
    }
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-electric" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => handleOpenModal()} className="bg-electric hover:bg-electric-dark text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center transition-colors">
          <Plus className="w-4 h-4 mr-2" /> Add Staff
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
              <th className="p-4">Name</th>
              <th className="p-4">Employee ID</th>
              <th className="p-4">Role</th>
              <th className="p-4">Availability</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staff.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-slate-500">No staff found.</td></tr>
            ) : staff.map(item => (
              <tr key={item._id} className={`hover:bg-slate-50 group ${!item.isActive ? 'opacity-70 grayscale' : ''}`}>
                <td className="p-4 font-bold text-slate-900">{item.name || item.user?.name}</td>
                <td className="p-4 text-slate-600">{item.employeeId}</td>
                <td className="p-4 text-slate-600 capitalize">{item.role}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${item.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(item)} className="p-2 text-slate-400 hover:text-electric hover:bg-electric/10 rounded-lg transition-colors" title="Edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleToggleActive(item)} disabled={!item.isActive} className={`p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${item.isActive ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : ''}`} title="Deactivate">
                      <Ban className="w-4 h-4" />
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
              <h2 className="text-xl font-heading font-extrabold text-slate-900">{editingStaff ? 'Edit Staff' : 'Add Staff'}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Full Name*</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Employee ID*</label>
                  <input type="text" required value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Role</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50">
                    <option value="driver">Driver</option>
                    <option value="loader">Loader</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="dispatcher">Dispatcher</option>
                  </select>
                </div>
                <div>
                   <label className="block text-sm font-bold text-slate-800 mb-1.5">Available</label>
                   <select value={formData.isAvailable ? 'true' : 'false'} onChange={e => setFormData({...formData, isAvailable: e.target.value === 'true'})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50">
                     <option value="true">Yes</option>
                     <option value="false">No</option>
                   </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Phone</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50" />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
                <button type="submit" disabled={isCreating || isUpdating} className="flex-[1.5] py-3 bg-electric hover:bg-electric-dark text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-70">
                  {isCreating || isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} {editingStaff ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffTab;
