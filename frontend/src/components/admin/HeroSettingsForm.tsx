"use client";

import { FormEvent, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { API_BASE_URL } from "@/src/constants/api";
import type { HeroSlide } from "@/src/types/hero";

export default function HeroSettingsForm() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonLink, setButtonLink] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const loadSlides = async () => {
    try {
      setFetching(true);
      const response = await fetch(`${API_BASE_URL}/api/hero?all=true`, {
        cache: "no-store",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setSlides(data);
      }
    } catch (error) {
      console.error("Could not load hero slides", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadSlides();
  }, []);

  const resetForm = () => {
    setTitle("");
    setSubtitle("");
    setDescription("");
    setButtonText("");
    setButtonLink("");
    setImageFile(null);
    setSortOrder(0);
    setIsActive(true);
    setEditingSlide(null);
  };

  const handleEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setTitle(slide.title);
    setSubtitle(slide.subtitle || "");
    setDescription(slide.description || "");
    setButtonText(slide.button_text || "");
    setButtonLink(slide.button_link || "");
    setSortOrder(slide.sort_order || 0);
    setIsActive(slide.is_active === 1);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#29849f",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/hero/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete slide.");
      }

      await Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Hero slide has been deleted.",
        confirmButtonColor: "#29849f",
      });

      loadSlides();
      if (editingSlide?.id === id) {
        resetForm();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Could not delete slide.";
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        confirmButtonColor: "#29849f",
      });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      await Swal.fire({
        icon: "error",
        title: "Title required",
        text: "Please enter a slide title.",
        confirmButtonColor: "#29849f",
      });
      return;
    }

    if (!editingSlide && !imageFile) {
      await Swal.fire({
        icon: "error",
        title: "Image required",
        text: "Please upload an image for the new slide.",
        confirmButtonColor: "#29849f",
      });
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("subtitle", subtitle.trim());
      formData.append("description", description.trim());
      formData.append("button_text", buttonText.trim());
      formData.append("button_link", buttonLink.trim());
      formData.append("sort_order", String(sortOrder));
      formData.append("is_active", isActive ? "1" : "0");

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const url = editingSlide
        ? `${API_BASE_URL}/api/hero/${editingSlide.id}`
        : `${API_BASE_URL}/api/hero`;

      const method = editingSlide ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save slide.");
      }

      await Swal.fire({
        icon: "success",
        title: "Saved",
        text: editingSlide
          ? "Hero slide updated successfully."
          : "Hero slide created successfully.",
        confirmButtonColor: "#29849f",
      });

      resetForm();
      loadSlides();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save slide.";
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        confirmButtonColor: "#29849f",
      });
    } finally {
      setLoading(false);
    }
  };

  const activeSlidesCount = slides.filter((s) => s.is_active === 1).length;
  const isFormDisabled = !editingSlide && activeSlidesCount >= 5;

  return (
    <div className="space-y-8">
      {/* List of Saved Slides */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="border-b border-gray-200 pb-4 mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Saved Hero Slides</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage slides shown in the homepage hero slider ({activeSlidesCount}/5 active).
            </p>
          </div>
        </div>

        {fetching && slides.length === 0 ? (
          <p className="text-center py-6 text-gray-500">Loading slides...</p>
        ) : slides.length === 0 ? (
          <p className="text-center py-6 text-gray-500">No slides created yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {slides.map((slide) => (
              <div
                key={slide.id}
                className="flex flex-col rounded-lg border border-gray-200 bg-gray-50 overflow-hidden shadow-sm"
              >
                {/* Image Section */}
                <div className="relative h-44 bg-gray-200">
                  <img
                    src={`${API_BASE_URL}/${slide.image}`}
                    alt={slide.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${
                        slide.is_active === 1 ? "bg-green-600" : "bg-gray-500"
                      }`}
                    >
                      {slide.is_active === 1 ? "Active" : "Inactive"}
                    </span>
                    <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                      Order: {slide.sort_order}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                      {slide.title}
                    </h3>
                    {slide.subtitle && (
                      <h4 className="text-sm font-medium text-gray-600 mt-1 line-clamp-1">
                        {slide.subtitle}
                      </h4>
                    )}
                    {slide.description && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                        {slide.description}
                      </p>
                    )}
                    {slide.button_text && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-700 bg-gray-200 px-2 py-1 rounded">
                          Button: {slide.button_text}
                        </span>
                        <span className="text-xs text-blue-600 truncate max-w-[150px]">
                          {slide.button_link}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-gray-200 flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(slide)}
                      className="flex-1 rounded bg-[var(--primary)] py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(slide.id)}
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
            {editingSlide ? `Edit Slide: ${editingSlide.title}` : "Add New Hero Slide"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {editingSlide
              ? "Modify the slide contents below. Changes will reflect on the homepage hero section."
              : "Upload a beautiful high-resolution image and enter slider text. Max 5 active slides allowed."}
          </p>
        </div>

        {isFormDisabled && (
          <div className="border border-yellow-200 bg-yellow-50 p-4 text-sm font-semibold text-yellow-800 rounded">
            ⚠️ Maximum 5 active slides allowed. Deactivate or delete an existing active slide to add a new one.
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Title */}
          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Slide Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isFormDisabled}
              placeholder="e.g., Premium Rebar Couplers"
              className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)] disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Subtitle
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              disabled={isFormDisabled}
              placeholder="e.g., Reliable Mechanical Splicing"
              className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)] disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="mb-2 block font-semibold text-gray-800">
              Description / Paragraph
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isFormDisabled}
              rows={3}
              placeholder="e.g., Designed for high-rise buildings and infrastructure projects..."
              className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)] disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>

          {/* Button Text */}
          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Button Text
            </label>
            <input
              type="text"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              disabled={isFormDisabled}
              placeholder="e.g., View Products"
              className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)] disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>

          {/* Button Link */}
          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Button Link
            </label>
            <input
              type="text"
              value={buttonLink}
              onChange={(e) => setButtonLink(e.target.value)}
              disabled={isFormDisabled}
              placeholder="e.g., /products"
              className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)] disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Slide Image {editingSlide ? "(Optional)" : "*"}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              disabled={isFormDisabled}
              className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)] disabled:bg-gray-100 disabled:text-gray-400"
            />
            <p className="mt-1.5 text-xs text-gray-500">
              Recommended: 1920x800 resolution or similar landscape aspect ratio. Max 5 MB.
            </p>
          </div>

          {/* Sort Order & Status */}
          <div className="flex gap-6 items-center">
            <div className="flex-1">
              <label className="mb-2 block font-semibold text-gray-800">
                Sort Order
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                disabled={isFormDisabled}
                className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)] disabled:bg-gray-100 disabled:text-gray-400"
              />
            </div>
            <div className="flex items-center mt-6">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  disabled={isFormDisabled}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                <span className="ms-3 text-sm font-semibold text-gray-800">Active</span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex gap-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading || isFormDisabled}
            className="rounded bg-[var(--primary)] px-6 py-3 font-semibold text-white disabled:opacity-60 transition-opacity"
          >
            {loading ? "Saving..." : editingSlide ? "Update Slide" : "Add Slide"}
          </button>

          {editingSlide && (
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
