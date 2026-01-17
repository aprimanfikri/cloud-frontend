"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface BreadcrumbsProps {
  currentPath: string;
  setCurrentPath: (path: string) => void;
  createFolder: (name: string) => void;
  view?: string;
}

const Breadcrumbs = ({ createFolder }: BreadcrumbsProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState("");

  return (
    <>
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <Button
          onClick={() => {
            setFolderName("");
            setIsDialogOpen(true);
          }}
          size="sm"
          variant="outline"
          className="gap-2 shadow-none border-dashed rounded-full px-4 text-xs font-medium hover:bg-muted/50"
        >
          <Plus size={14} />
          New Folder
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              autoFocus
              placeholder="Folder name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const value = folderName.trim();
                  if (!value) return;
                  createFolder(value);
                  setIsDialogOpen(false);
                }
              }}
            />
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const value = folderName.trim();
                if (!value) return;
                createFolder(value);
                setIsDialogOpen(false);
              }}
              disabled={!folderName.trim()}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Breadcrumbs;
