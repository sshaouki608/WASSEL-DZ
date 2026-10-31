import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { api } from '../services/api.ts';
import type { PublicProduct } from '../types/index.ts';
import { ALGERIAN_WILAYAS } from '../data/wilayas.ts';
import {
  Search,
  Sparkles,
  ShoppingBag,
  PlusCircle,
  MapPin,
  ChevronLeft,
  Package,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const {
    setView,
    categories,
    selectedCategory,
    setSelectedCategory,
    selectedWilaya,
    setSelectedWilaya,
    searchQuery,
    setSearchQuery,
    openOrderModal,
    addToCart,
    navigateToProduct,
  } = useApp();

  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch approved published products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await api.getProducts({
          search: searchQuery || undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          wilaya: selectedWilaya !== 'all' ? selectedWilaya : undefined,
        });
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, selectedCategory, selectedWilaya]);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Showcase Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white shadow-xl border border-emerald-800/40 mx-4 sm:mx-6 lg:mx-8 mt-6">
        {/* Subtle geometric background overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>

        <div className="relative max-w-5xl mx-auto px-6 py-14 sm:py-20 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/60 border border-emerald-600/40 text-amber-300 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>السوق الجزائري الإلكتروني الموثوق</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight max-w-3xl mx-auto">
            سوقك الجزائري <span className="text-amber-400">في مكان واحد</span>
          </h1>

          <p className="text-sm sm:text-lg text-emerald-100/90 max-w-2xl mx-auto leading-relaxed font-normal">
            منصة WASSEL DZ تربط بين نخبة البائعين والمشترين عبر كافة الولايات الـ 58. بيع وشراء آمن، جودة مفحوصة، ودفع نقداً عند استلام طلبيتك.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setView('submit-product')}
              className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/20 hover:scale-102 active:scale-98 transition-all cursor-pointer flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-slate-900" />
              <span>اعرض منتجك للبيع الآن</span>
            </button>

            <button
              onClick={() => setView('catalog')}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl border border-white/20 backdrop-blur-xs hover:scale-102 active:scale-98 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>تصفح جميع المنتجات</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Main Filter & Category Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم أو الوصف..."
                className="w-full text-sm py-2.5 pr-10 pl-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
            </div>

            {/* Category Dropdown */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-sm py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
              >
                <option value="all">جميع التصنيفات ({categories.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Wilaya Filter */}
            <div>
              <select
                value={selectedWilaya}
                onChange={(e) => setSelectedWilaya(e.target.value)}
                className="w-full text-sm py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
              >
                <option value="all">كل الولايات الجزائرية (58 ولاية)</option>
                {ALGERIAN_WILAYAS.map((w) => (
                  <option key={w.code} value={w.nameAr}>
                    {w.code} - {w.nameAr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Category Chips */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              الكل
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`text-xs px-3.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.name
                    ? 'bg-emerald-700 text-white shadow-xs font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Products Grid or Strict Empty State */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {selectedCategory !== 'all' ? selectedCategory : 'أحدث المنتجات المعروضة'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              منتجات أصلية معتمدة من إدارة المنصة مع ضمان التوصيل
            </p>
          </div>

          {products.length > 0 && (
            <button
              onClick={() => setView('catalog')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>مشاهدة الكل ({products.length})</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-medium">جاري تحميل المنتجات المعروضة...</p>
          </div>
        ) : products.length === 0 ? (
          /* MANDATORY STRICT EMPTY STATE AS SPECIFIED BY USER */
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 sm:p-16 text-center max-w-2xl mx-auto shadow-xs space-y-6">
            <div className="w-20 h-20 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-100">
              <Package className="w-10 h-10 stroke-[1.5]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                لا توجد منتجات حاليًا، ترقبوا منتجاتنا الجديدة
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                سوق WASSEL DZ يبدأ فارغاً ونعتمد فقط المنتجات الحقيقية بعد مراجعتها وتأكيدها من قبل الإدارة. هل أنت بائع وتريد نشر منتجاتك؟
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setView('submit-product')}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-700/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4 text-amber-300" />
                <span>اعرض منتجك للبيع الآن</span>
              </button>

              {(searchQuery || selectedCategory !== 'all' || selectedWilaya !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedWilaya('all');
                  }}
                  className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  إعادة ضبط الفلاتر
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Real Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col"
              >
                {/* Image Container */}
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
                    <span className="text-[11px] font-semibold bg-white/90 backdrop-blur-xs text-slate-800 px-2 py-0.5 rounded-md shadow-xs">
                      {product.condition}
                    </span>
                    {product.featured && (
                      <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md shadow-xs">
                        مميز
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 bg-slate-950/70 backdrop-blur-xs text-white text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>{product.wilaya}</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] text-emerald-700 font-semibold mb-1">
                      {product.category}
                    </div>
                    <h3
                      onClick={() => navigateToProduct(product.id)}
                      className="text-sm font-bold text-slate-900 line-clamp-2 hover:text-emerald-700 transition-colors cursor-pointer mb-2"
                      title={product.title}
                    >
                      {product.title}
                    </h3>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-400">السعر:</span>
                      <span className="text-lg font-black text-emerald-700 tabular-nums">
                        {product.finalPrice.toLocaleString()}{' '}
                        <span className="text-xs font-semibold text-slate-600">دج</span>
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => openOrderModal(product)}
                        className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
                        <span>اطلب الآن</span>
                      </button>

                      <button
                        onClick={() => addToCart(product)}
                        className="py-2 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer text-center"
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
      </section>

      {/* Seller Invitation Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-l from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 text-white border border-slate-700/60 shadow-lg flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center lg:text-right">
            <span className="text-xs font-extrabold text-amber-400 tracking-wider">
              هل أنت تاجر أو حرفي أو صاحب متجر؟
            </span>
            <h3 className="text-2xl sm:text-3xl font-black leading-snug">
              انضم إلى WASSEL DZ واعرض منتجاتك لآلاف الزبائن في 58 ولاية
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              أنت تحدد سعر منتجك ونحن نتولى التسويق، مراجعة ونشر المنتجات، واستقبال الطلبات وتأكيدها. لا عمولات مخفية ولا اشتراكات معقدة.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => setView('submit-product')}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span>أرسل منتجك الآن مجاناً</span>
            </button>
            <button
              onClick={() => setView('how-to-sell')}
              className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl border border-slate-600 transition-colors cursor-pointer"
            >
              تعرف على آلية العمل
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
