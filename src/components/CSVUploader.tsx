import { useState } from 'react';
import axios from 'axios';
import { LocationData } from './MapComponent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from "sonner";
import { Navigation } from "lucide-react";

interface CSVUploaderProps {
  onDataUploaded: (data: LocationData[]) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://20.151.176.215:8000/api'; // <-- Bas yahan apna backend URL dijiye

const CSVUploader = ({ onDataUploaded }: CSVUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/upload-csv`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Assume backend returns: { locations: LocationData[] }
      if (response.data && response.data.locations) {
        onDataUploaded(response.data.locations);
        toast.success(`Successfully loaded ${response.data.locations.length} locations`);
      } else {
        toast.error("No valid data found in the CSV file");
      }
    } catch (error) {
      toast.error("Failed to process CSV file");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'text/csv') {
        handleFileUpload(file);
      } else {
        toast.error("Please upload a CSV file");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="mb-6">
      <div
        className={`file-upload-area cursor-pointer ${isDragging ? 'bg-blue-950/50 border-primary' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('csv-file-input')?.click()}
      >
        <div className="text-center">
          <Navigation className="h-12 w-12 mx-auto text-primary mb-4" />
          <h3 className="text-lg font-semibold text-blue-100 mb-2">Upload Location Data</h3>
          <p className="text-blue-300 mb-4">
            Drag & drop a CSV file or click to browse
          </p>
          <p className="text-xs text-blue-400">
            Required columns: name, lat, lng, value
          </p>
          <Input
            id="csv-file-input"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      <div className="mt-4 text-sm text-blue-300 p-3 bg-blue-950/40 rounded-md border border-blue-800/30">
        <p className="font-semibold mb-1">CSV Format Example:</p>
        <code className="block bg-blue-900/30 p-2 rounded text-xs">
          name,lat,lng,value<br />
          "Houston Oil Field",29.7604,-95.3698,458<br />
          "Gulf Platform Alpha",28.5383,-89.7824,723<br />
        </code>
      </div>
    </div>
  );
};

export default CSVUploader;


