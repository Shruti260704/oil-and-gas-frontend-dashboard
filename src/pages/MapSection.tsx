
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFiles } from '../context/FileContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navigation, ArrowLeft } from 'lucide-react';
import MapComponent, { LocationData } from '../components/MapComponent';
import { FileData } from '../types/files';

const MapSection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeFile, uploadedFiles } = useFiles();
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [currentFile, setCurrentFile] = useState<FileData | null>(null);
  
  useEffect(() => {
    // Handle data from the file that was passed from the dashboard
    const fileData = location.state?.file || activeFile;
    if (fileData) {
      setCurrentFile(fileData);
      extractMapDataFromFile(fileData);
    }
  }, [location.state, activeFile]);
  
  const extractMapDataFromFile = (file: FileData) => {
    // Extract location data from the file content if it exists
    try {
      let extractedLocations: LocationData[] = [];
      
      // Check if file has location data in its content
      if (file.content && file.content.data) {
        // Try to extract location data based on file type and content structure
        if (file.type === 'csv' && Array.isArray(file.content.data.locations)) {
          // Direct CSV format with locations array
          extractedLocations = file.content.data.locations;
        } else if (file.content.data.lat && file.content.data.lng) {
          // Data has parallel arrays for lat/lng values
          const names = Array.isArray(file.content.data.names) ? file.content.data.names : 
                      Array(file.content.data.lat.length).fill('').map((_, i) => `Location ${i+1}`);
          
          const values = Array.isArray(file.content.data.values) ? file.content.data.values : 
                        Array(file.content.data.lat.length).fill(0).map(() => Math.floor(Math.random() * 500) + 100);
          
          extractedLocations = file.content.data.lat.map((lat: number, index: number) => ({
            name: names[index] || `Location ${index+1}`,
            lat: lat,
            lng: file.content.data.lng[index],
            value: values[index] || Math.floor(Math.random() * 500) + 100
          }));
        } else if (file.content.data.coordinates) {
          // Data has coordinates array with [lat, lng] format
          extractedLocations = file.content.data.coordinates.map((coord: [number, number], index: number) => ({
            name: `Location ${index+1}`,
            lat: coord[0],
            lng: coord[1],
            value: Math.floor(Math.random() * 500) + 100
          }));
        }
      }
      
      if (extractedLocations.length > 0) {
        setLocations(extractedLocations);
      } else {
        // If no location data found, load sample data
        loadSampleData();
      }
    } catch (error) {
      console.error("Error extracting map data:", error);
      loadSampleData();
    }
  };
  
  const handleBackToDashboard = () => {
    navigate('/');
  };

  // Sample location data for demonstration
  const loadSampleData = () => {
    const sampleLocations: LocationData[] = [
      { name: "Houston Oil Field", lat: 29.7604, lng: -95.3698, value: 458 },
      { name: "Gulf Platform Alpha", lat: 28.5383, lng: -89.7824, value: 723 },
      { name: "Midland Basin", lat: 31.9973, lng: -102.0779, value: 612 },
      { name: "Permian Basin", lat: 31.5, lng: -103, value: 845 },
      { name: "Bakken Formation", lat: 48.15, lng: -103.5, value: 567 }
    ];
    
    setLocations(sampleLocations);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 text-white p-6">
      <div className="container mx-auto p-4 max-w-[1600px]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">Interactive Map</h1>
            <div className="bg-blue-800/70 px-3 py-1.5 rounded-md text-sm text-blue-100 flex items-center gap-2 border border-blue-700/50">
              <Navigation className="h-4 w-4" /> Geographical data visualization
            </div>
          </div>
          <Button 
            onClick={handleBackToDashboard}
            className="bg-blue-800 hover:bg-blue-700 text-white border border-blue-700/50 shadow-lg"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card className="p-4 h-full shadow-xl bg-blue-800/40 border-blue-600/30 text-white backdrop-blur-md">
              <div className="flex items-center gap-2 mb-6 border-b pb-4 border-blue-600/30">
                <Navigation className="h-5 w-5 text-blue-300" />
                <h2 className="text-xl font-semibold text-white">Location Data</h2>
              </div>
              
              <div className="mb-6">
                {currentFile ? (
                  <div className="bg-blue-900/70 p-4 rounded-lg mb-4 border border-blue-700/50">
                    <h3 className="font-medium text-blue-100 mb-1">Current File</h3>
                    <p className="text-white text-sm truncate" title={currentFile.name}>{currentFile.name}</p>
                  </div>
                ) : (
                  <div className="bg-blue-900/70 p-4 rounded-lg mb-4 border border-blue-700/50 text-center">
                    <p className="text-sm text-blue-100">No file selected</p>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full bg-blue-700/40 border-blue-600/40 hover:bg-blue-700/60 mb-3 text-white"
                  onClick={loadSampleData}
                >
                  Load Sample Data
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full bg-blue-700/40 border-blue-600/40 hover:bg-blue-700/60 text-white"
                  onClick={handleBackToDashboard}
                >
                  Select Different File
                </Button>
              </div>
              
              {locations.length > 0 && (
                <div className="bg-blue-900/70 p-4 rounded-lg mt-4 border border-blue-700/50">
                  <h3 className="text-lg font-medium mb-3 text-white">
                    Loaded Locations: {locations.length}
                  </h3>
                  <div className="max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    <ul className="space-y-3">
                      {locations.map((location, index) => (
                        <li 
                          key={index}
                          className="p-3 bg-blue-800/50 rounded-lg border border-blue-700/40 text-sm hover:bg-blue-800/80 transition-colors"
                        >
                          <div className="font-medium text-white truncate" title={location.name}>{location.name}</div>
                          <div className="text-blue-200 text-xs mt-2 flex justify-between items-center gap-1">
                            <span className="truncate">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
                            <span className="bg-blue-700/60 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">Value: {location.value}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="p-6 shadow-xl bg-blue-800/40 border-blue-600/30 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-6 border-b pb-4 border-blue-600/30">
                <Navigation className="h-5 w-5 text-blue-300" />
                <h2 className="text-xl font-semibold text-white">Interactive Map</h2>
              </div>
              
              {locations.length > 0 ? (
                <div className="bg-blue-900/40 rounded-lg p-4 border border-blue-700/30 shadow-inner">
                  <MapComponent locations={locations} height="600px" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[500px] bg-blue-900/40 border border-blue-700/30 rounded-lg">
                  <div className="text-center animate-float">
                    <div className="bg-blue-800/50 p-6 rounded-full mx-auto mb-8 backdrop-blur-sm border border-blue-700/40">
                      <Navigation className="mx-auto h-16 w-16 text-blue-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">No Location Data</h3>
                    <p className="mt-2 text-blue-200 max-w-sm mx-auto">
                      Select a file with location data or use the sample data to start visualizing
                    </p>
                    <Button 
                      onClick={loadSampleData} 
                      className="mt-6 bg-blue-700 hover:bg-blue-600 text-white border border-blue-600/50"
                    >
                      Load Sample Data
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapSection;
