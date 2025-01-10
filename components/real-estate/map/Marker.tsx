// components/Map/Marker.tsx
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

interface MarkerProps {
  map: mapboxgl.Map;
  longitude: number;
  latitude: number;
  children: React.ReactNode;
}

const Marker: React.FC<MarkerProps> = ({ map, longitude, latitude, children }) => {
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    markerRef.current = new mapboxgl.Marker(elementRef.current)
      .setLngLat([longitude, latitude])
      .addTo(map);

    return () => {
      markerRef.current?.remove();
    };
  }, [map, longitude, latitude]);

  return <div ref={elementRef}>{children}</div>;
};

export default Marker;