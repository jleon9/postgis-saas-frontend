// PropertyMap.tsx
import { useAuthStore } from "@/lib/auth/authStore";
import { useFindManyProperty } from "@/lib/hooks/zenstack";
import dynamic from "next/dynamic";
import { createContext, useContext, useEffect, useState } from "react";
import { PropertyCluster } from "./types/types";

export type SelectionSource = "analytics" | "marker" | null;

// Update the context to include the selection source
export const PropertySelectionContext = createContext<{
    selectedPropertyId: string | null;
    selectionSource: SelectionSource;
    setSelectedPropertyId: (id: string | null, source: SelectionSource) => void;
  }>({
    selectedPropertyId: null,
    selectionSource: null,
    setSelectedPropertyId: () => {},
  });

const Map = dynamic(() => import("./Map"), { ssr: false });

interface PropertyMapProps {
  clusters?: PropertyCluster[];
}

export function PropertyMap({ clusters }: PropertyMapProps) {
  const { selectedPropertyId, setSelectedPropertyId, selectionSource } = useContext(
    PropertySelectionContext
  );

  const { user } = useAuthStore();
  const {
    data: properties,
    isLoading,
    error,
  } = useFindManyProperty({
    where: {
      organization: {
        slug: "testorg",
      },
    },
    include: {
      organization: true,
    },
  });

  if (isLoading || !user?.organization?.slug || !properties) {
    return <div>Loading map...</div>;
  }

  const formattedProperties = properties.map((property) => {
    const [longitude, latitude] = property.location
      .match(/-?\d+\.?\d*/g)
      ?.map(Number) ?? [0, 0];

    return {
      id: property.id,
      title: property.address,
      latitude,
      longitude,
      price: property.price,
      sqft: property.sqft,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
    };
  });

  if (error) {
    return <div>Error loading properties.</div>;
  }

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden">
      <Map
        items={formattedProperties || []}
        clusters={clusters || []}
        selectedPropertyId={selectedPropertyId}
        onMarkerClick={(id) => setSelectedPropertyId(id, "marker")}
        selectionSource={selectionSource}
      />
    </div>
  );
}
