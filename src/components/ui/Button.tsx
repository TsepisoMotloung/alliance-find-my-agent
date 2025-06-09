import React from "react";
import Link from "next/link";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  href?: string;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  type = "button",
  onClick,
  href,
  fullWidth = false,
}) => {
  // Base styles
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-alliance-red-500 disabled:opacity-50 disabled:pointer-events-none";

  // Size variations
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm rounded-md",
    md: "px-4 py-2 text-base rounded-md",
    lg: "px-6 py-3 text-lg rounded-lg",
  };

  // Variant styles
  const variantStyles = {
    primary:
      "bg-alliance-red-600 text-white hover:bg-alliance-red-700 active:bg-alliance-red-800 border border-transparent",
    secondary:
      "bg-alliance-gray-200 text-alliance-gray-900 hover:bg-alliance-gray-300 active:bg-alliance-gray-400 border border-transparent",
    outline:
      "bg-transparent text-alliance-red-600 border border-alliance-red-600 hover:bg-alliance-red-50 active:bg-alliance-red-100",
    ghost:
      "bg-transparent text-alliance-red-600 border border-transparent hover:bg-alliance-red-50 active:bg-alliance-red-100",
    danger:
      "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 border border-transparent",
  };

  // Width style
  const widthStyle = fullWidth ? "w-full" : "";

  // Combine all styles
  const buttonStyles = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`;

  // Return link if href is provided
  if (href) {
    return (
      <Link href={href} className={buttonStyles}>
        {children}
      </Link>
    );
  }

  // Return button otherwise
  return (
    <button
      type={type}
      className={buttonStyles}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
