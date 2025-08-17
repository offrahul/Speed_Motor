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
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { inventoryAPI } from '../../services/api';
import InventoryFilters from './InventoryFilters.js';
import InventoryTable from './InventoryTable.js';
import Pagination from '../common/Pagination.js';
import LoadingSpinner, { TableSkeletonLoader } from '../common/LoadingSpinner.js';
import toast from 'react-hot-toast';

const InventoryList = () => {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    subcategory: '',
    brand: '',
    manufacturer: '',
    stockStatus: '',
    minPrice: '',
    maxPrice: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Fetch inventory with filters and pagination
  const {
    data: inventoryData,
    isLoading,
    error,
    refetch
  } = useQuery(
    ['inventory', filters, currentPage, itemsPerPage, sortField, sortOrder],
    () => inventoryAPI.getInventory({
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

  const inventory = inventoryData?.data || [];
  const totalItems = inventoryData?.total || 0;
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
      category: '',
      subcategory: '',
      brand: '',
      manufacturer: '',
      stockStatus: '',
      minPrice: '',
      maxPrice: ''
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

  // Handle inventory edit
  const handleEdit = (item) => {
    // Navigate to edit page or open edit modal
    console.log('Edit inventory item:', item);
  };

  // Handle inventory delete
  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this inventory item? This action cannot be undone.')) {
      try {
        await inventoryAPI.deleteInventoryItem(itemId);
        toast.success('Inventory item deleted successfully');
        refetch();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete inventory item');
      }
    }
  };

  // Handle inventory view
  const handleView = (item) => {
    // Navigate to inventory detail page
    console.log('View inventory item:', item);
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading inventory</h3>
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
      {/* Demo Mode Notification */}
      {inventoryData && inventoryData.data && inventoryData.data.length > 0 && inventoryData.data[0]._id && inventoryData.data[0]._id.startsWith('demo-') && (
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
                  You're currently viewing demo inventory data. The backend server is offline, so all operations are simulated.
                  You can still browse, search, filter, and test all inventory management features with sample data.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage parts, accessories, and supplies inventory
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3">
          <Link
            to="/inventory/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Item
          </Link>
        </div>
      </div>

      {/* Filters */}
      <InventoryFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          {!isLoading && (
            <>
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
            </>
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
          <InventoryTable
            inventory={inventory}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
          />

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

export default InventoryList;


