import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  ShoppingBag,
  Search,
  PlusCircle,
  Shield,
  Menu,
  X,
  Phone,
  MessageCircle,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    view,
    setView,
    cart,
    searchQuery,
    setSearchQuery,
    isAdmin,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setView('catalog');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      {/* Top micro bar with contact & trust banner */}
      <div className="bg-emerald-950 text-emerald-100 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-medium tracking-wide">
              WASSEL DZ – سوقك الجزائري في مكان واحد
            </span>
            <span className="hidden md:inline text-emerald-400/80">·</span>
            <span className="hidden md:inline text-emerald-300">
              توصيل مضمون لـ 58 ولاية والدفع عند الاستلام
            </span>
          </div>
          <div className="flex items-center gap-4 text-emerald-200">
            <a
              href="https://wa.me/213667661934"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="tabular-nums dir-ltr text-xs">+213 667 661 934</span>
            </a>
            <span className="text-emerald-700">|</span>
            <button
              onClick={() => {
                setView('admin');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1 hover:text-amber-300 transition-colors cursor-pointer text-xs"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAdmin ? 'لوحة التحكم (نشطة)' : 'دخول الإدارة'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar (Strict 3-zone contract) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark & Emblem */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 text-right group cursor-pointer focus:outline-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <span className="font-black text-lg tracking-wider text-amber-300">W</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                WASSEL <span className="text-emerald-600">DZ</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-500 tracking-wide">
                السوق الإلكتروني الجزائري
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links & Search (Desktop) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-700">
          <button
            onClick={() => setView('home')}
            className={`whitespace-nowrap transition-colors hover:text-emerald-700 py-1 border-b-2 cursor-pointer ${
              view === 'home' ? 'text-emerald-700 border-emerald-600' : 'border-transparent'
            }`}
          >
            الرئيسية
          </button>
          <button
            onClick={() => setView('catalog')}
            className={`whitespace-nowrap transition-colors hover:text-emerald-700 py-1 border-b-2 cursor-pointer ${
              view === 'catalog' ? 'text-emerald-700 border-emerald-600' : 'border-transparent'
            }`}
          >
            تصفح المنتجات
          </button>
          <button
            onClick={() => setView('how-to-sell')}
            className={`whitespace-nowrap transition-colors hover:text-emerald-700 py-1 border-b-2 cursor-pointer ${
              view === 'how-to-sell' ? 'text-emerald-700 border-emerald-600' : 'border-transparent'
            }`}
          >
            كيفية البيع
          </button>
          <button
            onClick={() => setView('contact')}
            className={`whitespace-nowrap transition-colors hover:text-emerald-700 py-1 border-b-2 cursor-pointer ${
              view === 'contact' ? 'text-emerald-700 border-emerald-600' : 'border-transparent'
            }`}
          >
            اتصل بنا
          </button>
        </nav>

        {/* Search Input in middle for larger screens */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex items-center relative flex-1 max-w-md mx-2"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن منتج، علامة، أو ولاية..."
            className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-sm text-slate-800 placeholder-slate-400 rounded-full py-2.5 pr-10 pl-4 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden transition-all"
          />
          <button
            type="submit"
            className="absolute right-3 text-slate-400 hover:text-emerald-600 transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Zone 3: Primary Action & Quick Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Mobile search toggle */}
          <button
            onClick={() => setShowSearchInput(!showSearchInput)}
            className="md:hidden p-2 text-slate-600 hover:text-emerald-700 rounded-lg"
            aria-label="البحث"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Cart Icon */}
          <button
            onClick={() => setView('cart')}
            className="relative p-2.5 text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            aria-label="سلة التسوق"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -left-1 bg-amber-500 text-slate-950 font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* Primary Action Button: "اعرض منتجك للبيع" */}
          <button
            onClick={() => setView('submit-product')}
            className="hidden sm:inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs md:text-sm px-4 py-2.5 rounded-xl shadow-sm shadow-emerald-600/20 hover:shadow-md transition-all cursor-pointer whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4 text-amber-300" />
            <span>اعرض منتجك للبيع</span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 hover:text-emerald-700 rounded-lg focus:outline-hidden"
            aria-label="القائمة"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar Dropdown */}
      {showSearchInput && (
        <div className="md:hidden px-4 pb-3 pt-1 border-t border-slate-100">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن المنتجات..."
              className="w-full bg-slate-100 text-sm text-slate-800 placeholder-slate-400 rounded-xl py-2.5 pr-10 pl-4 border border-slate-200 focus:outline-hidden focus:border-emerald-500"
              autoFocus
            />
            <button type="submit" className="absolute right-3 text-slate-400">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <button
            onClick={() => {
              setView('home');
              setMobileMenuOpen(false);
            }}
            className="w-full text-right py-2 text-slate-800 font-semibold hover:text-emerald-700"
          >
            الرئيسية
          </button>
          <button
            onClick={() => {
              setView('catalog');
              setMobileMenuOpen(false);
            }}
            className="w-full text-right py-2 text-slate-800 font-semibold hover:text-emerald-700"
          >
            تصفح جميع المنتجات
          </button>
          <button
            onClick={() => {
              setView('submit-product');
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between py-2 text-emerald-700 font-bold bg-emerald-50 px-3 rounded-lg"
          >
            <span>اعرض منتجك للبيع</span>
            <PlusCircle className="w-4 h-4 text-amber-500" />
          </button>
          <button
            onClick={() => {
              setView('how-to-sell');
              setMobileMenuOpen(false);
            }}
            className="w-full text-right py-2 text-slate-800 font-semibold hover:text-emerald-700"
          >
            كيفية البيع عبر WASSEL DZ
          </button>
          <button
            onClick={() => {
              setView('contact');
              setMobileMenuOpen(false);
            }}
            className="w-full text-right py-2 text-slate-800 font-semibold hover:text-emerald-700"
          >
            اتصل بنا
          </button>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                setView('admin');
                setMobileMenuOpen(false);
              }}
              className="text-xs font-semibold text-slate-600 hover:text-emerald-700 flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4 text-amber-500" />
              <span>لوحة الإدارة</span>
            </button>
            <a
              href="tel:+213667661934"
              className="text-xs font-semibold text-emerald-700 flex items-center gap-1"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>اتصل بنا</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
