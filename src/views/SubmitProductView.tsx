import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { ALGERIAN_WILAYAS } from '../data/wilayas.ts';
import { api } from '../services/api.ts';
import type { ProductCondition } from '../types/index.ts';
import {
  Upload,
  CheckCircle2,
  Image as ImageIcon,
  MessageCircle,
  HelpCircle,
  Plus,
  Trash2,
  FileCheck,
  Phone,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export const SubmitProductView: React.FC = () => {
  const { categories, showToast, config } = useApp();

  // Seller Details
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerWilaya, setSellerWilaya] = useState(ALGERIAN_WILAYAS[15].nameAr); // Default Alger (16)
  const [sellerBaladiya, setSellerBaladiya] = useState('');
  const [preferredContact, setPreferredContact] = useState<'whatsapp' | 'phone' | 'email'>('whatsapp');

  // Product Details
  const [productTitle, setProductTitle] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'الإلكترونيات');
  const [condition, setCondition] = useState<ProductCondition>('جديد');
  const [sellerPrice, setSellerPrice] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Images state
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Submission result
  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<{
    refCode: string;
    productTitle: string;
    sellerPrice: number;
    sellerName: string;
    sellerPhone: string;
  } | null>(null);

  // File upload handler converting image to base64 and uploading to server
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          showToast('يرجى اختيار ملف صورة صالح (JPG, PNG, WEBP)', 'error');
          continue;
        }

        // Limit size to 8MB
        if (file.size > 8 * 1024 * 1024) {
          showToast('حجم الصورة كبير جداً، الحد الأقصى هو 8 ميغابايت', 'error');
          continue;
        }

        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
        });
        reader.readAsDataURL(file);

        const base64 = await base64Promise;
        const uploadedUrl = await api.uploadPhoto(base64);

        setImages((prev) => [...prev, uploadedUrl]);
      }
      showToast('تم رفع الصور بنجاح', 'success');
    } catch (err: any) {
      showToast(err.message || 'فشل في رفع الصورة', 'error');
    } finally {
      setUploadingImage(false);
      // reset file input
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sellerName.trim() || !sellerPhone.trim() || !sellerWilaya || !productTitle.trim() || !sellerPrice) {
      showToast('يرجى ملء جميع الحقول الإلزامية التي تحمل علامة (*)', 'error');
      return;
    }

    if (images.length === 0) {
      showToast('يرجى رفع صورة واحدة على الأقل للمنتج', 'error');
      return;
    }

    const cleanPhone = sellerPhone.replace(/\s+/g, '');
    if (!/^(0[567][0-9]{8}|\+213[567][0-9]{8}|213[567][0-9]{8})$/.test(cleanPhone)) {
      showToast('يرجى إدخال رقم هاتف جزائري صحيح (مثال: 0667661934)', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.submitProduct({
        sellerName: sellerName.trim(),
        sellerPhone: cleanPhone,
        sellerWilaya,
        sellerBaladiya: sellerBaladiya.trim(),
        preferredContact,
        productTitle: productTitle.trim(),
        productDescription: productDescription.trim(),
        mainImage: images[0],
        images,
        sellerPrice: Number(sellerPrice),
        quantity: Number(quantity) || 1,
        category: category || categories[0]?.name || 'منتجات متنوعة',
        condition,
        additionalNotes: additionalNotes.trim(),
      });

      setSubmittedResult({
        refCode: res.refCode,
        productTitle: productTitle.trim(),
        sellerPrice: Number(sellerPrice),
        sellerName: sellerName.trim(),
        sellerPhone: cleanPhone,
      });

      showToast(`تم إرسال طلب عرض المنتج بنجاح برقم مرجعي: ${res.refCode}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء إرسال المنتج', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Direct WhatsApp formatted message helper
  const openWhatsAppSubmission = () => {
    const adminWhatsApp = (config?.whatsapp || '+213 667 661 934').replace(/[^0-9]/g, '');
    const refCode = submittedResult?.refCode || 'WDZ-' + Math.floor(10000 + Math.random() * 90000);
    const text = encodeURIComponent(
      `مرحباً إدارة WASSEL DZ، أريد تأكيد عرض منتجي للبيع:\n\n` +
        `• الرقم المرجعي: ${refCode}\n` +
        `• اسم البائع: ${sellerName || submittedResult?.sellerName}\n` +
        `• رقم الهاتف: ${sellerPhone || submittedResult?.sellerPhone}\n` +
        `• الولاية: ${sellerWilaya}\n` +
        `• اسم المنتج: ${productTitle || submittedResult?.productTitle}\n` +
        `• السعر المقترح من البائع: ${sellerPrice || submittedResult?.sellerPrice} دج\n` +
        `• التصنيف: ${category}\n` +
        `• الحالة: ${condition}\n\n` +
        `يرجى مراجعة طلبي واعتماده في المتجر. شكراً لكم.`
    );
    window.open(`https://wa.me/${adminWhatsApp}?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Page Title & Intro */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <FileCheck className="w-3.5 h-3.5" />
          <span>بوابة البائعين المعتمدين</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          اعرض منتجك للبيع عبر <span className="text-emerald-700">WASSEL DZ</span>
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          أرسل معلومات منتجك وصوره وسعرك المطلوب. سنقوم بمراجعته واعتماده ونشره في المنصة ليصل إلى الزبائن في جميع ولايات الجزائر.
        </p>
      </div>

      {submittedResult ? (
        /* Submission Success Card */
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 sm:p-12 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-20 h-20 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">تم استلام طلبك بنجاح!</h2>
            <p className="text-sm text-slate-600">
              تم حفظ بيانات منتجك وهو الآن قيد المراجعة لدى إدارة المنصة.
            </p>
          </div>

          {/* Reference badge */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-md mx-auto space-y-1">
            <span className="text-xs text-slate-500 font-medium">الرقم المرجعي لطلبك:</span>
            <div className="text-2xl font-black text-emerald-700 font-mono tracking-wider">
              {submittedResult.refCode}
            </div>
            <p className="text-[11px] text-slate-400">
              احتفظ بهذا الرقم لمتابعة حالة المنتج مع الإدارة.
            </p>
          </div>

          {/* Policy notes */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-right text-xs text-amber-900 space-y-2 max-w-lg mx-auto">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <ShieldCheck className="w-4 h-4" />
              <span>ماذا بعد إرسال الطلب؟</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              <li>يراجع مدير المنصة تفاصيل المنتج والصور للتأكد من جودتها ومطابقتها.</li>
              <li>يتم تحديد السعر النهائي وإضافة العمولة الثابتة الخاصة بالمنصة ونشر المنتج في المتجر.</li>
              <li>عندما يطلب الزبون منتجك، سنتواصل معك فوراً لتجهيزه واستلامه للشحن.</li>
            </ul>
          </div>

          {/* Send via WhatsApp Option */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={openWhatsAppSubmission}
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-100" />
              <span>إرسال تفاصيل الطلب عبر WhatsApp أيضاً</span>
            </button>

            <button
              onClick={() => {
                setSubmittedResult(null);
                setProductTitle('');
                setProductDescription('');
                setSellerPrice('');
                setImages([]);
              }}
              className="w-full sm:w-auto px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              عرض منتج آخر
            </button>
          </div>
        </div>
      ) : (
        /* The Seller Submission Form */
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Seller Contact & Location */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">معلومات البائع</h3>
                <p className="text-xs text-slate-500">معلومات سرية للتواصل بينك وبين إدارة المنصة فقط</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  الاسم الكامل للبائع <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  placeholder="مثال: كريم بوجمعة"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  رقم الهاتف للتواصل <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  placeholder="0667661934"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden dir-ltr text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  الولاية <span className="text-rose-500">*</span>
                </label>
                <select
                  value={sellerWilaya}
                  onChange={(e) => setSellerWilaya(e.target.value)}
                  className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden bg-white"
                >
                  {ALGERIAN_WILAYAS.map((w) => (
                    <option key={w.code} value={w.nameAr}>
                      {w.code} - {w.nameAr} ({w.nameFr})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  البلدية <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={sellerBaladiya}
                  onChange={(e) => setSellerBaladiya(e.target.value)}
                  placeholder="مثال: بئر مراد رايس"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  طريقة التواصل المفضلة
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPreferredContact('whatsapp')}
                    className={`py-2 px-3 text-xs rounded-xl font-medium border text-center transition-all cursor-pointer ${
                      preferredContact === 'whatsapp'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    واتساب (WhatsApp)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferredContact('phone')}
                    className={`py-2 px-3 text-xs rounded-xl font-medium border text-center transition-all cursor-pointer ${
                      preferredContact === 'phone'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    اتصال هاتفي
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferredContact('email')}
                    className={`py-2 px-3 text-xs rounded-xl font-medium border text-center transition-all cursor-pointer ${
                      preferredContact === 'email'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    بريد إلكتروني
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Product Specifications */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">معلومات المنتج</h3>
                <p className="text-xs text-slate-500">التفاصيل التي ستظهر للمشترين بعد موافقة الإدارة</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  اسم المنتج <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  placeholder="مثال: هاتف سامسونج جالاكسي S23 ألترا 256 جيجابايت"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    التصنيف <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    حالة المنتج <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as ProductCondition)}
                    className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden bg-white"
                  >
                    <option value="جديد">جديد بالعلبة وغير مستعمل</option>
                    <option value="مستعمل بحالة ممتازة">مستعمل بحالة ممتازة (شبه جديد)</option>
                    <option value="مستعمل بحالة جيدة">مستعمل بحالة جيدة</option>
                    <option value="مستعمل بحالة مقبولة">مستعمل بحالة مقبولة</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    السعر الذي تطلبه أنت كبائع (بالدينار الجزائري DZD) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={100}
                      value={sellerPrice}
                      onChange={(e) => setSellerPrice(e.target.value ? Number(e.target.value) : '')}
                      placeholder="مثال: 4500"
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden tabular-nums text-left"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-500 pointer-events-none">
                      دج
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    هذا هو المبلغ الصافي الذي ستستلمه أنت بالكامل عند إتمام البيع.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    الكمية المتوفرة لديك
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  الوصف التفصيلي للمنتج <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="اذكر المواصفات، الملحقات، اللون، القياسات، وأي تفاصيل تهم المشتري..."
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
                />
              </div>

              {/* Photo Uploads */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  صور المنتج (الصورة الأولى ستكون الرئيسية) <span className="text-rose-500">*</span>
                </label>

                {/* Dropzone */}
                <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center bg-slate-50 transition-colors">
                  <input
                    type="file"
                    id="product-images-input"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="product-images-input"
                    className="flex flex-col items-center justify-center cursor-pointer space-y-2"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white text-emerald-600 shadow-xs flex items-center justify-center border border-slate-200">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-slate-800">
                      اضغط لاختيار الصور من هاتفك أو حاسوبك
                    </span>
                    <span className="text-xs text-slate-500">
                      JPG, PNG, WEBP (يمكنك اختيار عدة صور واضحة)
                    </span>
                  </label>
                  {uploadingImage && (
                    <div className="text-xs font-semibold text-emerald-700 mt-2">
                      جاري حفظ الصور...
                    </div>
                  )}
                </div>

                {/* Images Preview Grid */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100"
                      >
                        <img src={img} alt={`صورة ${idx + 1}`} className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute top-1 right-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                            الرئيسية
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute bottom-1 left-1 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-md transition-colors opacity-90 group-hover:opacity-100"
                          title="حذف الصورة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ملاحظات إضافية لإدارة المنصة (اختياري)
                </label>
                <input
                  type="text"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="مثال: متواجد بعد العصر، السعر قابل للتفاوض البسيط..."
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Submission Terms Notice */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-start gap-3 text-xs text-slate-600 leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              بإرسال هذا النموذج، تؤكد أنك المالك الحقيقي للمنتج أو مخول ببيعه، وأن الصور حقيقية ومطابقة للواقع. لن يتم نشر أي منتج في المتجر إلا بعد الفحص والموافقة من طرف إدارة WASSEL DZ.
            </p>
          </div>

          {/* Submit Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              disabled={submitting || uploadingImage}
              className="w-full sm:flex-1 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-70 text-white font-black text-sm rounded-xl shadow-md shadow-emerald-700/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span>جاري إرسال الطلب...</span>
              ) : (
                <>
                  <FileCheck className="w-4 h-4 text-amber-300" />
                  <span>إرسال المنتج للمراجعة والنشر</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={openWhatsAppSubmission}
              className="w-full sm:w-auto py-3.5 px-5 bg-white hover:bg-slate-50 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-300 shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>إرسال عبر WhatsApp</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
