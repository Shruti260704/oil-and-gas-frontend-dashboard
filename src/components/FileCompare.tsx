
import React from 'react';
import { FileData } from '../types/files';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileText } from "lucide-react";

interface FileCompareProps {
  files: FileData[];
  selectedFiles?: FileData[];
  onToggleSelection?: (file: FileData) => void;
}

const FileCompare = ({ files, selectedFiles = [], onToggleSelection }: FileCompareProps) => {
  // If we're in selection mode (onToggleSelection provided), show file selection UI
  if (onToggleSelection && files.length > 0 && selectedFiles.length < 2) {
    return (
      <div>
        <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-center">
          <FileText className="h-5 w-5 mr-3 text-blue-600" />
          <p className="text-sm">
            Select two files to compare. {selectedFiles.length === 1 && "You've selected 1 file."}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map(file => (
            <Card 
              key={file.id} 
              className={`cursor-pointer transition-all ${
                selectedFiles.some(f => f.id === file.id) 
                  ? 'ring-2 ring-blue-500 shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => onToggleSelection(file)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5" />
                  <div>
                    <div className="font-medium">{file.name}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(file.dateUploaded).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (files.length !== 2) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Select two files to compare</p>
      </div>
    );
  }

  const [file1, file2] = files;
  
  // Function to compare file content
  const compareContent = () => {
    // Compare topics
    const uniqueTopics = new Set([
      ...(file1.content.topics || []),
      ...(file2.content.topics || [])
    ]);
    
    const topicComparison = Array.from(uniqueTopics).map(topic => ({
      topic,
      inFile1: file1.content.topics.includes(topic),
      inFile2: file2.content.topics.includes(topic),
    }));
    
    return { topicComparison };
  };
  
  // Function to get common data keys that exist in both files
  const getCommonDataKeys = () => {
    if (!file1.content.data || !file2.content.data) return [];
    
    const keys1 = Object.keys(file1.content.data);
    const keys2 = Object.keys(file2.content.data);
    
    return keys1.filter(key => keys2.includes(key));
  };
  
  // Prepare comparison data
  const { topicComparison } = compareContent();
  const commonDataKeys = getCommonDataKeys();
  
  // Prepare chart data for comparison
  const prepareChartData = (key: string) => {
    if (!file1.content.data?.[key] || !file2.content.data?.[key]) return [];
    
    const data1 = file1.content.data[key];
    const data2 = file2.content.data[key];
    
    if (!Array.isArray(data1) || !Array.isArray(data2)) return [];
    
    // Create comparison data points
    const maxLength = Math.max(data1.length, data2.length);
    const chartData = [];
    
    for (let i = 0; i < maxLength; i++) {
      chartData.push({
        index: i,
        [file1.name]: data1[i] !== undefined ? data1[i] : null,
        [file2.name]: data2[i] !== undefined ? data2[i] : null,
      });
    }
    
    return chartData;
  };
  
  return (
    <div>
      <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-center">
        <FileText className="h-5 w-5 mr-3 text-blue-600" />
        <p className="text-sm">
          Comparing <span className="font-semibold">{file1.name}</span> with <span className="font-semibold">{file2.name}</span>
        </p>
      </div>
      
      {/* Basic file information comparison */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <h3 className="font-medium mb-4">Basic Information</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>{file1.name}</TableHead>
                <TableHead>{file2.name}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>File type</TableCell>
                <TableCell>{file1.type}</TableCell>
                <TableCell>{file2.type}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>File size</TableCell>
                <TableCell>{(file1.size / 1024).toFixed(2)} KB</TableCell>
                <TableCell>{(file2.size / 1024).toFixed(2)} KB</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Upload date</TableCell>
                <TableCell>{new Date(file1.dateUploaded).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(file2.dateUploaded).toLocaleDateString()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Topic comparison */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <h3 className="font-medium mb-4">Content Topic Comparison</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Topic</TableHead>
                <TableHead>{file1.name}</TableHead>
                <TableHead>{file2.name}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topicComparison.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.topic}</TableCell>
                  <TableCell>
                    {item.inFile1 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Present
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        Not found
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.inFile2 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Present
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        Not found
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Data comparison charts */}
      {commonDataKeys.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {commonDataKeys.map(key => (
            <Card key={key}>
              <CardContent className="p-4">
                <h3 className="font-medium mb-4">Comparison: {key}</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={prepareChartData(key)}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="index" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey={file1.name} 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey={file2.name} 
                        stroke="#82ca9d" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 bg-gray-50 rounded">
          <p className="text-gray-500">No common data metrics found for comparison</p>
        </div>
      )}
    </div>
  );
};

export default FileCompare;
