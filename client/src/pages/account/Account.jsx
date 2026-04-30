import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  useGetMeQuery, useUpdateProfileMutation, useUpdatePasswordMutation,
  useGetAddressesQuery, useAddAddressMutation, useDeleteAddressMutation, useSetDefaultAddressMutation 
} from '../../features/auth/authApiSlice';
import { useGetMyOrdersQuery, useGetMyReturnsQuery } from '../../features/api/storeApiSlice';
import { setCredentials } from '../../features/auth/authSlice';
import { toast } from 'react-toastify';
import { 
  User, MapPin, Package, RotateCcw, Loader2, Plus, 
  Trash2, Star, ChevronDown, ChevronUp, Lock, Edit3
} from 'lucide-react';

export default function Account() {
  const [activeTab, setActiveTab] = useState('profile');
  const dispatch = useDispatch();
  
  // Queries
  const { data: userData, isLoading: loadingUser } = useGetMeQuery();
  const { data: addressesData, isLoading: loadingAddresses } = useGetAddressesQuery();
  const { data: ordersData, isLoading: loadingOrders } = useGetMyOrdersQuery();
  const { data: returnsData, isLoading: loadingReturns } = useGetMyReturnsQuery();

  // Mutations
  const [updateProfile, { isLoading: updatingProfile }] = useUpdateProfileMutation();
  const [updatePassword, { isLoading: updatingPassword }] = useUpdatePasswordMutation();
  const [addAddress, { isLoading: addingAddress }] = useAddAddressMutation();
  const [deleteAddress, { isLoading: deletingAddress }] = useDeleteAddressMutation();
  const [setDefaultAddress, { isLoading: settingDefault }] = useSetDefaultAddressMutation();

  const user = userData?.data;
  const addresses = addressesData?.data || [];
  const orders = ordersData?.data || [];
  const returns = returnsData?.data || [];

  // Form States
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [addressForm, setAddressForm] = useState({ 
    street: '', city: '', state: '', zip: '', country: 'US', isDefault: false, label: 'Home' 
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', phone: user.phone || '' });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = await updateProfile(profileForm).unwrap();
      dispatch(setCredentials(updatedUser.data));
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    try {
      await updatePassword(passwordForm).unwrap();
      toast.success('Password updated successfully');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err?.data?.message || 'Incorrect current password or update failed');
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      await addAddress(addressForm).unwrap();
      toast.success('Address added successfully');
      setShowAddressForm(false);
      setAddressForm({ street: '', city: '', state: '', zip: '', country: 'US', isDefault: false, label: 'Home' });
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to add address');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (addresses.length === 1) return toast.error('You cannot delete your only address');
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteAddress(id).unwrap();
        toast.success('Address deleted');
      } catch (err) {
        toast.error('Failed to delete address');
      }
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress(id).unwrap();
      toast.success('Default address updated');
    } catch (err) {
      toast.error('Failed to update default address');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-indigo-100 text-indigo-700';
      case 'delivered': return 'bg-emerald-100 text-emerald-700';
      case 'cancelled': return 'bg-rose-100 text-rose-700';
      case 'approved': return 'bg-emerald-100 text-emerald-700';
      case 'reviewing': return 'bg-blue-100 text-blue-700';
      case 'rejected': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile & Security', icon: User },
    { id: 'addresses', name: 'Saved Addresses', icon: MapPin },
    { id: 'orders', name: 'Order History', icon: Package },
    { id: 'returns', name: 'My Returns', icon: RotateCcw },
  ];

  if (loadingUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-electric" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 flex items-center gap-4">
          <div className="w-16 h-16 bg-electric/10 rounded-full flex items-center justify-center text-electric text-2xl font-bold font-heading">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-heading font-extrabold text-navy-900">My Account</h1>
            <p className="text-slate-500">{user?.email}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 flex flex-col gap-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab.id ? 'bg-electric text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Profile Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                  <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2 mb-6">
                    <Edit3 className="w-5 h-5 text-electric" /> Basic Information
                  </h2>
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                        <input type="text" required value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Email (Read Only)</label>
                        <input type="email" disabled value={user?.email || ''} className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number</label>
                        <input type="tel" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50" />
                      </div>
                    </div>
                    <div className="pt-2">
                      <button type="submit" disabled={updatingProfile} className="bg-electric hover:bg-electric-dark text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center transition-all disabled:opacity-70">
                        {updatingProfile ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Save Changes
                      </button>
                    </div>
                  </form>
                </div>

                {/* Password Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                  <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2 mb-6">
                    <Lock className="w-5 h-5 text-electric" /> Change Password
                  </h2>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Current Password</label>
                      <input type="password" required minLength="6" value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">New Password</label>
                      <input type="password" required minLength="6" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50" />
                      <p className="text-xs text-slate-500 mt-1">Must be at least 6 characters long.</p>
                    </div>
                    <div className="pt-2">
                      <button type="submit" disabled={updatingPassword} className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center transition-all disabled:opacity-70">
                        {updatingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Update Password
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-electric" /> Your Addresses
                  </h2>
                  <button onClick={() => setShowAddressForm(!showAddressForm)} className="bg-electric/10 text-electric hover:bg-electric/20 px-4 py-2 rounded-xl text-sm font-bold flex items-center transition-colors">
                    {showAddressForm ? 'Cancel' : <><Plus className="w-4 h-4 mr-1" /> Add Address</>}
                  </button>
                </div>

                {showAddressForm && (
                  <form onSubmit={handleAddressSubmit} className="bg-white rounded-2xl shadow-sm border border-electric p-6 mb-6 animate-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Address Label (Home, Office)</label>
                        <input type="text" required value={addressForm.label} onChange={e => setAddressForm({...addressForm, label: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Street Address</label>
                        <input type="text" required value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">City</label>
                        <input type="text" required value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">State / Province</label>
                        <input type="text" required value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">ZIP / Postal Code</label>
                        <input type="text" required value={addressForm.zip} onChange={e => setAddressForm({...addressForm, zip: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50" />
                      </div>
                      <div className="flex items-center mt-6">
                        <label className="flex items-center cursor-pointer">
                          <input type="checkbox" checked={addressForm.isDefault} onChange={e => setAddressForm({...addressForm, isDefault: e.target.checked})} className="w-5 h-5 text-electric rounded border-slate-300 focus:ring-electric focus:ring-2 focus:ring-offset-2" />
                          <span className="ml-2 text-sm font-bold text-slate-700">Set as default shipping address</span>
                        </label>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <button type="submit" disabled={addingAddress} className="bg-electric hover:bg-electric-dark text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center transition-all disabled:opacity-70">
                        {addingAddress ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Save Address
                      </button>
                    </div>
                  </form>
                )}

                {loadingAddresses ? (
                  <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
                ) : addresses.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-900 mb-1">No addresses saved</h3>
                    <p className="text-slate-500">Add an address to breeze through checkout.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map(addr => (
                      <div key={addr._id} className={`bg-white rounded-2xl border p-6 relative group ${addr.isDefault ? 'border-electric shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
                        {addr.isDefault && (
                          <div className="absolute top-4 right-4 bg-electric/10 text-electric text-xs font-bold px-2 py-1 rounded-md flex items-center">
                            <Star className="w-3 h-3 mr-1" /> Default
                          </div>
                        )}
                        <h3 className="font-bold text-slate-900 mb-2">{addr.label || 'Address'}</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {addr.street}<br />
                          {addr.city}, {addr.state} {addr.zip}<br />
                          {addr.country}
                        </p>
                        <div className="mt-6 flex items-center gap-3">
                          {!addr.isDefault && (
                            <button onClick={() => handleSetDefault(addr._id)} disabled={settingDefault} className="text-sm font-bold text-electric hover:text-blue-700">Set as Default</button>
                          )}
                          <div className="flex-1" />
                          <button 
                            onClick={() => handleDeleteAddress(addr._id)} 
                            disabled={deletingAddress || addresses.length === 1}
                            title={addresses.length === 1 ? 'Cannot delete your only address' : 'Delete address'}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2 mb-6">
                  <Package className="w-5 h-5 text-electric" /> Order History
                </h2>
                
                {loadingOrders ? (
                  <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
                ) : orders.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                    <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">You haven't placed an order yet</h3>
                    <p className="text-slate-500 mb-6">When you do, their details will show up here.</p>
                    <Link to="/shop" className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl shadow-sm text-white bg-electric hover:bg-electric-dark transition-colors">
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-slate-300">
                        <div 
                          className="p-5 flex flex-wrap items-center justify-between cursor-pointer bg-slate-50/50"
                          onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                        >
                          <div className="flex items-center gap-6">
                            <div>
                              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Order Placed</p>
                              <p className="text-sm font-bold text-slate-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Total</p>
                              <p className="text-sm font-bold text-slate-900">Rs. {order.pricing?.total?.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Order ID</p>
                              <p className="text-sm font-bold text-slate-900">{order.orderNumber}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-4 sm:mt-0">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.orderStatus)}`}>
                              {order.orderStatus.replace(/_/g, ' ')}
                            </span>
                            <div className="p-1 rounded-full bg-slate-100 text-slate-500">
                              {expandedOrder === order._id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </div>
                          </div>
                        </div>

                        {expandedOrder === order._id && (
                          <div className="p-5 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200 bg-white">
                            <div className="flex flex-col md:flex-row gap-8">
                              <div className="flex-1">
                                <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Items ordered</h4>
                                <ul className="space-y-4">
                                  {order.items.map(item => (
                                    <li key={item._id} className="flex gap-4 items-center">
                                      <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                        {item.image ? (
                                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                                            <Package className="w-6 h-6" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-bold text-slate-900">{item.name}</p>
                                        <p className="text-sm text-slate-500">Qty: {item.quantity} • ${item.unitPrice?.toFixed(2)}</p>
                                      </div>
                                      <div className="font-bold text-slate-900">
                                        Rs. {item.subtotal?.toFixed(2)}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="md:w-64 bg-slate-50 p-4 rounded-xl border border-slate-100 h-fit">
                                <h4 className="font-bold text-slate-900 mb-2 text-sm uppercase tracking-wider">Shipping Address</h4>
                                {order.shippingAddress ? (
                                  <p className="text-sm text-slate-600 leading-relaxed">
                                    {order.shippingAddress.street}<br />
                                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}<br />
                                    {order.shippingAddress.country}
                                  </p>
                                ) : (
                                  <p className="text-sm text-slate-500 italic">No address provided.</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'returns' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2 mb-6">
                  <RotateCcw className="w-5 h-5 text-electric" /> Return Requests
                </h2>

                {loadingReturns ? (
                  <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
                ) : returns.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                    <RotateCcw className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">You have no active returns</h3>
                    <p className="text-slate-500 mb-6">If you need to return an item, you can initiate it from your Order details.</p>
                  </div>
                ) : (
                  <div className="bg-white border rounded-2xl shadow-sm border-slate-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                          <th className="p-4">Order ID</th>
                          <th className="p-4">Date</th>
                          <th className="p-4">Reason</th>
                          <th className="p-4">Refund</th>
                          <th className="p-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {returns.map(ret => (
                          <tr key={ret._id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-bold text-slate-900">{ret.order?.orderNumber || '-'}</td>
                            <td className="p-4 text-slate-600">{new Date(ret.createdAt).toLocaleDateString()}</td>
                            <td className="p-4 text-slate-600 truncate max-w-[200px]" title={ret.reason}>{ret.reason}</td>
                            <td className="p-4 font-bold text-slate-900">
                              {ret.refundAmount > 0 ? `Rs. ${ret.refundAmount.toFixed(2)}` : '-'}
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(ret.status)}`}>
                                {ret.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
