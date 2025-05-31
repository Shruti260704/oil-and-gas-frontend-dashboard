import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileData } from '../types/files';
import { Card, CardContent } from '@/components/ui/card';
import { ChartLine, ChartBar, ChartColumn, ChartPie } from "lucide-react";
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

const API_BASE_URL = 'http://20.151.176.215:8000/api'; // <-- Set your backend URL here

const DataVisualizer = ({ file }: { file: FileData }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [summary, setSummary] = useState<string>('Loading...');

  useEffect(() => {
    if (!file) return;

    // Example: Fetch metrics from backend (replace '/metrics' with your actual endpoint)
    axios.post(`${API_BASE_URL}/metrics`, { fileId: file.id })
      .then(res => setMetrics(res.data))
      .catch(() => setMetrics(null));

    // Optionally, fetch summary if not already available
    axios.post(`${API_BASE_URL}/query`, {
      query: 'Give me a summary of this file',
      fileId: file.id,
      top_k: 5,
    })
      .then(res => setSummary(res.data.answer || 'No summary available'))
      .catch(() => setSummary('No summary available'));
  }, [file]);

  // Defensive checks
  const data = metrics?.data || {};
  const dataKeys = Object.keys(data);

  // Chart color palette
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Transform data for charts
  const transformDataForLineAndBar = () => {
    if (!data || dataKeys.length === 0) return [];
    const firstDataArray = data[dataKeys[0]];
    if (!Array.isArray(firstDataArray)) return [];
    return firstDataArray.map((_: any, index: number) => {
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

  const lineData = transformDataForLineAndBar();
  const barData = transformDataForLineAndBar();
  const pieData = transformDataForPie();

  // Helper functions for labels
  const formatName = (name: string | number): string => {
    if (typeof name === 'string') {
      return name.length > 12 ? `${name.substring(0, 12)}...` : name;
    }
    return String(name);
  };
  const formatPieLabel = (name: string | number): string => {
    if (typeof name === 'string') {
      return name.length > 5 ? `${name.substring(0, 5)}...` : name;
    }
    return String(name);
  };
  const renderCustomizedPieLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, name } = props;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    if (percent < 0.25) return null;
    const displayName = typeof name === 'string' ? formatPieLabel(name) : String(name);
    return (
      <text 
        x={x} 
        y={y} 
        fill="#888"
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={10}
      >
        {`${displayName}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div>
      <p className="text-gray-600 mb-6 break-words">{summary}</p>
      {dataKeys.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No visualization data available for this file</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center mb-4">
                <ChartLine className="h-5 w-5 mr-2 text-blue-600 flex-shrink-0" />
                <h3 className="font-medium truncate">Trend Analysis</h3>
              </div>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={lineData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="index" 
                      tick={{ fontSize: 12 }}
                      height={60}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis tick={{ fontSize: 12 }} width={60} />
                    <Tooltip />
                    <Legend wrapperStyle={{ paddingTop: 10 }} />
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
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center mb-4">
                <ChartBar className="h-5 w-5 mr-2 text-green-600 flex-shrink-0" />
                <h3 className="font-medium truncate">Comparative Analysis</h3>
              </div>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="index" 
                      tick={{ fontSize: 12 }}
                      height={60}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis tick={{ fontSize: 12 }} width={60} />
                    <Tooltip />
                    <Legend wrapperStyle={{ paddingTop: 10 }} />
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
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center mb-4">
                <ChartPie className="h-5 w-5 mr-2 text-purple-600 flex-shrink-0" />
                <h3 className="font-medium truncate">Distribution Analysis</h3>
              </div>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label={renderCustomizedPieLabel}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [value, name]}
                    />
                    <Legend 
                      formatter={(value) => typeof value === 'string' ? formatPieLabel(value) : String(value)}
                      wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} 
                      layout="horizontal"
                      align="center"
                      verticalAlign="bottom"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          {/* Stacked Column Chart */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center mb-4">
                <ChartColumn className="h-5 w-5 mr-2 text-orange-500 flex-shrink-0" />
                <h3 className="font-medium truncate">Stacked Metric Analysis</h3>
              </div>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="index" 
                      tick={{ fontSize: 12 }}
                      height={60}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis tick={{ fontSize: 12 }} width={60} />
                    <Tooltip />
                    <Legend wrapperStyle={{ paddingTop: 10 }} />
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
  );
};

export default DataVisualizer;
