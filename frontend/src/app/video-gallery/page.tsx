import { API_BASE_URL } from "@/src/constants/api";
import VideoGalleryClient from "@/src/components/videos/VideoGalleryClient";
import type { Video } from "@/src/types/video";
import { generateSiteMetadata } from "@/src/lib/pageMetadata";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return generateSiteMetadata({
    path: "/video-gallery",
    fallbackTitle: "Video Gallery",
  });
}

async function getVideos() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/videos`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as { videos: Video[] };
    return data.videos;
  } catch {
    return [];
  }
}

export default async function VideoGalleryPage() {
  const videos = await getVideos();

  return (
    <section
      className="relative min-h-screen overflow-hidden py-24"
      style={{ background: "var(--bg-gray)" }}
    >
      {/* Background blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-40 h-[560px] w-[560px] rounded-full opacity-[0.06] blur-3xl"
        style={{ background: "var(--primary)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-32 h-[420px] w-[420px] rounded-full opacity-[0.05] blur-3xl"
        style={{ background: "var(--secondary)" }}
      />

      <div className="container-custom relative z-10">
        {/* Page header */}
        <div className="animate-fade-up mb-14">
          <span
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-widest"
            style={{
              background: "rgba(11,143,34,0.08)",
              color: "var(--primary-dark)",
              border: "1px solid rgba(11,143,34,0.18)",
            }}
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: "var(--primary)" }}
            />
            Video Gallery
          </span>

          <h1
            className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl"
            style={{ color: "var(--text-dark)" }}
          >
            Rebar Coupler Bangladesh{" "}
            <span style={{ color: "var(--primary-dark)" }}>Videos</span>
          </h1>

          <div
            className="mt-5 h-1 w-16 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, var(--primary-dark), var(--primary-light))",
            }}
          />

          <p className="mt-4 max-w-xl text-lg leading-8" style={{ color: "var(--muted)" }}>
            Watch our product demonstrations, installation guides, and project
            showcases.
          </p>
        </div>

        <VideoGalleryClient videos={videos} />
      </div>
    </section>
  );
}
