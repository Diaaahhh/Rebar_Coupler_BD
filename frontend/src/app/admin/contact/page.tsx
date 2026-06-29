"use client";

import { FormEvent, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { API_BASE_URL } from "@/src/constants/api";
import type { ContactSettings } from "@/src/types/contact";
import { Save, Building2, Mail, Phone, MessageCircle, Map, Play, Share2 } from "lucide-react";

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
      setTimeout(() => setMessage(""), 3000);
      
      await Swal.fire({
        icon: "success",
        title: "Saved",
        text: "Contact settings updated successfully.",
        confirmButtonColor: "#0b8f22",
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
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Contact Settings</h1>
        <p className="mt-2 text-gray-500">
          Manage office details, social links, and Google Map embed.
        </p>
      </div>

      {message && (
        <div
          className={`flex animate-fade-up items-center gap-3 rounded-xl border px-5 py-4 text-sm font-semibold shadow-sm ${
            messageType === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* Main Form Card */}
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl bg-white shadow-sm"
        style={{ border: "1px solid rgba(0,0,0,0.06)" }}
      >
        <div
          className="h-1 w-full"
          style={{
            background:
              "linear-gradient(90deg, var(--primary-dark), var(--primary-light))",
          }}
        />

        <div className="p-8 space-y-10">
          {/* Section: General Info */}
          <div>
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-800">
              <Building2 size={22} className="text-[var(--primary)]" />
              General Information
            </h2>
            
            <div className="space-y-6 rounded-xl border border-gray-100 bg-gray-50/50 p-6">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Office Address
                </label>
                <textarea
                  value={officeAddress}
                  onChange={(event) => setOfficeAddress(event.target.value)}
                  required
                  rows={3}
                  placeholder="e.g. 16-B, Rupayan Karim Tower, 80 VIP Rd, Dhaka 1000"
                  className="w-full resize-none rounded-xl border border-gray-300 bg-white p-4 outline-none transition-all focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 flex items-center gap-1.5 text-sm font-bold text-gray-700">
                    <Mail size={15} className="text-gray-400" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    placeholder="info@rebarcouplerbd.com"
                    className="w-full rounded-xl border border-gray-300 bg-white p-3.5 outline-none transition-all focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-1.5 text-sm font-bold text-gray-700">
                    <Phone size={15} className="text-gray-400" />
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    required
                    placeholder="09638-441144"
                    className="w-full rounded-xl border border-gray-300 bg-white p-3.5 outline-none transition-all focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Social & Online */}
          <div>
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-800">
              <Share2 size={22} className="text-[var(--primary)]" />
              Social & Online Presence
            </h2>
            
            <div className="grid gap-6 rounded-xl border border-gray-100 bg-gray-50/50 p-6 md:grid-cols-3">
              <div>
                <label className="mb-2 flex items-center gap-1.5 text-sm font-bold text-gray-700">
                  <MessageCircle size={15} className="text-[#25D366]" />
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(event) => setWhatsappNumber(event.target.value)}
                  placeholder="01958666900"
                  className="w-full rounded-xl border border-gray-300 bg-white p-3.5 outline-none transition-all focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-1.5 text-sm font-bold text-gray-700">
                  <Share2 size={15} className="text-[#1877F2]" />
                  Facebook Link
                </label>
                <input
                  type="url"
                  value={facebookUrl}
                  onChange={(event) => setFacebookUrl(event.target.value)}
                  placeholder="https://facebook.com/..."
                  className="w-full rounded-xl border border-gray-300 bg-white p-3.5 outline-none transition-all focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-1.5 text-sm font-bold text-gray-700">
                  <Play size={15} className="text-[#FF0000]" />
                  YouTube Link
                </label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(event) => setYoutubeUrl(event.target.value)}
                  placeholder="https://youtube.com/..."
                  className="w-full rounded-xl border border-gray-300 bg-white p-3.5 outline-none transition-all focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                />
              </div>
            </div>
          </div>

          {/* Section: Map Embed */}
          <div>
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-800">
              <Map size={22} className="text-[var(--primary)]" />
              Google Map Embed
            </h2>
            
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-6">
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Map iframe Code
              </label>
              <textarea
                value={mapEmbedCode}
                onChange={(event) => setMapEmbedCode(event.target.value)}
                rows={4}
                placeholder='<iframe src="https://www.google.com/maps/embed?..." loading="lazy"></iframe>'
                className="w-full resize-none rounded-xl border border-gray-300 bg-white p-4 font-mono text-sm text-gray-600 outline-none transition-all focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
              />
              <p className="mt-3 text-sm font-medium text-gray-500">
                Go to Google Maps &gt; Share &gt; Embed a map, and paste the full HTML code here.
              </p>
            </div>
          </div>
        </div>

        {/* Form Footer */}
        <div className="border-t border-gray-100 bg-gray-50 px-8 py-5 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="group flex items-center gap-2 rounded-xl px-8 py-3 font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:hover:translate-y-0"
            style={{
              background:
                "linear-gradient(135deg, var(--primary-dark), var(--primary))",
            }}
          >
            <Save size={18} className="transition-transform group-hover:scale-110" />
            {loading ? "Saving..." : "Save Contact Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
