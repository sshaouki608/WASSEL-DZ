import React, { useState } from 'react';
import { MessageCircle, Phone, Mail, X } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

export const FloatingWhatsApp: React.FC = () => {
  const { config } = useApp();
  const [expanded, setExpanded] = useState(false);

  const rawPhone = (config?.phone || '+213 667 661 934').replace(/[^0-9]/g, '');
  const rawWhatsapp = (config?.whatsapp || '+213 667 661 934').replace(/[^0-9]/g, '');
  const email = config?.email || 'sshaouki608@gmail.com';

  return (
    <aside aria-label="أدوات التواصل السريع" className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2.5">
      {/* Expanded quick contact options */}
      {expanded && (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 p-3 mb-1 flex flex-col gap-2 min-w-[210px] animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800">خدمة الزبائن السريعة</span>
            <button
              onClick={() => setExpanded(false)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-sm"
              aria-label="إغلاق قائمة التواصل السريع"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <a
            href={`https://wa.me/${rawWhatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
              <MessageCircle className="w-3.5 h-3.5" />
            </div>
            <span>محادثة واتساب مباشرة</span>
          </a>

          <a
            href={`tel:+${rawPhone}`}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <div className="w-6 h-6 rounded-lg bg-slate-800 text-white flex items-center justify-center">
              <Phone className="w-3.5 h-3.5" />
            </div>
            <span>اتصال هاتفي مباشر</span>
          </a>

          <a
            href={`mailto:${email}`}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors"
          >
            <div className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center">
              <Mail className="w-3.5 h-3.5" />
            </div>
            <span>إرسال بريد إلكتروني</span>
          </a>
        </div>
      )}

      {/* Main Floating WhatsApp Bubble */}
      <div className="flex items-center gap-2">
        <a
          href={`https://wa.me/${rawWhatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          title="تواصل معنا عبر واتساب"
          className="w-13 h-13 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-700/30 hover:scale-108 active:scale-95 transition-all focus:outline-hidden"
          aria-label="محادثة واتساب مباشرة"
        >
          <MessageCircle className="w-7 h-7 fill-white/20 stroke-[2.2]" />
        </a>

        {/* Small toggle pill for multiple options */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="bg-white/95 hover:bg-white text-slate-700 hover:text-emerald-700 font-semibold text-xs py-2 px-3 rounded-full shadow-md border border-slate-200/90 transition-all cursor-pointer hidden sm:flex items-center gap-1.5"
          aria-label="خيارات التواصل"
        >
          <span>تواصل معنا</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        </button>
      </div>
    </aside>
  );
};
