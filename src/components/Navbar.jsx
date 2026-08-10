import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWatchlist } from '../context/WatchlistContext';
import { ShoppingCart, LogOut, User, Menu, X, Package, Search, ChevronDown, Heart } from 'lucide-react';

const popularSearches = [
  'Full Face Helmet',
  'Leather Seat Cover Set',
  'Off-Road Helmet',
  'LED Headlight Bulb',
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount, clearCartState } = useCart();
  const { watchlist } = useWatchlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  
  // Logout confirm modal state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);

  const searchRef = useRef(null);
  const accountRef = useRef(null);

  // Sync search input with URL search params
  useEffect(() => {
    const urlQuery = searchParams.get('search') || '';
    setSearchQuery(urlQuery);
  }, [searchParams]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchFocused(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
    setAccountMenuOpen(false);
  };

  const confirmLogout = async () => {
    setLogoutPending(true);
    await logout();
    clearCartState();
    setLogoutPending(false);
    setShowLogoutConfirm(false);
    navigate('/login', { replace: true });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchFocused(false);
    navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setSearchFocused(false);
    navigate(`/?search=${encodeURIComponent(suggestion)}`);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 w-full bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-xl md:text-2xl font-black tracking-wider text-white select-none uppercase flex items-center gap-1">
              AUTO<span className="text-amber-500 font-extrabold">MART</span>
              <span className="text-amber-500 animate-pulse">⚡</span>
            </Link>
          </div>

          {/* Central Search Bar (Amazon / Nykaa style) */}
          <div ref={searchRef} className="hidden md:block flex-grow max-w-md relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search premium parts & accessories..."
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 text-white placeholder-slate-400 text-xs border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-full px-4 py-2.5 pl-10 outline-none transition-all"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </form>

            {/* Suggestions Panel */}
            {searchFocused && (
              <div className="absolute top-12 left-0 right-0 bg-white text-slate-800 rounded-2xl border border-slate-100 shadow-2xl p-4 z-50">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Popular Suggestions
                </h4>
                <div className="space-y-1">
                  {popularSearches.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(item)}
                      className="w-full text-left flex items-center gap-2 px-2.5 py-2 text-xs text-slate-600 hover:text-[#0F6FFF] hover:bg-slate-50 rounded-xl transition-all cursor-pointer font-medium"
                    >
                      <Search className="w-3.5 h-3.5 text-slate-300" />
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Navigation & Account (Desktop) */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${
                isActive('/') ? 'text-amber-500' : 'text-slate-300 hover:text-white'
              }`}
            >
              Garage Home
            </Link>

            {user ? (
              <>
                {/* Watchlist heart indicator */}
                <Link
                  to="/watchlist"
                  className={`relative flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${
                    isActive('/watchlist') ? 'text-amber-500' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Heart className="w-4 h-4" />
                  Watchlist
                  {watchlist.length > 0 && (
                    <span className="absolute -top-2.5 -right-3.5 px-1.5 py-0.5 text-[9px] font-extrabold bg-red-500 text-white rounded-full flex items-center justify-center min-w-[16px] h-[16px]">
                      {watchlist.length}
                    </span>
                  )}
                </Link>

                {/* Shopping Basket */}
                <Link
                  to="/cart"
                  className={`relative flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${
                    isActive('/cart') ? 'text-amber-500' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Basket
                  {cartCount > 0 && (
                    <span className="absolute -top-2.5 -right-3.5 px-1.5 py-0.5 text-[9px] font-extrabold bg-amber-500 text-slate-900 rounded-full flex items-center justify-center min-w-[16px] h-[16px] animate-bounce">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Account Dropdown Trigger */}
                <div ref={accountRef} className="relative">
                  <button
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-colors cursor-pointer select-none bg-slate-800/60 px-3.5 py-2 rounded-full border border-slate-700"
                  >
                    <User className="w-3.5 h-3.5 text-amber-500" />
                    {user.username}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${accountMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Panel */}
                  {accountMenuOpen && (
                    <div className="absolute right-0 top-11 bg-white text-slate-800 rounded-2xl border border-slate-100 shadow-2xl p-2.5 min-w-[180px] z-50 space-y-1">
                      <Link
                        to="/orders"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:text-amber-500 hover:bg-slate-50 rounded-xl transition-all"
                      >
                        <Package className="w-4 h-4 text-amber-500" />
                        My Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-amber-500 hover:bg-amber-600 px-5 py-2.5 rounded-full transition-all shadow-md shadow-amber-500/20"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Actions Block */}
          <div className="md:hidden flex items-center gap-3">
            {user && (
              <>
                <Link to="/watchlist" className="relative p-1.5 text-slate-300 hover:text-white">
                  <Heart className="w-5 h-5" />
                  {watchlist.length > 0 && (
                    <span className="absolute -top-1 -right-2 px-1.5 py-0.5 text-[8px] font-bold bg-red-500 text-white rounded-full min-w-[14px] h-[14px] flex items-center justify-center">
                      {watchlist.length}
                    </span>
                  )}
                </Link>
                <Link to="/cart" className="relative p-1.5 text-slate-300 hover:text-white">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-2 px-1.5 py-0.5 text-[8px] font-bold bg-amber-500 text-slate-900 rounded-full min-w-[14px] h-[14px] flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded text-slate-300 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-4 space-y-3 shadow-lg">
          {/* Mobile Search input */}
          <form onSubmit={handleSearchSubmit} className="relative mb-4">
            <input
              type="text"
              placeholder="Search premium parts & accessories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 text-white placeholder-slate-400 text-xs border border-slate-700 rounded-full px-4 py-2 pl-9 outline-none"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </form>

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-300 hover:text-white py-1"
          >
            Garage Home
          </Link>
          
          {user ? (
            <>
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-slate-300 hover:text-white py-1"
              >
                My Orders
              </Link>
              <Link
                to="/watchlist"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-slate-300 hover:text-white py-1"
              >
                My Watchlist ({watchlist.length})
              </Link>
              <Link
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-slate-300 hover:text-white py-1"
              >
                My Basket ({cartCount})
              </Link>
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
                  <User className="w-3.5 h-3.5 text-amber-500" />
                  {user.username}
                </span>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-1.5 text-sm font-semibold text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center text-sm font-semibold text-slate-900 bg-amber-500 hover:bg-amber-600 py-2.5 rounded-full transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-slate-100 shadow-2xl space-y-6 text-slate-800 animate-slide-in">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Confirm Logout</h3>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                Are you sure you want to log out of your AutoMart account? You will need to sign in again to access your orders and basket.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                disabled={logoutPending}
                className="flex-1 py-3 border border-slate-200 hover:border-slate-800 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                disabled={logoutPending}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-md shadow-red-100"
              >
                {logoutPending ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Logging out...
                  </>
                ) : (
                  'Logout'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
