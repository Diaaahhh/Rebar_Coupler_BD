"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/src/components/admin/RichTextEditor";
import { API_BASE_URL } from "@/src/constants/api";
import type { Product } from "@/src/types/product";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const emptyEditorValue = "<p></p>";

export default function EditProductPage({ params }: EditProductPageProps) {
  const router = useRouter();
  const [productId, setProductId] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
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

  useEffect(() => {
    let active = true;

    const loadProduct = async () => {
      try {
        const { id } = await params;
        setProductId(id);

        const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          setMessage("Product not found.");
          return;
        }

        const data = (await response.json()) as { product: Product };

        if (active) {
          setProduct(data.product);
          setName(data.product.name);
          setQueryPhone(data.product.query_phone || "");
          setDetailsHtml(data.product.details_html || emptyEditorValue);
          setShortDescriptionHtml(
            data.product.short_description_html || emptyEditorValue
          );
          setSeoTitle(data.product.seo_title || "");
          setSeoDescription(data.product.seo_description || "");
          setSeoKeywords(data.product.seo_keywords || "");
          setSeoTags(data.product.seo_tags || "");
          setEditorKey((key) => key + 1);
        }
      } catch {
        if (active) {
          setMessage("Could not load product.");
        }
      }
    };

    void loadProduct();

    return () => {
      active = false;
    };
  }, [params]);

  const handleImages = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setImages(selectedFiles.slice(0, 5));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (images.length > 5) {
      setMessage("Please upload no more than 5 replacement images.");
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

      const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setMessage(data.message || "Could not update product.");
        return;
      }

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
          Edit Product
        </h1>
        <p className="mt-2 text-gray-600">
          Update product text. Upload new images only if you want to replace the
          current gallery.
        </p>
      </div>

      {message && (
        <div className="border border-gray-200 bg-white p-4 text-sm font-medium text-gray-700">
          {message}
        </div>
      )}

      {!product ? (
        <div className="border border-gray-200 bg-white p-6 text-gray-600">
          Loading product...
        </div>
      ) : (
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
              placeholder="01885-973770"
              className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)]"
            />
            <p className="mt-2 text-sm text-gray-500">
              This number will show on the product detail page and will be
              clickable for calling.
            </p>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Current Images
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {(product.images || []).map((image, index) => (
                <div key={image.id}>
                  <div className="aspect-[3/2] border border-gray-200 bg-gray-50 p-1">
                    <img
                      src={image.image_url}
                      alt={product.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <p className="mt-1 text-xs font-medium text-gray-500">
                    {index === 0 ? "Main image" : `Gallery image ${index}`}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Replace Images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImages}
              className="w-full rounded border border-gray-300 bg-white p-3"
            />
            <p className="mt-2 text-sm text-gray-500">
              Optional. Upload 1 to 5 new images only if you want to replace all
              current images. Recommended size is 600 x 400 px or the same 3:2
              ratio. First selected image becomes the main image.
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
                      {index === 0 ? "New main image" : `New gallery ${index}`}
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
                sharing. The product name stays as the main product title.
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
            {loading ? "Updating..." : "Update Product"}
          </button>
        </form>
      )}
    </div>
  );
}
