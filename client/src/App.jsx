import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from './features/auth/authSlice';

// Layouts
import StorefrontLayout from './layouts/StorefrontLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import Home from './pages/store/Home';
import Shop from './pages/store/Shop';
import Categories from './pages/store/Categories';
import ProductDetail from './pages/store/ProductDetail';
import Cart from './pages/store/Cart';
import Checkout from './pages/store/Checkout';
import HelpCenter from './pages/store/HelpCenter';
import ShippingInfo from './pages/store/ShippingInfo';
import TrackOrder from './pages/store/TrackOrder';
import Login from './pages/auth/Login';
import VerifyEmail from './pages/auth/VerifyEmail';
import Register from './pages/auth/Register';

// Protected User Pages
import Account from './pages/account/Account';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductsList from './pages/admin/ProductsList';
import OrdersList from './pages/admin/OrdersList';
import ProductForm from './pages/admin/ProductForm';
import CategoriesList from './pages/admin/CategoriesList';
import ReturnsList from './pages/admin/ReturnsList';
import SupplierDashboard from './pages/admin/procurement/SupplierDashboard';
import SupplierDetail from './pages/admin/procurement/SupplierDetail';
import PurchaseOrdersList from './pages/admin/procurement/PurchaseOrdersList';
import PurchaseOrderForm from './pages/admin/procurement/PurchaseOrderForm';
import PurchaseOrderDetail from './pages/admin/procurement/PurchaseOrderDetail';
import SupplierDeliveriesList from './pages/admin/procurement/SupplierDeliveriesList';
import SupplierInvoicesList from './pages/admin/procurement/SupplierInvoicesList';
import FleetDashboard from './pages/admin/FleetDashboard';
import UsersList from './pages/admin/UsersList';
import WarehousesList from './pages/admin/WarehousesList';
import StockMovementsList from './pages/admin/StockMovementsList';



const ProtectedRoute = ({ children, roles }) => {
  const user = useSelector(selectCurrentUser);
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StorefrontLayout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="categories" element={<Categories />} />
          <Route path="shop/:slug" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="help-center" element={<HelpCenter />} />
          <Route path="shipping" element={<ShippingInfo />} />
          <Route path="track-order" element={<TrackOrder />} />
          <Route path="verify-email/:token" element={<VerifyEmail />} />
          <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        <Route path="/admin" element={<ProtectedRoute roles={['admin', 'warehouse_mgr', 'staff', 'supplier']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<ProductsList />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="categories" element={<CategoriesList />} />
          <Route path="orders" element={<OrdersList />} />
          <Route path="returns" element={<ReturnsList />} />
          <Route path="suppliers" element={<SupplierDashboard />} />
          <Route path="suppliers/:id" element={<SupplierDetail />} />
          <Route path="purchase-orders" element={<PurchaseOrdersList />} />
          <Route path="purchase-orders/new" element={<PurchaseOrderForm />} />
          <Route path="purchase-orders/:id" element={<PurchaseOrderDetail />} />
          <Route path="purchase-orders/:id/edit" element={<PurchaseOrderForm />} />
          <Route path="supplier-deliveries" element={<SupplierDeliveriesList />} />
          <Route path="supplier-invoices" element={<SupplierInvoicesList />} />
          <Route path="fleet" element={<FleetDashboard />} />
          <Route path="users" element={<UsersList />} />
          <Route path="warehouses" element={<WarehousesList />} />
          <Route path="stock-movements" element={<StockMovementsList />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
