"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { API_BASE_URL } from "@/src/constants/api";

export default function ContactForm() {
  const searchParams = useSearchParams();
  const productName = searchParams.get("product");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState(
    productName ? `I want to know more about ${productName}.` : ""
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setMessageType("");

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/contact/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          phone,
          email,
          description,
        }),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        const errorMessage = data.message || "Could not send message.";
        setMessage(errorMessage);
        setMessageType("error");
        await Swal.fire({
          icon: "error",
          title: "Message not sent",
          text: errorMessage,
          confirmButtonColor: "#29849f",
        });
        return;
      }

      setFullName("");
      setPhone("");
      setEmail("");
      setDescription("");
      setMessage("Message sent successfully.");
      setMessageType("success");
      await Swal.fire({
        icon: "success",
        title: "Message sent",
        text: "Thank you. Our team will contact you soon.",
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
    <form
      id="contact-form"
      onSubmit={handleSubmit}
      className="space-y-5 rounded-lg border border-gray-200 bg-white p-7 shadow-sm"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Send Message</h2>
        <p className="mt-2 text-gray-600">
          Fill out the form and our team will contact you.
        </p>
      </div>

      {message && (
        <div
          className={`border p-3 text-sm font-semibold ${
            messageType === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <div>
        <label className="mb-2 block font-semibold text-gray-800">
          Full Name
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          required
          className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)]"
        />
      </div>

      <div>
        <label className="mb-2 block font-semibold text-gray-800">
          Phone Number
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          required
          className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)]"
        />
      </div>

      <div>
        <label className="mb-2 block font-semibold text-gray-800">
          Email <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)]"
        />
      </div>

      <div>
        <label className="mb-2 block font-semibold text-gray-800">
          Description
        </label>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
          rows={5}
          className="w-full rounded border border-gray-300 p-3 outline-none focus:border-[var(--primary)]"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-[var(--primary)] px-6 py-3 font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Sending..." : "Submit"}
      </button>
    </form>
  );
}
