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
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">About Us</h1>
            <div className="prose max-w-3xl">
                <p className="mb-4">
                    Welcome to our platform. We are dedicated to delivering
                    exceptional experiences and innovative solutions to our
                    users.
                </p>
                <ExcalidrawWithClientOnly />
                <p className="mb-4">
                    Our mission is to provide high-quality services while
                    maintaining the highest standards of customer satisfaction.
                </p>
            </div>
        </div>
    );
}
