import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  PlusIcon, 
  CalendarIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { serviceAPI } from '../../services/api';
import ServiceFilters from './ServiceFilters';
import ServiceTable from './ServiceTable';
import Pagination from '../common/Pagination';
import LoadingSpinner, { TableSkeletonLoader } from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const ServiceList = () => {
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'calendar'
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    status: '',
    priority: '',
    assignedTechnician: '',
    scheduledDate: '',
    customer: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sortField, setSortField] = useState('scheduledTime');
  const [sortOrder, setSortOrder] = useState('asc');

  // Fetch services with filters and pagination
  const {
    data: servicesData,
    isLoading,
    error,
    refetch
  } = useQuery(
    ['services', filters, currentPage, itemsPerPage, sortField, sortOrder],
    () => serviceAPI.getServices({
      page: currentPage,
      limit: itemsPerPage,
      sortBy: sortField,
      sortOrder: sortOrder,
      ...filters
    }),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const services = servicesData?.data || [];
  const totalItems = servicesData?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Handle filter changes
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({
      search: '',
      type: '',
      category: '',
      status: '',
      priority: '',
      assignedTechnician: '',
      scheduledDate: '',
      customer: ''
    });
    setCurrentPage(1);
  };

  // Handle sorting
  const handleSort = (field, order) => {
    setSortField(field);
    setSortOrder(order);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Handle service edit
  const handleEdit = (service) => {
    // Navigate to edit page or open edit modal
    console.log('Edit service:', service);
  };

  // Handle service delete
  const handleDelete = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service appointment? This action cannot be undone.')) {
      try {
        await serviceAPI.deleteService(serviceId);
        toast.success('Service appointment deleted successfully');
        refetch();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete service appointment');
      }
    }
  };

  // Handle service view
  const handleView = (service) => {
    // Navigate to service detail page
    console.log('View service:', service);
  };

  // Handle service status update
  const handleStatusUpdate = async (serviceId, newStatus) => {
    try {
      await serviceAPI.updateServiceStatus(serviceId, { status: newStatus });
      toast.success('Service status updated successfully');
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update service status');
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading services</h3>
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
          <h1 className="text-2xl font-bold text-gray-900">Service Appointments</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage service appointments and track work orders
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3">
          <Link
            to="/services/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Schedule Service
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Today's Services</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {services.filter(s => {
                      const today = new Date().toDateString();
                      const serviceDate = new Date(s.scheduledTime).toDateString();
                      return today === serviceDate;
                    }).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {services.filter(s => s.status === 'pending').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <WrenchScrewdriverIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {services.filter(s => s.status === 'in_progress').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {services.filter(s => s.status === 'completed').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <ServiceFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

      {/* View Mode Toggle and Results Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Calendar
            </button>
          </div>

          {/* Results Info */}
          {!isLoading && (
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} services
            </div>
          )}
        </div>

        {/* Export Options */}
        <div className="flex items-center space-x-2">
          <button className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md hover:bg-gray-100">
            Export CSV
          </button>
          <button className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md hover:bg-gray-100">
            Export PDF
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <TableSkeletonLoader rows={10} columns={9} />
      ) : (
        <>
          {viewMode === 'table' ? (
            <ServiceTable
              services={services}
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              onStatusUpdate={handleStatusUpdate}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
            />
          ) : (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-center py-12">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Calendar View</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Calendar view will be implemented here.
                </p>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              showItemsPerPage={true}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ServiceList;
