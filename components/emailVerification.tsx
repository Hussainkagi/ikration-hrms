"use client";

import { useState, useEffect } from "react";
import { Mail, Loader2 } from "lucide-react";

interface EmailVerificationProps {
  email: string;
  onVerify: (otp: string) => void;
  isLoading?: boolean;
  baseUrl?: string;
}

export function EmailVerification({
  email,
  onVerify,
  isLoading = false,
  baseUrl = "",
}: EmailVerificationProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [resendCount, setResendCount] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);

  const MAX_RESEND_ATTEMPTS = 3;
  const RESEND_COOLDOWN = 30;

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) return;

    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");
    setResendSuccess("");

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);

    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);
    setError("");
    setResendSuccess("");

    // Focus the last filled input or the next empty one
    const nextEmptyIndex = newOtp.findIndex((val) => !val);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    document.getElementById(`otp-${focusIndex}`)?.focus();
  };

  const handleVerify = () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter a complete 6-digit code");
      return;
    }
    onVerify(otpString);
  };

  const handleResend = async () => {
    // if (resendCount >= MAX_RESEND_ATTEMPTS) {
    //   setError(`Maximum resend attempts (${MAX_RESEND_ATTEMPTS}) reached`);
    //   return;
    // }

    if (countdown > 0) {
      setError(`Please wait ${countdown} seconds before resending`);
      return;
    }

    setIsResending(true);
    setError("");
    setResendSuccess("");

    try {
      const response = await fetch(`${baseUrl}/organization/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResendCount((prev) => prev + 1);
        setCountdown(RESEND_COOLDOWN);
        setResendSuccess(data.message || "OTP sent successfully!");
        setOtp(["", "", "", "", "", ""]);
        document.getElementById("otp-0")?.focus();
      } else {
        setError(data.message || "Failed to resend OTP. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsResending(false);
    }
  };

  const isResendDisabled =
    isLoading ||
    isResending ||
    resendCount >= MAX_RESEND_ATTEMPTS ||
    countdown > 0;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Verify Your Email
        </h2>
        <p className="text-gray-600">We've sent a 6-digit code to</p>
        <p className="font-semibold text-gray-900 mt-1">{email}</p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col items-center">
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Enter verification code
          </label>
          <div className="flex gap-2 justify-center" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                disabled={isLoading}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}

        {resendSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-600 text-center">
              {resendSuccess}
            </p>
          </div>
        )}

        <button
          onClick={handleVerify}
          disabled={isLoading || otp.join("").length !== 6}
          className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isLoading ? "Verifying..." : "Verify Email"}
        </button>

        <div className="text-center pt-4">
          <span className="text-sm text-gray-600">
            Didn't receive the code?{" "}
          </span>
          <button
            onClick={handleResend}
            // disabled={isResendDisabled}
            className="text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending
              ? "Sending..."
              : countdown > 0
              ? `Resend (${countdown}s)`
              : "Resend"}
          </button>
        </div>
      </div>
    </div>
  );
}
