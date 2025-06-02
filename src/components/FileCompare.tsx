import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileData } from '../types/files';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileText } from "lucide-react";

const API_BASE_URL = import.meta.env.API_BASE_URL || 'http://20.151.176.215:8000/api'; // <-- Set your backend URL here

interface FileCompareProps {
  files: FileData[];
  selectedFiles?: FileData[];
  onToggleSelection?: (file: FileData) => void;
}

const FileCompare = ({ files, selectedFiles = [], onToggleSelection }: FileCompareProps) => {
  const [comparison, setComparison] = useState<any>(null);

  // Selection UI (unchanged)
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
              className={`cursor-pointer transition-all ${selectedFiles.some(f => f.id === file.id)
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

  // Fetch comparison from backend when files change
  useEffect(() => {
    if (!file1 || !file2) return;
    setComparison(null); // reset while loading

    axios.post(`${API_BASE_URL}/compare`, {
      file1Id: file1.id,
      file2Id: file2.id
    })
      .then(res => setComparison(res.data))
      .catch(() => setComparison(null));
  }, [file1, file2]);

  // Defensive fallback if backend not ready
  if (!comparison) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Loading comparison...</p>
      </div>
    );
  }

  // Assume backend returns:
  // { topicComparison: [{topic, inFile1, inFile2}], commonDataKeys: [key, ...], chartData: { [key]: [{index, file1: val, file2: val}, ...] } }

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
              {comparison.topicComparison.map((item: any, index: number) => (
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
      {comparison.commonDataKeys.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {comparison.commonDataKeys.map((key: string) => (
            <Card key={key}>
              <CardContent className="p-4">
                <h3 className="font-medium mb-4">Comparison: {key}</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={comparison.chartData[key]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="index" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="file1"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                        name={file1.name}
                      />
                      <Line
                        type="monotone"
                        dataKey="file2"
                        stroke="#82ca9d"
                        name={file2.name}
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
