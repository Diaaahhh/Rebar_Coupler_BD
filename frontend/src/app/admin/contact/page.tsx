"use client";

import { FormEvent, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { API_BASE_URL } from "@/src/constants/api";
import type { ContactSettings } from "@/src/types/contact";

export default function AdminContactPage() {
  const [officeAddress, setOfficeAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [mapEmbedCode, setMapEmbedCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        const settingsResponse = await fetch(
          `${API_BASE_URL}/api/contact/settings`,
          { cache: "no-store" }
        );
        const settingsData = (await settingsResponse.json()) as {
          settings: ContactSettings;
        };

        if (active) {
          setOfficeAddress(settingsData.settings.office_address || "");
          setEmail(settingsData.settings.email || "");
          setPhone(settingsData.settings.phone || "");
          setWhatsappNumber(settingsData.settings.whatsapp_number || "");
          setFacebookUrl(settingsData.settings.facebook_url || "");
          setYoutubeUrl(settingsData.settings.youtube_url || "");
          setMapEmbedCode(settingsData.settings.map_embed_code || "");
        }
      } catch {
        if (active) {
          setMessage("Could not load contact data.");
          setMessageType("error");
        }
      }
    };

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setMessageType("");

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/contact/settings`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          officeAddress,
          email,
          phone,
          whatsappNumber,
          facebookUrl,
          youtubeUrl,
          mapEmbedCode,
        }),
      });

      const data = (await response.json()) as {
        settings?: ContactSettings;
        message?: string;
      };

      if (!response.ok) {
        const errorMessage = data.message || "Could not update contact settings.";
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

      setMessage("Contact settings updated.");
      setMessageType("success");
      await Swal.fire({
        icon: "success",
        title: "Saved",
        text: "Contact settings updated successfully.",
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
        <h1 className="text-3xl font-bold text-gray-900">Contact</h1>
        <p className="mt-2 text-gray-600">
          Manage office details, social links, map embed, and contact messages.
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

      <form
        onSubmit={handleSubmit}
        className="space-y-5 border border-gray-200 bg-white p-6"
      >
        <h2 className="text-xl font-bold text-gray-900">Contact Settings</h2>

        <div>
          <label className="mb-2 block font-semibold text-gray-800">
            Office Address
          </label>
          <textarea
            value={officeAddress}
            onChange={(event) => setOfficeAddress(event.target.value)}
            required
            rows={4}
            className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Contact Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
              className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)]"
            />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              WhatsApp Number
            </label>
            <input
              type="tel"
              value={whatsappNumber}
              onChange={(event) => setWhatsappNumber(event.target.value)}
              placeholder="01958666900"
              className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Facebook Link
            </label>
            <input
              type="url"
              value={facebookUrl}
              onChange={(event) => setFacebookUrl(event.target.value)}
              className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              YouTube Link
            </label>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(event) => setYoutubeUrl(event.target.value)}
              className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)]"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block font-semibold text-gray-800">
            Google Map Embed Code
          </label>
          <textarea
            value={mapEmbedCode}
            onChange={(event) => setMapEmbedCode(event.target.value)}
            rows={5}
            placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>'
            className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)]"
          />
          <p className="mt-2 text-sm text-gray-500">
            Paste the full Google Maps iframe embed code.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-[var(--primary)] px-6 py-3 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Contact Settings"}
        </button>
      </form>
    </div>
  );
}
