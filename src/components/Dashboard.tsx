
import { useState } from 'react';
import FileUpload from './FileUpload';
import MindMap from './MindMap';
import DataVisualizer from './DataVisualizer';
import FileCompare from './FileCompare';
import DataSummary from './DataSummary';
import { FileData } from '../types/files';
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Database, FileUp, LineChart, Network, Layers } from "lucide-react";

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
    <div className="container mx-auto p-4 max-w-[1600px]">
      <div className="dashboard-header">
        <h1 className="text-3xl font-bold mb-2">Oil & Gas Data Analytics Dashboard</h1>
        <p className="text-blue-100">Upload and analyze your industry data files for valuable insights</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar - File Upload and List */}
        <div className="lg:col-span-1">
          <Card className="p-4 h-full shadow-md card-hover card-gradient">
            <div className="flex items-center gap-2 mb-4">
              <FileUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Upload Files</h2>
            </div>
            <FileUpload onFileUpload={handleFileUpload} />
            
            {uploadedFiles.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                  <Database className="h-4 w-4" /> 
                  Uploaded Files
                </h3>
                <ul className="space-y-2">
                  {uploadedFiles.map((file) => (
                    <li 
                      key={file.id}
                      className={`p-3 rounded-md cursor-pointer flex justify-between items-center file-item ${
                        activeFile?.id === file.id 
                          ? 'selected shadow-md' 
                          : selectedFiles.some(f => f.id === file.id)
                            ? 'bg-blue-100'
                            : ''
                      }`}
                      onClick={() => handleFileSelect(file)}
                    >
                      <span className="truncate flex-1">{file.name}</span>
                      <button 
                        className={`text-xs px-2 py-1 rounded-full transition-colors duration-200 ${
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
            <div className="flex flex-col items-center justify-center h-[500px] bg-gradient-to-br from-blue-50 to-white rounded-lg border-2 border-dashed border-blue-200">
              <div className="text-center animate-float">
                <div className="bg-blue-100 p-4 rounded-full mx-auto mb-6">
                  <svg className="mx-auto h-16 w-16 text-blue-500" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Upload Files to Begin</h3>
                <p className="mt-2 text-gray-600 max-w-sm mx-auto">
                  Upload your data files to analyze trends, visualize information, and gain valuable insights for your oil & gas operations
                </p>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="visualize" className="w-full tabs-custom">
              <TabsList className="grid grid-cols-4 mb-6 tabs-list">
                <TabsTrigger value="visualize" className="flex items-center gap-2">
                  <LineChart className="h-4 w-4" /> Visualization
                </TabsTrigger>
                <TabsTrigger value="mindmap" className="flex items-center gap-2">
                  <Network className="h-4 w-4" /> Mind Map
                </TabsTrigger>
                <TabsTrigger value="compare" className="flex items-center gap-2">
                  <Layers className="h-4 w-4" /> File Comparison
                </TabsTrigger>
                <TabsTrigger value="summary" className="flex items-center gap-2">
                  <Database className="h-4 w-4" /> Data Summary
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="visualize">
                <Card className="p-6 shadow-md card-hover card-gradient">
                  <div className="flex items-center gap-2 mb-4 border-b pb-3">
                    <LineChart className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Data Visualization</h2>
                  </div>
                  {activeFile && <DataVisualizer file={activeFile} />}
                </Card>
              </TabsContent>
              
              <TabsContent value="mindmap">
                <Card className="p-6 shadow-md card-hover card-gradient">
                  <div className="flex items-center gap-2 mb-4 border-b pb-3">
                    <Network className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Content Structure</h2>
                  </div>
                  {activeFile && <MindMap file={activeFile} />}
                </Card>
              </TabsContent>
              
              <TabsContent value="compare">
                <Card className="p-6 shadow-md card-hover card-gradient">
                  <div className="flex items-center gap-2 mb-4 border-b pb-3">
                    <Layers className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">File Comparison</h2>
                  </div>
                  {selectedFiles.length === 2 ? (
                    <FileCompare files={selectedFiles} />
                  ) : (
                    <div className="text-center py-12 bg-blue-50/50 rounded-lg border border-blue-100">
                      <Layers className="h-12 w-12 text-blue-300 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">Select two files to compare from the file list</p>
                      <p className="text-sm mt-2 text-blue-500 font-bold">Currently selected: {selectedFiles.length}/2</p>
                    </div>
                  )}
                </Card>
              </TabsContent>
              
              <TabsContent value="summary">
                <Card className="p-6 shadow-md card-hover card-gradient">
                  <div className="flex items-center gap-2 mb-4 border-b pb-3">
                    <Database className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Data Summary</h2>
                  </div>
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
