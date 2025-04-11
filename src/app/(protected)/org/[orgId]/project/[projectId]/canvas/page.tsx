'use client';

import { ChevronDown, CircleAlert, Grid, PenTool } from 'lucide-react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

import { useGumloop } from '@/hooks/useGumloop';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ExcalidrawWithClientOnly = dynamic(
    async () =>
        (await import('@/components/custom/LandingPage/excalidrawWrapper'))
            .default,
    {
        ssr: false,
    },
);

const DiagramGallery = dynamic(
    async () =>
        (await import('@/components/custom/Gallery/DiagramGallery')).default,
    {
        ssr: false,
    },
);

type DiagramType = 'flowchart' | 'sequence' | 'class';

export default function Draw() {
    // const organizationId = '9badbbf0-441c-49f6-91e7-3d9afa1c13e6';
    const organizationId = usePathname().split('/')[2];
    const [prompt, setPrompt] = useState('');
    const [diagramType, setDiagramType] = useState<DiagramType>('flowchart');
    const [excalidrawApi, setExcalidrawApi] = useState<{
        addMermaidDiagram: (mermaidSyntax: string) => Promise<void>;
    } | null>(null);

    // Gallery/editor state management
    const [activeTab, setActiveTab] = useState<string>('editor');
    const [selectedDiagramId, setSelectedDiagramId] = useState<string | null>(null);
    const [shouldRefreshGallery, setShouldRefreshGallery] = useState<boolean>(false);

    // Gumloop state management
    const { startPipeline, getPipelineRun } = useGumloop();
    const [pipelineRunId, setPipelineRunId] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string>('');

    // Get pipeline run data
    const { data: pipelineResponse } = getPipelineRun(
        pipelineRunId,
        organizationId,
    );

    const handleGenerate = async () => {
        if (!excalidrawApi) {
            console.error('Excalidraw API not initialized');
            return;
        }

        if (!prompt.trim()) {
            setError('Please enter a description for your diagram');
            return;
        }

        setError('');
        setIsGenerating(true);

        try {
            const { run_id } = await startPipeline({
                pipelineType: 'text-to-mermaid',
                customPipelineInputs: [
                    {
                        input_name: 'Requirements(s)',
                        value: prompt.trim(),
                    },
                    {
                        input_name: 'Diagram-type',
                        value: diagramType,
                    },
                ],
            });
            setPipelineRunId(run_id);
        } catch (error) {
            console.error('Failed to start pipeline:', error);
            setError('Failed to start diagram generation');
            setIsGenerating(false);
        }
    };

    // Handle the pipeline response
    useEffect(() => {
        switch (pipelineResponse?.state) {
            case 'DONE': {
                console.log('Pipeline response:', pipelineResponse);

                // Parse the JSON string from outputs.output
                let parsedOutput;
                try {
                    const output = pipelineResponse.outputs?.output;
                    if (!output || typeof output !== 'string') {
                        throw new Error('Invalid output format');
                    }
                    parsedOutput = JSON.parse(output);
                    const mermaidSyntax = parsedOutput?.mermaid_syntax;

                    if (!mermaidSyntax) {
                        console.error('No mermaid syntax found in response');
                        console.log('parsedOutput: ', parsedOutput);
                        setError(
                            'Failed to generate diagram: No mermaid syntax in response',
                        );
                        break;
                    }

                    // Clean the mermaid syntax
                    const syntaxStr = Array.isArray(mermaidSyntax)
                        ? mermaidSyntax[0]
                        : mermaidSyntax;
                    let cleanedSyntax = syntaxStr.replace(
                        /```[\s\S]*?```/g,
                        (match: string) => {
                            const content = match
                                .replace(/```[\w]*\n?/, '')
                                .replace(/\n?```$/, '');
                            return content;
                        },
                    );
                    cleanedSyntax = cleanedSyntax
                        .replace(/^```[\w]*\n?/, '')
                        .replace(/\n?```$/, '');
                    cleanedSyntax = cleanedSyntax.trim();

                    // console.log('Cleaned mermaid syntax:', cleanedSyntax);

                    if (excalidrawApi) {
                        excalidrawApi
                            .addMermaidDiagram(cleanedSyntax)
                            .catch((err) => {
                                console.error(
                                    'Error rendering mermaid diagram:',
                                    err,
                                );
                                setError('Failed to render diagram');
                            });
                    }
                } catch (err) {
                    console.error('Error parsing pipeline output:', err);
                    setError('Failed to parse diagram data');
                    break;
                }
                break;
            }
            case 'FAILED': {
                console.log('Pipeline response:', pipelineResponse);
                console.error('Pipeline failed');
                setError('Failed to generate diagram');
                break;
            }
            default:
                return;
        }
        setPipelineRunId('');
        setIsGenerating(false);
    }, [pipelineResponse, excalidrawApi]);

    const handleExcalidrawMount = useCallback(
        (api: {
            addMermaidDiagram: (mermaidSyntax: string) => Promise<void>;
        }) => {
            setExcalidrawApi(api);
        },
        [],
    );

    // Handle creating a new diagram from gallery
    const handleNewDiagram = useCallback(() => {
        setSelectedDiagramId(null);
        setActiveTab('editor');
    }, []);

    // Handle selecting a diagram from gallery
    const handleSelectDiagram = useCallback((diagramId: string) => {
        setSelectedDiagramId(diagramId);
        setActiveTab('editor');
    }, []);

    // Handle diagram saved callback
    const handleDiagramSaved = useCallback((diagramId: string) => {
        setShouldRefreshGallery(true);
    }, []);

    // Reset the refresh flag after the gallery is refreshed
    useEffect(() => {
        if (shouldRefreshGallery && activeTab === 'gallery') {
            setShouldRefreshGallery(false);
        }
    }, [activeTab, shouldRefreshGallery]);

    return (
        <div className="flex flex-col gap-4 p-5 h-full">
            <div className="flex justify-between items-center">
                <Tabs 
                    value={activeTab} 
                    onValueChange={setActiveTab} 
                    className="w-auto"
                >
                    <TabsList>                        
                        <TabsTrigger value="editor" className="flex items-center gap-1.5">
                            <PenTool size={16} />
                            Editor
                        </TabsTrigger>
                        <TabsTrigger value="gallery" className="flex items-center gap-1.5">
                            <Grid size={16} />
                            Gallery
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {activeTab === 'gallery' ? (
                <DiagramGallery 
                    onNewDiagram={handleNewDiagram}
                    onSelectDiagram={handleSelectDiagram}
                    key={shouldRefreshGallery ? 'refresh' : 'default'}
                />
            ) : (
                <div className="flex gap-5">
                    <div className="flex-shrink-0">
                        <ExcalidrawWithClientOnly 
                            onMounted={handleExcalidrawMount} 
                            diagramId={selectedDiagramId}
                            onDiagramSaved={handleDiagramSaved}
                        />
                    </div>
                    <div className="flex flex-col gap-2.5 p-5 bg-gray-100 dark:bg-sidebar rounded-lg h-fit">
                        <h3 className="text-xl text-BLACK dark:text-white">
                            Text to Diagram
                        </h3>
                        <textarea
                            value={prompt}
                            onChange={(e) => {
                                setPrompt(e.target.value);
                                if (error) setError('');
                            }}
                            placeholder="Describe your diagram here..."
                            className="w-[300px] h-[150px] p-2.5 rounded-none border border-[#454545] resize-y"
                        />
                        <div className="mb-2.5">
                            <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
                                Diagram Type
                            </label>
                            <div className="relative">
                                <select
                                    value={diagramType}
                                    onChange={(e) =>
                                        setDiagramType(e.target.value as DiagramType)
                                    }
                                    className="w-full p-2.5 bg-white dark:bg-[#121212] border border-[#454545] appearance-none cursor-pointer"
                                >
                                    <option value="flowchart">Flowchart</option>
                                    <option value="sequence">Sequence</option>
                                    <option value="class">Class</option>
                                </select>
                                <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <ChevronDown size={16} />
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className={`px-5 py-2.5 bg-[#993CF6] text-white border-none rounded-none font-bold ${
                                isGenerating
                                    ? 'opacity-70 cursor-default'
                                    : 'opacity-100 cursor-pointer'
                            }`}
                        >
                            {isGenerating ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Generating...
                                </div>
                            ) : (
                                'Generate'
                            )}
                        </button>
                        {error && (
                            <div className="flex items-center gap-2 text-red-600 bg-red-100 p-2 rounded text-sm">
                                <CircleAlert className="w-4 h-4" />
                                {error}
                            </div>
                        )}
                        {pipelineResponse?.state === 'DONE' && (
                            <div className="text-emerald-600 bg-emerald-100 p-2 rounded text-sm">
                                Diagram generated successfully!
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
