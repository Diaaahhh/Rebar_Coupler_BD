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
    <section className="py-16">
      <div className="container-custom">
        <div className="mb-10">
          <p className="font-semibold uppercase tracking-[3px] text-[var(--primary)]">
            Video Gallery
          </p>
          <h1 className="mt-3 text-4xl font-bold text-gray-900">
            Rebar Coupler Bangladesh Videos
          </h1>
        </div>

        <VideoGalleryClient videos={videos} />
      </div>
    </section>
  );
}
