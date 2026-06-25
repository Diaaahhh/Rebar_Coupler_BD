"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/src/components/admin/RichTextEditor";
import { API_BASE_URL } from "@/src/constants/api";

const emptyEditorValue = "<p></p>";

export default function NewProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [queryPhone, setQueryPhone] = useState("");
  const [detailsHtml, setDetailsHtml] = useState(emptyEditorValue);
  const [shortDescriptionHtml, setShortDescriptionHtml] =
    useState(emptyEditorValue);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [seoTags, setSeoTags] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editorKey, setEditorKey] = useState(0);

  const handleImages = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setImages(selectedFiles.slice(0, 5));
  };

  const resetForm = () => {
    setName("");
    setQueryPhone("");
    setDetailsHtml(emptyEditorValue);
    setShortDescriptionHtml(emptyEditorValue);
    setSeoTitle("");
    setSeoDescription("");
    setSeoKeywords("");
    setSeoTags("");
    setImages([]);
    setEditorKey((key) => key + 1);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (images.length < 1 || images.length > 5) {
      setMessage(
        "Please upload at least 1 image and no more than 5 images. The first image is the main image."
      );
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("queryPhone", queryPhone);
    formData.append("detailsHtml", detailsHtml);
    formData.append("shortDescriptionHtml", shortDescriptionHtml);
    formData.append("seoTitle", seoTitle);
    formData.append("seoDescription", seoDescription);
    formData.append("seoKeywords", seoKeywords);
    formData.append("seoTags", seoTags);
    images.forEach((image) => formData.append("images", image));

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setMessage(data.message || "Could not save product.");
        return;
      }

      setMessage("Product saved successfully.");
      resetForm();
      router.push("/admin/products");
    } catch {
      setMessage("Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/products"
          className="text-sm font-semibold text-[var(--primary)]"
        >
          Back to product list
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-gray-900">
          Add New Product
        </h1>
        <p className="mt-2 text-gray-600">
          Add one main image, optional gallery images, and two rich text
          sections.
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
            Product Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold text-gray-800">
            Query Phone Number
          </label>
          <input
            type="tel"
            value={queryPhone}
            onChange={(event) => setQueryPhone(event.target.value)}
            required
            placeholder="018........"
            className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)]"
          />
          <p className="mt-2 text-sm text-gray-500">
            This number will show on the product detail page and will be
            clickable for calling.
          </p>
        </div>

        <div>
          <label className="mb-2 block font-semibold text-gray-800">
            Product Images
          </label>
          <input
            key={editorKey}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImages}
            className="w-full rounded border border-gray-300 bg-white p-3"
          />
          <p className="mt-2 text-sm text-gray-500">
            Upload 1 to 5 images. Recommended image size is 600 x 400 px or the
            same 3:2 ratio. The first selected image is the main image for the
            all-products page and product detail page. The remaining images
            appear below the main image as clickable gallery thumbnails.
          </p>

          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {images.map((image, index) => (
                <div key={`${image.name}-${index}`}>
                  <div className="aspect-[3/2] border border-gray-200 bg-gray-50 p-1">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={image.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <p className="mt-1 text-xs font-medium text-gray-500">
                    {index === 0 ? "Main image" : `Gallery image ${index}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <RichTextEditor
          key={`details-${editorKey}`}
          label="Details of this product"
          value={detailsHtml}
          onChange={setDetailsHtml}
        />

        <RichTextEditor
          key={`short-${editorKey}`}
          label="Product short description / why user should use this"
          value={shortDescriptionHtml}
          onChange={setShortDescriptionHtml}
        />

        <div className="space-y-5 rounded-lg border border-gray-200 bg-gray-50 p-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Product SEO</h2>
            <p className="mt-1 text-sm text-gray-500">
              Optional. These values are used for search engines and social
              sharing. The product name will still remain the main page title.
            </p>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              SEO Title
            </label>
            <input
              type="text"
              value={seoTitle}
              onChange={(event) => setSeoTitle(event.target.value)}
              placeholder="Best keyword-focused title for this product"
              className="w-full rounded border border-gray-300 bg-white p-3 outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              SEO Description
            </label>
            <textarea
              value={seoDescription}
              onChange={(event) => setSeoDescription(event.target.value)}
              rows={3}
              placeholder="Short search result description for this product"
              className="w-full rounded border border-gray-300 bg-white p-3 outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-semibold text-gray-800">
                Keywords
              </label>
              <textarea
                value={seoKeywords}
                onChange={(event) => setSeoKeywords(event.target.value)}
                rows={3}
                placeholder="standard coupler, rebar coupler"
                className="w-full rounded border border-gray-300 bg-white p-3 outline-none focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold text-gray-800">
                Related Tags
              </label>
              <textarea
                value={seoTags}
                onChange={(event) => setSeoTags(event.target.value)}
                rows={3}
                placeholder="#rebar #coupler"
                className="w-full rounded border border-gray-300 bg-white p-3 outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-[var(--primary)] px-6 py-3 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Product"}
        </button>
      </form>
    </div>
  );
}
