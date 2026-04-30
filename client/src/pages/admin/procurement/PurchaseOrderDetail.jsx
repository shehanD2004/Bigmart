import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  useGetPurchaseOrderQuery, useUpdatePOStatusMutation,
} from '../../../features/api/adminApiSlice';
import {
  ChevronLeft, Loader2, Clock, Package, Warehouse, User, FileText,
  Send, CheckCircle, Truck, XCircle, AlertCircle, Edit3, PackageCheck, ArrowRight,
} from 'lucide-react';
import ConfirmModal from '../../../components/ConfirmModal';

const VALID_TRANSITIONS = {
  draft: ['sent', 'cancelled'],
  sent: ['acknowledged', 'cancelled'],
  acknowledged: ['partially_received', 'received', 'cancelled'],
  partially_received: ['partially_received', 'received', 'cancelled'],
};

const STATUS_CONFIG = {
  draft: { color: 'bg-slate-100 text-slate-700 border-slate-300', icon: FileText, label: 'Draft' },
  sent: { color: 'bg-blue-100 text-blue-700 border-blue-300', icon: Send, label: 'Sent' },
  acknowledged: { color: 'bg-indigo-100 text-indigo-700 border-indigo-300', icon: CheckCircle, label: 'Acknowledged' },
  partially_received: { color: 'bg-amber-100 text-amber-700 border-amber-300', icon: Truck, label: 'Partially Received' },
  received: { color: 'bg-emerald-100 text-emerald-700 border-emerald-300', icon: PackageCheck, label: 'Received' },
  cancelled: { color: 'bg-rose-100 text-rose-700 border-rose-300', icon: XCircle, label: 'Cancelled' },
  closed: { color: 'bg-slate-100 text-slate-600 border-slate-300', icon: CheckCircle, label: 'Closed' },
};

const PurchaseOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetPurchaseOrderQuery(id);
  const [updateStatus, { isLoading: isUpdating }] = useUpdatePOStatusMutation();
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [receivedItems, setReceivedItems] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', action: null, variant: 'primary', withInput: false, inputDefault: '' });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-electric w-10 h-10" />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <AlertCircle className="w-16 h-16 text-rose-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Purchase Order Not Found</h2>
        <p className="text-slate-500 mb-6">The requested PO could not be loaded.</p>
        <button onClick={() => navigate('/admin/purchase-orders')} className="text-electric font-semibold hover:underline">
          ← Back to Purchase Orders
        </button>
      </div>
    );
  }

  const po = data.data;
  const statusCfg = STATUS_CONFIG[po.status] || STATUS_CONFIG.draft;
  const StatusIcon = statusCfg.icon;
  const transitions = VALID_TRANSITIONS[po.status] || [];

  const handleStatusUpdate = async (newStatus) => {
    // For receiving statuses, show the receive modal
    if (newStatus === 'partially_received' || newStatus === 'received') {
      setReceivedItems(po.items.map(item => ({
        itemId: item._id,
        productName: item.product?.name || item.description,
        sku: item.sku,
        orderedQty: item.orderedQty,
        alreadyReceived: item.receivedQty || 0,
        receivedQty: newStatus === 'received' ? (item.orderedQty - (item.receivedQty || 0)) : 0,
      })));
      setShowReceiveModal(true);
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Update PO Status',
      message: `Are you sure you want to mark this PO as "${newStatus.replace(/_/g, ' ').toUpperCase()}"?`,
      variant: newStatus === 'cancelled' ? 'danger' : 'primary',
      withInput: true,
      inputDefault: `Status updated to ${newStatus}`,
      action: async (note) => {
        try {
          await updateStatus({ id: po._id, status: newStatus, note }).unwrap();
          toast.success(`PO status updated to "${newStatus}"`);
        } catch (err) {
          toast.error(err.data?.message || 'Failed to update status');
        }
        setConfirmModal({ isOpen: false });
      }
    });
  };

  const handleReceiveSubmit = async () => {
    const itemsToReceive = receivedItems
      .filter(ri => ri.receivedQty > 0)
      .map(ri => ({ itemId: ri.itemId, receivedQty: ri.receivedQty }));

    if (itemsToReceive.length === 0) {
      toast.warning('Enter received quantities for at least one item');
      return;
    }

    const allFullyReceived = receivedItems.every(
      ri => (ri.alreadyReceived + ri.receivedQty) >= ri.orderedQty
    );

    try {
      await updateStatus({
        id: po._id,
        status: allFullyReceived ? 'received' : 'partially_received',
        note: 'Items received',
        receivedItems: itemsToReceive,
      }).unwrap();
      toast.success(allFullyReceived ? 'All items received — PO fully received!' : 'Items received — PO partially received');
      setShowReceiveModal(false);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to receive items');
    }
  };

  const getTransitionButton = (status) => {
    const configs = {
      sent: { icon: Send, label: 'Mark as Sent', cls: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200' },
      acknowledged: { icon: CheckCircle, label: 'Mark Acknowledged', cls: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200' },
      partially_received: { icon: Truck, label: 'Receive Items', cls: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200' },
      received: { icon: PackageCheck, label: 'Mark Fully Received', cls: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200' },
      cancelled: { icon: XCircle, label: 'Cancel PO', cls: 'bg-rose-100 hover:bg-rose-200 text-rose-700 shadow-rose-100' },
    };
    return configs[status] || { icon: ArrowRight, label: status, cls: 'bg-slate-100 text-slate-700' };
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <button onClick={() => navigate('/admin/purchase-orders')} className="inline-flex items-center text-sm text-slate-500 hover:text-electric mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Purchase Orders
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            {po.poNumber}
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${statusCfg.color}`}>
              <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
              {statusCfg.label}
            </span>
          </h1>
          <p className="text-slate-500 mt-1 flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Created {new Date(po.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            {po.createdBy && <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> by {po.createdBy.name}</span>}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {po.status === 'draft' && (
            <Link to={`/admin/purchase-orders/${po._id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-electric hover:text-electric transition-colors shadow-sm">
              <Edit3 className="w-4 h-4" /> Edit
            </Link>
          )}
        </div>
      </div>

      {/* Status Action Bar */}
      {transitions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Available Actions</h3>
          <div className="flex flex-wrap gap-3">
            {transitions.map(status => {
              const btn = getTransitionButton(status);
              const BtnIcon = btn.icon;
              return (
                <button key={status} onClick={() => handleStatusUpdate(status)} disabled={isUpdating}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all disabled:opacity-60 ${btn.cls}`}>
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <BtnIcon className="w-4 h-4" />}
                  {btn.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
            <Package className="w-4 h-4" /> Supplier
          </div>
          <p className="text-lg font-bold text-slate-900">{po.supplier?.name || 'Unknown'}</p>
          <p className="text-sm text-slate-500 font-mono">{po.supplier?.code}</p>
          {po.supplier?.email && <p className="text-sm text-slate-500 mt-1">{po.supplier.email}</p>}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
            <Warehouse className="w-4 h-4" /> Warehouse
          </div>
          <p className="text-lg font-bold text-slate-900">{po.warehouse?.name || 'Not assigned'}</p>
          <p className="text-sm text-slate-500 font-mono">{po.warehouse?.code}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
            <Clock className="w-4 h-4" /> Dates
          </div>
          <div className="space-y-1 text-sm">
            {po.expectedDeliveryDate && (
              <p><span className="text-slate-500">Expected:</span> <span className="font-semibold text-slate-800">{new Date(po.expectedDeliveryDate).toLocaleDateString()}</span></p>
            )}
            {po.actualDeliveryDate && (
              <p><span className="text-slate-500">Delivered:</span> <span className="font-semibold text-emerald-600">{new Date(po.actualDeliveryDate).toLocaleDateString()}</span></p>
            )}
            {!po.expectedDeliveryDate && !po.actualDeliveryDate && (
              <p className="text-slate-400 italic">No dates set</p>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="p-5 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">Line Items ({po.items?.length || 0})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-100">
                <th className="p-4 px-6">Product</th>
                <th className="p-4 px-6">SKU</th>
                <th className="p-4 px-6 text-center">Ordered</th>
                <th className="p-4 px-6 text-center">Received</th>
                <th className="p-4 px-6 text-right">Unit Cost</th>
                <th className="p-4 px-6 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {po.items?.map((item, i) => {
                const pct = item.orderedQty > 0 ? ((item.receivedQty || 0) / item.orderedQty * 100) : 0;
                return (
                  <tr key={item._id || i} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 px-6">
                      <p className="font-semibold text-slate-900 text-sm">{item.product?.name || item.description}</p>
                    </td>
                    <td className="p-4 px-6 text-sm text-slate-500 font-mono">{item.sku || '—'}</td>
                    <td className="p-4 px-6 text-center text-sm font-bold text-slate-900">{item.orderedQty}</td>
                    <td className="p-4 px-6 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-sm font-bold ${pct >= 100 ? 'text-emerald-600' : pct > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                          {item.receivedQty || 0}
                        </span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-amber-500' : 'bg-slate-200'}`}
                            style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 px-6 text-right text-sm text-slate-700">Rs. {item.unitCost?.toFixed(2)}</td>
                    <td className="p-4 px-6 text-right text-sm font-bold text-slate-900">Rs. {(item.orderedQty * item.unitCost).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pricing & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {po.notes && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Notes</h3>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{po.notes}</p>
          </div>
        )}

        <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-5 ${!po.notes ? 'md:col-span-2 md:max-w-sm md:ml-auto' : ''}`}>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Pricing Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-bold text-slate-800">Rs. {po.pricing?.subtotal?.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Tax</span><span className="text-slate-700">Rs. {po.pricing?.tax?.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Shipping</span><span className="text-slate-700">Rs. {po.pricing?.shipping?.toFixed(2)}</span></div>
            <div className="border-t border-slate-200 pt-2 flex justify-between">
              <span className="font-bold text-slate-900">Grand Total</span>
              <span className="text-xl font-extrabold text-electric">Rs. {po.pricing?.grandTotal?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Receive Modal */}
      {showReceiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-emerald-500" /> Receive Items
              </h2>
              <p className="text-sm text-slate-500 mt-1">Enter the quantity received for each item.</p>
            </div>
            <div className="p-6 overflow-y-auto max-h-[50vh] space-y-4">
              {receivedItems.map((ri, i) => {
                const remaining = ri.orderedQty - ri.alreadyReceived;
                return (
                  <div key={ri.itemId} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 text-sm">{ri.productName}</p>
                      <p className="text-xs text-slate-500">SKU: {ri.sku || '—'} · Ordered: {ri.orderedQty} · Already received: {ri.alreadyReceived} · Remaining: {remaining}</p>
                    </div>
                    <div className="w-28">
                      <label className="block text-xs font-bold text-slate-500 mb-1">Receive Qty</label>
                      <input type="number" min="0" max={remaining} value={ri.receivedQty}
                        onChange={(e) => {
                          const updated = [...receivedItems];
                          updated[i].receivedQty = Math.min(Number(e.target.value) || 0, remaining);
                          setReceivedItems(updated);
                        }}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm text-center font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-between items-center bg-slate-50">
              <button onClick={() => setShowReceiveModal(false)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors">
                Cancel
              </button>
              <div className="flex gap-3">
                <button onClick={() => {
                  setReceivedItems(receivedItems.map(ri => ({
                    ...ri,
                    receivedQty: ri.orderedQty - ri.alreadyReceived,
                  })));
                }} className="px-4 py-2.5 text-sm font-semibold bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors">
                  Fill All
                </button>
                <button onClick={handleReceiveSubmit} disabled={isUpdating}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 transition-colors disabled:opacity-60">
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <PackageCheck className="w-4 h-4" />}
                  Confirm Receiving
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
          withInput={confirmModal.withInput}
          inputDefault={confirmModal.inputDefault}
          isLoading={isUpdating}
        />
      )}
    </div>
  );
};

export default PurchaseOrderDetail;
