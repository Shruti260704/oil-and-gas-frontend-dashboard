
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
import { Database, File, LineChart, Network, Layers, BarChart, PieChart, FilePlus } from "lucide-react";

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-[1600px]">
        <div className="dashboard-header">
          <h1 className="text-3xl font-bold mb-2">Oil & Gas Data Analytics Dashboard</h1>
          <p className="text-blue-300">Upload and analyze your industry data files for valuable insights</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar - File Upload and List */}
          <div className="lg:col-span-1">
            <Card className="p-4 h-full shadow-lg card-hover card-gradient">
              <div className="flex items-center gap-2 mb-6 border-b pb-4 border-blue-800/30">
                <FilePlus className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-blue-100">Upload Files</h2>
              </div>
              <FileUpload onFileUpload={handleFileUpload} />
              
              {uploadedFiles.length > 0 && (
                <div className="mt-6 glass-card p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2 text-blue-200">
                    <Database className="h-4 w-4 text-primary" /> 
                    Uploaded Files
                  </h3>
                  <div className="max-h-[300px] overflow-y-auto pr-1">
                    <ul className="space-y-2">
                      {uploadedFiles.map((file) => (
                        <li 
                          key={file.id}
                          className={`p-3 rounded-lg cursor-pointer flex justify-between items-center file-item relative ${
                            activeFile?.id === file.id 
                              ? 'selected shadow-md' 
                              : selectedFiles.some(f => f.id === file.id)
                                ? 'bg-blue-900/40 border-blue-700/40'
                                : ''
                          }`}
                          onClick={() => handleFileSelect(file)}
                        >
                          {activeFile?.id === file.id && <span className="selected-indicator"></span>}
                          <span className="truncate flex-1 flex items-center gap-2">
                            <File className="h-4 w-4 text-primary" />
                            {file.name}
                          </span>
                          <button 
                            className={`text-xs px-2 py-1 rounded-full transition-colors duration-200 ${
                              selectedFiles.some(f => f.id === file.id)
                                ? 'bg-primary text-white'
                                : 'bg-blue-900/50 hover:bg-blue-800/60 text-blue-200'
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
                </div>
              )}
            </Card>
          </div>
          
          {/* Main content area */}
          <div className="lg:col-span-3">
            {uploadedFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[500px] empty-state border-blue-800/40">
                <div className="text-center animate-float">
                  <div className="bg-primary/10 p-6 rounded-full mx-auto mb-8 backdrop-blur-sm border border-primary/20">
                    <svg className="mx-auto h-16 w-16 text-primary" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-blue-100 mb-3">Upload Files to Begin</h3>
                  <p className="mt-2 text-blue-300 max-w-sm mx-auto">
                    Upload your data files to analyze trends, visualize information, and gain valuable insights for your oil & gas operations
                  </p>
                </div>
              </div>
            ) : (
              <Tabs defaultValue="visualize" className="w-full tabs-custom">
                <TabsList className="grid grid-cols-4 mb-6 tabs-list">
                  <TabsTrigger value="visualize" className="flex items-center gap-2 text-blue-200">
                    <BarChart className="h-4 w-4" /> Visualization
                  </TabsTrigger>
                  <TabsTrigger value="mindmap" className="flex items-center gap-2 text-blue-200">
                    <Network className="h-4 w-4" /> Mind Map
                  </TabsTrigger>
                  <TabsTrigger value="compare" className="flex items-center gap-2 text-blue-200">
                    <Layers className="h-4 w-4" /> File Comparison
                  </TabsTrigger>
                  <TabsTrigger value="summary" className="flex items-center gap-2 text-blue-200">
                    <PieChart className="h-4 w-4" /> Data Summary
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="visualize">
                  <Card className="p-6 shadow-lg card-hover card-gradient">
                    <div className="flex items-center gap-2 mb-6 border-b pb-4 border-blue-800/30">
                      <BarChart className="h-5 w-5 text-primary" />
                      <h2 className="text-xl font-semibold text-blue-100">Data Visualization</h2>
                    </div>
                    <div className="viz-bg">
                      {activeFile && <DataVisualizer file={activeFile} />}
                    </div>
                  </Card>
                </TabsContent>
                
                <TabsContent value="mindmap">
                  <Card className="p-6 shadow-lg card-hover card-gradient">
                    <div className="flex items-center gap-2 mb-6 border-b pb-4 border-blue-800/30">
                      <Network className="h-5 w-5 text-primary" />
                      <h2 className="text-xl font-semibold text-blue-100">Content Structure</h2>
                    </div>
                    <div className="viz-bg">
                      {activeFile && <MindMap file={activeFile} />}
                    </div>
                  </Card>
                </TabsContent>
                
                <TabsContent value="compare">
                  <Card className="p-6 shadow-lg card-hover card-gradient">
                    <div className="flex items-center gap-2 mb-6 border-b pb-4 border-blue-800/30">
                      <Layers className="h-5 w-5 text-primary" />
                      <h2 className="text-xl font-semibold text-blue-100">File Comparison</h2>
                    </div>
                    <div className="viz-bg">
                      {selectedFiles.length === 2 ? (
                        <FileCompare files={selectedFiles} />
                      ) : (
                        <div className="text-center py-12 bg-blue-950/50 rounded-lg border border-blue-900/30 backdrop-blur-sm">
                          <Layers className="h-16 w-16 text-blue-500/60 mx-auto mb-4" />
                          <p className="text-blue-200 font-medium mb-2">Select two files to compare from the file list</p>
                          <p className="text-sm text-primary font-bold">Currently selected: {selectedFiles.length}/2</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </TabsContent>
                
                <TabsContent value="summary">
                  <Card className="p-6 shadow-lg card-hover card-gradient">
                    <div className="flex items-center gap-2 mb-6 border-b pb-4 border-blue-800/30">
                      <PieChart className="h-5 w-5 text-primary" />
                      <h2 className="text-xl font-semibold text-blue-100">Data Summary</h2>
                    </div>
                    <div className="viz-bg">
                      {activeFile && <DataSummary file={activeFile} />}
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
