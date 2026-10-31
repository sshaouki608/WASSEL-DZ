import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { ALGERIAN_WILAYAS } from '../data/wilayas.ts';
import { api } from '../services/api.ts';
import {
  ShoppingBag,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Truck,
  Plus,
  Minus,
} from 'lucide-react';

export const CartView: React.FC = () => {
  const { cart, removeFromCart, updateCartQty, clearCart, setView, showToast } = useApp();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [wilaya, setWilaya] = useState(ALGERIAN_WILAYAS[15].nameAr); // Default Alger (16)
  const [baladiya, setBaladiya] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  const subtotal = cart.reduce((acc, item) => acc + item.product.finalPrice * item.quantity, 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim() || !wilaya || !baladiya.trim() || !address.trim()) {
      showToast('يرجى ملء كافة تفاصيل التوصيل الإلزامية', 'error');
      return;
    }

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
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      });

      setConfirmedOrder(res.order);
      clearCart();
      showToast(`تم تأكيد طلبكم بنجاح برقم #${res.orderId}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'فشل في إرسال الطلب', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-3xl flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            تم استلام طلبكم بنجاح!
          </h2>
          <p className="text-sm text-slate-600">
            رقم الطلب المعتمد هو: <span className="font-mono font-bold text-emerald-700 text-base">#{confirmedOrder.id}</span>
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200/90 text-right space-y-3 shadow-xs">
          <div className="flex justify-between text-xs text-slate-600 border-b border-slate-100 pb-2">
            <span>عدد العناصر:</span>
            <span className="font-bold">{confirmedOrder.items.length} منتج</span>
          </div>
          <div className="flex justify-between text-xs text-slate-600 border-b border-slate-100 pb-2">
            <span>المبلغ الإجمالي:</span>
            <span className="font-extrabold text-emerald-700 text-sm">
              {confirmedOrder.totalAmount.toLocaleString()} دج
            </span>
          </div>
          <div className="flex justify-between text-xs text-slate-600">
            <span>عنوان التسليم:</span>
            <span className="font-medium text-slate-800">
              {confirmedOrder.wilaya} – {confirmedOrder.baladiya} ({confirmedOrder.address})
            </span>
          </div>
        </div>

        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-right text-emerald-900 flex items-center gap-2">
          <Truck className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>سيقوم فريق WASSEL DZ بالاتصال بكم هاتفياً لتأكيد الشحن والتسليم.</span>
        </div>

        <button
          onClick={() => {
            setConfirmedOrder(null);
            setView('home');
          }}
          className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
        >
          العودة للرئيسية وتصفح السوق
        </button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">سلة التسوق فارغة</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            لم تقم بإضافة أي منتجات إلى سلتك بعد. تصفح السوق واطلب ما يناسبك.
          </p>
        </div>
        <button
          onClick={() => setView('catalog')}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          تصفح المنتجات الآن
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900">سلة المشتريات</h1>
          <p className="text-xs text-slate-500 mt-0.5">لديك {cart.length} منتجات في السلة</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
        >
          تفريغ السلة بالكامل
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart items list (Col 7) */}
        <div className="lg:col-span-7 space-y-4">
          {cart.map((item) => (
            <div
              key={item.product.id}
              className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4"
            >
              <img
                src={item.product.mainImage}
                alt={item.product.title}
                className="w-20 h-20 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
              />

              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-emerald-700 font-bold block mb-0.5">
                  {item.product.category}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate mb-1">
                  {item.product.title}
                </h4>
                <div className="text-xs font-black text-emerald-700 tabular-nums">
                  {item.product.finalPrice.toLocaleString()} دج
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                  className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs font-bold w-5 text-center tabular-nums">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                  className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeFromCart(item.product.id)}
                className="text-slate-400 hover:text-rose-600 p-2 rounded-lg transition-colors"
                title="حذف"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Checkout Form (Col 5) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">معلومات الشحن والتسليم</h3>
            <p className="text-xs text-slate-500">الدفع نقداً عند استلام كامل الطلبية</p>
          </div>

          <form onSubmit={handleCheckout} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الاسم الكامل <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="الاسم واللقب"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                رقم الهاتف للتأكيد <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="0667661934"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-hidden dir-ltr text-right"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الولاية <span className="text-rose-500">*</span>
                </label>
                <select
                  value={wilaya}
                  onChange={(e) => setWilaya(e.target.value)}
                  className="w-full text-xs px-2.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-hidden bg-white"
                >
                  {ALGERIAN_WILAYAS.map((w) => (
                    <option key={w.code} value={w.nameAr}>
                      {w.code} - {w.nameAr}
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
                  placeholder="البلدية"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                العنوان بالتفصيل <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="الحي، رقم الباب، الشارع"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ملاحظات إضافية (اختياري)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أوقات الاتصال المفضلة..."
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-500">المجموع النهائي:</span>
                <span className="text-xl font-black text-emerald-800 tabular-nums">
                  {subtotal.toLocaleString()} <span className="text-xs text-slate-600">دج</span>
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white font-black text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? <span>جاري إرسال الطلب...</span> : <span>تأكيد وشراء السلة الآن</span>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
