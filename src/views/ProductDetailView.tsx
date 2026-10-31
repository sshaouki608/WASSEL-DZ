import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { api } from '../services/api.ts';
import type { PublicProduct } from '../types/index.ts';
import {
  MapPin,
  ShoppingBag,
  Share2,
  Check,
  ChevronRight,
  ShieldCheck,
  Truck,
  Eye,
  Calendar,
  Layers,
  MessageCircle,
} from 'lucide-react';

export const ProductDetailView: React.FC = () => {
  const {
    selectedProductId,
    setView,
    openOrderModal,
    addToCart,
    showToast,
    navigateToProduct,
  } = useApp();

  const [product, setProduct] = useState<PublicProduct | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<PublicProduct[]>([]);

  useEffect(() => {
    if (!selectedProductId) {
      setView('catalog');
      return;
    }

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const data = await api.getProductById(selectedProductId);
        setProduct(data);
        setActiveImageIndex(0);

        // Fetch related products in same category
        const allProds = await api.getProducts({ category: data.category });
        setRelatedProducts(allProds.filter((p) => p.id !== data.id).slice(0, 4));
      } catch (err: any) {
        showToast(err.message || 'فشل في تحميل تفاصيل المنتج', 'error');
        setView('catalog');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [selectedProductId]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      showToast('تم نسخ رابط المنتج بنجاح', 'success');
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const shareViaWhatsApp = () => {
    if (!product) return;
    const text = encodeURIComponent(
      `شاهد هذا المنتج الرائع على WASSEL DZ: ${product.title}\nبسعر: ${product.finalPrice.toLocaleString()} دج\n${window.location.href}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-semibold text-slate-600">جاري تحميل تفاصيل المنتج...</p>
      </div>
    );
  }

  if (!product) return null;

  const imagesList = product.images && product.images.length > 0 ? product.images : [product.mainImage];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <button onClick={() => setView('home')} className="hover:text-emerald-700 transition-colors">
          الرئيسية
        </button>
        <ChevronRight className="w-3.5 h-3.5 rotate-180 text-slate-400" />
        <button onClick={() => setView('catalog')} className="hover:text-emerald-700 transition-colors">
          {product.category}
        </button>
        <ChevronRight className="w-3.5 h-3.5 rotate-180 text-slate-400" />
        <span className="text-slate-800 font-bold truncate max-w-xs">{product.title}</span>
      </div>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Image Gallery (Col 7) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Display */}
          <div className="relative aspect-4/3 rounded-3xl bg-white border border-slate-200/90 overflow-hidden shadow-sm flex items-center justify-center">
            <img
              src={imagesList[activeImageIndex] || product.mainImage}
              alt={product.title}
              className="w-full h-full object-contain"
            />
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="text-xs font-bold bg-white/95 backdrop-blur-xs text-slate-800 px-3 py-1 rounded-lg shadow-sm border border-slate-200/70">
                {product.condition}
              </span>
              {product.featured && (
                <span className="text-xs font-extrabold bg-amber-500 text-slate-950 px-2.5 py-1 rounded-lg shadow-sm">
                  منتج مميز
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails row */}
          {imagesList.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer bg-white ${
                    activeImageIndex === idx
                      ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`صورة ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Details & Purchase Module (Col 5) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 mb-2">
              <span>{product.category}</span>
              <div className="flex items-center gap-1 text-slate-400 font-normal">
                <Eye className="w-3.5 h-3.5" />
                <span className="tabular-nums">{product.views} مشاهدة</span>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug mb-3">
              {product.title}
            </h1>

            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{product.wilaya} {product.baladiya ? `· ${product.baladiya}` : ''}</span>
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-emerald-700 font-bold">
                {product.quantity > 0 ? `متوفر في المخزون (${product.quantity} قطعة)` : 'نفدت الكمية'}
              </span>
            </div>
          </div>

          {/* Price display */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-baseline justify-between">
            <span className="text-xs font-bold text-slate-500">السعر النهائي:</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 tabular-nums">
              {product.finalPrice.toLocaleString()}{' '}
              <span className="text-sm font-bold text-slate-600">دج</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => openOrderModal(product)}
              className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-sm rounded-2xl shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5 text-amber-300" />
              <span>اطلب الآن – دفع عند الاستلام</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => addToCart(product)}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
              >
                + أضف إلى السلة
              </button>

              <button
                onClick={shareViaWhatsApp}
                className="py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>مشاركة عبر واتساب</span>
              </button>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-4 border-t border-slate-100 space-y-3 text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <span>شحن سريع متوفر لجميع ولايات الوطن (58 ولاية)</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>ضمان الفحص والمعاينة قبل تسديد ثمن الطلبية نقداً</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
        <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
          تفاصيل ومواصفات المنتج
        </h3>
        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
          {product.description || 'لا يوجد وصف تفصيلي إضافي لهذا المنتج.'}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-4">
          <h3 className="text-xl font-black text-slate-900">منتجات مشابهة قد تهمك</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => navigateToProduct(p.id)}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col"
              >
                <div className="aspect-4/3 bg-slate-100 overflow-hidden">
                  <img src={p.mainImage} alt={p.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-emerald-700 font-bold block mb-1">
                      {p.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mb-2">{p.title}</h4>
                  </div>
                  <div className="text-sm font-black text-emerald-700">
                    {p.finalPrice.toLocaleString()} دج
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
