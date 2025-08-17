import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { reportAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const ReportsDashboard = () => {
  const [dateRange, setDateRange] = useState('30'); // 7, 30, 90, 365 days
  const [selectedReport, setSelectedReport] = useState('overview');

  // Fetch dashboard data
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch
  } = useQuery(
    ['reports-dashboard', dateRange],
    () => reportAPI.getDashboardData({ dateRange }),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const data = dashboardData || {};

  // Mock data for demonstration - replace with actual API data
  const mockData = {
    sales: {
      total: 125000,
      change: 12.5,
      trend: 'up',
      count: 45,
      average: 2778
    },
    vehicles: {
      total: 89,
      available: 67,
      sold: 22,
      reserved: 8,
      inService: 12
    },
    customers: {
      total: 234,
      new: 23,
      returning: 189,
      prospects: 22
    },
    services: {
      total: 156,
      completed: 134,
      pending: 22,
      revenue: 45600
    },
    inventory: {
      total: 1234,
      lowStock: 23,
      outOfStock: 5,
      value: 89000
    }
  };

  const stats = [
    {
      name: 'Total Sales',
      value: `$${mockData.sales.total.toLocaleString()}`,
      change: mockData.sales.change,
      trend: mockData.sales.trend,
      icon: CurrencyDollarIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Vehicles Available',
      value: mockData.vehicles.available,
      change: 8.2,
      trend: 'up',
      icon: TruckIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Active Customers',
      value: mockData.customers.total,
      change: 15.3,
      trend: 'up',
      icon: UserGroupIcon,
      color: 'bg-purple-500'
    },
    {
      name: 'Service Revenue',
      value: `$${mockData.services.revenue.toLocaleString()}`,
      change: 22.1,
      trend: 'up',
      icon: WrenchScrewdriverIcon,
      color: 'bg-orange-500'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'sale',
      message: 'New vehicle sale completed - 2023 Toyota Camry',
      amount: 28500,
      time: '2 hours ago',
      status: 'completed'
    },
    {
      id: 2,
      type: 'service',
      message: 'Service appointment scheduled - Oil change & inspection',
      amount: 89,
      time: '4 hours ago',
      status: 'scheduled'
    },
    {
      id: 3,
      type: 'customer',
      message: 'New customer registered - John Smith',
      amount: null,
      time: '6 hours ago',
      status: 'new'
    },
    {
      id: 4,
      type: 'inventory',
      message: 'Low stock alert - Brake pads (Part #BP-001)',
      amount: null,
      time: '8 hours ago',
      status: 'warning'
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'sale':
        return <CurrencyDollarIcon className="w-5 h-5 text-green-600" />;
      case 'service':
        return <WrenchScrewdriverIcon className="w-5 h-5 text-blue-600" />;
      case 'customer':
        return <UserGroupIcon className="w-5 h-5 text-purple-600" />;
      case 'inventory':
        return <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />;
      default:
        return <CalendarIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'new':
        return 'bg-purple-100 text-purple-800';
      case 'warning':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading reports</h3>
          <p className="mt-1 text-sm text-gray-500">
            {error.response?.data?.message || 'Something went wrong. Please try again.'}
          </p>
          <div className="mt-6">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-2 text-sm text-gray-700">
            Comprehensive business insights and performance metrics
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <ChartBarIcon className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`inline-flex items-center justify-center h-8 w-8 rounded-md ${stat.color} text-white`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="text-lg font-medium text-gray-900">{stat.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <div className="flex items-center">
                  {stat.trend === 'up' ? (
                    <ArrowTrendingUpIcon className="w-4 h-4 text-green-400 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-4 h-4 text-red-400 mr-1" />
                  )}
                  <span className={`font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}%
                  </span>
                  <span className="text-gray-500 ml-1">from last period</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Sales Performance</h3>
          </div>
          <div className="p-6">
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Sales chart will be displayed here</p>
                <p className="text-xs text-gray-400">Integration with charting library required</p>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Status */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Vehicle Inventory Status</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Available</span>
                <div className="flex items-center">
                  <span className="text-lg font-semibold text-green-600">{mockData.vehicles.available}</span>
                  <span className="ml-2 text-sm text-gray-500">vehicles</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Reserved</span>
                <div className="flex items-center">
                  <span className="text-lg font-semibold text-yellow-600">{mockData.vehicles.reserved}</span>
                  <span className="ml-2 text-sm text-gray-500">vehicles</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">In Service</span>
                <div className="flex items-center">
                  <span className="text-lg font-semibold text-blue-600">{mockData.vehicles.inService}</span>
                  <span className="ml-2 text-sm text-gray-500">vehicles</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sold (This Period)</span>
                <div className="flex items-center">
                  <span className="text-lg font-semibold text-gray-900">{mockData.vehicles.sold}</span>
                  <span className="ml-2 text-sm text-gray-500">vehicles</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
        </div>
        <div className="p-6">
          <div className="flow-root">
            <ul className="-mb-8">
              {recentActivities.map((activity, activityIdx) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {activityIdx !== recentActivities.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-gray-100">
                          {getActivityIcon(activity.type)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">{activity.message}</p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <div className="flex items-center space-x-2">
                            {activity.amount && (
                              <span className="font-medium text-gray-900">
                                ${activity.amount.toLocaleString()}
                              </span>
                            )}
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                              {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                            </span>
                            <time dateTime={activity.time} className="text-gray-400">
                              {activity.time}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <CurrencyDollarIcon className="w-5 h-5 mr-2 text-green-600" />
              Generate Sales Report
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <WrenchScrewdriverIcon className="w-5 h-5 mr-2 text-blue-600" />
              Service Analytics
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <UserGroupIcon className="w-5 h-5 mr-2 text-purple-600" />
              Customer Insights
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;

