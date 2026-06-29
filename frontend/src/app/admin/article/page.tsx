"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import RichTextEditor from "@/src/components/admin/RichTextEditor";
import { API_BASE_URL } from "@/src/constants/api";
import type { Article } from "@/src/types/article";
import { CheckCircle2, AlertCircle, Sparkles, Image as ImageIcon, Save, Type } from "lucide-react";

const emptyEditorValue = "<p></p>";
type ArticleField = "titleBn" | "titleEn" | "contentBn" | "contentEn";

async function translateArticleText(
  text: string,
  targetLanguage: "bn" | "en",
  format: "text" | "html"
) {
  const response = await fetch(`${API_BASE_URL}/api/article/translate`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      targetLanguage,
      format,
    }),
  });

  const data = (await response.json()) as {
    translatedText?: string;
    message?: string;
  };

  if (!response.ok || !data.translatedText) {
    throw new Error(data.message || "Could not translate content.");
  }

  return data.translatedText;
}

export default function AdminArticlePage() {
  const [article, setArticle] = useState<Article | null>(null);
  const [titleBn, setTitleBn] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [contentBnHtml, setContentBnHtml] = useState(emptyEditorValue);
  const [contentEnHtml, setContentEnHtml] = useState(emptyEditorValue);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [editorKey, setEditorKey] = useState(0);
  const [translationStatus, setTranslationStatus] = useState("");
  const lastEditedField = useRef<ArticleField | null>(null);

  useEffect(() => {
    let active = true;

    const loadArticle = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/article`, {
          cache: "no-store",
        });
        const data = (await response.json()) as { article: Article };

        if (active) {
          setArticle(data.article);
          setTitleBn(data.article.title_bn || "");
          setTitleEn(data.article.title_en || "");
          setContentBnHtml(data.article.content_bn_html || emptyEditorValue);
          setContentEnHtml(data.article.content_en_html || emptyEditorValue);
          setEditorKey((key) => key + 1);
        }
      } catch {
        if (active) {
          setMessage("Could not load blog content.");
          setMessageType("error");
        }
      }
    };

    void loadArticle();

    return () => {
      active = false;
    };
  }, []);

  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedImage = event.target.files?.[0] || null;
    setImage(selectedImage);
    setPreviewUrl(selectedImage ? URL.createObjectURL(selectedImage) : "");
  };

  useEffect(() => {
    if (lastEditedField.current !== "titleBn" || !titleBn.trim()) return;

    const timeout = window.setTimeout(async () => {
      try {
        setTranslationStatus("Translating Bangla title to English...");
        const translatedText = await translateArticleText(titleBn, "en", "text");
        setTitleEn(translatedText);
        setTranslationStatus("English title updated automatically ✨");
        setTimeout(() => setTranslationStatus(""), 3000);
      } catch {
        setTranslationStatus("Auto translation failed. Please check manually.");
        setTimeout(() => setTranslationStatus(""), 4000);
      }
    }, 800);

    return () => window.clearTimeout(timeout);
  }, [titleBn]);

  useEffect(() => {
    if (lastEditedField.current !== "titleEn" || !titleEn.trim()) return;

    const timeout = window.setTimeout(async () => {
      try {
        setTranslationStatus("Translating English title to Bangla...");
        const translatedText = await translateArticleText(titleEn, "bn", "text");
        setTitleBn(translatedText);
        setTranslationStatus("Bangla title updated automatically ✨");
        setTimeout(() => setTranslationStatus(""), 3000);
      } catch {
        setTranslationStatus("Auto translation failed. Please check manually.");
        setTimeout(() => setTranslationStatus(""), 4000);
      }
    }, 800);

    return () => window.clearTimeout(timeout);
  }, [titleEn]);

  useEffect(() => {
    if (lastEditedField.current !== "contentBn" || !contentBnHtml.trim()) return;

    const timeout = window.setTimeout(async () => {
      try {
        setTranslationStatus("Translating Bangla blog to English...");
        const translatedHtml = await translateArticleText(contentBnHtml, "en", "html");
        setContentEnHtml(translatedHtml);
        setTranslationStatus("English blog updated automatically ✨");
        setTimeout(() => setTranslationStatus(""), 3000);
      } catch {
        setTranslationStatus("Auto translation failed. Please check manually.");
        setTimeout(() => setTranslationStatus(""), 4000);
      }
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [contentBnHtml]);

  useEffect(() => {
    if (lastEditedField.current !== "contentEn" || !contentEnHtml.trim()) return;

    const timeout = window.setTimeout(async () => {
      try {
        setTranslationStatus("Translating English blog to Bangla...");
        const translatedHtml = await translateArticleText(contentEnHtml, "bn", "html");
        setContentBnHtml(translatedHtml);
        setTranslationStatus("Bangla blog updated automatically ✨");
        setTimeout(() => setTranslationStatus(""), 3000);
      } catch {
        setTranslationStatus("Auto translation failed. Please check manually.");
        setTimeout(() => setTranslationStatus(""), 4000);
      }
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [contentEnHtml]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setMessageType("");

    const formData = new FormData();
    formData.append("titleBn", titleBn);
    formData.append("titleEn", titleEn);
    formData.append("contentBnHtml", contentBnHtml);
    formData.append("contentEnHtml", contentEnHtml);

    if (image) {
      formData.append("image", image);
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/article`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      const data = (await response.json()) as {
        article?: Article;
        message?: string;
      };

      if (!response.ok) {
        const errorMessage = data.message || "Could not update blog.";
        setMessage(errorMessage);
        setMessageType("error");
        await Swal.fire({
          icon: "error",
          title: "Not saved",
          text: errorMessage,
          confirmButtonColor: "#29849f",
        });
        return;
      }

      if (data.article) {
        setArticle(data.article);
      }

      setImage(null);
      setPreviewUrl("");
      setMessage("Blog updated successfully.");
      setMessageType("success");
      
      setTimeout(() => setMessage(""), 4000);
      
      await Swal.fire({
        icon: "success",
        title: "Saved",
        text: "Blog content updated successfully.",
        confirmButtonColor: "#0b8f22",
      });
    } catch {
      setMessage("Server Error");
      setMessageType("error");
      await Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Please try again later.",
        confirmButtonColor: "#29849f",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Company Blog</h1>
        <p className="mt-2 text-gray-500">
          Manage the blog image, Bangla content, and English content.
        </p>
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50/50 px-4 py-2 text-sm font-medium text-blue-700 border border-blue-100/50 w-fit">
          <Sparkles size={16} />
          Type in either language first. The other will be filled automatically via AI translation.
        </div>
      </div>

      {/* Feedback Messages */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {message && (
          <div
            className={`flex animate-fade-up items-center gap-3 rounded-xl border px-5 py-4 text-sm font-semibold shadow-lg backdrop-blur-md ${
              messageType === "success"
                ? "border-green-200 bg-green-50/90 text-green-700"
                : "border-red-200 bg-red-50/90 text-red-700"
            }`}
          >
            {messageType === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {message}
          </div>
        )}

        {translationStatus && (
          <div className="flex animate-fade-up items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/90 px-5 py-4 text-sm font-semibold text-blue-700 shadow-lg backdrop-blur-md">
            <Sparkles size={18} className="animate-pulse" />
            {translationStatus}
          </div>
        )}
      </div>

      {/* Main Form Card */}
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl bg-white shadow-sm"
        style={{ border: "1px solid rgba(0,0,0,0.06)" }}
      >
        <div
          className="h-1 w-full"
          style={{
            background:
              "linear-gradient(90deg, var(--primary-dark), var(--primary-light))",
          }}
        />

        <div className="p-8 space-y-10">
          {/* Image Upload Section */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-6">
            <label className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
              <ImageIcon size={20} className="text-[var(--primary)]" />
              Blog Cover Image
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

            {(previewUrl || article?.image_url) && (
              <div className="mt-6 aspect-[3/2] max-w-lg overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <img
                  src={previewUrl || article?.image_url || ""}
                  alt="Blog preview"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            )}
          </div>

          {/* Titles Section */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-base font-bold text-gray-800">
                <Type size={16} className="text-[var(--primary)]" />
                Bangla Title
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={titleBn}
                  maxLength={60}
                  onChange={(event) => {
                    lastEditedField.current = "titleBn";
                    setTitleBn(event.target.value);
                  }}
                  required
                  placeholder="ব্লগের শিরোনাম..."
                  className="w-full rounded-xl border border-gray-300 bg-white p-4 pr-16 outline-none transition-all focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                  {titleBn.length}/60
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-base font-bold text-gray-800">
                <Type size={16} className="text-[var(--primary)]" />
                English Title
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={titleEn}
                  maxLength={60}
                  onChange={(event) => {
                    lastEditedField.current = "titleEn";
                    setTitleEn(event.target.value);
                  }}
                  required
                  placeholder="Blog title..."
                  className="w-full rounded-xl border border-gray-300 bg-white p-4 pr-16 outline-none transition-all focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                  {titleEn.length}/60
                </span>
              </div>
            </div>
          </div>

          {/* Content Editors Section */}
          <div className="space-y-8">
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                <h3 className="font-bold text-gray-800">Bangla Blog Details</h3>
              </div>
              <RichTextEditor
                key={`article-bn-${editorKey}`}
                label=""
                value={contentBnHtml}
                onChange={(value) => {
                  lastEditedField.current = "contentBn";
                  setContentBnHtml(value);
                }}
              />
            </div>

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                <h3 className="font-bold text-gray-800">English Blog Details</h3>
              </div>
              <RichTextEditor
                key={`article-en-${editorKey}`}
                label=""
                value={contentEnHtml}
                onChange={(value) => {
                  lastEditedField.current = "contentEn";
                  setContentEnHtml(value);
                }}
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
            {loading ? "Saving..." : "Save Blog"}
          </button>
        </div>
      </form>
    </div>
  );
}
