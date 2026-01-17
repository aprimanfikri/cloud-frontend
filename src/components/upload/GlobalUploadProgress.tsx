"use client";

import { UploadCloud, X } from "lucide-react";
import { UploadState } from "@/types";
import { Button } from "@/components/ui/button";

interface GlobalUploadProgressProps {
  upload: UploadState;
}

const GlobalUploadProgress = ({ upload }: GlobalUploadProgressProps) => {
  const { uploading, progress, status, files, currentFileIndex, cancelQueue } =
    upload;

  if (!uploading) return null;

  return (
    <div className="fixed bottom-6 left-6 z-100 animate-fade-in">
      <div className="bg-background/90 backdrop-blur-md border border-border shadow-2xl rounded-2xl p-4 w-80 ring-1 ring-primary/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
              <UploadCloud size={18} className="animate-bounce" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Uploading {currentFileIndex + 1}/{files.length}
              </span>
              <span className="text-sm font-bold text-foreground truncate block">
                {files[currentFileIndex]?.name}
              </span>
            </div>
          </div>

          <Button
            size="icon"
            variant="ghost"
            onClick={cancelQueue}
            className="h-6 w-6 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <X size={16} />
          </Button>
        </div>

        <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono">
          <span className="truncate max-w-[180px] opacity-70">{status}</span>
          <span className="font-bold">{progress}%</span>
        </div>
      </div>
    </div>
  );
};

export default GlobalUploadProgress;
