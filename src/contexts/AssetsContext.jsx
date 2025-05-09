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
  
  console.log("AssetsProvider initialized, isAuthenticated:", isAuthenticated);
  
  // Load data from API when authenticated
  useEffect(() => {
    const fetchData = async () => {
      if (isAuthenticated) {
        console.log("AssetsProvider: Fetching assets and categories...");
        setIsLoading(true);
        setError(null);
        
        try {
          // Mock data for local development
          if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_API_URL) {
            console.log("Using mock data for assets");
            // Mock categories data
            const mockCategories = [
              { id: 1, name: 'Design Tools', icon: '🎨', description: 'Design and creative tools' },
              { id: 2, name: 'Development', icon: '💻', description: 'Development tools and resources' },
              { id: 3, name: 'Productivity', icon: '⚡', description: 'Tools to boost productivity' }
            ];
            
            // Mock assets data
            const mockAssets = [
              { 
                id: 1, 
                name: 'Figma', 
                url: 'https://figma.com', 
                notes: 'Great collaborative design tool', 
                pricing: 'Free tier, $12/mo pro', 
                quality: 'amazing', 
                category_id: 1,
                category_name: 'Design Tools',
                category_icon: '🎨',
                username: currentUser?.username || 'admin'
              },
              { 
                id: 2, 
                name: 'VS Code', 
                url: 'https://code.visualstudio.com', 
                notes: 'Powerful code editor', 
                pricing: 'Free', 
                quality: 'amazing', 
                category_id: 2,
                category_name: 'Development',
                category_icon: '💻',
                username: currentUser?.username || 'admin'
              }
            ];
            
            setCategories(mockCategories);
            setAssets(mockAssets);
            setIsLoading(false);
            return;
          }
          
          // Fetch categories and assets in parallel from API
          const [categoriesResponse, assetsResponse] = await Promise.all([
            assetService.getCategories(),
            assetService.getAssets()
          ]);
          
          console.log("Categories response:", categoriesResponse.data);
          console.log("Assets response:", assetsResponse.data);
          
          setCategories(categoriesResponse.data);
          setAssets(assetsResponse.data);
        } catch (err) {
          console.error('Error fetching assets data:', err);
          setError('Failed to load assets. Please try again.');
        } finally {
          setIsLoading(false);
        }
      } else {
        // When not authenticated, we're not loading
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, currentUser]);
  
  // Asset methods
  const addAsset = async (assetData) => {
    try {
      // For mock data
      if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_API_URL) {
        const newAsset = {
          id: assets.length + 1,
          ...assetData,
          username: currentUser?.username || 'admin',
          category_name: categories.find(c => c.id === assetData.category_id)?.name || '',
          category_icon: categories.find(c => c.id === assetData.category_id)?.icon || ''
        };
        setAssets(prev => [...prev, newAsset]);
        return newAsset;
      }
      
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
      // For mock data
      if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_API_URL) {
        const updatedAsset = {
          ...assets.find(a => a.id === id),
          ...updates,
          category_name: updates.category_id ? 
            categories.find(c => c.id === updates.category_id)?.name : 
            assets.find(a => a.id === id)?.category_name,
          category_icon: updates.category_id ? 
            categories.find(c => c.id === updates.category_id)?.icon : 
            assets.find(a => a.id === id)?.category_icon
        };
        setAssets(prev => prev.map(asset => asset.id === id ? updatedAsset : asset));
        return updatedAsset;
      }
      
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
      // For mock data
      if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_API_URL) {
        setAssets(prev => prev.filter(asset => asset.id !== id));
        return;
      }
      
      await assetService.deleteAsset(id);
      setAssets(prev => prev.filter(asset => asset.id !== id));
    } catch (err) {
      console.error('Error deleting asset:', err);
      throw err;
    }
  };
  
  const addCategory = async (categoryData) => {
    try {
      // For mock data
      if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_API_URL) {
        const newCategory = {
          id: categories.length + 1,
          ...categoryData
        };
        setCategories(prev => [...prev, newCategory]);
        return newCategory;
      }
      
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
  
  // Don't show loading spinner here, let the App component handle it
  const value = {
    assets,
    categories,
    isLoading,
    error,
    addAsset,
    updateAsset,
    deleteAsset,
    addCategory,
    getAssetsByCategory,
    getCategoryById,
    getUserColor
  };
  
  return (
    <AssetsContext.Provider value={value}>
      {children}
    </AssetsContext.Provider>
  );
};

export default AssetsProvider;
