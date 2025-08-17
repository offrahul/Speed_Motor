import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { customerAPI } from '../../services/api';
import CustomerFilters from './CustomerFilters';
import CustomerTable from './CustomerTable';
import Pagination from '../common/Pagination';
import LoadingSpinner, { TableSkeletonLoader } from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const CustomerList = () => {
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    source: '',
    assignedAgent: '',
    hasActiveService: '',
    lastContactDate: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch customers with filters and pagination
  const {
    data: customersData,
    isLoading,
    error,
    refetch
  } = useQuery(
    ['customers', filters, currentPage, itemsPerPage, sortField, sortOrder],
    () => customerAPI.getCustomers({
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

  const customers = customersData?.data || [];
  const totalItems = customersData?.total || 0;
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
      status: '',
      source: '',
      assignedAgent: '',
      hasActiveService: '',
      lastContactDate: ''
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

  // Handle customer edit
  const handleEdit = (customer) => {
    // Navigate to edit page or open edit modal
    console.log('Edit customer:', customer);
  };

  // Handle customer delete
  const handleDelete = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      try {
        await customerAPI.deleteCustomer(customerId);
        toast.success('Customer deleted successfully');
        refetch();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete customer');
      }
    }
  };

  // Handle customer view
  const handleView = (customer) => {
    // Navigate to customer detail page
    console.log('View customer:', customer);
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading customers</h3>
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
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your customer relationships and track interactions
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3">
          <Link
            to="/customers/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Customer
          </Link>
        </div>
      </div>

      {/* Filters */}
      <CustomerFilters
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
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Grid
            </button>
          </div>

          {/* Results Info */}
          {!isLoading && (
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} customers
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
        <TableSkeletonLoader rows={10} columns={8} />
      ) : (
        <>
          {viewMode === 'table' ? (
            <CustomerTable
              customers={customers}
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customers.map((customer) => (
                <CustomerCard
                  key={customer._id}
                  customer={customer}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              ))}
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

// Customer Card Component for Grid View
const CustomerCard = ({ customer, onEdit, onDelete, onView }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'prospect':
        return 'bg-blue-100 text-blue-800';
      case 'lead':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'individual':
        return 'bg-purple-100 text-purple-800';
      case 'business':
        return 'bg-indigo-100 text-indigo-800';
      case 'fleet':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {customer.user?.firstName} {customer.user?.lastName}
            </h3>
            <p className="text-sm text-gray-600">{customer.customerId}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onView(customer)}
              className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
              title="View Details"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(customer)}
              className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
              title="Edit Customer"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(customer._id)}
              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
              title="Delete Customer"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <EnvelopeIcon className="w-4 h-4 mr-2" />
            <span>{customer.user?.email || 'N/A'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <PhoneIcon className="w-4 h-4 mr-2" />
            <span>{customer.user?.phone || 'N/A'}</span>
          </div>
        </div>

        {/* Status and Type */}
        <div className="flex space-x-2 mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
            {customer.status || 'N/A'}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(customer.type)}`}>
            {customer.type || 'N/A'}
          </span>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {customer.vehicles?.length || 0}
            </div>
            <div className="text-xs text-gray-500">Vehicles</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {customer.serviceAppointments?.length || 0}
            </div>
            <div className="text-xs text-gray-500">Services</div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4">
          <button
            onClick={() => onView(customer)}
            className="w-full bg-indigo-600 text-white text-center py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerList;
