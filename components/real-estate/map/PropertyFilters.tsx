import React, { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { 
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { PropertyFilters as PropertyFiltersType } from './types/types';


interface PropertyFiltersProps {
    onFilterChange: (filters: PropertyFiltersType) => void;
    initialFilters?: PropertyFiltersType;
  }

const PropertyFiltersComponent = ({ onFilterChange }: PropertyFiltersProps) => {
  const [filters, setFilters] = useState({
    priceRange: [0, 2000000],
    sqftRange: [0, 5000],
    beds: 0,
    baths: 0,
    walkScore: 0
  });

  const [searchQuery, setSearchQuery] = useState('');

  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  return (
    <div className="absolute top-4 left-20 right-4 z-10">
      <Card>
        <CardContent className="p-3">
          <div className="flex gap-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by address or neighborhood..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <SlidersHorizontal size={16} />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Property Filters</SheetTitle>
                </SheetHeader>
                
                <div className="mt-6 space-y-6">
                  {/* Price Range */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Price Range
                    </label>
                    <div className="space-y-2">
                      <Slider
                        defaultValue={filters.priceRange}
                        max={2000000}
                        step={50000}
                        onValueChange={(value) => 
                          handleFilterChange({ priceRange: value })}
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>${filters.priceRange[0].toLocaleString()}</span>
                        <span>${filters.priceRange[1].toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Square Footage */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Square Footage
                    </label>
                    <div className="space-y-2">
                      <Slider
                        defaultValue={filters.sqftRange}
                        max={5000}
                        step={100}
                        onValueChange={(value) => 
                          handleFilterChange({ sqftRange: value })}
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{filters.sqftRange[0]} sqft</span>
                        <span>{filters.sqftRange[1]} sqft</span>
                      </div>
                    </div>
                  </div>

                  {/* Beds & Baths */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Bedrooms
                      </label>
                      <Input
                        type="number"
                        min={0}
                        value={filters.beds}
                        onChange={(e) => 
                          handleFilterChange({ beds: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Bathrooms
                      </label>
                      <Input
                        type="number"
                        min={0}
                        value={filters.baths}
                        onChange={(e) => 
                          handleFilterChange({ baths: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  {/* Walk Score */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Minimum Walk Score
                    </label>
                    <Slider
                      defaultValue={[filters.walkScore]}
                      max={100}
                      step={5}
                      onValueChange={([value]) => 
                        handleFilterChange({ walkScore: value })}
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Active Filters Display */}
            {Object.values(filters).some(v => 
              Array.isArray(v) ? v[0] > 0 || v[1] < v[1] : v > 0
            ) && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleFilterChange({
                  priceRange: [0, 2000000],
                  sqftRange: [0, 5000],
                  beds: 0,
                  baths: 0,
                  walkScore: 0
                })}
              >
                <X size={16} className="mr-1" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyFiltersComponent;