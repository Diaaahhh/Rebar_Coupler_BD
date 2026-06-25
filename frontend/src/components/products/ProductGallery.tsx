"use client";

import { useState } from "react";
import type { ProductImage } from "@/src/types/product";

type ProductGalleryProps = {
  name: string;
  images: ProductImage[];
  fallbackImage: string | null;
};

export default function ProductGallery({
  name,
  images,
  fallbackImage,
}: ProductGalleryProps) {
  const firstImage =
    images[0]?.image_url || fallbackImage || "/Anda-rebar-couplers.webp";
  const [activeImage, setActiveImage] = useState(firstImage);

  return (
    <div>
      <div className="flex aspect-[3/2] w-full items-center justify-center border border-dotted border-gray-400 bg-white">
        <img
          src={activeImage}
          alt={name}
          className="h-full w-full object-contain"
        />
      </div>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {images.slice(1, 5).map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveImage(image.image_url)}
              className={`aspect-[3/2] border bg-white p-1 transition ${
                activeImage === image.image_url
                  ? "border-[var(--primary)]"
                  : "border-gray-300 hover:border-[var(--primary)]"
              }`}
            >
              <img
                src={image.image_url}
                alt={name}
                className="h-full w-full object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
