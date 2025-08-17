import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  CloudArrowUpIcon,
  XMarkIcon,
  PhotoIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const FileUpload = ({
  files = [],
  onFilesChange,
  multiple = true,
  accept = 'image/*',
  maxFiles = 10,
  maxSize = 5 * 1024 * 1024, // 5MB
  className = '',
  disabled = false,
  showPreview = true
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const newErrors = rejectedFiles.map(({ file, errors }) => ({
        fileName: file.name,
        errors: errors.map(error => error.message)
      }));
      setErrors(prev => [...prev, ...newErrors]);
    }

    // Handle accepted files
    if (acceptedFiles.length > 0) {
      const newFiles = acceptedFiles.map(file => ({
        file,
        id: Math.random().toString(36).substr(2, 9),
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        name: file.name,
        size: file.size,
        type: file.type
      }));

      if (multiple) {
        onFilesChange([...files, ...newFiles]);
      } else {
        onFilesChange([newFiles[0]]);
      }
    }
  }, [files, multiple, onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ? { [accept]: [] } : undefined,
    maxFiles,
    maxSize,
    disabled,
    onDropRejected: (rejectedFiles) => {
      const newErrors = rejectedFiles.map(({ file, errors }) => ({
        fileName: file.name,
        errors: errors.map(error => error.message)
      }));
      setErrors(prev => [...prev, ...newErrors]);
    }
  });

  const removeFile = (fileId) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    onFilesChange(updatedFiles);
  };

  const removeError = (index) => {
    setErrors(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <PhotoIcon className="w-8 h-8 text-blue-500" />;
    }
    return <DocumentIcon className="w-8 h-8 text-gray-500" />;
  };

  const DocumentIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  return (
    <div className={className}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragActive
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
        
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            {isDragActive ? (
              <span className="text-indigo-600">Drop the files here...</span>
            ) : (
              <>
                <span className="font-medium text-indigo-600 hover:text-indigo-500">
                  Click to upload
                </span>{' '}
                or drag and drop
              </>
            )}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {multiple ? 'Multiple files' : 'Single file'} • Max {formatFileSize(maxSize)} per file
            {maxFiles > 1 && ` • Up to ${maxFiles} files`}
          </p>
          {accept && (
            <p className="text-xs text-gray-500 mt-1">
              Accepted formats: {accept}
            </p>
          )}
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mt-4 space-y-2">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{error.fileName}</p>
                <ul className="text-sm text-red-700 mt-1">
                  {error.errors.map((err, errIndex) => (
                    <li key={errIndex}>• {err}</li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => removeError(index)}
                className="ml-2 text-red-400 hover:text-red-600"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* File Previews */}
      {showPreview && files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Uploaded Files ({files.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {files.map((file) => (
              <div key={file.id} className="relative group">
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-full h-24 object-cover rounded-lg border border-gray-200"
                  />
                ) : (
                  <div className="w-full h-24 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                    {getFileIcon(file.type)}
                  </div>
                )}
                
                {/* File Info Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="text-center text-white">
                    <p className="text-xs font-medium truncate px-2">{file.name}</p>
                    <p className="text-xs opacity-75">{formatFileSize(file.size)}</p>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFile(file.id)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                  title="Remove file"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File List (Alternative to previews) */}
      {!showPreview && files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Uploaded Files ({files.length})
          </h4>
          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.type)}
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Remove file"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;

