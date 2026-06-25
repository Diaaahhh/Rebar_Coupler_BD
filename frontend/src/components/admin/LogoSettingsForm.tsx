"use client";

import { FormEvent, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { API_BASE_URL } from "@/src/constants/api";
import type { SiteSettings } from "@/src/types/site";

export default function LogoSettingsForm() {
  const [logoUrl, setLogoUrl] = useState("/logo.png");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [phone, setPhone] = useState("09638-441144");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  useEffect(() => {
    let active = true;

    const loadSettings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/site/settings`, {
          cache: "no-store",
        });
        const data = (await response.json()) as { settings: SiteSettings };

        if (active && data.settings.logo_url) {
          setLogoUrl(data.settings.logo_url);
          setPhone(data.settings.phone || "09638-441144");
        }
      } catch {
        if (active) {
          setMessage("Could not load site settings.");
          setMessageType("error");
        }
      }
    };

    void loadSettings();

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setMessageType("");

    if (!phone.trim()) {
      setMessage("Please enter the header phone number.");
      setMessageType("error");
      await Swal.fire({
        icon: "error",
        title: "Phone required",
        text: "Please enter the header phone number.",
        confirmButtonColor: "#29849f",
      });
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("phone", phone.trim());

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      const response = await fetch(`${API_BASE_URL}/api/site/settings`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });
      const data = (await response.json()) as {
        settings?: SiteSettings;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message || "Could not update logo.");
      }

      if (data.settings?.logo_url) {
        setLogoUrl(data.settings.logo_url);
      }

      if (data.settings?.phone) {
        setPhone(data.settings.phone);
      }

      setLogoFile(null);
      setMessage("Site info updated successfully.");
      setMessageType("success");
      await Swal.fire({
        icon: "success",
        title: "Saved",
        text: "Site info updated successfully.",
        confirmButtonColor: "#29849f",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Could not update logo.";
      setMessage(errorMessage);
      setMessageType("error");
      await Swal.fire({
        icon: "error",
        title: "Not saved",
        text: errorMessage,
        confirmButtonColor: "#29849f",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`border p-4 text-sm font-semibold ${
            messageType === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div>
          <h2 className="text-xl font-bold text-gray-900">Website Information</h2>
          <p className="mt-2 text-sm text-gray-600">
            Manage the logo and phone number shown on the frontend header.
          </p>
        </div>

        <div className="flex items-center gap-5 rounded border border-gray-200 bg-gray-50 p-4">
          <div className="flex h-20 w-32 items-center justify-center bg-white">
            <img
              src={logoUrl}
              alt="Current logo"
              className="max-h-16 max-w-28 object-contain"
            />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Current Logo</p>
            <p className="text-sm text-gray-500">
              Recommended: transparent PNG/WebP, wide logo, under 3 MB.
            </p>
          </div>
        </div>

        <div>
          <label className="mb-2 block font-semibold text-gray-800">
            Upload New Logo
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setLogoFile(event.target.files?.[0] || null)}
            className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold text-gray-800">
            Header Phone Number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            required
            placeholder="09638-441144"
            className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)]"
          />
          <p className="mt-2 text-sm text-gray-500">
            This number will show on the frontend top header phone button.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-[var(--primary)] px-6 py-3 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Site Info"}
        </button>
      </form>
    </div>
  );
}
