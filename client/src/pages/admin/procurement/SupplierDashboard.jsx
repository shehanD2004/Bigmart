import React, { useState } from 'react';
import { 
  useGetSuppliersQuery,
  useGetPurchaseOrdersQuery,
  useGetSupplierDeliveriesQuery,
  useGetSupplierInvoicesQuery
} from '../../../features/api/adminApiSlice';
import { 
  Loader2, AlertCircle, Truck, Package, PackageCheck, FileText,
  Activity, CheckCircle, Navigation, ClipboardList, Calendar, DollarSign
} from 'lucide-react';

// Import Tab Components
import SuppliersList from './SuppliersList';
import PurchaseOrdersList from './PurchaseOrdersList';
import SupplierDeliveriesList from './SupplierDeliveriesList';
import SupplierInvoicesList from './SupplierInvoicesList';

const SupplierDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Fetch summaries for the dashboard overview
  const { data: suppliersData, isLoading: loadingSuppliers } = useGetSuppliersQuery({ page: 1 });
  const { data: posData, isLoading: loadingPOs } = useGetPurchaseOrdersQuery({ page: 1 });
  const { data: deliveriesData, isLoading: loadingDeliveries } = useGetSupplierDeliveriesQuery({ page: 1 });
  const { data: invoicesData, isLoading: loadingInvoices } = useGetSupplierInvoicesQuery({ page: 1 });

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: Activity },
    { id: 'suppliers', name: 'Suppliers', icon: Truck },
    { id: 'pos', name: 'Purchase Orders', icon: ClipboardList },
    { id: 'deliveries', name: 'Deliveries', icon: PackageCheck },
    { id: 'invoices', name: 'Invoices', icon: FileText },
  ];

  const isLoading = loadingSuppliers || loadingPOs || loadingDeliveries || loadingInvoices;

  const suppliers = suppliersData?.data || [];
  const pos = posData?.data || [];
  const deliveries = deliveriesData?.data || [];
  const invoices = invoicesData?.data || [];

  const activeSuppliers = suppliers.filter(s => s.isActive).length;
  
  // Calculate PO stats
  const pendingPOs = pos.filter(po => po.status === 'draft' || po.status === 'sent').length;
  const receivedPOs = pos.filter(po => po.status === 'received').length;

  // Calculate Invoice stats
  const unpaidInvoices = invoices.filter(inv => inv.status === 'sent' || inv.status === 'overdue' || inv.status === 'partially_paid');
  const outstandingAmount = unpaidInvoices.reduce((sum, inv) => sum + (inv.remainingBalance || inv.totalAmount), 0);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Truck className="w-8 h-8 text-electric" /> Suppliers & Procurement
          </h1>
          <p className="text-slate-500 mt-1">Central hub for suppliers, purchase orders, deliveries, and billing.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8 p-1">
        <div className="flex flex-wrap gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-electric text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
               <Loader2 className="animate-spin text-electric w-12 h-12" />
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Suppliers</p>
                    <p className="text-2xl font-black text-slate-900">{activeSuppliers} <span className="text-sm font-medium text-slate-400">/ {suppliersData?.total || 0}</span></p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pending POs</p>
                    <p className="text-2xl font-black text-slate-900">{pendingPOs}</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <PackageCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Deliveries</p>
                    <p className="text-2xl font-black text-slate-900">{deliveriesData?.total || 0}</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
                  <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Outstanding Bills</p>
                    <p className="text-xl font-black text-slate-900">Rs. {outstandingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>

              {/* Recent Activity Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Purchase Orders */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[400px]">
                  <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-slate-400" /> Recent Purchase Orders
                    </h2>
                    <button onClick={() => setActiveTab('pos')} className="text-sm font-bold text-electric hover:text-electric-dark">View All</button>
                  </div>
                  <div className="p-0 overflow-y-auto flex-1">
                    {pos.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center h-full">
                        <Package className="w-10 h-10 mb-3 opacity-20" />
                        <p>No recent purchase orders.</p>
                      </div>
                    ) : (
                      <ul className="divide-y divide-slate-100">
                        {pos.slice(0, 5).map((po) => (
                          <li key={po._id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{po.poNumber}</p>
                              <p className="text-xs text-slate-500">{po.supplier?.name || "Unknown"} • {po.items?.length || 0} items</p>
                            </div>
                            <div className="text-right">
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                po.status === 'received' ? 'bg-emerald-100 text-emerald-700' :
                                po.status === 'draft' ? 'bg-slate-100 text-slate-600' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {po.status}
                              </span>
                              <p className="text-xs font-bold text-slate-800 mt-1">Rs. {po.pricing?.grandTotal?.toFixed(2) || '0.00'}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Recent Invoices */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[400px]">
                  <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-slate-400" /> Recent Invoices
                    </h2>
                    <button onClick={() => setActiveTab('invoices')} className="text-sm font-bold text-electric hover:text-electric-dark">View All</button>
                  </div>
                  <div className="p-0 overflow-y-auto flex-1">
                    {invoices.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center h-full">
                        <FileText className="w-10 h-10 mb-3 opacity-20" />
                        <p>No recent invoices.</p>
                      </div>
                    ) : (
                      <ul className="divide-y divide-slate-100">
                        {invoices.slice(0, 5).map((inv) => (
                          <li key={inv._id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{inv.invoiceNumber}</p>
                              <p className="text-xs text-slate-500">{inv.supplier?.name} • Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            <div className="text-right">
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                                inv.status === 'overdue' ? 'bg-rose-100 text-rose-700' :
                                'bg-amber-100 text-amber-700'
                              }`}>
                                {inv.status.replace(/_/g, ' ')}
                              </span>
                              <p className="text-xs font-bold text-slate-800 mt-1">Rs. {inv.totalAmount?.toFixed(2)}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Render selected view. For these lists, we hide their external padding so they fit nicely. */}
      {/* We can bypass the margin auto max-W-7xl inside the subcomponents by just rendering them and overriding via CSS if we wanted, but they already use max-w-7xl mx-auto, so they will fit perfectly within this container boundary. */}
      <div className={activeTab !== 'dashboard' ? 'mt-4' : 'hidden'}>
        {activeTab === 'suppliers' && <SuppliersList />}
        {activeTab === 'pos' && <PurchaseOrdersList />}
        {activeTab === 'deliveries' && <SupplierDeliveriesList />}
        {activeTab === 'invoices' && <SupplierInvoicesList />}
      </div>
    </div>
  );
};

export default SupplierDashboard;
