"use client";
import { Excalidraw } from "@excalidraw/excalidraw";
import type { 
  AppState, 
  BinaryFiles, 
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types";

import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types"
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase/supabaseBrowser";
import "@excalidraw/excalidraw/index.css";

const ExcalidrawWrapper: React.FC = () => {
  const [diagramId, setDiagramId] = useState<number | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [initialData, setInitialData] = useState<ExcalidrawInitialDataState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExistingDiagram, setIsExistingDiagram] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Initialize diagram ID and load data on mount
  useEffect(() => {
    const initializeDiagram = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const idFromUrl = urlParams.get('id');
        
        if (idFromUrl && !isNaN(Number(idFromUrl))) {
          const id = Number(idFromUrl);
          setDiagramId(id);
          
          // Fetch existing diagram data
          const { data, error } = await supabase
            .from('excalidraw_diagrams')
            .select('diagram_data')
            .eq('id', id)
            .single();
          
          if (error) {
            console.error('Error loading diagram:', error);
          } else if (data?.diagram_data) {
            setIsExistingDiagram(true);
            // Ensure the data structure matches Excalidraw's expectations
            const { elements, appState, files } = data.diagram_data;
            setInitialData({
              elements: elements || [],
              appState: {
                ...(appState || {}),
                collaborators: [],
                currentItemFontFamily: appState?.currentItemFontFamily || 1,
                viewBackgroundColor: appState?.viewBackgroundColor || "#ffffff",
                zoom: appState?.zoom || { value: 1 },
              },
              files: files || {},
            });
          }
        } else {
          // Generate a random number for ID
          const timestamp = Date.now();
          const random = Math.floor(Math.random() * 1000000);
          const newId = Number(`${timestamp}${random}`);
          setDiagramId(newId);
          
          // Update URL with the new ID
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set('id', newId.toString());
          window.history.pushState({}, '', newUrl);
        }
      } catch (error) {
        console.error('Error initializing diagram:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDiagram();
  }, []);

  const saveDiagram = useCallback(async (
    elements: readonly ExcalidrawElement[],
    appState: AppState,
    files: BinaryFiles
  ) => {
    if (!diagramId || isAutoSaving) return;
    
    // Only prevent saving if it's a new diagram and there are no elements
    if (!isExistingDiagram && (!elements || elements.length === 0)) {
      console.log('New diagram with no elements - skipping save');
      return;
    }
    
    try {
      setIsAutoSaving(true);
      
      const diagramData = {
        elements,
        appState: {
          ...appState,
          collaborators: [], // Ensure this is always an array when saving
        },
        files
      };
      
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('excalidraw_diagrams')
        .upsert({
          id: diagramId,
          diagram_data: diagramData,
          updated_at: now,
          created_at: now,
        });

      if (error) {
        console.error('Error saving diagram:', error);
        return;
      }
      
      setIsExistingDiagram(true); // Mark as existing after first successful save
      setLastSaved(new Date());
      console.log('Diagram saved successfully');
    } catch (error) {
      console.error('Error saving diagram:', error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [diagramId, isAutoSaving, isExistingDiagram]);

  // Debounced save function to avoid too many API calls
  const debouncedSave = useCallback((
    elements: readonly ExcalidrawElement[],
    appState: AppState,
    files: BinaryFiles
  ) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveDiagram(elements, appState, files);
    }, 2000);
  }, [saveDiagram]);

  const handleChange = useCallback((
    elements: readonly ExcalidrawElement[],
    appState: AppState,
    files: BinaryFiles
  ) => {
    debouncedSave(elements, appState, files);
  }, [debouncedSave]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ height: "720px", width: "1280px" }}>
      {lastSaved && (
        <div style={{ position: "absolute", top: "10px", right: "10px", fontSize: "12px", color: "#666" }}>
          Last saved: {lastSaved.toLocaleTimeString()}
        </div>
      )}
      <Excalidraw
        onChange={handleChange}
        initialData={initialData}
      />
    </div>
  );
};

export default ExcalidrawWrapper;