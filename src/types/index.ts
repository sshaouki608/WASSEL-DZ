export type OrderStatus =
  | 'جديد'
  | 'قيد المراجعة'
  | 'تم التأكيد'
  | 'قيد التجهيز'
  | 'تم الشحن'
  | 'تم التسليم'
  | 'مكتمل'
  | 'ملغى';

export type ProductCondition = 'جديد' | 'مستعمل بحالة ممتازة' | 'مستعمل بحالة جيدة' | 'مستعمل بحالة مقبولة';

export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  mainImage: string;
  // Seller pricing
  sellerPrice: number; // Only admin sees this
  platformFee: number; // Only admin sees this
  finalPrice: number; // Customer price = sellerPrice + platformFee
  quantity: number;
  condition: ProductCondition;
  wilaya: string;
  baladiya?: string;
  status: 'published' | 'pending' | 'rejected' | 'paused';
  featured: boolean;
  views: number;
  sellerId?: string;
  sellerName?: string;
  sellerPhone?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  notes?: string;
}

// Sanitized public product model for customer safety
export interface PublicProduct {
  id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  mainImage: string;
  finalPrice: number;
  quantity: number;
  condition: ProductCondition;
  wilaya: string;
  baladiya?: string;
  featured: boolean;
  views: number;
  createdAt: string;
}

export interface Seller {
  id: string;
  fullName: string;
  phone: string;
  wilaya: string;
  baladiya: string;
  preferredContact: 'whatsapp' | 'phone' | 'email';
  createdAt: string;
  totalSubmissions: number;
  totalPublished: number;
  totalSold: number;
  totalPayoutDue: number; // Sum of sellerPrice for completed orders
  totalPaid: number;
}

export interface ProductSubmission {
  id: string;
  refCode: string;
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
  condition: ProductCondition;
  additionalNotes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_edit';
  adminFeedback?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface OrderItem {
  productId: string;
  productTitle: string;
  productImage: string;
  quantity: number;
  sellerPrice: number; // snapshot
  platformFee: number; // snapshot
  unitPrice: number; // snapshot final price
  totalPrice: number;
  sellerId?: string;
  sellerName?: string;
  sellerPhone?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  wilaya: string;
  baladiya: string;
  address: string;
  notes?: string;
  items: OrderItem[];
  totalAmount: number; // Total customer pays
  totalSellerAmount: number; // Total payout for seller(s)
  totalPlatformProfit: number; // Platform profit from this order
  status: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    changedAt: string;
    note?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName?: string;
  description?: string;
  order: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  bgGradient: string;
  active: boolean;
}

export interface PlatformSettings {
  platformFee: number; // Default fixed fee in DZD
  phone: string;
  whatsapp: string;
  email: string;
  addressNotice?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  banners: Banner[];
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface DashboardMetrics {
  totalProducts: number;
  publishedProducts: number;
  pendingProducts: number;
  rejectedProducts: number;
  totalOrders: number;
  newOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalPlatformProfit: number;
  totalSellerPayouts: number;
  totalSalesVolume: number;
}
