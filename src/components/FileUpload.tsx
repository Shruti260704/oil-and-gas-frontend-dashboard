
import React, { useState, ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileData, FileType } from '../types/files';
import { toast } from "sonner";
import { FileText, File, Upload } from "lucide-react";

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
        return <File className="h-5 w-5 text-red-500" />;
      case 'excel':
        return <File className="h-5 w-5 text-green-600" />;
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
            // Adding location data to all file types
            lat: [29.7604, 31.9973, 48.15, 30.2672, 32.7555],
            lng: [-95.3698, -102.0779, -103.5, -97.7431, -97.3308],
            names: ["Houston Field", "Midland Basin", "Bakken Site", "Austin Complex", "Dallas Platform"]
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
            // Location data for maps
            locations: [
              { name: "Gulf Platform Alpha", lat: 28.5383, lng: -89.7824, value: 723 },
              { name: "Permian Basin Site 1", lat: 31.5, lng: -103, value: 845 },
              { name: "Eagle Ford Well 12", lat: 28.3, lng: -99.2, value: 512 },
              { name: "Oklahoma Field 7", lat: 35.4, lng: -97.5, value: 678 },
              { name: "Wyoming Gas Site", lat: 42.8, lng: -108.7, value: 420 }
            ]
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
            // Map coordinates for project locations
            coordinates: [
              [29.7604, -95.3698], // Houston
              [31.9973, -102.0779], // Midland
              [47.5, -101.5], // North Dakota
              [57.05, -111.58], // Alberta Oil Sands
              [19.4, -99.1]  // Mexico City
            ]
          }
        };
      default:
        return {
          topics: ['General Information'],
          summary: 'Generic file content.',
          data: {
            values: [10, 20, 30, 40, 50],
            // Basic location data
            lat: [29.7604, 31.9973],
            lng: [-95.3698, -102.0779],
            names: ["Location A", "Location B"]
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
          
          <div className="mt-4">
            <label htmlFor="file-upload" className="cursor-pointer">
              <Button 
                variant="outline" 
                className="relative shadow-sm hover:shadow-md transition-shadow"
                disabled={isProcessing}
              >
                <span>{isProcessing ? 'Processing...' : 'Browse Files'}</span>
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
    </div>
  );
};

export default FileUpload;
