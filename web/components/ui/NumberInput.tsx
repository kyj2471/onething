import { forwardRef } from "react";
import { Input, type InputProps } from "./Input";

const BLOCKED_KEYS = new Set(["e", "E", "+", "-"]);

export const NumberInput = forwardRef<HTMLInputElement, InputProps>(
  ({ onKeyDown, onWheel, inputMode, ...props }, ref) => (
    <Input
      ref={ref}
      type="number"
      inputMode={inputMode ?? "decimal"}
      onKeyDown={(e) => {
        if (BLOCKED_KEYS.has(e.key)) e.preventDefault();
        onKeyDown?.(e);
      }}
      onWheel={(e) => {
        (e.target as HTMLInputElement).blur();
        onWheel?.(e);
      }}
      {...props}
    />
  ),
);
NumberInput.displayName = "NumberInput";
