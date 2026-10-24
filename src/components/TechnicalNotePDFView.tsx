import React from 'react';
import { TechnicalNote, SCOUT_SECTIONS, EDUCATIONAL_DOMAINS } from '../types/scout';
import { Printer, X, CheckCircle, ShieldAlert } from 'lucide-react';

interface TechnicalNotePDFViewProps {
  note: TechnicalNote;
  onClose: () => void;
}

export const TechnicalNotePDFView: React.FC<TechnicalNotePDFViewProps> = ({ note, onClose }) => {
  const section = SCOUT_SECTIONS.find(s => s.id === note.sectionId);
  const domain = EDUCATIONAL_DOMAINS.find(d => d.id === note.educationalDomain);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-emerald-900/20">
        {/* Modal Controls Bar */}
        <div className="no-print bg-emerald-900 text-white px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📄</span>
            <h3 className="font-bold text-base">المذكرة الفنية الكشفية الرسمية - جاهزة للطباعة والتصدير</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-amber-500 hover:bg-amber-600 text-emerald-950 font-bold px-4 py-1.5 rounded-lg text-sm flex items-center gap-1.5 shadow transition"
            >
              <Printer className="w-4 h-4" />
              طباعة / حفظ PDF
            </button>
            <button
              onClick={onClose}
              className="text-emerald-200 hover:text-white p-1 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Note Sheet */}
        <div className="p-8 overflow-y-auto bg-white print:p-0 text-gray-900 font-sans leading-relaxed text-sm">
          {/* Header */}
          <div className="border-b-2 border-emerald-800 pb-4 mb-6">
            <div className="flex items-center justify-between text-center">
              <div className="text-right">
                <p className="font-extrabold text-base text-emerald-950">الكشافة التونسية</p>
                <p className="font-bold text-sm text-emerald-800">جهة تطاوين</p>
                <p className="font-black text-lg text-emerald-900 mt-1">فوج الطيب المهيري</p>
                <p className="text-xs text-gray-600 font-medium">الفرقة: {section?.name || note.scoutStage}</p>
              </div>

              {/* Emblem */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-emerald-800 text-white flex items-center justify-center text-3xl shadow-sm border-2 border-amber-400">
                  ⚜️
                </div>
                <span className="text-xs font-bold text-emerald-900 mt-1">كن مستعداً</span>
              </div>

              <div className="text-left text-xs text-gray-700">
                <p><span className="font-bold">الموسم:</span> 2026 / 2027</p>
                <p><span className="font-bold">تاريخ النشاط:</span> {note.date}</p>
                <p><span className="font-bold">التوقيت:</span> {note.startTime}</p>
                <p><span className="font-bold">المدة:</span> {note.durationMinutes} دقيقة</p>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-emerald-100 flex items-center justify-center">
              <h1 className="text-xl font-black text-emerald-950 tracking-wide bg-emerald-50 px-6 py-1.5 rounded-full border border-emerald-200">
                المذكرة الفنية الكشفية الأسبوعية
              </h1>
            </div>
          </div>

          {/* Status & Official Stamp Notice */}
          {note.status === 'approved' ? (
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 mb-6 flex items-center justify-between print:border-black">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-700" />
                <span className="font-bold text-emerald-900 text-sm">
                  مذكرة معتمدة ومختومة رسمياً من قيادة الفوج ({note.approvedBy})
                </span>
              </div>
              <span className="text-xs text-emerald-700 font-medium">
                تاريخ الاعتماد: {note.approvedAt ? new Date(note.approvedAt).toLocaleDateString('ar-TN') : ''}
              </span>
            </div>
          ) : (
            <div className="no-print bg-stone-50 border border-stone-200 rounded-xl p-2.5 mb-6 flex items-center justify-between text-xs">
              <span className="font-bold text-gray-700">
                حالة المذكرة: {note.status === 'submitted' ? 'مرسلة للاعتماد' : note.status === 'change_requested' ? 'طلب تعديل' : 'مسودة'}
              </span>
            </div>
          )}

          {/* Section 1: General Info Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6 bg-stone-50 p-4 rounded-xl border border-stone-200 print:bg-transparent">
            <div>
              <p className="text-xs text-gray-500 font-bold mb-1">1. موضوع / عنوان النشاط</p>
              <p className="font-black text-base text-emerald-950">{note.title}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold mb-1">2. المجال التربوي</p>
              <p className="font-bold text-emerald-800">{domain?.name || note.educationalDomain}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold mb-1">3. المرحلة الكشفية والفئة المستهدفة</p>
              <p className="font-bold">{section?.name} - {note.targetGroup}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold mb-1">4. المكان وعدد المشاركين</p>
              <p className="font-bold">{note.location} | المتوقع: {note.suggestedCount} كشافاً</p>
            </div>
          </div>

          {/* Section 2: Objectives */}
          <div className="mb-6">
            <h4 className="font-bold text-emerald-900 border-r-4 border-emerald-700 pr-2 mb-2 text-sm">
              5. الأهداف التربوية للنشاط
            </h4>
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <p className="font-semibold text-gray-800 mb-2">
                <span className="text-emerald-800 font-bold">الهدف العام: </span>
                {note.generalObjective}
              </p>
              <div className="pr-4 border-r-2 border-emerald-200 space-y-1">
                <p className="text-xs font-bold text-gray-600 mb-1">الأهداف الخاصة والمحددة:</p>
                {note.specificObjectives?.map((obj, i) => (
                  <p key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                    <span className="text-emerald-700 font-bold">◄</span>
                    <span>{obj}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Stages (مراحل النشاط) */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-emerald-900 border-r-4 border-emerald-700 pr-2 text-sm">
                6. المراحل التنفيذية للنشاط
              </h4>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                إجمالي المدة: {note.durationMinutes} دقيقة
              </span>
            </div>
            <table className="w-full border-collapse border border-gray-300 text-xs">
              <thead>
                <tr className="bg-emerald-900 text-white">
                  <th className="border border-emerald-800 p-2 text-right w-24">المرحلة</th>
                  <th className="border border-emerald-800 p-2 text-right">الوصف والتفاصيل الإجرائية</th>
                  <th className="border border-emerald-800 p-2 text-right w-44">دور القائد المشرف</th>
                  <th className="border border-emerald-800 p-2 text-center w-20">المدة</th>
                </tr>
              </thead>
              <tbody>
                {note.stages?.map((stage, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 p-2 font-bold text-emerald-950 align-top">
                      {stage.stageType}
                    </td>
                    <td className="border border-gray-300 p-2 text-gray-800 align-top">
                      {stage.description}
                    </td>
                    <td className="border border-gray-300 p-2 text-gray-700 align-top">
                      {stage.leaderRole}
                    </td>
                    <td className="border border-gray-300 p-2 text-center font-bold text-emerald-800 align-top">
                      {stage.durationMinutes} د
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 4: Materials (المستلزمات والأدوات) */}
          <div className="mb-6">
            <h4 className="font-bold text-emerald-900 border-r-4 border-emerald-700 pr-2 mb-2 text-sm">
              7. المستلزمات والأدوات المطلوبة
            </h4>
            <table className="w-full border-collapse border border-gray-300 text-xs">
              <thead>
                <tr className="bg-stone-200 text-gray-900">
                  <th className="border border-gray-300 p-1.5 text-right">المادة / الوسيلة</th>
                  <th className="border border-gray-300 p-1.5 text-center w-28">الكمية</th>
                  <th className="border border-gray-300 p-1.5 text-center w-36">جهة التوفير</th>
                </tr>
              </thead>
              <tbody>
                {note.materials?.map((mat, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-1.5 font-medium">{mat.item}</td>
                    <td className="border border-gray-300 p-1.5 text-center">{mat.quantity}</td>
                    <td className="border border-gray-300 p-1.5 text-center font-bold text-emerald-800">
                      {mat.provider}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 5: Indicators & Badges */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="border border-gray-200 rounded-lg p-3 bg-white">
              <p className="text-xs font-bold text-gray-700 mb-1">8. مؤشرات النجاح والتقييم:</p>
              <p className="text-xs text-gray-800 leading-normal">{note.successIndicators}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-3 bg-white">
              <p className="text-xs font-bold text-gray-700 mb-1">9. الشارات والكفايات المرتبطة:</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {note.badges?.map((badge, i) => (
                  <span key={i} className="bg-amber-100 text-amber-900 text-xs px-2 py-0.5 rounded-md font-bold border border-amber-300">
                    🎖️ {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Signatures & Seal Footer */}
          <div className="border-t-2 border-emerald-800 pt-4 mt-6 grid grid-cols-2 gap-8 break-inside-avoid">
            {/* Section Leader Signature */}
            <div className="text-center p-3 border border-gray-300 rounded-xl bg-stone-50">
              <p className="font-bold text-xs text-gray-600 mb-1">القائد المشرف على النشاط</p>
              <p className="font-black text-sm text-emerald-950 mb-2">{note.leaderName}</p>
              <div className="h-16 flex items-center justify-center border-t border-dashed border-gray-300 mt-2">
                {note.leaderSignature ? (
                  <img src={note.leaderSignature} alt="توقيع القائد" className="max-h-14 max-w-full object-contain" />
                ) : (
                  <span className="text-xs text-gray-400 italic">تم الإمضاء إلكترونياً</span>
                )}
              </div>
            </div>

            {/* Troop Leader Seal / Approval */}
            <div className="text-center p-3 border border-gray-300 rounded-xl bg-stone-50 relative overflow-hidden">
              <p className="font-bold text-xs text-gray-600 mb-1">اعتماد وختم قيادة الفوج</p>
              <p className="font-black text-sm text-emerald-950 mb-2">قائد فوج الطيب المهيري</p>
              <div className="h-16 flex items-center justify-center border-t border-dashed border-gray-300 mt-2">
                {note.status === 'approved' ? (
                  <div className="border-2 border-emerald-700 rounded-full px-4 py-1 text-emerald-800 font-extrabold text-xs rotate-[-3deg] shadow-xs bg-emerald-50 flex items-center gap-1.5">
                    <span>⚜️</span>
                    <span>معتمد - فوج الطيب المهيري تطاوين</span>
                    <span>⚜️</span>
                  </div>
                ) : (
                  <span className="text-xs text-amber-700 font-bold">في انتظار الاعتماد الرسمي</span>
                )}
              </div>
            </div>
          </div>

          {/* Footer Motto */}
          <div className="mt-6 text-center text-xs text-gray-500 font-medium border-t border-gray-200 pt-3">
            الكشافة التونسية - جهة تطاوين - خدمة وتنمية المجتمع بروح كشفية أصيلة
          </div>
        </div>
      </div>
    </div>
  );
};
