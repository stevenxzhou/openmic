"use client";

import { useEffect, useRef } from "react";

interface QRCodeProps {
  url: string;
  size?: number;
}

export default function QRCode({ url, size = 128 }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Generate QR code using a simple library-free approach with QR code API
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Use a QR code generation service with higher resolution for better scaling
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size * 2}x${size * 2}&data=${encodeURIComponent(url)}`;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
    };
    img.src = qrCodeUrl;
  }, [url, size]);

  return (
    <div className="flex flex-col items-center w-full">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="border-2 sm:border-4 border-white shadow-lg rounded w-full h-auto"
      />
    </div>
  );
}
