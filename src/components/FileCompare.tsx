import React, { useEffect, useState } from 'react';
import axios from '../lib/axios';
import { FileData } from '../types/files';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  BarChart, LineChart, PieChart, ScatterChart,
  Line, Bar, Pie, Scatter, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ZAxis
} from 'recharts';
import { FileText, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from '@/components/ui/button';

// Define the shape of the comparison response
interface ComparisonResponse {
  comparison: string;
  similarities: string[];
  differences: string[];
  charts?: Array<{
    chartConfig: {
      type: 'bar' | 'line' | 'pie' | 'scatter';
      title: string;
      xAxis?: { dataKey: string; label: string };
      yAxis?: { label: string };
      zAxis?: { dataKey: string; range: number[] };
      series: Array<{
        dataKey: string;
        name: string;
        stroke?: string;
        fill?: string;
      }>;
      colors?: string[];
    };
    data: any[];
  }>;
}

interface FileCompareProps {
  files: FileData[];
  selectedFiles?: FileData[];
  onToggleSelection?: (file: FileData) => void;
}

// Default colors for charts
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const FileCompare = ({ files, selectedFiles = [], onToggleSelection }: FileCompareProps) => {
  const [comparison, setComparison] = useState<ComparisonResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

  // Determine the files to compare
  const hasExactlyTwoFiles = selectedFiles.length === 2;
  const file1 = hasExactlyTwoFiles ? selectedFiles[0] : null;
  const file2 = hasExactlyTwoFiles ? selectedFiles[1] : null;

  // Load cached comparison from localStorage on mount
  useEffect(() => {
    if (!hasExactlyTwoFiles || !file1 || !file2) return;

    // Create a cache key based on both file IDs (sorted to ensure consistency)
    const cacheKey = `comparison_${[file1.id, file2.id].sort().join('_')}`;

    // Check if we have a cached response
    try {
      const cachedComparison = localStorage.getItem(cacheKey);
      if (cachedComparison) {
        setComparison(JSON.parse(cachedComparison));
        // Store the selected file IDs for cache reference
        setSelectedFileIds([file1.id, file2.id].sort());
        return;
      }
    } catch (err) {
      console.error("Error loading cached comparison:", err);
    }

    // If no cache or error, fetch from server
    fetchComparison(file1, file2);
  }, [hasExactlyTwoFiles, file1, file2]);

  // Function to fetch comparison data from the server
  const fetchComparison = async (fileA: FileData, fileB: FileData) => {
    if (!fileA || !fileB) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(`/compare`, {
        file_id1: fileA.id,
        file_id2: fileB.id
      });

      const comparisonData = res.data as ComparisonResponse;
      setComparison(comparisonData);
      setLoading(false);

      // Store the selected file IDs for cache reference
      setSelectedFileIds([fileA.id, fileB.id].sort());

      // Cache the response in localStorage
      const cacheKey = `comparison_${[fileA.id, fileB.id].sort().join('_')}`;
      localStorage.setItem(cacheKey, JSON.stringify(comparisonData));
    } catch (err) {
      console.error("Error fetching comparison:", err);
      setError("Failed to load comparison data. Please try again.");
      setLoading(false);
    }
  };

  // Function to refresh the comparison (force fetch from server)
  const handleRefreshComparison = () => {
    if (file1 && file2) {
      fetchComparison(file1, file2);
    }
  };

  // Helper function to determine min and max values for better axis scaling
  const getAxisDomain = (dataKey: string, data: any[]) => {
    if (!data || data.length === 0) return [0, 'auto'];

    // Get all values for this data key
    const values = data.map(item => Number(item[dataKey])).filter(val => !isNaN(val));

    if (values.length === 0) return [0, 'auto'];

    // Find min and max
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Add 10% padding to the range
    const padding = (max - min) * 0.1;
    return [min > 0 ? Math.max(0, min - padding) : min - padding, max + padding];
  };

  // Render the appropriate chart based on type
  const renderChart = (chart: ComparisonResponse['charts'][0], chartIndex: number) => {
    const { chartConfig, data } = chart;
    const colors = chartConfig.colors || COLORS;

    switch (chartConfig.type) {
      case 'bar':
        return (
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            {chartConfig.xAxis && (
              <XAxis
                dataKey={chartConfig.xAxis.dataKey}
                label={{ value: chartConfig.xAxis.label, position: 'insideBottom', offset: -5 }}
              />
            )}
            {chartConfig.yAxis && (
              <YAxis
                label={{ value: chartConfig.yAxis.label, angle: -90, position: 'insideLeft' }}
                domain={chartConfig.series.length > 0 ?
                  getAxisDomain(chartConfig.series[0].dataKey, data) :
                  [0, 'auto']}
                allowDataOverflow={false}
              />
            )}
            <Tooltip />
            <Legend />
            {chartConfig.series.map((series, seriesIndex) => (
              <Bar
                key={seriesIndex}
                dataKey={series.dataKey}
                name={series.name}
                fill={series.fill || series.stroke || colors[seriesIndex % colors.length]}
              />
            ))}
          </BarChart>
        );

      case 'line':
        return (
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            {chartConfig.xAxis && (
              <XAxis
                dataKey={chartConfig.xAxis.dataKey}
                label={{ value: chartConfig.xAxis.label, position: 'insideBottom', offset: -5 }}
              />
            )}
            {chartConfig.yAxis && (
              <YAxis
                label={{ value: chartConfig.yAxis.label, angle: -90, position: 'insideLeft' }}
                domain={chartConfig.series.length > 0 ?
                  getAxisDomain(chartConfig.series[0].dataKey, data) :
                  [0, 'auto']}
                allowDataOverflow={false}
              />
            )}
            <Tooltip />
            <Legend />
            {chartConfig.series.map((series, seriesIndex) => (
              <Line
                key={seriesIndex}
                type="monotone"
                dataKey={series.dataKey}
                name={series.name}
                stroke={series.stroke || colors[seriesIndex % colors.length]}
                activeDot={{ r: 8 }}
              />
            ))}
          </LineChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={80}
              dataKey={chartConfig.series[0]?.dataKey}
              nameKey={chartConfig.xAxis?.dataKey || 'name'}
              label={(entry) => entry.name}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );

      case 'scatter':
        return (
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 30, left: 20 }}
          >
            <CartesianGrid />
            {chartConfig.xAxis && (
              <XAxis
                type="number"
                dataKey={chartConfig.xAxis.dataKey}
                name={chartConfig.xAxis.label}
                label={{ value: chartConfig.xAxis.label, position: 'insideBottom', offset: -5 }}
              />
            )}
            {chartConfig.yAxis && (
              <YAxis
                type="number"
                dataKey={chartConfig.series[0]?.dataKey}
                name={chartConfig.yAxis.label}
                label={{ value: chartConfig.yAxis.label, angle: -90, position: 'insideLeft' }}
              />
            )}
            {chartConfig.zAxis && (
              <ZAxis
                type="number"
                dataKey={chartConfig.zAxis.dataKey}
                range={chartConfig.zAxis.range}
              />
            )}
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            {chartConfig.series.map((series, seriesIndex) => (
              <Scatter
                key={seriesIndex}
                name={series.name}
                data={data}
                fill={series.fill || colors[seriesIndex % colors.length]}
              />
            ))}
          </ScatterChart>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full bg-gray-50 rounded-md">
            <p className="text-gray-500">Unsupported chart type: {chartConfig.type}</p>
          </div>
        );
    }
  };

  // Render the file selection UI
  const renderFileSelection = () => {
    return (
      <div className="mb-6">
        <div className="bg-blue-50 p-4 rounded-lg mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-3 text-blue-600" />
          <p className="text-sm">
            Select two files to compare. {selectedFiles.length === 1 && "You've selected 1 file."}
            {selectedFiles.length === 2 && "You've selected 2 files."}
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
              onClick={() => onToggleSelection && onToggleSelection(file)}
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
  };

  // Main render
  return (
    <div>
      {/* Always show file selection UI */}
      {onToggleSelection && renderFileSelection()}

      {/* If two files are selected, show comparison controls */}
      {hasExactlyTwoFiles && file1 && file2 && (
        <div className="flex justify-between items-center mb-6">
          <div className="bg-blue-50 p-4 rounded-lg flex-1 flex items-center">
            <FileText className="h-5 w-5 mr-3 text-blue-600" />
            <p className="text-sm">
              Comparing <span className="font-semibold">{file1.name}</span> with <span className="font-semibold">{file2.name}</span>
            </p>
          </div>
          <Button
            onClick={handleRefreshComparison}
            className="ml-3"
            variant="outline"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Comparison
          </Button>
        </div>
      )}

      {/* Not enough files selected */}
      {!hasExactlyTwoFiles && (
        <div className="text-center py-10">
          <p className="text-gray-500">Select two files to compare</p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-10">
          <div className="animate-pulse mb-2">
            <div className="h-4 bg-blue-200 rounded w-1/4 mx-auto mb-2"></div>
            <div className="h-2 bg-blue-100 rounded w-1/2 mx-auto"></div>
          </div>
          <p className="text-gray-500">Loading comparison...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-center py-10 bg-red-50 rounded-lg border border-red-100 p-4">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-2" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Comparison results - only show if we have comparison data and not loading */}
      {!loading && comparison && hasExactlyTwoFiles && (
        <>
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
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Overall comparison text */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="font-medium mb-4">Overall Comparison</h3>
              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                <p className="text-sm text-gray-700">{comparison.comparison}</p>
              </div>
            </CardContent>
          </Card>

          {/* Similarities and differences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Similarities */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Similarities
                </h3>
                <ul className="space-y-2">
                  {comparison.similarities.map((similarity, index) => (
                    <li key={index} className="bg-green-50 p-3 rounded-lg text-sm border-l-4 border-green-400 text-gray-800">
                      {similarity}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Differences */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  Differences
                </h3>
                <ul className="space-y-2">
                  {comparison.differences.map((difference, index) => (
                    <li key={index} className="bg-blue-50 p-3 rounded-lg text-sm border-l-4 border-blue-400 text-gray-800">
                      {difference}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          {comparison?.charts && comparison.charts.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {comparison.charts.map((chart, chartIndex) => (
                <Card key={chartIndex}>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-4">{chart.chartConfig.title}</h3>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        {renderChart(chart, chartIndex)}
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded">
              <p className="text-gray-500">No charts available for this comparison</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FileCompare;
