"use client";

import {
  Archive,
  Download,
  FileImage,
  FileText,
  FileVideo,
  Music,
  Trash2,
  Loader2,
} from "lucide-react";
import { FileItem, ActiveOps } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileCardProps {
  file: FileItem;
  onDelete: (name: string) => void;
  onDownload: (file: FileItem) => void;
  activeOps: ActiveOps;
  onClick: () => void;
}

const FileCard = ({
  file,
  onDelete,
  onDownload,
  activeOps,
  onClick,
}: FileCardProps) => {
  const size = (file.size / 1024 / 1024).toFixed(2);
  const ext = file.type || file.name.split(".").pop()?.toLowerCase() || "";

  const isDeleting = activeOps?.deleting?.has(file.name);
  const isDownloading = activeOps?.downloading?.has(file.name);
  const isLoading = isDeleting || isDownloading;

  const getIcon = () => {
    if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext))
      return {
        icon: <FileImage size={24} />,
        color: "text-sky-500",
        bg: "bg-sky-500/10",
      };
    if (["mp4", "mkv", "webm", "mov"].includes(ext))
      return {
        icon: <FileVideo size={24} />,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
      };
    if (["mp3", "wav", "ogg"].includes(ext))
      return {
        icon: <Music size={24} />,
        color: "text-green-500",
        bg: "bg-green-500/10",
      };
    if (["zip", "rar", "7z"].includes(ext))
      return {
        icon: <Archive size={24} />,
        color: "text-yellow-500",
        bg: "bg-yellow-500/10",
      };

    return {
      icon: <FileText size={24} />,
      color: "text-foreground",
      bg: "bg-muted",
    };
  };

  const { icon, color, bg } = getIcon();
  const dateStr = file.date
    ? new Date(file.date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div
      onClick={!isLoading ? onClick : undefined}
      className={cn(
        "group flex flex-col p-3 rounded-3xl bg-card hover:bg-muted/50 transition-all duration-300 h-full cursor-pointer relative overflow-hidden ring-1 ring-border/40 hover:ring-primary/20 hover:shadow-lg hover:shadow-primary/5",
        isLoading && "opacity-70 pointer-events-none",
      )}
    >
      <div
        className={cn(
          "aspect-square rounded-2xl flex items-center justify-center mb-3 transition-colors",
          bg,
          color,
          "group-hover:bg-transparent group-hover:scale-105 duration-300"
        )}
      >
        {isLoading ? (
          <Loader2 size={32} className="animate-spin" />
        ) : (
          <div className="scale-150">{icon}</div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <h3
          className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors"
          title={file.name}
        >
          {file.name}
        </h3>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
          <div className="flex items-center gap-1.5">
            <span className="font-mono bg-muted px-1.5 py-0.5 rounded-md uppercase">
              {ext || "file"}
            </span>
            <span className="font-mono bg-muted px-1.5 py-0.5 rounded-md">
              {size} MB
            </span>
          </div>
          <span className="truncate opacity-70">{dateStr}</span>
        </div>
      </div>

      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
        <Button
          size="icon"
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            onDownload(file);
          }}
          disabled={isLoading}
          className="h-8 w-8 rounded-full shadow-sm bg-background/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground"
          title="Download"
        >
          {isDownloading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Download size={14} />
          )}
        </Button>

        <Button
          size="icon"
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(file.name);
          }}
          disabled={isLoading}
          className="h-8 w-8 rounded-full shadow-sm bg-background/80 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground"
          title="Delete"
        >
          {isDeleting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Trash2 size={14} />
          )}
        </Button>
      </div>
    </div>
  );
};

export default FileCard;
