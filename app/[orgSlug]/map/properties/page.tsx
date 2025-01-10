"use client";
import Loading from "@/components/loader/Loading";
import { PropertyMap } from "@/components/real-estate/map/PropertyMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePropertyClusters } from "@/lib/hooks/graph/properties/usePropertyAnalytics";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Info, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import PropertyAnalyticsContent from "@/components/real-estate/map/PropertyAnalytics";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [similarityThreshold, setSimilarityThreshold] = useState(0.7);
  const [maxRadius, setMaxRadius] = useState(5.0);
  const [isComputing, setIsComputing] = useState(false);
  const { toast } = useToast();

  const {
    data: propertyClusters,
    isLoading,
    isError,
    error,
    refetch,
  } = usePropertyClusters(similarityThreshold, maxRadius, false); // Add enabled: false to prevent auto-fetch

  // Function to handle cluster computation
  const computeClusters = async () => {
    try {
      setIsComputing(true);
      // First, trigger the backend to recompute similarities
      const url = `/api/properties/clusters?minSimilarity=${similarityThreshold}&maxRadius=${maxRadius}`;
      console.log("Requesting URL:", url);
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to compute similarities");
      }

      // Then fetch the new clusters
      await refetch();

      toast({
        title: "Success",
        description: "Property clusters have been updated successfully.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error computing clusters:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to compute property clusters. Please try again.",
        duration: 5000,
      });
    } finally {
      setIsComputing(false);
    }
  };

  

  if (isError) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading property data: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  console.log(
    "Property_Cluster_IDs: ",
    propertyClusters &&
      propertyClusters.map((cluster) => ({ id: cluster.cluster_id }))
  );
  console.log("Property_Clusters: ", propertyClusters);
  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Analytics Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Analysis Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Similarity Threshold: {(similarityThreshold * 100).toFixed(0)}
                  %
                </label>
                <Slider
                  defaultValue={[similarityThreshold]}
                  max={1}
                  min={0.1}
                  step={0.05}
                  onValueChange={([value]) => setSimilarityThreshold(value)}
                  className="mt-2"
                />
              </div>
              <div className="text-sm text-gray-500">
                Properties with similarity scores above this threshold will be
                grouped together.
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={computeClusters}
                disabled={isComputing}
                className="w-full sm:w-auto"
              >
                {isComputing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Computing Clusters...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Compute Property Clusters
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Map and Analytics Section */}
        <Card className="p-6 overflow-auto max-h-[800px] lg:col-span-2">
          <CardContent className="p-6">
            <Tabs defaultValue="map" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="map">Map View</TabsTrigger>
                <TabsTrigger value="analytics">Property Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="map">
                <div className="rounded-lg overflow-hidden border h-[600px]">
                  <PropertyMap
                    clusters={
                      propertyClusters
                        ? propertyClusters.map((cluster, index) => {
                            console.log("CLUSTER_ID: ", cluster.cluster_id);
                            return {
                              ...cluster,
                              id: cluster.cluster_id
                            };
                          })
                        : []
                    }
                  />
                </div>
              </TabsContent>

              <TabsContent value="analytics">
                {!propertyClusters ? (
                  <div className="text-center py-8 text-gray-500">
                    Click "Compute Property Clusters" to begin analysis
                  </div>
                ) : (
                  <PropertyAnalyticsContent clusters={propertyClusters} />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-black">Property Clusters:</p>
                <div>
                  <p className="text-2xl font-bold">
                    {propertyClusters?.length || 0}
                  </p>
                </div>
                <p className="text-sm text-black">Total Properties:</p>
                <div>
                  <p className="text-2xl font-bold">
                    {propertyClusters?.reduce(
                      (sum, cluster) => sum + cluster.properties.length,
                      0
                    ) || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-black font-medium mb-4">
                    Average Price:
                  </p>
                  <p className="text-2xl font-bold">
                    $
                    {propertyClusters
                      ? (
                          propertyClusters.reduce(
                            (sum, cluster) =>
                              sum + cluster.metrics.averagePrice,
                            0.0
                          ) / (propertyClusters?.length || 1)
                        )
                          .toFixed(2)
                          .replace(/\B(?=(\d{3})+(?!\d))/g, " ")
                      : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {propertyClusters?.length === 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                No property clusters found with the current similarity
                threshold. Try lowering the threshold to see more results.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
