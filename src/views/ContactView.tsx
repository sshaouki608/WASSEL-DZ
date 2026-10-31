import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { api } from '../services/api.ts';
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Send,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const ContactView: React.FC = () => {
  const { config, showToast } = useApp();

  const phone = config?.phone || '+213 667 661 934';
  const whatsapp = config?.whatsapp || '+213 667 661 934';
  const email = config?.email || 'sshaouki608@gmail.com';

  const rawPhone = phone.replace(/[^0-9]/g, '');
  const rawWhatsapp = whatsapp.replace(/[^0-9]/g, '');

  const [name, setName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !userEmail.trim() || !message.trim()) {
      showToast('يرجى ملء الاسم، البريد الإلكتروني ونص الرسالة', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await api.sendContactMessage({
        name: name.trim(),
        email: userEmail.trim(),
        phone: userPhone.trim(),
        subject: subject.trim() || 'استفسار عام',
        message: message.trim(),
      });
      setSentSuccess(true);
      showToast('تم إرسال رسالتك بنجاح، سنتواصل معك قريباً', 'success');
      setName('');
      setUserEmail('');
      setUserPhone('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      showToast(err.message || 'فشل في إرسال الرسالة', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          اتصل بنا – <span className="text-emerald-700">WASSEL DZ</span>
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          نحن في خدمتكم دائماً. سواء كنت بائعاً تريد الاستفسار عن نشر منتجاتك أو مشترياً تريد متابعة طلبيتك، فريقنا مستعد للإجابة على جميع تساؤلاتكم.
        </p>
      </div>

      {/* 3 Quick Action Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* WhatsApp direct card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition-all text-center space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
              <MessageCircle className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">محادثة WhatsApp فورية</h3>
            <p className="text-xs text-slate-500">
              الرد السريع على الاستفسارات وعرض المنتجات مباشرة
            </p>
            <div className="text-sm font-extrabold text-emerald-800 tabular-nums dir-ltr">
              {whatsapp}
            </div>
          </div>
          <a
            href={`https://wa.me/${rawWhatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>فتح محادثة واتساب الآن</span>
          </a>
        </div>

        {/* Direct phone call card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition-all text-center space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-14 h-14 bg-slate-100 text-slate-800 rounded-2xl flex items-center justify-center mx-auto border border-slate-200">
              <Phone className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">الاتصال الهاتفي المباشر</h3>
            <p className="text-xs text-slate-500">
              متاحون طيلة أيام الأسبوع لمتابعة الطلبات وتنسيق الشحن
            </p>
            <div className="text-sm font-extrabold text-slate-900 tabular-nums dir-ltr">
              {phone}
            </div>
          </div>
          <a
            href={`tel:+${rawPhone}`}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4" />
            <span>اتصال هاتفي مباشر</span>
          </a>
        </div>

        {/* Email card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition-all text-center space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-14 h-14 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center mx-auto border border-amber-100">
              <Mail className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">البريد الإلكتروني الرسمي</h3>
            <p className="text-xs text-slate-500">
              للمراسلات التجارية والشراكات الرسمية والدعم المكتبي
            </p>
            <div className="text-xs font-bold text-slate-800 dir-ltr truncate">
              {email}
            </div>
          </div>
          <a
            href={`mailto:${email}`}
            className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            <span>إرسال بريد إلكتروني</span>
          </a>
        </div>
      </div>

      {/* Message Form & Support Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Support Information Box (Col 5) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-950 to-teal-900 text-white rounded-3xl p-8 space-y-6 shadow-md">
          <div className="space-y-2">
            <h3 className="text-xl font-black">أوقات العمل والتغطية</h3>
            <p className="text-xs text-emerald-200 leading-relaxed">
              فريق WASSEL DZ يعمل على مدار الأسبوع لمراجعة طلبات العرض المقدمة من البائعين، والتأكد من وصول كافة الطلبيات إلى المشترين في المواعيد المحددة.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-white">ساعات خدمة الزبائن:</span>
                <span className="text-emerald-200">السبت إلى الخميس: 08:30 صباحاً – 20:00 مساءً</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-white">منطقة التغطية:</span>
                <span className="text-emerald-200">كافة ولايات الجزائر الـ 58 دون استثناء</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-white">إدارة وضمان المنصة:</span>
                <span className="text-emerald-200">كل عملية بيع خاضعة للرقابة لحماية المشتري والبائع</span>
              </div>
            </div>
          </div>
        </div>

        {/* Direct Messaging Form (Col 7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-900">أرسل لنا رسالة مباشرة</h3>
            <p className="text-xs text-slate-500">
              املأ النموذج أدناه وسيقوم فريق الدعم بالرد عليك في أقرب وقت.
            </p>
          </div>

          {sentSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>تم إرسال رسالتكم بنجاح! شكراً لتواصلكم معنا.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الاسم الكامل <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="اسمك الكامل"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  البريد الإلكتروني <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-hidden dir-ltr text-right"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رقم الهاتف (اختياري)
                </label>
                <input
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="0667661934"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-hidden dir-ltr text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  موضوع الرسالة
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="استفسار عن طلب، بيع منتج..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                نص الرسالة أو الاستفسار <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب رسالتك بالتفصيل هنا..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4 text-amber-300" />
              <span>{submitting ? 'جاري الإرسال...' : 'إرسال الرسالة الآن'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
