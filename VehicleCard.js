import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarIcon, 
  MapPinIcon, 
  CurrencyDollarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const VehicleCard = ({ vehicle, onEdit, onDelete, showActions = true, isSelected = false, onSelect = null }) => {
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

  const getStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'sold':
        return 'Sold';
      case 'reserved':
        return 'Reserved';
      case 'in_service':
        return 'In Service';
      case 'maintenance':
        return 'Maintenance';
      default:
        return status;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage) => {
    return new Intl.NumberFormat('en-US').format(mileage);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 border-2 ${
      isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-transparent'
    }`}>
      {/* Selection Checkbox */}
      {onSelect && (
        <div className="absolute top-2 left-2 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(vehicle._id)}
            className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
        </div>
      )}
      
      {/* Vehicle Image */}
      <div className="relative h-48 bg-gray-200">
        {vehicle.images && vehicle.images.length > 0 ? (
          <img
            src={vehicle.images[0]}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300">
            <svg
              className="w-16 h-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
            {getStatusText(vehicle.status)}
          </span>
        </div>

        {/* Quick Actions Overlay */}
        {showActions && (
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
            <div className="flex space-x-2">
              <Link
                to={`/vehicles/${vehicle._id}`}
                className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors duration-200"
                title="View Details"
              >
                <EyeIcon className="w-5 h-5 text-gray-700" />
              </Link>
              <button
                onClick={() => onEdit(vehicle)}
                className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors duration-200"
                title="Edit Vehicle"
              >
                <PencilIcon className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={() => onDelete(vehicle._id)}
                className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors duration-200"
                title="Delete Vehicle"
              >
                <TrashIcon className="w-5 h-5 text-red-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Vehicle Information */}
      <div className="p-4">
        {/* Make, Model, Year */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>
          {vehicle.trim && (
            <p className="text-sm text-gray-600">{vehicle.trim}</p>
          )}
        </div>

        {/* Key Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="w-4 h-4 mr-2" />
            <span>{vehicle.bodyStyle || 'N/A'}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <CalendarIcon className="w-4 h-4 mr-2" />
            <span>{vehicle.mileage ? `${formatMileage(vehicle.mileage)} miles` : 'N/A'}</span>
          </div>

          {vehicle.engine && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Engine:</span> {vehicle.engine.displacement}L {vehicle.engine.cylinders}-cyl
            </div>
          )}

          {vehicle.color && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Color:</span> {vehicle.color.exterior}
            </div>
          )}
        </div>

        {/* Price */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CurrencyDollarIcon className="w-5 h-5 text-green-600 mr-1" />
              <span className="text-lg font-bold text-green-600">
                {vehicle.price?.salePrice ? formatPrice(vehicle.price.salePrice) : 'N/A'}
              </span>
            </div>
            
            {vehicle.price?.msrp && vehicle.price?.salePrice && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(vehicle.price.msrp)}
              </span>
            )}
          </div>
        </div>

        {/* Features Preview */}
        {vehicle.features && vehicle.features.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex flex-wrap gap-1">
              {vehicle.features.slice(0, 3).map((feature, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                >
                  {feature.name}
                </span>
              ))}
              {vehicle.features.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  +{vehicle.features.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="mt-4 pt-3 border-t">
            <div className="flex space-x-2">
              <Link
                to={`/vehicles/${vehicle._id}`}
                className="flex-1 bg-indigo-600 text-white text-center py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium"
              >
                View Details
              </Link>
              <button
                onClick={() => onEdit(vehicle)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
              >
                Edit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleCard;
