# 🚗 Vehicle Management System

A comprehensive, production-ready vehicle inventory management system built with React, Node.js, and MongoDB. Features real-time updates, advanced search, bulk operations, and comprehensive reporting.

## ✨ Features

### 🚀 Core Functionality
- **Vehicle Management**: Complete CRUD operations for vehicle inventory
- **Real-time Updates**: WebSocket-powered live updates across all connected clients
- **Advanced Search**: Intelligent search with autocomplete and search history
- **Bulk Operations**: Mass update, delete, and export capabilities
- **Data Export**: Multiple format support (CSV, JSON, Excel)
- **Image Management**: Multi-image upload with primary image selection
- **Responsive Design**: Mobile-first design with Tailwind CSS

### 🔍 Advanced Features
- **Smart Filtering**: Comprehensive filtering by make, model, price, year, features
- **Search Suggestions**: AI-powered search recommendations
- **Real-time Dashboard**: Live inventory statistics and notifications
- **Multi-view Support**: Grid and table views with sorting
- **Status Management**: Multiple vehicle statuses with workflow support
- **Audit Trail**: Complete history tracking for all operations

### 📊 Business Intelligence
- **Inventory Analytics**: Real-time statistics and trends
- **Profit Analysis**: Cost vs. sale price calculations
- **Performance Metrics**: Vehicle performance and maintenance tracking
- **Export Capabilities**: Customizable data export for reporting

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **React Query** - Server state management and caching
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Beautiful SVG icons
- **React Hook Form** - Performant forms with validation

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication and authorization
- **WebSocket** - Real-time communication
- **Multer** - File upload handling

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Docker** - Containerization
- **Git** - Version control

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- MongoDB 5+
- Docker (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/vehicle-management-system.git
   cd vehicle-management-system
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Backend environment
   cd backend
   cp env.example .env
   
   # Frontend environment
   cd ../frontend
   cp .env.example .env
   ```

4. **Configure Environment Variables**
   ```env
   # Backend (.env)
   MONGODB_URI=mongodb://localhost:27017/vehicle_management
   JWT_SECRET=your_jwt_secret_here
   PORT=5000
   
   # Frontend (.env)
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_WS_URL=ws://localhost:5000/ws
   ```

5. **Start the application**
   ```bash
   # Start backend (from backend directory)
   npm run dev
   
   # Start frontend (from frontend directory)
   npm start
   ```

### Docker Setup (Alternative)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📁 Project Structure

```
vehicle-management-system/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── utils/          # Utility functions
│   │   └── server.js       # Main server file
│   ├── Dockerfile          # Backend container
│   └── package.json
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── vehicles/   # Vehicle management components
│   │   │   ├── dashboard/  # Dashboard components
│   │   │   ├── common/     # Shared components
│   │   │   └── auth/       # Authentication components
│   │   ├── services/       # API services
│   │   ├── contexts/       # React contexts
│   │   └── App.js          # Main application
│   ├── Dockerfile          # Frontend container
│   └── package.json
├── docker-compose.yml       # Docker orchestration
└── README.md               # This file
```

## 🔧 Configuration

### Database Configuration
The system uses MongoDB with Mongoose ODM. Configure your database connection in `backend/src/config/database.js`.

### Authentication
JWT-based authentication with role-based access control:
- `admin` - Full system access
- `inventory_manager` - Vehicle management access
- `sales_agent` - Limited vehicle access
- `service_advisor` - Service-related access

### File Upload
Configure file upload settings in `backend/src/config/upload.js`:
- Supported formats: JPG, PNG, GIF
- Max file size: 5MB
- Storage: Local filesystem (configurable for cloud storage)

## 📱 Usage

### Vehicle Management
1. **Add Vehicle**: Navigate to Vehicles → Add Vehicle
2. **Edit Vehicle**: Click edit button on any vehicle card/row
3. **Delete Vehicle**: Use delete button or bulk delete
4. **Update Status**: Change vehicle status with notes
5. **Upload Images**: Add multiple images with primary selection

### Search and Filtering
1. **Quick Search**: Use the search bar for instant results
2. **Advanced Filters**: Apply multiple filter criteria
3. **Search History**: View and reuse previous searches
4. **Smart Suggestions**: Get AI-powered search recommendations

### Bulk Operations
1. **Select Vehicles**: Use checkboxes to select multiple vehicles
2. **Bulk Actions**: Update status, delete, or export selected vehicles
3. **Export Options**: Choose format and fields for export

### Real-time Features
1. **Live Updates**: See changes in real-time across all clients
2. **Notifications**: Get instant alerts for important events
3. **Dashboard**: Monitor live inventory statistics

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Granular permissions system
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: API rate limiting protection
- **CORS Configuration**: Secure cross-origin requests
- **Environment Variables**: Secure configuration management

## 📊 API Documentation

### Vehicle Endpoints
- `GET /api/vehicles` - List vehicles with pagination and filtering
- `POST /api/vehicles` - Create new vehicle
- `GET /api/vehicles/:id` - Get vehicle details
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle
- `PATCH /api/vehicles/:id/status` - Update vehicle status
- `PUT /api/vehicles/:id/images` - Upload vehicle images
- `GET /api/vehicles/search` - Search vehicles
- `GET /api/vehicles/suggestions` - Get search suggestions
- `GET /api/vehicles/stats/overview` - Get vehicle statistics

### WebSocket Events
- `vehicle_updated` - Vehicle information updated
- `vehicle_created` - New vehicle added
- `vehicle_deleted` - Vehicle removed
- `vehicle_status_changed` - Vehicle status changed
- `inventory_update` - Inventory data updated

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Run all tests
npm run test:all
```

## 🚀 Deployment

### Production Build
```bash
# Frontend production build
cd frontend
npm run build

# Backend production
cd backend
npm run start
```

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_secure_jwt_secret
PORT=5000
CORS_ORIGIN=your_frontend_domain
```

### Docker Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint and Prettier configurations
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS approach
- MongoDB team for the robust database
- All contributors and users of this system

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation wiki

---

**Built with ❤️ for efficient vehicle management**
