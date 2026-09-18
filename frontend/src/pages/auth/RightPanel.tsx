import { Camera } from "lucide-react";
import { Link } from "react-router-dom";
import dashboardImage from "./image.png";

export const RightPanel = () => {
  return (
    <aside className="right-glow relative hidden h-auto min-h-0 w-[55%] flex-col overflow-hidden bg-[#0B1426] text-white lg:flex rounded-3xl m-3 ml-0 border border-white/10 shadow-2xl">

      {/* Background layer – the dashboard image sits here */}
      <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
        <img
          src={dashboardImage}
          alt="PhotoShare Dashboard"
          className="w-[115%] max-w-none h-full object-contain object-bottom opacity-95 translate-y-4"
        />
        {/* Soft gradient mask so the image fades into the dark background at the top */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1426] via-[#0B1426]/70 to-transparent h-[45%]" />
      </div>

      {/* Foreground content (logo + title + description) */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-[620px] flex-col items-center pt-10 xl:pt-14 px-6">

        {/* Logo */}
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2.5 text-[24px] font-extrabold tracking-tight text-white"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#2B5B91] bg-[#12345C]">
            <Camera size={20} strokeWidth={2.5} />
          </span>
          <span>
            Photo<span className="text-[#1769FF]">Share</span>
          </span>
        </Link>

        {/* Title + Description */}
        <div className="text-center">
          <h2 className="text-[28px] font-extrabold leading-tight tracking-[-1px] xl:text-[34px]">
            Capture. Share. <span className="text-[#1769FF]">Discover.</span>
          </h2>
          <p className="mx-auto mt-2 max-w-[450px] text-[14px] leading-relaxed text-[#AFC8EA]">
            A modern photo sharing platform to store, organize and share your moments with the world.
          </p>
        </div>
      </div>
    </aside>
  );
};