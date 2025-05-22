
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileData } from '../types/files';
import { MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import GraphViewer from '../components/GraphViewer';

const GraphSection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [file, setFile] = useState<FileData | null>(null);
  
  useEffect(() => {
    // Get file data from state, if it exists
    if (location.state?.file) {
      setFile(location.state.file);
    }
  }, [location.state]);

  const handleBackToDashboard = () => {
    navigate('/');
  };

  return (
    <div className="container mx-auto p-4 max-w-[1600px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-blue-100">Maps</h1>
          <div className="bg-blue-900/30 px-2 py-1 rounded-md text-xs text-blue-300 flex items-center gap-1">
            <MapPin className="h-3 w-3" /> Geographical information visualized
          </div>
        </div>
        <Button onClick={handleBackToDashboard}>
          Back to Dashboard
        </Button>
      </div>

      {file ? (
        <Card className="p-6 shadow-lg card-hover card-gradient">
          <div className="flex items-center gap-2 mb-6 border-b pb-4 border-blue-800/30">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-blue-100">Maps from {file.name}</h2>
          </div>
          <div className="viz-bg">
            <GraphViewer file={file} />
          </div>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center h-[500px] empty-state border-blue-800/40">
          <div className="text-center animate-float">
            <div className="bg-primary/10 p-6 rounded-full mx-auto mb-8 backdrop-blur-sm border border-primary/20">
              <MapPin className="mx-auto h-16 w-16 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-blue-100 mb-3">No File Selected</h3>
            <p className="mt-2 text-blue-300 max-w-sm mx-auto">
              Please return to the dashboard to select a file for viewing maps
            </p>
            <Button 
              onClick={handleBackToDashboard} 
              className="mt-6"
              variant="outline"
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphSection;
