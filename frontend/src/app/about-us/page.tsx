import { API_BASE_URL } from "@/src/constants/api";
import type { AboutUs } from "@/src/types/about";
import { generateSiteMetadata } from "@/src/lib/pageMetadata";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return generateSiteMetadata({
    path: "/about-us",
    fallbackTitle: "About Us",
  });
}

async function getAbout() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/about-us`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { about: AboutUs };
    return data.about;
  } catch {
    return null;
  }
}

export default async function AboutUsPage() {
  const about = await getAbout();

  return (
    <section className="py-16">
      <div className="container-custom">
        <div className="mb-10">
          <p className="font-semibold uppercase tracking-[3px] text-[var(--primary)]">
            About Us
          </p>
        </div>

        <div className="about-content-flow">
          <div className="about-image-float mb-6 overflow-hidden rounded-md bg-gray-100">
            <img
              src={about?.image_url || "/about.png"}
              alt="About Us"
              className="h-full w-full object-cover"
            />
          </div>

          <div
            className="product-content text-[17px] leading-8 text-gray-600"
            dangerouslySetInnerHTML={{
              __html:
                about?.description_html ||
                "<p>Write your company description from the admin panel.</p>",
            }}
          />
        </div>
      </div>
    </section>
  );
}
