// components/PropertyMap.tsx
"use client";
import { PropertyCluster } from "./types/types";
import dynamic from "next/dynamic";
import { useFindManyProperty } from "@/lib/hooks/zenstack";
import Loading from "@/components/loader/Loading";
import { useAuthStore } from "@/lib/auth/authStore";

const Map = dynamic(() => import("./Map"), { ssr: false });

interface PropertyMapProps {
  clusters?: PropertyCluster[];
}
export function PropertyMap({ clusters }: PropertyMapProps) {
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
    };
  });

  if (error) {
    return <div>Error loading properties.</div>;
  }

  console.log("Properties", properties);
  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden">
      <Map items={formattedProperties || []} clusters={clusters} />
    </div>
  );
}
