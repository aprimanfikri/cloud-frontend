"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import axios from "axios";
import axiosRetry from "axios-retry";
import { toast } from "sonner";
import { UploadState, UploadChunk } from "../types";
import { useFileSystem } from "./FileSystemContext";

axiosRetry(axios, {
  retries: 3,
  retryDelay: (retryCount) => {
    return axiosRetry.exponentialDelay(retryCount);
  },
  retryCondition: (error) => {
    return axiosRetry.isNetworkError(error);
  },
});

const API = process.env.NEXT_PUBLIC_API_URL;

const getOptimalChunkSize = (size: number) => {
  if (size < 200 * 1024 * 1024) return 2 * 1024 * 1024;
  if (size < 1024 * 1024 * 1024) return 8 * 1024 * 1024;
  if (size < 2 * 1024 * 1024 * 1024) return 15 * 1024 * 1024;
  return 20 * 1024 * 1024;
};

const UploadContext = createContext<UploadState | null>(null);

export const useUpload = () => {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error("useUpload must be used within an UploadProvider");
  }
  return context;
};

export const UploadProvider = ({ children }: { children: React.ReactNode }) => {
  const { refreshFiles } = useFileSystem();

  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Idle");
  const lastUpdateRef = useRef(0);
  const lastBytesRef = useRef(0);
  const smoothedSpeedRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || seconds < 0) return "--";
    if (seconds < 60) return `${Math.ceil(seconds)}s`;
    const m = Math.floor(seconds / 60);
    const s = Math.ceil(seconds % 60);
    return `${m}m ${s}s`;
  };

  const getResumeKey = (file: File) =>
    `xfrhk_resume_${file.name}_${file.size}_${file.lastModified}`;

  const handleCancel = () => {
    if (
      abortControllerRef.current &&
      !abortControllerRef.current.signal.aborted
    ) {
      abortControllerRef.current.abort();
      setStatus("Cancelling...");
    }
  };

  const uploadSingleFile = async (
    file: File & { uploadedChunks?: UploadChunk[] },
    index: number,
    total: number,
    targetFolder = "/",
  ) => {
    const chunkSize = getOptimalChunkSize(file.size);
    const resumeKey =
      getResumeKey(file) +
      `_${targetFolder === "/" ? "root" : targetFolder.replace(/\//g, "-")}`;

    let storedChunks: UploadChunk[] = [];
    try {
      const stored = localStorage.getItem(resumeKey);
      if (stored) storedChunks = JSON.parse(stored);
    } catch (e) {
      console.error("Resume Load Error:", e);
    }

    const completedIndices = new Set(storedChunks.map((c) => c.index));
    const uploadedChunks = [...storedChunks];
    let totalUploadedBytes = storedChunks.reduce((acc, c) => acc + c.size, 0);

    setStatus(
      storedChunks.length > 0
        ? `Resuming ${file.name}...`
        : `Starting ${file.name}...`,
    );
    setProgress(
      storedChunks.length > 0
        ? Math.round((totalUploadedBytes / file.size) * 100)
        : 0,
    );

    const startTime = Date.now();
    lastUpdateRef.current = startTime;
    lastBytesRef.current = totalUploadedBytes;
    smoothedSpeedRef.current = 0;

    const totalChunks = Math.ceil(file.size / chunkSize);
    const poolLimit = 1;

    const activePromises = new Set<Promise<UploadChunk>>();
    const activeChunkProgress: Record<number, number> = {};

    const updateRealTimeProgress = () => {
      if (abortControllerRef.current?.signal.aborted) return;
      const activeBytes = Object.values(activeChunkProgress).reduce(
        (sum, val) => sum + val,
        0,
      );
      const currentTotalBytes = totalUploadedBytes + activeBytes;

      let pct = Math.round((currentTotalBytes / file.size) * 100);
      if (pct >= 100) pct = 99;
      setProgress(pct);

      const now = Date.now();
      const timeDiff = now - lastUpdateRef.current;

      if (timeDiff >= 200) {
        const bytesDiff = currentTotalBytes - lastBytesRef.current;
        const secondsDiff = timeDiff / 1000;

        if (secondsDiff > 0) {
          const instantSpeed = bytesDiff / secondsDiff;
          const smoothSpeed =
            smoothedSpeedRef.current * 0.8 + instantSpeed * 0.2;
          smoothedSpeedRef.current = smoothSpeed;

          const remainingBytes = file.size - currentTotalBytes;
          const etaSeconds = smoothSpeed > 0 ? remainingBytes / smoothSpeed : 0;

          setStatus(
            `${formatBytes(currentTotalBytes)} / ${formatBytes(file.size)} • ${formatBytes(smoothSpeed)}/s • ${formatTime(etaSeconds)}`,
          );
        }

        lastUpdateRef.current = now;
        lastBytesRef.current = currentTotalBytes;
      }
    };

    const uploadChunk = async (i: number): Promise<UploadChunk> => {
      const signal = abortControllerRef.current?.signal;
      if (signal?.aborted) throw new axios.Cancel("Aborted");

      const start = i * chunkSize;
      const end = Math.min(file.size, start + chunkSize);
      const chunkBlob = file.slice(start, end);

      const formData = new FormData();
      formData.append("file", chunkBlob, `part-${i}_${file.name}`);

      try {
        const res = await axios.post(`${API}/upload/chunk`, formData, {
          signal,
          onUploadProgress: (progressEvent) => {
            if (signal?.aborted) return;
            if (progressEvent.loaded) {
              activeChunkProgress[i] = progressEvent.loaded;
              updateRealTimeProgress();
            }
          },
        });

        if (signal?.aborted) throw new axios.Cancel("Aborted");

        totalUploadedBytes += chunkBlob.size;
        delete activeChunkProgress[i];
        updateRealTimeProgress();

        const result: UploadChunk = {
          index: i,
          messageId: res.data.messageId,
          url: res.data.url,
          iv: res.data.iv,
          size: res.data.size,
        };

        uploadedChunks.push(result);
        file.uploadedChunks = [...uploadedChunks];

        localStorage.setItem(resumeKey, JSON.stringify(uploadedChunks));
        return result;
      } catch (err) {
        delete activeChunkProgress[i];
        throw err;
      }
    };

    for (let i = 0; i < totalChunks; i++) {
      if (abortControllerRef.current?.signal.aborted)
        throw new axios.Cancel("Queue Aborted");
      if (completedIndices.has(i)) continue;

      const p = uploadChunk(i);
      activePromises.add(p);
      p.finally(() => activePromises.delete(p));

      if (activePromises.size >= poolLimit) {
        await Promise.race(activePromises);
      }
    }

    await Promise.all(activePromises);

    if (abortControllerRef.current?.signal.aborted)
      throw new axios.Cancel("Queue Aborted");

    uploadedChunks.sort((a, b) => a.index - b.index);
    setStatus("Finalizing...");

    await axios.post(
      `${API}/upload/finalize`,
      {
        filename: file.name,
        totalSize: file.size,
        type: file.type || file.name.split(".").pop(),
        folder: targetFolder,
        chunks: uploadedChunks,
        iv: null,
      },
      { signal: abortControllerRef.current?.signal },
    );

    localStorage.removeItem(resumeKey);
  };

  const processQueue = async (
    targetFolder = "/",
    filesOverride: File[] | null = null,
  ) => {
    const queue = filesOverride || files;
    if (queue.length === 0) return;

    if (filesOverride) setFiles(filesOverride);

    setUploading(true);
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      for (let i = 0; i < queue.length; i++) {
        if (signal.aborted) throw new axios.Cancel("Queue Aborted");
        setCurrentFileIndex(i);
        await uploadSingleFile(queue[i], i, queue.length, targetFolder);
      }

      setStatus("Done");
      setFiles([]);
      setProgress(100);
      refreshFiles();
      toast.success("All uploads finished");
    } catch (err) {
      if (axios.isCancel(err) || signal.aborted) {
        setStatus("Cancelled");
        toast.info("Upload Stopped");
        const messageIds = queue
          .flatMap(
            (f: File & { uploadedChunks?: UploadChunk[] }) =>
              f.uploadedChunks || [],
          )
          .map((c) => c.messageId);
        if (messageIds.length > 0) {
          console.log(
            `[Cleanup] User cancelled. Cleaning up ${messageIds.length} chunks...`,
          );
          axios
            .delete(`${API}/upload/cancel`, {
              data: { messageIds },
            })
            .catch((e) => console.error("Cleanup failed:", e));
        }
      } else {
        setStatus("Error");
        console.error(err);
        toast.error("Upload failed");
      }
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (uploading) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [uploading]);

  return (
    <UploadContext.Provider
      value={{
        files,
        setFiles,
        uploading,
        progress,
        status,
        currentFileIndex,
        processQueue,
        cancelQueue: handleCancel,
        formatBytes,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
};
