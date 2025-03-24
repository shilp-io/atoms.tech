'use client';

import dynamic from 'next/dynamic';
import React from 'react';
const ExcalidrawWithClientOnly = dynamic(
    async () => (await import("@/components/custom/LandingPage/excalidrawWrapper")).default,
    {
      ssr: false,
    },
  );

export default function Draw() {
    return (
     <ExcalidrawWithClientOnly />
    );
}
