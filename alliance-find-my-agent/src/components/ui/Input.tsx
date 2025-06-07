import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helper,
      leftIcon,
      rightIcon,
      className = "",
      fullWidth = true,
      ...props
    },
    ref,
  ) => {
    // Width styles
    const widthStyle = fullWidth ? "w-full" : "";

    // Container styles
    const containerClasses = `flex flex-col ${widthStyle} ${className}`;

    // Input wrapper styles to handle icons
    const inputWrapperClasses = "relative flex items-center";

    // Base input styles
    const baseInputClasses =
      "block px-4 py-2 bg-white border rounded-md text-alliance-gray-900 placeholder-alliance-gray-400 focus:outline-none focus:ring-2 focus:border-alliance-red-300 focus:ring-alliance-red-500 transition duration-150";

    // Conditional styles based on error state and icons
    const inputStateClasses = error
      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
      : "border-alliance-gray-300";

    const inputPaddingClasses = `
      ${leftIcon ? "pl-10" : ""}
      ${rightIcon ? "pr-10" : ""}
    `;

    // Combine all input classes
    const inputClasses = `${baseInputClasses} ${inputStateClasses} ${inputPaddingClasses} ${widthStyle}`;

    return (
      <div className={containerClasses}>
        {label && (
          <label className="mb-1 text-sm font-medium text-alliance-gray-700">
            {label}
          </label>
        )}

        <div className={inputWrapperClasses}>
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-alliance-gray-400">
              {leftIcon}
            </div>
          )}

          <input ref={ref} className={inputClasses} {...props} />

          {rightIcon && (
            <div className="absolute right-3 flex items-center pointer-events-none text-alliance-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {(error || helper) && (
          <p
            className={`mt-1 text-sm ${error ? "text-red-500" : "text-alliance-gray-500"}`}
          >
            {error || helper}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
