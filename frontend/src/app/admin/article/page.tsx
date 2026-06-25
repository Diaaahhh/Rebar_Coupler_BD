"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import RichTextEditor from "@/src/components/admin/RichTextEditor";
import { API_BASE_URL } from "@/src/constants/api";
import type { Article } from "@/src/types/article";

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
          setMessage("Could not load article content.");
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
    if (lastEditedField.current !== "titleBn" || !titleBn.trim()) {
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        setTranslationStatus("Translating Bangla title to English...");
        const translatedText = await translateArticleText(titleBn, "en", "text");
        setTitleEn(translatedText);
        setTranslationStatus("English title updated automatically.");
      } catch {
        setTranslationStatus("Auto translation failed. Please check the English title manually.");
      }
    }, 800);

    return () => window.clearTimeout(timeout);
  }, [titleBn]);

  useEffect(() => {
    if (lastEditedField.current !== "titleEn" || !titleEn.trim()) {
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        setTranslationStatus("Translating English title to Bangla...");
        const translatedText = await translateArticleText(titleEn, "bn", "text");
        setTitleBn(translatedText);
        setTranslationStatus("Bangla title updated automatically.");
      } catch {
        setTranslationStatus("Auto translation failed. Please check the Bangla title manually.");
      }
    }, 800);

    return () => window.clearTimeout(timeout);
  }, [titleEn]);

  useEffect(() => {
    if (lastEditedField.current !== "contentBn" || !contentBnHtml.trim()) {
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        setTranslationStatus("Translating Bangla article to English...");
        const translatedHtml = await translateArticleText(
          contentBnHtml,
          "en",
          "html"
        );
        setContentEnHtml(translatedHtml);
        setTranslationStatus("English article updated automatically.");
      } catch {
        setTranslationStatus("Auto translation failed. Please check the English article manually.");
      }
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [contentBnHtml]);

  useEffect(() => {
    if (lastEditedField.current !== "contentEn" || !contentEnHtml.trim()) {
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        setTranslationStatus("Translating English article to Bangla...");
        const translatedHtml = await translateArticleText(
          contentEnHtml,
          "bn",
          "html"
        );
        setContentBnHtml(translatedHtml);
        setTranslationStatus("Bangla article updated automatically.");
      } catch {
        setTranslationStatus("Auto translation failed. Please check the Bangla article manually.");
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
        const errorMessage = data.message || "Could not update article.";
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
      setMessage("Article updated successfully.");
      setMessageType("success");
      await Swal.fire({
        icon: "success",
        title: "Saved",
        text: "Article content updated successfully.",
        confirmButtonColor: "#29849f",
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Article</h1>
        <p className="mt-2 text-gray-600">
          Manage the article image, Bangla content, and English content.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Type in either Bangla or English first. The other language will be
          filled automatically.
        </p>
      </div>

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

      {translationStatus && (
        <div className="border border-blue-100 bg-blue-50 p-4 text-sm font-semibold text-blue-700">
          {translationStatus}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 border border-gray-200 bg-white p-6"
      >
        <div>
          <label className="mb-2 block font-semibold text-gray-800">
            Article Image
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

          {(previewUrl || article?.image_url) && (
            <div className="mt-4 aspect-[3/2] max-w-xl overflow-hidden rounded-md border border-gray-200 bg-gray-50">
              <img
                src={previewUrl || article?.image_url || ""}
                alt="Article preview"
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Bangla Title
            </label>
            <input
              type="text"
              value={titleBn}
              onChange={(event) => {
                lastEditedField.current = "titleBn";
                setTitleBn(event.target.value);
              }}
              required
              className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              English Title
            </label>
            <input
              type="text"
              value={titleEn}
              onChange={(event) => {
                lastEditedField.current = "titleEn";
                setTitleEn(event.target.value);
              }}
              required
              className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)]"
            />
          </div>
        </div>

        <RichTextEditor
          key={`article-bn-${editorKey}`}
          label="Bangla Article Details"
          value={contentBnHtml}
          onChange={(value) => {
            lastEditedField.current = "contentBn";
            setContentBnHtml(value);
          }}
        />

        <RichTextEditor
          key={`article-en-${editorKey}`}
          label="English Article Details"
          value={contentEnHtml}
          onChange={(value) => {
            lastEditedField.current = "contentEn";
            setContentEnHtml(value);
          }}
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-[var(--primary)] px-6 py-3 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Article"}
        </button>
      </form>
    </div>
  );
}
