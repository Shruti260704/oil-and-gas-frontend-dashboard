
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Define the structure of our location data
export interface LocationData {
  name: string;
  lat: number;
  lng: number;
  value: number;
}

interface MapComponentProps {
  locations: LocationData[];
  height?: string;
}

// Create custom marker icon to fix the missing icon issue
const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to automatically fit bounds to markers
function SetBoundsToMarkers({ locations }: { locations: LocationData[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (locations.length > 0) {
      const bounds = locations.map(loc => [loc.lat, loc.lng]);
      map.fitBounds(bounds as any);
    }
  }, [locations, map]);
  
  return null;
}

const MapComponent = ({ locations, height = '600px' }: MapComponentProps) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([25, 0]);
  const [zoom, setZoom] = useState(2);

  // Update map center when locations change
  useEffect(() => {
    if (locations.length > 0) {
      // Calculate average lat and lng for center
      const avgLat = locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length;
      const avgLng = locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length;
      setMapCenter([avgLat, avgLng]);
      setZoom(4);
    }
  }, [locations]);

  // Create marker elements for each location
  const markers = locations.map((location, index) => (
    <Marker
      key={`${location.name}-${index}`}
      position={[location.lat, location.lng]}
      icon={customIcon}
    >
      <Popup>
        <div className="p-2">
          <h3 className="font-bold text-md">{location.name}</h3>
          <p className="mt-1">Value: <span className="font-semibold">{location.value}</span></p>
        </div>
      </Popup>
    </Marker>
  ));

  return (
    <div style={{ height }} className="w-full rounded-lg overflow-hidden border border-blue-800/40 shadow-lg">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers}
        <SetBoundsToMarkers locations={locations} />
      </MapContainer>
    </div>
  );
};

export default MapComponent;
