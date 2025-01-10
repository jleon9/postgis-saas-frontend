// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   useSimilarProperties,
//   useWalkScore,
// } from "@/lib/hooks/graph/properties/usePropertyAnalytics";
// import React from "react";

// const PropertyDetails = ({ property }) => {
//   const { data: walkScore } = useWalkScore(property.id);
//   const { data: similarProperties } = useSimilarProperties(property.id);

//   return (
//     <div className="space-y-6">
//       <Card>
//         <CardHeader>
//           <CardTitle>{property.address}</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <p className="text-sm text-gray-500">Price</p>
//               <p className="text-lg font-semibold">
//                 ${property.price.toLocaleString()}
//               </p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Square Feet</p>
//               <p className="text-lg font-semibold">
//                 {property.sqft.toLocaleString()}
//               </p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Bedrooms</p>
//               <p className="text-lg font-semibold">{property.bedrooms}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Bathrooms</p>
//               <p className="text-lg font-semibold">{property.bathrooms}</p>
//             </div>
//           </div>

//           {walkScore && (
//             <div className="mt-6">
//               <p className="text-sm text-gray-500">Walk Score</p>
//               <div className="mt-2 flex items-center">
//                 <div
//                   className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
//                   style={{
//                     backgroundColor: `hsl(${walkScore.score}, 70%, 50%)`,
//                   }}
//                 >
//                   {walkScore.score}
//                 </div>
//                 <p className="ml-3 text-sm">
//                   {walkScore.score >= 80
//                     ? "Very Walkable"
//                     : walkScore.score >= 60
//                     ? "Somewhat Walkable"
//                     : "Car-Dependent"}
//                 </p>
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {similarProperties?.length > 0 && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Similar Properties</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {similarProperties.map((similar) => (
//                 <Alert key={similar.id}>
//                   <AlertDescription>
//                     <div className="flex justify-between items-center">
//                       <div>
//                         <p className="font-medium">{similar.address}</p>
//                         <p className="text-sm text-gray-500">
//                           ${similar.price.toLocaleString()} • {similar.sqft}{" "}
//                           sqft
//                         </p>
//                       </div>
//                       <div className="text-sm">
//                         {Math.round(similar.similarity_score * 100)}% Match
//                       </div>
//                     </div>
//                   </AlertDescription>
//                 </Alert>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// };

// export default PropertyDetails;
