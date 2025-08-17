import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import Dashboard from './components/dashboard/Dashboard';
import VehicleList from './components/vehicles/VehicleList';
import VehicleDetail from './components/vehicles/VehicleDetail';
import VehicleEdit from './components/vehicles/VehicleEdit';
import VehicleNew from './components/vehicles/VehicleNew';
import CustomerList from './components/customers/CustomerList';
import ServiceList from './components/services/ServiceList';
import SalesList from './components/sales/SalesList';
import InventoryList from './components/inventory/InventoryList';
import ReportsDashboard from './components/reports/ReportsDashboard';
import './index.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Protected Routes */}
              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                
                {/* Vehicle Management */}
                <Route path="vehicles" element={<VehicleList />} />
                <Route path="vehicles/new" element={<VehicleNew />} />
                <Route path="vehicles/:id" element={<VehicleDetail />} />
                <Route path="vehicles/:id/edit" element={<VehicleEdit />} />
                
                {/* Customer Management */}
                <Route path="customers" element={<CustomerList />} />
                <Route path="customers/new" element={<CustomerList />} />
                <Route path="customers/:id" element={<CustomerList />} />
                <Route path="customers/:id/edit" element={<CustomerList />} />
                
                {/* Service Management */}
                <Route path="services" element={<ServiceList />} />
                <Route path="services/new" element={<ServiceList />} />
                <Route path="services/:id" element={<ServiceList />} />
                <Route path="services/:id/edit" element={<ServiceList />} />
                
                {/* Sales Management */}
                <Route path="sales" element={<SalesList />} />
                <Route path="sales/new" element={<SalesList />} />
                <Route path="sales/:id" element={<SalesList />} />
                <Route path="sales/:id/edit" element={<SalesList />} />
                
                {/* Inventory Management */}
                <Route path="inventory" element={<InventoryList />} />
                <Route path="inventory/new" element={<InventoryList />} />
                <Route path="inventory/:id" element={<InventoryList />} />
                <Route path="inventory/:id/edit" element={<InventoryList />} />
                
                {/* Reports & Analytics */}
                <Route path="reports" element={<ReportsDashboard />} />
                
                {/* Catch all route */}
                <Route path="*" element={<Dashboard />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
