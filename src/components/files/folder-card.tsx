"use client";

import { Folder, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FolderCardProps {
  name: string;
  onClick: () => void;
  onDelete: (name: string) => void;
  isDeleting: boolean;
}

const FolderCard = ({
  name,
  onClick,
  onDelete,
  isDeleting,
}: FolderCardProps) => {
  return (
    <div
      onClick={!isDeleting ? onClick : undefined}
      className={cn(
        "group flex items-center justify-between p-3 rounded-2xl bg-muted/30 hover:bg-muted/60 transition-all duration-200 cursor-pointer relative overflow-hidden",
        isDeleting && "opacity-70 pointer-events-none",
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 shrink-0 group-hover:scale-110 transition-transform duration-300">
          {isDeleting ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Folder size={20} fill="currentColor" className="opacity-100" />
          )}
        </div>
        <div className="min-w-0 flex flex-col">
          <h3
            className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors"
            title={name}
          >
            {name}
          </h3>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(name);
        }}
        disabled={isDeleting}
        className="opacity-0 group-hover:opacity-100 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all active:scale-95"
        title="Delete Folder"
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
};

export default FolderCard;
