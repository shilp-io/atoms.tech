'use client';
import dynamic from 'next/dynamic';

// Dynamically import Excalidraw to avoid SSR issues
const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false,
  }
);

export const ExcalidrawSection = () => {
  return (
    <div className="w-full h-[500px] p-4">
      <Excalidraw />
    </div>
  );
}; 