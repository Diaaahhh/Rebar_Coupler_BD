"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '@/src/constants/api';

interface Benefit {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  sort_order: number;
  is_active: number;
}

interface BenefitFormData {
  title: string;
  subTitle: string;
  cardHeading: string;
  cardSubHeading: string;
  cardIcon: File | null;
  iconPreview: string | null;
}

const BenefitSettingsForm: React.FC = () => {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [section, setSection] = useState({
  heading: "",
  subheading: "",
});
  const [formData, setFormData] = useState<BenefitFormData>({
    title: '',
    subTitle: '',
    cardHeading: '',
    cardSubHeading: '',
    cardIcon: null,
    iconPreview: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState<Benefit | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load benefits
  const loadBenefits = async () => {
    try {
      setFetching(true);
      const response = await fetch(`${API_BASE_URL}/api/benefits`, {
        cache: 'no-store',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();

setSection({
  heading: data.section?.heading || "",
  subheading: data.section?.subheading || "",
});

setFormData((prev) => ({
  ...prev,
  title: data.section?.heading || "",
  subTitle: data.section?.subheading || "",
}));

setBenefits(data.benefits || []);
      }
    } catch (error) {
      console.error('Could not load benefits', error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadBenefits();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      subTitle: '',
      cardHeading: '',
      cardSubHeading: '',
      cardIcon: null,
      iconPreview: null,
    });
    setEditingBenefit(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEdit = (benefit: Benefit) => {
    setEditingBenefit(benefit);
    setFormData({
  title: section.heading,
  subTitle: section.subheading,

  cardHeading: benefit.title,
  cardSubHeading: benefit.subtitle || "",

  cardIcon: null,
  iconPreview: `${API_BASE_URL}/${benefit.icon}`,
});
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0b8f22',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/benefits/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not delete benefit.');
      }

      await Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Benefit has been deleted.',
        confirmButtonColor: '#0b8f22',
      });

      loadBenefits();
      if (editingBenefit?.id === id) {
        resetForm();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Could not delete benefit.';
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonColor: '#0b8f22',
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File Type',
          text: 'Please upload a valid image file (PNG, JPG, JPEG, SVG, WebP)',
          confirmButtonColor: '#0b8f22',
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: 'Image size should be less than 5MB',
          confirmButtonColor: '#0b8f22',
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          cardIcon: file,
          iconPreview: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      await Swal.fire({
        icon: 'error',
        title: 'Title required',
        text: 'Please enter a benefit title.',
        confirmButtonColor: '#0b8f22',
      });
      return;
    }

    if (!formData.cardHeading.trim()) {
      await Swal.fire({
        icon: 'error',
        title: 'Card heading required',
        text: 'Please enter a card heading.',
        confirmButtonColor: '#0b8f22',
      });
      return;
    }

    if (!editingBenefit && !formData.cardIcon) {
      await Swal.fire({
        icon: 'error',
        title: 'Icon required',
        text: 'Please upload an icon for the new benefit.',
        confirmButtonColor: '#0b8f22',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const submitData = new FormData();
      submitData.append("heading", formData.title.trim());

submitData.append(
  "subheading",
  formData.subTitle.trim()
);

submitData.append(
  "title",
  formData.cardHeading.trim()
);

submitData.append(
  "subtitle",
  formData.cardSubHeading.trim()
);

if (formData.cardIcon) {
  submitData.append("icon", formData.cardIcon);
}

      const url = editingBenefit
        ? `${API_BASE_URL}/api/benefits/${editingBenefit.id}`
        : `${API_BASE_URL}/api/benefits`;

      const method = editingBenefit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        credentials: 'include',
        body: submitData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save benefit.');
      }

      await Swal.fire({
        icon: 'success',
        title: 'Saved',
        text: editingBenefit
          ? 'Benefit updated successfully.'
          : 'Benefit created successfully.',
        confirmButtonColor: '#0b8f22',
      });

      resetForm();
      loadBenefits();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to save benefit.';
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonColor: '#0b8f22',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveIcon = () => {
    setFormData(prev => ({
      ...prev,
      cardIcon: null,
      iconPreview: null
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-8">
      {/* List of Saved Benefits */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="border-b border-gray-200 pb-4 mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Saved Benefits</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage benefits displayed on your website ({benefits.length} total)
            </p>
          </div>
        </div>

        {fetching && benefits.length === 0 ? (
          <p className="text-center py-6 text-gray-500">Loading benefits...</p>
        ) : benefits.length === 0 ? (
          <p className="text-center py-6 text-gray-500">No benefits created yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <div
                key={benefit.id}
                className="flex flex-col rounded-lg border border-gray-200 bg-gray-50 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Icon Section */}
                <div className="relative h-40 bg-gray-100 flex items-center justify-center p-6">
                  {benefit.icon && (
    <img
        src={`${API_BASE_URL}/${benefit.icon}`}
                      alt={benefit.title}
                      className="max-h-full max-w-full object-contain"
                    />
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                      Order: {benefit.sort_order || 0}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                      {benefit.title}
                    </h3>
                    {benefit.subtitle  && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                        {benefit.subtitle }
                      </p>
                    )}
                    <h4 className="text-md font-semibold text-[#0b8f22] mt-2 line-clamp-1">
                      {benefit.title}
                    </h4>
                    {benefit.subtitle  && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {benefit.subtitle }
                      </p>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-gray-200 flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(benefit)}
                      className="flex-1 rounded bg-[#0b8f22] py-2 text-sm font-semibold text-white hover:bg-[#066b18] transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(benefit.id)}
                      className="flex-1 rounded bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Form */}
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {editingBenefit ? `Edit Benefit: ${editingBenefit.title}` : "Add New Benefit"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {editingBenefit
              ? "Modify the benefit details below. Changes will reflect on the website."
              : "Add a new benefit card with an icon and description."}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Title */}
          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Section Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="e.g., Why Choose Us"
              className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[#0b8f22] focus:ring-1 focus:ring-[#0b8f22]"
            />
          </div>

          {/* Sub Title */}
          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Section Sub Title
            </label>
            <input
              type="text"
              name="subTitle"
              value={formData.subTitle}
              onChange={handleInputChange}
              placeholder="e.g., Our Key Benefits"
              className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[#0b8f22] focus:ring-1 focus:ring-[#0b8f22]"
            />
          </div>

          {/* Card Heading */}
          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Card Heading *
            </label>
            <input
              type="text"
              name="cardHeading"
              value={formData.cardHeading}
              onChange={handleInputChange}
              required
              placeholder="e.g., Quality Materials"
              className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[#0b8f22] focus:ring-1 focus:ring-[#0b8f22]"
            />
          </div>

          {/* Card Sub Heading */}
          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Card Sub Heading
            </label>
            <input
              type="text"
              name="cardSubHeading"
              value={formData.cardSubHeading}
              onChange={handleInputChange}
              placeholder="e.g., Premium grade materials"
              className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[#0b8f22] focus:ring-1 focus:ring-[#0b8f22]"
            />
          </div>

          {/* Card Icon Upload */}
          <div className="md:col-span-2">
            <label className="mb-2 block font-semibold text-gray-800">
              Card Icon {editingBenefit ? "(Optional)" : "*"}
            </label>
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="w-full md:flex-1">
                <div 
                  className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 transition-all cursor-pointer hover:border-[#0b8f22] hover:bg-gray-50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended: <strong className="font-semibold">512px × 512px</strong> (Max 5MB)
                    </p>
                    <p className="text-xs text-gray-500">
                      Supported formats: PNG, JPG, JPEG, SVG, WebP
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview Area */}
              {formData.iconPreview && (
                <div className="flex-shrink-0 w-full md:w-auto">
                  <div className="relative w-32 h-32 mx-auto md:mx-0 rounded-lg border-2 border-[#0b8f22] p-1 bg-white shadow-md">
                    <img
                      src={formData.iconPreview}
                      alt="Icon preview"
                      className="w-full h-full object-contain rounded"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveIcon}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 transition-colors shadow-md"
                      aria-label="Remove icon"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-xs text-center text-gray-500 mt-1">512px × 512px</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex gap-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded bg-[#0b8f22] px-6 py-3 font-semibold text-white hover:bg-[#066b18] transition-colors disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : editingBenefit ? 'Update Benefit' : 'Add Benefit'}
          </button>

          {editingBenefit && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default BenefitSettingsForm;