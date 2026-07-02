"use client";

import { useEffect, useState,useRef } from "react";
import { API_BASE_URL } from "@/src/constants/api";
import ReCAPTCHA from "react-google-recaptcha";

type Props = {
  productId: number;
  productName: string;
};

export default function ProductQueryModal({
  productId,
  productName,
}: Props) {
  const [open, setOpen] = useState(false);
const [captchaToken, setCaptchaToken] =
  useState("");
  const captchaRef = useRef<ReCAPTCHA>(null);
  const [step, setStep] = useState<
    "form" | "otp" | "success"
  >("form");

  const [loading, setLoading] = useState(false);

  const [queryId, setQueryId] =
    useState<number | null>(null);

  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [seconds, setSeconds] =
    useState(180);

  useEffect(() => {
    if (step !== "otp") return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  const formatTime = () => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins
      .toString()
      .padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  async function sendOtp() {
    const emailRegex =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

if (!emailRegex.test(email.trim())) {
  alert("Please enter a valid email address.");
  return;
}
    try {
      if (!captchaToken) {
  alert("Please complete the reCAPTCHA.");
  return;
}
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/user-query/send-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId,
            fullName,
            email,
            phone,
            captchaToken
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed");
        return;
      }

      setQueryId(data.queryId);

      setSeconds(180);

      setStep("otp");
      captchaRef.current?.reset();
setCaptchaToken("");
    } catch (error) {
      console.error(error);

      alert("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/user-query/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            queryId,
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Invalid OTP");
        return;
      }

      setStep("success");
    } catch (error) {
      console.error(error);

      alert("Verification failed");
    } finally {
      setLoading(false);
    }
  }

  function changeNumber() {
    setOtp("");
    setSeconds(180);
    setStep("form");
  }

  function closeModal() {
    setOpen(false);

    setTimeout(() => {
      setStep("form");
      setOtp("");
      setSeconds(180);
    }, 200);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-red-600 underline"
      >
        Click Here
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Product Query
              </h2>

              <button
                onClick={closeModal}
                className="text-xl"
              >
                ×
              </button>
            </div>

            <p className="mb-4 text-sm text-gray-500">
              {productName}
            </p>

            {step === "form" && (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) =>
                    setFullName(e.target.value)
                  }
                  className="w-full rounded border p-3"
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className="w-full rounded border p-3"
                />

                <input
  type="tel"
  placeholder="018XXXXXXXX"
  value={phone}
  maxLength={11}
  inputMode="numeric"
  onChange={(e) =>
    setPhone(e.target.value.replace(/\D/g, ""))
  }
  className="w-full rounded border p-3"
/>

<ReCAPTCHA
  ref={captchaRef}
  sitekey={
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!
  }
  onChange={(token) =>
    setCaptchaToken(token || "")
  }
/>

                <button
                  disabled={loading}
                  onClick={sendOtp}
                  className="w-full rounded bg-red-600 py-3 font-bold text-white"
                >
                  {loading
                    ? "Sending..."
                    : "Submit"}
                </button>
              </div>
            )}

            {step === "otp" && (
              <div className="space-y-4">
                <p className="text-center font-medium">
                  We have sent you an OTP
                </p>

                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value)
                  }
                  className="w-full rounded border p-3 text-center"
                />

                <div className="text-center font-bold text-red-600">
                  {formatTime()}
                </div>

                <button
                  disabled={loading}
                  onClick={verifyOtp}
                  className="w-full rounded bg-green-600 py-3 font-bold text-white"
                >
                  {loading
                    ? "Verifying..."
                    : "Verify"}
                </button>

                <button
                  onClick={changeNumber}
                  className="w-full rounded border py-3"
                >
                  Change Number
                </button>
              </div>
            )}

            {step === "success" && (
              <div className="space-y-4 text-center">
                <div className="text-5xl">
                  ✅
                </div>

                <h3 className="text-xl font-bold">
                  Success
                </h3>

                <p>
                  Your query has been submitted
                  successfully.
                </p>

                <button
                  onClick={closeModal}
                  className="w-full rounded bg-green-600 py-3 font-bold text-white"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}