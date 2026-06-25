"use client";

import { useState } from "react";
import { Play, X } from "lucide-react";
import type { Video } from "@/src/types/video";

type VideoGalleryClientProps = {
  videos: Video[];
};

export default function VideoGalleryClient({ videos }: VideoGalleryClientProps) {
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  return (
    <>
      {videos.length === 0 ? (
        <div className="border border-dashed border-gray-300 p-10 text-center text-gray-600">
          No videos have been added yet.
        </div>
      ) : (
        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <button
              key={video.id}
              type="button"
              onClick={() => setActiveVideo(video)}
              className="group overflow-hidden border border-gray-200 bg-white text-left transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-video bg-gray-100">
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-500">
                    Video
                  </div>
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-white transition group-hover:bg-black/35">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)]">
                    <Play size={26} fill="currentColor" />
                  </span>
                </span>
              </div>

              <div className="p-5">
                <h2 className="text-xl font-bold text-gray-900 group-hover:text-[var(--primary)]">
                  {video.title}
                </h2>
              </div>
            </button>
          ))}
        </div>
      )}

      {activeVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-5xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h3 className="text-lg font-bold text-gray-900">
                {activeVideo.title}
              </h3>
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="rounded bg-gray-100 p-2 text-gray-700 hover:bg-gray-200"
                aria-label="Close video"
              >
                <X size={20} />
              </button>
            </div>

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
