'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Globe, AlertCircle } from 'lucide-react';

interface AddWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (website: { name: string; url: string }) => void;
}

export default function AddWebsiteModal({ isOpen, onClose, onAdd }: AddWebsiteModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    url: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    url: ''
  });

  const validateForm = () => {
    const newErrors = { name: '', url: '' };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Website name is required';
      isValid = false;
    }

    if (!formData.url.trim()) {
      newErrors.url = 'Website URL is required';
      isValid = false;
    } else if (!isValidUrl(formData.url)) {
      newErrors.url = 'Please enter a valid URL (e.g., https://example.com)';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onAdd(formData);
      setFormData({ name: '', url: '' });
      setErrors({ name: '', url: '' });
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleClose = () => {
    setFormData({ name: '', url: '' });
    setErrors({ name: '', url: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4 border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Globe className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Add New Website</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Website Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                errors.name 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-600 focus:ring-blue-500'
              }`}
              placeholder="e.g., My Website"
            />
            {errors.name && (
              <div className="flex items-center mt-1 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.name}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-2">
              Website URL
            </label>
            <input
              id="url"
              name="url"
              type="url"
              value={formData.url}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                errors.url 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-600 focus:ring-blue-500'
              }`}
              placeholder="https://example.com"
            />
            {errors.url && (
              <div className="flex items-center mt-1 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.url}
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-900/20 border border-blue-800 rounded-md p-3">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-300">
                <p className="font-medium mb-1">What happens next?</p>
                <ul className="text-xs space-y-1 text-blue-200">
                  <li>• We'll start monitoring your website immediately</li>
                  <li>• Checks will run every 30 seconds from multiple locations</li>
                  <li>• You'll receive alerts if your site goes down</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="flex-1 text-gray-300 hover:text-white hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            >
              Add Website
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}