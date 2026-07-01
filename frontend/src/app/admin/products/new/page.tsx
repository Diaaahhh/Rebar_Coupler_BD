"use client";

import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/src/components/admin/RichTextEditor";
import { API_BASE_URL } from "@/src/constants/api";

const emptyEditorValue = "<p></p>";

export default function NewProductPage() {
  const [installingTeam, setInstallingTeam] = useState("");
  const router = useRouter();
  const [name, setName] = useState("");
  const [queryPhone, setQueryPhone] = useState("");
  const [detailsHtml, setDetailsHtml] = useState(emptyEditorValue);
  const [shortDescriptionHtml, setShortDescriptionHtml] =
    useState(emptyEditorValue);
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editorKey, setEditorKey] = useState(0);
const [availableSizes, setAvailableSizes] = useState<string[]>([]);
const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
const [customSizes, setCustomSizes] = useState("");  const [qualityTest, setQualityTest] = useState("");
  const [pricingSystem, setPricingSystem] = useState("");
  const [sampleTestSystem, setSampleTestSystem] = useState("");
  const [threadingForging, setThreadingForging] = useState("");
  const handleImages = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setImages(selectedFiles.slice(0, 5));
  };

  const resetForm = () => {
    setName("");
    setQueryPhone("");
    setDetailsHtml(emptyEditorValue);
    setShortDescriptionHtml(emptyEditorValue);
    setInstallingTeam("");
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
const mergedSizes = [
  ...selectedSizes,
  ...customSizes
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
];

const uniqueSizes = [...new Set(mergedSizes)];

formData.append(
  "availableSize",
  uniqueSizes.join(", ")
);
formData.append("qualityTest", qualityTest);
formData.append("pricingSystem", pricingSystem);
formData.append("sampleTestSystem", sampleTestSystem);
formData.append("threadingForging", threadingForging);
formData.append("installingTeam", installingTeam);
    formData.append("queryPhone", queryPhone);
    formData.append("detailsHtml", detailsHtml);
    formData.append("shortDescriptionHtml", shortDescriptionHtml);
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

  useEffect(() => {
  const loadSizes = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/products/available-sizes`
      );

      const data = await response.json();

      setAvailableSizes(data.sizes || []);
    } catch {
      // ignore
    }
  };

  loadSizes();
}, []);

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

        <div className="space-y-5 rounded-lg border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-bold">Product Specifications</h2>

          <div>
            <label>Available Size</label>
            <div className="space-y-3">

  <select
    multiple
    value={selectedSizes}
    onChange={(e) =>
      setSelectedSizes(
        Array.from(e.target.selectedOptions, (option) => option.value)
      )
    }
    className="w-full rounded border p-3 h-40"
  >
    {availableSizes.map((size) => (
      <option key={size} value={size}>
        {size} 
      </option>
    ))}
  </select>

  <input
    type="text"
    placeholder="Add custom sizes (e.g. 50mm, 55mm)"
    value={customSizes}
    onChange={(e) => setCustomSizes(e.target.value)}
    className="w-full rounded border p-3"
  />

  <p className="text-sm text-gray-500">
    Hold Ctrl (Windows) or Cmd (Mac) to select multiple existing sizes.
  </p>

</div>
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
          {loading ? "Saving..." : "Save Product"}
        </button>
      </form>
    </div>
  );
}
