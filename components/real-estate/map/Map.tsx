import { memo, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { PropertyCluster } from "./types/types";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

// TypeScript interfaces
interface MapItem {
  latitude: number;
  longitude: number;
  title: string;
}

interface MapProps {
  items: MapItem[];
  clusters: PropertyCluster[]; // Add clusters as a prop
}

const Map = ({ items, clusters }: MapProps) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new mapboxgl.Map({
        container: mapContainerRef.current!,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [-73.9857, 40.7484],
        zoom: 12,
      });

      mapInstanceRef.current.addControl(
        new mapboxgl.NavigationControl(),
        "top-right"
      );
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Wait for the map's style to load
    const handleStyleLoad = () => {
      // Remove existing markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      // Add new markers for the properties
      items.forEach(({ latitude, longitude, title }) => {
        const marker = new mapboxgl.Marker()
          .setLngLat([longitude, latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>${title}</h3>`)
          )
          .addTo(mapInstanceRef.current!);

        markersRef.current.push(marker);
      });

      // Add circles for the clusters
      clusters.forEach(({ geography }, index) => {
        function createGeoJSONCircle(center, radiusInKm, points = 64) {
          const coords = {
            latitude: center[1],
            longitude: center[0],
          };

          const km = radiusInKm;

          const ret = [];
          const distanceX =
            km / (111.32 * Math.cos((coords.latitude * Math.PI) / 180));
          const distanceY = km / 110.574;

          let theta, x, y;
          for (let i = 0; i < points; i++) {
            theta = (i / points) * (2 * Math.PI);
            x = distanceX * Math.cos(theta);
            y = distanceY * Math.sin(theta);

            ret.push([coords.longitude + x, coords.latitude + y]);
          }
          ret.push(ret[0]);

          return {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: {
                  type: "Polygon",
                  coordinates: [ret],
                },
              },
            ],
          };
        }

        if (clusters.length <= 0) return;
        const { centroid, radiusKm } = geography;
        const [longitude, latitude] = centroid
          ?.match(/-?\d+\.?\d*/g)
          ?.map(Number) ?? [0, 0];

        console.log("My_Geography: ", geography);
        if (mapInstanceRef.current && centroid) {
          const center = [longitude, latitude]; // Center of the circle
          const radius = radiusKm; // Radius in kilometers
          const circleGeoJSON = createGeoJSONCircle(center, radius);
          const sourceId = `circle_area_${index}`;
          const layerId = sourceId;
          console.log("Circle GeoJSON:", circleGeoJSON);

          if (mapInstanceRef.current.getLayer(layerId))
            mapInstanceRef.current.removeLayer(layerId);
          if (mapInstanceRef.current.getSource(sourceId))
            mapInstanceRef.current.removeSource(sourceId);
          
          mapInstanceRef.current.addSource(sourceId, {
            type: "geojson",
            data: circleGeoJSON as any,
          });
          
          mapInstanceRef.current.addLayer({
            id: layerId,
            type: "fill",
            source: sourceId,
            paint: {
              "fill-color": "#F5B55B",
              "fill-opacity": 0.5,
            },
          });
        }
      });
    };

    if (mapInstanceRef.current.isStyleLoaded()) {
      handleStyleLoad();
    } else {
      mapInstanceRef.current.once("styledata", handleStyleLoad);
    }
    
  }, [items, clusters]);

  return <div ref={mapContainerRef} className="w-full h-full rounded-lg" />;
};

export default memo(Map);
