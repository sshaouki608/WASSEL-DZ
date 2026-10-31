import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { api, getAdminToken } from '../services/api.ts';
import type {
  Product,
  ProductSubmission,
  Order,
  Seller,
  DashboardMetrics,
  Category,
  PlatformSettings,
  ContactMessage,
  OrderStatus,
} from '../types/index.ts';
import { ALGERIAN_WILAYAS } from '../data/wilayas.ts';
import {
  Shield,
  LayoutDashboard,
  Clock,
  Package,
  Users,
  ShoppingBag,
  Layers,
  Settings,
  Mail,
  Download,
  LogOut,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Pause,
  Play,
  Star,
  Phone,
  MessageCircle,
  TrendingUp,
  AlertCircle,
  Plus,
  RefreshCw,
} from 'lucide-react';

type AdminTab =
  | 'overview'
  | 'submissions'
  | 'products'
  | 'sellers'
  | 'orders'
  | 'categories'
  | 'settings'
  | 'messages';

export const AdminView: React.FC = () => {
  const { setView, showToast, refreshConfig, refreshCategories } = useApp();

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Data states
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<ProductSubmission[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Modals / Actions state
  const [selectedSubmission, setSelectedSubmission] = useState<ProductSubmission | null>(null);
  const [approvalFinalPrice, setApprovalFinalPrice] = useState<number | ''>('');
  const [approvalPlatformFee, setApprovalPlatformFee] = useState<number | ''>('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Product Add / Edit modal state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodFormTitle, setProdFormTitle] = useState('');
  const [prodFormDesc, setProdFormDesc] = useState('');
  const [prodFormCategory, setProdFormCategory] = useState('');
  const [prodFormSellerPrice, setProdFormSellerPrice] = useState<number | ''>('');
  const [prodFormPlatformFee, setProdFormPlatformFee] = useState<number | ''>('');
  const [prodFormQuantity, setProdFormQuantity] = useState<number>(1);
  const [prodFormCondition, setProdFormCondition] = useState<any>('جديد');
  const [prodFormWilaya, setProdFormWilaya] = useState(ALGERIAN_WILAYAS[15].nameAr);
  const [prodFormImage, setProdFormImage] = useState('');
  const [prodFormSellerName, setProdFormSellerName] = useState('');
  const [prodFormSellerPhone, setProdFormSellerPhone] = useState('');

  // Category modal
  const [newCategoryName, setNewCategoryName] = useState('');

  // Filter orders by status
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [sellerSearch, setSellerSearch] = useState('');

  // Check auth on mount
  useEffect(() => {
    const verify = async () => {
      try {
        setCheckingAuth(true);
        const valid = await api.checkAdminAuth();
        setIsAuthenticated(valid);
        if (valid) {
          loadAllData();
        }
      } finally {
        setCheckingAuth(false);
      }
    };
    verify();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoginLoading(true);
      await api.adminLogin(username, password);
      setIsAuthenticated(true);
      showToast('تم تسجيل الدخول بنجاح إلى لوحة الإدارة', 'success');
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'بيانات الدخول غير صحيحة', 'error');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await api.adminLogout();
    setIsAuthenticated(false);
    showToast('تم تسجيل الخروج من لوحة الإدارة', 'info');
  };

  const loadAllData = async () => {
    setLoadingData(true);
    try {
      const [dash, subs, prods, sels, ords, cats, sett, msgs] = await Promise.all([
        api.getDashboard().catch(() => null),
        api.getAdminSubmissions().catch(() => []),
        api.getAdminProducts().catch(() => []),
        api.getAdminSellers().catch(() => []),
        api.getAdminOrders().catch(() => []),
        api.getCategories().catch(() => []),
        api.getAdminSettings().catch(() => null),
        api.getContactMessages().catch(() => []),
      ]);

      if (dash) {
        setMetrics(dash.metrics);
        setActivity(dash.activity);
      }
      setSubmissions(subs);
      setProducts(prods);
      setSellers(sels);
      setOrders(ords);
      setCategories(cats);
      setSettings(sett);
      setMessages(msgs);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoadingData(false);
    }
  };

  // --- SUBMISSIONS APPROVAL / REJECTION ---
  const openApproveModal = (sub: ProductSubmission) => {
    setSelectedSubmission(sub);
    const fee = settings?.platformFee || 300;
    setApprovalPlatformFee(fee);
    setApprovalFinalPrice(sub.sellerPrice + fee);
  };

  const confirmApproval = async () => {
    if (!selectedSubmission) return;
    try {
      await api.approveSubmission(selectedSubmission.id, {
        finalPrice: approvalFinalPrice ? Number(approvalFinalPrice) : undefined,
        platformFee: approvalPlatformFee ? Number(approvalPlatformFee) : undefined,
      });
      showToast('تمت الموافقة على المنتج ونشره في المتجر', 'success');
      setSelectedSubmission(null);
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'فشل قبول المنتج', 'error');
    }
  };

  const confirmRejection = async () => {
    if (!selectedSubmission || !rejectionReason.trim()) {
      showToast('يرجى كتابة سبب الرفض', 'error');
      return;
    }
    try {
      await api.rejectSubmission(selectedSubmission.id, rejectionReason.trim());
      showToast('تم رفض المنتج وتوثيق السبب', 'info');
      setShowRejectModal(false);
      setSelectedSubmission(null);
      setRejectionReason('');
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'فشل رفض المنتج', 'error');
    }
  };

  // --- PRODUCT MANAGEMENT ---
  const openAddProductModal = () => {
    setEditingProductId(null);
    setProdFormTitle('');
    setProdFormDesc('');
    setProdFormCategory(categories[0]?.name || 'الإلكترونيات');
    setProdFormSellerPrice('');
    setProdFormPlatformFee(settings?.platformFee || 300);
    setProdFormQuantity(1);
    setProdFormCondition('جديد');
    setProdFormWilaya(ALGERIAN_WILAYAS[15].nameAr);
    setProdFormImage('');
    setProdFormSellerName('إدارة المنصة');
    setProdFormSellerPhone(settings?.phone || '0667661934');
    setShowProductModal(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProductId(prod.id);
    setProdFormTitle(prod.title);
    setProdFormDesc(prod.description);
    setProdFormCategory(prod.category);
    setProdFormSellerPrice(prod.sellerPrice);
    setProdFormPlatformFee(prod.platformFee);
    setProdFormQuantity(prod.quantity);
    setProdFormCondition(prod.condition);
    setProdFormWilaya(prod.wilaya);
    setProdFormImage(prod.mainImage);
    setProdFormSellerName(prod.sellerName || '');
    setProdFormSellerPhone(prod.sellerPhone || '');
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodFormTitle.trim() || !prodFormSellerPrice || !prodFormImage.trim()) {
      showToast('يرجى ملء الاسم والسعر والصورة', 'error');
      return;
    }

    const sPrice = Number(prodFormSellerPrice);
    const pFee = Number(prodFormPlatformFee) || (settings?.platformFee ?? 300);
    const finalPrice = sPrice + pFee;

    try {
      if (editingProductId) {
        await api.updateProduct(editingProductId, {
          title: prodFormTitle.trim(),
          description: prodFormDesc.trim(),
          category: prodFormCategory,
          sellerPrice: sPrice,
          platformFee: pFee,
          finalPrice,
          quantity: Number(prodFormQuantity) || 1,
          condition: prodFormCondition,
          wilaya: prodFormWilaya,
          mainImage: prodFormImage.trim(),
          images: [prodFormImage.trim()],
          sellerName: prodFormSellerName.trim(),
          sellerPhone: prodFormSellerPhone.trim(),
        });
        showToast('تم تحديث بيانات المنتج بنجاح', 'success');
      } else {
        await api.createProductDirect({
          title: prodFormTitle.trim(),
          description: prodFormDesc.trim(),
          category: prodFormCategory,
          images: [prodFormImage.trim()],
          mainImage: prodFormImage.trim(),
          sellerPrice: sPrice,
          platformFee: pFee,
          finalPrice,
          quantity: Number(prodFormQuantity) || 1,
          condition: prodFormCondition,
          wilaya: prodFormWilaya,
          status: 'published',
          featured: false,
          sellerName: prodFormSellerName.trim() || 'إدارة المنصة',
          sellerPhone: prodFormSellerPhone.trim(),
        });
        showToast('تمت إضافة المنتج ونشره بنجاح', 'success');
      }
      setShowProductModal(false);
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء حفظ المنتج', 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا المنتج نهائياً؟')) return;
    try {
      await api.deleteProduct(id);
      showToast('تم حذف المنتج', 'info');
      loadAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleTogglePause = async (id: string) => {
    try {
      await api.toggleProductPause(id);
      showToast('تم تعديل حالة المنتج', 'success');
      loadAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      await api.toggleProductFeatured(id);
      showToast('تم تعديل تمييز المنتج', 'success');
      loadAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // --- ORDER STATUS UPDATES ---
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      showToast(`تم تحديث حالة الطلب إلى "${newStatus}"`, 'success');
      loadAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // --- CATEGORIES ---
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await api.addCategory(newCategoryName.trim());
      setNewCategoryName('');
      showToast('تمت إضافة التصنيف بنجاح', 'success');
      loadAllData();
      refreshCategories();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;
    try {
      await api.deleteCategory(id);
      showToast('تم حذف التصنيف', 'info');
      loadAllData();
      refreshCategories();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // --- SETTINGS UPDATE ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateAdminSettings(settings);
      showToast('تم حفظ إعدادات المنصة بنجاح', 'success');
      refreshConfig();
      loadAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  if (checkingAuth) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs font-semibold text-slate-500">جاري التحقق من الصلاحيات...</p>
      </div>
    );
  }

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-950 text-amber-400 flex items-center justify-center mx-auto shadow-md">
              <Shield className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-slate-900">تسجيل دخول مدير المنصة</h2>
            <p className="text-xs text-slate-500">لوحة التحكم المركزية لمنصة WASSEL DZ</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم المستخدم</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-hidden dir-ltr text-right"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-hidden dir-ltr text-right"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
            >
              {loginLoading ? 'جاري التحقق...' : 'دخول إلى لوحة التحكم'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filtered orders
  const filteredOrders =
    orderStatusFilter === 'all' ? orders : orders.filter((o) => o.status === orderStatusFilter);

  // Filtered sellers
  const filteredSellers = sellers.filter(
    (s) =>
      s.fullName.toLowerCase().includes(sellerSearch.toLowerCase()) ||
      s.phone.includes(sellerSearch) ||
      s.wilaya.includes(sellerSearch)
  );

  const pendingSubmissionsCount = submissions.filter((s) => s.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900 text-white rounded-3xl shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-800 flex items-center justify-center text-amber-300 shadow-xs">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black">لوحة تحكم WASSEL DZ</h1>
              <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md">
                المدير العام
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              مراجعة المنتجات، متابعة الطلبات، حساب الأرباح، وإدارة مستحقات البائعين
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadAllData}
            disabled={loadingData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setView('home')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            معاينة المتجر
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>خروج</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>الإحصائيات العامة</span>
        </button>

        <button
          onClick={() => setActiveTab('submissions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap relative cursor-pointer ${
            activeTab === 'submissions'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>طلبات المنتجات المعلقة</span>
          {pendingSubmissionsCount > 0 && (
            <span className="bg-amber-400 text-slate-950 font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
              {pendingSubmissionsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'products'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>إدارة المنتجات ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>الطلبات والمبيعات ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sellers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'sellers'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>البائعين ({sellers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>التصنيفات ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>إعدادات المنصة والعمولة</span>
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'messages'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>رسائل الزوار ({messages.length})</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {/* ========================================================= */}
      {activeTab === 'overview' && metrics && (
        <div className="space-y-8 animate-in fade-in duration-150">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-semibold">إجمالي أرباح المنصة</span>
              <div className="text-xl font-black text-emerald-700 tabular-nums">
                {metrics.totalPlatformProfit.toLocaleString()} <span className="text-xs font-bold">دج</span>
              </div>
              <p className="text-[11px] text-slate-400">من الطلبات المكتملة فقط</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-semibold">مستحقات البائعين المسددة/المستحقة</span>
              <div className="text-xl font-black text-slate-900 tabular-nums">
                {metrics.totalSellerPayouts.toLocaleString()} <span className="text-xs font-bold">دج</span>
              </div>
              <p className="text-[11px] text-slate-400">حجم مبيعات البائعين المعتمدين</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-semibold">إجمالي الطلبيات</span>
              <div className="text-xl font-black text-slate-900 tabular-nums">
                {metrics.totalOrders}{' '}
                <span className="text-xs text-emerald-600 font-bold">
                  ({metrics.completedOrders} مكتمل)
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{metrics.newOrders} طلب جديد بانتظار التأكيد</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-semibold">حالة المنتجات</span>
              <div className="text-xl font-black text-slate-900 tabular-nums">
                {metrics.publishedProducts}{' '}
                <span className="text-xs text-slate-500 font-normal">منشور</span>
              </div>
              <p className="text-[11px] text-amber-600 font-bold">
                {metrics.pendingProducts} بانتظار المراجعة
              </p>
            </div>
          </div>

          {/* Quick Exports Bar */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-emerald-700" />
              <span>تصدير التقارير بصيغة CSV:</span>
            </span>
            <div className="flex items-center gap-2">
              <a
                href={api.getExportUrl('orders')}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:text-emerald-700 transition-colors"
              >
                تصدير سجل الطلبات
              </a>
              <a
                href={api.getExportUrl('products')}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:text-emerald-700 transition-colors"
              >
                تصدير المنتجات
              </a>
              <a
                href={api.getExportUrl('sellers')}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:text-emerald-700 transition-colors"
              >
                تصدير البائعين
              </a>
            </div>
          </div>

          {/* Recent Activities Log */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">سجل أحدث النشاطات في المنصة</h3>
            {activity.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">لا توجد نشاطات مسجلة بعد</p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {activity.map((act) => (
                  <div key={act.id} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="text-slate-800 font-medium">{act.description}</span>
                    <span className="text-slate-400 text-[11px] tabular-nums dir-ltr">
                      {new Date(act.timestamp).toLocaleTimeString('ar-DZ', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: REVIEW PENDING SUBMISSIONS */}
      {/* ========================================================= */}
      {activeTab === 'submissions' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">طلبات عرض المنتجات من البائعين</h2>
              <p className="text-xs text-slate-500">
                راجع معلومات المنتج والصور وسعر البائع قبل نشرها في المتجر
              </p>
            </div>
          </div>

          {submissions.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
              لا توجد طلبات معروضة حالياً.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {submissions.map((sub) => {
                const isPending = sub.status === 'pending';
                const isApproved = sub.status === 'approved';
                const isRejected = sub.status === 'rejected';

                return (
                  <div
                    key={sub.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Top Bar with Ref and status */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                          {sub.refCode}
                        </span>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            isPending
                              ? 'bg-amber-100 text-amber-900'
                              : isApproved
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-rose-100 text-rose-900'
                          }`}
                        >
                          {isPending ? 'قيد المراجعة' : isApproved ? 'تم النشر' : 'مرفوض'}
                        </span>
                      </div>

                      {/* Product Preview */}
                      <div className="flex gap-4">
                        <img
                          src={sub.mainImage}
                          alt={sub.productTitle}
                          className="w-24 h-24 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[11px] font-bold text-emerald-700 block">
                            {sub.category} · {sub.condition}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900 mb-1">{sub.productTitle}</h3>
                          <div className="text-xs text-slate-600 line-clamp-2">{sub.productDescription}</div>
                        </div>
                      </div>

                      {/* Seller & Financial Details */}
                      <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">البائع:</span>
                          <span className="font-bold text-slate-900">
                            {sub.sellerName} ({sub.sellerWilaya} – {sub.sellerBaladiya})
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">سعر البائع الصافي:</span>
                          <span className="font-extrabold text-slate-900 tabular-nums">
                            {sub.sellerPrice.toLocaleString()} دج
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">الكمية المتوفرة:</span>
                          <span className="font-bold">{sub.quantity} قطعة</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">طريقة التواصل المفضلة:</span>
                          <span className="font-semibold text-emerald-800">
                            {sub.preferredContact === 'whatsapp' ? 'واتساب' : 'هاتف'} ({sub.sellerPhone})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/${sub.sellerPhone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                          title="محادثة واتساب مع البائع"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                        <a
                          href={`tel:${sub.sellerPhone}`}
                          className="p-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                          title="اتصال هاتفي بالبائع"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      </div>

                      {isPending && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedSubmission(sub);
                              setShowRejectModal(true);
                            }}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            رفض
                          </button>
                          <button
                            onClick={() => openApproveModal(sub)}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                          >
                            موافقة ونشر...
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: PRODUCTS MANAGEMENT */}
      {/* ========================================================= */}
      {activeTab === 'products' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">إدارة المنتجات</h2>
              <p className="text-xs text-slate-500">
                تعديل المنتجات، تغيير الأسعار، إيقاف العرض أو إضافة منتج يدويًا
              </p>
            </div>
            <button
              onClick={openAddProductModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>إضافة منتج يدويًا</span>
            </button>
          </div>

          {products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
              لا توجد منتجات مسجلة في المتجر بعد.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                    <tr>
                      <th className="p-3.5">المنتج</th>
                      <th className="p-3.5">التصنيف</th>
                      <th className="p-3.5">سعر البائع</th>
                      <th className="p-3.5">عمولة المنصة</th>
                      <th className="p-3.5">السعر للزبون</th>
                      <th className="p-3.5">الحالة</th>
                      <th className="p-3.5">البائع</th>
                      <th className="p-3.5 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5 flex items-center gap-3">
                          <img
                            src={p.mainImage}
                            alt={p.title}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                          />
                          <div className="font-bold text-slate-900 line-clamp-1 max-w-xs">{p.title}</div>
                        </td>
                        <td className="p-3.5 text-slate-600">{p.category}</td>
                        <td className="p-3.5 font-bold tabular-nums">{p.sellerPrice.toLocaleString()} دج</td>
                        <td className="p-3.5 font-extrabold text-emerald-700 tabular-nums">
                          +{p.platformFee.toLocaleString()} دج
                        </td>
                        <td className="p-3.5 font-black text-slate-900 tabular-nums">
                          {p.finalPrice.toLocaleString()} دج
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.status === 'published'
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {p.status === 'published' ? 'منشور' : 'متوقف'}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-600">
                          {p.sellerName || 'المنصة'}
                          {p.sellerPhone && (
                            <span className="block text-[10px] text-slate-400 dir-ltr text-right">
                              {p.sellerPhone}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleTogglePause(p.id)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 rounded transition-colors"
                              title={p.status === 'published' ? 'إيقاف مؤقت' : 'إعادة نشر'}
                            >
                              {p.status === 'published' ? (
                                <Pause className="w-3.5 h-3.5" />
                              ) : (
                                <Play className="w-3.5 h-3.5 text-emerald-600" />
                              )}
                            </button>
                            <button
                              onClick={() => handleToggleFeatured(p.id)}
                              className={`p-1.5 rounded transition-colors ${
                                p.featured ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'
                              }`}
                              title="تمييز المنتج"
                            >
                              <Star className="w-3.5 h-3.5 fill-current" />
                            </button>
                            <button
                              onClick={() => openEditProductModal(p)}
                              className="p-1.5 text-slate-600 hover:text-emerald-700 rounded transition-colors"
                              title="تعديل"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: ORDERS & SALES */}
      {/* ========================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">سجل الطلبات والمبيعات</h2>
              <p className="text-xs text-slate-500">
                تحديث الحالات، التواصل مع المشتري والبائع، ومتابعة الأرباح المحققة
              </p>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold">الحالة:</span>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="text-xs py-1.5 px-3 bg-white border border-slate-200 rounded-xl font-medium"
              >
                <option value="all">كل الطلبات ({orders.length})</option>
                <option value="جديد">جديد</option>
                <option value="قيد المراجعة">قيد المراجعة</option>
                <option value="تم التأكيد">تم التأكيد</option>
                <option value="قيد التجهيز">قيد التجهيز</option>
                <option value="تم الشحن">تم الشحن</option>
                <option value="تم التسليم">تم التسليم</option>
                <option value="مكتمل">مكتمل</option>
                <option value="ملغى">ملغى</option>
              </select>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
              لا توجد طلبات مسجلة تطابق هذه الحالة.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900">#{order.id}</span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString('ar-DZ')}
                      </span>
                    </div>

                    {/* Change status dropdown */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">حالة الطلب:</span>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className={`text-xs font-bold py-1 px-3 rounded-lg border ${
                          order.status === 'جديد'
                            ? 'bg-amber-50 border-amber-300 text-amber-900'
                            : order.status === 'تم التسليم' || order.status === 'مكتمل'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : order.status === 'ملغى'
                            ? 'bg-rose-50 border-rose-300 text-rose-900'
                            : 'bg-slate-50 border-slate-300 text-slate-800'
                        }`}
                      >
                        <option value="جديد">جديد</option>
                        <option value="قيد المراجعة">قيد المراجعة</option>
                        <option value="تم التأكيد">تم التأكيد</option>
                        <option value="قيد التجهيز">قيد التجهيز</option>
                        <option value="تم الشحن">تم الشحن</option>
                        <option value="تم التسليم">تم التسليم</option>
                        <option value="مكتمل">مكتمل</option>
                        <option value="ملغى">ملغى</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {/* Buyer info */}
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="font-bold text-slate-700 block">معلومات المشتري:</span>
                      <div className="font-medium text-slate-900">{order.customerName}</div>
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="text-emerald-700 font-bold hover:underline dir-ltr"
                        >
                          {order.customerPhone}
                        </a>
                        <a
                          href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-700"
                          title="واتساب"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <div className="text-slate-500">
                        {order.wilaya} – {order.baladiya} ({order.address})
                      </div>
                      {order.notes && (
                        <div className="text-amber-800 text-[11px] pt-1">ملاحظة: {order.notes}</div>
                      )}
                    </div>

                    {/* Ordered items */}
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 md:col-span-2">
                      <span className="font-bold text-slate-700 block">العناصر المطلوبة:</span>
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between pb-1 border-b border-slate-200/60 last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{item.productTitle}</span>
                            <span className="text-slate-500">× {item.quantity}</span>
                          </div>
                          <div className="space-x-2 space-x-reverse text-left">
                            <span className="text-slate-500">
                              (سعر البائع: {item.sellerPrice.toLocaleString()} دج)
                            </span>
                            <span className="font-bold text-emerald-700 tabular-nums">
                              {item.totalPrice.toLocaleString()} دج
                            </span>
                          </div>
                        </div>
                      ))}

                      {/* Financial summary for this order */}
                      <div className="pt-2 flex justify-between font-bold border-t border-slate-200 text-xs">
                        <span>إجمالي الزبون: {order.totalAmount.toLocaleString()} دج</span>
                        <span className="text-emerald-700">
                          ربح المنصة: +{order.totalPlatformProfit.toLocaleString()} دج
                        </span>
                        <span className="text-slate-700">
                          مستحق البائع: {order.totalSellerAmount.toLocaleString()} دج
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: SELLERS MANAGEMENT */}
      {/* ========================================================= */}
      {activeTab === 'sellers' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">إدارة البائعين المسجلين</h2>
              <p className="text-xs text-slate-500">
                متابعة مبيعات كل بائع ومستحقاته المالية الصافية المحققة
              </p>
            </div>

            <input
              type="text"
              placeholder="ابحث بالاسم أو الهاتف أو الولاية..."
              value={sellerSearch}
              onChange={(e) => setSellerSearch(e.target.value)}
              className="text-xs px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:border-emerald-600 focus:outline-hidden w-64"
            />
          </div>

          {filteredSellers.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
              لا يوجد بائعون مسجلون يطابقون البحث حالياً.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                    <tr>
                      <th className="p-3.5">اسم البائع</th>
                      <th className="p-3.5">الهاتف</th>
                      <th className="p-3.5">الولاية والبلدية</th>
                      <th className="p-3.5 text-center">المنتجات المقدمة</th>
                      <th className="p-3.5 text-center">المنتجات المنشورة</th>
                      <th className="p-3.5 text-center">المباعة</th>
                      <th className="p-3.5">مستحقات البائع</th>
                      <th className="p-3.5 text-center">تواصل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSellers.map((seller) => (
                      <tr key={seller.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900">{seller.fullName}</td>
                        <td className="p-3.5 font-mono text-slate-600 dir-ltr text-right">
                          {seller.phone}
                        </td>
                        <td className="p-3.5 text-slate-600">
                          {seller.wilaya} – {seller.baladiya}
                        </td>
                        <td className="p-3.5 text-center font-bold">{seller.totalSubmissions}</td>
                        <td className="p-3.5 text-center font-bold text-emerald-700">
                          {seller.totalPublished}
                        </td>
                        <td className="p-3.5 text-center font-bold">{seller.totalSold}</td>
                        <td className="p-3.5 font-extrabold text-slate-900 tabular-nums">
                          {seller.totalPayoutDue.toLocaleString()} دج
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <a
                              href={`https://wa.me/${seller.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                            <a
                              href={`tel:${seller.phone}`}
                              className="p-1.5 text-slate-700 hover:bg-slate-100 rounded"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: CATEGORIES */}
      {/* ========================================================= */}
      {activeTab === 'categories' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">إدارة تصنيفات المنتجات</h2>
              <p className="text-xs text-slate-500">إضافة وتعديل وحذف تصنيفات المتجر</p>
            </div>
          </div>

          {/* Add Category Form */}
          <form
            onSubmit={handleAddCategory}
            className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs max-w-lg"
          >
            <input
              type="text"
              required
              placeholder="اسم التصنيف الجديد (مثال: الكتب والقرطاسية)..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-600"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              + إضافة تصنيف
            </button>
          </form>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{cat.name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">{cat.slug}</span>
                </div>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  title="حذف التصنيف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 7: SETTINGS & FIXED FEE */}
      {/* ========================================================= */}
      {activeTab === 'settings' && settings && (
        <div className="max-w-2xl bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div>
            <h2 className="text-lg font-black text-slate-900">إعدادات المنصة والعمولة الثابتة</h2>
            <p className="text-xs text-slate-500">
              تحديد المبلغ الثابت الذي تحققه المنصة من كل عملية بيع مكتملة، وتعديل بيانات التواصل
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            {/* Fixed platform fee input */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
              <label className="block text-xs font-black text-emerald-950">
                المبلغ الثابت للمنصة (العمولة بالدينار الجزائري DZD) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min={0}
                  value={settings.platformFee}
                  onChange={(e) =>
                    setSettings({ ...settings, platformFee: Number(e.target.value) || 0 })
                  }
                  className="w-full text-sm font-bold px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-white focus:border-emerald-600 focus:outline-hidden tabular-nums"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-500 pointer-events-none">
                  دج
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                يُضاف هذا المبلغ الثابت تلقائياً إلى سعر البائع عند اعتماد كل منتج، ويُعرض السعر النهائي المدمج للزبون دون إظهار ربح المنصة.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رقم الهاتف الرسمي
                </label>
                <input
                  type="text"
                  value={settings.phone || ''}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-hidden dir-ltr text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رقم WhatsApp الرسمي
                </label>
                <input
                  type="text"
                  value={settings.whatsapp || ''}
                  onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-hidden dir-ltr text-right"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                البريد الإلكتروني الرسمي
              </label>
              <input
                type="email"
                value={settings.email || ''}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-hidden dir-ltr text-right"
              />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                تغيير كلمة مرور الإدارة
              </label>
              <input
                type="password"
                placeholder="اتركه فارغاً دون تغيير إذا أردت الاحتفاظ بالقديمة"
                value={settings.adminPass || ''}
                onChange={(e) => setSettings({ ...settings, adminPass: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-hidden dir-ltr text-right"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              حفظ وتطبيق الإعدادات
            </button>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 8: MESSAGES */}
      {/* ========================================================= */}
      {activeTab === 'messages' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">رسائل واستفسارات الزوار</h2>
              <p className="text-xs text-slate-500">الرسائل الواردة من صفحة اتصل بنا</p>
            </div>
          </div>

          {messages.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
              لا توجد رسائل واردة حالياً.
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    m.read ? 'bg-white border-slate-200' : 'bg-emerald-50/50 border-emerald-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{m.name}</span>
                      <span className="text-slate-400">({m.email})</span>
                      {m.phone && <span className="text-slate-500 dir-ltr font-mono">{m.phone}</span>}
                    </div>
                    <span className="text-slate-400 text-[11px]">
                      {new Date(m.createdAt).toLocaleDateString('ar-DZ')}
                    </span>
                  </div>
                  <div className="py-2">
                    <h4 className="text-xs font-bold text-slate-800 mb-1">{m.subject}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                      {m.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: APPROVE SUBMISSION */}
      {/* ========================================================= */}
      {selectedSubmission && !showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                مراجعة وقبول المنتج: {selectedSubmission.productTitle}
              </h3>
              <p className="text-xs text-slate-500">
                تأكيد سعر البيع النهائي وإضافة عمولة المنصة
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">سعر البائع المطلوب:</span>
                  <span className="font-bold text-slate-900">
                    {selectedSubmission.sellerPrice.toLocaleString()} دج
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">البائع:</span>
                  <span className="font-medium text-slate-800">{selectedSubmission.sellerName}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  المبلغ الثابت للمنصة (العمولة بالدينار)
                </label>
                <input
                  type="number"
                  value={approvalPlatformFee}
                  onChange={(e) => {
                    const fee = e.target.value ? Number(e.target.value) : 0;
                    setApprovalPlatformFee(fee);
                    setApprovalFinalPrice(selectedSubmission.sellerPrice + fee);
                  }}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  السعر النهائي المعروض للزبون (دج)
                </label>
                <input
                  type="number"
                  value={approvalFinalPrice}
                  onChange={(e) => setApprovalFinalPrice(e.target.value ? Number(e.target.value) : '')}
                  className="w-full text-sm font-bold text-emerald-800 px-3.5 py-2 rounded-xl border border-emerald-300 focus:outline-hidden tabular-nums"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                إلغاء
              </button>
              <button
                onClick={confirmApproval}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                تأكيد ونشر المنتج في المتجر
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: REJECT SUBMISSION */}
      {/* ========================================================= */}
      {selectedSubmission && showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900">رفض طلب المنتج</h3>
              <p className="text-xs text-slate-500">
                يرجى توضيح سبب الرفض لحفظه في سجل الطلب
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">سبب الرفض</label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="مثال: الصور غير واضحة، السعر مبالغ فيه، المنتج غير مطابق..."
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedSubmission(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600"
              >
                إلغاء
              </button>
              <button
                onClick={confirmRejection}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT PRODUCT DIRECT */}
      {/* ========================================================= */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingProductId ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد للمتجر'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المنتج</label>
                <input
                  type="text"
                  required
                  value={prodFormTitle}
                  onChange={(e) => setProdFormTitle(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">التصنيف</label>
                  <select
                    value={prodFormCategory}
                    onChange={(e) => setProdFormCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">حالة المنتج</label>
                  <select
                    value={prodFormCondition}
                    onChange={(e) => setProdFormCondition(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden bg-white"
                  >
                    <option value="جديد">جديد</option>
                    <option value="مستعمل بحالة ممتازة">مستعمل بحالة ممتازة</option>
                    <option value="مستعمل بحالة جيدة">مستعمل بحالة جيدة</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">سعر البائع الصافي (دج)</label>
                  <input
                    type="number"
                    required
                    value={prodFormSellerPrice}
                    onChange={(e) =>
                      setProdFormSellerPrice(e.target.value ? Number(e.target.value) : '')
                    }
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">عمولة المنصة الثابتة (دج)</label>
                  <input
                    type="number"
                    value={prodFormPlatformFee}
                    onChange={(e) =>
                      setProdFormPlatformFee(e.target.value ? Number(e.target.value) : '')
                    }
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الكمية</label>
                  <input
                    type="number"
                    min={1}
                    value={prodFormQuantity}
                    onChange={(e) => setProdFormQuantity(Number(e.target.value) || 1)}
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الولاية</label>
                  <select
                    value={prodFormWilaya}
                    onChange={(e) => setProdFormWilaya(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden bg-white"
                  >
                    {ALGERIAN_WILAYAS.map((w) => (
                      <option key={w.code} value={w.nameAr}>
                        {w.code} - {w.nameAr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">رابط أو مسار الصورة الرئيسية</label>
                <input
                  type="text"
                  required
                  placeholder="https://... أو /uploads/img_..."
                  value={prodFormImage}
                  onChange={(e) => setProdFormImage(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden dir-ltr text-right"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الوصف</label>
                <textarea
                  rows={3}
                  value={prodFormDesc}
                  onChange={(e) => setProdFormDesc(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم البائع المرتبط</label>
                  <input
                    type="text"
                    value={prodFormSellerName}
                    onChange={(e) => setProdFormSellerName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">هاتف البائع</label>
                  <input
                    type="tel"
                    value={prodFormSellerPhone}
                    onChange={(e) => setProdFormSellerPhone(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden dir-ltr text-right"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  حفظ المنتج
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
