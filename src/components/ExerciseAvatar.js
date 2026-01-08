import React from "react";

function hashStringToHue(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) % 360;
}

export default function ExerciseAvatar({ name = "?", size = 40 }) {
  const letter = name && name.length ? name.charAt(0).toUpperCase() : "?";
  const hue = hashStringToHue(name || letter);
  const bg = `hsl(${hue}deg 60% 45%)`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={name}
      className="rounded-full"
    >
      <circle cx={size / 2} cy={size / 2} r={size / 2} fill={bg} />
      <text x="50%" y="50%" dy=".35em" textAnchor="middle" fontWeight="700" fontSize={Math.floor(size / 2)} fill="#fff">
        {letter}
      </text>
    </svg>
  );
}
