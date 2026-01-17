"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { FileItem, FileSystemContextType, ActiveOps } from "../types";

const API = process.env.NEXT_PUBLIC_API_URL;

const FileSystemContext = createContext<FileSystemContextType | null>(null);

export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error("useFileSystem must be used within a FileSystemProvider");
  }
  return context;
};

export const FileSystemProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [files, setFiles] = useState<FileItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeOps, setActiveOps] = useState<ActiveOps>({
    deleting: new Set(),
    downloading: new Set(),
  });
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const view = useMemo(() => {
    if (pathname === "/files") return "files";
    if (pathname === "/recent") return "recent";
    return "dashboard";
  }, [pathname]);

  const currentPath = searchParams.get("path") || "/";

  const setCurrentPath = useCallback(
    (path: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (path === "/") {
        params.delete("path");
      } else {
        params.set("path", path);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const refreshFiles = useCallback(() => {
    fetch(`${API}/files`)
      .then((res) => res.json())
      .then((list) => setFiles(list))
      .catch((err) => {
        console.error("Failed to fetch files:", err);
        toast.error("Failed to fetch files");
      });
  }, []);

  const stats = useMemo(() => {
    const size = files.reduce((acc, f) => acc + (f.size || 0), 0);
    const types: Record<string, number> = {};
    const sizes: Record<string, number> = {
      image: 0,
      video: 0,
      audio: 0,
      other: 0,
    };

    files.forEach((f) => {
      const type = (f.type || "").toLowerCase();
      const ext = (f.name.split(".").pop() || "").toLowerCase();

      let cat = "other";
      if (
        type.startsWith("image/") ||
        ["png", "jpg", "jpeg", "gif", "webp"].includes(ext)
      )
        cat = "image";
      else if (
        type.startsWith("video/") ||
        ["mp4", "mkv", "webm", "mov"].includes(ext)
      )
        cat = "video";
      else if (type.startsWith("audio/") || ["mp3", "wav", "ogg"].includes(ext))
        cat = "audio";

      types[cat] = (types[cat] || 0) + 1;
      sizes[cat] = (sizes[cat] || 0) + (f.size || 0);
    });

    return { count: files.length, size, types, sizes };
  }, [files]);

  const handleDelete = async (filename: string) => {
    setActiveOps((prev) => ({
      ...prev,
      deleting: new Set(prev.deleting).add(filename),
    }));
    try {
      await fetch(`${API}/files/${filename}`, { method: "DELETE" });
      toast.success(`Deleted ${filename}`);
      refreshFiles();
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete file");
    } finally {
      setActiveOps((prev) => {
        const next = new Set(prev.deleting);
        next.delete(filename);
        return { ...prev, deleting: next };
      });
    }
  };

  const handleDownload = async (file: FileItem) => {
    const filename = file.name;
    setActiveOps((prev) => ({
      ...prev,
      downloading: new Set(prev.downloading).add(filename),
    }));

    try {
      const downloadUrl = `${API}/download/${encodeURIComponent(filename)}?download=true`;

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.info(`Downloading ${filename}`);

      setTimeout(() => {
        setActiveOps((prev) => {
          const next = new Set(prev.downloading);
          next.delete(filename);
          return { ...prev, downloading: next };
        });
      }, 2000);
    } catch (e) {
      console.error(e);
      toast.error("Failed to start download");
      setActiveOps((prev) => {
        const next = new Set(prev.downloading);
        next.delete(filename);
        return { ...prev, downloading: next };
      });
    }
  };

  const navigateToFolder = (folderName: string) => {
    const newPath =
      currentPath === "/" ? `/${folderName}/` : `${currentPath}${folderName}/`;
    setCurrentPath(newPath);
  };

  const createFolder = (name: string) => {
    if (name) {
      navigateToFolder(name);
    }
  };

  const handleDeleteFolder = async (folderName: string) => {
    const folderPath =
      currentPath === "/" ? `/${folderName}/` : `${currentPath}${folderName}/`;

    setActiveOps((prev) => ({
      ...prev,
      deleting: new Set(prev.deleting).add(folderName),
    }));
    try {
      const res = await fetch(`${API}/files/folder`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderPath }),
      });

      if (!res.ok) throw new Error("Delete failed");

      const data = await res.json();
      toast.success(`Deleted ${folderName} (${data.count} files)`);
      refreshFiles();
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete folder");
    } finally {
      setActiveOps((prev) => {
        const next = new Set(prev.deleting);
        next.delete(folderName);
        return { ...prev, deleting: next };
      });
    }
  };

  useEffect(() => {
    refreshFiles();
  }, [refreshFiles]);

  const { displayFiles, displayFolders } = useMemo(() => {
    let dFiles: FileItem[] = [];
    let dFolders: string[] = [];

    if (view === "recent") {
      dFiles = files.slice(0, 20);
    } else if (view === "dashboard" || view === "files") {
      if (searchTerm) {
        dFiles = files.filter((f) =>
          f.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      } else {
        dFiles = files.filter((f) => (f.folder || "/") === currentPath);

        const uniqueFolders = new Set<string>();
        files.forEach((f) => {
          const fPath = f.folder || "/";
          if (fPath.startsWith(currentPath) && fPath !== currentPath) {
            const relative = fPath.slice(currentPath.length);
            const [segment] = relative.split("/");
            if (segment) uniqueFolders.add(segment);
          }
        });
        dFolders = Array.from(uniqueFolders).sort((a, b) => a.localeCompare(b));
      }
    }

    return { displayFiles: dFiles, displayFolders: dFolders };
  }, [files, view, searchTerm, currentPath]);

  return (
    <FileSystemContext.Provider
      value={{
        files,
        view,
        searchTerm,
        setSearchTerm,
        currentPath,
        setCurrentPath,
        refreshFiles,
        stats,
        handleDelete,
        handleDeleteFolder,
        handleDownload,
        createFolder,
        navigateToFolder,
        displayFiles,
        displayFolders,
        activeOps,
        previewFile,
        setPreviewFile,
        settingsOpen,
        setSettingsOpen,
      }}
    >
      {children}
    </FileSystemContext.Provider>
  );
};
