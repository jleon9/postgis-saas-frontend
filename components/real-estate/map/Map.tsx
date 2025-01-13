import { memo, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { PropertyCluster } from "./types/types";
import { Decimal } from "@prisma/client/runtime/library";
import { SelectionSource } from "./PropertyMap";
import Loading from "@/components/loader/Loading";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

// TypeScript interfaces
interface MapItem {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  price: Decimal;
  sqft: number;
  bedrooms: number;
  bathrooms: number;
}

// Map.tsx
interface MapProps {
  items: MapItem[];
  clusters: PropertyCluster[];
  selectedPropertyId: string;
  onMarkerClick: (id: string) => void;
  selectionSource: SelectionSource;
}

const Map = ({
  items,
  clusters,
  selectedPropertyId,
  onMarkerClick,
  selectionSource,
}: MapProps) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Record<string, mapboxgl.Marker>>({});
  const popupsRef = useRef<Record<string, mapboxgl.Popup>>({});

  // Function to create popup HTML
  const createPopupHTML = (item: MapItem) => {
    return `
      <div class="p-2">
        <h3 class="font-bold mb-2">${item.title}</h3>
        <p class="text-sm">Price: $${Number(item.price).toLocaleString()}</p>
        <p class="text-sm">${item.sqft.toLocaleString()} sq ft</p>
        <p class="text-sm">${item.bedrooms} beds • ${item.bathrooms} baths</p>
      </div>
    `;
  };

  const showPropertyPopup = (itemId: string) => {
    console.log("Showing popup for:", itemId, "Source:", selectionSource);
    if (!mapInstanceRef.current || !itemId) return;

    // Remove existing popups
    Object.values(popupsRef.current).forEach((popup) => popup.remove());
    popupsRef.current = {};

    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    // Create and show popup
    const popup = new mapboxgl.Popup({
      offset: 25,
      closeButton: true,
      closeOnClick: false,
      anchor: "bottom",
    })
      .setLngLat([item.longitude, item.latitude])
      .setHTML(createPopupHTML(item));

    popup.addTo(mapInstanceRef.current);
    popupsRef.current[itemId] = popup;

    // Center map if coming from analytics
    if (selectionSource === "analytics") {
      mapInstanceRef.current.flyTo({
        center: [item.longitude, item.latitude],
        zoom: 15,
        duration: 1500,
      });
    }
  };

  // Initialize map
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

  // 2. Handle markers and clusters
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapInstanceRef.current.isStyleLoaded) {
      return;
    }

    const handleStyleLoad = () => {
      // Clear existing markers and popups
      Object.values(markersRef.current).forEach((marker) => marker.remove());
      Object.values(popupsRef.current).forEach((popup) => popup.remove());
      markersRef.current = {};
      popupsRef.current = {};

      // Add new markers
      items.forEach((item) => {
        const marker = new mapboxgl.Marker()
          .setLngLat([item.longitude, item.latitude])
          .addTo(map);

        // Style the marker element
        const markerElement = marker.getElement();
        markerElement.style.cursor = "pointer";

        // Add click handler
        markerElement.addEventListener("click", () => {
          console.log("Marker clicked:", item.id);
          onMarkerClick(item.id);
        });

        markersRef.current[item.id] = marker;
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

        // console.log("My_Geography: ", geography);
        if (mapInstanceRef.current && centroid) {
          const center = [longitude, latitude]; // Center of the circle
          const radius = radiusKm; // Radius in kilometers
          const circleGeoJSON = createGeoJSONCircle(center, radius);
          const sourceId = `circle_area_${index}`;
          const layerId = sourceId;
          // console.log("Circle GeoJSON:", circleGeoJSON);

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

      // If there's a selected property, show its popup
      if (selectedPropertyId) {
        showPropertyPopup(selectedPropertyId);
      }
    };

    if (mapInstanceRef.current.isStyleLoaded()) {
      handleStyleLoad();
    } else {
      mapInstanceRef.current.once("styledata", handleStyleLoad);
    }
  }, [items]);

  // 3. Handle property selection separately
  useEffect(() => {
    if (selectedPropertyId) {
      console.log("Selection changed:", selectedPropertyId, selectionSource);
      showPropertyPopup(selectedPropertyId);
    } else {
      Object.values(popupsRef.current).forEach((popup) => popup.remove());
      popupsRef.current = {};
    }
  }, [selectedPropertyId, selectionSource]); // Depend on selection changes

  return <div ref={mapContainerRef} className="w-full h-full rounded-lg" />;
};

export default memo(Map);