
import React from 'react';
import { FileData } from '../types/files';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText } from "lucide-react";
import { Badge } from '@/components/ui/badge';

const DataSummary = ({ file }: { file: FileData }) => {
  const { content } = file;
  
  // Helper function to get statistics for a data array
  const getStatistics = (dataArray: number[] | undefined) => {
    if (!dataArray || dataArray.length === 0) return { min: 'N/A', max: 'N/A', avg: 'N/A' };
    
    const min = Math.min(...dataArray).toFixed(2);
    const max = Math.max(...dataArray).toFixed(2);
    const avg = (dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length).toFixed(2);
    
    return { min, max, avg };
  };

  // Generate key statistics for each data metric
  const getDataMetrics = () => {
    if (!content.data) return [];
    
    return Object.entries(content.data).map(([key, value]) => {
      if (Array.isArray(value)) {
        const stats = getStatistics(value);
        return {
          metric: key,
          stats,
          data: value
        };
      }
      return null;
    }).filter(Boolean);
  };
  
  const dataMetrics = getDataMetrics();
  
  // Generate a type-specific summary based on file type
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
                  {file.type.toUpperCase()}
                </Badge>
                {file.type}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="text-sm font-medium text-gray-500">Uploaded On</h4>
              <p className="mt-1">{file.dateUploaded.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Summary</h4>
            <p className="text-sm bg-blue-50 p-3 rounded">{content.summary}</p>
          </div>
          
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Content Type</h4>
            <p className="text-sm bg-purple-50 p-3 rounded">{getTypeSummary()}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Key Topics</h4>
            <div className="flex flex-wrap gap-2">
              {content.topics.map((topic, index) => (
                <Badge key={index} variant="secondary">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Data Metrics */}
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
