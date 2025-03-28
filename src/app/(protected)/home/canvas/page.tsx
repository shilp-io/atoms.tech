'use client';

import dynamic from 'next/dynamic';
import React, { useState } from 'react';
const ExcalidrawWithClientOnly = dynamic(
    async () => (await import("@/components/custom/LandingPage/excalidrawWrapper")).default,
    {
      ssr: false,
    },
  );

export default function Draw() {
    const [prompt, setPrompt] = useState('');

    const handleGenerate = () => {
        // TODO: Implement diagram generation
        console.log('Generating diagram from:', prompt);
    };

    return (
        <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
            <div style={{ flexShrink: 0 }}>
                <ExcalidrawWithClientOnly />
            </div>
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '10px',
                padding: '20px',
                background: '#f5f5f5',
                borderRadius: '8px',
                height: 'fit-content' 
            }}>
                <h3 style={{ margin: '0 0 10px 0' }}>Text to Diagram</h3>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your diagram here..."
                    style={{
                        width: '300px',
                        height: '150px',
                        padding: '10px',
                        borderRadius: '0px',
                        border: '1px solid #ddd',
                        resize: 'vertical'
                    }}
                />
                <button
                    onClick={handleGenerate}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#993CF6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Generate
                </button>
            </div>
        </div>
    );
}
