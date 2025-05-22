
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navigation, ArrowLeft } from 'lucide-react';
import MapComponent, { LocationData } from '../components/MapComponent';
import CSVUploader from '../components/CSVUploader';

const MapSection = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<LocationData[]>([]);
  
  const handleDataUploaded = (data: LocationData[]) => {
    setLocations(data);
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
    <div className="container mx-auto p-4 max-w-[1600px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-blue-100">Interactive Map</h1>
          <div className="bg-blue-900/30 px-2 py-1 rounded-md text-xs text-blue-300 flex items-center gap-1">
            <Navigation className="h-3 w-3" /> Geographical data visualization
          </div>
        </div>
        <Button onClick={handleBackToDashboard}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card className="p-4 h-full shadow-lg card-hover card-gradient">
            <div className="flex items-center gap-2 mb-6 border-b pb-4 border-blue-800/30">
              <Navigation className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-blue-100">Location Data</h2>
            </div>
            
            <CSVUploader onDataUploaded={handleDataUploaded} />
            
            <div className="mt-4 flex flex-col gap-4">
              <Button 
                variant="outline" 
                className="w-full bg-blue-900/40 border-blue-800/40 hover:bg-blue-800/60"
                onClick={loadSampleData}
              >
                Load Sample Data
              </Button>
              
              {locations.length > 0 && (
                <div className="glass-card p-4 rounded-lg mt-2">
                  <h3 className="text-lg font-medium mb-3 text-blue-200">
                    Loaded Locations: {locations.length}
                  </h3>
                  <div className="max-h-[300px] overflow-y-auto pr-1">
                    <ul className="space-y-2">
                      {locations.map((location, index) => (
                        <li 
                          key={index}
                          className="p-3 bg-blue-900/30 rounded-lg border border-blue-800/30 text-sm"
                        >
                          <div className="font-medium text-blue-100">{location.name}</div>
                          <div className="text-blue-300 text-xs mt-1 flex justify-between">
                            <span>{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
                            <span>Value: {location.value}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="p-6 shadow-lg card-hover card-gradient">
            <div className="flex items-center gap-2 mb-6 border-b pb-4 border-blue-800/30">
              <Navigation className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-blue-100">Interactive Map</h2>
            </div>
            
            {locations.length > 0 ? (
              <div className="viz-bg">
                <MapComponent locations={locations} height="600px" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[500px] empty-state border-blue-800/40">
                <div className="text-center animate-float">
                  <div className="bg-primary/10 p-6 rounded-full mx-auto mb-8 backdrop-blur-sm border border-primary/20">
                    <Navigation className="mx-auto h-16 w-16 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-blue-100 mb-3">No Location Data</h3>
                  <p className="mt-2 text-blue-300 max-w-sm mx-auto">
                    Upload a CSV file with location data or use the sample data to start visualizing
                  </p>
                  <Button 
                    onClick={loadSampleData} 
                    className="mt-6"
                    variant="outline"
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
  );
};

export default MapSection;
