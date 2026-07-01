"use client";

import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { API_BASE_URL } from "@/src/constants/api";

export default function FloatingWhatsapp() {
  const [whatsappNumber, setWhatsappNumber] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/contact/settings`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) return;

        const data = await response.json();
        setWhatsappNumber(data.settings?.whatsapp_number || "");
      } catch (err) {
        console.error(err);
      }
    };

    loadSettings();
  }, []);

  if (!whatsappNumber) return null;

  // Remove spaces, dashes, brackets, etc.
  const number = whatsappNumber.replace(/\D/g, "");

  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl transition hover:scale-110"
    >
      <FaWhatsapp size={34} />
    </a>
  );
}