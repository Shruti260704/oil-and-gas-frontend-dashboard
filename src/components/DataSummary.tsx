import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileData } from '../types/files';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText } from "lucide-react";
import { Badge } from '@/components/ui/badge';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://20.151.176.215:8000/api'; // <-- Set your backend URL here

const DataSummary = ({ file }: { file: FileData }) => {
  const [summary, setSummary] = useState<string>('Loading...');
  const [topics, setTopics] = useState<string[]>([]);
  const [dataMetrics, setDataMetrics] = useState<any[]>([]);

  useEffect(() => {
    if (!file) return;

    // Fetch summary/insights from backend
    axios.post(`${API_BASE_URL}/query`, {
      query: 'Give me a summary and key topics of this file',
      fileId: file.id,
      top_k: 5,
    })
      .then(res => {
        setSummary(res.data.answer || 'No summary available');
        // If backend returns topics, set them, otherwise leave empty
        if (res.data.topics) setTopics(res.data.topics);
      })
      .catch(() => setSummary('No summary available'));

    // If you have a separate endpoint for metrics, call it here
    // For now, we assume no metrics from backend
    setDataMetrics([]);
  }, [file]);

  // Helper function for file type summary
  const getTypeSummary = () => {
    switch (file.type) {
      case 'pdf':
        return "PDF document with text content and possibly embedded images or tables.";
      case 'excel':
        return "Spreadsheet containing tabular data, possibly with multiple sheets and formulas.";
      case 'csv':
        return "Comma-separated values file containing structured tabular data.";
      case 'powerpoint':
        return "Presentation file containing slides with text, charts, and possibly multimedia elements.";
      default:
        return "Document with generic content structure.";
    }
  };

  return (
    <div>
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center mb-4">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            <h3 className="font-medium">File Overview</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="text-sm font-medium text-gray-500">File Name</h4>
              <p className="mt-1">{file.name}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="text-sm font-medium text-gray-500">File Type</h4>
              <p className="mt-1 flex items-center">
                <Badge variant="outline" className="mr-2">
                  {file.type?.toUpperCase()}
                </Badge>
                {file.type}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="text-sm font-medium text-gray-500">Uploaded On</h4>
              <p className="mt-1">{new Date(file.dateUploaded).toLocaleString()}</p>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Summary</h4>
            <p className="text-sm bg-blue-50 p-3 rounded">{summary}</p>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Content Type</h4>
            <p className="text-sm bg-purple-50 p-3 rounded">{getTypeSummary()}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Key Topics</h4>
            <div className="flex flex-wrap gap-2">
              {topics.length > 0 ? (
                topics.map((topic, index) => (
                  <Badge key={index} variant="secondary">
                    {topic}
                  </Badge>
                ))
              ) : (
                <span className="text-gray-400">No topics available</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Metrics (if you add metrics endpoint in backend) */}
      {dataMetrics.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-4">Data Metrics Summary</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Minimum</TableHead>
                  <TableHead>Maximum</TableHead>
                  <TableHead>Average</TableHead>
                  <TableHead>Data Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataMetrics.map((item: any, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium capitalize">
                      {item.metric}
                    </TableCell>
                    <TableCell>{item.stats.min}</TableCell>
                    <TableCell>{item.stats.max}</TableCell>
                    <TableCell>{item.stats.avg}</TableCell>
                    <TableCell>{item.data.length}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-6 bg-gray-50 p-3 rounded">
              <h4 className="text-sm font-medium mb-2">Analysis Notes</h4>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>This summary provides an overview of the data contained in the file.</li>
                <li>For more detailed analysis, use the Visualization and Comparison tools.</li>
                <li>The statistical values are calculated from the available numerical data.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataSummary;
