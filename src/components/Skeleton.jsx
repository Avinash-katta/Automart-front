import React from 'react';

export const ProductCardSkeleton = () => {
  return (
    <div className="bg-white border border-gray-100 rounded-md overflow-hidden flex flex-col h-full animate-pulse-slow">
      <div className="aspect-square w-full bg-gray-100"></div>
      <div className="p-4 flex flex-col flex-grow space-y-3">
        <div className="h-4 bg-gray-100 rounded w-3/4"></div>
        <div className="space-y-1.5">
          <div className="h-3 bg-gray-100 rounded w-full"></div>
          <div className="h-3 bg-gray-100 rounded w-5/6"></div>
        </div>
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="h-4 bg-gray-100 rounded w-1/4"></div>
          <div className="h-8 bg-gray-100 rounded w-8"></div>
        </div>
      </div>
    </div>
  );
};

export const ProductGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};

export const ProductDetailSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse-slow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image placeholder */}
        <div className="aspect-square bg-gray-100 rounded-md"></div>
        
        {/* Content placeholder */}
        <div className="space-y-6">
          <div className="h-8 bg-gray-100 rounded w-2/3"></div>
          <div className="h-6 bg-gray-100 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-100 rounded w-full"></div>
            <div className="h-4 bg-gray-100 rounded w-5/6"></div>
            <div className="h-4 bg-gray-100 rounded w-2/3"></div>
          </div>
          <div className="h-10 bg-gray-100 rounded w-1/3"></div>
          <div className="h-12 bg-gray-100 rounded w-full"></div>
        </div>
      </div>
    </div>
  );
};
