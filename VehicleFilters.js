import React, { useState } from 'react';
import { XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';

const VehicleFilters = ({ filters, onFiltersChange, onClearFilters }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleClearFilters = () => {
    onClearFilters();
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== null && value !== undefined
  );

  return (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
            {hasActiveFilters && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
              >
                <XMarkIcon className="h-4 w-4" />
                <span>Clear all</span>
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          </div>
        </div>
      </div>

      <div className={`px-4 py-4 space-y-4 ${isExpanded ? 'block' : 'hidden'}`}>
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            id="search"
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search by make, model, VIN, or description..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Basic Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Make */}
          <div>
            <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">
              Make
            </label>
            <select
              id="make"
              value={filters.make || ''}
              onChange={(e) => handleFilterChange('make', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Makes</option>
              <option value="Toyota">Toyota</option>
              <option value="Honda">Honda</option>
              <option value="Ford">Ford</option>
              <option value="Chevrolet">Chevrolet</option>
              <option value="Nissan">Nissan</option>
              <option value="BMW">BMW</option>
              <option value="Mercedes-Benz">Mercedes-Benz</option>
              <option value="Audi">Audi</option>
              <option value="Volkswagen">Volkswagen</option>
              <option value="Hyundai">Hyundai</option>
              <option value="Kia">Kia</option>
            </select>
          </div>

          {/* Body Style */}
          <div>
            <label htmlFor="bodyStyle" className="block text-sm font-medium text-gray-700 mb-1">
              Body Style
            </label>
            <select
              id="bodyStyle"
              value={filters.bodyStyle || ''}
              onChange={(e) => handleFilterChange('bodyStyle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Styles</option>
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="truck">Truck</option>
              <option value="coupe">Coupe</option>
              <option value="convertible">Convertible</option>
              <option value="wagon">Wagon</option>
              <option value="hatchback">Hatchback</option>
              <option value="minivan">Minivan</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="reserved">Reserved</option>
              <option value="in_service">In Service</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Year Range */}
          <div>
            <label htmlFor="yearFrom" className="block text-sm font-medium text-gray-700 mb-1">
              Year From
            </label>
            <input
              type="number"
              id="yearFrom"
              min="1990"
              max={new Date().getFullYear() + 1}
              value={filters.yearFrom || ''}
              onChange={(e) => handleFilterChange('yearFrom', e.target.value)}
              placeholder="1990"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="yearTo" className="block text-sm font-medium text-gray-700 mb-1">
              Year To
            </label>
            <input
              type="number"
              id="yearTo"
              min="1990"
              max={new Date().getFullYear() + 1}
              value={filters.yearTo || ''}
              onChange={(e) => handleFilterChange('yearTo', e.target.value)}
              placeholder="2024"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Price Range */}
          <div>
            <label htmlFor="priceFrom" className="block text-sm font-medium text-gray-700 mb-1">
              Price From
            </label>
            <input
              type="number"
              id="priceFrom"
              min="0"
              step="1000"
              value={filters.priceFrom || ''}
              onChange={(e) => handleFilterChange('priceFrom', e.target.value)}
              placeholder="$0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="priceTo" className="block text-sm font-medium text-gray-700 mb-1">
              Price To
            </label>
            <input
              type="number"
              id="priceTo"
              min="0"
              step="1000"
              value={filters.priceTo || ''}
              onChange={(e) => handleFilterChange('priceTo', e.target.value)}
              placeholder="$100,000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Additional Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Fuel Type */}
          <div>
            <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700 mb-1">
              Fuel Type
            </label>
            <select
              id="fuelType"
              value={filters.fuelType || ''}
              onChange={(e) => handleFilterChange('fuelType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Fuel Types</option>
              <option value="gasoline">Gasoline</option>
              <option value="diesel">Diesel</option>
              <option value="hybrid">Hybrid</option>
              <option value="electric">Electric</option>
              <option value="plug-in_hybrid">Plug-in Hybrid</option>
            </select>
          </div>

          {/* Transmission */}
          <div>
            <label htmlFor="transmission" className="block text-sm font-medium text-gray-700 mb-1">
              Transmission
            </label>
            <select
              id="transmission"
              value={filters.transmission || ''}
              onChange={(e) => handleFilterChange('transmission', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Transmissions</option>
              <option value="automatic">Automatic</option>
              <option value="manual">Manual</option>
              <option value="cvt">CVT</option>
            </select>
          </div>

          {/* Mileage */}
          <div>
            <label htmlFor="maxMileage" className="block text-sm font-medium text-gray-700 mb-1">
              Max Mileage
            </label>
            <input
              type="number"
              id="maxMileage"
              min="0"
              step="1000"
              value={filters.maxMileage || ''}
              onChange={(e) => handleFilterChange('maxMileage', e.target.value)}
              placeholder="100,000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Features Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Features
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              'Bluetooth',
              'Backup Camera',
              'Navigation',
              'Leather Seats',
              'Sunroof',
              'All-Wheel Drive',
              'Blind Spot Monitoring',
              'Lane Departure Warning'
            ].map((feature) => (
              <label key={feature} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.features?.includes(feature) || false}
                  onChange={(e) => {
                    const currentFeatures = filters.features || [];
                    if (e.target.checked) {
                      handleFilterChange('features', [...currentFeatures, feature]);
                    } else {
                      handleFilterChange('features', currentFeatures.filter(f => f !== feature));
                    }
                  }}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{feature}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleFilters;
