"use client";

import React from "react";
import { UploadCloud } from "lucide-react";

interface DragDropOverlayProps {
  isDragging: boolean;
}

const DragDropOverlay = ({ isDragging }: DragDropOverlayProps) => {
  if (!isDragging) return null;

  return (
    <div className="fixed inset-0 z-100 w-screen h-screen flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in pointer-events-none">
      <div className="bg-background/90 border-4 border-dashed border-primary p-16 rounded-[2rem] flex flex-col items-center justify-center shadow-2xl transform transition-all duration-300">
        <div className="p-8 bg-primary/20 rounded-full mb-6 animate-bounce">
          <UploadCloud size={80} className="text-primary" />
        </div>
        <h2 className="text-4xl font-bold text-foreground mb-3">
          Drop Files Here
        </h2>
        <p className="text-muted-foreground text-xl font-medium">
          Instant Upload to Xfrhk Drive
        </p>
      </div>
    </div>
  );
};

export default DragDropOverlay;
