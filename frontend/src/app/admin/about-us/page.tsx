"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import RichTextEditor from "@/src/components/admin/RichTextEditor";
import { API_BASE_URL } from "@/src/constants/api";
import type { AboutUs } from "@/src/types/about";
import { CheckCircle2, Image as ImageIcon, Save } from "lucide-react";

const emptyEditorValue = "<p></p>";

export default function AdminAboutUsPage() {
  const [about, setAbout] = useState<AboutUs | null>(null);
  const [descriptionHtml, setDescriptionHtml] = useState(emptyEditorValue);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editorKey, setEditorKey] = useState(0);

  useEffect(() => {
    let active = true;

    const fetchAbout = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/about-us`, {
          cache: "no-store",
        });
        const data = (await response.json()) as { about: AboutUs };

        if (active) {
          setAbout(data.about);
          setDescriptionHtml(data.about.description_html || emptyEditorValue);
          setEditorKey((key) => key + 1);
        }
      } catch {
        if (active) {
          setMessage("Could not load About Us content.");
        }
      }
    };

    void fetchAbout();

    return () => {
      active = false;
    };
  }, []);

  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedImage = event.target.files?.[0] || null;
    setImage(selectedImage);
    setPreviewUrl(selectedImage ? URL.createObjectURL(selectedImage) : "");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    const formData = new FormData();
    formData.append("descriptionHtml", descriptionHtml);

    if (image) {
      formData.append("image", image);
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/about-us`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      const data = (await response.json()) as {
        about?: AboutUs;
        message?: string;
      };

      if (!response.ok) {
        setMessage(data.message || "Could not update About Us.");
        return;
      }

      if (data.about) {
        setAbout(data.about);
      }

      setImage(null);
      setPreviewUrl("");
      setMessage("About Us updated successfully.");
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">About Us</h1>
        <p className="mt-2 text-gray-500">
          Manage the About Us page image and company description.
        </p>
      </div>

      {message && (
        <div className="flex animate-fade-up items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700 shadow-sm">
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}

      {/* Main Form Card */}
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl bg-white shadow-sm"
        style={{ border: "1px solid rgba(0,0,0,0.06)" }}
      >
        {/* Accent Top Bar */}
        <div
          className="h-1 w-full"
          style={{
            background:
              "linear-gradient(90deg, var(--primary-dark), var(--primary-light))",
          }}
        />

        <div className="p-8 space-y-8">
          {/* Image Upload Section */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-6">
            <label className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
              <ImageIcon size={20} className="text-[var(--primary)]" />
              About Us Banner Image
            </label>
            
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-[rgba(11,143,34,0.1)] file:px-4 file:py-2.5 file:font-semibold file:text-[var(--primary-dark)] hover:file:bg-[rgba(11,143,34,0.15)] transition-all cursor-pointer"
            />
            <p className="mt-3 text-sm font-medium text-gray-400">
              Recommended format: JPG/PNG, 600×400px (3:2 ratio).
            </p>

            {(previewUrl || about?.image_url) && (
              <div className="mt-6 aspect-[3/2] max-w-lg overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <img
                  src={previewUrl || about?.image_url || ""}
                  alt="About Us preview"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            )}
          </div>

          {/* Rich Text Editor */}
          <div>
            <label className="mb-4 block text-lg font-bold text-gray-800">
              Company Description
            </label>
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <RichTextEditor
                key={`about-${editorKey}`}
                label=""
                value={descriptionHtml}
                onChange={setDescriptionHtml}
              />
            </div>
          </div>
        </div>

        {/* Form Footer */}
        <div className="border-t border-gray-100 bg-gray-50 px-8 py-5 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="group flex items-center gap-2 rounded-xl px-8 py-3 font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:hover:translate-y-0"
            style={{
              background:
                "linear-gradient(135deg, var(--primary-dark), var(--primary))",
            }}
          >
            <Save size={18} className="transition-transform group-hover:scale-110" />
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
