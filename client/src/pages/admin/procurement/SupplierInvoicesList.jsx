import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  useGetSupplierInvoicesQuery,
  useGetSuppliersQuery,
  useCreateSupplierInvoiceMutation,
  useUpdateInvoiceStatusMutation,
  useDeleteSupplierInvoiceMutation,
} from '../../../features/api/adminApiSlice';
import {
  FileText, Plus, Loader2, ChevronLeft, ChevronRight,
  Trash2, X, Save, DollarSign, CheckCircle, Clock, AlertCircle,
} from 'lucide-react';
import ConfirmModal from '../../../components/ConfirmModal';

const STATUS_COLORS = {
  draft:          'bg-slate-100 text-slate-700 border-slate-200',
  sent:           'bg-blue-100 text-blue-700 border-blue-200',
  overdue:        'bg-rose-100 text-rose-700 border-rose-200',
  paid:           'bg-emerald-100 text-emerald-700 border-emerald-200',
  partially_paid: 'bg-amber-100 text-amber-700 border-amber-200',
  voided:         'bg-slate-100 text-slate-400 border-slate-200',
};

const VALID_TRANSITIONS = {
  draft:          ['sent', 'voided'],
  sent:           ['overdue', 'partially_paid', 'paid', 'voided'],
  overdue:        ['partially_paid', 'paid', 'voided'],
  partially_paid: ['paid', 'overdue', 'voided'],
};

const TRANSITION_LABELS = {
  sent:           { label: 'Mark as Sent',       cls: 'bg-blue-600 text-white hover:bg-blue-700' },
  overdue:        { label: 'Mark Overdue',        cls: 'bg-rose-500 text-white hover:bg-rose-600' },
  partially_paid: { label: 'Mark Partially Paid', cls: 'bg-amber-500 text-white hover:bg-amber-600' },
  paid:           { label: 'Mark as Paid',        cls: 'bg-emerald-600 text-white hover:bg-emerald-700' },
  voided:         { label: 'Void Invoice',        cls: 'bg-slate-200 text-slate-700 hover:bg-slate-300' },
};

const SupplierInvoicesList = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payModal, setPayModal] = useState(null); // { invoice, newStatus }
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', action: null, variant: 'primary' });

  const [form, setForm] = useState({
    invoiceNumber: '', supplier: '', purchaseOrder: '',
    amount: '', taxAmount: 0, totalAmount: '',
    dueDate: '', currency: 'LKR', notes: '',
  });

  const [payForm, setPayForm] = useState({ paymentMethod: 'bank_transfer', paidDate: new Date().toISOString().slice(0, 10) });

  const { data, isLoading } = useGetSupplierInvoicesQuery({ page, status: statusFilter, supplier: supplierFilter });
  const { data: suppliersData } = useGetSuppliersQuery({ isActive: true });
  const [createInvoice, { isLoading: isCreating }] = useCreateSupplierInvoiceMutation();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateInvoiceStatusMutation();
  const [deleteInvoice] = useDeleteSupplierInvoiceMutation();

  const invoices  = data?.data || [];
  const pagination = { page: data?.page || 1, pages: data?.pages || 1 };
  const suppliers = suppliersData?.data || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.invoiceNumber.trim()) { toast.warning('Invoice number is required'); return; }
    if (!form.supplier) { toast.warning('Please select a supplier'); return; }
    if (Number(form.amount) <= 0) { toast.warning('Amount must be greater than zero'); return; }
    try {
      await createInvoice({
        ...form,
        amount: Number(form.amount),
        taxAmount: Number(form.taxAmount) || 0,
        totalAmount: Number(form.totalAmount),
      }).unwrap();
      toast.success(`Invoice "${form.invoiceNumber}" created successfully`);
      setIsModalOpen(false);
      setForm({ invoiceNumber: '', supplier: '', purchaseOrder: '', amount: '', taxAmount: 0, totalAmount: '', dueDate: '', currency: 'LKR', notes: '' });
    } catch (err) { toast.error(err.data?.message || 'Failed to create invoice'); }
  };

  const handleStatusChange = async (invoice, newStatus) => {
    if (newStatus === 'paid' || newStatus === 'partially_paid') {
      setPayModal({ invoice, newStatus });
      return;
    }
    
    setConfirmModal({
      isOpen: true,
      title: 'Update Invoice Status',
      message: `Are you sure you want to mark invoice ${invoice.invoiceNumber} as "${newStatus.replace(/_/g, ' ').toUpperCase()}"?`,
      variant: newStatus === 'voided' ? 'danger' : 'primary',
      action: async () => {
        try {
          await updateStatus({ id: invoice._id, status: newStatus }).unwrap();
          toast.success(`Invoice ${invoice.invoiceNumber} successfully marked as "${newStatus}"`);
        } catch (err) { toast.error(err.data?.message || 'Failed to update status'); }
        setConfirmModal({ isOpen: false });
      }
    });
  };

  const handlePaySubmit = async () => {
    try {
      await updateStatus({ id: payModal.invoice._id, status: payModal.newStatus, ...payForm }).unwrap();
      toast.success(`Payment recorded for invoice ${payModal.invoice.invoiceNumber}`);
      setPayModal(null);
    } catch (err) { toast.error(err.data?.message || 'Failed to record payment'); }
  };

  const handleDelete = async (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Invoice',
      message: 'Are you sure you want to permanently delete this invoice?',
      variant: 'danger',
      action: async () => {
        try {
          await deleteInvoice(id).unwrap();
          toast.success('Invoice deleted successfully');
        } catch (err) { toast.error(err.data?.message || 'Failed to delete invoice'); }
        setConfirmModal({ isOpen: false });
      }
    });
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-electric w-10 h-10" /></div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight">Supplier Invoices</h1>
          <p className="text-slate-500 mt-1">Track and manage supplier payment invoices.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-electric hover:bg-electric-dark text-white px-5 py-2.5 rounded-xl font-semibold flex items-center transition-colors shadow-sm">
          <Plus className="w-5 h-5 mr-2" /> New Invoice
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Filters */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 bg-slate-50">
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 text-sm w-full sm:w-48">
            <option value="">All Statuses</option>
            {['draft', 'sent', 'overdue', 'paid', 'partially_paid', 'voided'].map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ').charAt(0).toUpperCase() + s.replace(/_/g, ' ').slice(1)}</option>
            ))}
          </select>
          <select value={supplierFilter} onChange={e => { setSupplierFilter(e.target.value); setPage(1); }}
            className="p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 text-sm w-full sm:w-56">
            <option value="">All Suppliers</option>
            {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          {invoices.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <FileText className="w-16 h-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-800 mb-2">No invoices found</h3>
              <p className="text-slate-500">Create your first invoice to track supplier payments.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                  <th className="p-4 px-6">Invoice #</th>
                  <th className="p-4 px-6">Supplier</th>
                  <th className="p-4 px-6">Amount</th>
                  <th className="p-4 px-6">Due Date</th>
                  <th className="p-4 px-6">Status</th>
                  <th className="p-4 px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map(inv => {
                  const transitions = VALID_TRANSITIONS[inv.status] || [];
                  const isOverdue = inv.status === 'sent' && inv.dueDate && new Date() > new Date(inv.dueDate);
                  return (
                    <tr key={inv._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="p-4 px-6">
                        <div className="font-bold text-slate-900 text-sm">{inv.invoiceNumber}</div>
                        {inv.purchaseOrder?.poNumber && (
                          <div className="text-xs text-slate-500 font-mono">PO: {inv.purchaseOrder.poNumber}</div>
                        )}
                      </td>
                      <td className="p-4 px-6">
                        <div className="text-sm font-medium text-slate-800">{inv.supplier?.name || '—'}</div>
                        <div className="text-xs text-slate-500 font-mono">{inv.supplier?.code}</div>
                      </td>
                      <td className="p-4 px-6">
                        <div className="font-bold text-slate-900">Rs. {inv.totalAmount?.toFixed(2)}</div>
                        {inv.taxAmount > 0 && <div className="text-xs text-slate-500">Tax: ${inv.taxAmount?.toFixed(2)}</div>}
                      </td>
                      <td className="p-4 px-6">
                        <div className={`text-sm font-medium ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
                          {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}
                          {isOverdue && <span className="ml-1 text-xs">(Overdue)</span>}
                        </div>
                        {inv.paidDate && <div className="text-xs text-emerald-600">Paid: {new Date(inv.paidDate).toLocaleDateString()}</div>}
                      </td>
                      <td className="p-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[inv.status] || 'bg-slate-100'}`}>
                          {inv.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-4 px-6">
                        <div className="flex items-center gap-2 flex-wrap">
                          {transitions.map(t => {
                            const cfg = TRANSITION_LABELS[t] || { label: t, cls: 'bg-slate-100 text-slate-700' };
                            return (
                              <button key={t} onClick={() => handleStatusChange(inv, t)} disabled={isUpdating}
                                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors disabled:opacity-60 ${cfg.cls}`}>
                                {cfg.label}
                              </button>
                            );
                          })}
                          <button onClick={() => handleDelete(inv._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {pagination.pages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
            <span className="text-sm text-slate-500">Page <span className="text-slate-900">{pagination.page}</span> of <span className="text-slate-900">{pagination.pages}</span></span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Create Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300 max-h-[90vh] flex flex-col">
            <div className="px-8 py-6 flex justify-between items-center border-b border-slate-100 shrink-0">
              <h2 className="text-xl font-heading font-extrabold text-slate-900">New Invoice</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Invoice Number*</label>
                  <input type="text" value={form.invoiceNumber} onChange={e => setForm(f => ({ ...f, invoiceNumber: e.target.value }))} required
                    placeholder="e.g. INV-2024-001"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Supplier*</label>
                  <select value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50">
                    <option value="">Select supplier...</option>
                    {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Amount*</label>
                  <input type="number" step="0.01" min="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Tax Amount</label>
                  <input type="number" step="0.01" min="0" value={form.taxAmount} onChange={e => setForm(f => ({ ...f, taxAmount: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Total Amount*</label>
                  <input type="number" step="0.01" min="0.01"
                    value={form.totalAmount || (Number(form.amount || 0) + Number(form.taxAmount || 0)) || ''}
                    onChange={e => setForm(f => ({ ...f, totalAmount: e.target.value }))} required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Currency</label>
                  <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50">
                    {['LKR', 'USD', 'EUR', 'GBP', 'INR', 'CAD'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 text-sm resize-none" />
              </div>
              <div className="pt-2 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl">Cancel</button>
                <button type="submit" disabled={isCreating} className="flex-[1.5] py-3.5 bg-electric hover:bg-electric-dark text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-70">
                  {isCreating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
            <div className="px-8 py-6 flex justify-between items-center border-b border-slate-100">
              <h2 className="text-lg font-heading font-extrabold text-slate-900">Record Payment</h2>
              <button onClick={() => setPayModal(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={18} /></button>
            </div>
            <div className="p-8 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">Payment Method</label>
                <select value={payForm.paymentMethod} onChange={e => setPayForm(f => ({ ...f, paymentMethod: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50">
                  {['bank_transfer', 'check', 'credit_card', 'cash', 'wire_transfer'].map(m => (
                    <option key={m} value={m}>{m.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">Payment Date</label>
                <input type="date" value={payForm.paidDate} onChange={e => setPayForm(f => ({ ...f, paidDate: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50" />
              </div>
              <div className="flex gap-4 pt-2">
                <button onClick={() => setPayModal(null)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl">Cancel</button>
                <button onClick={handlePaySubmit} disabled={isUpdating}
                  className="flex-[1.5] py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-70">
                  {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />} Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmModal.isOpen && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, action: null })}
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

export default SupplierInvoicesList;
