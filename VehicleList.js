import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  TruckIcon,
  CheckIcon,
  XMarkIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getVehicles, vehicleAPI } from '../../services/api';
import VehicleFilters from './VehicleFilters';
import VehicleSearch from './VehicleSearch';
import VehicleCard from './VehicleCard';
import VehicleTable from './VehicleTable';
import VehicleExport from './VehicleExport';
import Pagination from '../common/Pagination';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const VehicleList = () => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedVehicles, setSelectedVehicles] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkStatus, setBulkStatus] = useState('');
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: vehiclesData,
    isLoading,
    error,
    refetch
  } = useQuery(
    ['vehicles', currentPage, filters, sortBy, sortOrder],
    () => getVehicles({
      page: currentPage,
      limit: 12,
      ...filters,
      sortBy,
      sortOrder
    }),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Check if we're in demo mode (backend offline)
  const isDemoMode = vehiclesData?.data?.some(vehicle => 
    vehicle._id?.startsWith('demo-')
  );

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setFilters(prev => ({ ...prev, search: query }));
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const queryClient = useQueryClient();

  const bulkUpdateStatusMutation = useMutation(
    (data) => Promise.all(
      Array.from(selectedVehicles).map(id => 
        vehicleAPI.updateVehicleStatus(id, data.status, data.notes)
      )
    ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['vehicles']);
        setSelectedVehicles(new Set());
        setShowBulkActions(false);
        toast.success(`Updated status for ${selectedVehicles.size} vehicles`);
      },
      onError: (error) => {
        toast.error('Failed to update some vehicles');
        console.error('Bulk update error:', error);
      }
    }
  );

  const bulkDeleteMutation = useMutation(
    () => Promise.all(
      Array.from(selectedVehicles).map(id => vehicleAPI.deleteVehicle(id))
    ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['vehicles']);
        setSelectedVehicles(new Set());
        setShowBulkActions(false);
        toast.success(`Deleted ${selectedVehicles.size} vehicles`);
      },
      onError: (error) => {
        toast.error('Failed to delete some vehicles');
        console.error('Bulk delete error:', error);
      }
    }
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectVehicle = (vehicleId) => {
    const newSelected = new Set(selectedVehicles);
    if (newSelected.has(vehicleId)) {
      newSelected.delete(vehicleId);
    } else {
      newSelected.add(vehicleId);
    }
    setSelectedVehicles(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = () => {
    if (selectedVehicles.size === vehiclesData?.data?.length) {
      setSelectedVehicles(new Set());
      setShowBulkActions(false);
    } else {
      const allIds = vehiclesData?.data?.map(v => v._id) || [];
      setSelectedVehicles(new Set(allIds));
      setShowBulkActions(true);
    }
  };

  const handleEditVehicle = (vehicleId) => {
    // Navigate to edit page
    window.location.href = `/vehicles/${vehicleId}/edit`;
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (window.confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
      try {
        await vehicleAPI.deleteVehicle(vehicleId);
        toast.success('Vehicle deleted successfully');
        // Refresh the vehicles list
        queryClient.invalidateQueries(['vehicles']);
      } catch (error) {
        toast.error('Failed to delete vehicle');
        console.error('Delete error:', error);
      }
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedVehicles.size === 0) return;

    setIsBulkProcessing(true);
    try {
      switch (bulkAction) {
        case 'status':
          if (bulkStatus) {
            await bulkUpdateStatusMutation.mutateAsync({
              status: bulkStatus,
              notes: 'Bulk status update'
            });
          }
          break;
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${selectedVehicles.size} vehicles? This action cannot be undone.`)) {
            await bulkDeleteMutation.mutateAsync();
          }
          break;
        case 'export':
          exportVehiclesData();
          break;
      }
    } catch (error) {
      console.error('Bulk action error:', error);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const exportVehiclesData = () => {
    const selectedVehiclesData = vehiclesData?.data?.filter(v => selectedVehicles.has(v._id)) || [];
    
    const csvContent = [
      ['Year', 'Make', 'Model', 'Trim', 'VIN', 'Status', 'Sale Price', 'Mileage', 'Body Style'],
      ...selectedVehiclesData.map(v => [
        v.year || '',
        v.make || '',
        v.model || '',
        v.trim || '',
        v.vin || '',
        v.status || '',
        v.price?.salePrice || '',
        v.mileage || '',
        v.bodyStyle || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vehicles_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success(`Exported ${selectedVehiclesData.length} vehicles to CSV`);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg font-medium mb-2">
          Error loading vehicles
        </div>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your vehicle inventory and track vehicle status
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setShowExport(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
          </button>
          <Link
            to="/vehicles/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Vehicle
          </Link>
        </div>
      </div>

      {/* Demo Mode Notification */}
      {isDemoMode && (
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
                  You're currently viewing demo vehicle data. The backend server is offline, so all operations are simulated.
                  You can still browse, search, filter, and test all vehicle management features with sample data.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white shadow rounded-lg p-4">
        <VehicleSearch
          onSearch={handleSearch}
          placeholder="Search vehicles by make, model, VIN, or features..."
          className="max-w-2xl"
        />
      </div>

      {/* Filters */}
      {showFilters && (
        <VehicleFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Bulk Actions */}
      {showBulkActions && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-indigo-900">
                {selectedVehicles.size} vehicle(s) selected
              </span>
              <button
                onClick={() => setSelectedVehicles(new Set())}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Clear selection
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-2 border border-indigo-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select action</option>
                <option value="status">Update Status</option>
                <option value="delete">Delete</option>
                <option value="export">Export to CSV</option>
              </select>
              
              {bulkAction === 'status' && (
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                  className="px-3 py-2 border border-indigo-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select status</option>
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="in_service">In Service</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="sold">Sold</option>
                </select>
              )}
              
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction || (bulkAction === 'status' && !bulkStatus) || isBulkProcessing}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBulkProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  'Apply'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">View:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
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
          </div>
        </div>

        {/* Results count */}
        {vehiclesData && vehiclesData.count && (
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * 12) + 1} to{' '}
            {Math.min(currentPage * 12, vehiclesData.count)} of{' '}
            {vehiclesData.count} vehicles
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && <LoadingSpinner />}

      {/* Vehicles Content */}
      {!isLoading && vehiclesData && (
        <>
          {viewMode === 'grid' ? (
            <VehicleGrid 
              vehicles={vehiclesData.data} 
              selectedVehicles={selectedVehicles}
              onSelectVehicle={handleSelectVehicle}
              onEdit={handleEditVehicle}
              onDelete={handleDeleteVehicle}
            />
          ) : (
            <VehicleTable
              vehicles={vehiclesData.data}
              onSort={handleSort}
              sortBy={sortBy}
              sortOrder={sortOrder}
              selectedVehicles={selectedVehicles}
              onSelectVehicle={handleSelectVehicle}
              onSelectAll={handleSelectAll}
              onEdit={handleEditVehicle}
              onDelete={handleDeleteVehicle}
            />
          )}

          {/* Pagination */}
          {vehiclesData.count > 12 && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(vehiclesData.count / 12)}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Empty State */}
      {!isLoading && vehiclesData && vehiclesData.data.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <TruckIcon className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No vehicles found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first vehicle to the inventory.
          </p>
          <div className="mt-6">
            <Link
              to="/vehicles/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Vehicle
            </Link>
          </div>
        </div>
      )}

      {/* Export Modal */}
      <VehicleExport
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        selectedVehicles={selectedVehicles}
      />
    </div>
  );
};

// Vehicle Grid Component
const VehicleGrid = ({ vehicles, selectedVehicles, onSelectVehicle, onEdit, onDelete }) => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {vehicles.map((vehicle) => (
        <VehicleCard 
          key={vehicle._id} 
          vehicle={vehicle} 
          isSelected={selectedVehicles.has(vehicle._id)}
          onSelect={onSelectVehicle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default VehicleList;

