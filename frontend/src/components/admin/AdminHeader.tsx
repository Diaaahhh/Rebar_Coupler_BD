"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../../constants/api"
export default function AdminHeader() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch(`${ API_BASE_URL }/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="flex h-20 items-center justify-between px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[3px] text-[var(--primary)]">
            Admin Panel
          </p>
          <p className="mt-1 text-sm text-gray-500">Manage website content</p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </header>
  );
}
