import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { db } from './server/db.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const PORT = 3000;

const app = express();

// Increase JSON body limit to support multi-photo uploads
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Static uploads directory
const UPLOADS_DIR = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Simple in-memory token store for admin authentication
const activeAdminTokens = new Set<string>();

// Admin Auth Middleware
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'غير مصرح: يلزم تسجيل دخول المدير' });
  }
  const token = authHeader.split(' ')[1];
  if (!activeAdminTokens.has(token)) {
    return res.status(401).json({ error: 'انتهت صلاحية الجلسة، يرجى إعادة تسجيل الدخول' });
  }
  next();
};

// ==========================================
// 1. PUBLIC API ROUTES
// ==========================================

// Public Configuration & Contacts
app.get('/api/public/config', (_req, res) => {
  try {
    const config = db.getPublicSettings();
    res.json(config);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'خطأ في جلب الإعدادات' });
  }
});

// Categories
app.get('/api/public/categories', (_req, res) => {
  try {
    const cats = db.getCategories();
    res.json(cats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Products (Strictly published products only, zero fake products)
app.get('/api/public/products', (req, res) => {
  try {
    const { search, category, wilaya, minPrice, maxPrice, sort, featured } = req.query;
    const products = db.getPublicProducts({
      search: typeof search === 'string' ? search : undefined,
      category: typeof category === 'string' ? category : undefined,
      wilaya: typeof wilaya === 'string' ? wilaya : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort: sort as any,
      featured: featured === 'true',
    });
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Single Product Details
app.get('/api/public/products/:id', (req, res) => {
  try {
    const product = db.getPublicProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'المنتج غير موجود أو غير معتمد حالياً' });
    }
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Seller Product Submission
app.post('/api/public/submissions', (req, res) => {
  try {
    const {
      sellerName,
      sellerPhone,
      sellerWilaya,
      sellerBaladiya,
      preferredContact,
      productTitle,
      productDescription,
      mainImage,
      images,
      sellerPrice,
      quantity,
      category,
      condition,
      additionalNotes,
    } = req.body;

    if (!sellerName || !sellerPhone || !sellerWilaya || !productTitle || !mainImage || !sellerPrice || !category) {
      return res.status(400).json({ error: 'يرجى ملء جميع الحقول الإلزامية بدقة' });
    }

    const submission = db.createSubmission({
      sellerName: sellerName.trim(),
      sellerPhone: sellerPhone.trim(),
      sellerWilaya: sellerWilaya.trim(),
      sellerBaladiya: sellerBaladiya?.trim() || '',
      preferredContact: preferredContact || 'whatsapp',
      productTitle: productTitle.trim(),
      productDescription: productDescription?.trim() || '',
      mainImage,
      images: Array.isArray(images) && images.length > 0 ? images : [mainImage],
      sellerPrice: Number(sellerPrice),
      quantity: Number(quantity) || 1,
      category: category.trim(),
      condition: condition || 'جديد',
      additionalNotes: additionalNotes?.trim() || '',
    });

    res.status(201).json({
      success: true,
      refCode: submission.refCode,
      message: 'تم إرسال طلب عرض المنتج بنجاح وسيتم مراجعته من قبل إدارة WASSEL DZ خلال 24 ساعة.',
      submission,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'حدث خطأ أثناء إرسال الطلب' });
  }
});

// Customer Places an Order
app.post('/api/public/orders', (req, res) => {
  try {
    const { customerName, customerPhone, wilaya, baladiya, address, notes, items } = req.body;

    if (!customerName || !customerPhone || !wilaya || !baladiya || !address || !items || !items.length) {
      return res.status(400).json({ error: 'يرجى تقديم معلومات التوصيل الكاملة والمنتج المطلوب' });
    }

    const order = db.createOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      wilaya: wilaya.trim(),
      baladiya: baladiya.trim(),
      address: address.trim(),
      notes: notes?.trim() || '',
      items: items.map((i: any) => ({
        productId: i.productId,
        quantity: Math.max(1, Number(i.quantity) || 1),
      })),
    });

    res.status(201).json({
      success: true,
      orderId: order.id,
      totalAmount: order.totalAmount,
      message: `تم تسجيل طلبكم بنجاح برقم #${order.id}. سيتصل بكم فريقنا لتأكيد الشحن.`,
      order,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'تعذر تسجيل الطلب' });
  }
});

// Contact Us Form
app.post('/api/public/contact', (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'الاسم، البريد الإلكتروني ونص الرسالة حقول مطلوبة' });
    }
    const msg = db.createContactMessage({
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim(),
      subject: subject?.trim() || 'استفسار من المنصة',
      message: message.trim(),
    });
    res.status(201).json({ success: true, message: 'تم إرسال رسالتك بنجاح وسنرد عليك قريباً', id: msg.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Photo Upload Handler (Accepts Base64 Data URL or file payload and saves to server disk)
app.post('/api/upload', (req, res) => {
  try {
    const { imageBase64, filename } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'لم يتم إرسال أي صورة' });
    }

    // Match data URI pattern
    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      // If it's already a URL, return it directly
      if (imageBase64.startsWith('http') || imageBase64.startsWith('/uploads')) {
        return res.json({ url: imageBase64 });
      }
      return res.status(400).json({ error: 'صيغة الصورة غير صحيحة' });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Extension resolution
    let ext = 'jpg';
    if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('jpeg')) ext = 'jpg';

    const safeFilename = `img_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeFilename);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${safeFilename}`;
    res.json({ url: publicUrl, success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'فشل في حفظ الصورة: ' + err.message });
  }
});

// ==========================================
// 2. ADMIN API ROUTES (PROTECTED)
// ==========================================

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'يرجى إدخال اسم المستخدم وكلمة المرور' });
  }

  const isValid = db.verifyAdmin(username.trim(), password.trim());
  if (!isValid) {
    return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
  }

  const token = 'wdz_' + crypto.randomBytes(32).toString('hex');
  activeAdminTokens.add(token);

  res.json({
    success: true,
    token,
    user: { username: username.trim(), role: 'super_admin' },
  });
});

app.post('/api/admin/logout', requireAdmin, (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    activeAdminTokens.delete(token);
  }
  res.json({ success: true });
});

app.get('/api/admin/me', requireAdmin, (_req, res) => {
  res.json({ authenticated: true, user: { role: 'super_admin' } });
});

// Admin Dashboard Overview
app.get('/api/admin/dashboard', requireAdmin, (_req, res) => {
  try {
    const metrics = db.getDashboardMetrics();
    const activity = db.getActivityLog();
    res.json({ metrics, activity });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Submissions List
app.get('/api/admin/submissions', requireAdmin, (_req, res) => {
  try {
    const subs = db.getSubmissions();
    res.json(subs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Approve Submission
app.post('/api/admin/submissions/:id/approve', requireAdmin, (req, res) => {
  try {
    const { finalPrice, platformFee, category, notes, featured } = req.body;
    const product = db.approveSubmission(req.params.id, {
      finalPrice: finalPrice ? Number(finalPrice) : undefined,
      platformFee: platformFee ? Number(platformFee) : undefined,
      category,
      notes,
      featured,
    });
    res.json({ success: true, message: 'تمت الموافقة على المنتج ونشره بنجاح', product });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Reject Submission
app.post('/api/admin/submissions/:id/reject', requireAdmin, (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ error: 'يرجى تقديم سبب الرفض للبائع' });
    }
    db.rejectSubmission(req.params.id, reason);
    res.json({ success: true, message: 'تم رفض طلب المنتج' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Products Management
app.get('/api/admin/products', requireAdmin, (_req, res) => {
  try {
    const products = db.getAdminProducts();
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/products', requireAdmin, (req, res) => {
  try {
    const product = db.createProductDirect(req.body);
    res.status(201).json({ success: true, message: 'تمت إضافة المنتج بنجاح', product });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/admin/products/:id', requireAdmin, (req, res) => {
  try {
    const updated = db.updateProduct(req.params.id, req.body);
    res.json({ success: true, message: 'تم تحديث بيانات المنتج', product: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
  try {
    db.deleteProduct(req.params.id);
    res.json({ success: true, message: 'تم حذف المنتج بنجاح' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/admin/products/:id/toggle-pause', requireAdmin, (req, res) => {
  try {
    const prods = db.getAdminProducts();
    const prod = prods.find((p) => p.id === req.params.id);
    if (!prod) return res.status(404).json({ error: 'المنتج غير موجود' });
    const newStatus = prod.status === 'published' ? 'paused' : 'published';
    const updated = db.updateProduct(req.params.id, { status: newStatus });
    res.json({ success: true, product: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/admin/products/:id/toggle-featured', requireAdmin, (req, res) => {
  try {
    const prods = db.getAdminProducts();
    const prod = prods.find((p) => p.id === req.params.id);
    if (!prod) return res.status(404).json({ error: 'المنتج غير موجود' });
    const updated = db.updateProduct(req.params.id, { featured: !prod.featured });
    res.json({ success: true, product: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Sellers Management
app.get('/api/admin/sellers', requireAdmin, (_req, res) => {
  try {
    const sellers = db.getSellers();
    res.json(sellers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Orders Management
app.get('/api/admin/orders', requireAdmin, (req, res) => {
  try {
    const status = req.query.status as any;
    const orders = db.getOrders(status);
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/orders/:id/status', requireAdmin, (req, res) => {
  try {
    const { status, note } = req.body;
    if (!status) return res.status(400).json({ error: 'الحالة الجديدة مطلوبة' });
    const order = db.updateOrderStatus(req.params.id, status, note);
    res.json({ success: true, message: 'تم تحديث حالة الطلب بنجاح', order });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Categories Management
app.post('/api/admin/categories', requireAdmin, (req, res) => {
  try {
    const { name, slug } = req.body;
    if (!name) return res.status(400).json({ error: 'اسم التصنيف مطلوب' });
    const cat = db.addCategory(name, slug);
    res.status(201).json({ success: true, category: cat });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/admin/categories/:id', requireAdmin, (req, res) => {
  try {
    db.deleteCategory(req.params.id);
    res.json({ success: true, message: 'تم حذف التصنيف' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Settings Management
app.get('/api/admin/settings', requireAdmin, (_req, res) => {
  try {
    const settings = db.getFullSettings();
    // Do not leak password in plaintext
    const safe = { ...settings, adminPass: '********' };
    res.json(safe);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/settings', requireAdmin, (req, res) => {
  try {
    const updates = { ...req.body };
    if (!updates.adminPass || updates.adminPass === '********') {
      delete updates.adminPass;
    }
    const saved = db.updateSettings(updates);
    res.json({ success: true, message: 'تم حفظ الإعدادات بنجاح', settings: saved });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Contact Messages
app.get('/api/admin/contact-messages', requireAdmin, (_req, res) => {
  try {
    const messages = db.getContactMessages();
    res.json(messages);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/contact-messages/:id/read', requireAdmin, (req, res) => {
  try {
    db.markMessageAsRead(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Export CSV
app.get('/api/admin/export/:type', requireAdmin, (req, res) => {
  try {
    const { type } = req.params;
    let csv = '';
    const now = new Date().toISOString().split('T')[0];

    if (type === 'orders') {
      const orders = db.getOrders();
      csv = 'رقم الطلب,اسم الزبون,الهاتف,الولاية,البلدية,العنوان,الحالة,إجمالي المبلغ,مستحقات البائعين,ربح المنصة,تاريخ الطلب\n';
      orders.forEach((o) => {
        csv += `"${o.id}","${o.customerName}","${o.customerPhone}","${o.wilaya}","${o.baladiya}","${o.address.replace(/"/g, '""')}","${o.status}",${o.totalAmount},${o.totalSellerAmount},${o.totalPlatformProfit},"${o.createdAt}"\n`;
      });
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="wassel_dz_orders_${now}.csv"`);
      return res.send('\uFEFF' + csv);
    } else if (type === 'products') {
      const prods = db.getAdminProducts();
      csv = 'معرف المنتج,اسم المنتج,التصنيف,سعر البائع,عمولة المنصة,السعر النهائي,الكمية,الولاية,الحالة,البائع,هاتف البائع,تاريخ الإضافة\n';
      prods.forEach((p) => {
        csv += `"${p.id}","${p.title.replace(/"/g, '""')}","${p.category}",${p.sellerPrice},${p.platformFee},${p.finalPrice},${p.quantity},"${p.wilaya}","${p.status}","${p.sellerName || ''}","${p.sellerPhone || ''}","${p.createdAt}"\n`;
      });
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="wassel_dz_products_${now}.csv"`);
      return res.send('\uFEFF' + csv);
    } else if (type === 'sellers') {
      const sellers = db.getSellers();
      csv = 'معرف البائع,الاسم الكامل,الهاتف,الولاية,البلدية,المنتجات المقدمة,المنتجات المنشورة,المنتجات المباعة,إجمالي المستحقات المستحقة,تاريخ التسجيل\n';
      sellers.forEach((s) => {
        csv += `"${s.id}","${s.fullName}","${s.phone}","${s.wilaya}","${s.baladiya}",${s.totalSubmissions},${s.totalPublished},${s.totalSold},${s.totalPayoutDue},"${s.createdAt}"\n`;
      });
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="wassel_dz_sellers_${now}.csv"`);
      return res.send('\uFEFF' + csv);
    }

    res.status(400).json({ error: 'نوع التصدير غير معروف' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. FRONTEND MIDDLEWARE / STATIC ASSETS
// ==========================================

async function setupServer() {
  if (!isProduction) {
    // Dynamic import of Vite in development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve built dist files
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WASSEL DZ Platform Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
