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
  const [installingTeam, setInstallingTeam] = useState("");
  const router = useRouter();
  const [productId, setProductId] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [queryPhone, setQueryPhone] = useState("");
  const [detailsHtml, setDetailsHtml] = useState(emptyEditorValue);
  const [shortDescriptionHtml, setShortDescriptionHtml] =
    useState(emptyEditorValue);
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editorKey, setEditorKey] = useState(0);
const [availableSize, setAvailableSize] = useState("");
const [qualityTest, setQualityTest] = useState("");
const [pricingSystem, setPricingSystem] = useState("");
const [sampleTestSystem, setSampleTestSystem] = useState("");
const [threadingForging, setThreadingForging] = useState("");
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
          setEditorKey((key) => key + 1);
          setAvailableSize(data.product.available_size || "");
setQualityTest(data.product.quality_test || "");
setPricingSystem(data.product.pricing_system || "");
setSampleTestSystem(data.product.sample_test_system || "");
setThreadingForging(data.product.threading_forging || "");
setInstallingTeam(data.product.installing_team || "");
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
    formData.append("availableSize", availableSize);
formData.append("qualityTest", qualityTest);
formData.append("pricingSystem", pricingSystem);
formData.append("sampleTestSystem", sampleTestSystem);
formData.append("threadingForging", threadingForging);
formData.append("installingTeam", installingTeam);
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

          <div className="space-y-5 rounded-lg border border-gray-200 bg-gray-50 p-5">
  <h2 className="text-xl font-bold">Product Specifications</h2>

  <div>
    <label>Available Size (mm)</label>
    <input
      type="text"
      value={availableSize}
      onChange={(e) => setAvailableSize(e.target.value)}
      className="w-full rounded border p-3"
    />
  </div>

  <div>
    <label>Quality Test</label>
    <textarea
      rows={3}
      value={qualityTest}
      onChange={(e) => setQualityTest(e.target.value)}
      className="w-full rounded border p-3"
    />
  </div>

  <div>
    <label>Pricing System</label>
    <textarea
      rows={3}
      value={pricingSystem}
      onChange={(e) => setPricingSystem(e.target.value)}
      className="w-full rounded border p-3"
    />
  </div>

  <div>
    <label>Sample Test System</label>
    <textarea
      rows={3}
      value={sampleTestSystem}
      onChange={(e) => setSampleTestSystem(e.target.value)}
      className="w-full rounded border p-3"
    />
  </div>

  <div>
    <label>Threading & Forging</label>
    <textarea
      rows={3}
      value={threadingForging}
      onChange={(e) => setThreadingForging(e.target.value)}
      className="w-full rounded border p-3"
    />
  </div>

  <div>
  <label>Installation Team</label>
  <textarea
    rows={3}
    value={installingTeam}
    onChange={(e) => setInstallingTeam(e.target.value)}
    className="w-full rounded border p-3"
    placeholder="Enter installation team information..."
  />
</div>
</div>

          <RichTextEditor
            key={`short-${editorKey}`}
            label="Product short description / why user should use this"
            value={shortDescriptionHtml}
            onChange={setShortDescriptionHtml}
          />

         

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
