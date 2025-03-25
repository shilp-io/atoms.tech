"use client";
import { Excalidraw } from "@excalidraw/excalidraw";
import { useState, useEffect, useCallback } from "react";
import "@excalidraw/excalidraw/index.css";

const ExcalidrawWrapper: React.FC = () => {
  const [diagramId, setDiagramId] = useState<string | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Initialize diagram ID on component mount
  useEffect(() => {
    // Use existing ID from URL or storage, or generate a new one
    const urlParams = new URLSearchParams(window.location.search);
    const idFromUrl = urlParams.get('id');
    
    if (idFromUrl) {
      setDiagramId(idFromUrl);
    } else {
      // Generate a unique ID if none exists
      const newId = crypto.randomUUID();
      setDiagramId(newId);
      
      // Update URL with the new ID
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('id', newId);
      window.history.pushState({}, '', newUrl);
    }
  }, []);

  const saveDiagram = useCallback(async (elements: any, appState: any, files: any) => {
    if (!diagramId || isAutoSaving) return;
    
    try {
      setIsAutoSaving(true);
      
      const diagramData = {
        elements,
        appState,
        files
      };
      
      const response = await fetch('/api/save-diagram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          diagramData,
          diagramId,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error saving diagram:', errorData);
        return;
      }
      
      setLastSaved(new Date());
      console.log('Diagram saved successfully');
    } catch (error) {
      console.error('Error saving diagram:', error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [diagramId, isAutoSaving]);

  // Debounced save function to avoid too many API calls
  const debouncedSave = useCallback(
    debounce((elements: any, appState: any, files: any) => {
      saveDiagram(elements, appState, files);
    }, 2000),
    [saveDiagram]
  );

  const handleChange = useCallback((elements: any, appState: any, files: any) => {
    // console.log("Excalidraw elements changed:", elements);
    debouncedSave(elements, appState, files);
  }, [debouncedSave]);

  return (
    <div style={{ height: "720px", width: "1280px" }}>
      {lastSaved && (
        <div style={{ position: "absolute", top: "10px", right: "10px", fontSize: "12px", color: "#666" }}>
          Last saved: {lastSaved.toLocaleTimeString()}
        </div>
      )}
      <Excalidraw
        onChange={handleChange}
      />
    </div>
  );
};

// Debounce utility function
function debounce(func: Function, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return function(...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default ExcalidrawWrapper;