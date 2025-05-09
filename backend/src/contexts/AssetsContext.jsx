import React, { createContext, useState, useEffect, useContext } from 'react';
import { assetService } from '../services/apiService';
import { AuthContext } from './AuthContext';

export const AssetsContext = createContext();

export const AssetsProvider = ({ children }) => {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, currentUser } = useContext(AuthContext);
  
  // Load data from API when authenticated
  useEffect(() => {
    const fetchData = async () => {
      if (isAuthenticated) {
        setIsLoading(true);
        setError(null);
        
        try {
          // Fetch categories and assets in parallel
          const [categoriesResponse, assetsResponse] = await Promise.all([
            assetService.getCategories(),
            assetService.getAssets()
          ]);
          
          setCategories(categoriesResponse.data);
          setAssets(assetsResponse.data);
        } catch (err) {
          console.error('Error fetching assets data:', err);
          setError('Failed to load assets. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchData();
  }, [isAuthenticated]);
  
  // Asset methods
  const addAsset = async (assetData) => {
    try {
      const response = await assetService.createAsset(assetData);
      const newAsset = response.data;
      setAssets(prev => [...prev, newAsset]);
      return newAsset;
    } catch (err) {
      console.error('Error adding asset:', err);
      throw err;
    }
  };
  
  const updateAsset = async (id, updates) => {
    try {
      const response = await assetService.updateAsset(id, updates);
      const updatedAsset = response.data;
      setAssets(prev => 
        prev.map(asset => asset.id === id ? updatedAsset : asset)
      );
      return updatedAsset;
    } catch (err) {
      console.error('Error updating asset:', err);
      throw err;
    }
  };
  
  const deleteAsset = async (id) => {
    try {
      await assetService.deleteAsset(id);
      setAssets(prev => prev.filter(asset => asset.id !== id));
    } catch (err) {
      console.error('Error deleting asset:', err);
      throw err;
    }
  };
  
  const addCategory = async (categoryData) => {
    try {
      const response = await assetService.createCategory(categoryData);
      const newCategory = response.data;
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      console.error('Error adding category:', err);
      throw err;
    }
  };
  
  const getAssetsByCategory = (categoryId) => {
    if (!categoryId) return assets;
    return assets.filter(asset => asset.category_id === categoryId);
  };
  
  const getCategoryById = (categoryId) => {
    return categories.find(cat => cat.id === categoryId);
  };
  
  // Get user color based on username
  const getUserColor = (username) => {
    if (!username) return '#4A5CDB'; // Default color
    
    // If it's the current user, return primary color
    if (currentUser && username === currentUser.username) {
      return '#4A5CDB'; // primary color
    }
    
    // Otherwise, map username to a consistent color using hash
    const hash = Array.from(username).reduce(
      (acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0
    );
    
    // List of colors (except primary blue which is reserved for current user)
    const colors = [
      '#FF6B6B', // accent red
      '#8A2BE2', // secondary purple
      '#00C896', // teal
      '#FFB347', // orange
      '#B19CD9'  // lavender
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }
  
  if (error) {
    return <div className="flex items-center justify-center h-screen bg-background">
      <div className="text-accent text-center">
        <p className="text-xl mb-4">Error loading assets</p>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    </div>;
  }
  
  return (
    <AssetsContext.Provider value={{
      assets,
      categories,
      addAsset,
      updateAsset,
      deleteAsset,
      addCategory,
      getAssetsByCategory,
      getCategoryById,
      getUserColor
    }}>
      {children}
    </AssetsContext.Provider>
  );
};
