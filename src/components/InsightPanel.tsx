import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FileData } from '../types/files';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { ChartLine, ChartBar, ChartColumn, ChartPie, FileText, MessageSquare, SendHorizonal, MoreVertical, Star } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://20.151.176.215:8000/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const InsightPanel = ({ file }: { file: FileData }) => {
  // Chat history: { query: string, answer: string, chartData?: any, images?: string[] }
  const [chat, setChat] = useState<{ query: string, answer: string, chartData?: any, images?: string[] }[]>([]);
  const [queryInput, setQueryInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [includeImages, setIncludeImages] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Review state
  const [reviewStars, setReviewStars] = useState<{ [idx: number]: number }>({});
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewedIdx, setReviewedIdx] = useState<number | null>(null);

  // Helper for formatting
  const formatName = (name: string | number, maxLen = 12): string =>
    typeof name === 'string' ? (name.length > maxLen ? `${name.substring(0, maxLen)}...` : name) : String(name);

  // Listen for query events from MindMap component
  useEffect(() => {
    // Handler for the custom event
    const handleAddQuery = (event: any) => {
      const { query } = event.detail;

      if (query && typeof query === 'string') {
        setQueryInput(query);
        // Optionally auto-submit
        handleSubmitQuery(query);
      }
    };

    // Check localStorage on component mount
    const checkLocalStorage = () => {
      try {
        const pendingQuery = localStorage.getItem('pendingQuery');
        const pendingFileId = localStorage.getItem('pendingFileId');

        if (pendingQuery && pendingFileId === file.id) {
          setQueryInput(pendingQuery);
          handleSubmitQuery(pendingQuery);
          // Clear after processing
          localStorage.removeItem('pendingQuery');
          localStorage.removeItem('pendingFileId');
        }
      } catch (err) {
        console.error('Error reading from localStorage:', err);
      }
    };

    // Add event listener
    window.addEventListener('addQuery', handleAddQuery);

    // Check localStorage
    checkLocalStorage();

    // Clean up
    return () => {
      window.removeEventListener('addQuery', handleAddQuery);
    };
  }, [file.id]); // Re-run when file.id changes

  // Separate function to submit a query programmatically
  const handleSubmitQuery = async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/query`, {
        query: query,
        top_k: 100,
        include_images: includeImages,
      });

      // Defensive: try to parse and validate response
      let answer = "No answer available.";
      let chartData = null;
      let images = null;
      try {
        // If response is JSON, use it; else fallback
        if (typeof res.data === "string") {
          // Try to parse string as JSON
          const parsed = JSON.parse(res.data);
          answer = parsed.answer || answer;
          chartData = parsed.charts || null;
          images = parsed.images || null;
        } else {
          answer = res.data.answer || answer;
          chartData = res.data.charts || res.data.chartData || null;
          images = res.data.images || null;
        }
      } catch {
        // If parsing fails, fallback to default error
        answer = "Sorry, could not parse a valid answer from the backend.";
        chartData = null;
        images = null;
      }

      setChat(prev => [
        ...prev,
        {
          query,
          answer,
          chartData,
          images
        }
      ]);

      // Clear input only if it matches the submitted query
      if (queryInput === query) {
        setQueryInput('');
      }
    } catch {
      setChat(prev => [
        ...prev,
        { query, answer: "Sorry, could not fetch an answer from the backend." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Modify the form submit handler to use the common function
  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmitQuery(queryInput);
  };

  // Find last chat with chartData
  const lastChart = [...chat].reverse().find(c => c.chartData && Array.isArray(c.chartData) && c.chartData.length > 0);

  // Chart rendering helpers
  const renderChart = (chart: any, idx: number) => {
    const { chartConfig, data } = chart;
    if (!chartConfig || !data) return null;
    const { type, title, xAxis, yAxis, series } = chartConfig;

    switch (type) {
      case 'line':
        return (
          <Card key={idx} className="bg-blue-950/40 border border-blue-800/30 backdrop-blur-md">
            <CardContent className="p-4">
              <div className="flex items-center mb-4">
                <ChartLine className="h-5 w-5 mr-2 text-blue-400 flex-shrink-0" />
                <h3 className="font-medium text-blue-200 truncate">{title || 'Line Chart'}</h3>
              </div>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5c" />
                    <XAxis
                      dataKey={xAxis?.dataKey || 'index'}
                      label={xAxis?.label ? { value: xAxis.label, position: 'insideBottom', offset: -10, fill: '#8fadc8' } : undefined}
                      stroke="#8fadc8"
                      tick={{ fontSize: 11 }}
                      height={60}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis
                      label={yAxis?.label ? { value: yAxis.label, angle: -90, position: 'insideLeft', fill: '#8fadc8' } : undefined}
                      stroke="#8fadc8"
                      tick={{ fontSize: 11 }}
                      width={60}
                    />
                    <Tooltip contentStyle={{ backgroundColor: '#162a46', border: '1px solid #234876', color: '#a3c2e3' }} />
                    <Legend wrapperStyle={{ color: '#a3c2e3', paddingTop: 10, fontSize: '11px' }} />
                    {series?.map((s: any, i: number) => (
                      <Line
                        key={s.dataKey}
                        type="monotone"
                        dataKey={s.dataKey}
                        stroke={s.stroke || COLORS[i % COLORS.length]}
                        name={formatName(s.name || s.dataKey)}
                        activeDot={{ r: 8 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        );
      case 'bar':
        return (
          <Card key={idx} className="bg-blue-950/40 border border-blue-800/30 backdrop-blur-md">
            <CardContent className="p-4">
              <div className="flex items-center mb-4">
                <ChartBar className="h-5 w-5 mr-2 text-green-400 flex-shrink-0" />
                <h3 className="font-medium text-blue-200 truncate">{title || 'Bar Chart'}</h3>
              </div>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5c" />
                    <XAxis
                      dataKey={xAxis?.dataKey || 'index'}
                      label={xAxis?.label ? { value: xAxis.label, position: 'insideBottom', offset: -10, fill: '#8fadc8' } : undefined}
                      stroke="#8fadc8"
                      tick={{ fontSize: 11 }}
                      height={60}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis
                      label={yAxis?.label ? { value: yAxis.label, angle: -90, position: 'insideLeft', fill: '#8fadc8' } : undefined}
                      stroke="#8fadc8"
                      tick={{ fontSize: 11 }}
                      width={60}
                    />
                    <Tooltip contentStyle={{ backgroundColor: '#162a46', border: '1px solid #234876', color: '#a3c2e3' }} />
                    <Legend wrapperStyle={{ color: '#a3c2e3', paddingTop: 10, fontSize: '11px' }} />
                    {series?.map((s: any, i: number) => (
                      <Bar
                        key={s.dataKey}
                        dataKey={s.dataKey}
                        fill={s.stroke || COLORS[i % COLORS.length]}
                        name={formatName(s.name || s.dataKey)}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        );
      case 'pie':
        return (
          <Card key={idx} className="bg-blue-950/40 border border-blue-800/30 backdrop-blur-md">
            <CardContent className="p-4">
              <div className="flex items-center mb-4">
                <ChartPie className="h-5 w-5 mr-2 text-purple-400 flex-shrink-0" />
                <h3 className="font-medium text-blue-200 truncate">{title || 'Pie Chart'}</h3>
              </div>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey={series?.[0]?.dataKey || 'value'}
                      nameKey={xAxis?.dataKey || 'name'}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      label={({ name, percent }) => {
                        const displayName = typeof name === 'string'
                          ? (name.length > 10 ? `${name.substring(0, 10)}...` : name)
                          : String(name);
                        return `${displayName}: ${(percent * 100).toFixed(0)}%`;
                      }}
                    >
                      {data.map((entry: any, i: number) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
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
        );
      // Add more chart types as needed (e.g., scatter)
      default:
        return null;
    }
  };

  // Review submit handler
  const handleReviewSubmit = async (idx: number, rating: number) => {
    // ⭐️ Pehle hi star fill kar dein
    setReviewStars(prev => ({ ...prev, [idx]: rating }));
    setReviewLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/review`, {
        query: chat[idx].query,
        answer: chat[idx].answer,
        rating,
      });
      setReviewedIdx(idx);
    } catch {
      // Optionally show error
    } finally {
      setReviewLoading(false);
    }
  };

  // File info card
  return (
    <div className="space-y-8">
      {/* File Info */}
      <Card className="bg-blue-950/40 border border-blue-800/30 backdrop-blur-md">
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
          <FileText className="h-8 w-8 text-blue-400 flex-shrink-0" />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <div>
              <h4 className="text-xs font-medium text-blue-300 mb-1">File Name</h4>
              <p className="text-blue-100 truncate" title={file.name}>{file.name}</p>
            </div>
            <div>
              <h4 className="text-xs font-medium text-blue-300 mb-1">File Type</h4>
              <p className="flex items-center text-blue-100">
                <Badge variant="outline" className="mr-2 bg-blue-800/30 text-blue-200 border-blue-700/50">
                  {file.type.toUpperCase()}
                </Badge>
                {file.type}
              </p>
            </div>
            <div>
              <h4 className="text-xs font-medium text-blue-300 mb-1">Uploaded On</h4>
              <p className="text-blue-100 truncate">{file.dateUploaded.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Section */}
      <div>
        <Card className="bg-blue-950/40 border border-blue-800/30 backdrop-blur-md">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <MessageSquare className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
              <h3 className="font-medium text-blue-200 truncate">Ask About This Document</h3>
            </div>
            <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-800/40">
              <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto mb-4">
                {chat.length === 0 && (
                  <div className="text-blue-300 text-sm text-center">No questions asked yet. Start the conversation!</div>
                )}
                {chat.map((item, idx) => (
                  <div key={idx}>
                    {/* User bubble */}
                    <div className="flex justify-end mb-1">
                      <div className="bg-blue-400/90 text-blue-950 px-4 py-2 rounded-lg max-w-[70%] shadow font-medium">
                        <span className="font-semibold">You:</span> {item.query}
                      </div>
                    </div>
                    {/* AI bubble */}
                    <div className="flex justify-start">
                      <div className="bg-emerald-400/90 text-emerald-950 px-4 py-2 rounded-lg max-w-[70%] shadow font-medium">
                        <span className="font-semibold">AI:</span> {item.answer}
                        {/* Show images if present */}
                        {item.images && item.images.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {item.images.map((img: string, i: number) => (
                              <img key={i} src={img} alt="AI generated" className="max-h-40 rounded border" />
                            ))}
                          </div>
                        )}
                        {/* Review stars */}
                        <div className="mt-2 flex items-center gap-1">
                          <span className="text-xs text-blue-900 mr-2">Review:</span>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              disabled={reviewLoading || reviewedIdx === idx}
                              onClick={() => handleReviewSubmit(idx, star)}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`h-5 w-5 ${reviewStars[idx] && star <= reviewStars[idx] ? "text-yellow-400" : "text-blue-300"}`}
                                fill={reviewStars[idx] && star <= reviewStars[idx] ? "#facc15" : "none"}
                              />
                            </button>
                          ))}
                          {reviewedIdx === idx && (
                            <span className="ml-2 text-green-700 text-xs">Thank you for your feedback!</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleQuerySubmit} className="space-y-4">
                <div className="relative flex items-center">
                  <Input
                    placeholder="Ask anything about this document..."
                    value={queryInput}
                    onChange={(e) => setQueryInput(e.target.value)}
                    className="bg-blue-950/50 border-blue-700/50 text-blue-100 placeholder:text-blue-400/70"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isLoading || !queryInput.trim()}
                    className="absolute right-10 top-1/2 -translate-y-1/2 h-8"
                  >
                    {isLoading ? "Processing..." : <SendHorizonal className="h-4 w-4" />}
                  </Button>
                  {/* Three dot menu */}
                  <div className="relative">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowMenu((v) => !v)}
                      tabIndex={-1}
                    >
                      <MoreVertical className="h-5 w-5 text-blue-200" />
                    </Button>
                    {showMenu && (
                      <div
                        ref={menuRef}
                        className="absolute right-0 mt-2 w-48 bg-blue-950 border border-blue-800 rounded shadow-lg z-50 p-3"
                      >
                        <label className="flex items-center gap-2 text-blue-200 text-sm select-none">
                          <input
                            type="checkbox"
                            checked={includeImages}
                            onChange={(e) => setIncludeImages(e.target.checked)}
                          />
                          See image in answer
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Visualization */}
      <div>
        <h3 className="text-lg font-medium mb-4 text-blue-100">Data Visualization</h3>
        {!lastChart ? (
          <div className="text-center py-10">
            <p className="text-gray-300">No visualization data available. Ask a query for graph/image/chart.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {lastChart.chartData.map((chart: any, idx: number) => renderChart(chart, idx))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightPanel;
