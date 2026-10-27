import { forwardRef, type ButtonHTMLAttributes } from "react";
import "./Button.css";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Figma Button: "primary" = State=default, "destructive" = State=destructive (ghost, used for Reset). */
  variant?: "primary" | "destructive";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", className, type = "button", ...props },
  ref,
) {
  return <button ref={ref} type={type} className={`button button--${variant} ${className ?? ""}`} {...props} />;
});
