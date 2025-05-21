
import React, { useState, ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileData, FileType } from '../types/files';
import { toast } from "sonner";
import { FileText, FilePdf, FileExcel, FilePlus, Upload } from "lucide-react";

const FileUpload = ({ onFileUpload }: { onFileUpload: (file: FileData) => void }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
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

  const getFileIcon = (fileType: FileType) => {
    switch (fileType) {
      case 'pdf':
        return <FilePdf className="h-5 w-5 text-red-500" />;
      case 'excel':
        return <FileExcel className="h-5 w-5 text-green-600" />;
      case 'csv':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'powerpoint':
        return <FileText className="h-5 w-5 text-orange-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const processFile = (file: File) => {
    setIsProcessing(true);
    
    // Mock processing of the file - in a real app, this would involve parsing
    const fileType = detectFileType(file.name);
    
    // Generate some mock data based on file type
    setTimeout(() => {
      const mockData: FileData = {
        id: `file-${Date.now()}`,
        name: file.name,
        type: fileType,
        size: file.size,
        dateUploaded: new Date(),
        content: generateMockContent(fileType),
      };
      
      onFileUpload(mockData);
      setIsProcessing(false);
    }, 1500);
  };
  
  const generateMockContent = (fileType: FileType) => {
    // Generate mock content based on file type
    switch (fileType) {
      case 'pdf':
        return {
          topics: ['Drilling Operations', 'Reservoir Analysis', 'Safety Protocols'],
          summary: 'This document covers drilling procedures and safety protocols for offshore operations.',
          data: {
            drillingDepth: [1000, 1500, 2000, 2500, 3000],
            pressure: [200, 250, 300, 350, 400],
            temperature: [50, 60, 70, 80, 90],
          }
        };
      case 'excel':
      case 'csv':
        return {
          topics: ['Production Data', 'Well Performance', 'Cost Analysis'],
          summary: 'Monthly production metrics across multiple wells with associated costs and performance indicators.',
          data: {
            production: [5000, 5200, 4800, 5100, 5300],
            costs: [15000, 14500, 16000, 15500, 14800],
            efficiency: [0.92, 0.94, 0.91, 0.93, 0.95],
          }
        };
      case 'powerpoint':
        return {
          topics: ['Quarterly Results', 'New Projects', 'Market Analysis'],
          summary: 'Presentation on quarterly business performance and upcoming exploration projects.',
          data: {
            revenue: [2.1, 2.3, 2.0, 2.4],
            expenses: [1.5, 1.6, 1.7, 1.5],
            profits: [0.6, 0.7, 0.3, 0.9],
          }
        };
      default:
        return {
          topics: ['General Information'],
          summary: 'Generic file content.',
          data: {
            values: [10, 20, 30, 40, 50]
          }
        };
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };
  
  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  return (
    <div>
      <div
        className={`file-upload-area ${isDragging ? 'border-blue-400 bg-blue-50' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <Upload className="h-10 w-10 text-blue-500 mb-4" />
          <p className="text-sm font-medium">
            {isProcessing ? 'Processing file...' : 'Drag & Drop files here'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Supports PDF, Excel, PowerPoint, CSV
          </p>
          
          <div className="mt-4">
            <label htmlFor="file-upload" className="cursor-pointer">
              <Button 
                variant="outline" 
                className="relative"
                disabled={isProcessing}
              >
                <span>Browse Files</span>
                <Input
                  id="file-upload"
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileInput}
                  accept=".pdf,.xls,.xlsx,.ppt,.pptx,.csv"
                  disabled={isProcessing}
                />
              </Button>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">Supported File Types:</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 text-xs p-1.5 bg-gray-50 rounded">
            <FilePdf className="h-4 w-4 text-red-500" /> PDF Documents
          </div>
          <div className="flex items-center gap-2 text-xs p-1.5 bg-gray-50 rounded">
            <FileExcel className="h-4 w-4 text-green-600" /> Excel Spreadsheets
          </div>
          <div className="flex items-center gap-2 text-xs p-1.5 bg-gray-50 rounded">
            <FileText className="h-4 w-4 text-orange-500" /> PowerPoint Slides
          </div>
          <div className="flex items-center gap-2 text-xs p-1.5 bg-gray-50 rounded">
            <FileText className="h-4 w-4 text-blue-500" /> CSV Data Files
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
