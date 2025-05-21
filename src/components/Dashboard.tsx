import { useState, useRef } from 'react';
import FileUpload from './FileUpload';
import MindMap from './MindMap';
import DataVisualizer from './DataVisualizer';
import FileCompare from './FileCompare';
import DataSummary from './DataSummary';
import { FileData } from '../types/files';
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

const Dashboard = () => {
  const [uploadedFiles, setUploadedFiles] = useState<FileData[]>([]);
  const [activeFile, setActiveFile] = useState<FileData | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileData[]>([]);

  const handleFileUpload = (newFile: FileData) => {
    setUploadedFiles(prev => [...prev, newFile]);
    setActiveFile(newFile);
    toast.success(`File "${newFile.name}" uploaded successfully`);
  };
  
  const handleFileSelect = (file: FileData) => {
    setActiveFile(file);
  };
  
  const handleFileCompare = (file: FileData) => {
    if (selectedFiles.length < 2) {
      // If file is already selected, remove it
      if (selectedFiles.some(f => f.id === file.id)) {
        setSelectedFiles(selectedFiles.filter(f => f.id !== file.id));
      } else {
        // Otherwise add it
        setSelectedFiles(prev => [...prev, file]);
      }
    } else {
      // If already 2 files selected, and trying to add another, replace the first one
      if (!selectedFiles.some(f => f.id === file.id)) {
        setSelectedFiles([selectedFiles[1], file]);
        toast.info("Comparing new selection of files");
      } else {
        // Remove if already selected
        setSelectedFiles(selectedFiles.filter(f => f.id !== file.id));
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-primary">Oil & Gas Data Analytics Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar - File Upload and List */}
        <div className="lg:col-span-1">
          <Card className="p-4 h-full">
            <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
            <FileUpload onFileUpload={handleFileUpload} />
            
            {uploadedFiles.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Uploaded Files</h3>
                <ul className="space-y-2">
                  {uploadedFiles.map((file) => (
                    <li 
                      key={file.id}
                      className={`p-2 rounded-md cursor-pointer flex justify-between items-center ${
                        activeFile?.id === file.id 
                          ? 'bg-primary text-white' 
                          : selectedFiles.some(f => f.id === file.id)
                            ? 'bg-blue-100'
                            : 'hover:bg-gray-100'
                      }`}
                      onClick={() => handleFileSelect(file)}
                    >
                      <span className="truncate flex-1">{file.name}</span>
                      <button 
                        className={`text-xs px-2 py-1 rounded ${
                          selectedFiles.some(f => f.id === file.id)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileCompare(file);
                        }}
                      >
                        {selectedFiles.some(f => f.id === file.id) ? 'Selected' : 'Compare'}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </div>
        
        {/* Main content area */}
        <div className="lg:col-span-3">
          {uploadedFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[500px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center animate-float">
                <svg className="mx-auto h-16 w-16 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mt-4 text-lg font-medium text-gray-600">Upload files to begin analysis</p>
                <p className="mt-2 text-sm text-gray-500">Support for PDF, Excel, PowerPoint, CSV, and more</p>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="visualize" className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="visualize">Visualization</TabsTrigger>
                <TabsTrigger value="mindmap">Mind Map</TabsTrigger>
                <TabsTrigger value="compare">File Comparison</TabsTrigger>
                <TabsTrigger value="summary">Data Summary</TabsTrigger>
              </TabsList>
              
              <TabsContent value="visualize">
                <Card className="p-4">
                  <h2 className="text-xl font-semibold mb-4">Data Visualization</h2>
                  {activeFile && <DataVisualizer file={activeFile} />}
                </Card>
              </TabsContent>
              
              <TabsContent value="mindmap">
                <Card className="p-4">
                  <h2 className="text-xl font-semibold mb-4">Content Structure</h2>
                  {activeFile && <MindMap file={activeFile} />}
                </Card>
              </TabsContent>
              
              <TabsContent value="compare">
                <Card className="p-4">
                  <h2 className="text-xl font-semibold mb-4">File Comparison</h2>
                  {selectedFiles.length === 2 ? (
                    <FileCompare files={selectedFiles} />
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <p>Select two files to compare from the file list</p>
                      <p className="text-sm mt-2">Currently selected: {selectedFiles.length}/2</p>
                    </div>
                  )}
                </Card>
              </TabsContent>
              
              <TabsContent value="summary">
                <Card className="p-4">
                  <h2 className="text-xl font-semibold mb-4">Data Summary</h2>
                  {activeFile && <DataSummary file={activeFile} />}
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
