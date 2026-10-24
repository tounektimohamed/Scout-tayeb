import React, { useState } from 'react';
import { SubscriptionRecord, SCOUT_SECTIONS } from '../types/scout';
import { MessageSquare, Phone, X, Send } from 'lucide-react';

interface WhatsAppModalProps {
  subscription: SubscriptionRecord;
  onClose: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ subscription, onClose }) => {
  const section = SCOUT_SECTIONS.find(s => s.id === subscription.sectionId);
  
  // Format clean Tunisian phone number
  const cleanPhone = subscription.parentPhone.replace(/\D/g, '');
  const internationalPhone = cleanPhone.startsWith('216') ? cleanPhone : '216' + cleanPhone;

  const defaultMessage = `تحية كشفية عطرة من قيادة ${section?.name || 'الفرقة'} بفوج الطيب المهيري بتطاوين ⚜️\n\nنود تذكيركم بلطف بتسوية معلوم الاشتراك الكشفي للمنضو (${subscription.memberName}) عن ${subscription.month} بمبلغ (${subscription.amount} د.ت)، وذلك لتأمين انخراطه الكشفي ومستلزمات الأنشطة في أفضل الظروف.\n\nدمتم سنداً للكشفية، وكن مستعداً! ⚜️`;

  const [message, setMessage] = useState(defaultMessage);

  const handleSendWhatsApp = () => {
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${internationalPhone}?text=${encoded}`;
    window.open(url, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-emerald-900/20">
        <div className="bg-emerald-900 text-white p-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">تذكير سريع للولي عبر واتساب</h3>
              <p className="text-xs text-emerald-200">الولي: {subscription.parentPhone}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-emerald-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-gray-700">المنضو الكشفي:</span>
              <span className="font-black text-emerald-950">{subscription.memberName}</span>
            </div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-gray-700">الفترة / الشهر:</span>
              <span className="font-semibold">{subscription.month} ({subscription.seasonYear})</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-700">المبلغ المستحق:</span>
              <span className="font-black text-amber-700">{subscription.amount} دينار تونسي</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              نص الرسالة الكشفية الجاهزة (قابلة للتعديل):
            </label>
            <textarea
              rows={6}
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <a
              href={`tel:${subscription.parentPhone}`}
              className="px-4 py-2.5 rounded-xl border border-emerald-700 text-emerald-800 font-bold text-xs hover:bg-emerald-50 transition flex items-center gap-1.5"
            >
              <Phone className="w-4 h-4" />
              اتصال هاتفي
            </a>
            <button
              onClick={handleSendWhatsApp}
              className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              إرسال عبر WhatsApp الآن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
