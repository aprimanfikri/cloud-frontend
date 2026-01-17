"use client";

import { FileItem, ActiveOps } from "@/types";
import FolderCard from "./FolderCard";
import FileCard from "./FileCard";

interface FileGridProps {
  files: FileItem[];
  folders: string[];
  onDelete: (name: string) => void;
  onFolderDelete: (name: string) => void;
  onDownload: (file: FileItem) => void;
  activeOps: ActiveOps;
  onSelect: (file: FileItem) => void;
  onFolderClick: (folder: string) => void;
}

const FileGrid = ({
  files,
  folders,
  onDelete,
  onFolderDelete,
  onDownload,
  activeOps,
  onSelect,
  onFolderClick,
}: FileGridProps) => {
  if (files.length === 0 && folders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground animate-fade-in">
        <div className="p-4 bg-muted/50 rounded-full mb-4">
          <svg
            className="w-8 h-8 opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <p className="font-medium">No files found</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {folders.length > 0 && (
        <section>
          <h3 className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mb-4 pl-1 flex items-center gap-2">
            Folders
            <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] text-foreground">
              {folders.length}
            </span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {folders.map((folder, index) => (
              <FolderCard
                key={index}
                name={folder}
                onClick={() => onFolderClick(folder)}
                onDelete={onFolderDelete}
                isDeleting={activeOps.deleting.has(folder)}
              />
            ))}
          </div>
        </section>
      )}

      {files.length > 0 && (
        <section>
          <h3 className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mb-4 pl-1 flex items-center gap-2">
            Files
            <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] text-foreground">
              {files.length}
            </span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {files.map((file, index) => (
              <FileCard
                key={index}
                file={file}
                onDelete={onDelete}
                onDownload={onDownload}
                activeOps={activeOps}
                onClick={() => onSelect(file)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default FileGrid;
