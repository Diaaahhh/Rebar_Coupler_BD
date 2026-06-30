"use client";

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '@/src/constants/api';

interface AboutCard {
  id: number;
  icon: string;
  heading: string;
  sub_heading: string;
}

interface AboutResponse {
  home: {
    id: number;
    text: string;
  };

  cards: AboutCard[];
}

interface AboutFormData {
  description: string;
  icon: string;
  heading: string;
  subHeading: string;
}

export default function AboutSettingsForm() {
  const [cards, setCards] = useState<AboutCard[]>([]);
  const [formData, setFormData] = useState<AboutFormData>({
  description: "",
  icon: "",
  heading: "",
  subHeading: "",
});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [editingCard, setEditingCard] = useState<AboutCard | null>(null);

  // Load about cards
  const loadCards = async () => {
    try {
      setFetching(true);
      const response = await fetch(`${API_BASE_URL}/api/about`, {
        cache: 'no-store',
        credentials: 'include',
      });
      if (response.ok) {
        const data: AboutResponse = await response.json();

setCards(data.cards || []);

setFormData((prev) => ({
  ...prev,
  description: data.home?.text || "",
}));
      }
    } catch (error) {
      console.error('Could not load about cards', error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const resetForm = () => {
    setFormData((prev) => ({
  description: prev.description,
  icon: "",
  heading: "",
  subHeading: "",
}));
    setEditingCard(null);
  };

  const handleEdit = (card: AboutCard) => {
    setEditingCard(card);
    setFormData((prev) => ({
  description: prev.description,
  icon: card.icon,
  heading: card.heading,
  subHeading: card.sub_heading || "",
}));
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
      const response = await fetch(`${API_BASE_URL}/api/about/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not delete about card.');
      }

      await Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'About card has been deleted.',
        confirmButtonColor: '#0b8f22',
      });

      loadCards();
      if (editingCard?.id === id) {
        resetForm();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Could not delete about card.';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      await Swal.fire({
        icon: 'error',
        title: 'Description required',
        text: 'Please enter a description.',
        confirmButtonColor: '#0b8f22',
      });
      return;
    }

    if (!formData.icon.trim()) {
      await Swal.fire({
        icon: 'error',
        title: 'Icon required',
        text: 'Please enter an icon name (e.g., mdi:shield-check).',
        confirmButtonColor: '#0b8f22',
      });
      return;
    }

    if (!formData.heading.trim()) {
      await Swal.fire({
        icon: 'error',
        title: 'Icon heading required',
        text: 'Please enter an icon heading.',
        confirmButtonColor: '#0b8f22',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
  text: formData.description.trim(),
  icon: formData.icon.trim(),
  heading: formData.heading.trim(),
  sub_heading: formData.subHeading.trim(),
};

      const url = editingCard
        ? `${API_BASE_URL}/api/about/${editingCard.id}`
        : `${API_BASE_URL}/api/about`;

      const method = editingCard ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save about card.');
      }

      await Swal.fire({
        icon: 'success',
        title: 'Saved',
        text: editingCard
          ? 'About card updated successfully.'
          : 'About card created successfully.',
        confirmButtonColor: '#0b8f22',
      });

      resetForm();
      loadCards();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to save about card.';
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

  // Preview the icon if it exists
  const renderIconPreview = () => {
    if (!formData.icon) return null;
    
    // Check if the icon is valid by trying to render it
    try {
      return (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
              <Icon 
                icon={formData.icon} 
                width={40} 
                height={40}
                className="text-[#0b8f22]"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Icon Preview</p>
              <p className="text-xs text-gray-500 font-mono">{formData.icon}</p>
            </div>
          </div>
        </div>
      );
    } catch (error) {
      return (
        <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-700">
            ⚠️ Invalid icon format. Please check the icon name.
          </p>
        </div>
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* List of Saved About Cards */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="border-b border-gray-200 pb-4 mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Saved About Cards</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage about section cards displayed on your website ({cards.length} total)
            </p>
          </div>
        </div>

        {fetching && cards.length === 0 ? (
          <p className="text-center py-6 text-gray-500">Loading about cards...</p>
        ) : cards.length === 0 ? (
          <p className="text-center py-6 text-gray-500">No about cards created yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <div
                key={card.id}
                className="flex flex-col rounded-lg border border-gray-200 bg-gray-50 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Icon Section */}
                <div className="relative h-32 bg-white flex items-center justify-center border-b border-gray-200">
                  <Icon 
                    icon={card.icon} 
                    width={56} 
                    height={56}
                    className="text-[#0b8f22]"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                     ID: {card.id}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                      {card.heading}
                    </h3>
                    {card.sub_heading && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                        {card.sub_heading}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-3 line-clamp-3">
                      {formData.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-gray-200 flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(card)}
                      className="flex-1 rounded bg-[#0b8f22] py-2 text-sm font-semibold text-white hover:bg-[#066b18] transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(card.id)}
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
            {editingCard ? `Edit About Card: ${editingCard.heading}` : "Add New About Card"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {editingCard
              ? "Modify the about card details below. Changes will reflect on the about section."
              : "Add a new about card with an icon from Iconify and description."}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Description */}
          <div className="md:col-span-2">
            <label className="mb-2 block font-semibold text-gray-800">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              placeholder="Enter the description for this about card..."
              className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[#0b8f22] focus:ring-1 focus:ring-[#0b8f22]"
            />
          </div>

          {/* Icon */}
          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Iconify Icon Name *
            </label>
            <input
              type="text"
              name="icon"
              value={formData.icon}
              onChange={handleInputChange}
              required
              placeholder="e.g., mdi:shield-check"
              className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[#0b8f22] focus:ring-1 focus:ring-[#0b8f22] font-mono"
            />
            <p className="mt-2 text-sm text-gray-500">
              Search icons at{' '}
              <a
                href="https://icon-sets.iconify.design/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0b8f22] underline hover:text-[#066b18]"
              >
                icon-sets.iconify.design
              </a>
              {' '}and copy the icon name (e.g., <span className="font-mono text-xs bg-gray-100 px-1 rounded">mdi:shield-check</span>)
            </p>
            {renderIconPreview()}
          </div>

          {/* Icon Heading */}
          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Icon Heading *
            </label>
            <input
              type="text"
              name="heading"
              value={formData.heading}
              onChange={handleInputChange}
              required
              placeholder="e.g., Premium Quality"
              className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[#0b8f22] focus:ring-1 focus:ring-[#0b8f22]"
            />
          </div>

          {/* Icon Subheading */}
          <div className="md:col-span-2">
            <label className="mb-2 block font-semibold text-gray-800">
              Icon Subheading
            </label>
            <input
              type="text"
              name="subHeading"
              value={formData.subHeading}
              onChange={handleInputChange}
              placeholder="e.g., Industry-leading materials"
              className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[#0b8f22] focus:ring-1 focus:ring-[#0b8f22]"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex gap-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded bg-[#0b8f22] px-6 py-3 font-semibold text-white hover:bg-[#066b18] transition-colors disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : editingCard ? 'Update Card' : 'Add Card'}
          </button>

          {editingCard && (
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
}