"use client";

import { useEffect, useState } from "react";
import QRCodeLib from "qrcode";

interface QRCodeProps {
  url: string;
  size?: number;
}

export default function QRCode({ url, size = 128 }: QRCodeProps) {
  const [svgString, setSvgString] = useState<string>("");

  useEffect(() => {
    QRCodeLib.toString(url, {
      type: "svg",
      width: size,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    }).then(setSvgString);
  }, [url, size]);

  return (
    <div className="flex flex-col items-center w-full">
      {svgString ? (
        <div
          className="border-2 sm:border-4 border-white shadow-lg rounded w-full h-auto"
          dangerouslySetInnerHTML={{ __html: svgString }}
          style={{ width: size, height: size }}
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full text-gray-400">
          Loading...
        </div>
      )}
    </div>
  );
}
