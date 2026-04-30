import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  useGetSuppliersQuery, useGetSupplierProductsQuery,
  useGetWarehousesQuery, useGetPurchaseOrderQuery,
  useCreatePurchaseOrderMutation, useUpdatePurchaseOrderMutation,
  useGetAdminProductsQuery,
} from '../../../features/api/adminApiSlice';
import {
  ChevronLeft, Save, Plus, Trash2, Loader2, Package, Warehouse, Edit3,
} from 'lucide-react';

const PurchaseOrderForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [supplierId, setSupplierId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [items, setItems] = useState([]);
  const [tax, setTax] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [notes, setNotes] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [initialized, setInitialized] = useState(false);

  const { data: suppliersData } = useGetSuppliersQuery({ page: 1 });
  const { data: warehousesData } = useGetWarehousesQuery();
  const { data: spData } = useGetSupplierProductsQuery(supplierId, { skip: !supplierId });
  const { data: pData } = useGetAdminProductsQuery({ page: 1, limit: 1000 });
  const { data: poData, isLoading: isLoadingPO } = useGetPurchaseOrderQuery(id, { skip: !isEdit });
  const [createPO, { isLoading: isCreating }] = useCreatePurchaseOrderMutation();
  const [updatePO, { isLoading: isUpdating }] = useUpdatePurchaseOrderMutation();

  const suppliers = suppliersData?.data?.filter(s => s.isActive) || [];
  const warehouses = warehousesData?.data?.filter(w => w.isActive) || [];
  const supplierProducts = spData?.data || [];
  const allProducts = pData?.data || [];

  // Pre-fill form when editing
  useEffect(() => {
    if (isEdit && poData?.data && !initialized) {
      const po = poData.data;
      setSupplierId(po.supplier?._id || '');
      setWarehouseId(po.warehouse?._id || '');
      setItems(po.items?.map(i => ({
        product: i.product?._id || i.product || '',
        sku: i.sku || '',
        description: i.description || '',
        orderedQty: i.orderedQty || 1,
        unitCost: i.unitCost || 0,
      })) || []);
      setTax(po.pricing?.tax || 0);
      setShipping(po.pricing?.shipping || 0);
      setNotes(po.notes || '');
      setExpectedDeliveryDate(po.expectedDeliveryDate ? po.expectedDeliveryDate.split('T')[0] : '');
      setInitialized(true);
    }
  }, [isEdit, poData, initialized]);

  const handleAddItem = () => {
    setItems([...items, { product: '', sku: '', description: '', orderedQty: 1, unitCost: 0 }]);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    if (field === 'product') {
      const sp = supplierProducts.find(sp => sp.product?._id === value || sp.product === value);
      const pr = allProducts.find(p => p._id === value);
      
      if (sp) {
        updated[index].unitCost = sp.unitCost;
      } else if (pr) {
        updated[index].unitCost = pr.costPrice || 0;
      }
      
      if (pr) {
        updated[index].sku = pr.sku || '';
        updated[index].description = pr.name || '';
      }
    }

    setItems(updated);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.orderedQty * item.unitCost), 0);
  const grandTotal = subtotal + Number(tax) + Number(shipping);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) { toast.warning('Add at least one line item'); return; }
    if (!supplierId) { toast.warning('Please select a supplier'); return; }
    if (!warehouseId) { toast.warning('Please select a warehouse'); return; }
    const hasInvalidItem = items.some(i => Number(i.orderedQty) <= 0 || Number(i.unitCost) <= 0);
    if (hasInvalidItem) { toast.error('All items must have a positive quantity and unit cost'); return; }

    const payload = {
      supplier: supplierId,
      warehouse: warehouseId,
      items: items.map(i => ({
        product: i.product,
        sku: i.sku,
        description: i.description,
        orderedQty: Number(i.orderedQty),
        unitCost: Number(i.unitCost),
      })),
      pricing: { tax: Number(tax), shipping: Number(shipping) },
      notes,
      expectedDeliveryDate: expectedDeliveryDate || undefined,
    };

    try {
      if (isEdit) {
        await updatePO({ id, ...payload }).unwrap();
        toast.success('Purchase Order updated successfully');
      } else {
        await createPO(payload).unwrap();
        toast.success('Purchase Order created successfully');
      }
      navigate('/admin/purchase-orders');
    } catch (err) {
      toast.error(err.data?.message || `Failed to ${isEdit ? 'update' : 'create'} Purchase Order`);
    }
  };

  if (isEdit && isLoadingPO) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-electric w-10 h-10" />
      </div>
    );
  }

  const isSaving = isCreating || isUpdating;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <button onClick={() => navigate('/admin/purchase-orders')} className="inline-flex items-center text-sm text-slate-500 hover:text-electric mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Purchase Orders
      </button>

      <h1 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight mb-8 flex items-center gap-3">
        {isEdit ? <Edit3 className="w-8 h-8 text-electric" /> : null}
        {isEdit ? 'Edit Purchase Order' : 'Create Purchase Order'}
        {isEdit && poData?.data?.poNumber && (
          <span className="text-lg font-mono text-slate-400 font-normal">({poData.data.poNumber})</span>
        )}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Supplier & Warehouse Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-electric" /> Supplier
            </h2>
            <select value={supplierId} onChange={(e) => { setSupplierId(e.target.value); if (!isEdit) setItems([]); }} required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric">
              <option value="">Select a supplier...</option>
              {suppliers.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
            </select>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Warehouse className="w-5 h-5 text-amber-500" /> Warehouse <span className="text-rose-500 text-sm">*</span>
            </h2>
            <select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric">
              <option value="">Select a warehouse...</option>
              {warehouses.map(w => <option key={w._id} value={w._id}>{w.name} ({w.code})</option>)}
            </select>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-900">Line Items</h2>
            <button type="button" onClick={handleAddItem} disabled={!supplierId}
              className="text-sm bg-electric hover:bg-electric-dark text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50">
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>

          {!supplierId && (
            <div className="p-8 text-center text-slate-400 flex flex-col items-center">
              <Package className="w-12 h-12 mb-3 opacity-40" />
              <p className="font-medium">Select a supplier first to add items</p>
            </div>
          )}

          {items.length > 0 && (
            <div className="space-y-4">
              {items.map((item, i) => (
                <div key={i} className="flex items-end gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Product</label>
                    <select value={item.product} onChange={(e) => handleItemChange(i, 'product', e.target.value)} required
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-electric/50">
                      <option value="">Select...</option>
                      {allProducts.map(p => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Qty</label>
                    <input type="number" min="1" value={item.orderedQty} onChange={(e) => handleItemChange(i, 'orderedQty', e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-electric/50" />
                  </div>
                  <div className="w-28">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Unit Cost</label>
                    <input type="number" step="0.01" min="0.01" value={item.unitCost} onChange={(e) => handleItemChange(i, 'unitCost', e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-electric/50" />
                  </div>
                  <div className="w-24 text-right">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Line Total</label>
                    <div className="p-2.5 text-sm font-bold text-slate-900">Rs. {(item.orderedQty * item.unitCost).toFixed(2)}</div>
                  </div>
                  <button type="button" onClick={() => handleRemoveItem(i)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors mb-0.5">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pricing & Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Details</h2>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">Expected Delivery</label>
              <input type="date" value={expectedDeliveryDate} onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-electric/50" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="3" placeholder="Optional notes..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-electric/50" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Pricing Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-bold text-slate-900">Rs. {subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Tax</span>
                <input type="number" step="0.01" min="0" value={tax} onChange={(e) => setTax(e.target.value)} className="w-24 p-1.5 text-right bg-slate-50 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Shipping</span>
                <input type="number" step="0.01" min="0" value={shipping} onChange={(e) => setShipping(e.target.value)} className="w-24 p-1.5 text-right bg-slate-50 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between"><span className="font-bold text-slate-900">Grand Total</span><span className="text-xl font-extrabold text-electric">Rs. {grandTotal.toFixed(2)}</span></div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button type="submit" disabled={isSaving || items.length === 0}
            className="bg-electric hover:bg-electric-dark text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-70">
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isEdit ? 'Update Purchase Order' : 'Create Purchase Order'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PurchaseOrderForm;
