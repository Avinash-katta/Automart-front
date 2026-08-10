import React, { useEffect, useState } from 'react';
import api from '../services/api';

const CategoryBar = ({ selectedCategory, onSelectCategory }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="sticky top-[64px] z-30 bg-white border-b border-gray-100 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex gap-6 overflow-x-auto no-scrollbar">
          <div className="w-20 h-5 bg-gray-100 rounded animate-pulse-slow"></div>
          <div className="w-20 h-5 bg-gray-100 rounded animate-pulse-slow"></div>
          <div className="w-20 h-5 bg-gray-100 rounded animate-pulse-slow"></div>
          <div className="w-20 h-5 bg-gray-100 rounded animate-pulse-slow"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-[64px] z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar whitespace-nowrap">
          {/* Default Option: All Products */}
          <button
            onClick={() => onSelectCategory(null)}
            className={`text-sm font-semibold tracking-tight pb-1 cursor-pointer transition-all ${
              selectedCategory === null
                ? 'text-[#0F6FFF] border-b-2 border-[#0F6FFF]'
                : 'text-gray-400 hover:text-black hover:font-medium'
            }`}
          >
            All Products
          </button>

          {/* Dynamic Categories */}
          {categories.map((category) => (
            <button
              key={category.categoryId}
              onClick={() => onSelectCategory(category.categoryId)}
              className={`text-sm font-semibold tracking-tight pb-1 cursor-pointer transition-all ${
                selectedCategory === category.categoryId
                  ? 'text-[#0F6FFF] border-b-2 border-[#0F6FFF]'
                  : 'text-gray-400 hover:text-black hover:font-medium'
              }`}
            >
              {category.categoryName}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;
