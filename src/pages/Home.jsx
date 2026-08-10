import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import CategoryBar from '../components/CategoryBar';
import ProductCard from '../components/ProductCard';
import CompareDrawer from '../components/CompareDrawer';
import { ProductGridSkeleton } from '../components/Skeleton';
import { Search, ShieldCheck, Truck, RefreshCw, Award, Heart, Check } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useWatchlist } from '../context/WatchlistContext';

const vehicleFinderOptions = {
  types: ['Car', 'SUV', 'Sports Car', 'Off-Road'],
  brands: {
    'Car': ['BMW', 'Audi', 'Mercedes-Benz', 'Volkswagen'],
    'SUV': ['Audi', 'BMW', 'Range Rover', 'Toyota'],
    'Sports Car': ['Porsche', 'BMW', 'Mercedes-Benz', 'Ferrari'],
    'Off-Road': ['Jeep', 'Ford', 'Toyota', 'Land Rover']
  },
  models: {
    'BMW': ['M4 Competition', 'M3 Coupe', 'X5 M-Sport', 'i8 Roadster'],
    'Audi': ['Q8 Prestige', 'R8 V10', 'A4 Sedan', 'RS6 Avant'],
    'Mercedes-Benz': ['AMG C63', 'G-Wagon G63', 'C-Class', 'E-Class'],
    'Volkswagen': ['Golf R', 'Polo GT', 'Tiguan', 'Passat'],
    'Porsche': ['911 GT3 RS', 'Cayman GT4', 'Taycan Turbo', 'Macan GTS'],
    'Jeep': ['Wrangler Rubicon', 'Grand Cherokee'],
    'Ford': ['Mustang Shelby', 'Raptor F-150'],
    'Toyota': ['Fortuner Legender', 'Supra GR', 'Land Cruiser'],
    'Range Rover': ['Sport HSE', 'Vogue'],
    'Land Rover': ['Defender 110', 'Discovery']
  },
  years: ['2026', '2025', '2024', '2023', '2022', '2021']
};

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { showToast } = useToast();
  const { watchlist, toggleWatchlist, isInWatchlist } = useWatchlist();

  // Compare Tray State
  const [comparedProducts, setComparedProducts] = useState([]);

  // Vehicle Finder State
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleBrand, setVehicleBrand] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [activeFinderFilter, setActiveFinderFilter] = useState(null);

  const urlSearchQuery = searchParams.get('search') || '';

  const fetchProducts = async (catId = null) => {
    setLoading(true);
    try {
      let url = '/products';
      if (catId !== null) {
        url = `/products/category/${catId}`;
      }
      const response = await api.get(url);
      setAllProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(selectedCategory);
  }, [selectedCategory]);

  // Client-side Search and Vehicle Finder filtering
  useEffect(() => {
    let result = [...allProducts];

    // 1. Text Search Filter
    if (urlSearchQuery.trim()) {
      const q = urlSearchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // 2. Vehicle Finder Filter
    if (activeFinderFilter) {
      const { brand, model } = activeFinderFilter;
      result = result.filter((p) => {
        const matchesBrand = !brand || p.brand?.toLowerCase() === brand.toLowerCase() || p.name?.toLowerCase().includes(brand.toLowerCase());
        const matchesModel = !model || p.name?.toLowerCase().includes(model.toLowerCase()) || (p.description && p.description.toLowerCase().includes(model.toLowerCase()));
        return matchesBrand && matchesModel;
      });
    }

    setFilteredProducts(result);
  }, [allProducts, urlSearchQuery, activeFinderFilter]);

  const handleCategorySelect = (catId) => {
    if (urlSearchQuery) setSearchParams({});
    setActiveFinderFilter(null);
    setSelectedCategory(catId);
  };

  const handleClearSearch = () => {
    setSelectedCategory(null);
    setSearchParams({});
    setActiveFinderFilter(null);
    setVehicleType('');
    setVehicleBrand('');
    setVehicleModel('');
    setVehicleYear('');
  };

  const handleFinderSubmit = (e) => {
    e.preventDefault();
    if (!vehicleType && !vehicleBrand && !vehicleModel) {
      showToast('Please select vehicle criteria to search.', 'warning');
      return;
    }

    setActiveFinderFilter({
      type: vehicleType,
      brand: vehicleBrand,
      model: vehicleModel,
      year: vehicleYear
    });
    setSelectedCategory(null);
    setSearchParams({});
    showToast(`Showing compatible parts for ${vehicleBrand} ${vehicleModel}`, 'success');
  };

  // Compare Tray Handlers
  const handleCompareToggle = (product) => {
    const exists = comparedProducts.some(p => p.productId === product.productId);
    if (exists) {
      setComparedProducts(comparedProducts.filter(p => p.productId !== product.productId));
    } else {
      if (comparedProducts.length >= 3) {
        showToast('Specs Matcher matches a maximum of 3 products side-by-side.', 'warning');
        return;
      }
      setComparedProducts([...comparedProducts, product]);
    }
  };

  // Available brands derived from selected type
  const availableBrands = vehicleType ? vehicleFinderOptions.brands[vehicleType] : [];
  // Available models derived from selected brand
  const availableModels = vehicleBrand ? vehicleFinderOptions.models[vehicleBrand] : [];

  return (
    <div className="bg-[#FAFAFA] min-h-screen relative overflow-hidden font-sans pb-24">
      
      {/* 1. Split Header Showcase ( McLaren car banner left + vehicle finder right ) */}
      <header className="relative bg-slate-900 border-b border-amber-500/15 py-10 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          
          {/* Left: Luxury McLaren Showcase (2 Cols) */}
          <div className="lg:col-span-2 relative h-[250px] sm:h-[360px] bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-xl group">
            {/* Background McLaren Car */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-101 brightness-55"
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1200')` }}
            />
            {/* Subtle overlay grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000001a_1px,transparent_1px),linear-gradient(to_bottom,#0000001a_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-25"></div>

            {/* Content info */}
            <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between text-left">
              <div>
                <span className="inline-block text-[9px] font-black uppercase tracking-[0.2em] text-white bg-blue-600 px-3.5 py-1.5 rounded-md mb-4 shadow-sm">
                  Up to 50% OFF
                </span>
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase leading-none max-w-lg">
                  Upgrade Your Drive <br/>
                  <span className="text-slate-100 font-light">with Premium Accessories</span>
                </h2>
                <p className="mt-3 max-w-sm text-[11px] sm:text-xs text-slate-300 font-light leading-relaxed">
                  Discover top-rated OEM parts, carbon styling kits, and high-performance exhaust upgrades at unbeatable prices.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => showToast('Redirecting to collections...', 'info')}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  Shop Now
                </button>
                <button
                  onClick={() => showToast('No offers registered today.', 'info')}
                  className="px-5 py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                >
                  View Offers
                </button>
              </div>
            </div>
          </div>

          {/* Right: Find Parts For Your Vehicle Form (1 Col) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-tight text-slate-900">Find Parts For Your Vehicle</h3>
                <p className="text-[9px] text-slate-400 font-light mt-0.5">Select vehicle details to see compatible products</p>
              </div>
            </div>

            <form onSubmit={handleFinderSubmit} className="space-y-3">
              {/* Type Selection */}
              <select
                value={vehicleType}
                onChange={(e) => { setVehicleType(e.target.value); setVehicleBrand(''); setVehicleModel(''); }}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-3 px-4 outline-none focus:border-blue-500 font-semibold text-slate-700"
              >
                <option value="">Select Vehicle Type</option>
                {vehicleFinderOptions.types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              {/* Brand Selection */}
              <select
                disabled={!vehicleType}
                value={vehicleBrand}
                onChange={(e) => { setVehicleBrand(e.target.value); setVehicleModel(''); }}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-3 px-4 outline-none focus:border-blue-500 font-semibold text-slate-700 disabled:opacity-50"
              >
                <option value="">Select Brand</option>
                {availableBrands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>

              {/* Model Selection */}
              <select
                disabled={!vehicleBrand}
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-3 px-4 outline-none focus:border-blue-500 font-semibold text-slate-700 disabled:opacity-50"
              >
                <option value="">Select Model</option>
                {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
              </select>

              {/* Year Selection */}
              <select
                disabled={!vehicleModel}
                value={vehicleYear}
                onChange={(e) => setVehicleYear(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-3 px-4 outline-none focus:border-blue-500 font-semibold text-slate-700 disabled:opacity-50"
              >
                <option value="">Select Year</option>
                {vehicleFinderOptions.years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>

              <button
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-1.5"
              >
                Find Compatible Accessories
              </button>
            </form>
          </div>

        </div>
      </header>

      {/* Categories Bar */}
      <CategoryBar
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
      />

      {/* Service Highlights Row */}
      <div className="bg-white border-b border-slate-100 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100/50 transition-all duration-300 hover:shadow-xs">
              <Truck className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-800">Free Shipping</h4>
                <p className="text-[10px] text-slate-400 font-light mt-0.5">Orders above ₹999</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100/50 transition-all duration-300 hover:shadow-xs">
              <ShieldCheck className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-800">Genuine Spares</h4>
                <p className="text-[10px] text-slate-400 font-light mt-0.5">100% Certified Parts</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100/50 transition-all duration-300 hover:shadow-xs">
              <RefreshCw className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-800">10-Day Replacements</h4>
                <p className="text-[10px] text-slate-400 font-light mt-0.5">Easy returns policy</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100/50 transition-all duration-300 hover:shadow-xs">
              <Award className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-800">Warranty Protection</h4>
                <p className="text-[10px] text-slate-400 font-light mt-0.5">2-Year structural coverage</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid (Full-width Products catalog) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Search status & results summary */}
        <div className="mb-8 border-b border-slate-100 pb-5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-tight">
              {activeFinderFilter 
                ? `Compatible Parts for ${activeFinderFilter.brand} ${activeFinderFilter.model}`
                : urlSearchQuery 
                  ? `Search results for "${urlSearchQuery}"` 
                  : 'Browse Catalog'}
            </h3>
            <p className="text-xs text-slate-400 font-light mt-0.5">
              Showing {filteredProducts.length} verified products
            </p>
          </div>
          {activeFinderFilter && (
            <button
              onClick={handleClearSearch}
              className="text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 border border-red-100 px-4 py-2 rounded-xl transition-all uppercase tracking-wide cursor-pointer"
            >
              Reset Finder
            </button>
          )}
        </div>

        {/* Products Grid (Spans full page width) */}
        <div className="w-full">
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.productId} className="relative">
                  {/* Watchlist heart toggle on product card */}
                  <button
                    onClick={() => toggleWatchlist(product)}
                    className={`absolute top-3 left-3 z-10 p-2 rounded-full border transition-all cursor-pointer shadow-xs ${
                      isInWatchlist(product.productId)
                        ? 'bg-red-500 border-red-500 text-white scale-105'
                        : 'bg-white/90 backdrop-blur-xs border-slate-200 text-slate-400 hover:text-red-500 hover:bg-white'
                    }`}
                    title="Watchlist product"
                  >
                    <Heart className={`w-3 h-3 ${isInWatchlist(product.productId) ? 'fill-current' : ''}`} />
                  </button>

                  <ProductCard
                    product={product}
                    isCompared={comparedProducts.some(p => p.productId === product.productId)}
                    onCompareToggle={handleCompareToggle}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col items-center justify-center p-8">
              <Search className="w-12 h-12 text-slate-300 mb-3 animate-pulse" />
              <h3 className="text-base font-bold text-slate-800">No products found</h3>
              <p className="text-xs text-slate-400 font-light mt-1 max-w-xs leading-relaxed">
                We couldn't find any accessories matching your criteria. Try adjusting your search query.
              </p>
              <button
                onClick={handleClearSearch}
                className="mt-6 text-xs font-bold text-amber-500 hover:text-amber-600 bg-amber-500/5 border border-amber-500/10 px-5 py-2.5 rounded-full transition-all uppercase cursor-pointer"
              >
                Reset Search
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Floating compare tray component */}
      <CompareDrawer
        selectedProducts={comparedProducts}
        onRemove={(id) => setComparedProducts(comparedProducts.filter(p => p.productId !== id))}
        onClear={() => setComparedProducts([])}
      />

    </div>
  );
};

export default Home;
