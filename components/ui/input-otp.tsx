"use client";

import * as React from "react";
import { Minus } from "lucide-react";

type OTPInputContextType = {
  slots: {
    char: string;
    hasFakeCaret: boolean;
    isActive: boolean;
  }[];
};

const OTPInputContext = React.createContext<OTPInputContextType | null>(null);

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function InputOTP({
  maxLength = 6,
  value,
  onChange,
  disabled,
  className,
  containerClassName,
  ...props
}: {
  maxLength?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
  children?: React.ReactNode;
}) {
  const slots = [];

  for (let i = 0; i < maxLength; i++) {
    slots.push({
      char: value[i] || "",
      hasFakeCaret: i === value.length,
      isActive: i === value.length,
    });
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && value.length > 0) {
      onChange(value.slice(0, -1));
    } else if (e.key >= "0" && e.key <= "9" && value.length < maxLength) {
      onChange(value + e.key);
    }
  };

  return (
    <OTPInputContext.Provider value={{ slots }}>
      <div
        data-slot="input-otp"
        className={cn(
          "flex items-center gap-2",
          disabled && "opacity-50 cursor-not-allowed",
          containerClassName
        )}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {props.children}
      </div>
    </OTPInputContext.Provider>
  );
}

export function InputOTPGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center", className)}
      {...props}
    />
  );
}

export function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number;
}) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "relative flex h-12 w-12 items-center justify-center border-2 rounded-lg text-lg font-semibold shadow-sm transition-all outline-none",
        isActive
          ? "border-orange-600 ring-4 ring-orange-600/20 z-10"
          : "border-gray-300",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse bg-orange-600 h-6 w-0.5" />
        </div>
      )}
    </div>
  );
}

export function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <Minus className="w-4 h-4" />
    </div>
  );
}
