"use client";

import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface EmailVerificationProps {
  email: string;
  onVerify: (otp: string) => void;
  onResend: () => void;
  isLoading?: boolean;
}

export function EmailVerification({
  email,
  onVerify,
  onResend,
  isLoading = false,
}: EmailVerificationProps) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleComplete = (value: string) => {
    setOtp(value);
    setError("");
  };

  const handleVerify = () => {
    if (otp.length !== 6) {
      setError("Please enter a complete 6-digit code");
      return;
    }
    onVerify(otp);
  };

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
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={handleComplete}
            disabled={isLoading}
          >
            <InputOTPGroup className="gap-2">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <InputOTPSlot key={index} index={index} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}

        <button
          onClick={handleVerify}
          disabled={isLoading || otp.length !== 6}
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
            onClick={onResend}
            disabled={isLoading}
            className="text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors disabled:opacity-50"
          >
            Resend
          </button>
        </div>
      </div>
    </div>
  );
}
