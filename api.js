import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  register: (userData) => 
    api.post('/auth/register', userData),
  
  forgotPassword: (email) => 
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token, password) => 
    api.post('/auth/reset-password', { token, password }),
  
  getProfile: () => 
    api.get('/auth/profile'),
  
  updateProfile: (userData) => 
    api.put('/auth/profile', userData),
  
  changePassword: (currentPassword, newPassword) => 
    api.post('/auth/change-password', { currentPassword, newPassword }),
};

// Demo vehicle data for offline mode
const demoVehicles = [
  {
    _id: 'demo-1',
    year: 2023,
    make: 'Toyota',
    model: 'Camry',
    trim: 'SE',
    bodyStyle: 'Sedan',
    vin: 'DEMO123456789',
    mileage: 15000,
    status: 'available',
    engine: {
      displacement: '2.5L',
      cylinders: 4,
      fuelType: 'Gasoline',
      transmission: 'Automatic',
      drivetrain: 'FWD'
    },
    color: {
      exterior: 'Pearl White',
      interior: 'Black'
    },
    price: {
      cost: 25000,
      msrp: 28000,
      salePrice: 26500
    },
    features: ['Bluetooth', 'Backup Camera', 'Lane Departure Warning'],
    images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400'],
    description: 'Excellent condition, one owner, full service history',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    _id: 'demo-2',
    year: 2022,
    make: 'Honda',
    model: 'CR-V',
    trim: 'EX-L',
    bodyStyle: 'SUV',
    vin: 'DEMO987654321',
    mileage: 22000,
    status: 'available',
    engine: {
      displacement: '1.5L',
      cylinders: 4,
      fuelType: 'Gasoline',
      transmission: 'CVT',
      drivetrain: 'AWD'
    },
    color: {
      exterior: 'Sonic Gray Pearl',
      interior: 'Black'
    },
    price: {
      cost: 28000,
      msrp: 32000,
      salePrice: 29500
    },
    features: ['Apple CarPlay', 'Android Auto', 'Honda Sensing', 'Power Liftgate'],
    images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400'],
    description: 'Well maintained, clean Carfax, great family vehicle',
    createdAt: '2024-01-10T14:30:00Z'
  },
  {
    _id: 'demo-3',
    year: 2021,
    make: 'Ford',
    model: 'F-150',
    trim: 'XLT',
    bodyStyle: 'Pickup Truck',
    vin: 'DEMO456789123',
    mileage: 35000,
    status: 'reserved',
    engine: {
      displacement: '3.5L',
      cylinders: 6,
      fuelType: 'Gasoline',
      transmission: 'Automatic',
      drivetrain: '4WD'
    },
    color: {
      exterior: 'Oxford White',
      interior: 'Black'
    },
    price: {
      cost: 35000,
      msrp: 42000,
      salePrice: 38500
    },
    features: ['SYNC 4', 'Pro Trailer Backup Assist', '360-Degree Camera'],
    images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400'],
    description: 'Powerful V6 engine, excellent towing capacity',
    createdAt: '2024-01-05T09:15:00Z'
  },
  {
    _id: 'demo-4',
    year: 2023,
    make: 'BMW',
    model: '3 Series',
    trim: '330i',
    bodyStyle: 'Sedan',
    vin: 'DEMO789123456',
    mileage: 8000,
    status: 'available',
    engine: {
      displacement: '2.0L',
      cylinders: 4,
      fuelType: 'Gasoline',
      transmission: 'Automatic',
      drivetrain: 'RWD'
    },
    color: {
      exterior: 'Alpine White',
      interior: 'Cognac'
    },
    price: {
      cost: 42000,
      msrp: 48000,
      salePrice: 44500
    },
    features: ['iDrive 7.0', 'Live Cockpit Professional', 'Parking Assistant'],
    images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400'],
    description: 'Luxury sedan with premium features and performance',
    createdAt: '2024-01-20T11:45:00Z'
  },
  {
    _id: 'demo-5',
    year: 2022,
    make: 'Nissan',
    model: 'Rogue',
    trim: 'SL',
    bodyStyle: 'SUV',
    vin: 'DEMO321654987',
    mileage: 18000,
    status: 'in_service',
    engine: {
      displacement: '2.5L',
      cylinders: 4,
      fuelType: 'Gasoline',
      transmission: 'CVT',
      drivetrain: 'AWD'
    },
    color: {
      exterior: 'Super Black',
      interior: 'Charcoal'
    },
    price: {
      cost: 26000,
      msrp: 30000,
      salePrice: 27500
    },
    features: ['Nissan Safety Shield 360', 'ProPILOT Assist', 'Apple CarPlay'],
    images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400'],
    description: 'Comfortable crossover with advanced safety features',
    createdAt: '2024-01-12T16:20:00Z'
  },
  {
    _id: 'demo-6',
    year: 2021,
    make: 'Chevrolet',
    model: 'Silverado',
    trim: 'LT',
    bodyStyle: 'Pickup Truck',
    vin: 'DEMO147258369',
    mileage: 42000,
    status: 'maintenance',
    engine: {
      displacement: '5.3L',
      cylinders: 8,
      fuelType: 'Gasoline',
      transmission: 'Automatic',
      drivetrain: '4WD'
    },
    color: {
      exterior: 'Summit White',
      interior: 'Jet Black'
    },
    price: {
      cost: 38000,
      msrp: 45000,
      salePrice: 41000
    },
    features: ['Chevrolet Infotainment 3', 'Trailering Package', 'Bed Liner'],
    images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400'],
    description: 'Full-size truck with excellent towing and payload capacity',
    createdAt: '2024-01-08T13:10:00Z'
  }
];

// Helper function to simulate API delay
const simulateApiDelay = () => new Promise(resolve => setTimeout(resolve, 500));

// Helper function to filter and paginate demo data
const filterAndPaginateVehicles = (vehicles, params = {}) => {
  let filtered = [...vehicles];
  
  // Apply search filter
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(vehicle => 
      vehicle.make.toLowerCase().includes(searchLower) ||
      vehicle.model.toLowerCase().includes(searchLower) ||
      vehicle.trim.toLowerCase().includes(searchLower) ||
      vehicle.vin.toLowerCase().includes(searchLower)
    );
  }
  
  // Apply status filter
  if (params.status && params.status !== 'all') {
    filtered = filtered.filter(vehicle => vehicle.status === params.status);
  }
  
  // Apply make filter
  if (params.make && params.make !== 'all') {
    filtered = filtered.filter(vehicle => vehicle.make === params.make);
  }
  
  // Apply year filter
  if (params.year) {
    filtered = filtered.filter(vehicle => vehicle.year === parseInt(params.year));
  }
  
  // Apply price range filter
  if (params.minPrice || params.maxPrice) {
    filtered = filtered.filter(vehicle => {
      const price = vehicle.price.salePrice;
      if (params.minPrice && price < params.minPrice) return false;
      if (params.maxPrice && price > params.maxPrice) return false;
      return true;
    });
  }
  
  // Apply sorting
  if (params.sortBy) {
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (params.sortBy) {
        case 'year':
          aVal = a.year;
          bVal = b.year;
          break;
        case 'price':
          aVal = a.price.salePrice;
          bVal = b.price.salePrice;
          break;
        case 'mileage':
          aVal = a.mileage;
          bVal = b.mileage;
          break;
        case 'createdAt':
          aVal = new Date(a.createdAt);
          bVal = new Date(b.createdAt);
          break;
        default:
          aVal = a[params.sortBy];
          bVal = b[params.sortBy];
      }
      
      if (params.sortOrder === 'desc') {
        return bVal > aVal ? 1 : -1;
      }
      return aVal > bVal ? 1 : -1;
    });
  }
  
  // Apply pagination
  const page = params.page || 1;
  const limit = params.limit || 12;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    vehicles: filtered.slice(startIndex, endIndex),
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(filtered.length / limit),
      totalItems: filtered.length,
      itemsPerPage: limit
    }
  };
};

// Vehicle API calls with fallback to demo data
export const vehicleAPI = {
  getVehicles: async (params = {}) => {
    try {
      const response = await api.get('/vehicles', { params });
      return response;
    } catch (error) {
      // If backend is not available, return demo data
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, using demo vehicle data...');
        await simulateApiDelay();
        
        const result = filterAndPaginateVehicles(demoVehicles, params);
        return {
          data: result.vehicles,
          count: result.pagination.totalItems,
          pagination: result.pagination
        };
      }
      throw error;
    }
  },
  
  getVehicle: async (id) => {
    try {
      const response = await api.get(`/vehicles/${id}`);
      return response;
    } catch (error) {
      // If backend is not available, return demo data
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, using demo vehicle data...');
        await simulateApiDelay();
        
        const vehicle = demoVehicles.find(v => v._id === id);
        if (vehicle) {
          return {
            data: vehicle
          };
        }
        throw new Error('Vehicle not found');
      }
      throw error;
    }
  },
  
  createVehicle: async (vehicleData) => {
    try {
      const response = await api.post('/vehicles', vehicleData);
      return response;
    } catch (error) {
      // If backend is not available, simulate success
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, simulating vehicle creation...');
        await simulateApiDelay();
        
        const newVehicle = {
          _id: 'demo-new-' + Date.now(),
          ...vehicleData,
          createdAt: new Date().toISOString()
        };
        
        demoVehicles.push(newVehicle);
        
        return {
          data: newVehicle
        };
      }
      throw error;
    }
  },
  
  updateVehicle: async (id, vehicleData) => {
    try {
      const response = await api.put(`/vehicles/${id}`, vehicleData);
      return response;
    } catch (error) {
      // If backend is not available, simulate success
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, simulating vehicle update...');
        await simulateApiDelay();
        
        const vehicleIndex = demoVehicles.findIndex(v => v._id === id);
        if (vehicleIndex !== -1) {
          demoVehicles[vehicleIndex] = { ...demoVehicles[vehicleIndex], ...vehicleData };
          return {
            data: {
              success: true,
              data: demoVehicles[vehicleIndex]
            }
          };
        }
        throw new Error('Vehicle not found');
      }
      throw error;
    }
  },
  
  deleteVehicle: async (id) => {
    try {
      const response = await api.delete(`/vehicles/${id}`);
      return response;
    } catch (error) {
      // If backend is not available, simulate success
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, simulating vehicle deletion...');
        await simulateApiDelay();
        
        const vehicleIndex = demoVehicles.findIndex(v => v._id === id);
        if (vehicleIndex !== -1) {
          demoVehicles.splice(vehicleIndex, 1);
          return {
            data: {
              success: true,
              message: 'Vehicle deleted successfully'
            }
          };
        }
        throw new Error('Vehicle not found');
      }
      throw error;
    }
  },
  
  searchVehicles: async (query, filters) => {
    try {
      const response = await api.get('/vehicles/search', { params: { q: query, filters: JSON.stringify(filters) } });
      return response;
    } catch (error) {
      // If backend is not available, return demo data
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, using demo vehicle search...');
        await simulateApiDelay();
        
        const result = filterAndPaginateVehicles(demoVehicles, { search: query, ...filters });
        return {
          data: result.vehicles,
          count: result.pagination.totalItems,
          pagination: result.pagination
        };
      }
      throw error;
    }
  },
  
  getSearchSuggestions: async (query) => {
    try {
      const response = await api.get('/vehicles/suggestions', { params: { q: query } });
      return response;
    } catch (error) {
      // If backend is not available, return demo suggestions
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, using demo search suggestions...');
        await simulateApiDelay();
        
        const suggestions = demoVehicles
          .filter(vehicle => 
            vehicle.make.toLowerCase().includes(query.toLowerCase()) ||
            vehicle.model.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 5)
          .map(vehicle => ({
            text: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
            value: vehicle._id
          }));
        
        return {
          data: {
            success: true,
            data: suggestions
          }
        };
      }
      throw error;
    }
  },
  
  getFeaturedVehicles: async (limit = 6) => {
    try {
      const response = await api.get('/vehicles/featured', { params: { limit } });
      return response;
    } catch (error) {
      // If backend is not available, return demo data
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, using demo featured vehicles...');
        await simulateApiDelay();
        
        return {
          data: demoVehicles.slice(0, limit)
        };
      }
      throw error;
    }
  },
  
  getVehicleStats: async () => {
    try {
      const response = await api.get('/vehicles/stats/overview');
      return response;
    } catch (error) {
      // If backend is not available, return demo stats
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, using demo vehicle stats...');
        await simulateApiDelay();
        
        const stats = {
          total: demoVehicles.length,
          available: demoVehicles.filter(v => v.status === 'available').length,
          sold: demoVehicles.filter(v => v.status === 'sold').length,
          reserved: demoVehicles.filter(v => v.status === 'reserved').length,
          inService: demoVehicles.filter(v => v.status === 'in_service').length,
          maintenance: demoVehicles.filter(v => v.status === 'maintenance').length,
          totalValue: demoVehicles.reduce((sum, v) => sum + (v.price.salePrice || 0), 0),
          averagePrice: demoVehicles.reduce((sum, v) => sum + (v.price.salePrice || 0), 0) / demoVehicles.length
        };
        
        return {
          data: {
            success: true,
            data: stats
          }
        };
      }
      throw error;
    }
  },
  
  updateVehicleStatus: async (id, status, notes) => {
    try {
      const response = await api.patch(`/vehicles/${id}/status`, { status, notes });
      return response;
    } catch (error) {
      // If backend is not available, simulate success
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, simulating status update...');
        await simulateApiDelay();
        
        const vehicle = demoVehicles.find(v => v._id === id);
        if (vehicle) {
          vehicle.status = status;
          return {
            data: {
              success: true,
              data: vehicle
            }
          };
        }
        throw new Error('Vehicle not found');
      }
      throw error;
    }
  },
  
  uploadVehicleImages: async (id, formData) => {
    try {
      const response = await api.put(`/vehicles/${id}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response;
    } catch (error) {
      // If backend is not available, simulate success
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, simulating image upload...');
        await simulateApiDelay();
        
        return {
          data: {
            success: true,
            message: 'Images uploaded successfully (simulated)'
          }
        };
      }
      throw error;
    }
  },
  
  getVehicleHistory: async (id) => {
    try {
      const response = await api.get(`/vehicles/${id}/history`);
      return response;
    } catch (error) {
      // If backend is not available, return demo history
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, using demo vehicle history...');
        await simulateApiDelay();
        
        const demoHistory = [
          {
            id: '1',
            action: 'Vehicle Added',
            description: 'Vehicle added to inventory',
            timestamp: new Date().toISOString(),
            user: 'Demo User'
          },
          {
            id: '2',
            action: 'Status Updated',
            description: 'Status changed to Available',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            user: 'Demo User'
          }
        ];
        
        return {
          data: {
            success: true,
            data: demoHistory
          }
        };
      }
      throw error;
    }
  },
};

// Customer API calls
export const customerAPI = {
  getCustomers: (params = {}) => 
    api.get('/customers', { params }),
  
  getCustomer: (id) => 
    api.get(`/customers/${id}`),
  
  createCustomer: (customerData) => 
    api.post('/customers', customerData),
  
  updateCustomer: (id, customerData) => 
    api.put(`/customers/${id}`, customerData),
  
  deleteCustomer: (id) => 
    api.delete(`/customers/${id}`),
  
  getCustomerDashboard: (id) => 
    api.get(`/customers/${id}/dashboard`),
  
  addCustomerNote: (id, noteData) => 
    api.post(`/customers/${id}/notes`, noteData),
  
  scheduleTestDrive: (id, testDriveData) => 
    api.post(`/customers/${id}/test-drives`, testDriveData),
  
  getCustomersNeedingFollowUp: () => 
    api.get('/customers/follow-up'),
  
  updateCustomerFollowUp: (id, followUpData) => 
    api.patch(`/customers/${id}/follow-up`, followUpData),
  
  getCustomerStats: () => 
    api.get('/customers/stats/overview'),
  
  assignCustomerToAgent: (id, salesAgentId) => 
    api.patch(`/customers/${id}/assign`, { salesAgentId }),
};

// Service API calls
export const serviceAPI = {
  getServices: (params = {}) => 
    api.get('/services', { params }),
  
  getService: (id) => 
    api.get(`/services/${id}`),
  
  createService: (serviceData) => 
    api.post('/services', serviceData),
  
  updateService: (id, serviceData) => 
    api.put(`/services/${id}`, serviceData),
  
  deleteService: (id) => 
    api.delete(`/services/${id}`),
  
  startService: (id) => 
    api.patch(`/services/${id}/start`),
  
  completeService: (id, completionData) => 
    api.patch(`/services/${id}/complete`, completionData),
  
  addPartToService: (id, partData) => 
    api.post(`/services/${id}/parts`, partData),
  
  addServiceItem: (id, serviceItemData) => 
    api.post(`/services/${id}/service-items`, serviceItemData),
  
  getTodayServices: () => 
    api.get('/services/today'),
  
  getOverdueServices: () => 
    api.get('/services/overdue'),
  
  getServiceStats: () => 
    api.get('/services/stats/overview'),
  
  getTechnicianWorkload: (technicianId) => 
    api.get(`/services/technician/${technicianId}/workload`),
  
  updateServiceStatus: (id, status, notes) => 
    api.patch(`/services/${id}/status`, { status, notes }),
};

// Demo sales data for offline mode
const demoSales = [
  {
    _id: 'demo-sale-1',
    saleId: 'SALE-001',
    customer: {
      _id: 'demo-customer-1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@email.com',
      phone: '555-0101'
    },
    vehicle: {
      _id: 'demo-vehicle-1',
      year: 2023,
      make: 'Toyota',
      model: 'Camry',
      trim: 'SE',
      vin: 'DEMO123456789'
    },
    salesAgent: {
      _id: 'demo-agent-1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@dealership.com'
    },
    status: 'completed',
    saleType: 'financed',
    saleDate: '2024-01-15T10:00:00Z',
    deliveryDate: '2024-01-20T14:00:00Z',
    actualDeliveryDate: '2024-01-20T14:30:00Z',
    pricing: {
      msrp: 28000,
      discount: 2000,
      tradeInValue: 5000,
      downPayment: 3000,
      financingAmount: 20000,
      finalPrice: 26000
    },
    payments: [
      {
        type: 'down_payment',
        amount: 3000,
        method: 'cash',
        date: '2024-01-15T10:00:00Z'
      }
    ],
    documents: [
      {
        type: 'bill_of_sale',
        filename: 'bill_of_sale_001.pdf',
        uploadedAt: '2024-01-15T10:00:00Z'
      }
    ]
  },
  {
    _id: 'demo-sale-2',
    saleId: 'SALE-002',
    customer: {
      _id: 'demo-customer-2',
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@email.com',
      phone: '555-0102'
    },
    vehicle: {
      _id: 'demo-vehicle-2',
      year: 2022,
      make: 'Honda',
      model: 'CR-V',
      trim: 'EX-L',
      vin: 'DEMO987654321'
    },
    salesAgent: {
      _id: 'demo-agent-2',
      firstName: 'Mike',
      lastName: 'Wilson',
      email: 'mike.wilson@dealership.com'
    },
    status: 'pending',
    saleType: 'cash',
    saleDate: '2024-01-18T14:00:00Z',
    deliveryDate: '2024-01-25T10:00:00Z',
    pricing: {
      msrp: 32000,
      discount: 1500,
      tradeInValue: 0,
      downPayment: 32000,
      financingAmount: 0,
      finalPrice: 30500
    },
    payments: [],
    documents: []
  },
  {
    _id: 'demo-sale-3',
    saleId: 'SALE-003',
    customer: {
      _id: 'demo-customer-3',
      firstName: 'Robert',
      lastName: 'Brown',
      email: 'robert.brown@email.com',
      phone: '555-0103'
    },
    vehicle: {
      _id: 'demo-vehicle-3',
      year: 2021,
      make: 'Ford',
      model: 'F-150',
      trim: 'XLT',
      vin: 'DEMO456789123'
    },
    salesAgent: {
      _id: 'demo-agent-1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@dealership.com'
    },
    status: 'approved',
    saleType: 'leased',
    saleDate: '2024-01-20T09:00:00Z',
    deliveryDate: '2024-01-27T11:00:00Z',
    pricing: {
      msrp: 42000,
      discount: 3000,
      tradeInValue: 8000,
      downPayment: 2000,
      financingAmount: 32000,
      finalPrice: 39000
    },
    payments: [
      {
        type: 'down_payment',
        amount: 2000,
        method: 'check',
        date: '2024-01-20T09:00:00Z'
      }
    ],
    documents: []
  }
];

// Sale API calls with fallback to demo data
export const saleAPI = {
  getSales: async (params = {}) => {
    try {
      const response = await api.get('/sales', { params });
      return response;
    } catch (error) {
      // If backend is not available, return demo data
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, using demo sales data...');
        await simulateApiDelay();
        
        let filteredSales = [...demoSales];
        
        // Apply search filter
        if (params.search) {
          const searchLower = params.search.toLowerCase();
          filteredSales = filteredSales.filter(sale => 
            sale.customer.firstName.toLowerCase().includes(searchLower) ||
            sale.customer.lastName.toLowerCase().includes(searchLower) ||
            sale.vehicle.make.toLowerCase().includes(searchLower) ||
            sale.vehicle.model.toLowerCase().includes(searchLower) ||
            sale.saleId.toLowerCase().includes(searchLower)
          );
        }
        
        // Apply status filter
        if (params.status && params.status !== '') {
          filteredSales = filteredSales.filter(sale => sale.status === params.status);
        }
        
        // Apply sale type filter
        if (params.saleType && params.saleType !== '') {
          filteredSales = filteredSales.filter(sale => sale.saleType === params.saleType);
        }
        
        // Apply date range filter
        if (params.dateFrom || params.dateTo) {
          filteredSales = filteredSales.filter(sale => {
            const saleDate = new Date(sale.saleDate);
            if (params.dateFrom && saleDate < new Date(params.dateFrom)) return false;
            if (params.dateTo && saleDate > new Date(params.dateTo)) return false;
            return true;
          });
        }
        
        // Apply amount range filter
        if (params.minAmount || params.maxAmount) {
          filteredSales = filteredSales.filter(sale => {
            const amount = sale.pricing.finalPrice;
            if (params.minAmount && amount < parseFloat(params.minAmount)) return false;
            if (params.maxAmount && amount > parseFloat(params.maxAmount)) return false;
            return true;
          });
        }
        
        // Apply sorting
        if (params.sortBy) {
          filteredSales.sort((a, b) => {
            let aVal, bVal;
            
            switch (params.sortBy) {
              case 'saleDate':
                aVal = new Date(a.saleDate);
                bVal = new Date(b.saleDate);
                break;
              case 'pricing.finalPrice':
                aVal = a.pricing.finalPrice;
                bVal = b.pricing.finalPrice;
                break;
              default:
                aVal = a[params.sortBy];
                bVal = b[params.sortBy];
            }
            
            if (params.sortOrder === 'desc') {
              return bVal > aVal ? 1 : -1;
            }
            return aVal > bVal ? 1 : -1;
          });
        }
        
        // Apply pagination
        const page = params.page || 1;
        const limit = params.limit || 25;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        return {
          data: filteredSales.slice(startIndex, endIndex),
          total: filteredSales.length,
          page: page,
          limit: limit,
          totalPages: Math.ceil(filteredSales.length / limit)
        };
      }
      throw error;
    }
  },
  
  getSale: async (id) => {
    try {
      const response = await api.get(`/sales/${id}`);
      return response;
    } catch (error) {
      // If backend is not available, return demo data
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, using demo sale data...');
        await simulateApiDelay();
        
        const sale = demoSales.find(s => s._id === id);
        if (sale) {
          return {
            data: sale
          };
        }
        throw new Error('Sale not found');
      }
      throw error;
    }
  },
  
  createSale: async (saleData) => {
    try {
      const response = await api.post('/sales', saleData);
      return response;
    } catch (error) {
      // If backend is not available, simulate success
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, simulating sale creation...');
        await simulateApiDelay();
        
        const newSale = {
          _id: 'demo-new-sale-' + Date.now(),
          ...saleData,
          saleId: 'SALE-' + String(Date.now()).slice(-6),
          saleDate: new Date().toISOString()
        };
        
        demoSales.push(newSale);
        
        return {
          data: newSale
        };
      }
      throw error;
    }
  },
  
  updateSale: async (id, saleData) => {
    try {
      const response = await api.put(`/sales/${id}`, saleData);
      return response;
    } catch (error) {
      // If backend is not available, simulate success
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, simulating sale update...');
        await simulateApiDelay();
        
        const saleIndex = demoSales.findIndex(s => s._id === id);
        if (saleIndex !== -1) {
          demoSales[saleIndex] = { ...demoSales[saleIndex], ...saleData };
          return {
            data: demoSales[saleIndex]
          };
        }
        throw new Error('Sale not found');
      }
      throw error;
    }
  },
  
  deleteSale: async (id) => {
    try {
      const response = await api.delete(`/sales/${id}`);
      return response;
    } catch (error) {
      // If backend is not available, simulate success
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, simulating sale deletion...');
        await simulateApiDelay();
        
        const saleIndex = demoSales.findIndex(s => s._id === id);
        if (saleIndex !== -1) {
          demoSales.splice(saleIndex, 1);
          return {
            data: {
              success: true,
              message: 'Sale deleted successfully'
            }
          };
        }
        throw new Error('Sale not found');
      }
      throw error;
    }
  },
  
  approveSale: async (id) => {
    try {
      const response = await api.patch(`/sales/${id}/approve`);
      return response;
    } catch (error) {
      // If backend is not available, simulate success
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, simulating sale approval...');
        await simulateApiDelay();
        
        const sale = demoSales.find(s => s._id === id);
        if (sale) {
          sale.status = 'approved';
          return {
            data: sale
          };
        }
        throw new Error('Sale not found');
      }
      throw error;
    }
  },
  
  completeSale: async (id) => {
    try {
      const response = await api.patch(`/sales/${id}/complete`);
      return response;
    } catch (error) {
      // If backend is not available, simulate success
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, simulating sale completion...');
        await simulateApiDelay();
        
        const sale = demoSales.find(s => s._id === id);
        if (sale) {
          sale.status = 'completed';
          return {
            data: sale
          };
        }
        throw new Error('Sale not found');
      }
      throw error;
    }
  },
  
  cancelSale: async (id) => {
    try {
      const response = await api.patch(`/sales/${id}/cancel`);
      return response;
    } catch (error) {
      // If backend is not available, simulate success
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, simulating sale cancellation...');
        await simulateApiDelay();
        
        const sale = demoSales.find(s => s._id === id);
        if (sale) {
          sale.status = 'cancelled';
          return {
            data: sale
          };
        }
        throw new Error('Sale not found');
      }
      throw error;
    }
  },
  
  addPayment: async (id, paymentData) => {
    try {
      const response = await api.post(`/sales/${id}/payments`, paymentData);
      return response;
    } catch (error) {
      // If backend is not available, simulate success
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, simulating payment addition...');
        await simulateApiDelay();
        
        const sale = demoSales.find(s => s._id === id);
        if (sale) {
          if (!sale.payments) sale.payments = [];
          sale.payments.push({
            ...paymentData,
            id: 'payment-' + Date.now(),
            date: new Date().toISOString()
          });
          return {
            data: sale
          };
        }
        throw new Error('Sale not found');
      }
      throw error;
    }
  },
  
  addDocument: async (id, documentData) => {
    try {
      const response = await api.post(`/sales/${id}/documents`, documentData);
      return response;
    } catch (error) {
      // If backend is not available, simulate success
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, simulating document addition...');
        await simulateApiDelay();
        
        const sale = demoSales.find(s => s._id === id);
        if (sale) {
          if (!sale.documents) sale.documents = [];
          sale.documents.push({
            ...documentData,
            uploadedAt: new Date().toISOString()
          });
          return {
            data: sale
          };
        }
        throw new Error('Sale not found');
      }
      throw error;
    }
  },
  
  getSaleStats: async () => {
    try {
      const response = await api.get('/sales/stats/overview');
      return response;
    } catch (error) {
      // If backend is not available, return demo stats
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, using demo sales stats...');
        await simulateApiDelay();
        
        const stats = {
          totalSales: demoSales.length,
          totalRevenue: demoSales.reduce((sum, sale) => sum + sale.pricing.finalPrice, 0),
          averageSalePrice: demoSales.reduce((sum, sale) => sum + sale.pricing.finalPrice, 0) / demoSales.length,
          completedSales: demoSales.filter(sale => sale.status === 'completed').length,
          pendingSales: demoSales.filter(sale => sale.status === 'pending').length,
          approvedSales: demoSales.filter(sale => sale.status === 'approved').length,
          cancelledSales: demoSales.filter(sale => sale.status === 'cancelled').length
        };
        
        return {
          data: stats
        };
      }
      throw error;
    }
  },
};

// Demo inventory data for offline mode
const demoInventory = [
  {
    _id: 'demo-inv-1',
    sku: 'OIL-001',
    name: 'Synthetic Motor Oil 5W-30',
    description: 'High-performance synthetic motor oil for modern engines',
    category: 'Lubricants',
    subcategory: 'Motor Oil',
    brand: 'Mobil',
    manufacturer: 'ExxonMobil',
    stock: {
      quantity: 45,
      reserved: 5,
      minimumStock: 10,
      maximumStock: 100,
      reorderPoint: 15,
      reorderQuantity: 50
    },
    pricing: {
      cost: 8.50,
      salePrice: 12.99,
      msrp: 14.99
    },
    location: {
      warehouse: 'Main',
      aisle: 'A',
      shelf: '1',
      bin: '01'
    },
    supplier: {
      name: 'ExxonMobil Distributor',
      contact: {
        person: 'John Supplier',
        phone: '555-1001',
        email: 'john@supplier.com'
      },
      leadTime: 7,
      minimumOrder: 100
    },
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    _id: 'demo-inv-2',
    sku: 'FILT-001',
    name: 'Oil Filter Premium',
    description: 'High-quality oil filter for most vehicles',
    category: 'Filters',
    subcategory: 'Oil Filter',
    brand: 'Fram',
    manufacturer: 'Fram Group',
    stock: {
      quantity: 8,
      reserved: 2,
      minimumStock: 5,
      maximumStock: 50,
      reorderPoint: 8,
      reorderQuantity: 25
    },
    pricing: {
      cost: 4.25,
      salePrice: 7.99,
      msrp: 9.99
    },
    location: {
      warehouse: 'Main',
      aisle: 'B',
      shelf: '2',
      bin: '05'
    },
    supplier: {
      name: 'Fram Distributor',
      contact: {
        person: 'Sarah Supplier',
        phone: '555-1002',
        email: 'sarah@supplier.com'
      },
      leadTime: 5,
      minimumOrder: 50
    },
    status: 'active',
    createdAt: '2024-01-02T00:00:00Z'
  },
  {
    _id: 'demo-inv-3',
    sku: 'BRAKE-001',
    name: 'Ceramic Brake Pads',
    description: 'Premium ceramic brake pads for quiet operation',
    category: 'Brakes',
    subcategory: 'Brake Pads',
    brand: 'Wagner',
    manufacturer: 'Federal-Mogul',
    stock: {
      quantity: 0,
      reserved: 0,
      minimumStock: 3,
      maximumStock: 20,
      reorderPoint: 5,
      reorderQuantity: 15
    },
    pricing: {
      cost: 35.00,
      salePrice: 59.99,
      msrp: 69.99
    },
    location: {
      warehouse: 'Main',
      aisle: 'C',
      shelf: '3',
      bin: '10'
    },
    supplier: {
      name: 'Wagner Distributor',
      contact: {
        person: 'Mike Supplier',
        phone: '555-1003',
        email: 'mike@supplier.com'
      },
      leadTime: 10,
      minimumOrder: 25
    },
    status: 'active',
    createdAt: '2024-01-03T00:00:00Z'
  },
  {
    _id: 'demo-inv-4',
    sku: 'BATT-001',
    name: 'Car Battery 12V',
    description: 'High-performance car battery with 3-year warranty',
    category: 'Electrical',
    subcategory: 'Batteries',
    brand: 'Interstate',
    manufacturer: 'Interstate Batteries',
    stock: {
      quantity: 12,
      reserved: 1,
      minimumStock: 5,
      maximumStock: 30,
      reorderPoint: 8,
      reorderQuantity: 20
    },
    pricing: {
      cost: 65.00,
      salePrice: 99.99,
      msrp: 119.99
    },
    location: {
      warehouse: 'Main',
      aisle: 'D',
      shelf: '4',
      bin: '15'
    },
    supplier: {
      name: 'Interstate Distributor',
      contact: {
        person: 'Lisa Supplier',
        phone: '555-1004',
        email: 'lisa@supplier.com'
      },
      leadTime: 3,
      minimumOrder: 10
    },
    status: 'active',
    createdAt: '2024-01-04T00:00:00Z'
  },
  {
    _id: 'demo-inv-5',
    sku: 'TIRE-001',
    name: 'All-Season Tires 205/55R16',
    description: 'High-performance all-season tires for passenger cars',
    category: 'Tires',
    subcategory: 'Passenger Tires',
    brand: 'Michelin',
    manufacturer: 'Michelin Group',
    stock: {
      quantity: 25,
      reserved: 8,
      minimumStock: 10,
      maximumStock: 100,
      reorderPoint: 20,
      reorderQuantity: 50
    },
    pricing: {
      cost: 85.00,
      salePrice: 129.99,
      msrp: 149.99
    },
    location: {
      warehouse: 'Tire Storage',
      aisle: 'T1',
      shelf: '1',
      bin: '01'
    },
    supplier: {
      name: 'Michelin Distributor',
      contact: {
        person: 'David Supplier',
        phone: '555-1005',
        email: 'david@supplier.com'
      },
      leadTime: 14,
      minimumOrder: 20
    },
    status: 'active',
    createdAt: '2024-01-05T00:00:00Z'
  }
];

// Inventory API calls with fallback to demo data
export const inventoryAPI = {
  getInventory: async (params = {}) => {
    try {
      const response = await api.get('/inventory', { params });
      return response;
    } catch (error) {
      // If backend is not available, return demo data
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, using demo inventory data...');
        await simulateApiDelay();
        
        let filteredInventory = [...demoInventory];
        
        // Apply search filter
        if (params.search) {
          const searchLower = params.search.toLowerCase();
          filteredInventory = filteredInventory.filter(item => 
            item.name.toLowerCase().includes(searchLower) ||
            item.sku.toLowerCase().includes(searchLower) ||
            item.description.toLowerCase().includes(searchLower) ||
            item.brand.toLowerCase().includes(searchLower)
          );
        }
        
        // Apply category filter
        if (params.category && params.category !== '') {
          filteredInventory = filteredInventory.filter(item => item.category === params.category);
        }
        
        // Apply subcategory filter
        if (params.subcategory && params.subcategory !== '') {
          filteredInventory = filteredInventory.filter(item => item.subcategory === params.subcategory);
        }
        
        // Apply brand filter
        if (params.brand && params.brand !== '') {
          filteredInventory = filteredInventory.filter(item => item.brand === params.brand);
        }
        
        // Apply stock status filter
        if (params.stockStatus && params.stockStatus !== '') {
          filteredInventory = filteredInventory.filter(item => {
            const quantity = item.stock.quantity;
            if (params.stockStatus === 'out-of-stock') return quantity === 0;
            if (params.stockStatus === 'low-stock') return quantity <= 5 && quantity > 0;
            if (params.stockStatus === 'in-stock') return quantity > 5;
            return true;
          });
        }
        
        // Apply price range filter
        if (params.minPrice || params.maxPrice) {
          filteredInventory = filteredInventory.filter(item => {
            const price = item.pricing.salePrice;
            if (params.minPrice && price < parseFloat(params.minPrice)) return false;
            if (params.maxPrice && price > parseFloat(params.maxPrice)) return false;
            return true;
          });
        }
        
        // Apply sorting
        if (params.sortBy) {
          filteredInventory.sort((a, b) => {
            let aVal, bVal;
            
            switch (params.sortBy) {
              case 'name':
                aVal = a.name.toLowerCase();
                bVal = b.name.toLowerCase();
                break;
              case 'stock.quantity':
                aVal = a.stock.quantity;
                bVal = b.stock.quantity;
                break;
              case 'pricing.salePrice':
                aVal = a.pricing.salePrice;
                bVal = b.pricing.salePrice;
                break;
              default:
                aVal = a[params.sortBy];
                bVal = b[params.sortBy];
            }
            
            if (params.sortOrder === 'desc') {
              return bVal > aVal ? 1 : -1;
            }
            return aVal > bVal ? 1 : -1;
          });
        }
        
        // Apply pagination
        const page = params.page || 1;
        const limit = params.limit || 25;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        return {
          data: filteredInventory.slice(startIndex, endIndex),
          total: filteredInventory.length,
          page: page,
          limit: limit,
          totalPages: Math.ceil(filteredInventory.length / limit)
        };
      }
      throw error;
    }
  },
  
  getInventoryItem: async (id) => {
    try {
      const response = await api.get(`/inventory/${id}`);
      return response;
    } catch (error) {
      // If backend is not available, return demo data
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, using demo inventory data...');
        await simulateApiDelay();
        
        const item = demoInventory.find(i => i._id === id);
        if (item) {
          return {
            data: item
          };
        }
        throw new Error('Inventory item not found');
      }
      throw error;
    }
  },
  
  createInventoryItem: async (itemData) => {
    try {
      const response = await api.post('/inventory', itemData);
      return response;
    } catch (error) {
      // If backend is not available, simulate success
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, simulating inventory item creation...');
        await simulateApiDelay();
        
        const newItem = {
          _id: 'demo-new-inv-' + Date.now(),
          ...itemData,
          createdAt: new Date().toISOString()
        };
        
        demoInventory.push(newItem);
        
        return {
          data: newItem
        };
      }
      throw error;
    }
  },
  
  updateInventoryItem: async (id, itemData) => {
    try {
      const response = await api.put(`/inventory/${id}`, itemData);
      return response;
    } catch (error) {
      // If backend is not available, simulate success
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, simulating inventory item update...');
        await simulateApiDelay();
        
        const itemIndex = demoInventory.findIndex(i => i._id === id);
        if (itemIndex !== -1) {
          demoInventory[itemIndex] = { ...demoInventory[itemIndex], ...itemData };
          return {
            data: demoInventory[itemIndex]
          };
        }
        throw new Error('Inventory item not found');
      }
      throw error;
    }
  },
  
  deleteInventoryItem: async (id) => {
    try {
      const response = await api.delete(`/inventory/${id}`);
      return response;
    } catch (error) {
      // If backend is not available, simulate success
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, simulating inventory item deletion...');
        await simulateApiDelay();
        
        const itemIndex = demoInventory.findIndex(i => i._id === id);
        if (itemIndex !== -1) {
          demoInventory.splice(itemIndex, 1);
          return {
            data: {
              success: true,
              message: 'Inventory item deleted successfully'
            }
          };
        }
        throw new Error('Inventory item not found');
      }
      throw error;
    }
  },
  
  searchInventory: async (query, filters) => {
    try {
      const response = await api.get('/inventory/search', { params: { q: query, filters: JSON.stringify(filters) } });
      return response;
    } catch (error) {
      // If backend is not available, return demo data
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, using demo inventory search...');
        await simulateApiDelay();
        
        const result = await inventoryAPI.getInventory({ search: query, ...filters });
        return result;
      }
      throw error;
    }
  },
  
  getLowStockItems: async () => {
    try {
      const response = await api.get('/inventory/low-stock');
      return response;
    } catch (error) {
      // If backend is not available, return demo data
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, using demo low stock data...');
        await simulateApiDelay();
        
        const lowStockItems = demoInventory.filter(item => 
          item.stock.quantity <= item.stock.reorderPoint && item.stock.quantity > 0
        );
        
        return {
          data: lowStockItems
        };
      }
      throw error;
    }
  },
  
  getOutOfStockItems: async () => {
    try {
      const response = await api.get('/inventory/out-of-stock');
      return response;
    } catch (error) {
      // If backend is not available, return demo data
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, using demo out of stock data...');
        await simulateApiDelay();
        
        const outOfStockItems = demoInventory.filter(item => item.stock.quantity === 0);
        
        return {
          data: outOfStockItems
        };
      }
      throw error;
    }
  },
  
  reserveQuantity: async (id, quantity) => {
    try {
      const response = await api.post(`/inventory/${id}/reserve`, { quantity });
      return response;
    } catch (error) {
      // If backend is not available, simulate success
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, simulating quantity reservation...');
        await simulateApiDelay();
        
        const item = demoInventory.find(i => i._id === id);
        if (item) {
          item.stock.reserved += quantity;
          return {
            data: item
          };
        }
        throw new Error('Inventory item not found');
      }
      throw error;
    }
  },
  
  releaseReserved: async (id, quantity) => {
    try {
      const response = await api.post(`/inventory/${id}/release`, { quantity });
      return response;
    } catch (error) {
      // If backend is not available, simulate success
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, simulating reserved quantity release...');
        await simulateApiDelay();
        
        const item = demoInventory.find(i => i._id === id);
        if (item) {
          item.stock.reserved = Math.max(0, item.stock.reserved - quantity);
          return {
            data: item
          };
        }
        throw new Error('Inventory item not found');
      }
      throw error;
    }
  },
  
  sellQuantity: async (id, quantity) => {
    try {
      const response = await api.post(`/inventory/${id}/sell`, { quantity });
      return response;
    } catch (error) {
      // If backend is not available, simulate success
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, simulating quantity sale...');
        await simulateApiDelay();
        
        const item = demoInventory.find(i => i._id === id);
        if (item) {
          item.stock.quantity = Math.max(0, item.stock.quantity - quantity);
          return {
            data: item
          };
        }
        throw new Error('Inventory item not found');
      }
      throw error;
    }
  },
  
  useQuantity: async (id, quantity) => {
    try {
      const response = await api.post(`/inventory/${id}/use`, { quantity });
      return response;
    } catch (error) {
      // If backend is not available, simulate success
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, simulating quantity usage...');
        await simulateApiDelay();
        
        const item = demoInventory.find(i => i._id === id);
        if (item) {
          item.stock.quantity = Math.max(0, item.stock.quantity - quantity);
          return {
            data: item
          };
        }
        throw new Error('Inventory item not found');
      }
      throw error;
    }
  },
  
  addStock: async (id, quantity, cost) => {
    try {
      const response = await api.post(`/inventory/${id}/add-stock`, { quantity, cost });
      return response;
    } catch (error) {
      // If backend is not available, simulate success
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, simulating stock addition...');
        await simulateApiDelay();
        
        const item = demoInventory.find(i => i._id === id);
        if (item) {
          item.stock.quantity += quantity;
          // Update cost if provided
          if (cost) {
            item.pricing.cost = cost;
          }
          return {
            data: item
          };
        }
        throw new Error('Inventory item not found');
      }
      throw error;
    }
  },
  
  getInventoryStats: async () => {
    try {
      const response = await api.get('/inventory/stats/overview');
      return response;
    } catch (error) {
      // If backend is not available, return demo stats
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, using demo inventory stats...');
        await simulateApiDelay();
        
        const stats = {
          totalItems: demoInventory.length,
          totalValue: demoInventory.reduce((sum, item) => sum + (item.pricing.salePrice * item.stock.quantity), 0),
          lowStockItems: demoInventory.filter(item => 
            item.stock.quantity <= item.stock.reorderPoint && item.stock.quantity > 0
          ).length,
          outOfStockItems: demoInventory.filter(item => item.stock.quantity === 0).length,
          categories: [...new Set(demoInventory.map(item => item.category))].length,
          brands: [...new Set(demoInventory.map(item => item.brand))].length
        };
        
        return {
          data: stats
        };
      }
      throw error;
    }
  },
};

// User API calls
export const userAPI = {
  getUsers: (params = {}) => 
    api.get('/users', { params }),
  
  getUser: (id) => 
    api.get(`/users/${id}`),
  
  createUser: (userData) => 
    api.post('/users', userData),
  
  updateUser: (id, userData) => 
    api.put(`/users/${id}`, userData),
  
  deleteUser: (id) => 
    api.delete(`/users/${id}`),
  
  getUsersByRole: (role) => 
    api.get('/users', { params: { role } }),
  
  getUsersByDepartment: (department) => 
    api.get('/users', { params: { department } }),
  
  getUserStats: () => 
    api.get('/users/stats/overview'),
};

// Report API calls
export const reportAPI = {
  getDashboardData: (params = {}) => 
    api.get('/reports/dashboard', { params }),
  
  getSalesReport: (params = {}) => 
    api.get('/reports/sales', { params }),
  
  getServiceReport: (params = {}) => 
    api.get('/reports/services', { params }),
  
  getInventoryReport: (params = {}) => 
    api.get('/reports/inventory', { params }),
  
  getCustomerReport: (params = {}) => 
    api.get('/reports/customers', { params }),
  
  getFinancialReport: (params = {}) => 
    api.get('/reports/financial', { params }),
  
  exportReport: (reportType, params = {}) => 
    api.get(`/reports/${reportType}/export`, { 
      params,
      responseType: 'blob'
    }),
};

// File upload API calls
export const fileAPI = {
  uploadFile: (file, type = 'general') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  uploadMultipleFiles: (files, type = 'general') => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('files', file);
    });
    formData.append('type', type);
    
    return api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  deleteFile: (fileId) => 
    api.delete(`/upload/${fileId}`),
};

// Legacy function names for backward compatibility
export const getVehicles = vehicleAPI.getVehicles;
export const getVehicle = vehicleAPI.getVehicle;
export const createVehicle = vehicleAPI.createVehicle;
export const updateVehicle = vehicleAPI.updateVehicle;
export const deleteVehicle = vehicleAPI.deleteVehicle;

export const getCustomers = customerAPI.getCustomers;
export const getCustomer = customerAPI.getCustomer;
export const createCustomer = customerAPI.createCustomer;
export const updateCustomer = customerAPI.updateCustomer;
export const deleteCustomer = customerAPI.deleteCustomer;

export const getServices = serviceAPI.getServices;
export const getService = serviceAPI.getService;
export const createService = serviceAPI.createService;
export const updateService = serviceAPI.updateService;
export const deleteService = serviceAPI.deleteService;

export default api;
