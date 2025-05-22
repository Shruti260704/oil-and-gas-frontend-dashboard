
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from './FileUpload';
import MindMap from './MindMap';
import InsightPanel from './InsightPanel';
import FileCompare from './FileCompare';
import { FileData } from '../types/files';
import { useFiles } from '../context/FileContext';
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { File, Network, Layers } from "lucide-react";
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const navigate = useNavigate();
  const { uploadedFiles, setUploadedFiles, activeFile, setActiveFile } = useFiles();
  const [selectedFiles, setSelectedFiles] = useState<FileData[]>([]);

  const handleFileUpload = (newFile: FileData) => {
    setUploadedFiles([...uploadedFiles, newFile]);
    setActiveFile(newFile);
    toast.success(`File "${newFile.name}" uploaded successfully`);
  };
  
  const handleFileSelect = (file: FileData) => {
    setActiveFile(file);
  };
  
  const handleFileCompare = (file: FileData) => {
    if (selectedFiles.some(f => f.id === file.id)) {
      setSelectedFiles(selectedFiles.filter(f => f.id !== file.id));
    } else {
      setSelectedFiles([...selectedFiles, file]);
    }
  };
  
  const handleViewMaps = () => {
    if (activeFile) {
      navigate('/maps', { state: { file: activeFile } });
    } else {
      toast.error("Please select a file first");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-[1600px]">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Data Analysis Dashboard</h1>
          <div className="space-x-2">
            <Button onClick={handleViewMaps} disabled={!activeFile} className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800">
              <Network size={16} />
              <span>Interactive Map</span>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <Card className="shadow-md">
              <div className="p-4 border-b">
                <h2 className="text-xl font-medium text-foreground">Upload Files</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Upload your files for analysis
                </p>
              </div>
              <div className="p-4">
                <FileUpload onFileUpload={handleFileUpload} />
              </div>
            </Card>
            
            <Card className="mt-6 shadow-md">
              <div className="p-4 border-b">
                <h2 className="text-xl font-medium text-foreground">Uploaded Files</h2>
              </div>
              <div className="p-4">
                {uploadedFiles.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    No files uploaded yet
                  </div>
                ) : (
                  <div className="divide-y">
                    {uploadedFiles.map(file => (
                      <div 
                        key={file.id} 
                        className={`
                          p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50
                          ${activeFile?.id === file.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
                        `}
                        onClick={() => handleFileSelect(file)}
                      >
                        <div className="flex items-center space-x-3">
                          <File className="h-5 w-5" />
                          <div>
                            <div className="font-medium">{file.name}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(file.dateUploaded).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
          
          <div className="lg:col-span-9">
            <Card className="shadow-md">
              <Tabs defaultValue="insights" className="w-full">
                <div className="p-4 border-b">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="insights" className="flex items-center gap-2">
                      <Layers size={16} />
                      <span>Insights</span>
                    </TabsTrigger>
                    <TabsTrigger value="mindmap" className="flex items-center gap-2">
                      <Network size={16} />
                      <span>Mind Map</span>
                    </TabsTrigger>
                    <TabsTrigger value="compare" className="flex items-center gap-2">
                      <File size={16} />
                      <span>Compare</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="insights" className="p-0 border-0 m-0">
                  {activeFile ? (
                    <div className="p-4">
                      <InsightPanel file={activeFile} />
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      Please select a file to view insights
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="mindmap" className="p-0 border-0 m-0">
                  {activeFile ? (
                    <div className="p-4">
                      <MindMap file={activeFile} />
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      Please select a file to view mind map
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="compare" className="p-0 border-0 m-0">
                  <div className="p-4">
                    <FileCompare 
                      files={uploadedFiles} 
                      selectedFiles={selectedFiles}
                      onToggleSelection={handleFileCompare}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
