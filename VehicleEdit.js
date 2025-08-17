import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { vehicleAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const VehicleEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: vehicle,
    isLoading,
    error
  } = useQuery(['vehicle', id], () => vehicleAPI.getVehicle(id));

  const updateVehicleMutation = useMutation(
    (data) => vehicleAPI.updateVehicle(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['vehicle', id]);
        queryClient.invalidateQueries(['vehicles']);
        toast.success('Vehicle updated successfully');
        navigate(`/vehicles/${id}`);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update vehicle');
      },
    }
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset
  } = useForm();

  useEffect(() => {
    if (vehicle) {
      reset({
        year: vehicle.year || '',
        make: vehicle.make || '',
        model: vehicle.model || '',
        trim: vehicle.trim || '',
        bodyStyle: vehicle.bodyStyle || '',
        vin: vehicle.vin || '',
        mileage: vehicle.mileage || '',
        status: vehicle.status || 'available',
        'engine.displacement': vehicle.engine?.displacement || '',
        'engine.cylinders': vehicle.engine?.cylinders || '',
        'engine.fuelType': vehicle.engine?.fuelType || '',
        'engine.transmission': vehicle.engine?.transmission || '',
        'engine.drivetrain': vehicle.engine?.drivetrain || '',
        'color.exterior': vehicle.color?.exterior || '',
        'color.interior': vehicle.color?.interior || '',
        'price.cost': vehicle.price?.cost || '',
        'price.msrp': vehicle.price?.msrp || '',
        'price.salePrice': vehicle.price?.salePrice || '',
      });
    }
  }, [vehicle, reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const vehicleData = {
        ...data,
        engine: {
          displacement: data['engine.displacement'],
          cylinders: data['engine.cylinders'],
          fuelType: data['engine.fuelType'],
          transmission: data['engine.transmission'],
          drivetrain: data['engine.drivetrain']
        },
        color: {
          exterior: data['color.exterior'],
          interior: data['color.interior']
        },
        price: {
          cost: parseFloat(data['price.cost']) || 0,
          msrp: parseFloat(data['price.msrp']) || 0,
          salePrice: parseFloat(data['price.salePrice']) || 0
        }
      };

      // Remove the flat properties
      delete vehicleData['engine.displacement'];
      delete vehicleData['engine.cylinders'];
      delete vehicleData['engine.fuelType'];
      delete vehicleData['engine.transmission'];
      delete vehicleData['engine.drivetrain'];
      delete vehicleData['color.exterior'];
      delete vehicleData['color.interior'];
      delete vehicleData['price.cost'];
      delete vehicleData['price.msrp'];
      delete vehicleData['price.salePrice'];

      await updateVehicleMutation.mutateAsync(vehicleData);
    } catch (error) {
      console.error('Error updating vehicle:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingSpinner fullScreen text="Loading vehicle..." />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Error loading vehicle</h3>
          <Link to="/vehicles" className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md">
            Back to vehicles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center space-x-4">
              <Link to={`/vehicles/${id}`} className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100">
                <ArrowLeftIcon className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Vehicle</h1>
                <p className="text-sm text-gray-500">{vehicle?.year} {vehicle?.make} {vehicle?.model}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year *</label>
                  <input
                    type="number"
                    id="year"
                    {...register('year', { required: 'Year is required' })}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.year ? 'border-red-300' : 'border-gray-300'
                    }`}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                  {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>}
                </div>

                <div>
                  <label htmlFor="make" className="block text-sm font-medium text-gray-700">Make *</label>
                  <input
                    type="text"
                    id="make"
                    {...register('make', { required: 'Make is required' })}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.make ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.make && <p className="mt-1 text-sm text-red-600">{errors.make.message}</p>}
                </div>

                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-gray-700">Model *</label>
                  <input
                    type="text"
                    id="model"
                    {...register('model', { required: 'Model is required' })}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.model ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.model && <p className="mt-1 text-sm text-red-600">{errors.model.message}</p>}
                </div>

                <div>
                  <label htmlFor="trim" className="block text-sm font-medium text-gray-700">Trim</label>
                  <input
                    type="text"
                    id="trim"
                    {...register('trim')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="bodyStyle" className="block text-sm font-medium text-gray-700">Body Style</label>
                  <select
                    id="bodyStyle"
                    {...register('bodyStyle')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select body style</option>
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

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status *</label>
                  <select
                    id="status"
                    {...register('status', { required: 'Status is required' })}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.status ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                    <option value="reserved">Reserved</option>
                    <option value="in_service">In Service</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                  {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Pricing</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="price.cost" className="block text-sm font-medium text-gray-700">Cost</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      id="price.cost"
                      {...register('price.cost', { min: 0 })}
                      className="block w-full pl-7 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      min="0"
                      step="100"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="price.msrp" className="block text-sm font-medium text-gray-700">MSRP</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      id="price.msrp"
                      {...register('price.msrp', { min: 0 })}
                      className="block w-full pl-7 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      min="0"
                      step="100"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="price.salePrice" className="block text-sm font-medium text-gray-700">Sale Price *</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      id="price.salePrice"
                      {...register('price.salePrice', { required: 'Sale price is required', min: 0 })}
                      className={`block w-full pl-7 pr-12 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors['price.salePrice'] ? 'border-red-300' : 'border-gray-300'
                      }`}
                      min="0"
                      step="100"
                    />
                  </div>
                  {errors['price.salePrice'] && <p className="mt-1 text-sm text-red-600">{errors['price.salePrice'].message}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4">
            <Link
              to={`/vehicles/${id}`}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <CheckIcon className="w-4 h-4 mr-2" />
                  Update Vehicle
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleEdit;
