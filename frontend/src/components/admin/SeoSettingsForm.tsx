"use client";

import { FormEvent, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { API_BASE_URL } from "@/src/constants/api";
import type { SiteSettings } from "@/src/types/site";

export default function SeoSettingsForm() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [siteTitle, setSiteTitle] = useState("Rebar Coupler Bangladesh");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  const [seoTags, setSeoTags] = useState<string[]>([]);

  const [keywordInput, setKeywordInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  const MAX_ITEMS = 10;
  const [googleSiteVerification, setGoogleSiteVerification] = useState("");
  const [pinterestDomainVerify, setPinterestDomainVerify] = useState("");
  const [fbAppId, setFbAppId] = useState("");
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [ogImageFile, setOgImageFile] = useState<File | null>(null);
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

        if (!active) {
          return;
        }

        setSettings(data.settings);
        setSiteTitle(data.settings.site_title || "Rebar Coupler Bangladesh");
        setSeoTitle(data.settings.seo_title || "");
        setSeoDescription(data.settings.seo_description || "");
        setSeoKeywords(
          data.settings.seo_keywords
            ? data.settings.seo_keywords
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
            : [],
        );

        setSeoTags(
          data.settings.seo_tags
            ? data.settings.seo_tags
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
            : [],
        );
        setGoogleSiteVerification(data.settings.google_site_verification || "");
        setPinterestDomainVerify(data.settings.pinterest_domain_verify || "");
        setFbAppId(data.settings.fb_app_id || "");
      } catch {
        if (active) {
          setMessage("Could not load SEO settings.");
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

    if (!siteTitle.trim()) {
      setMessage("Please enter the site title.");
      setMessageType("error");
      await Swal.fire({
        icon: "error",
        title: "Site title required",
        text: "Please enter the site title.",
        confirmButtonColor: "#29849f",
      });
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("siteTitle", siteTitle.trim());
      formData.append("seoTitle", seoTitle.trim());
      formData.append("seoDescription", seoDescription.trim());
      formData.append("seoKeywords", seoKeywords.join(", "));
      formData.append("seoTags", seoTags.join(", "));
      formData.append("googleSiteVerification", googleSiteVerification.trim());
      formData.append("pinterestDomainVerify", pinterestDomainVerify.trim());
      formData.append("fbAppId", fbAppId.trim());

      if (faviconFile) {
        formData.append("favicon", faviconFile);
      }

      if (ogImageFile) {
        formData.append("ogImage", ogImageFile);
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
        throw new Error(data.message || "Could not save SEO settings.");
      }

      if (data.settings) {
        setSettings(data.settings);
      }

      setFaviconFile(null);
      setOgImageFile(null);
      setMessage("SEO settings saved successfully.");
      setMessageType("success");
      await Swal.fire({
        icon: "success",
        title: "Saved",
        text: "SEO settings saved successfully.",
        confirmButtonColor: "#29849f",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Could not save SEO settings.";
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

  const addItem = (
    value: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    clearInput: () => void,
  ) => {
    const item = value.trim().replace(/,$/, "");

    if (!item) return;

    if (list.some((x) => x.toLowerCase() === item.toLowerCase())) {
      clearInput();
      return;
    }

    if (list.length >= MAX_ITEMS) {
      return;
    }

    setList([...list, item]);
    clearInput();
  };
  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`rounded-lg border p-4 text-sm font-semibold ${
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
        className="max-w-4xl space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Website SEO Settings
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            These values are used for website title, default meta tags, social
            sharing, favicon, and site verification.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Site Title
            </label>
            <input
              type="text"
              value={siteTitle}
              onChange={(event) => setSiteTitle(event.target.value)}
              required
              className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              SEO Title
            </label>
            <input
              type="text"
              value={seoTitle}
              onChange={(event) => setSeoTitle(event.target.value)}
              placeholder="Used in browser title and OG title"
              className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)]"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block font-semibold text-gray-800">
            Site Description
          </label>
          <textarea
            value={seoDescription}
            onChange={(event) => setSeoDescription(event.target.value)}
            rows={4}
            placeholder="Short description for search engines and sharing"
            className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* tags */}
          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Keywords
            </label>
            <div className="rounded border border-gray-300 p-3">
              <div className="mb-2 flex flex-wrap gap-2">
                {seoKeywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="flex items-center gap-2 rounded-full bg-[var(--primary)] px-3 py-1 text-sm text-white"
                  >
                    {keyword}

                    <button
                      type="button"
                      onClick={() =>
                        setSeoKeywords(
                          seoKeywords.filter((item) => item !== keyword),
                        )
                      }
                      className="font-bold hover:text-red-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <input
                type="text"
                value={keywordInput}
                placeholder="Type keyword then press comma"
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "," || e.key === "Enter") {
                    e.preventDefault();

                    addItem(keywordInput, seoKeywords, setSeoKeywords, () =>
                      setKeywordInput(""),
                    );
                  }
                }}
                className="w-full outline-none"
              />
            </div>

            <p className="mt-2 text-xs text-gray-500">
              {seoKeywords.length}/10 keywords
            </p>
          </div>

          {/* keywords */}
          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Related Tags
            </label>
            <div className="rounded border border-gray-300 p-3">
              <div className="mb-2 flex flex-wrap gap-2">
                {seoTags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-2 rounded-full bg-gray-200 px-3 py-1 text-sm"
                  >
                    {tag}

                    <button
                      type="button"
                      onClick={() =>
                        setSeoTags(seoTags.filter((item) => item !== tag))
                      }
                      className="font-bold hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <input
                type="text"
                value={tagInput}
                placeholder="Type tag then press comma"
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "," || e.key === "Enter") {
                    e.preventDefault();

                    addItem(tagInput, seoTags, setSeoTags, () =>
                      setTagInput(""),
                    );
                  }
                }}
                className="w-full outline-none"
              />
            </div>
          </div>

          <p className="mt-2 text-xs text-gray-500">{seoTags.length}/10 tags</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Google Verification
            </label>
            <input
              type="text"
              value={googleSiteVerification}
              onChange={(event) =>
                setGoogleSiteVerification(event.target.value)
              }
              className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Pinterest Verification
            </label>
            <input
              type="text"
              value={pinterestDomainVerify}
              onChange={(event) => setPinterestDomainVerify(event.target.value)}
              className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Facebook App ID
            </label>
            <input
              type="text"
              value={fbAppId}
              onChange={(event) => setFbAppId(event.target.value)}
              className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)]"
            />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Favicon / Shortcut Icon
            </label>
            {settings?.favicon_url && (
              <img
                src={settings.favicon_url}
                alt="Current favicon"
                className="mb-3 h-12 w-12 rounded border border-gray-200 object-contain p-1"
              />
            )}
            <input
              type="file"
              accept="image/*,.ico"
              onChange={(event) =>
                setFaviconFile(event.target.files?.[0] || null)
              }
              className="w-full rounded border border-gray-300 p-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              OG Image
            </label>
            {settings?.og_image_url && (
              <img
                src={settings.og_image_url}
                alt="Current OG image"
                className="mb-3 h-20 w-36 rounded border border-gray-200 object-cover"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                setOgImageFile(event.target.files?.[0] || null)
              }
              className="w-full rounded border border-gray-300 p-3"
            />
            <p className="mt-2 text-sm text-gray-500">
              Recommended OG image size: 1200 x 630 px.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-[var(--primary)] px-6 py-3 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save SEO Settings"}
        </button>
      </form>
    </div>
  );
}
