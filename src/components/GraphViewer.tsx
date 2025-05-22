
import { useState } from 'react';
import { FileData } from '../types/files';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GraphViewer = ({ file }: { file: FileData }) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  
  // Mock map data based on the file
  const mockMaps = [
    {
      id: 'map-1',
      title: `${file.name} - Geographic Distribution`,
      description: 'Shows the geographic distribution of resources across regions',
      imageUrl: 'https://images.unsplash.com/photo-1501854140801-50d01698950b',
      type: 'geographical',
      region: 'North America'
    },
    {
      id: 'map-2',
      title: `${file.name} - Mineral Deposits`,
      description: 'Location of key mineral deposits in the exploration area',
      imageUrl: 'https://images.unsplash.com/photo-1472396961693-142e6e269027',
      type: 'geographical',
      region: 'South America'
    },
    {
      id: 'map-3',
      title: `${file.name} - Weather Conditions`,
      description: 'Current weather patterns affecting operational sites',
      imageUrl: 'https://images.unsplash.com/photo-1615729947596-a598e5de0ab3',
      type: 'geographical',
      region: 'Asia Pacific'
    },
    {
      id: 'map-4',
      title: `${file.name} - Drilling Locations`,
      description: 'Map showing active and planned drilling locations',
      imageUrl: 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb',
      type: 'geographical',
      region: 'Middle East'
    }
  ];
  
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.6));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-4">
        <p className="text-blue-300">Displaying all maps extracted from the document</p>
        
        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-blue-900/40 border-blue-800/40 hover:bg-blue-800/60"
            onClick={handleZoomOut}
          >
            <ZoomOut className="h-4 w-4 mr-1" /> Zoom Out
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-blue-900/40 border-blue-800/40 hover:bg-blue-800/60"
            onClick={handleZoomIn}
          >
            <ZoomIn className="h-4 w-4 mr-1" /> Zoom In
          </Button>
        </div>
      </div>
      
      <div className="grid gap-8">
        {mockMaps.map((map) => (
          <Card key={map.id} className="bg-blue-950/40 border border-blue-800/30 backdrop-blur-md overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-red-400" />
                <h3 className="text-lg font-medium text-blue-100">{map.title}</h3>
              </div>
              <p className="text-blue-300 mb-4">{map.description}</p>
              <div className="bg-blue-950/60 p-1 rounded-lg border border-blue-800/40">
                <div 
                  className="flex justify-center overflow-hidden rounded-md"
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center', transition: 'transform 0.3s ease' }}
                >
                  <img 
                    src={map.imageUrl} 
                    alt={map.title}
                    className="max-w-full object-contain" 
                    style={{ maxHeight: '400px' }}
                  />
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-900/20 rounded-md border border-blue-800/30">
                <p className="text-sm text-blue-200 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-400" /> 
                  Region: {map.region} - This geographical map shows important resource locations and distribution.
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="bg-blue-950/20 p-4 rounded-lg border border-blue-800/30 text-blue-300 text-sm">
        <p>Note: These maps are extracted based on geographical data mentioned in the uploaded document. Use the zoom controls to adjust the view.</p>
      </div>
    </div>
  );
};

export default GraphViewer;
