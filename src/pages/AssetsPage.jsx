import React, { useState, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, 
  FaTrash, 
  FaEdit, 
  FaSearch,
  FaExternalLinkAlt,
  FaStar,
  FaRegStar,
  FaUser
} from 'react-icons/fa';
import { AssetsContext } from '../contexts/AssetsContext';
import { AuthContext } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';

const AssetsPage = () => {
  // Get context data
  const { 
    assets, 
    categories, 
    addAsset, 
    updateAsset, 
    deleteAsset,
    addCategory,
    getUserColor
  } = useContext(AssetsContext);
  
  const { currentUser } = useContext(AuthContext);
  
  // Local state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Refs
  const nameRef = useRef();
  const urlRef = useRef();
  const notesRef = useRef();
  const pricingRef = useRef();
  const qualityRef = useRef();
  const categoryRef = useRef();
  
  // Category modal refs
  const categoryNameRef = useRef();
  const categoryIconRef = useRef();
  const categoryDescRef = useRef();
  
  // Open modal to add new asset
  const handleAddAsset = () => {
    setEditMode(false);
    setCurrentAsset(null);
    setIsModalOpen(true);
  };
  
  // Open modal to edit existing asset
  const handleEditAsset = (asset) => {
    setEditMode(true);
    setCurrentAsset(asset);
    setIsModalOpen(true);
  };
  
  // Save asset (add or update)
  const handleSaveAsset = async (e) => {
    e.preventDefault();
    
    const assetData = {
      name: nameRef.current.value,
      url: urlRef.current.value,
      notes: notesRef.current.value,
      pricing: pricingRef.current.value,
      quality: qualityRef.current.value,
      category_id: parseInt(categoryRef.current.value, 10)
    };
    
    try {
      if (editMode && currentAsset) {
        await updateAsset(currentAsset.id, assetData);
      } else {
        await addAsset(assetData);
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving asset:', error);
      // Show error message to user
    }
  };
  
  // Save new category
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    
    const categoryData = {
      name: categoryNameRef.current.value,
      icon: categoryIconRef.current.value,
      description: categoryDescRef.current.value
    };
    
    try {
      await addCategory(categoryData);
      setIsCategoryModalOpen(false);
    } catch (error) {
      console.error('Error saving category:', error);
      // Show error message to user
    }
  };
  
  // Delete asset
  const handleDeleteAsset = async (id) => {
    try {
      await deleteAsset(id);
    } catch (error) {
      console.error('Error deleting asset:', error);
      // Show error message to user
    }
  };
  
  // Filter assets based on category and search query
  const filteredAssets = assets && Array.isArray(assets) ? assets.filter(asset => {
    // Apply category filter
    const categoryMatch = selectedCategory === 'all' || 
                          asset.category_id === parseInt(selectedCategory, 10);
    
    // Apply search filter
    const searchMatch = !searchQuery || 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.notes && asset.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return categoryMatch && searchMatch;
  }) : [];
  
  // Get quality display elements
  const getQualityStars = (quality) => {
    const stars = [];
    const totalStars = 4; // bad, okay, good, amazing = 4 levels
    let filledStars = 0;
    
    switch (quality) {
      case 'amazing':
        filledStars = 4;
        break;
      case 'good':
        filledStars = 3;
        break;
      case 'okay':
        filledStars = 2;
        break;
      case 'bad':
        filledStars = 1;
        break;
      default:
        filledStars = 0;
    }
    
    for (let i = 0; i < totalStars; i++) {
      if (i < filledStars) {
        stars.push(<FaStar key={i} className="text-yellow-500" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-gray-400" />);
      }
    }
    
    return stars;
  };
  
  // Get quality text color
  const getQualityColor = (quality) => {
    switch (quality) {
      case 'amazing':
        return 'text-green-500';
      case 'good':
        return 'text-blue-500';
      case 'okay':
        return 'text-yellow-500';
      case 'bad':
        return 'text-red-500';
      default:
        return 'text-text-muted';
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    },
    exit: {
      opacity: 0,
      x: -100,
      transition: {
        duration: 0.2
      }
    }
  };

  console.log("AssetsPage render, assets:", assets);
  console.log("AssetsPage render, categories:", categories);

  return (
    <div className="container mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-text-primary mb-2 md:mb-0">Asset Library</h1>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex flex-col md:flex-row gap-3"
        >
          <div className="relative">
            <Input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
          </div>
          
          <Button 
            onClick={handleAddAsset}
            icon={<FaPlus />}
          >
            Add Asset
          </Button>
          
          <Button 
            variant="secondary"
            onClick={() => setIsCategoryModalOpen(true)}
            icon={<FaPlus />}
          >
            Add Category
          </Button>
        </motion.div>
      </div>
      
      {/* Category tabs */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="flex overflow-x-auto pb-2 mb-6 border-b border-background-light"
      >
        <button
          onClick={() => setSelectedCategory('all')}
          className={`pb-3 px-4 font-medium whitespace-nowrap ${
            selectedCategory === 'all' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-text-secondary'
          }`}
        >
          All Assets
        </button>
        
        {categories && Array.isArray(categories) && categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id.toString())}
            className={`pb-3 px-4 font-medium whitespace-nowrap ${
              selectedCategory === category.id.toString() 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-text-secondary'
            }`}
          >
            {category.icon} {category.name}
          </button>
        ))}
      </motion.div>
      
      {/* Asset table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden bg-background-light rounded-xl shadow-soft"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-background">
            <thead className="bg-background-dark">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Pricing
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Quality
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Notes
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Added By
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-background-light divide-y divide-background">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-text-muted">
                    No assets found. Add your first asset to get started.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset, index) => {
                  const userColor = getUserColor(asset.username);
                  
                  return (
                    <tr 
                      key={asset.id}
                      className={`${index % 2 === 0 ? 'bg-background-light' : 'bg-background'} 
                        hover:bg-background-dark transition-colors`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-text-primary">
                              {asset.url ? (
                                <a 
                                  href={asset.url.startsWith('http') ? asset.url : `https://${asset.url}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center hover:text-primary"
                                >
                                  {asset.name}
                                  <FaExternalLinkAlt className="ml-2 text-xs" />
                                </a>
                              ) : (
                                asset.name
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-text-secondary">
                          {asset.category_icon} {asset.category_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-text-secondary">
                          {asset.pricing || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm">
                          <span className={`mr-2 ${getQualityColor(asset.quality)}`}>
                            {asset.quality.charAt(0).toUpperCase() + asset.quality.slice(1)}
                          </span>
                          <div className="flex items-center">
                            {getQualityStars(asset.quality)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-text-secondary max-w-md truncate">
                          {asset.notes || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div 
                          className="text-sm px-2 py-1 rounded-full inline-flex items-center"
                          style={{ 
                            backgroundColor: `${userColor}20`, 
                            color: userColor 
                          }}
                        >
                          <FaUser className="mr-1" size={8} />
                          {asset.username}
                          {currentUser && asset.username === currentUser.username && <span className="ml-1">(me)</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditAsset(asset)}
                            className="p-1.5 text-text-secondary hover:text-primary rounded-full hover:bg-background transition-colors"
                            disabled={asset.username !== currentUser?.username}
                          >
                            <FaEdit />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteAsset(asset.id)}
                            className="p-1.5 text-text-secondary hover:text-accent rounded-full hover:bg-background transition-colors"
                            disabled={asset.username !== currentUser?.username}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
      
      {/* Add/Edit Asset Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editMode ? "Edit Asset" : "Add New Asset"}
      >
        <form onSubmit={handleSaveAsset}>
          <Input
            ref={nameRef}
            label="Asset Name"
            placeholder="Enter asset name"
            defaultValue={currentAsset?.name || ''}
            required
            autoFocus
          />
          
          <Input
            ref={urlRef}
            label="URL (optional)"
            placeholder="Enter URL"
            defaultValue={currentAsset?.url || ''}
          />
          
          <div className="mb-4">
            <label className="block text-text-primary mb-2 font-medium">
              Notes (optional)
            </label>
            <textarea
              ref={notesRef}
              className="w-full p-4 bg-background-dark border border-background-light rounded-lg text-text-primary min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Add notes about this asset..."
              defaultValue={currentAsset?.notes || ''}
            ></textarea>
          </div>
          
          <Input
            ref={pricingRef}
            label="Pricing (optional)"
            placeholder="Free, $10/mo, One-time $49, etc."
            defaultValue={currentAsset?.pricing || ''}
          />
          
          <div className="mb-4">
            <label className="block text-text-primary mb-2 font-medium">
              Quality
            </label>
            <select
              ref={qualityRef}
              className="block w-full px-4 py-2 bg-background-dark border border-background-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              defaultValue={currentAsset?.quality || 'good'}
              required
            >
              <option value="amazing">Amazing ★★★★</option>
              <option value="good">Good ★★★☆</option>
              <option value="okay">Okay ★★☆☆</option>
              <option value="bad">Bad ★☆☆☆</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-text-primary mb-2 font-medium">
              Category
            </label>
            <select
              ref={categoryRef}
              className="block w-full px-4 py-2 bg-background-dark border border-background-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              defaultValue={currentAsset?.category_id || ''}
              required
            >
              <option value="" disabled>Select a category</option>
              {categories && Array.isArray(categories) && categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            
            <Button type="submit">
              {editMode ? "Update Asset" : "Add Asset"}
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* Add Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Add New Category"
      >
        <form onSubmit={handleSaveCategory}>
          <Input
            ref={categoryNameRef}
            label="Category Name"
            placeholder="Enter category name"
            required
            autoFocus
          />
          
          <Input
            ref={categoryIconRef}
            label="Icon (emoji)"
            placeholder="Paste an emoji (e.g., 🎨, 🎧, 🛠️)"
            defaultValue="📁"
            required
          />
          
          <div className="mb-4">
            <label className="block text-text-primary mb-2 font-medium">
              Description (optional)
            </label>
            <textarea
              ref={categoryDescRef}
              className="w-full p-4 bg-background-dark border border-background-light rounded-lg text-text-primary min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Add a description for this category..."
            ></textarea>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsCategoryModalOpen(false)}
            >
              Cancel
            </Button>
            
            <Button type="submit">
              Add Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AssetsPage;
