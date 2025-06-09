'use client';

import React, { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  size = "md",
  readonly = false,
  className = "",
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  // Size classes for stars
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  // Star size
  const starSize = sizeClasses[size];

  // Container classes
  const containerClasses = `flex items-center ${className}`;

  // Handler for clicking a star
  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  // Handler for hovering over a star
  const handleHover = (rating: number) => {
    if (!readonly) {
      setHoverRating(rating);
    }
  };

  // Handler for mouse leaving the rating component
  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  // Generate stars
  const stars = Array.from({ length: 5 }, (_, i) => {
    const starValue = i + 1;
    const filled = (hoverRating || value) >= starValue;

    return (
      <Star
        key={i}
        filled={filled}
        onClick={() => handleClick(starValue)}
        onHover={() => handleHover(starValue)}
        size={starSize}
        interactive={!readonly}
      />
    );
  });

  return (
    <div className={containerClasses} onMouseLeave={handleMouseLeave}>
      {stars}
    </div>
  );
};

interface StarProps {
  filled: boolean;
  onClick: () => void;
  onHover: () => void;
  size: string;
  interactive: boolean;
}

const Star: React.FC<StarProps> = ({
  filled,
  onClick,
  onHover,
  size,
  interactive,
}) => {
  const cursorClass = interactive ? "cursor-pointer" : "";

  return (
    <svg
      className={`${size} ${cursorClass}`}
      fill={filled ? "#f44336" : "none"}
      stroke={filled ? "#f44336" : "#9e9e9e"}
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      onClick={onClick}
      onMouseEnter={onHover}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
      />
    </svg>
  );
};

export default StarRating;
