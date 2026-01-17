"use client";

import { useRef, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import SettingsModal from "@/components/modals/SettingsModal";
import FilePreviewModal from "@/components/modals/FilePreviewModal";
import GlobalUploadProgress from "@/components/upload/GlobalUploadProgress";
import DragDropOverlay from "@/components/ui/drag-drop-overlay";
import { useFileSystem } from "@/context/FileSystemContext";
import { useUpload } from "@/context/UploadContext";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    currentPath,
    settingsOpen,
    setSettingsOpen,
    previewFile,
    setPreviewFile,
  } = useFileSystem();

  const uploadState = useUpload();
  const { processQueue } = uploadState;
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      processQueue(currentPath, droppedFiles);
    }
  };

  return (
    <div
      className="flex h-screen bg-background overflow-hidden relative"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <DragDropOverlay isDragging={isDragging} />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <FilePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />

      <GlobalUploadProgress upload={uploadState} />
      <div className="hidden md:block h-full z-50">
        <Sidebar onSettingsClick={() => setSettingsOpen(true)} />
      </div>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header onSettingsClick={() => setSettingsOpen(true)} />

        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-muted/20 to-background">
          {children}
        </div>
      </main>
    </div>
  );
}
