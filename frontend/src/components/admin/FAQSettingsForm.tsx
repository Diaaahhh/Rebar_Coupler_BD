"use client";

import { FormEvent, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { API_BASE_URL } from "@/src/constants/api";

interface FAQ {
  id: number;
  title: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export default function FAQSettingsForm() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const loadFaqs = async () => {
    try {
      setFetching(true);
      const response = await fetch(`${API_BASE_URL}/api/faq?all=true`, {
        cache: "no-store",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setFaqs(data);
      }
    } catch (error) {
      console.error("Could not load FAQs", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const resetForm = () => {
    setTitle("");
    setQuestion("");
    setAnswer("");
    setSortOrder(0);
    setIsActive(true);
    setEditingFaq(null);
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setTitle(faq.title || "");
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setSortOrder(faq.sort_order || 0);
    setIsActive(faq.is_active === 1);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0b8f22",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/faq/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete FAQ.");
      }

      await Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "FAQ has been deleted.",
        confirmButtonColor: "#0b8f22",
      });

      loadFaqs();
      if (editingFaq?.id === id) {
        resetForm();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Could not delete FAQ.";
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        confirmButtonColor: "#0b8f22",
      });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      await Swal.fire({
        icon: "error",
        title: "Title required",
        text: "Please enter a title for the FAQ section.",
        confirmButtonColor: "#0b8f22",
      });
      return;
    }

    if (!question.trim()) {
      await Swal.fire({
        icon: "error",
        title: "Question required",
        text: "Please enter a question.",
        confirmButtonColor: "#0b8f22",
      });
      return;
    }

    if (!answer.trim()) {
      await Swal.fire({
        icon: "error",
        title: "Answer required",
        text: "Please enter an answer.",
        confirmButtonColor: "#0b8f22",
      });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: title.trim(),
        question: question.trim(),
        answer: answer.trim(),
        sort_order: sortOrder,
        is_active: isActive ? 1 : 0,
      };

      const url = editingFaq
        ? `${API_BASE_URL}/api/faq/${editingFaq.id}`
        : `${API_BASE_URL}/api/faq`;

      const method = editingFaq ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save FAQ.");
      }

      await Swal.fire({
        icon: "success",
        title: "Saved",
        text: editingFaq
          ? "FAQ updated successfully."
          : "FAQ created successfully.",
        confirmButtonColor: "#0b8f22",
      });

      resetForm();
      loadFaqs();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save FAQ.";
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        confirmButtonColor: "#0b8f22",
      });
    } finally {
      setLoading(false);
    }
  };

  const activeFaqsCount = faqs.filter((f) => f.is_active === 1).length;
  const isFormDisabled = !editingFaq && activeFaqsCount >= 50;

  return (
    <div className="space-y-8">
      {/* List of Saved FAQs */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="border-b border-gray-200 pb-4 mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Saved FAQs</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage frequently asked questions ({activeFaqsCount}/50 active).
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Total: {faqs.length} FAQs
          </div>
        </div>

        {fetching && faqs.length === 0 ? (
          <p className="text-center py-6 text-gray-500">Loading FAQs...</p>
        ) : faqs.length === 0 ? (
          <p className="text-center py-6 text-gray-500">No FAQs created yet.</p>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="rounded-lg border border-gray-200 bg-gray-50 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  {/* Title */}
                  {faq.title && (
                    <div className="mb-2">
                      <h4 className="text-sm font-semibold text-[#0b8f22]">
                        {faq.title}
                      </h4>
                    </div>
                  )}

                  {/* Header with Status and Order */}
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                        {faq.question}
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2 flex-shrink-0">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${
                          faq.is_active === 1 ? "bg-green-600" : "bg-gray-500"
                        }`}
                      >
                        {faq.is_active === 1 ? "Active" : "Inactive"}
                      </span>
                      <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                        Order: {faq.sort_order}
                      </span>
                    </div>
                  </div>

                  {/* Answer */}
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {faq.answer}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-gray-200 flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(faq)}
                      className="flex-1 rounded bg-[#0b8f22] py-2 text-sm font-semibold text-white hover:bg-[#066b18] transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(faq.id)}
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
            {editingFaq ? `Edit FAQ: ${editingFaq.question}` : "Add New FAQ"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {editingFaq
              ? "Modify the FAQ below. Changes will reflect on the FAQ section."
              : "Add a new frequently asked question. Max 50 active FAQs allowed."}
          </p>
        </div>

        {isFormDisabled && (
          <div className="border border-yellow-200 bg-yellow-50 p-4 text-sm font-semibold text-yellow-800 rounded">
            ⚠️ Maximum 50 active FAQs allowed. Deactivate or delete an existing active FAQ to add a new one.
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {/* Title */}
          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              FAQ Section Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isFormDisabled}
              placeholder="e.g., Frequently Asked Questions"
              className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[#0b8f22] focus:ring-1 focus:ring-[#0b8f22] disabled:bg-gray-100 disabled:text-gray-400"
            />
            <p className="mt-1 text-xs text-gray-500">
              This title will appear at the top of the FAQ section.
            </p>
          </div>

          {/* Question */}
          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Question *
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              disabled={isFormDisabled}
              placeholder="e.g., What is the delivery time for your products?"
              className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[#0b8f22] focus:ring-1 focus:ring-[#0b8f22] disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>

          {/* Answer */}
          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Answer *
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
              disabled={isFormDisabled}
              rows={5}
              placeholder="Enter a detailed answer to the question..."
              className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[#0b8f22] focus:ring-1 focus:ring-[#0b8f22] disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>

          {/* Sort Order & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="mb-2 block font-semibold text-gray-800">
                Sort Order
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                disabled={isFormDisabled}
                min="0"
                className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[#0b8f22] focus:ring-1 focus:ring-[#0b8f22] disabled:bg-gray-100 disabled:text-gray-400"
              />
              <p className="mt-1 text-xs text-gray-500">
                Lower numbers appear first. Default: 0
              </p>
            </div>

            <div className="flex items-center">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  disabled={isFormDisabled}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0b8f22]"></div>
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
            className="rounded bg-[#0b8f22] px-6 py-3 font-semibold text-white hover:bg-[#066b18] transition-colors disabled:opacity-60"
          >
            {loading ? "Saving..." : editingFaq ? "Update FAQ" : "Add FAQ"}
          </button>

          {editingFaq && (
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