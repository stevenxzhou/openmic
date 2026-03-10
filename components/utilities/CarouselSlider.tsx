import { useEffect, useRef, useState } from "react";

const baseUrl = process.env.NEXT_PUBLIC_BASE_PATH || "";
const PLACEHOLDER_IMAGES = [
  `${baseUrl}/open_mic_banner.png`,
  `${baseUrl}/open_mic_banner_2.jpg`,
  `${baseUrl}/open_mic_banner_3.jpeg`,
];

export default function CarouselSlider({
  images = PLACEHOLDER_IMAGES,
  interval = 5000,
}) {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, interval);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [current, images.length, interval]);

  return (
    <div className="flex justify-center w-full">
      <div className="w-full m-4 sm:m-4 bg-white rounded-lg shadow-xl border-gray-200">
        <div className="relative h-48 sm:h-56">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Slide ${idx + 1}`}
              className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-700 rounded-lg ${current === idx ? "opacity-100" : "opacity-0"}`}
            />
          ))}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex justify-center">
            {images.map((_, idx) => (
              <button
                key={idx}
                className={`w-2 h-2 mx-1 rounded-full border border-white bg-white bg-opacity-60 ${current === idx ? "bg-blue-500" : "bg-gray-300"}`}
                onClick={() => setCurrent(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
