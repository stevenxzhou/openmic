"use client";

import { SocialIcon } from "react-social-icons";

// Xiaohongshu (RedNote) custom icon since react-social-icons may not have it
export const XiaohongshuIcon = ({ className = "w-5 h-5" }) => (
  <SocialIcon
    url="https://xiaohongshu.com"
    fgColor="white"
    style={{ height: 20, width: 20 }}
  />
);

// Instagram icon from react-social-icons
export const InstagramIcon = ({
  className = "w-5 h-5",
  handle = "instagram",
}: {
  className?: string;
  handle?: string;
}) => (
  <div className={className}>
    <SocialIcon
      url={`https://instagram.com/${handle}`}
      fgColor="white"
      style={{ height: 20, width: 20 }}
    />
  </div>
);
