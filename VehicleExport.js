import React, { useState } from 'react';
import { 
  ArrowDownTrayIcon, 
  DocumentArrowDownIcon,
  TableCellsIcon,
  DocumentTextIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useQuery } from 'react-query';
import { vehicleAPI } from '../../services/api';
import toast from 'react-hot-toast';

const VehicleExport = ({ isOpen, onClose, selectedVehicles = new Set() }) => {
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportFields, setExportFields] = useState([
    'year', 'make', 'model', 'trim', 'vin', 'status', 'price.salePrice', 'mileage', 'bodyStyle'
  ]);
  const [exportFilters, setExportFilters] = useState({});
  const [isExporting, setIsExporting] = useState(false);

  const { data: vehiclesData } = useQuery(
    ['vehicles-export', exportFilters],
    () => vehicleAPI.getVehicles({ ...exportFilters, limit: 1000 }),
    {
      enabled: isOpen,
      staleTime: 5 * 60 * 1000,
    }
  );

  const availableFields = [
    { key: 'year', label: 'Year', category: 'Basic' },
    { key: 'make', label: 'Make', category: 'Basic' },
    { key: 'model', label: 'Model', category: 'Basic' },
    { key: 'trim', label: 'Trim', category: 'Basic' },
    { key: 'vin', label: 'VIN', category: 'Basic' },
    { key: 'mileage', label: 'Mileage', category: 'Basic' },
    { key: 'bodyStyle', label: 'Body Style', category: 'Basic' },
    { key: 'status', label: 'Status', category: 'Basic' },
    { key: 'price.cost', label: 'Cost', category: 'Pricing' },
    { key: 'price.msrp', label: 'MSRP', category: 'Pricing' },
    { key: 'price.salePrice', label: 'Sale Price', category: 'Pricing' },
    { key: 'engine.displacement', label: 'Engine Displacement', category: 'Engine' },
    { key: 'engine.cylinders', label: 'Cylinders', category: 'Engine' },
    { key: 'engine.fuelType', label: 'Fuel Type', category: 'Engine' },
    { key: 'engine.transmission', label: 'Transmission', category: 'Engine' },
    { key: 'engine.drivetrain', label: 'Drivetrain', category: 'Engine' },
    { key: 'color.exterior', label: 'Exterior Color', category: 'Colors' },
    { key: 'color.interior', label: 'Interior Color', category: 'Colors' },
    { key: 'condition', label: 'Condition', category: 'Details' },
    { key: 'isFeatured', label: 'Featured', category: 'Details' },
    { key: 'createdAt', label: 'Created Date', category: 'Details' },
    { key: 'updatedAt', label: 'Updated Date', category: 'Details' }
  ];

  const fieldCategories = [...new Set(availableFields.map(f => f.category))];

  const handleFieldToggle = (fieldKey) => {
    setExportFields(prev => 
      prev.includes(fieldKey) 
        ? prev.filter(f => f !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  const handleSelectAllFields = () => {
    setExportFields(availableFields.map(f => f.key));
  };

  const handleClearFields = () => {
    setExportFields([]);
  };

  const getFieldValue = (vehicle, fieldKey) => {
    const keys = fieldKey.split('.');
    let value = vehicle;
    
    for (const key of keys) {
      if (value && typeof value === 'object') {
        value = value[key];
      } else {
        value = undefined;
        break;
      }
    }
    
    if (value === null || value === undefined) return '';
    
    // Format specific fields
    if (fieldKey.includes('price.') && typeof value === 'number') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    
    if (fieldKey === 'mileage' && typeof value === 'number') {
      return new Intl.NumberFormat('en-US').format(value);
    }
    
    if (fieldKey.includes('createdAt') || fieldKey.includes('updatedAt')) {
      return new Date(value).toLocaleDateString();
    }
    
    if (fieldKey === 'isFeatured') {
      return value ? 'Yes' : 'No';
    }
    
    return String(value);
  };

  const exportToCSV = (vehicles) => {
    if (exportFields.length === 0) {
      toast.error('Please select at least one field to export');
      return;
    }

    const headers = exportFields.map(field => 
      availableFields.find(f => f.key === field)?.label || field
    );
    
    const csvContent = [
      headers,
      ...vehicles.map(vehicle => 
        exportFields.map(field => `"${getFieldValue(vehicle, field)}"`)
      )
    ].map(row => row.join(',')).join('\n');

    downloadFile(csvContent, 'text/csv', `vehicles_export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportToJSON = (vehicles) => {
    if (exportFields.length === 0) {
      toast.error('Please select at least one field to export');
      return;
    }

    const exportData = vehicles.map(vehicle => {
      const exportedVehicle = {};
      exportFields.forEach(field => {
        exportedVehicle[field] = getFieldValue(vehicle, field);
      });
      return exportedVehicle;
    });

    const jsonContent = JSON.stringify(exportData, null, 2);
    downloadFile(jsonContent, 'application/json', `vehicles_export_${new Date().toISOString().split('T')[0]}.json`);
  };

  const exportToExcel = async (vehicles) => {
    if (exportFields.length === 0) {
      toast.error('Please select at least one field to export');
      return;
    }

    try {
      // For Excel export, we'll use a CSV format that Excel can open
      // In a real implementation, you might want to use a library like xlsx
      const headers = exportFields.map(field => 
        availableFields.find(f => f.key === field)?.label || field
      );
      
      const csvContent = [
        headers,
        ...vehicles.map(vehicle => 
          exportFields.map(field => `"${getFieldValue(vehicle, field)}"`)
        )
      ].map(row => row.join(',')).join('\n');

      downloadFile(csvContent, 'text/csv', `vehicles_export_${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('Excel file exported (CSV format)');
    } catch (error) {
      toast.error('Failed to export Excel file');
      console.error('Excel export error:', error);
    }
  };

  const downloadFile = (content, mimeType, filename) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (exportFields.length === 0) {
      toast.error('Please select at least one field to export');
      return;
    }

    setIsExporting(true);
    try {
      let vehiclesToExport = [];
      
      if (selectedVehicles.size > 0) {
        // Export only selected vehicles
        vehiclesToExport = vehiclesData?.data?.filter(v => selectedVehicles.has(v._id)) || [];
      } else {
        // Export all vehicles based on filters
        vehiclesToExport = vehiclesData?.data || [];
      }

      if (vehiclesToExport.length === 0) {
        toast.error('No vehicles to export');
        return;
      }

      switch (exportFormat) {
        case 'csv':
          exportToCSV(vehiclesToExport);
          break;
        case 'json':
          exportToJSON(vehiclesToExport);
          break;
        case 'excel':
          await exportToExcel(vehiclesToExport);
          break;
        default:
          exportToCSV(vehiclesToExport);
      }

      toast.success(`Exported ${vehiclesToExport.length} vehicles to ${exportFormat.toUpperCase()}`);
      onClose();
    } catch (error) {
      toast.error('Export failed');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Export Vehicles</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Export Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'csv', label: 'CSV', icon: TableCellsIcon },
                { key: 'json', label: 'JSON', icon: DocumentTextIcon },
                { key: 'excel', label: 'Excel', icon: DocumentArrowDownIcon }
              ].map((format) => (
                <button
                  key={format.key}
                  onClick={() => setExportFormat(format.key)}
                  className={`p-3 border rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                    exportFormat === format.key
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <format.icon className="h-6 w-6" />
                  <span className="text-sm font-medium">{format.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Export Fields */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Export Fields
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={handleSelectAllFields}
                  className="text-xs text-indigo-600 hover:text-indigo-800"
                >
                  Select All
                </button>
                <button
                  onClick={handleClearFields}
                  className="text-xs text-gray-600 hover:text-gray-800"
                >
                  Clear All
                </button>
              </div>
            </div>
            
            <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-3">
              {fieldCategories.map(category => (
                <div key={category} className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">{category}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {availableFields
                      .filter(field => field.category === category)
                      .map(field => (
                        <label key={field.key} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={exportFields.includes(field.key)}
                            onChange={() => handleFieldToggle(field.key)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{field.label}</span>
                        </label>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">
              <p><strong>Export Summary:</strong></p>
              <p>• Format: {exportFormat.toUpperCase()}</p>
              <p>• Fields: {exportFields.length} selected</p>
              <p>• Vehicles: {selectedVehicles.size > 0 ? selectedVehicles.size : vehiclesData?.count || 0}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || exportFields.length === 0}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Export
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleExport;


