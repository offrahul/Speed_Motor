import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { ArrowLeftIcon, PlusIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { vehicleAPI } from '../../services/api';
import toast from 'react-hot-toast';

const VehicleNew = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);

  const createVehicleMutation = useMutation(
    (data) => vehicleAPI.createVehicle(data),
    {
      onSuccess: (newVehicle) => {
        queryClient.invalidateQueries(['vehicles']);
        toast.success('Vehicle created successfully');
        navigate(`/vehicles/${newVehicle._id}`);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create vehicle');
      },
    }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      year: new Date().getFullYear(),
      make: '',
      model: '',
      trim: '',
      bodyStyle: '',
      vin: '',
      mileage: '',
      status: 'available',
      'engine.displacement': '',
      'engine.cylinders': '',
      'engine.fuelType': '',
      'engine.transmission': '',
      'engine.drivetrain': '',
      'color.exterior': '',
      'color.interior': '',
      'price.cost': '',
      'price.msrp': '',
      'price.salePrice': '',
    }
  });

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    setImageFiles(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImages(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

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

      // Create vehicle first
      const newVehicle = await createVehicleMutation.mutateAsync(vehicleData);

      // Upload images if any
      if (imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach(file => {
          formData.append('images', file);
        });
        
        try {
          await vehicleAPI.uploadVehicleImages(newVehicle._id, formData);
          toast.success('Vehicle and images created successfully');
        } catch (imageError) {
          toast.error('Vehicle created but image upload failed');
          console.error('Image upload error:', imageError);
        }
      } else {
        toast.success('Vehicle created successfully');
      }
    } catch (error) {
      console.error('Error creating vehicle:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center space-x-4">
              <Link to="/vehicles" className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100">
                <ArrowLeftIcon className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add New Vehicle</h1>
                <p className="text-sm text-gray-500">Enter vehicle details to add to inventory</p>
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
                  <label htmlFor="vin" className="block text-sm font-medium text-gray-700">VIN</label>
                  <input
                    type="text"
                    id="vin"
                    {...register('vin')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                    maxLength="17"
                  />
                </div>

                <div>
                  <label htmlFor="mileage" className="block text-sm font-medium text-gray-700">Mileage</label>
                  <input
                    type="number"
                    id="mileage"
                    {...register('mileage', { min: 0 })}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.mileage ? 'border-red-300' : 'border-gray-300'
                    }`}
                    min="0"
                  />
                  {errors.mileage && <p className="mt-1 text-sm text-red-600">{errors.mileage.message}</p>}
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
                    <option value="reserved">Reserved</option>
                    <option value="in_service">In Service</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                  {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Engine Specifications */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Engine Specifications</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="engine.displacement" className="block text-sm font-medium text-gray-700">Displacement</label>
                  <input
                    type="text"
                    id="engine.displacement"
                    {...register('engine.displacement')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., 2.0L"
                  />
                </div>

                <div>
                  <label htmlFor="engine.cylinders" className="block text-sm font-medium text-gray-700">Cylinders</label>
                  <input
                    type="number"
                    id="engine.cylinders"
                    {...register('engine.cylinders', { min: 1, max: 16 })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    min="1"
                    max="16"
                  />
                </div>

                <div>
                  <label htmlFor="engine.fuelType" className="block text-sm font-medium text-gray-700">Fuel Type</label>
                  <select
                    id="engine.fuelType"
                    {...register('engine.fuelType')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select fuel type</option>
                    <option value="gasoline">Gasoline</option>
                    <option value="diesel">Diesel</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="electric">Electric</option>
                    <option value="plug-in_hybrid">Plug-in Hybrid</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="engine.transmission" className="block text-sm font-medium text-gray-700">Transmission</label>
                  <select
                    id="engine.transmission"
                    {...register('engine.transmission')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select transmission</option>
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                    <option value="cvt">CVT</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="engine.drivetrain" className="block text-sm font-medium text-gray-700">Drivetrain</label>
                  <select
                    id="engine.drivetrain"
                    {...register('engine.drivetrain')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select drivetrain</option>
                    <option value="fwd">Front-Wheel Drive</option>
                    <option value="rwd">Rear-Wheel Drive</option>
                    <option value="awd">All-Wheel Drive</option>
                    <option value="4wd">Four-Wheel Drive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Colors</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="color.exterior" className="block text-sm font-medium text-gray-700">Exterior Color</label>
                  <input
                    type="text"
                    id="color.exterior"
                    {...register('color.exterior')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="color.interior" className="block text-sm font-medium text-gray-700">Interior Color</label>
                  <input
                    type="text"
                    id="color.interior"
                    {...register('color.interior')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
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

                           {/* Images */}
                 <div className="bg-white shadow rounded-lg">
                   <div className="px-6 py-4 border-b border-gray-200">
                     <h3 className="text-lg font-medium text-gray-900">Vehicle Images</h3>
                   </div>
                   <div className="p-6">
                     <div className="space-y-4">
                       {/* Image Upload */}
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">
                           Upload Images
                         </label>
                         <div className="flex items-center space-x-4">
                           <input
                             type="file"
                             multiple
                             accept="image/*"
                             onChange={handleImageUpload}
                             className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                           />
                         </div>
                         <p className="mt-1 text-sm text-gray-500">
                           Upload multiple images. The first image will be the primary image.
                         </p>
                       </div>

                       {/* Image Preview */}
                       {uploadedImages.length > 0 && (
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                             Image Preview
                           </label>
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                             {uploadedImages.map((image, index) => (
                               <div key={index} className="relative group">
                                 <img
                                   src={image}
                                   alt={`Preview ${index + 1}`}
                                   className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                                 />
                                 <button
                                   type="button"
                                   onClick={() => removeImage(index)}
                                   className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                 >
                                   <XMarkIcon className="w-4 h-4" />
                                 </button>
                                 {index === 0 && (
                                   <div className="absolute bottom-1 left-1 px-2 py-1 bg-indigo-600 text-white text-xs rounded">
                                     Primary
                                   </div>
                                 )}
                               </div>
                             ))}
                           </div>
                         </div>
                       )}
                     </div>
                   </div>
                 </div>

                 {/* Form Actions */}
                 <div className="flex items-center justify-end space-x-4">
                   <Link
                     to="/vehicles"
                     className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                   >
                     Cancel
                   </Link>
                   <button
                     type="submit"
                     disabled={isSubmitting}
                     className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {isSubmitting ? (
                       <>
                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                         Creating...
                       </>
                     ) : (
                       <>
                         <PlusIcon className="w-4 h-4 mr-2" />
                         Create Vehicle
                       </>
                     )}
                   </button>
                 </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleNew;
