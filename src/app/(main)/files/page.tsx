"use client";

import { useFileSystem } from "@/context/file-system-context";
import { useState } from "react";
import FileGrid from "@/components/files/file-grid";
import Breadcrumbs from "@/components/navigation/breadcrumbs";
import { FileItem } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function FilesPage() {
  const {
    currentPath,
    setCurrentPath,
    createFolder,
    view,
    searchTerm,
    displayFiles,
    displayFolders,
    handleDelete,
    handleDeleteFolder,
    handleDownload,
    activeOps,
    setPreviewFile,
    navigateToFolder,
  } = useFileSystem();

  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);

  const handleSelect = (file: FileItem) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (
      [
        "png",
        "jpg",
        "jpeg",
        "gif",
        "webp",
        "mp4",
        "webm",
        "mkv",
        "mov",
        "mp3",
        "wav",
        "ogg",
        "pdf",
      ].includes(ext || "")
    ) {
      setPreviewFile(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {!searchTerm && (
        <Breadcrumbs
          currentPath={currentPath}
          setCurrentPath={setCurrentPath}
          createFolder={createFolder}
          view={view}
        />
      )}

      <div className={searchTerm ? "" : "mt-0 pb-20"}>
        <FileGrid
          files={displayFiles}
          folders={displayFolders}
          onDelete={setFileToDelete}
          onFolderDelete={setFolderToDelete}
          onDownload={handleDownload}
          activeOps={activeOps}
          onSelect={handleSelect}
          onFolderClick={navigateToFolder}
        />
      </div>

      <Dialog
        open={fileToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setFileToDelete(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete file</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete file{" "}
              <span className="font-semibold">{fileToDelete}</span>? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setFileToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!fileToDelete || activeOps.deleting.has(fileToDelete)}
              onClick={async () => {
                if (!fileToDelete) return;
                await handleDelete(fileToDelete);
                setFileToDelete(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={folderToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setFolderToDelete(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete folder</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete folder{" "}
              <span className="font-semibold">{folderToDelete}</span> and all
              its contents? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setFolderToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={
                !folderToDelete || activeOps.deleting.has(folderToDelete)
              }
              onClick={async () => {
                if (!folderToDelete) return;
                await handleDeleteFolder(folderToDelete);
                setFolderToDelete(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
