import React from "react";
import DecorativeBlobs from "./DecorativeBlobs";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="relative min-h-screen pt-20 pb-12">
      <DecorativeBlobs />
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {children}

        <footer className="mt-10 text-center text-sm text-gray-500">© {new Date().getFullYear()} ORTHO SAARTHI</footer>
      </div>
    </div>
  );
}
