"use client";

import { Download, Music, X, Loader2 } from "lucide-react";
import { useMemo } from "react";
import Image from "next/image";
import { FileItem } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FilePreviewModalProps {
  file: FileItem | null;
  onClose: () => void;
}

const API = process.env.NEXT_PUBLIC_API_URL;

const FilePreviewModal = ({ file, onClose }: FilePreviewModalProps) => {
  const objectUrl = useMemo(
    () => (file ? `${API}/download/${encodeURIComponent(file.name)}` : null),
    [file],
  );

  if (!file) return null;

  const getExt = (name: string) => name.split(".").pop()?.toLowerCase() || "";
  const ext = getExt(file.name);
  const isVideo = ["mp4", "webm", "mkv", "mov"].includes(ext);
  const isImage = ["png", "jpg", "jpeg", "gif", "webp"].includes(ext);
  const isPdf = ["pdf"].includes(ext);
  const isAudio = ["mp3", "wav", "ogg"].includes(ext);

  const renderContent = () => {
    if (!objectUrl) return <Loader2 className="animate-spin text-primary" />;

    if (isVideo)
      return (
        <video
          src={objectUrl}
          controls
          autoPlay
          className="max-w-full max-h-[80vh] shadow-2xl rounded-lg"
        />
      );
    if (isImage)
      return (
        <div className="relative w-full h-[80vh] max-w-full">
          <Image
            src={objectUrl}
            alt={file.name}
            fill
            sizes="(max-width: 768px) 100vw, 80vw"
            className="object-contain rounded-lg"
            unoptimized
          />
        </div>
      );
    if (isAudio)
      return (
        <div className="w-full max-w-md p-8 bg-muted/10 rounded-3xl backdrop-blur-xl border border-white/5 flex flex-col items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
            <Music size={40} className="text-primary" />
          </div>
          <audio src={objectUrl} controls className="w-full" />
        </div>
      );
    if (isPdf)
      return (
        <iframe
          src={objectUrl}
          className="w-full h-[80vh] bg-white rounded-lg"
          title="PDF Preview"
        />
      );

    return (
      <div className="text-center">
        <p className="text-muted-foreground mb-4">
          Preview not supported for this file type.
        </p>
        <Button asChild>
          <a href={`${objectUrl}?download=true`}>Download File</a>
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={!!file} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-7xl w-full h-[90vh] bg-background border-border p-0 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/50 backdrop-blur-sm z-10">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
              Preview
            </p>
            <DialogTitle className="text-lg font-bold truncate pr-4">
              {file.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-mono mt-0.5">
              {ext.toUpperCase()} •{" "}
              {file.size
                ? (file.size / 1024 / 1024).toFixed(2) + " MB"
                : "Unknown Size"}
            </DialogDescription>
          </div>
          <div className="flex items-center gap-2">
            {objectUrl && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-2 text-xs"
              >
                <a href={`${objectUrl}?download=true`} download={file.name}>
                  <Download size={16} />
                  Download
                </a>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={18} />
            </Button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center bg-muted/40 p-4">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilePreviewModal;
