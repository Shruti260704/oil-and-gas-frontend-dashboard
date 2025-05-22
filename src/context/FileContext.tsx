
import { createContext, useContext, useState, ReactNode } from 'react';
import { FileData } from '../types/files';

interface FileContextType {
  uploadedFiles: FileData[];
  setUploadedFiles: (files: FileData[]) => void;
  activeFile: FileData | null;
  setActiveFile: (file: FileData | null) => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider = ({ children }: { children: ReactNode }) => {
  const [uploadedFiles, setUploadedFiles] = useState<FileData[]>([]);
  const [activeFile, setActiveFile] = useState<FileData | null>(null);

  return (
    <FileContext.Provider value={{ 
      uploadedFiles, 
      setUploadedFiles, 
      activeFile, 
      setActiveFile 
    }}>
      {children}
    </FileContext.Provider>
  );
};

export const useFiles = (): FileContextType => {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
};
