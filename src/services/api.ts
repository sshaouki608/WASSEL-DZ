import type {
  PublicProduct,
  Category,
  PlatformSettings,
  ProductSubmission,
  Order,
  Product,
  Seller,
  DashboardMetrics,
  ContactMessage,
  OrderStatus,
} from '../types/index.ts';

const ADMIN_TOKEN_KEY = 'wassel_dz_admin_token';

export const getAdminToken = (): string | null => {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
};

export const setAdminToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  }
};

const getAuthHeaders = () => {
  const token = getAdminToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // --- Public APIs ---
  async getConfig(): Promise<PlatformSettings> {
    const res = await fetch('/api/public/config');
    if (!res.ok) throw new Error('فشل جلب بيانات المنصة');
    return res.json();
  },

  async getCategories(): Promise<Category[]> {
    const res = await fetch('/api/public/categories');
    if (!res.ok) throw new Error('فشل جلب التصنيفات');
    return res.json();
  },

  async getProducts(params?: {
    search?: string;
    category?: string;
    wilaya?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    featured?: boolean;
  }): Promise<PublicProduct[]> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.category && params.category !== 'all') searchParams.set('category', params.category);
    if (params?.wilaya && params.wilaya !== 'all') searchParams.set('wilaya', params.wilaya);
    if (params?.minPrice) searchParams.set('minPrice', params.minPrice.toString());
    if (params?.maxPrice) searchParams.set('maxPrice', params.maxPrice.toString());
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.featured) searchParams.set('featured', 'true');

    const res = await fetch(`/api/public/products?${searchParams.toString()}`);
    if (!res.ok) throw new Error('فشل جلب المنتجات');
    return res.json();
  },

  async getProductById(id: string): Promise<PublicProduct> {
    const res = await fetch(`/api/public/products/${id}`);
    if (!res.ok) throw new Error('المنتج غير موجود أو غير معتمد');
    return res.json();
  },

  async submitProduct(data: {
    sellerName: string;
    sellerPhone: string;
    sellerWilaya: string;
    sellerBaladiya: string;
    preferredContact: 'whatsapp' | 'phone' | 'email';
    productTitle: string;
    productDescription: string;
    mainImage: string;
    images: string[];
    sellerPrice: number;
    quantity: number;
    category: string;
    condition: any;
    additionalNotes?: string;
  }): Promise<{ success: boolean; refCode: string; message: string; submission: ProductSubmission }> {
    const res = await fetch('/api/public/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'فشل إرسال المنتج');
    return json;
  },

  async placeOrder(data: {
    customerName: string;
    customerPhone: string;
    wilaya: string;
    baladiya: string;
    address: string;
    notes?: string;
    items: { productId: string; quantity: number }[];
  }): Promise<{ success: boolean; orderId: string; totalAmount: number; message: string; order: Order }> {
    const res = await fetch('/api/public/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'فشل تسجيل الطلب');
    return json;
  },

  async sendContactMessage(data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/public/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'فشل إرسال الرسالة');
    return json;
  },

  async uploadPhoto(imageBase64: string): Promise<string> {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64 }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'فشل رفع الصورة');
    return json.url;
  },

  // --- Admin APIs ---
  async adminLogin(username: string, password: string): Promise<{ token: string; user: any }> {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'فشل تسجيل الدخول');
    setAdminToken(json.token);
    return json;
  },

  async adminLogout(): Promise<void> {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } finally {
      setAdminToken(null);
    }
  },

  async checkAdminAuth(): Promise<boolean> {
    const token = getAdminToken();
    if (!token) return false;
    try {
      const res = await fetch('/api/admin/me', { headers: getAuthHeaders() });
      return res.ok;
    } catch {
      return false;
    }
  },

  async getDashboard(): Promise<{ metrics: DashboardMetrics; activity: any[] }> {
    const res = await fetch('/api/admin/dashboard', { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('فشل جلب إحصائيات لوحة التحكم');
    return res.json();
  },

  async getAdminSubmissions(): Promise<ProductSubmission[]> {
    const res = await fetch('/api/admin/submissions', { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('فشل جلب طلبات المنتجات');
    return res.json();
  },

  async approveSubmission(
    id: string,
    payload: {
      finalPrice?: number;
      platformFee?: number;
      category?: string;
      notes?: string;
      featured?: boolean;
    }
  ): Promise<Product> {
    const res = await fetch(`/api/admin/submissions/${id}/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'فشل قبول المنتج');
    return json.product;
  },

  async rejectSubmission(id: string, reason: string): Promise<void> {
    const res = await fetch(`/api/admin/submissions/${id}/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'فشل رفض المنتج');
  },

  async getAdminProducts(): Promise<Product[]> {
    const res = await fetch('/api/admin/products', { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('فشل جلب المنتجات');
    return res.json();
  },

  async createProductDirect(data: any): Promise<Product> {
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'فشل إضافة المنتج');
    return json.product;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'فشل تعديل المنتج');
    return json.product;
  },

  async deleteProduct(id: string): Promise<void> {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error || 'فشل حذف المنتج');
    }
  },

  async toggleProductPause(id: string): Promise<Product> {
    const res = await fetch(`/api/admin/products/${id}/toggle-pause`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);
    return json.product;
  },

  async toggleProductFeatured(id: string): Promise<Product> {
    const res = await fetch(`/api/admin/products/${id}/toggle-featured`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);
    return json.product;
  },

  async getAdminSellers(): Promise<Seller[]> {
    const res = await fetch('/api/admin/sellers', { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('فشل جلب قائمة البائعين');
    return res.json();
  },

  async getAdminOrders(status?: string): Promise<Order[]> {
    const url = status && status !== 'all' ? `/api/admin/orders?status=${encodeURIComponent(status)}` : '/api/admin/orders';
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('فشل جلب الطلبات');
    return res.json();
  },

  async updateOrderStatus(id: string, status: OrderStatus, note?: string): Promise<Order> {
    const res = await fetch(`/api/admin/orders/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, note }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'فشل تحديث حالة الطلب');
    return json.order;
  },

  async addCategory(name: string): Promise<Category> {
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'فشل إضافة التصنيف');
    return json.category;
  },

  async deleteCategory(id: string): Promise<void> {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('فشل حذف التصنيف');
  },

  async getAdminSettings(): Promise<PlatformSettings & { adminUser?: string }> {
    const res = await fetch('/api/admin/settings', { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('فشل جلب الإعدادات');
    return res.json();
  },

  async updateAdminSettings(settings: any): Promise<PlatformSettings> {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'فشل حفظ الإعدادات');
    return json.settings;
  },

  async getContactMessages(): Promise<ContactMessage[]> {
    const res = await fetch('/api/admin/contact-messages', { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('فشل جلب رسائل التواصل');
    return res.json();
  },

  async markMessageRead(id: string): Promise<void> {
    await fetch(`/api/admin/contact-messages/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
  },

  getExportUrl(type: 'orders' | 'products' | 'sellers'): string {
    return `/api/admin/export/${type}`;
  },
};
