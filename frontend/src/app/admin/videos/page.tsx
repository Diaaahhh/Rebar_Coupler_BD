"use client";

import { FormEvent, useEffect, useState } from "react";
import { API_BASE_URL } from "@/src/constants/api";
import type { Video } from "@/src/types/video";

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadVideos = async () => {
    const response = await fetch(`${API_BASE_URL}/api/videos`, {
      cache: "no-store",
    });
    const data = (await response.json()) as { videos: Video[] };
    setVideos(data.videos);
  };

  useEffect(() => {
    let active = true;

    const fetchVideos = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/videos`, {
          cache: "no-store",
        });
        const data = (await response.json()) as { videos: Video[] };

        if (active) {
          setVideos(data.videos);
        }
      } catch {
        if (active) {
          setMessage("Could not load videos.");
        }
      }
    };

    void fetchVideos();

    return () => {
      active = false;
    };
  }, []);

  const resetForm = () => {
    setTitle("");
    setVideoUrl("");
    setEditingVideo(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    try {
      setLoading(true);

      const response = await fetch(
        editingVideo
          ? `${API_BASE_URL}/api/videos/${editingVideo.id}`
          : `${API_BASE_URL}/api/videos`,
        {
          method: editingVideo ? "PUT" : "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title, videoUrl }),
        }
      );

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setMessage(data.message || "Could not save video.");
        return;
      }

      setMessage(editingVideo ? "Video updated." : "Video added.");
      resetForm();
      await loadVideos();
    } catch {
      setMessage("Server Error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setTitle(video.title);
    setVideoUrl(video.video_url);
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Delete this video?");

    if (!confirmed) {
      return;
    }

    const response = await fetch(`${API_BASE_URL}/api/videos/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (response.ok) {
      setVideos((currentVideos) =>
        currentVideos.filter((video) => video.id !== id)
      );
      setMessage("Video deleted.");
    } else {
      setMessage("Could not delete video.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Video Gallery</h1>
        <p className="mt-2 text-gray-600">
          Upload video links only. YouTube links will show thumbnails and play in
          a popup on the frontend.
        </p>
      </div>

      {message && (
        <div className="border border-gray-200 bg-white p-4 text-sm font-medium text-gray-700">
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 border border-gray-200 bg-white p-6"
      >
        <div>
          <label className="mb-2 block font-semibold text-gray-800">
            Video Title
          </label>
          <input
            type="text"
            value={title}
             maxLength={60}
            onChange={(event) => setTitle(event.target.value)}
            required
            className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)]"
          />
          <p className="mt-1 text-right text-sm text-gray-500">
  {title.length}/60
</p>
        </div>

        <div>
          <label className="mb-2 block font-semibold text-gray-800">
            Video Link
          </label>
          <input
            type="text"
            value={videoUrl}
            onChange={(event) => setVideoUrl(event.target.value)}
            required
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)]"
          />
          <p className="mt-2 text-sm text-gray-500">
            Recommended: YouTube video link. Direct embeddable video links also
            work.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-[var(--primary)] px-6 py-3 font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Saving..." : editingVideo ? "Update Video" : "Add Video"}
          </button>

          {editingVideo && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded border border-gray-300 px-6 py-3 font-semibold text-gray-700"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <div className="border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-5">
          <h2 className="text-xl font-bold text-gray-900">Saved Videos</h2>
        </div>

        {videos.length === 0 ? (
          <p className="p-5 text-gray-600">No videos yet.</p>
        ) : (
          <div className="divide-y divide-gray-200">
            {videos.map((video) => (
              <div
                key={video.id}
                className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <h3 className="font-bold text-gray-900">{video.title}</h3>
                  <p className="mt-1 break-all text-sm text-gray-500">
                    {video.video_url}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(video)}
                    className="rounded bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(video.id)}
                    className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
