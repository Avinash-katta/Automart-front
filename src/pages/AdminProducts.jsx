import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Plus, Search, Edit2, Trash2, X, AlertCircle, Loader2, Star } from 'lucide-react';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentProductId, setCurrentProductId] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    brand: '',
    status: 'ACTIVE',
    featured: false,
    imageUrls: [''] // array of image URLs
  });
  const [formPending, setFormPending] = useState(false);

  // Deletion confirm modal
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deletePending, setDeletePending] = useState(false);

  const fetchInitialData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error('Failed to load products/categories:', error);
      showToast('Error loading inventory data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [showToast]);

  const handleToggleFeatured = async (product) => {
    const updatedPayload = {
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.category?.categoryId,
      brand: product.brand,
      status: product.status,
      featured: !product.featured,
      images: product.images ? product.images.map(img => img.imageUrl) : []
    };
    try {
      await api.put(`/admin/products/${product.productId}`, updatedPayload);
      showToast(`${product.name} ${!product.featured ? 'highlighted as featured' : 'removed from featured'} successfully!`, 'success');
      fetchInitialData();
    } catch (e) {
      showToast('Failed to update featured status', 'error');
    }
  };

  const handleOpenAdd = () => {
    setModalMode('add');
    setCurrentProductId(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      categoryId: categories[0]?.categoryId?.toString() || '',
      brand: '',
      status: 'ACTIVE',
      featured: false,
      imageUrls: ['']
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setModalMode('edit');
    setCurrentProductId(product.productId);
    const existingImages = product.images && product.images.length > 0
      ? product.images.map(img => img.imageUrl)
      : [''];

    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price ? product.price.toString() : '',
      stock: product.stock ? product.stock.toString() : '',
      categoryId: product.category?.categoryId?.toString() || '',
      brand: product.brand || '',
      status: product.status || 'ACTIVE',
      featured: product.featured || false,
      imageUrls: existingImages
    });
    setIsModalOpen(true);
  };

  const handleImageChange = (index, value) => {
    const newUrls = [...formData.imageUrls];
    newUrls[index] = value;
    setFormData({ ...formData, imageUrls: newUrls });
  };

  const handleAddImageUrlField = () => {
    setFormData({ ...formData, imageUrls: [...formData.imageUrls, ''] });
  };

  const handleRemoveImageUrlField = (index) => {
    if (formData.imageUrls.length <= 1) return;
    const newUrls = formData.imageUrls.filter((_, i) => i !== index);
    setFormData({ ...formData, imageUrls: newUrls });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Validation checks
    if (!formData.name.trim()) {
      showToast('Product Name is required', 'error');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      showToast('Price must be a positive number', 'error');
      return;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      showToast('Stock cannot be negative', 'error');
      return;
    }
    if (!formData.categoryId) {
      showToast('Please select a valid category', 'error');
      return;
    }

    const cleanedImages = formData.imageUrls.filter(url => url && url.trim() !== '');

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      categoryId: parseInt(formData.categoryId),
      brand: formData.brand.trim(),
      status: formData.status,
      featured: formData.featured,
      images: cleanedImages
    };

    setFormPending(true);
    try {
      if (modalMode === 'add') {
        await api.post('/admin/products', payload);
        showToast('Product added successfully!', 'success');
      } else {
        await api.put(`/admin/products/${currentProductId}`, payload);
        showToast('Product updated successfully!', 'success');
      }
      setIsModalOpen(false);
      fetchInitialData();
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to save product details.';
      showToast(errorMsg, 'error');
    } finally {
      setFormPending(false);
    }
  };

  const handleDeleteClick = (productId) => {
    setDeleteConfirmId(productId);
  };

  const confirmDelete = async () => {
    setDeletePending(true);
    try {
      await api.delete(`/admin/products/${deleteConfirmId}`);
      showToast('Product deleted/deactivated successfully.', 'success');
      setDeleteConfirmId(null);
      fetchInitialData();
    } catch (error) {
      showToast('Failed to delete product.', 'error');
    } finally {
      setDeletePending(false);
    }
  };

  // Filter and sort computation
  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === '' || p.category?.categoryId?.toString() === categoryFilter;
      const matchesStatus = statusFilter === '' || p.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name-asc') return a.name?.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name?.localeCompare(a.name);
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });

  // Pagination computation
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading Inventory logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Product Inventory</h1>
          <p className="text-xs text-slate-400 font-light mt-0.5">Manage catalog listings, status flag settings, and stocks</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-amber-500/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search name, brand..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2.5 pl-9 pr-4 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-semibold"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
          className="bg-slate-50 border border-slate-200 text-xs rounded-xl py-2.5 px-3 outline-none focus:border-amber-500 font-semibold"
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="bg-slate-50 border border-slate-200 text-xs rounded-xl py-2.5 px-3 outline-none focus:border-amber-500 font-semibold"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="DRAFT">DRAFT</option>
          <option value="DEACTIVATED">DEACTIVATED</option>
        </select>

        {/* Sorting */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs rounded-xl py-2.5 px-3 outline-none focus:border-amber-500 font-semibold"
        >
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="price-asc">Price (Low to High)</option>
          <option value="price-desc">Price (High to Low)</option>
        </select>
      </div>

      {/* Catalog Table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="p-4 pl-6">Product</th>
                <th className="p-4">Brand</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {currentProducts.map((p) => (
                <tr key={p.productId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/50 flex-shrink-0 flex items-center justify-center font-bold text-slate-400">
                        {p.images && p.images.length > 0 ? (
                          <img src={p.images[0].imageUrl} alt={p.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          p.name?.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-950 line-clamp-1">{p.name}</p>
                        {p.featured && (
                          <span className="text-[8px] bg-amber-100 text-amber-700 font-extrabold px-1.5 py-0.5 rounded uppercase mt-0.5 inline-block">Featured</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-slate-600">{p.brand || 'AutoMart'}</td>
                  <td className="p-4 font-semibold text-slate-600">{p.category?.categoryName}</td>
                  <td className="p-4 font-extrabold text-slate-950">₹{p.price?.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`font-bold ${p.stock === 0 ? 'text-red-500' : 'text-slate-700'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      p.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' :
                      p.status === 'DRAFT' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right space-x-1.5">
                    <button
                      onClick={() => handleToggleFeatured(p)}
                      className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer inline-flex items-center ${
                        p.featured ? 'text-amber-500' : 'text-slate-350 hover:text-amber-500'
                      }`}
                      title={p.featured ? 'Remove from Featured' : 'Feature Product'}
                    >
                      <Star className={`w-4 h-4 ${p.featured ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 text-slate-500 hover:text-amber-500 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer inline-flex items-center"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(p.productId)}
                      className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer inline-flex items-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Row */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/20 text-xs font-bold text-slate-500">
            <span>Showing {indexOfFirstProduct + 1} - {Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} items</span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-2 border border-slate-200 rounded-xl hover:border-slate-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3.5 py-2 border border-slate-200 rounded-xl hover:border-slate-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-100 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-850 animate-slide-in relative my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-6 top-6 p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                {modalMode === 'add' ? 'Add Product Listing' : 'Edit Product Details'}
              </h3>
              <p className="text-xs text-slate-400 font-light mt-0.5">Please provide specifications for inventory updates.</p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Product Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Carbon Steering Wheel Trim"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-3 px-4 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-semibold"
                />
              </div>

              {/* Brand & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. Brembo, AutoMart"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-3 px-4 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category Selection</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-3 px-4 outline-none focus:border-amber-500 font-semibold"
                  >
                    {categories.map(c => (
                      <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Price (INR)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="₹550"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-3 px-4 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Units in Stock</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="99"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-3 px-4 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Specification Description</label>
                <textarea
                  rows="2"
                  placeholder="Details of performance metrics, materials, compatibility..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-3 px-4 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-semibold"
                />
              </div>

              {/* Status & Featured Flags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-3 px-4 outline-none focus:border-amber-500 font-semibold"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="DEACTIVATED">DEACTIVATED</option>
                  </select>
                </div>
                <div className="flex items-center gap-2.5 pt-4">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 text-amber-500 accent-amber-500 border-slate-300 rounded focus:ring-amber-500"
                  />
                  <label htmlFor="featured" className="text-xs font-bold text-slate-700 uppercase tracking-wider cursor-pointer">
                    Feature on Home Hero
                  </label>
                </div>
              </div>

              {/* Image URL Strips */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Product Images</label>
                  <button
                    type="button"
                    onClick={handleAddImageUrlField}
                    className="text-[9px] font-black uppercase text-amber-500 hover:text-amber-600 transition-colors cursor-pointer"
                  >
                    + Add image URL
                  </button>
                </div>
                <div className="max-h-28 overflow-y-auto space-y-2 pr-1">
                  {formData.imageUrls.map((url, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="https://ik.imagekit.io/..."
                        value={url}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                        className="flex-grow bg-slate-50 border border-slate-200 text-xs rounded-xl py-2 px-3 outline-none"
                      />
                      {formData.imageUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveImageUrlField(index)}
                          className="p-1.5 text-slate-400 hover:text-red-500 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={formPending}
                  className="flex-1 py-3.5 border border-slate-200 hover:border-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formPending}
                  className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-500/10 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {formPending ? <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span> : 'Save product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-slate-100 shadow-2xl space-y-6 text-slate-850 animate-slide-in">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-red-50 border border-red-100 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6 animate-bounce" />
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Confirm Deletion</h3>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                Are you sure you want to delete this product? If it has been purchased in previous orders, it will be logically deactivated instead to preserve billing histories.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={deletePending}
                className="flex-1 py-3 border border-slate-200 hover:border-slate-800 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deletePending}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-md shadow-red-100"
              >
                {deletePending ? 'Deleting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
