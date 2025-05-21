
import React from 'react';
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

const DataVisualizer = ({ file }: { file: FileData }) => {
  const { data, summary } = file.content;
  
  // Get all keys from data object to determine available metrics
  const dataKeys = Object.keys(data || {});
  
  // Define chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
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
  
  const lineData = transformDataForLineAndBar();
  const barData = transformDataForLineAndBar();
  const pieData = transformDataForPie();
  
  return (
    <div>
      <p className="text-gray-600 mb-6">{summary}</p>
      
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
                <ChartLine className="h-5 w-5 mr-2 text-blue-600" />
                <h3 className="font-medium">Trend Analysis</h3>
              </div>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={lineData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="index" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {dataKeys.map((key, index) => (
                      <Line 
                        key={key}
                        type="monotone" 
                        dataKey={key} 
                        stroke={COLORS[index % COLORS.length]} 
                        activeDot={{ r: 8 }}
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
                <ChartBar className="h-5 w-5 mr-2 text-green-600" />
                <h3 className="font-medium">Comparative Analysis</h3>
              </div>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="index" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {dataKeys.map((key, index) => (
                      <Bar 
                        key={key} 
                        dataKey={key} 
                        fill={COLORS[index % COLORS.length]} 
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
                <ChartPie className="h-5 w-5 mr-2 text-purple-600" />
                <h3 className="font-medium">Distribution Analysis</h3>
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
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Stacked Column Chart */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center mb-4">
                <ChartColumn className="h-5 w-5 mr-2 text-orange-500" />
                <h3 className="font-medium">Stacked Metric Analysis</h3>
              </div>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="index" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {dataKeys.map((key, index) => (
                      <Bar 
                        key={key} 
                        dataKey={key} 
                        stackId="a"
                        fill={COLORS[index % COLORS.length]} 
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
