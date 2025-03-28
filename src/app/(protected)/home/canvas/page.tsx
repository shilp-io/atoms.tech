'use client';

import dynamic from 'next/dynamic';
import React, { useState, useCallback } from 'react';
const ExcalidrawWithClientOnly = dynamic(
    async () => (await import("@/components/custom/LandingPage/excalidrawWrapper")).default,
    {
      ssr: false,
    },
  );

export default function Draw() {
    const [prompt, setPrompt] = useState('');
    const [excalidrawApi, setExcalidrawApi] = useState<{ 
        addMermaidDiagram: (mermaidSyntax: string) => Promise<void> 
    } | null>(null);

    // Test mermaid diagram - this is just for testing the conversion
    const testMermaid = `
        graph TD
        A[Start] --> B{Is it?}
        B -- Yes --> C[OK]
        C --> D[Rethink]
        D --> B
        B -- No --> E[End]
    `;

    const handleGenerate = async () => {
        try {
            if (!excalidrawApi) {
                console.error('Excalidraw API not initialized');
                return;
            }
            // For now, we'll use the test mermaid diagram
            await excalidrawApi.addMermaidDiagram(testMermaid);
        } catch (error) {
            console.error('Error generating diagram:', error);
        }
    };

    const handleExcalidrawMount = useCallback((api: { 
        addMermaidDiagram: (mermaidSyntax: string) => Promise<void> 
    }) => {
        setExcalidrawApi(api);
    }, []);

    return (
        <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
            <div style={{ flexShrink: 0 }}>
                <ExcalidrawWithClientOnly onMounted={handleExcalidrawMount} />
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
