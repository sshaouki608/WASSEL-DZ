import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  Product,
  Seller,
  ProductSubmission,
  Order,
  Category,
  PlatformSettings,
  ContactMessage,
  PublicProduct,
  DashboardMetrics,
  OrderStatus,
} from '../src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const UPLOADS_DIR = path.resolve(__dirname, '../uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

interface ActivityLogItem {
  id: string;
  type: 'submission' | 'approval' | 'rejection' | 'order' | 'status_change' | 'product_create' | 'settings';
  description: string;
  timestamp: string;
}

export interface DatabaseSchema {
  products: Product[];
  sellers: Seller[];
  submissions: ProductSubmission[];
  orders: Order[];
  categories: Category[];
  settings: PlatformSettings & { adminUser: string; adminPass: string };
  contactMessages: ContactMessage[];
  activityLog: ActivityLogItem[];
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'الإلكترونيات', slug: 'electronics', order: 1 },
  { id: 'cat-2', name: 'الهواتف والإكسسوارات', slug: 'phones-accessories', order: 2 },
  { id: 'cat-3', name: 'الملابس والأحذية', slug: 'clothing-shoes', order: 3 },
  { id: 'cat-4', name: 'المنزل والمطبخ', slug: 'home-kitchen', order: 4 },
  { id: 'cat-5', name: 'الأجهزة الكهربائية', slug: 'home-appliances', order: 5 },
  { id: 'cat-6', name: 'السيارات وملحقاتها', slug: 'auto-accessories', order: 6 },
  { id: 'cat-7', name: 'الرياضة', slug: 'sports', order: 7 },
  { id: 'cat-8', name: 'الألعاب', slug: 'games-toys', order: 8 },
  { id: 'cat-9', name: 'الجمال والعناية', slug: 'beauty-care', order: 9 },
  { id: 'cat-10', name: 'منتجات متنوعة', slug: 'miscellaneous', order: 10 },
];

const INITIAL_DB: DatabaseSchema = {
  // STRICT RULE: No dummy, fake, or mock products. Store starts completely empty.
  products: [],
  sellers: [],
  submissions: [],
  orders: [],
  categories: DEFAULT_CATEGORIES,
  settings: {
    platformFee: 300,
    phone: '+213 667 661 934',
    whatsapp: '+213 667 661 934',
    email: 'sshaouki608@gmail.com',
    adminUser: 'chdev',
    adminPass: 'chdev',
    banners: [
      {
        id: 'banner-1',
        title: 'WASSEL DZ – سوقك الجزائري في مكان واحد',
        subtitle: 'المنصة الوطنية الموثوقة للتسوق وبيع المنتجات عبر كافة ولايات الجزائر الـ 58. جودة مضمونة وتوصيل سريع.',
        buttonText: 'اعرض منتجك للبيع الآن',
        buttonLink: 'submit-product',
        bgGradient: 'from-emerald-950 via-emerald-800 to-teal-900',
        active: true,
      },
    ],
  },
  contactMessages: [],
  activityLog: [],
};

class DB {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure products array is pristine and categories exist
        return {
          ...INITIAL_DB,
          ...parsed,
          categories: parsed.categories && parsed.categories.length > 0 ? parsed.categories : DEFAULT_CATEGORIES,
          settings: { ...INITIAL_DB.settings, ...(parsed.settings || {}) },
          products: parsed.products || [],
          sellers: parsed.sellers || [],
          submissions: parsed.submissions || [],
          orders: parsed.orders || [],
          contactMessages: parsed.contactMessages || [],
          activityLog: parsed.activityLog || [],
        };
      }
    } catch (err) {
      console.error('Error loading db.json, using default initial structure:', err);
    }
    this.saveData(INITIAL_DB);
    return INITIAL_DB;
  }

  private save(): void {
    this.saveData(this.data);
  }

  private saveData(data: DatabaseSchema): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving db.json:', err);
    }
  }

  // Activity Log helper
  logActivity(type: ActivityLogItem['type'], description: string): void {
    this.data.activityLog.unshift({
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      type,
      description,
      timestamp: new Date().toISOString(),
    });
    // Keep last 100 activities
    if (this.data.activityLog.length > 100) {
      this.data.activityLog = this.data.activityLog.slice(0, 100);
    }
    this.save();
  }

  // --- PUBLIC METHODS ---

  getPublicSettings(): PlatformSettings {
    const { platformFee, phone, whatsapp, email, banners, addressNotice, facebookUrl, instagramUrl, tiktokUrl } = this.data.settings;
    return {
      platformFee,
      phone,
      whatsapp,
      email,
      addressNotice,
      facebookUrl,
      instagramUrl,
      tiktokUrl,
      banners: banners.filter((b) => b.active),
    };
  }

  getCategories(): Category[] {
    return [...this.data.categories].sort((a, b) => a.order - b.order);
  }

  // Returns only published products sanitized from seller contacts and raw costs
  getPublicProducts(filters?: {
    search?: string;
    category?: string;
    wilaya?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: 'newest' | 'price_asc' | 'price_desc' | 'views';
    featured?: boolean;
  }): PublicProduct[] {
    let list = this.data.products.filter((p) => p.status === 'published');

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.wilaya.toLowerCase().includes(q)
      );
    }

    if (filters?.category && filters.category !== 'all') {
      list = list.filter((p) => p.category === filters.category);
    }

    if (filters?.wilaya && filters.wilaya !== 'all') {
      list = list.filter((p) => p.wilaya === filters.wilaya);
    }

    if (filters?.featured) {
      list = list.filter((p) => p.featured);
    }

    if (filters?.minPrice !== undefined) {
      list = list.filter((p) => p.finalPrice >= (filters.minPrice ?? 0));
    }

    if (filters?.maxPrice !== undefined) {
      list = list.filter((p) => p.finalPrice <= (filters.maxPrice ?? Infinity));
    }

    // Sort
    if (filters?.sort === 'price_asc') {
      list.sort((a, b) => a.finalPrice - b.finalPrice);
    } else if (filters?.sort === 'price_desc') {
      list.sort((a, b) => b.finalPrice - a.finalPrice);
    } else if (filters?.sort === 'views') {
      list.sort((a, b) => b.views - a.views);
    } else {
      // Default: newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Sanitize
    return list.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      category: p.category,
      images: p.images,
      mainImage: p.mainImage,
      finalPrice: p.finalPrice,
      quantity: p.quantity,
      condition: p.condition,
      wilaya: p.wilaya,
      baladiya: p.baladiya,
      featured: p.featured,
      views: p.views,
      createdAt: p.createdAt,
    }));
  }

  getPublicProductById(id: string): PublicProduct | null {
    const product = this.data.products.find((p) => p.id === id && p.status === 'published');
    if (!product) return null;

    // Increment views
    product.views = (product.views || 0) + 1;
    this.save();

    return {
      id: product.id,
      title: product.title,
      description: product.description,
      category: product.category,
      images: product.images,
      mainImage: product.mainImage,
      finalPrice: product.finalPrice,
      quantity: product.quantity,
      condition: product.condition,
      wilaya: product.wilaya,
      baladiya: product.baladiya,
      featured: product.featured,
      views: product.views,
      createdAt: product.createdAt,
    };
  }

  // Create Seller Submission
  createSubmission(submissionData: Omit<ProductSubmission, 'id' | 'refCode' | 'status' | 'createdAt'>): ProductSubmission {
    const refCode = 'WDZ-' + Math.floor(10000 + Math.random() * 90000);
    const id = 'sub-' + Date.now();
    const submission: ProductSubmission = {
      ...submissionData,
      id,
      refCode,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.data.submissions.unshift(submission);

    // Track or update seller record
    this.upsertSellerFromSubmission(submission);

    this.logActivity('submission', `طلب إضافة منتج جديد "${submission.productTitle}" من البائع ${submission.sellerName} (رقم مرجعي: ${refCode})`);
    this.save();
    return submission;
  }

  private upsertSellerFromSubmission(submission: ProductSubmission): void {
    let seller = this.data.sellers.find((s) => s.phone.trim() === submission.sellerPhone.trim());
    if (!seller) {
      seller = {
        id: 'sel-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
        fullName: submission.sellerName,
        phone: submission.sellerPhone,
        wilaya: submission.sellerWilaya,
        baladiya: submission.sellerBaladiya,
        preferredContact: submission.preferredContact,
        createdAt: new Date().toISOString(),
        totalSubmissions: 1,
        totalPublished: 0,
        totalSold: 0,
        totalPayoutDue: 0,
        totalPaid: 0,
      };
      this.data.sellers.push(seller);
    } else {
      seller.totalSubmissions += 1;
      // Update location if provided
      if (submission.sellerWilaya) seller.wilaya = submission.sellerWilaya;
      if (submission.sellerBaladiya) seller.baladiya = submission.sellerBaladiya;
    }
  }

  // Customer places order
  createOrder(orderData: {
    customerName: string;
    customerPhone: string;
    wilaya: string;
    baladiya: string;
    address: string;
    notes?: string;
    items: { productId: string; quantity: number }[];
  }): Order {
    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    const populatedItems = orderData.items.map((item) => {
      const product = this.data.products.find((p) => p.id === item.productId);
      if (!product) {
        throw new Error(`المنتج غير موجود أو لم يعد متاحًا`);
      }
      if (product.status !== 'published') {
        throw new Error(`المنتج "${product.title}" غير متاح للشراء حاليًا`);
      }

      // Freeze snapshots of prices
      const unitPrice = product.finalPrice;
      const sellerPrice = product.sellerPrice;
      const platformFee = product.platformFee;
      const totalPrice = unitPrice * item.quantity;

      return {
        productId: product.id,
        productTitle: product.title,
        productImage: product.mainImage,
        quantity: item.quantity,
        sellerPrice: sellerPrice * item.quantity,
        platformFee: platformFee * item.quantity,
        unitPrice,
        totalPrice,
        sellerId: product.sellerId,
        sellerName: product.sellerName,
        sellerPhone: product.sellerPhone,
      };
    });

    const totalAmount = populatedItems.reduce((acc, i) => acc + i.totalPrice, 0);
    const totalSellerAmount = populatedItems.reduce((acc, i) => acc + i.sellerPrice, 0);
    const totalPlatformProfit = populatedItems.reduce((acc, i) => acc + i.platformFee, 0);

    const newOrder: Order = {
      id: orderId,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      wilaya: orderData.wilaya,
      baladiya: orderData.baladiya,
      address: orderData.address,
      notes: orderData.notes,
      items: populatedItems,
      totalAmount,
      totalSellerAmount,
      totalPlatformProfit,
      status: 'جديد',
      statusHistory: [
        {
          status: 'جديد',
          changedAt: new Date().toISOString(),
          note: 'تم تسجيل الطلب من الموقع',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.orders.unshift(newOrder);
    this.logActivity('order', `طلب شراء جديد #${orderId} بمبلغ ${totalAmount.toLocaleString()} دج للزبون ${orderData.customerName}`);
    this.save();
    return newOrder;
  }

  createContactMessage(msg: { name: string; email: string; phone?: string; subject: string; message: string }): ContactMessage {
    const contact: ContactMessage = {
      id: 'msg-' + Date.now(),
      ...msg,
      createdAt: new Date().toISOString(),
      read: false,
    };
    this.data.contactMessages.unshift(contact);
    this.logActivity('status_change', `رسالة تواصل جديدة من ${msg.name}: "${msg.subject}"`);
    this.save();
    return contact;
  }

  // --- ADMIN METHODS ---

  verifyAdmin(user: string, pass: string): boolean {
    return user === this.data.settings.adminUser && pass === this.data.settings.adminPass;
  }

  getDashboardMetrics(): DashboardMetrics {
    const totalProducts = this.data.products.length;
    const publishedProducts = this.data.products.filter((p) => p.status === 'published').length;
    const pendingProducts = this.data.submissions.filter((s) => s.status === 'pending').length;
    const rejectedProducts = this.data.submissions.filter((s) => s.status === 'rejected').length;

    const totalOrders = this.data.orders.length;
    const newOrders = this.data.orders.filter((o) => o.status === 'جديد').length;
    const completedOrders = this.data.orders.filter((o) => o.status === 'تم التسليم' || o.status === 'مكتمل').length;
    const cancelledOrders = this.data.orders.filter((o) => o.status === 'ملغى').length;

    // Platform profit & seller payouts ONLY for completed orders
    const completedList = this.data.orders.filter((o) => o.status === 'تم التسليم' || o.status === 'مكتمل');
    const totalPlatformProfit = completedList.reduce((acc, o) => acc + (o.totalPlatformProfit || 0), 0);
    const totalSellerPayouts = completedList.reduce((acc, o) => acc + (o.totalSellerAmount || 0), 0);
    const totalSalesVolume = completedList.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

    return {
      totalProducts,
      publishedProducts,
      pendingProducts,
      rejectedProducts,
      totalOrders,
      newOrders,
      completedOrders,
      cancelledOrders,
      totalPlatformProfit,
      totalSellerPayouts,
      totalSalesVolume,
    };
  }

  getActivityLog(): ActivityLogItem[] {
    return this.data.activityLog;
  }

  // Submissions management
  getSubmissions(): ProductSubmission[] {
    return this.data.submissions;
  }

  approveSubmission(
    submissionId: string,
    overrides?: {
      finalPrice?: number;
      platformFee?: number;
      category?: string;
      notes?: string;
      featured?: boolean;
    }
  ): Product {
    const sub = this.data.submissions.find((s) => s.id === submissionId);
    if (!sub) throw new Error('طلب العرض غير موجود');

    const defaultFee = this.data.settings.platformFee;
    const platformFee = overrides?.platformFee ?? defaultFee;
    const finalPrice = overrides?.finalPrice ?? (sub.sellerPrice + platformFee);

    // Link or find seller
    let seller = this.data.sellers.find((s) => s.phone.trim() === sub.sellerPhone.trim());
    if (seller) {
      seller.totalPublished += 1;
    }

    const newProduct: Product = {
      id: 'prod-' + Date.now(),
      title: sub.productTitle,
      description: sub.productDescription,
      category: overrides?.category || sub.category,
      images: sub.images && sub.images.length > 0 ? sub.images : [sub.mainImage],
      mainImage: sub.mainImage,
      sellerPrice: sub.sellerPrice,
      platformFee,
      finalPrice,
      quantity: sub.quantity,
      condition: sub.condition,
      wilaya: sub.sellerWilaya,
      baladiya: sub.sellerBaladiya,
      status: 'published',
      featured: overrides?.featured ?? false,
      views: 0,
      sellerId: seller?.id,
      sellerName: sub.sellerName,
      sellerPhone: sub.sellerPhone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      notes: overrides?.notes,
    };

    this.data.products.unshift(newProduct);

    sub.status = 'approved';
    sub.reviewedAt = new Date().toISOString();

    this.logActivity('approval', `تمت الموافقة على المنتج "${newProduct.title}" ونشره بسعر ${finalPrice.toLocaleString()} دج`);
    this.save();
    return newProduct;
  }

  rejectSubmission(submissionId: string, reason: string): void {
    const sub = this.data.submissions.find((s) => s.id === submissionId);
    if (!sub) throw new Error('طلب العرض غير موجود');

    sub.status = 'rejected';
    sub.adminFeedback = reason;
    sub.reviewedAt = new Date().toISOString();

    this.logActivity('rejection', `تم رفض طلب المنتج "${sub.productTitle}". السبب: ${reason}`);
    this.save();
  }

  // Admin Direct Product Management
  getAdminProducts(): Product[] {
    return this.data.products;
  }

  createProductDirect(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'views'>): Product {
    const id = 'prod-' + Date.now();
    const product: Product = {
      ...productData,
      id,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.products.unshift(product);
    this.logActivity('product_create', `تمت إضافة منتج يدويًا بواسطة المدير: "${product.title}"`);
    this.save();
    return product;
  }

  updateProduct(id: string, updates: Partial<Product>): Product {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('المنتج غير موجود');

    const current = this.data.products[idx];
    const updated: Product = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Keep finalPrice synchronized if sellerPrice or platformFee updated
    if (updates.sellerPrice !== undefined || updates.platformFee !== undefined) {
      const sPrice = updates.sellerPrice ?? current.sellerPrice;
      const pFee = updates.platformFee ?? current.platformFee;
      if (updates.finalPrice === undefined) {
        updated.finalPrice = sPrice + pFee;
      }
    }

    this.data.products[idx] = updated;
    this.logActivity('status_change', `تم تعديل بيانات المنتج "${updated.title}"`);
    this.save();
    return updated;
  }

  deleteProduct(id: string): void {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('المنتج غير موجود');
    const title = this.data.products[idx].title;
    this.data.products.splice(idx, 1);
    this.logActivity('status_change', `تم حذف المنتج "${title}"`);
    this.save();
  }

  // Admin Sellers Management
  getSellers(): Seller[] {
    // Re-aggregate sellers dynamic stats
    return this.data.sellers.map((seller) => {
      // Count completed orders for this seller
      let totalSold = 0;
      let totalPayoutDue = 0;

      this.data.orders.forEach((o) => {
        if (o.status === 'تم التسليم' || o.status === 'مكتمل') {
          o.items.forEach((item) => {
            if (item.sellerPhone === seller.phone || item.sellerId === seller.id) {
              totalSold += item.quantity;
              totalPayoutDue += item.sellerPrice;
            }
          });
        }
      });

      return {
        ...seller,
        totalSold,
        totalPayoutDue,
      };
    });
  }

  // Admin Orders Management
  getOrders(filterStatus?: OrderStatus): Order[] {
    if (filterStatus) {
      return this.data.orders.filter((o) => o.status === filterStatus);
    }
    return this.data.orders;
  }

  updateOrderStatus(orderId: string, newStatus: OrderStatus, note?: string): Order {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('الطلب غير موجود');

    const oldStatus = order.status;
    order.status = newStatus;
    order.updatedAt = new Date().toISOString();
    order.statusHistory.unshift({
      status: newStatus,
      changedAt: new Date().toISOString(),
      note: note || `تغيير الحالة من "${oldStatus}" إلى "${newStatus}"`,
    });

    this.logActivity('status_change', `تم تحديث حالة الطلب #${orderId} إلى "${newStatus}"`);
    this.save();
    return order;
  }

  // Category management
  addCategory(name: string, slug?: string): Category {
    const cleanSlug = slug || name.trim().toLowerCase().replace(/\s+/g, '-');
    const cat: Category = {
      id: 'cat-' + Date.now(),
      name,
      slug: cleanSlug,
      order: this.data.categories.length + 1,
    };
    this.data.categories.push(cat);
    this.save();
    return cat;
  }

  deleteCategory(id: string): void {
    this.data.categories = this.data.categories.filter((c) => c.id !== id);
    this.save();
  }

  // Settings
  getFullSettings() {
    return this.data.settings;
  }

  updateSettings(updates: Partial<PlatformSettings & { adminPass?: string }>): PlatformSettings {
    this.data.settings = {
      ...this.data.settings,
      ...updates,
    };
    this.logActivity('settings', `تم تحديث إعدادات المنصة (العمولة الثابتة: ${this.data.settings.platformFee} دج)`);
    this.save();
    return this.getPublicSettings();
  }

  getContactMessages(): ContactMessage[] {
    return this.data.contactMessages;
  }

  markMessageAsRead(id: string): void {
    const msg = this.data.contactMessages.find((m) => m.id === id);
    if (msg) {
      msg.read = true;
      this.save();
    }
  }
}

export const db = new DB();
