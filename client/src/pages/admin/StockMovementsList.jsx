import { useState, useEffect } from 'react';
import { Plus, Search, Loader2, Save, X, RefreshCw } from 'lucide-react';
import {
  useGetStockMovementsQuery,
  useCreateStockMovementMutation,
  useGetWarehousesQuery,
  useGetAdminProductsQuery,
} from '../../features/api/adminApiSlice';


const MOVEMENT_TYPES = [
  { value: 'restock', label: 'Restock (+)' },
  { value: 'purchase', label: 'Purchase (+)' },
  { value: 'transfer_in', label: 'Transfer In (+)' },
  { value: 'transfer_out', label: 'Transfer Out (-)' },
  { value: 'sale', label: 'Sale (-)' },
  { value: 'damage', label: 'Damage (-)' },
  { value: 'return', label: 'Return (+)' },
  { value: 'adjustment', label: 'Adjustment' },
];

const StockMovementsList = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    product: '',
    warehouse: '',
    type: 'restock',
    quantityChange: 0,
    notes: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { data, isLoading, isError, error } = useGetStockMovementsQuery({
    page,
    search: debouncedSearch,
    type: typeFilter || undefined,
    warehouse: warehouseFilter || undefined,
    product: productFilter || undefined,
  });
  
  const { data: warehousesData, isLoading: warehousesLoading, isError: warehousesError } = useGetWarehousesQuery({ page: 1 });
  const { data: productsData, isLoading: productsLoading, isError: productsError } = useGetAdminProductsQuery({ page: 1, search: '' });
  
  const [createMovement, { isLoading: isCreating }] = useCreateStockMovementMutation();

  const warehouses = warehousesData?.data || [];
  const products = productsData?.data || [];
  const movements = data?.data || [];
  const pagination = { page: data?.page || 1, pages: data?.pages || 1 };

  const handleOpenModal = () => {
    setFormData({ product: '', warehouse: '', type: 'restock', quantityChange: 0, notes: '' });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ product: '', warehouse: '', type: 'restock', quantityChange: 0, notes: '' });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.product) newErrors.product = 'Product is required';
    if (!formData.warehouse) newErrors.warehouse = 'Warehouse is required';
    if (!formData.type) newErrors.type = 'Movement type is required';
    if (formData.quantityChange === 0 || formData.quantityChange === '') 
      newErrors.quantityChange = 'Quantity change is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await createMovement({
        product: formData.product,
        warehouse: formData.warehouse,
        type: formData.type,
        quantityChange: Number(formData.quantityChange),
        notes: formData.notes,
        referenceType: 'Manual',
      }).unwrap();
      
      handleCloseModal();
      alert('Stock movement created successfully!');
    } catch (err) {
      alert(err?.data?.message || 'Failed to create stock movement');
    }
  };

  const getProductName = (productId) => {
    const prod = products.find(p => p._id === productId);
    return prod ? `${prod.name} (${prod.sku})` : 'Unknown Product';
  };

  const getWarehouseName = (warehouseId) => {
    const wh = warehouses.find(w => w._id === warehouseId);
    return wh ? `${wh.name} (${wh.code})` : 'Unknown Warehouse';
  };

  const getMovementTypeLabel = (type) => {
    return MOVEMENT_TYPES.find(t => t.value === type)?.label || type;
  };

  const getMovementTypeColor = (type) => {
    const positiveTypes = ['restock', 'purchase', 'transfer_in', 'return'];
    const negativeTypes = ['sale', 'transfer_out', 'damage'];
    
    if (positiveTypes.includes(type)) return 'text-emerald-600';
    if (negativeTypes.includes(type)) return 'text-rose-600';
    return 'text-slate-600';
  };

  if (isLoading || warehousesLoading || productsLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-electric w-12 h-12" /></div>;

  if (isError || warehousesError || productsError) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <h3 className="text-lg font-bold text-red-800 mb-2">Error Loading Data</h3>
          <p className="text-red-600">
            {error?.data?.message || warehousesError?.data?.message || productsError?.data?.message || 'Failed to load stock movements, warehouses, or products. Please check your authentication and try again.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight">Stock Movements</h1>
          <p className="text-slate-500 mt-1">Track and manage inventory movements across warehouses.</p>
        </div>
        <button onClick={handleOpenModal} className="bg-electric hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center transition-colors shadow-sm text-sm">
          <Plus className="w-5 h-5 mr-2" /> Create Movement
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Filters */}
        <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row gap-4 bg-slate-50">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search movements..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 text-sm"
            />
          </div>
          
          <select 
            value={typeFilter} 
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 text-sm"
          >
            <option value="">All Types</option>
            {MOVEMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>

          <select 
            value={warehouseFilter} 
            onChange={(e) => { setWarehouseFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 text-sm"
          >
            <option value="">All Warehouses</option>
            {warehouses.length > 0 ? warehouses.map(w => <option key={w._id} value={w._id}>{w.name} ({w.code})</option>) : <option disabled>No warehouses available</option>}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {movements.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <RefreshCw className="w-16 h-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-800 mb-2">No movements found</h3>
              <p className="text-slate-500">Create your first stock movement or adjust filters.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                  <th className="p-4 px-6">Date</th>
                  <th className="p-4 px-6">Product</th>
                  <th className="p-4 px-6">Warehouse</th>
                  <th className="p-4 px-6">Type</th>
                  <th className="p-4 px-6 text-center">Quantity</th>
                  <th className="p-4 px-6 text-center">Before</th>
                  <th className="p-4 px-6 text-center">After</th>
                  <th className="p-4 px-6">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.map(m => (
                  <tr key={m._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4 px-6 text-sm text-slate-700">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 px-6">
                      <div className="font-medium text-slate-900 text-sm">{getProductName(m.product?._id || m.product)}</div>
                    </td>
                    <td className="p-4 px-6">
                      <div className="text-sm text-slate-700">{getWarehouseName(m.warehouse?._id || m.warehouse)}</div>
                    </td>
                    <td className="p-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold leading-none border ${
                        m.type === 'restock' || m.type === 'purchase' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                        m.type === 'sale' || m.type === 'damage' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {getMovementTypeLabel(m.type)}
                      </span>
                    </td>
                    <td className={`p-4 px-6 text-sm font-bold ${m.quantityChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {m.quantityChange >= 0 ? '+' : ''}{m.quantityChange}
                    </td>
                    <td className="p-4 px-6 text-sm text-slate-600 text-center">{m.quantityBefore || 0}</td>
                    <td className="p-4 px-6 text-sm text-slate-600 text-center font-bold">{m.quantityAfter || 0}</td>
                    <td className="p-4 px-6 text-sm text-slate-500 max-w-xs truncate" title={m.notes}>{m.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
            <span className="text-sm text-slate-500">
              Page <span className="text-slate-900">{pagination.page}</span> of <span className="text-slate-900">{pagination.pages}</span>
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
                className="px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Previous
              </button>
              <button 
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} 
                disabled={page === pagination.pages}
                className="px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold font-heading text-slate-900">Create Stock Movement</h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Product *</label>
                <select
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                  className={`w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-electric/50 focus:border-electric transition-all ${
                    errors.product ? 'border-rose-500' : 'border-slate-200'
                  }`}
                >
                  <option value="">Select product...</option>
                  {products.length > 0 ? products.map(p => (
                    <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>
                  )) : <option disabled>No products available</option>}
                </select>
                {errors.product && <p className="text-rose-500 text-sm mt-1">{errors.product}</p>}
              </div>

              {/* Warehouse */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Warehouse *</label>
                <select
                  value={formData.warehouse}
                  onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                  className={`w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-electric/50 focus:border-electric transition-all ${
                    errors.warehouse ? 'border-rose-500' : 'border-slate-200'
                  }`}
                >
                  <option value="">Select warehouse...</option>
                  {warehouses.length > 0 ? warehouses.map(w => (
                    <option key={w._id} value={w._id}>{w.name} ({w.code})</option>
                  )) : <option disabled>No warehouses available</option>}
                </select>
                {errors.warehouse && <p className="text-rose-500 text-sm mt-1">{errors.warehouse}</p>}
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Movement Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className={`w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-electric/50 focus:border-electric transition-all ${
                    errors.type ? 'border-rose-500' : 'border-slate-200'
                  }`}
                >
                  {MOVEMENT_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                {errors.type && <p className="text-rose-500 text-sm mt-1">{errors.type}</p>}
              </div>

              {/* Quantity Change */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Quantity Change *</label>
                <input
                  type="number"
                  value={formData.quantityChange}
                  onChange={(e) => setFormData({ ...formData, quantityChange: e.target.value })}
                  className={`w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-electric/50 focus:border-electric transition-all ${
                    errors.quantityChange ? 'border-rose-500' : 'border-slate-200'
                  }`}
                  placeholder="Enter quantity (positive or negative)"
                />
                {errors.quantityChange && <p className="text-rose-500 text-sm mt-1">{errors.quantityChange}</p>}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-electric/50 focus:border-electric transition-all text-sm"
                  rows="3"
                  placeholder="Add any notes..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-2.5 bg-electric text-white rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-70 transition-colors flex items-center justify-center gap-2"
                >
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockMovementsList;
