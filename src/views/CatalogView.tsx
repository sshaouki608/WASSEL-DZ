import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { api } from '../services/api.ts';
import type { PublicProduct } from '../types/index.ts';
import { ALGERIAN_WILAYAS } from '../data/wilayas.ts';
import {
  Search,
  Filter,
  MapPin,
  ShoppingBag,
  SlidersHorizontal,
  Package,
  PlusCircle,
  X,
} from 'lucide-react';

export const CatalogView: React.FC = () => {
  const {
    categories,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedWilaya,
    setSelectedWilaya,
    sortOption,
    setSortOption,
    openOrderModal,
    addToCart,
    navigateToProduct,
    setView,
  } = useApp();

  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const data = await api.getProducts({
          search: searchQuery || undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          wilaya: selectedWilaya !== 'all' ? selectedWilaya : undefined,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          sort: sortOption,
        });
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch catalog', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [searchQuery, selectedCategory, selectedWilaya, minPrice, maxPrice, sortOption]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedWilaya('all');
    setMinPrice('');
    setMaxPrice('');
    setSortOption('newest');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            سوق WASSEL DZ – جميع المعروضات
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            تصفح المنتجات المتوفرة والمفحوصة مع إمكانية التصفية حسب الولاية أو السعر
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter toggle button */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <span>تصفية ({products.length})</span>
          </button>

          {/* Sort Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap hidden sm:inline">
              الترتيب:
            </span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="text-xs font-medium py-2 px-3 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:border-emerald-600"
            >
              <option value="newest">الأحدث أولاً</option>
              <option value="price_asc">السعر: من الأقل للأعلى</option>
              <option value="price_desc">السعر: من الأعلى للأقل</option>
              <option value="views">الأكثر مشاهدة</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className={`md:block space-y-6 ${showMobileFilters ? 'block' : 'hidden'}`}>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-emerald-600" />
                <span>خيارات التصفية</span>
              </span>
              <button
                onClick={resetAllFilters}
                className="text-[11px] text-emerald-700 hover:underline font-semibold cursor-pointer"
              >
                إعادة ضبط
              </button>
            </div>

            {/* Keyword Search */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">بحث بكلمة دلالية</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="اسم المنتج..."
                  className="w-full text-xs py-2 pr-8 pl-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-emerald-600"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">التصنيف</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-emerald-600"
              >
                <option value="all">كل التصنيفات ({categories.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Wilaya Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                الولاية (58 ولاية)
              </label>
              <select
                value={selectedWilaya}
                onChange={(e) => setSelectedWilaya(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-emerald-600"
              >
                <option value="all">كل الولايات الجزائرية</option>
                {ALGERIAN_WILAYAS.map((w) => (
                  <option key={w.code} value={w.nameAr}>
                    {w.code} - {w.nameAr}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                نطاق السعر (دج)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="الحد الأدنى"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                  className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-center"
                />
                <input
                  type="number"
                  placeholder="الحد الأقصى"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                  className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-center"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Products Grid Content (3 Cols) */}
        <div className="md:col-span-3">
          {loading ? (
            <div className="py-24 text-center">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs font-medium text-slate-500">جاري جلب المنتجات...</p>
            </div>
          ) : products.length === 0 ? (
            /* MANDATORY STRICT EMPTY STATE */
            <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center space-y-6 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <Package className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-black text-slate-900">
                  لا توجد منتجات حاليًا، ترقبوا منتجاتنا الجديدة
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  لم يتم نشر منتجات تطابق هذا البحث أو أن السوق قيد استقبال منتجات البائعين الجدد.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setView('submit-product')}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
                  <span>اعرض منتجك للبيع</span>
                </button>
                <button
                  onClick={resetAllFilters}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء الفلاتر
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                >
                  <div
                    onClick={() => navigateToProduct(product.id)}
                    className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={product.mainImage}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end">
                      <span className="text-[10px] font-semibold bg-white/90 text-slate-800 px-2 py-0.5 rounded-md shadow-xs">
                        {product.condition}
                      </span>
                      {product.featured && (
                        <span className="text-[9px] font-bold bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded shadow-xs">
                          مميز
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-2.5 right-2.5 bg-slate-950/70 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      <span>{product.wilaya}</span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-emerald-700 font-bold block mb-1">
                        {product.category}
                      </span>
                      <h3
                        onClick={() => navigateToProduct(product.id)}
                        className="text-xs font-bold text-slate-900 line-clamp-2 hover:text-emerald-700 transition-colors cursor-pointer mb-2"
                      >
                        {product.title}
                      </h3>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-slate-400">السعر:</span>
                        <span className="text-base font-black text-emerald-700 tabular-nums">
                          {product.finalPrice.toLocaleString()}{' '}
                          <span className="text-xs font-semibold text-slate-600">دج</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => openOrderModal(product)}
                          className="py-2 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <ShoppingBag className="w-3 h-3 text-amber-300" />
                          <span>اطلب الآن</span>
                        </button>

                        <button
                          onClick={() => addToCart(product)}
                          className="py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer text-center"
                        >
                          + السلة
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
