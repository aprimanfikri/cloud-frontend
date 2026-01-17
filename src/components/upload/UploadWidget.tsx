"use client";

import { File as FileIcon, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";
import { UploadState } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface UploadWidgetProps {
  uploadState: UploadState;
  currentPath?: string;
}

const UploadWidget = ({
  uploadState,
  currentPath = "/",
}: UploadWidgetProps) => {
  const {
    files,
    setFiles,
    uploading,
    progress,
    status,
    currentFileIndex,
    processQueue,
    cancelQueue,
    formatBytes,
  } = uploadState;

  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length > 0) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="w-full mb-6">
      <div
        className={cn(
          "relative border border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer overflow-hidden group",
          dragActive
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border/60 hover:border-primary/50 hover:bg-muted/30",
          uploading && "pointer-events-none opacity-100",
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => {
          if (!uploading && files.length === 0) {
            inputRef.current?.click();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple
          onChange={handleFilesSelect}
          disabled={uploading}
        />

        {files.length === 0 ? (
          <>
            <div className="p-5 bg-muted/50 rounded-2xl text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-300 mb-5">
              <UploadCloud size={32} />
            </div>
            <p className="text-foreground font-semibold text-lg">
              Drop files to upload
            </p>
            <p className="text-muted-foreground text-sm mt-1.5">
              or click to browse
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center w-full max-w-sm">
            {!uploading ? (
              <>
                <div className="relative mb-4">
                  <div className="absolute top-0 right-0 -mr-2 -mt-2 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md z-10">
                    {files.length}
                  </div>
                  {files.length > 1 ? (
                    <div className="stack">
                      <div className="p-4 bg-muted rounded-xl border border-border text-primary opacity-60 scale-90 translate-y-2">
                        <FileIcon size={40} />
                      </div>
                      <div className="p-4 bg-muted rounded-xl border border-border text-primary">
                        <FileIcon size={40} />
                      </div>
                    </div>
                  ) : (
                    <FileIcon
                      size={48}
                      className="text-primary animate-bounce"
                    />
                  )}
                </div>

                <div className="text-center w-full mb-6">
                  <p className="font-bold text-foreground truncate max-w-[200px] mx-auto text-lg">
                    {files.length === 1
                      ? files[0].name
                      : `${files.length} Files Selected`}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total:{" "}
                    {formatBytes(files.reduce((acc, f) => acc + f.size, 0))}
                  </p>
                  {files.length > 1 && (
                    <p className="text-xs text-muted-foreground/60 mt-2 italic">
                      {files
                        .slice(0, 3)
                        .map((f) => f.name)
                        .join(", ")}{" "}
                      {files.length > 3 ? "..." : ""}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 w-full">
                  <Button
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFiles([]);
                    }}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      processQueue(currentPath);
                    }}
                    className="flex-1 shadow-lg shadow-primary/20"
                  >
                    Start Queue
                  </Button>
                </div>
              </>
            ) : (
              <div className="w-full animate-fade-in pointer-events-auto">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-xs font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20 shrink-0">
                      {currentFileIndex + 1}/{files.length}
                    </span>
                    <span
                      className="text-sm font-medium text-foreground truncate"
                      title={files[currentFileIndex]?.name}
                    >
                      {files[currentFileIndex]?.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-primary font-mono">
                    {progress}%
                  </span>
                </div>

                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-out shadow-[0_0_8px_rgba(var(--primary),0.6)]"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                    {status}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelQueue();
                    }}
                    className="h-6 text-xs gap-1 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X size={12} /> Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadWidget;
