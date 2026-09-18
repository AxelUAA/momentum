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
          backgroundColor: "#0A0A0A",
          borderRadius: "12%",
        }}
      >
        <svg viewBox="0 0 120 120" width="340" height="340">
          <path
            d="M 18 98 L 18 26 L 60 74 L 102 26 L 102 98"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
