import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, Home, DollarSign, Maximize } from 'lucide-react';

// Property Cluster Component
const PropertyCluster = ({ cluster }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="mb-4 hover:shadow-lg transition-shadow">
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">
              Cluster {cluster.cluster_id}
              <Badge className="ml-2 bg-blue-100 text-blue-800">
                {cluster.properties.length} Properties
              </Badge>
            </CardTitle>
            <p className="text-sm text-gray-500">
              Avg. Price: ${Math.round(cluster.metrics.averagePrice).toLocaleString()}
            </p>
          </div>
          <Badge className="bg-green-100 text-green-800">
            {Math.round(cluster.metrics.radiusKm)}km radius
          </Badge>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-2">Similarity Factors</h4>
            <SimilarityScoreChart factors={{
              priceScore: cluster.metrics.priceScore || 0,
              sizeScore: cluster.metrics.sizeScore || 0,
              locationScore: cluster.metrics.locationScore || 0,
              amenityScore: cluster.metrics.amenityScore || 0
            }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cluster.properties.map(property => (
              <PropertyCard 
                key={property.id} 
                property={property}
                similarityFactors={cluster.factors}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

// Property Card Component
const PropertyCard = ({ property, similarityFactors }) => {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h3 className="font-medium flex items-center gap-2">
            <Home className="w-4 h-4" />
            {property.address}
          </h3>
          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <p className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              ${Number(property.price).toLocaleString()}
            </p>
            <p className="flex items-center gap-2">
              <Maximize className="w-4 h-4" />
              {property.sqft.toLocaleString()} sq ft
            </p>
            <p>
              {property.bedrooms} beds • {property.bathrooms} baths
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Similarity Score Visualization
const SimilarityScoreChart = ({ factors }) => {
  const data = [
    { name: 'Price', score: factors.priceScore },
    { name: 'Size', score: factors.sizeScore },
    { name: 'Location', score: factors.locationScore },
    { name: 'Amenities', score: factors.amenityScore },
  ];

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="name" />
          <YAxis domain={[0, 1]} />
          <Tooltip />
          <Line type="monotone" dataKey="score" stroke="#2563eb" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Main Analytics Tab Content
const PropertyAnalyticsContent = ({ clusters }) => {
  return (
    <TabsContent value="analytics" className="space-y-6">
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Property Clusters Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clusters.map(cluster => (
                <PropertyCluster key={cluster.cluster_id} cluster={cluster} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
};

export default PropertyAnalyticsContent;