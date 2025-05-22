import React, { useState } from 'react';
import { FileData } from '../types/files';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartLine, ChartBar, ChartColumn, ChartPie, FileText, MessageSquare, SendHorizonal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const InsightPanel = ({ file }: { file: FileData }) => {
  const [queryInput, setQueryInput] = useState('');
  const [queryResponse, setQueryResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { content } = file;
  const { data, summary } = content;
  
  // Get all keys from data object to determine available metrics
  const dataKeys = Object.keys(data || {});
  
  // Define chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  // Helper function to format label names safely
  const formatName = (name: string | number): string => {
    if (typeof name === 'string') {
      return name.length > 12 ? `${name.substring(0, 12)}...` : name;
    }
    return String(name);
  };
  
  // Transform data for charts
  const transformDataForLineAndBar = () => {
    if (!data || dataKeys.length === 0) return [];
    
    // Get the first data array to determine the number of data points
    const firstDataArray = data[dataKeys[0]];
    if (!Array.isArray(firstDataArray)) return [];
    
    return firstDataArray.map((_, index) => {
      const dataPoint: any = { index };
      dataKeys.forEach(key => {
        if (Array.isArray(data[key])) {
          dataPoint[key] = data[key][index];
        }
      });
      return dataPoint;
    });
  };
  
  const transformDataForPie = () => {
    if (!data || dataKeys.length === 0) return [];
    
    // Use the last value of each data array for the pie chart
    return dataKeys.map((key, index) => {
      const dataArray = data[key];
      const value = Array.isArray(dataArray) 
        ? dataArray[dataArray.length - 1] 
        : 0;
      
      return {
        name: key,
        value,
        color: COLORS[index % COLORS.length]
      };
    });
  };
  
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

  const lineData = transformDataForLineAndBar();
  const barData = transformDataForLineAndBar();
  const pieData = transformDataForPie();
  
  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;
    
    setIsLoading(true);
    
    // Simulate AI response with relevant information from the file
    setTimeout(() => {
      const responses = [
        `Based on the ${file.name} data, the ${dataKeys[0]} metrics show an upward trend over time, with an average value of ${getStatistics(data[dataKeys[0]])?.avg}.`,
        `The analysis of ${file.name} reveals that ${content.topics[0]} is a key factor, with ${dataKeys[1]} showing significant correlation to performance metrics.`,
        `According to the document ${file.name}, the ${content.topics[1]} section indicates potential optimization opportunities in the ${dataKeys[0]} processes.`,
        `The data in ${file.name} suggests that the relationship between ${dataKeys[0]} and ${dataKeys[1]} is critical for improving operational efficiency.`
      ];
      
      setQueryResponse(responses[Math.floor(Math.random() * responses.length)]);
      setIsLoading(false);
    }, 1500);
  };
  
  return (
    <div className="space-y-8">
      {/* Charts Section */}
      <div>
        <h3 className="text-lg font-medium mb-4 text-blue-100">Data Visualization</h3>
        {dataKeys.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-300">No visualization data available for this file</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Line Chart */}
            <Card className="bg-blue-950/40 border border-blue-800/30 backdrop-blur-md">
              <CardContent className="p-4">
                <div className="flex items-center mb-4">
                  <ChartLine className="h-5 w-5 mr-2 text-blue-400 flex-shrink-0" />
                  <h3 className="font-medium text-blue-200 truncate">Trend Analysis</h3>
                </div>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={lineData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5c" />
                      <XAxis 
                        dataKey="index" 
                        stroke="#8fadc8" 
                        tick={{ fontSize: 11 }}
                        height={60}
                        angle={-45}
                        textAnchor="end"
                      />
                      <YAxis stroke="#8fadc8" tick={{ fontSize: 11 }} width={60} />
                      <Tooltip contentStyle={{ backgroundColor: '#162a46', border: '1px solid #234876', color: '#a3c2e3' }} />
                      <Legend wrapperStyle={{ color: '#a3c2e3', paddingTop: 10, fontSize: '11px' }} />
                      {dataKeys.map((key, index) => (
                        <Line 
                          key={key}
                          type="monotone" 
                          dataKey={key} 
                          stroke={COLORS[index % COLORS.length]} 
                          activeDot={{ r: 8 }}
                          name={formatName(key)}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Bar Chart */}
            <Card className="bg-blue-950/40 border border-blue-800/30 backdrop-blur-md">
              <CardContent className="p-4">
                <div className="flex items-center mb-4">
                  <ChartBar className="h-5 w-5 mr-2 text-green-400 flex-shrink-0" />
                  <h3 className="font-medium text-blue-200 truncate">Comparative Analysis</h3>
                </div>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5c" />
                      <XAxis 
                        dataKey="index" 
                        stroke="#8fadc8" 
                        tick={{ fontSize: 11 }}
                        height={60}
                        angle={-45}
                        textAnchor="end"
                      />
                      <YAxis stroke="#8fadc8" tick={{ fontSize: 11 }} width={60} />
                      <Tooltip contentStyle={{ backgroundColor: '#162a46', border: '1px solid #234876', color: '#a3c2e3' }} />
                      <Legend wrapperStyle={{ color: '#a3c2e3', paddingTop: 10, fontSize: '11px' }} />
                      {dataKeys.map((key, index) => (
                        <Bar 
                          key={key} 
                          dataKey={key} 
                          fill={COLORS[index % COLORS.length]} 
                          name={formatName(key)}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Pie Chart */}
            <Card className="bg-blue-950/40 border border-blue-800/30 backdrop-blur-md">
              <CardContent className="p-4">
                <div className="flex items-center mb-4">
                  <ChartPie className="h-5 w-5 mr-2 text-purple-400 flex-shrink-0" />
                  <h3 className="font-medium text-blue-200 truncate">Distribution Analysis</h3>
                </div>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => {
                          // Safely format the name
                          const displayName = typeof name === 'string' 
                            ? (name.length > 10 ? `${name.substring(0, 10)}...` : name)
                            : String(name);
                          return `${displayName}: ${(percent * 100).toFixed(0)}%`;
                        }}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#162a46', border: '1px solid #234876', color: '#a3c2e3' }}
                        formatter={(value, name) => {
                          const formattedName = typeof name === 'string'
                            ? (name.length > 15 ? `${name.substring(0, 15)}...` : name)
                            : String(name);
                          return [value, formattedName];
                        }} 
                      />
                      <Legend 
                        wrapperStyle={{ color: '#a3c2e3', fontSize: '11px' }} 
                        formatter={(value) => {
                          if (typeof value === 'string') {
                            return value.length > 15 ? `${value.substring(0, 15)}...` : value;
                          }
                          return String(value);
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Stacked Column Chart */}
            <Card className="bg-blue-950/40 border border-blue-800/30 backdrop-blur-md">
              <CardContent className="p-4">
                <div className="flex items-center mb-4">
                  <ChartColumn className="h-5 w-5 mr-2 text-orange-400 flex-shrink-0" />
                  <h3 className="font-medium text-blue-200 truncate">Stacked Metric Analysis</h3>
                </div>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5c" />
                      <XAxis 
                        dataKey="index" 
                        stroke="#8fadc8" 
                        tick={{ fontSize: 11 }}
                        height={60}
                        angle={-45}
                        textAnchor="end"
                      />
                      <YAxis stroke="#8fadc8" tick={{ fontSize: 11 }} width={60} />
                      <Tooltip contentStyle={{ backgroundColor: '#162a46', border: '1px solid #234876', color: '#a3c2e3' }} />
                      <Legend wrapperStyle={{ color: '#a3c2e3', paddingTop: 10, fontSize: '11px' }} />
                      {dataKeys.map((key, index) => (
                        <Bar 
                          key={key} 
                          dataKey={key} 
                          stackId="a"
                          fill={COLORS[index % COLORS.length]} 
                          name={formatName(key)}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Summary Section */}
      <div>
        <h3 className="text-lg font-medium mb-4 text-blue-100">Data Summary</h3>
        <Card className="bg-blue-950/40 border border-blue-800/30 backdrop-blur-md">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <FileText className="h-5 w-5 mr-2 text-blue-400 flex-shrink-0" />
              <h3 className="font-medium text-blue-200 truncate">File Overview</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-800/40">
                <h4 className="text-sm font-medium text-blue-300 mb-2">File Name</h4>
                <p className="text-blue-100 truncate" title={file.name}>{file.name}</p>
              </div>
              <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-800/40">
                <h4 className="text-sm font-medium text-blue-300 mb-2">File Type</h4>
                <p className="flex items-center text-blue-100">
                  <Badge variant="outline" className="mr-2 bg-blue-800/30 text-blue-200 border-blue-700/50">
                    {file.type.toUpperCase()}
                  </Badge>
                  {file.type}
                </p>
              </div>
              <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-800/40">
                <h4 className="text-sm font-medium text-blue-300 mb-2">Uploaded On</h4>
                <p className="text-blue-100 truncate">{file.dateUploaded.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium text-blue-300 mb-2">Document Summary</h4>
              <p className="text-blue-100 bg-blue-900/20 p-4 rounded-lg border border-blue-800/30 break-words overflow-hidden">{content.summary}</p>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium text-blue-300 mb-2">Content Type</h4>
              <p className="text-blue-100 bg-blue-900/20 p-4 rounded-lg border border-blue-800/30">{getTypeSummary()}</p>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium text-blue-300 mb-2">Key Topics</h4>
              <div className="flex flex-wrap gap-2">
                {content.topics.map((topic, index) => (
                  <Badge key={index} variant="secondary" className="bg-primary/20 text-blue-100 hover:bg-primary/30 whitespace-normal text-left">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Data Metrics Table */}
            {getDataMetrics().length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-blue-300 mb-3">Data Metrics Summary</h4>
                <div className="bg-blue-900/30 rounded-lg border border-blue-800/30 overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-blue-900/50">
                      <TableRow>
                        <TableHead className="text-blue-200">Metric</TableHead>
                        <TableHead className="text-blue-200">Minimum</TableHead>
                        <TableHead className="text-blue-200">Maximum</TableHead>
                        <TableHead className="text-blue-200">Average</TableHead>
                        <TableHead className="text-blue-200">Data Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getDataMetrics().map((item: any, index) => (
                        <TableRow key={index} className="border-blue-800/30">
                          <TableCell className="font-medium capitalize text-blue-100 max-w-[150px]">
                            <span className="truncate block" title={item.metric}>{item.metric}</span>
                          </TableCell>
                          <TableCell className="text-blue-100">{item.stats.min}</TableCell>
                          <TableCell className="text-blue-100">{item.stats.max}</TableCell>
                          <TableCell className="text-blue-100">{item.stats.avg}</TableCell>
                          <TableCell className="text-blue-100">{item.data.length}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            
            {/* Analysis Notes */}
            <div className="mb-8">
              <h4 className="text-sm font-medium text-blue-300 mb-2">Analysis Notes</h4>
              <ul className="list-disc pl-5 text-blue-100 space-y-1 bg-blue-900/20 p-4 rounded-lg border border-blue-800/30">
                <li>This summary provides an overview of the data contained in the file.</li>
                <li>The statistical values are calculated from the available numerical data.</li>
                <li>For more detailed analysis, use the Mind Map and Comparison tools.</li>
              </ul>
            </div>
            
            {/* Document Query Section */}
            <div className="mt-10 pt-6 border-t border-blue-800/40">
              <div className="flex items-center mb-4">
                <MessageSquare className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
                <h3 className="font-medium text-blue-200 truncate">Ask About This Document</h3>
              </div>
              
              <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-800/40">
                <p className="text-sm text-blue-300 mb-4">
                  Have questions about this document? Ask our AI for insights, summaries, or explanations about the content.
                </p>
                
                <form onSubmit={handleQuerySubmit} className="space-y-4">
                  <div className="relative">
                    <Input
                      placeholder="E.g., What are the key findings in this report?"
                      value={queryInput}
                      onChange={(e) => setQueryInput(e.target.value)}
                      className="bg-blue-950/50 border-blue-700/50 text-blue-100 placeholder:text-blue-400/70"
                    />
                    <Button 
                      type="submit" 
                      size="sm"
                      disabled={isLoading || !queryInput.trim()}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8"
                    >
                      {isLoading ? "Processing..." : <SendHorizonal className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  {queryResponse && (
                    <div className="mt-4 bg-blue-900/40 p-4 rounded-lg border border-blue-700/40 animate-fade-in">
                      <p className="text-blue-100 break-words">{queryResponse}</p>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InsightPanel;
