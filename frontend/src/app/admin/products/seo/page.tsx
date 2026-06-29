"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/src/constants/api";

type ProductOption = {
  id: number;
  name: string;
};

type SeoData = {
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  seo_tags: string;
};

export default function ProductSeoPage() {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [selectedId, setSelectedId] = useState<number | "">("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [seoTags, setSeoTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Load product list on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products`, {
          cache: "no-store",
        });
        if (!response.ok) return;
        const data = (await response.json()) as {
          products: { id: number; name: string }[];
        };
        setProducts(data.products.map((p) => ({ id: p.id, name: p.name })));
      } catch {
        // silently ignore
      }
    };

    void loadProducts();
  }, []);

  // Load existing SEO data when a product is selected
  useEffect(() => {
    if (selectedId === "") {
      setSeoTitle("");
      setSeoDescription("");
      setSeoKeywords("");
      setSeoTags("");
      return;
    }

    const loadSeo = async () => {
      setFetchingProduct(true);
      setMessage(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/products/${selectedId}`, {
          cache: "no-store",
        });
        if (!response.ok) return;
        const data = (await response.json()) as { product: SeoData };
        setSeoTitle(data.product.seo_title ?? "");
        setSeoDescription(data.product.seo_description ?? "");
        setSeoKeywords(data.product.seo_keywords ?? "");
        setSeoTags(data.product.seo_tags ?? "");
      } catch {
        setMessage({ text: "Could not load product SEO data.", type: "error" });
      } finally {
        setFetchingProduct(false);
      }
    };

    void loadSeo();
  }, [selectedId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedId === "") return;

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${selectedId}/seo`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seoTitle,
          seoDescription,
          seoKeywords,
          seoTags,
        }),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setMessage({ text: data.message ?? "Could not update SEO data.", type: "error" });
        return;
      }

      setMessage({ text: "SEO data saved successfully!", type: "success" });
    } catch {
      setMessage({ text: "Server Error. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/admin/products"
          className="text-sm font-semibold text-[var(--primary)]"
        >
          ← Back to product list
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-gray-900">Product SEO</h1>
        <p className="mt-2 text-gray-600">
          Select a product and update its SEO metadata — title, description,
          keywords, and tags.
        </p>
      </div>

      {/* Feedback message */}
      {message && (
        <div
          className={`rounded border p-4 text-sm font-medium ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded border border-gray-200 bg-white p-6 shadow-sm"
      >
        {/* Product selector */}
        <div>
          <label
            htmlFor="product-select"
            className="mb-2 block font-semibold text-gray-800"
          >
            Product Name <span className="text-red-500">*</span>
          </label>
          <select
            id="product-select"
            value={selectedId}
            onChange={(e) =>
              setSelectedId(e.target.value === "" ? "" : Number(e.target.value))
            }
            required
            className="w-full rounded border border-gray-300 bg-white p-3 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition"
          >
            <option value="">— Select a product —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* SEO fields — shown only after a product is chosen */}
        {selectedId !== "" && (
          <>
            {fetchingProduct ? (
              <div className="rounded border border-gray-200 bg-gray-50 p-6 text-center text-gray-500">
                Loading SEO data…
              </div>
            ) : (
              <>
                {/* SEO Title */}
                <div>
                  <label
                    htmlFor="seo-title"
                    className="mb-2 block font-semibold text-gray-800"
                  >
                    SEO Title
                  </label>
                  <input
                    id="seo-title"
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    maxLength={255}
                    placeholder="e.g. Buy Premium Rebar Couplers — Best Price in BD"
                    className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Recommended: 50–60 characters. Currently: {seoTitle.length}
                  </p>
                </div>

                {/* SEO Description */}
                <div>
                  <label
                    htmlFor="seo-description"
                    className="mb-2 block font-semibold text-gray-800"
                  >
                    SEO Description
                  </label>
                  <textarea
                    id="seo-description"
                    rows={3}
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="A concise summary that appears below your page title in search results…"
                    className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition resize-y"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Recommended: 150–160 characters. Currently: {seoDescription.length}
                  </p>
                </div>

                {/* SEO Keywords */}
                <div>
                  <label
                    htmlFor="seo-keywords"
                    className="mb-2 block font-semibold text-gray-800"
                  >
                    SEO Keywords
                  </label>
                  <textarea
                    id="seo-keywords"
                    rows={2}
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                    placeholder="rebar coupler, mechanical coupler, steel coupler, BD"
                    className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition resize-y"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Comma-separated keywords relevant to this product.
                  </p>
                </div>

                {/* SEO Tags */}
                <div>
                  <label
                    htmlFor="seo-tags"
                    className="mb-2 block font-semibold text-gray-800"
                  >
                    SEO Tags
                  </label>
                  <textarea
                    id="seo-tags"
                    rows={2}
                    value={seoTags}
                    onChange={(e) => setSeoTags(e.target.value)}
                    placeholder="construction, rebar, coupler, mechanical splice"
                    className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition resize-y"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Comma-separated tags to help categorise the page.
                  </p>
                </div>

                {/* Save button */}
                <div className="flex items-center gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded bg-[var(--primary)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--primary-dark)] disabled:opacity-60"
                  >
                    {loading ? "Saving…" : "Save SEO Data"}
                  </button>

                  {message?.type === "success" && (
                    <span className="text-sm font-medium text-green-700">
                      ✓ Saved
                    </span>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* Prompt when no product selected */}
        {selectedId === "" && (
          <div className="rounded border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-400">
            Select a product above to edit its SEO fields.
          </div>
        )}
      </form>
    </div>
  );
}
