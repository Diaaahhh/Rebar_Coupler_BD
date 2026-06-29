"use client";

import { useState } from "react";
import { Play, X, Film } from "lucide-react";
import type { Video } from "@/src/types/video";

type VideoGalleryClientProps = {
  videos: Video[];
};

export default function VideoGalleryClient({ videos }: VideoGalleryClientProps) {
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  if (videos.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-3xl py-24 text-center"
        style={{
          background: "var(--bg-light)",
          border: "2px dashed rgba(11,143,34,0.2)",
        }}
      >
        <Film size={48} style={{ color: "var(--primary)", opacity: 0.4 }} />
        <p className="mt-4 text-lg font-semibold" style={{ color: "var(--muted)" }}>
          No videos have been added yet.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((video, index) => (
          <button
            key={video.id}
            type="button"
            onClick={() => setActiveVideo(video)}
            className={`group relative overflow-hidden rounded-2xl bg-white text-left shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl animate-fade-up delay-${(index % 6) + 1}`}
            style={{ border: "1px solid rgba(0,0,0,0.07)" }}
          >
            {/* Hover top-accent bar */}
            <div
              className="absolute left-0 top-0 z-10 h-[3px] w-0 rounded-t-2xl transition-all duration-500 group-hover:w-full"
              style={{
                background:
                  "linear-gradient(90deg, var(--primary-dark), var(--primary-light))",
              }}
            />

            {/* Thumbnail */}
            <div className="relative aspect-video overflow-hidden bg-gray-100">
              {video.thumbnail_url ? (
                <img
                  src={video.thumbnail_url}
                  alt={video.title}
                  className="h-full w-full object-cover transition-transform duration-600 group-hover:scale-105"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(11,143,34,0.07), rgba(11,143,34,0.14))",
                  }}
                >
                  <Film size={36} style={{ color: "var(--primary)", opacity: 0.5 }} />
                </div>
              )}

              {/* Dark overlay */}
              <span className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/40" />

              {/* Play button */}
              <span className="absolute inset-0 flex items-center justify-center">
                <span
                  className="flex h-16 w-16 items-center justify-center rounded-full shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--primary-dark), var(--primary))",
                    border: "3px solid rgba(255,255,255,0.3)",
                  }}
                >
                  <Play size={26} fill="white" color="white" className="ml-1" />
                </span>
              </span>
            </div>

            {/* Card footer */}
            <div className="p-5">
              <h2
                className="text-[17px] font-bold leading-snug transition-colors duration-200"
                style={{ color: "var(--text-dark)" }}
              >
                {video.title}
              </h2>
              <div
                className="mt-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-colors duration-200"
                style={{ color: "var(--primary)" }}
              >
                <Play size={10} fill="currentColor" />
                Watch Video
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ background: "rgba(0,0,0,0.82)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveVideo(null);
          }}
        >
          <div
            className="relative w-full max-w-5xl overflow-hidden rounded-3xl shadow-[0_40px_100px_rgba(0,0,0,0.6)]"
            style={{ background: "#0d1117" }}
          >
            {/* Modal header */}
            <div
              className="flex items-center justify-between gap-4 px-6 py-4"
              style={{
                background:
                  "linear-gradient(90deg, var(--primary-dark), var(--primary))",
              }}
            >
              <div className="flex items-center gap-3">
                <Play size={18} fill="white" color="white" />
                <h3 className="text-base font-bold text-white line-clamp-1">
                  {activeVideo.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                aria-label="Close video"
                className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-all duration-200 hover:scale-110 hover:bg-white/20"
              >
                <X size={20} />
              </button>
            </div>

            {/* Video frame */}
            <div className="aspect-video bg-black">
              <iframe
                src={`${activeVideo.embed_url}${
                  activeVideo.embed_url.includes("?") ? "&" : "?"
                }autoplay=1`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
