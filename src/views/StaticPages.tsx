import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  PlusCircle,
  Truck,
  RotateCcw,
  FileText,
  Lock,
} from 'lucide-react';

export const AboutView: React.FC = () => {
  const { setView } = useApp();
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-black text-slate-900">من نحن – WASSEL DZ</h1>
        <p className="text-sm text-slate-600">سوقك الجزائري الموثوق في مكان واحد</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
        <h2 className="text-lg font-bold text-slate-900 text-emerald-800">رؤيتنا ورسالتنا</h2>
        <p>
          تأسست منصة <span className="font-bold text-slate-900">WASSEL DZ (واصل ديزاد)</span> لتكون الجسر الموثوق بين التجار والبائعين الجزائريين وبين عموم المشترين الباحثين عن منتجات حقيقية، بجودة عالية وأسعار تنافسية في كافة ولايات الجزائر الـ 58.
        </p>
        <p>
          نحن نؤمن بأن التجارة الإلكترونية الناجحة تبنى على الشفافية والأمان، ولهذا السبب نطبق نظام المراجعة والاعتماد المسبق لكل منتج، ولا نسمح بنشر أي سلعة وهمية أو غير مطابقة، كما نوفر خدمة الدفع نقداً عند الاستلام والمعاينة.
        </p>

        <h3 className="text-base font-bold text-slate-900 pt-4">مميزات WASSEL DZ</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="font-bold text-slate-900 text-xs block">مراجعة يدوية دقيقة</span>
            <span className="text-xs text-slate-500">لا يتم نشر أي منتج إلا بعد موافقة الإدارة والتحقق من سعره ومواصفاته.</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="font-bold text-slate-900 text-xs block">تغطية لكامل التراب الوطني</span>
            <span className="text-xs text-slate-500">نصل بمنتجاتكم إلى كافة ولايات الجزائر الـ 58 عبر شبكة توصيل موثوقة.</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="font-bold text-slate-900 text-xs block">مبلغ ثابت وواضح</span>
            <span className="text-xs text-slate-500">يحدد البائع سعره الصافي وتضيف المنصة مبلغاً ثابتاً رمزياً دون أي عمولات خفية.</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="font-bold text-slate-900 text-xs block">دفع عند الاستلام</span>
            <span className="text-xs text-slate-500">اطمئنان كامل للزبون، حيث يتم تسديد ثمن الطلبية نقداً بعد الفحص والمعاينة.</span>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-center">
          <button
            onClick={() => setView('submit-product')}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            اعرض منتجك للبيع معنا اليوم
          </button>
        </div>
      </div>
    </div>
  );
};

export const HowToSellView: React.FC = () => {
  const { setView } = useApp();
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-black text-slate-900">كيفية البيع عبر WASSEL DZ</h1>
        <p className="text-sm text-slate-600">دليلك الكامل لعرض منتجاتك وتحقيق أرباحك بكل سهولة</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-base shrink-0">
            1
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">املأ استمارة عرض المنتج</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              ادخل إلى صفحة "اعرض منتجك للبيع"، واكتب اسم المنتج ووصفه بالتفصيل، ثم ارفع صوراً واضحة وجذابة وحدد السعر الصافي الذي ترغب في استلامه بالدينار الجزائري.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-base shrink-0">
            2
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">مراجعة الإدارة والموافقة</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              يقوم مدير منصة WASSEL DZ بمراجعة تفاصيل طلبك وجودة الصور. في حال الموافقة، يضاف المبلغ الثابت الخاص بالمنصة وينشر المنتج فوراً في المتجر الرسمي ليصبح متاحاً للطلب.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-base shrink-0">
            3
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">استقبال طلبات الزبائن وتأكيدها</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              عندما يقوم زبون بطلب منتجك، يتصل به فريق المنصة لتأكيد الطلب ثم نتواصل معك لاستلام المنتج وشحنه وتوصيله لباب بيت المشتري.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-base shrink-0">
            4
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">استلام مستحقاتك المالية بالكامل</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              بمجرد تسليم المنتج للمشتري واستلام قيمته نقداً، يتم تحويل مستحقاتك المالية الصافية (سعرك الذي حددته) دون أي اقتطاعات إضافية.
            </p>
          </div>
        </div>

        <div className="p-6 bg-emerald-900 text-white rounded-3xl text-center space-y-4">
          <h4 className="text-lg font-bold">جاهز لبدء البيع وعرض أول منتجاتك؟</h4>
          <button
            onClick={() => setView('submit-product')}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            ابدأ عرض منتجك الآن
          </button>
        </div>
      </div>
    </div>
  );
};

export const FaqView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-black text-slate-900">الأسئلة الشائعة</h1>
        <p className="text-sm text-slate-600">إجابات واضحة ومباشرة عن منصة WASSEL DZ</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm divide-y divide-slate-100 p-6 sm:p-8">
        <div className="py-4 space-y-1.5">
          <h3 className="text-sm font-bold text-slate-900">ما هي منصة WASSEL DZ؟</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            هي سوق إلكتروني جزائري يربط البائعين بالمشترين، حيث يدير فريق المنصة استقبال المنتجات ومراجعتها يدويًا والتأكد من جودتها وشحنها للزبائن بمقابل عمولة ثابتة مضافة.
          </p>
        </div>

        <div className="py-4 space-y-1.5">
          <h3 className="text-sm font-bold text-slate-900">كيف يتم احتساب سعر المنتج في المتجر؟</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            يحدد البائع السعر الذي يرغب في الحصول عليه كاملاً (مثلاً 3000 دج)، وتضيف إدارة المنصة مبلغاً ثابتاً (مثلاً 300 دج) ليصبح السعر النهائي المعروض للزبون 3300 دج.
          </p>
        </div>

        <div className="py-4 space-y-1.5">
          <h3 className="text-sm font-bold text-slate-900">هل يمكنني الدفع نقداً عند الاستلام؟</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            نعم، الدفع عند الاستلام هو الطريقة الأساسية المعتمدة لضمان راحة وثقة الزبائن في جميع ولايات الجزائر الـ 58.
          </p>
        </div>

        <div className="py-4 space-y-1.5">
          <h3 className="text-sm font-bold text-slate-900">متى يتم نشر المنتج في المتجر بعد إرساله؟</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            يتم فحص الطلب ومراجعته من قبل المدير خلال مدة تتراوح بين ساعتين إلى 24 ساعة، ويتم النشر مباشرة بعد التأكد من مطابقة الصور والمواصفات.
          </p>
        </div>

        <div className="py-4 space-y-1.5">
          <h3 className="text-sm font-bold text-slate-900">كيف يتسلم البائع مستحقاته المالية؟</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            بعد تسليم المنتج للمشتري بنجاح وتأكيد اكتمال الطلب، تسلم مستحقات البائع عبر الحساب البريدي الجاري (CCP)، تطبيق بريدي موب، أو نقداً حسب الاتفاق.
          </p>
        </div>
      </div>
    </div>
  );
};

export const PrivacyPolicyView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-black text-slate-900">سياسة الخصوصية والأمان</h1>
        <p className="text-sm text-slate-600">حماية بيانات البائعين والمشترين التزام أساسي لدى WASSEL DZ</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <h2 className="text-base font-bold text-slate-900">1. سرية بيانات البائعين</h2>
        <p>
          تلتزم إدارة منصة WASSEL DZ بالحفاظ التام على سرية أرقام هواتف وعناوين البائعين وتفاصيل أسعارهم الأصلية، ولا يتم إظهار هذه البيانات الحساسة لزوار المتجر أو عامة المشترين تحت أي ظرف.
        </p>

        <h2 className="text-base font-bold text-slate-900">2. بيانات طلبات الزبائن</h2>
        <p>
          المعلومات التي يقدمها الزبون أثناء الطلب (الاسم، الهاتف، الولاية، العنوان) تُستخدم حصرياً لغرض تأكيد الطلبية وتنظيم عملية الشحن والتوصيل.
        </p>

        <h2 className="text-base font-bold text-slate-900">3. أمان المعاملات</h2>
        <p>
          نعتمد بروتوكولات آمنة لحماية الخادم وقاعدة البيانات من أي وصول غير مصرح به، مع تقييد صلاحيات لوحة الإدارة للمشرف المعتمد فقط.
        </p>
      </div>
    </div>
  );
};

export const TermsView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-black text-slate-900">شروط الاستخدام</h1>
        <p className="text-sm text-slate-600">الشروط والضوابط العامة لاستخدام منصة WASSEL DZ</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-5 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <p>
          باستخدامك لمنصة WASSEL DZ، فإنك توافق على الالتزام بالقوانين المعمول بها في الجمهورية الجزائرية الديمقراطية الشعبية، واحترام حقوق الملكية الفكرية، والتعامل بحسن نية.
        </p>
        <p>
          يحظر تماماً استخدام المنصة لنشر أي سلع ممنوعة قانوناً أو منتجات مقلدة تضر بالمستهلك، وتتحمل الأطراف المسؤولية الكاملة عن صحة البيانات المدخلة.
        </p>
      </div>
    </div>
  );
};

export const ProductListingTermsView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-black text-slate-900">شروط عرض المنتجات</h1>
        <p className="text-sm text-slate-600">ضوابط قبول المنتجات ونشرها للبائعين</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-5 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <ul className="list-disc list-inside space-y-2">
          <li>يجب أن تكون صور المنتج حقيقية واضحة ومأخوذة للسلعة الفعلية المعروضة للبيع.</li>
          <li>يجب أن يكون السعر المحدد من البائع سعراً معقولاً ومطابقاً للسلعة.</li>
          <li>يمنع عرض السلع التالفة أو غير الصالحة للاستعمال إلا إذا تم توضيح حالتها بدقة فائقة.</li>
          <li>تحتفظ إدارة WASSEL DZ بالحق المطلق في قبول أو رفض أي منتج لا يستوفي معايير الجودة والأمان.</li>
          <li>لا يُسمح بنشر أي منتج في المتجر إلا بعد موافقة المدير المباشرة.</li>
        </ul>
      </div>
    </div>
  );
};

export const CancellationPolicyView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-black text-slate-900">سياسة الطلبات والإلغاء</h1>
        <p className="text-sm text-slate-600">إرشادات الشحن وتأكيد واسترجاع الطلبيات</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-5 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <p>
          يحق للزبون إلغاء طلبه قبل خروج الشحنة للتوصيل عبر الاتصال السريع بفريق خدمة الزبائن أو عبر واتساب.
        </p>
        <p>
          عند وصول عامل التوصيل، يحق للزبون فتح الطرد ومعاينة المنتج للتأكد من مطابقته قبل تسليم المبلغ نقداً. في حال عدم المطابقة، يتم إرجاع الطرد على الفور دون أي رسوم إضافية.
        </p>
        <p>
          في حال إلغاء الطلب، لا تحتسب أي أرباح للمنصة ولا تسجل مبيعات على البائع، حفاظاً على نزاهة الحسابات المالية.
        </p>
      </div>
    </div>
  );
};
