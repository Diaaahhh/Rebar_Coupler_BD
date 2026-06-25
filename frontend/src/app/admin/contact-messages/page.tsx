"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { API_BASE_URL } from "@/src/constants/api";
import type { ContactMessage } from "@/src/types/contact";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const loadMessages = async () => {
    const response = await fetch(`${API_BASE_URL}/api/contact/messages`, {
      credentials: "include",
      cache: "no-store",
    });
    const data = (await response.json()) as {
      messages?: ContactMessage[];
      message?: string;
    };

    if (!response.ok) {
      throw new Error(data.message || "Could not load contact messages.");
    }

    setMessages(data.messages || []);
  };

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);
        await loadMessages();
      } catch {
        if (active) {
          setMessage("Could not load contact messages.");
          setMessageType("error");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  const handleViewMessage = async (contactMessage: ContactMessage) => {
    const email = escapeHtml(contactMessage.email || "Not provided");
    const date = escapeHtml(new Date(contactMessage.created_at).toLocaleString());
    const name = escapeHtml(contactMessage.full_name);
    const phone = escapeHtml(contactMessage.phone);
    const description = escapeHtml(contactMessage.description);

    await Swal.fire({
      title: "Contact Message",
      html: `
        <div style="text-align:left; line-height:1.7">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Date:</strong> ${date}</p>
          <hr style="margin:14px 0" />
          <p style="margin-bottom:6px"><strong>Message:</strong></p>
          <div style="white-space:pre-wrap">${description}</div>
        </div>
      `,
      confirmButtonText: "Close",
      confirmButtonColor: "#29849f",
      width: 640,
    });
  };

  const handleDeleteMessage = async (id: number) => {
    const confirmed = await Swal.fire({
      icon: "warning",
      title: "Delete message?",
      text: "This contact message will be removed permanently.",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
    });

    if (!confirmed.isConfirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/contact/messages/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Could not delete this message.");
      }

      await loadMessages();
      setMessage("Message deleted.");
      setMessageType("success");
      await Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Contact message removed successfully.",
        confirmButtonColor: "#29849f",
      });
    } catch {
      setMessage("Could not delete message.");
      setMessageType("error");
      await Swal.fire({
        icon: "error",
        title: "Not deleted",
        text: "Could not delete this message.",
        confirmButtonColor: "#29849f",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
        <p className="mt-2 text-gray-600">
          View messages submitted from the frontend contact form.
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

      <div className="overflow-hidden border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-5">
          <h2 className="text-xl font-bold text-gray-900">Messages</h2>
        </div>

        {loading ? (
          <p className="p-5 text-gray-600">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="p-5 text-gray-600">No messages yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Date & Time</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {messages.map((contactMessage) => (
                  <tr key={contactMessage.id} className="align-top">
                    <td className="px-5 py-4 font-semibold text-gray-900">
                      {contactMessage.full_name}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {contactMessage.phone}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {contactMessage.email || "-"}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {new Date(contactMessage.created_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewMessage(contactMessage)}
                          className="rounded bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(contactMessage.id)}
                          className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
