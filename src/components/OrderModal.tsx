import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { ALGERIAN_WILAYAS } from '../data/wilayas.ts';
import { api } from '../services/api.ts';
import { X, CheckCircle2, ShoppingBag, ShieldCheck, Phone, MapPin, Truck } from 'lucide-react';

export const OrderModal: React.FC = () => {
  const { orderModalProduct, closeOrderModal, showToast } = useApp();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [wilaya, setWilaya] = useState(ALGERIAN_WILAYAS[15].nameAr); // Default Alger (16)
  const [baladiya, setBaladiya] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successOrder, setSuccessOrder] = useState<any>(null);

  if (!orderModalProduct) return null;

  const unitPrice = orderModalProduct.finalPrice;
  const totalPrice = unitPrice * quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim() || !wilaya || !baladiya.trim() || !address.trim()) {
      showToast('يرجى ملء جميع معلومات التوصيل المطلوبة بدقة', 'error');
      return;
    }

    // Algerian phone number validation check (starts with 05, 06, 07 or +213)
    const cleanPhone = customerPhone.replace(/\s+/g, '');
    if (!/^(0[567][0-9]{8}|\+213[567][0-9]{8}|213[567][0-9]{8})$/.test(cleanPhone)) {
      showToast('يرجى إدخال رقم هاتف جزائري صحيح (مثال: 0667661934)', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await api.placeOrder({
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        wilaya,
        baladiya: baladiya.trim(),
        address: address.trim(),
        notes: notes.trim(),
        items: [
          {
            productId: orderModalProduct.id,
            quantity,
          },
        ],
      });

      setSuccessOrder(res.order);
      showToast(`تم تسجيل طلبك بنجاح برقم #${res.orderId}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'فشل في تسجيل الطلب، يرجى المحاولة ثانية', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccessOrder(null);
    closeOrderModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-amber-300">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">استمارة تأكيد الطلب السريع</h3>
              <p className="text-xs text-emerald-200">الدفع نقداً عند الاستلام بعد معاينة المنتج</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-emerald-300 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successOrder ? (
          /* Confirmation Success State */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h4 className="text-xl font-bold text-slate-900 mb-1">تهانينا! تم تسجيل طلبكم بنجاح</h4>
              <p className="text-sm text-slate-600">
                رقم طلبك الخاص هو: <span className="font-extrabold text-emerald-800 text-base">{successOrder.id}</span>
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-right space-y-2 text-xs text-slate-700">
              <div className="flex justify-between border-b border-slate-200/70 pb-2">
                <span className="text-slate-500">المنتج:</span>
                <span className="font-semibold text-slate-900">{orderModalProduct.title}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/70 pb-2">
                <span className="text-slate-500">الكمية:</span>
                <span className="font-bold">{quantity}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/70 pb-2">
                <span className="text-slate-500">المبلغ الإجمالي:</span>
                <span className="font-extrabold text-emerald-700 text-sm">{totalPrice.toLocaleString()} دج</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">مكان التوصيل:</span>
                <span className="font-medium">{wilaya} – {baladiya}</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200/70 text-right text-xs text-emerald-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-700" />
                <span>ما هي الخطوة القادمة؟</span>
              </p>
              <p className="text-slate-600">
                سيتصل بكم قسم تأكيد الطلبات في منصة WASSEL DZ هاتفياً خلال ساعات لتأكيد العنوان وتحديد موعد الشحن.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
            >
              متابعة تصفح السوق
            </button>
          </div>
        ) : (
          /* Order Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Product Summary Row */}
            <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <img
                src={orderModalProduct.mainImage}
                alt={orderModalProduct.title}
                className="w-16 h-16 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 truncate mb-1">
                  {orderModalProduct.title}
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{orderModalProduct.category}</span>
                  <span className="text-sm font-extrabold text-emerald-700">
                    {orderModalProduct.finalPrice.toLocaleString()} دج
                  </span>
                </div>
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <span className="text-xs font-bold text-slate-800">الكمية المطلوبة:</span>
              <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors"
                >
                  -
                </button>
                <span className="font-extrabold text-sm w-6 text-center tabular-nums">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(orderModalProduct.quantity || 99, quantity + 1))}
                  className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Customer Information Inputs */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الاسم الكامل <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="مثال: يوسف بلقاسم"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رقم الهاتف (للتأكيد والتوصيل) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0667661934 أو 0550123456"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden dir-ltr text-right"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الولاية <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={wilaya}
                    onChange={(e) => setWilaya(e.target.value)}
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    البلدية <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={baladiya}
                    onChange={(e) => setBaladiya(e.target.value)}
                    placeholder="مثال: الدار البيضاء"
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  العنوان بالتفصيل (الحي، الشارع، رقم الباب) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="مثال: حي النور، عمارة 4، مدخل ب"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ملاحظات أو تعليمات خاصة (اختياري)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: الاتصال بعد الساعة 2 زوالاً"
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Total calculation & Payment note */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">المبلغ الإجمالي المستحق:</span>
                <span className="text-xl font-black text-emerald-800 tabular-nums">
                  {totalPrice.toLocaleString()} <span className="text-xs font-bold text-slate-600">دج</span>
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200/80">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>الدفع عند الاستلام</span>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-70 text-white font-extrabold text-sm rounded-xl shadow-md shadow-emerald-700/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>جاري تسجيل الطلب...</span>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-amber-300" />
                  <span>تأكيد الطلب الآن</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
