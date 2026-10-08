import { useState } from "react";

export default function ChatAvatar({ name, image, active = false, className = "h-11 w-11" }) {
  const [failedImage, setFailedImage] = useState(null);
  const initials = (name || "?").trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();

  return (
    <span className={`relative flex shrink-0 items-center justify-center rounded-2xl bg-[#f4eee2] text-sm font-bold text-[#9b701f] ${className}`}>
      {image && image !== failedImage ? (
        <img src={image} alt="" className="h-full w-full rounded-[inherit] object-cover" onError={() => setFailedImage(image)} />
      ) : initials}
      {active && <span aria-hidden="true" className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#469c75]" />}
    </span>
  );
}
