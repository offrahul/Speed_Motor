import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CogIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  PhotoIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { vehicleAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: vehicle,
    isLoading,
    error,
    refetch
  } = useQuery(['vehicle', id], () => vehicleAPI.getVehicle(id), {
    staleTime: 5 * 60 * 1000,
  });

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await vehicleAPI.deleteVehicle(id);
      toast.success('Vehicle deleted successfully');
      navigate('/vehicles');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete vehicle');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'sold':
        return 'bg-red-100 text-red-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_service':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'sold':
        return <XCircleIcon className="w-5 h-5" />;
      case 'reserved':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'in_service':
        return <WrenchScrewdriverIcon className="w-5 h-5" />;
      case 'maintenance':
        return <CogIcon className="w-5 h-5" />;
      default:
        return <ExclamationTriangleIcon className="w-5 h-5" />;
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage) => {
    if (!mileage) return 'N/A';
    return new Intl.NumberFormat('en-US').format(mileage);
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading vehicle details..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto h-12 w-12 text-red-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading vehicle</h3>
          <p className="mt-1 text-sm text-gray-500">
            {error.response?.data?.message || 'Something went wrong. Please try again.'}
          </p>
          <div className="mt-6 space-x-3">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Try again
            </button>
            <Link
              to="/vehicles"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to vehicles
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Vehicle not found</h3>
          <p className="mt-1 text-sm text-gray-500">The vehicle you're looking for doesn't exist.</p>
          <Link
            to="/vehicles"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to vehicles
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: DocumentTextIcon },
    { id: 'specifications', name: 'Specifications', icon: CogIcon },
    { id: 'pricing', name: 'Pricing', icon: CurrencyDollarIcon },
    { id: 'features', name: 'Features', icon: StarIcon },
    { id: 'maintenance', name: 'Maintenance', icon: WrenchScrewdriverIcon },
    { id: 'warranty', name: 'Warranty', icon: CheckCircleIcon },
    { id: 'images', name: 'Images', icon: PhotoIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  to="/vehicles"
                  className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h1>
                  <p className="text-sm text-gray-500">
                    VIN: {vehicle.vin || 'N/A'} • {vehicle.bodyStyle || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vehicle.status)}`}>
                  {getStatusIcon(vehicle.status)}
                  <span className="ml-2">{vehicle.status?.charAt(0).toUpperCase() + vehicle.status?.slice(1) || 'Unknown'}</span>
                </span>
                <Link
                  to={`/vehicles/${id}/edit`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <TrashIcon className="w-4 h-4 mr-2" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 inline mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Image */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="h-96 bg-gray-200">
                  {vehicle.images && vehicle.images.length > 0 ? (
                    <img
                      src={vehicle.images[0]}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <PhotoIcon className="w-24 h-24 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Key Information */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Year</span>
                    <span className="text-sm font-medium text-gray-900">{vehicle.year || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Make</span>
                    <span className="text-sm font-medium text-gray-900">{vehicle.make || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Model</span>
                    <span className="text-sm font-medium text-gray-900">{vehicle.model || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Trim</span>
                    <span className="text-sm font-medium text-gray-900">{vehicle.trim || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Body Style</span>
                    <span className="text-sm font-medium text-gray-900">{vehicle.bodyStyle || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">VIN</span>
                    <span className="text-sm font-medium text-gray-900 font-mono">{vehicle.vin || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Sale Price</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatPrice(vehicle.price?.salePrice)}
                    </span>
                  </div>
                  {vehicle.price?.msrp && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">MSRP</span>
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(vehicle.price.msrp)}
                      </span>
                    </div>
                  )}
                  {vehicle.price?.cost && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Cost</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatPrice(vehicle.price.cost)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Mileage</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatMileage(vehicle.mileage)} miles
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Fuel Type</span>
                    <span className="text-sm font-medium text-gray-900">
                      {vehicle.engine?.fuelType || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Transmission</span>
                    <span className="text-sm font-medium text-gray-900">
                      {vehicle.engine?.transmission || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Drivetrain</span>
                    <span className="text-sm font-medium text-gray-900">
                      {vehicle.engine?.drivetrain || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'specifications' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Vehicle Specifications</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Engine Specifications */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Engine</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Displacement</span>
                      <span className="text-sm font-medium text-gray-900">
                        {vehicle.engine?.displacement || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Cylinders</span>
                      <span className="text-sm font-medium text-gray-900">
                        {vehicle.engine?.cylinders || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Fuel Type</span>
                      <span className="text-sm font-medium text-gray-900">
                        {vehicle.engine?.fuelType || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Transmission</span>
                      <span className="text-sm font-medium text-gray-900">
                        {vehicle.engine?.transmission || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Drivetrain</span>
                      <span className="text-sm font-medium text-gray-900">
                        {vehicle.engine?.drivetrain || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Exterior & Interior */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Exterior & Interior</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Exterior Color</span>
                      <span className="text-sm font-medium text-gray-900">
                        {vehicle.color?.exterior || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Interior Color</span>
                      <span className="text-sm font-medium text-gray-900">
                        {vehicle.color?.interior || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Body Style</span>
                      <span className="text-sm font-medium text-gray-900">
                        {vehicle.bodyStyle || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Trim Level</span>
                      <span className="text-sm font-medium text-gray-900">
                        {vehicle.trim || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Pricing Details</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Cost Structure */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Cost Structure</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Vehicle Cost</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatPrice(vehicle.price?.cost)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">MSRP</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatPrice(vehicle.price?.msrp)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Sale Price</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatPrice(vehicle.price?.salePrice)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profit Analysis */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Profit Analysis</h4>
                  <div className="space-y-3">
                    {vehicle.price?.cost && vehicle.price?.salePrice && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Gross Profit</span>
                          <span className="text-sm font-medium text-green-600">
                            {formatPrice(vehicle.price.salePrice - vehicle.price.cost)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Profit Margin</span>
                          <span className="text-sm font-medium text-green-600">
                            {((vehicle.price.salePrice - vehicle.price.cost) / vehicle.price.salePrice * 100).toFixed(1)}%
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Features & Options</h3>
            </div>
            <div className="p-6">
              {vehicle.features && vehicle.features.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {vehicle.features.map((feature, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{feature.name}</h4>
                          {feature.description && (
                            <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
                          )}
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          feature.isStandard 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {feature.isStandard ? 'Standard' : 'Optional'}
                        </span>
                      </div>
                      {feature.category && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 mt-2">
                          {feature.category}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No features listed</h3>
                  <p className="mt-1 text-sm text-gray-500">Features for this vehicle haven't been added yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Maintenance Information</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Maintenance Schedule */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Maintenance Schedule</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Last Service</span>
                      <span className="text-sm font-medium text-gray-900">
                        {vehicle.maintenance?.lastService ? new Date(vehicle.maintenance.lastService).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Next Service</span>
                      <span className="text-sm font-medium text-gray-900">
                        {vehicle.maintenance?.nextService ? new Date(vehicle.maintenance.nextService).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Service History */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Service History</h4>
                  {vehicle.maintenance?.serviceHistory && vehicle.maintenance.serviceHistory.length > 0 ? (
                    <div className="space-y-2">
                      {vehicle.maintenance.serviceHistory.slice(0, 5).map((service, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          {new Date(service.date).toLocaleDateString()} - {service.description}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No service history available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'warranty' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Warranty Information</h3>
            </div>
            <div className="p-6">
              {vehicle.warranty ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Warranty Details</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Type</span>
                        <span className="text-sm font-medium text-gray-900">
                          {vehicle.warranty.type || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Coverage</span>
                        <span className="text-sm font-medium text-gray-900">
                          {vehicle.warranty.coverage || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Expires</span>
                        <span className="text-sm font-medium text-gray-900">
                          {vehicle.warranty.expiresAt ? new Date(vehicle.warranty.expiresAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Terms</h4>
                    <p className="text-sm text-gray-600">
                      {vehicle.warranty.terms || 'No warranty terms specified.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No warranty information</h3>
                  <p className="mt-1 text-sm text-gray-500">Warranty details for this vehicle haven't been added yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'images' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Vehicle Images</h3>
            </div>
            <div className="p-6">
              {vehicle.images && vehicle.images.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vehicle.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`${vehicle.make} ${vehicle.model} - Image ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg shadow-md"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors duration-200">
                          <PhotoIcon className="w-5 h-5 text-gray-700" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No images available</h3>
                  <p className="mt-1 text-sm text-gray-500">Images for this vehicle haven't been uploaded yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleDetail;

