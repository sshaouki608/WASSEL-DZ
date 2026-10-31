import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Phone, Mail, MessageCircle, MapPin, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setView, config } = useApp();

  const phone = config?.phone || '+213 667 661 934';
  const whatsapp = config?.whatsapp || '+213 667 661 934';
  const email = config?.email || 'sshaouki608@gmail.com';

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-900 mt-20">
      {/* Trust Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 border-b border-slate-900">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">تغطية شاملة لـ 58 ولاية</h4>
              <p className="text-xs text-slate-400">توصيل موثوق وسريع إلى باب منزلك في كل أرجاء الجزائر</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">الدفع عند الاستلام</h4>
              <p className="text-xs text-slate-400">لا تدفع ديناراً واحداً حتى تستلم منتجك وتتأكد من مطابقته</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">مراجعة وفحص دقيق</h4>
              <p className="text-xs text-slate-400">كل منتج معروض يتم تدقيقه والموافقة عليه يدويًا من الإدارة</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-md">
                <span className="font-black text-base text-amber-300">W</span>
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                WASSEL <span className="text-emerald-500">DZ</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              WASSEL DZ هي المنصة الوطنية الإلكترونية التي تجمع البائعين والمشترين من مختلف ولايات الوطن، مع ضمان مراجعة كل منتج وتوثيق الطلبات لراحة وأمان الجميع.
            </p>
            <div className="text-xs text-amber-400/90 font-medium flex items-center gap-1.5">
              <span>شعارنا: سوقك الجزائري في مكان واحد.</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h5 className="text-sm font-bold text-white mb-4">روابط سريعة</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => {
                    setView('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  الصفحة الرئيسية
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setView('catalog');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  تصفح المنتجات
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setView('submit-product');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                >
                  اعرض منتجك للبيع
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setView('how-to-sell');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  كيفية البيع عبر WASSEL DZ
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setView('faq');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  الأسئلة الشائعة
                </button>
              </li>
            </ul>
          </div>

          {/* Legal and terms */}
          <div>
            <h5 className="text-sm font-bold text-white mb-4">السياسات والشروط</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => setView('about')} className="hover:text-emerald-400 transition-colors">
                  من نحن
                </button>
              </li>
              <li>
                <button onClick={() => setView('privacy')} className="hover:text-emerald-400 transition-colors">
                  سياسة الخصوصية
                </button>
              </li>
              <li>
                <button onClick={() => setView('terms')} className="hover:text-emerald-400 transition-colors">
                  شروط الاستخدام
                </button>
              </li>
              <li>
                <button onClick={() => setView('product-terms')} className="hover:text-emerald-400 transition-colors">
                  شروط عرض المنتجات
                </button>
              </li>
              <li>
                <button onClick={() => setView('cancellation-policy')} className="hover:text-emerald-400 transition-colors">
                  سياسة الطلبات والإلغاء
                </button>
              </li>
            </ul>
          </div>

          {/* Official Contacts */}
          <div>
            <h5 className="text-sm font-bold text-white mb-4">اتصل بنا</h5>
            <div className="space-y-3 text-xs text-slate-300">
              <a
                href={`tel:${phone.replace(/\s+/g, '')}`}
                className="flex items-center gap-2.5 hover:text-emerald-400 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <span className="tabular-nums dir-ltr">{phone}</span>
              </a>

              <a
                href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 hover:text-emerald-400 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-3.5 h-3.5" />
                </div>
                <span className="tabular-nums dir-ltr">واتساب: {whatsapp}</span>
              </a>

              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2.5 hover:text-emerald-400 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <span className="dir-ltr truncate">{email}</span>
              </a>

              <div className="flex items-center gap-2.5 text-slate-400 pt-1">
                <div className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span>الجزائر – 58 ولاية</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & admin access */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} WASSEL DZ (واصل ديزاد). جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                setView('contact');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-slate-300 transition-colors"
            >
              الدعم الفني
            </button>
            <button
              onClick={() => {
                setView('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-amber-400/80 hover:text-amber-300 transition-colors"
            >
              بوابة الإدارة
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
