import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const WatchlistContext = createContext(null);

export const useWatchlist = () => useContext(WatchlistContext);

export const WatchlistProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('watchlist');
    return saved ? JSON.parse(saved) : [];
  });

  const { showToast } = useToast();

  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const toggleWatchlist = (product) => {
    const exists = watchlist.some(item => item.productId === product.productId);
    if (exists) {
      setWatchlist(watchlist.filter(item => item.productId !== product.productId));
      showToast(`${product.name} removed from watchlist`, 'info');
    } else {
      setWatchlist([...watchlist, product]);
      showToast(`${product.name} added to watchlist`, 'success');
    }
  };

  const isInWatchlist = (productId) => {
    return watchlist.some(item => item.productId === productId);
  };

  const clearWatchlist = () => {
    setWatchlist([]);
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        toggleWatchlist,
        isInWatchlist,
        clearWatchlist
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};
