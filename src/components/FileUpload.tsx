import React, { useState, ChangeEvent, useRef } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileData, FileType } from '../types/files';
import { toast } from "sonner";
import { Upload } from "lucide-react";

const API_BASE_URL = import.meta.env.API_BASE_URL || 'http://20.151.176.215:8000/api';
// Maximum file size in bytes (e.g., 100MB)
const MAX_FILE_SIZE = 100 * 1024 * 1024;

const FileUpload = ({ onFileUpload }: { onFileUpload: (file: FileData) => void }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const detectFileType = (fileName: string): FileType => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    if (extension === 'pdf') return 'pdf';
    if (['xlsx', 'xls'].includes(extension)) return 'excel';
    if (['ppt', 'pptx'].includes(extension)) return 'powerpoint';
    if (extension === 'csv') return 'csv';
    return 'other';
  };

  const validateFile = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File size exceeds the limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      return false;
    }
    return true;
  };

  const handleFileUpload = async (file: File) => {
    if (!validateFile(file)) {
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/documents`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
          timeout: 0, // Infinite timeout, request kabhi timeout nahi hogi
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percent);
            }
          }
        }
      );

      const fileType = detectFileType(file.name);
      const fileData: FileData = {
        id: response.data.id, // backend se id aa rahi hai
        name: file.name,
        type: fileType,
        size: file.size,
        dateUploaded: new Date(),
        content: {
          topics: [],
          summary: null,
          data: null
        }
      };

      onFileUpload(fileData);
      toast.success(`File "${file.name}" uploaded successfully`);
    } catch (error: any) {
      console.error("Upload error:", error);

      if (axios.isCancel(error)) {
        toast.error("Upload was cancelled");
      } else if (error.code === "ECONNABORTED") {
        toast.error("Upload timed out. Please try with a smaller file or check your connection.");
      } else if (error.response) {
        // Server responded with an error status
        toast.error(`Upload failed: ${error.response.data?.detail || error.response.status}`);
      } else if (error.request) {
        // Request was made but no response received
        toast.error("No response from server. Please try again later.");
      } else {
        toast.error("Failed to upload file: " + (error.message || "Unknown error"));
      }
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileUpload(file);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFileUpload(file);
      e.target.value = '';
    }
  };

  return (
    <div>
      <div
        className={`file-upload-area ${isDragging ? 'border-blue-400 bg-blue-50' : ''} ${isProcessing ? 'bg-blue-50/50' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <div className={`rounded-full p-3 mb-4 ${isProcessing ? 'bg-blue-100 animate-pulse' : 'bg-blue-100'}`}>
            <Upload className="h-10 w-10 text-blue-500" />
          </div>
          <p className="text-sm font-medium">
            {isProcessing ? 'Processing file...' : 'Drag & Drop files here'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Supports PDF, Excel, PowerPoint, CSV
          </p>
          {isProcessing && (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-2 rounded shadow z-50">
              Processing... This may take a while for large files. Please do not refresh or close the window.
            </div>
          )}
          <div className="mt-4">
            <label htmlFor="file-upload" className="cursor-pointer">
              <Button
                variant="outline"
                className="relative shadow-sm hover:shadow-md transition-shadow"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="w-full text-center">Processing...</span>
                ) : (
                  <span className="w-full text-center">Browse Files</span>
                )}
                {!isProcessing && (
                  <Input
                    id="file-upload"
                    type="file"
                    ref={inputRef}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileInput}
                    accept=".pdf,.xls,.xlsx,.ppt,.pptx,.csv"
                    disabled={isProcessing}
                  />
                )}
              </Button>
            </label>
            {/* Progress bar and percentage */}
            {isProcessing && (
              <div className="w-full mt-3">
                <div className="w-full bg-blue-100 rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="text-xs text-blue-700 mt-1 text-center">
                  Uploading: {uploadProgress}%
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default FileUpload;
