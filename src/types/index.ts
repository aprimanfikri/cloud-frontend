export interface FileItem {
  name: string;
  size: number;
  type: string;
  folder: string;
  lastModified?: number;
  date?: string;
  uploadedChunks?: UploadChunk[];
}

export interface FolderStat {
  count: number;
  size: number;
  types: {
    image?: number;
    video?: number;
    audio?: number;
    other?: number;
    [key: string]: number | undefined;
  };
  sizes: {
    image?: number;
    video?: number;
    audio?: number;
    other?: number;
    [key: string]: number | undefined;
  };
}

export interface UploadChunk {
  index: number;
  messageId: string;
  url: string;
  iv: string;
  size: number;
}

export interface UploadState {
  files: File[];
  setFiles: (files: File[]) => void;
  uploading: boolean;
  progress: number;
  status: string;
  currentFileIndex: number;
  processQueue: (
    targetFolder?: string,
    filesOverride?: File[],
  ) => Promise<void>;
  cancelQueue: () => void;
  formatBytes: (bytes: number) => string;
}

export interface ActiveOps {
  deleting: Set<string>;
  downloading: Set<string>;
}

export interface FileSystemContextType {
  files: FileItem[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentPath: string;
  setCurrentPath: (path: string) => void;
  refreshFiles: () => void;
  stats: FolderStat;
  handleDelete: (filename: string) => Promise<void>;
  handleDeleteFolder: (folderName: string) => Promise<void>;
  handleDownload: (file: FileItem) => Promise<void>;
  createFolder: (name: string) => void;
  navigateToFolder: (folderName: string) => void;
  displayFiles: FileItem[];
  displayFolders: string[];
  activeOps: ActiveOps;
  view: string;
  previewFile: FileItem | null;
  setPreviewFile: (file: FileItem | null) => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
}
