import React, { useState, useEffect } from "react";
import { Search, MapPin, Filter } from "lucide-react";

const SearchBar = ({ filters, onFiltersChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltersChange(localFilters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localFilters, onFiltersChange]);

  const handleFilterChange = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Job title, keywords..."
            value={localFilters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Location"
            value={localFilters.location}
            onChange={(e) => handleFilterChange("location", e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        <select
          value={localFilters.type}
          onChange={(e) => handleFilterChange("type", e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        >
          <option value="">All Types</option>
          <option value="full-time">Full Time</option>
          <option value="part-time">Part Time</option>
          <option value="contract">Contract</option>
          <option value="remote">Remote</option>
        </select>

        <select
          value={localFilters.category}
          onChange={(e) => handleFilterChange("category", e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        >
          <option value="">All Categories</option>
          <option value="Engineering">Engineering</option>
          <option value="Design">Design</option>
          <option value="Product">Product</option>
          <option value="Marketing">Marketing</option>
          <option value="Data Science">Data Science</option>
        </select>
      </div>
    </div>
  );
};

export default SearchBar;
