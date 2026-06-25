"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {API_BASE_URL} from "../../constants/api"
export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleRegister =
    async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/api/auth/register`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              email,
              password,
            }),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          alert(data.message);
          return;
        }

        alert(
          "Registration Successful"
        );

        router.push("/login");
      } catch (error) {
        console.error(error);
        alert("Server Error");
      } finally {
        setLoading(false);
      }
    };

  return (
    <div
      className="
        min-h-screen
        flex
        items-center
        justify-center
      "
    >
      <div
        className="
          bg-white
          p-10
          rounded-xl
          shadow-xl
          w-full
          max-w-md
        "
      >
        <h1
          className="
            text-2xl
            font-bold
            mb-6
          "
        >
          Register
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="
            w-full
            border
            p-3
            rounded
            mb-4
          "
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="
            w-full
            border
            p-3
            rounded
            mb-6
          "
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
        />

        <button
          onClick={handleRegister}
          disabled={loading}
          className="
            w-full
            py-3
            rounded
            text-white
          "
          style={{
            background:
              "var(--primary)",
          }}
        >
          {loading
            ? "Creating..."
            : "Register"}
        </button>

        <p
  className="
    text-center
    mt-5
    text-sm
    text-gray-600
  "
>
  Already have an account?{" "}
  <span
    onClick={() =>
      router.push("/login")
    }
    className="
      cursor-pointer
      font-semibold
      hover:underline
    "
    style={{
      color: "var(--primary)",
    }}
  >
    Login
  </span>
</p>
      </div>
    </div>
  );
}