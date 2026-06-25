"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import RichTextEditor from "@/src/components/admin/RichTextEditor";
import { API_BASE_URL } from "@/src/constants/api";
import type { AboutUs } from "@/src/types/about";

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
    } catch {
      setMessage("Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">About Us</h1>
        <p className="mt-2 text-gray-600">
          Manage the About Us page image and company description.
        </p>
      </div>

      {message && (
        <div className="border border-gray-200 bg-white p-4 text-sm font-medium text-gray-700">
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 border border-gray-200 bg-white p-6"
      >
        <div>
          <label className="mb-2 block font-semibold text-gray-800">
            About Us Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            className="w-full rounded border border-gray-300 bg-white p-3"
          />
          <p className="mt-2 text-sm text-gray-500">
            Recommended image size: 600 x 400 px or the same 3:2 ratio.
          </p>

          {(previewUrl || about?.image_url) && (
            <div className="mt-4 aspect-[3/2] max-w-xl overflow-hidden rounded-md border border-gray-200 bg-gray-50">
              <img
                src={previewUrl || about?.image_url || ""}
                alt="About Us preview"
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>

        <RichTextEditor
          key={`about-${editorKey}`}
          label="Company Description"
          value={descriptionHtml}
          onChange={setDescriptionHtml}
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-[var(--primary)] px-6 py-3 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save About Us"}
        </button>
      </form>
    </div>
  );
}
