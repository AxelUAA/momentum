import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0F1B2D", // Midnight Navy
          borderRadius: "12%",
        }}
      >
        <svg viewBox="0 0 140 110" width="320" height="250">
          <path d="M 12 82 C 40 5, 100 15, 130 100" fill="none" stroke="#D4AF7A" strokeWidth="11" strokeLinecap="butt" />
          <path d="M 32 82 C 55 35, 90 40, 110 100" fill="none" stroke="#D4AF7A" strokeWidth="11" strokeLinecap="butt" />
          <path d="M 52 82 C 65 58, 80 62, 90 100" fill="none" stroke="#D4AF7A" strokeWidth="11" strokeLinecap="butt" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
