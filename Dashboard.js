import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TruckIcon, 
  UsersIcon, 
  WrenchScrewdriverIcon, 
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  // Mock data - in real app, this would come from API
  const stats = [
    { name: 'Total Vehicles', value: '156', change: '+12%', changeType: 'increase', icon: TruckIcon },
    { name: 'Active Customers', value: '2,847', change: '+8%', changeType: 'increase', icon: UsersIcon },
    { name: 'Services Today', value: '23', change: '+5%', changeType: 'increase', icon: WrenchScrewdriverIcon },
    { name: 'Monthly Revenue', value: '$124,563', change: '+15%', changeType: 'increase', icon: CurrencyDollarIcon },
  ];

  const recentActivities = [
    { id: 1, type: 'service', message: 'Oil change completed for 2020 Honda Civic', time: '2 minutes ago', status: 'completed' },
    { id: 2, type: 'sale', message: 'New vehicle sold: 2023 Toyota Camry', time: '15 minutes ago', status: 'completed' },
    { id: 3, type: 'appointment', message: 'Service appointment scheduled for tomorrow', time: '1 hour ago', status: 'scheduled' },
    { id: 4, type: 'customer', message: 'New customer registered: John Smith', time: '2 hours ago', status: 'new' },
    { id: 5, type: 'inventory', message: 'Low stock alert: Brake pads running low', time: '3 hours ago', status: 'warning' },
  ];

  const quickActions = [
    { name: 'Add Vehicle', href: '/vehicles/new', icon: TruckIcon, color: 'bg-blue-500' },
    { name: 'New Customer', href: '/customers/new', icon: UsersIcon, color: 'bg-green-500' },
    { name: 'Schedule Service', href: '/services/new', icon: WrenchScrewdriverIcon, color: 'bg-purple-500' },
    { name: 'View Reports', href: '/reports', icon: ChartBarIcon, color: 'bg-orange-500' },
  ];

  const upcomingAppointments = [
    { id: 1, customer: 'Sarah Johnson', vehicle: '2019 Ford Escape', time: '9:00 AM', type: 'Oil Change' },
    { id: 2, customer: 'Mike Davis', vehicle: '2021 Toyota RAV4', time: '10:30 AM', type: 'Brake Inspection' },
    { id: 3, customer: 'Lisa Chen', vehicle: '2018 Honda CR-V', time: '2:00 PM', type: 'Tire Rotation' },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'scheduled':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-300" />;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'service':
        return <WrenchScrewdriverIcon className="h-5 w-5 text-blue-500" />;
      case 'sale':
        return <CurrencyDollarIcon className="h-5 w-5 text-green-500" />;
      case 'appointment':
        return <ClockIcon className="h-5 w-5 text-purple-500" />;
      case 'customer':
        return <UsersIcon className="h-5 w-5 text-indigo-500" />;
      case 'inventory':
        return <TruckIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-300" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Welcome back! Here's what's happening with your dealership today.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/reports"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ChartBarIcon className="h-4 w-4 mr-2" />
            View Reports
          </Link>
        </div>
      </div>

      {/* Demo Mode Notification */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Demo Mode - Backend Offline
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                You're currently viewing demo data. The backend server is offline, so all data is simulated.
                You can still navigate and test all features with sample data.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <item.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                    <dd className="text-lg font-medium text-gray-900">{item.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className={`font-medium ${
                  item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {item.change}
                </span>
                <span className="text-gray-500"> from last month</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions and Recent Activities */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.name}
                  to={action.href}
                  className="relative group bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors duration-150"
                >
                  <div className="flex items-center">
                    <div className={`${action.color} p-2 rounded-lg`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600">
                        {action.name}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activities</h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusIcon(activity.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center sm:justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Today's Appointments</h3>
            <Link
              to="/services/calendar"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              View Calendar →
            </Link>
          </div>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {appointment.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {appointment.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appointment.vehicle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appointment.type}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


