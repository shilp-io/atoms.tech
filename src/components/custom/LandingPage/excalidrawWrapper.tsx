"use client";
import { Excalidraw } from "@excalidraw/excalidraw";

import "@excalidraw/excalidraw/index.css";

const ExcalidrawWrapper: React.FC = () => {
  const handleChange = (elements: any) => {
    console.log("Excalidraw elements:", elements);
  };

  return (
    <div style={{height:"720px", width:"1280px"}}>
      <Excalidraw onChange={handleChange} />
    </div>
  );
};
export default ExcalidrawWrapper;