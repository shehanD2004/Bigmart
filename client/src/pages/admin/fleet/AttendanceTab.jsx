import React, { useState } from 'react';
import { 
  useGetAttendanceLogsQuery,
  useGetStaffQuery,
  useCreateAttendanceLogMutation, 
  useUpdateAttendanceLogMutation, 
  useDeleteAttendanceLogMutation 
} from '../../../features/api/adminApiSlice';
import { Loader2, Plus, Pencil, Trash2, Calendar, X, Save } from 'lucide-react';

const AttendanceTab = () => {
  const { data: attendanceData, isLoading } = useGetAttendanceLogsQuery();
  const { data: staffData } = useGetStaffQuery({ page: 1 });
  
  const [createAttendance, { isLoading: isCreating }] = useCreateAttendanceLogMutation();
  const [updateAttendance, { isLoading: isUpdating }] = useUpdateAttendanceLogMutation();
  const [deleteAttendance] = useDeleteAttendanceLogMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const todayStr = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    staff: '', date: todayStr, shiftType: 'morning', clockIn: '', clockOut: '', status: 'present'
  });

  const attendance = attendanceData?.data || [];
  const staffs = staffData?.data || [];

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        staff: item.staff?._id || '',
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : todayStr,
        shiftType: item.shiftType || 'morning',
        clockIn: item.clockIn || '',
        clockOut: item.clockOut || '',
        status: item.status || 'present'
      });
    } else {
      setEditingItem(null);
      setFormData({ staff: '', date: todayStr, shiftType: 'morning', clockIn: '', clockOut: '', status: 'present' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateAttendance({ id: editingItem._id, ...formData }).unwrap();
      } else {
        await createAttendance(formData).unwrap();
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err.data?.message || 'Failed to save attendance record');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to permanently delete this attendance record?`)) {
      try {
        await deleteAttendance(id).unwrap();
      } catch (err) {
        alert(err.data?.message || 'Failed to delete attendance record');
      }
    }
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-electric" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => handleOpenModal()} className="bg-electric hover:bg-electric-dark text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center transition-colors">
          <Plus className="w-4 h-4 mr-2" /> Log Attendance
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
              <th className="p-4">Staff</th>
              <th className="p-4">Date</th>
              <th className="p-4">Shift</th>
              <th className="p-4">Clock In</th>
              <th className="p-4">Clock Out</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {attendance.length === 0 ? (
              <tr><td colSpan="7" className="p-8 text-center text-slate-500">No attendance records found.</td></tr>
            ) : attendance.map(item => (
              <tr key={item._id} className="hover:bg-slate-50 group">
                <td className="p-4 font-bold text-slate-900">{item.staff?.name || '-'}</td>
                <td className="p-4 text-slate-600">{new Date(item.date).toLocaleDateString()}</td>
                <td className="p-4 text-slate-600 capitalize">{item.shiftType || '-'}</td>
                <td className="p-4 text-slate-600">{item.clockIn ? new Date(`1970-01-01T${item.clockIn}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</td>
                <td className="p-4 text-slate-600">{item.clockOut ? new Date(`1970-01-01T${item.clockOut}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                    item.status === 'present' ? 'bg-emerald-100 text-emerald-700' : 
                    item.status === 'absent' ? 'bg-rose-100 text-rose-700' :
                    item.status === 'late' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {item.status || 'present'}
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
              <h2 className="text-xl font-heading font-extrabold text-slate-900">{editingItem ? 'Edit Attendance' : 'Log Attendance'}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Staff Member*</label>
                  <select required value={formData.staff} onChange={e => setFormData({...formData, staff: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50">
                    <option value="">Select Staff</option>
                    {staffs.map(s => <option key={s._id} value={s._id}>{s.name} ({s.employeeId})</option>)}
                  </select>
                </div>
                <div>
                   <label className="block text-sm font-bold text-slate-800 mb-1.5">Date*</label>
                   <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Shift Type</label>
                  <select required value={formData.shiftType} onChange={e => setFormData({...formData, shiftType: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50">
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="night">Night</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Status</label>
                  <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50">
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="half_day">Half Day</option>
                    <option value="leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Clock In</label>
                  <input type="time" value={formData.clockIn} onChange={e => setFormData({...formData, clockIn: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Clock Out</label>
                  <input type="time" value={formData.clockOut} onChange={e => setFormData({...formData, clockOut: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50" />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
                <button type="submit" disabled={isCreating || isUpdating} className="flex-[1.5] py-3 bg-electric hover:bg-electric-dark text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-70">
                  {isCreating || isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} {editingItem ? 'Update' : 'Log Attendance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTab;
