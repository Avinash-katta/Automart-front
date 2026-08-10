import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Tag, Plus, Loader2 } from 'lucide-react';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [adding, setAdding] = useState(false);
  const { showToast } = useToast();

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
      showToast('Error loading categories.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [showToast]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      showToast('Category name is required.', 'error');
      return;
    }

    setAdding(true);
    try {
      await api.post('/admin/categories', { name: newCategoryName.trim() });
      showToast('Category added successfully!', 'success');
      setNewCategoryName('');
      fetchCategories();
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to add category.';
      showToast(errorMsg, 'error');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading category lists...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Category Directory</h1>
        <p className="text-xs text-slate-400 font-light mt-0.5">Define classifications and product groupings for storefront catalog discovery</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Add Form */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Add New Category</h3>
            <p className="text-[10px] text-slate-400 font-light mt-0.5">Creates a new classification folder</p>
          </div>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Interior Trims, Exhausts"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-3 px-4 outline-none focus:border-amber-500 font-semibold"
              />
            </div>
            <button
              type="submit"
              disabled={adding}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 disabled:opacity-50 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {adding ? <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span> : <><Plus className="w-4 h-4" /> Add Category</>}
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden md:col-span-2">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
            <Tag className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Active Classifications ({categories.length})</h3>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {categories.map((c) => (
              <div key={c.categoryId} className="p-4 flex items-center justify-between font-bold text-slate-900 hover:bg-slate-50/50 transition-colors">
                <span>{c.categoryName}</span>
                <span className="text-[10px] text-slate-400 font-medium">ID: #{c.categoryId}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
