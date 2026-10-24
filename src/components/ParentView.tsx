import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ScoutMember,
  SCOUT_SECTIONS,
  TechnicalNote,
  ActivityOutput,
  SubscriptionRecord,
  TroopAnnouncement,
  ScoutMessage,
  determineScoutSection
} from '../types/scout';
import { scoutService } from '../services/scoutService';
import {
  Users,
  UserPlus,
  Calendar,
  Sparkles,
  DollarSign,
  Send,
  Bell,
  HeartPulse,
  MapPin,
  Clock,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';

export const ParentView: React.FC = () => {
  const { profile, user } = useAuth();
  const currentUser = profile || {
    uid: user?.uid || 'guest',
    name: user?.displayName || 'الولي',
    phone: user?.phoneNumber || '+216 ',
    role: 'parent' as const,
    isActive: true,
    createdAt: ''
  };
  const [activeTab, setActiveTab] = useState<'children' | 'activities' | 'outputs' | 'subscriptions' | 'messages' | 'news'>('children');

  // Modals
  const [showRegisterChild, setShowRegisterChild] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState<ScoutMember | null>(null);

  // Data
  const children = scoutService.getMembersForParent(currentUser.uid);
  const announcements = scoutService.getAnnouncements();
  const messages = scoutService.getMessagesForUser(currentUser.uid, 'parent');
  
  // Get all approved technical notes relevant to parent's children sections
  const childSectionIds = Array.from(new Set(children.filter(c => c.status === 'approved').map(c => c.sectionId)));
  const allApprovedNotes = scoutService.getApprovedNotes().filter(n => childSectionIds.includes(n.sectionId));
  const activityOutputs = scoutService.getActivityOutputs().filter(o => childSectionIds.includes(o.sectionId));

  // Child Registration Form State
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [gradeSchool, setGradeSchool] = useState('');
  const [address, setAddress] = useState('تطاوين');
  const [phone1, setPhone1] = useState(currentUser.phone || '+216 ');
  const [phone2, setPhone2] = useState('');
  const [healthNotes, setHealthNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&h=200&fit=crop');
  const [regSuccess, setRegSuccess] = useState(false);

  // Automatic Scout Section determination based on child's birth date and gender
  const autoSection = determineScoutSection(birthDate, gender);

  // Message Form State
  const [msgRecipientType, setMsgRecipientType] = useState<'section_leader' | 'troop_leader'>('section_leader');
  const [msgSubject, setMsgSubject] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [msgSectionId, setMsgSectionId] = useState(childSectionIds[0] || 'ashbal');

  const handleRegisterChildSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !birthDate) return;

    await scoutService.addMember({
      parentId: currentUser.uid,
      parentName: currentUser.name,
      fullName,
      birthDate,
      gender,
      gradeSchool,
      address,
      phone1,
      phone2,
      healthNotes,
      photoUrl,
      sectionId: autoSection.sectionId
    });

    setRegSuccess(true);
    setTimeout(() => {
      setRegSuccess(false);
      setShowRegisterChild(false);
      // Reset
      setFullName('');
      setBirthDate('');
      setGradeSchool('');
      setHealthNotes('');
    }, 1200);
  };

  const handleSendMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgSubject || !msgContent) return;

    await scoutService.sendMessage({
      senderId: currentUser.uid,
      senderName: currentUser.name,
      senderRole: 'parent',
      recipientType: msgRecipientType,
      sectionId: msgSectionId,
      subject: msgSubject,
      content: msgContent
    });

    setShowMessageModal(false);
    setMsgSubject('');
    setMsgContent('');
    setActiveTab('messages');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner for Parent */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-400/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-amber-400/30">
                فضاء الولي الكشفي
              </span>
              <span className="text-emerald-200 text-xs">فوج الطيب المهيري - تطاوين</span>
            </div>
            <h1 className="text-2xl font-black">أهلاً بك، {currentUser.name}</h1>
            <p className="text-xs text-emerald-100 mt-1 max-w-xl">
              تابع أنشطة أبنائك الكشفية، برامج الأسبوع، صور ومخرجات الأنشطة، والاشتراكات بكل يسر وبساطة.
            </p>
          </div>

          <button
            onClick={() => setShowRegisterChild(true)}
            className="bg-amber-500 hover:bg-amber-600 text-emerald-950 font-black px-5 py-3 rounded-xl text-sm shadow-md transition flex items-center gap-2 transform active:scale-95"
          >
            <UserPlus className="w-5 h-5" />
            تسجيل منضو جديد (ابن / ابنة)
          </button>
        </div>
      </div>

      {/* Simplified Large Tab Navigation for Parents */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
        <button
          onClick={() => setActiveTab('children')}
          className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition border ${
            activeTab === 'children'
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-md'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50'
          }`}
        >
          <Users className="w-5 h-5 text-amber-400" />
          <span>أبنائي المنضوين ({children.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('activities')}
          className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition border ${
            activeTab === 'activities'
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-md'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50'
          }`}
        >
          <Calendar className="w-5 h-5 text-emerald-600" />
          <span>أنشطة الأسبوع ({allApprovedNotes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('outputs')}
          className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition border ${
            activeTab === 'outputs'
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-md'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50'
          }`}
        >
          <Sparkles className="w-5 h-5 text-purple-600" />
          <span>مخرجات الأنشطة ({activityOutputs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition border ${
            activeTab === 'subscriptions'
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-md'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50'
          }`}
        >
          <DollarSign className="w-5 h-5 text-amber-600" />
          <span>الاشتراكات المالية</span>
        </button>

        <button
          onClick={() => setActiveTab('news')}
          className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition border ${
            activeTab === 'news'
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-md'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50'
          }`}
        >
          <Bell className="w-5 h-5 text-blue-600" />
          <span>أخبار الفوج ({announcements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition border ${
            activeTab === 'messages'
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-md'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50'
          }`}
        >
          <MessageSquare className="w-5 h-5 text-teal-600" />
          <span>مراسلة القادة ({messages.length})</span>
        </button>
      </div>

      {/* --- TAB 1: CHILDREN --- */}
      {activeTab === 'children' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-lg text-emerald-950 flex items-center gap-2">
              <span>أبنائي المسجلون في الفوج</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                {children.length}
              </span>
            </h2>
          </div>

          {children.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="font-bold text-gray-700 text-sm">لم تسجل أي ابن بعد في الفوج</p>
              <p className="text-xs text-gray-500 mt-1 mb-4">
                اضغط على الزر أدناه لتسجيل ابنك أو ابنتك في إحدى فرق فوج الطيب المهيري بتطاوين.
              </p>
              <button
                onClick={() => setShowRegisterChild(true)}
                className="bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow hover:bg-emerald-900"
              >
                تسجيل ابن الآن
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {children.map(child => {
                const section = SCOUT_SECTIONS.find(s => s.id === child.sectionId);
                const sub = scoutService.getSubscriptionsForMember(child.id)[0];
                return (
                  <div
                    key={child.id}
                    className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={child.photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&h=200&fit=crop'}
                        alt={child.fullName}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-black text-base text-emerald-950">{child.fullName}</h3>
                          {/* Status Badge */}
                          {child.status === 'approved' ? (
                            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              مقبول بالفوج
                            </span>
                          ) : child.status === 'rejected' ? (
                            <span className="bg-red-100 text-red-800 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                              مرفوض
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              قيد المراجعة
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                          <span
                            className="px-2 py-0.5 rounded-md font-bold"
                            style={{ backgroundColor: section?.bgLight, color: section?.color }}
                          >
                            {section?.badge} {section?.name}
                          </span>
                          <span className="text-gray-500">الميلاد: {child.birthDate}</span>
                        </div>

                        <p className="text-xs text-gray-600 mt-2 font-medium">
                          المدرسة: {child.gradeSchool || 'غير محدد'}
                        </p>
                      </div>
                    </div>

                    {/* Health & Badges footer */}
                    <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                      {child.healthNotes && (
                        <div className="flex items-start gap-1.5 text-xs text-amber-900 bg-amber-50/70 p-2 rounded-lg">
                          <HeartPulse className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <span><strong>الحالة الصحية:</strong> {child.healthNotes}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs pt-1">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-gray-600">الشارات المكتسبة:</span>
                          {child.badges.length > 0 ? (
                            <div className="flex gap-1">
                              {child.badges.map((b, i) => (
                                <span key={i} className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[11px] font-bold">
                                  🎖️ {b}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">في انتظار أول شارة</span>
                          )}
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-gray-600">الاشتراك: </span>
                          {sub?.isPaid ? (
                            <span className="text-emerald-700 font-bold">خالص ✓</span>
                          ) : (
                            <span className="text-amber-700 font-bold">غير خالص ({sub?.amount || 15} د.ت)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: WEEKLY ACTIVITIES (PARENTS VIEW ONLY PUBLIC INFO) --- */}
      {activeTab === 'activities' && (
        <div className="space-y-4">
          <div className="space-y-4">
            {allApprovedNotes.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="font-bold text-gray-700 text-sm">لا توجد أنشطة معلنة حالياً لفرق أبنائك</p>
                <p className="text-xs text-gray-500 mt-1">
                  سيظهر برنامج النشاط القادم فور الإعلان عنه.
                </p>
              </div>
            ) : (
              allApprovedNotes.map(note => {
                const section = SCOUT_SECTIONS.find(s => s.id === note.sectionId);
                // Filter only items that member needs to bring!
                const memberSupplies = note.materials?.filter(m => m.provider === 'المنضو') || [];

                return (
                  <div
                    key={note.id}
                    className="bg-white rounded-2xl p-6 border-2 border-emerald-700/20 shadow-sm relative overflow-hidden"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 mb-4">
                      <div>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                          {section?.name}
                        </span>
                        <h3 className="text-lg font-black text-emerald-950 mt-1">{note.title}</h3>
                      </div>
                      <div className="text-left text-xs text-gray-600 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
                        <p className="font-bold text-emerald-900">{note.date}</p>
                        <p>{note.startTime} (المدة: {note.durationMinutes} دقيقة)</p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-xs">
                      <div className="flex items-center gap-2 text-gray-700 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                        <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span><strong>مكان النشاط / التجمع:</strong> {note.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                        <Users className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span><strong>القائد المشرف:</strong> {note.leaderName}</span>
                      </div>
                    </div>

                    {/* Supplies for the child to bring (مستلزمات على المنضو جلبها) */}
                    <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200">
                      <h4 className="font-bold text-xs text-emerald-950 mb-2 flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-emerald-800" />
                        <span>المستلزمات التي يجب أن يجلبها الكشاف معه:</span>
                      </h4>
                      {memberSupplies.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {memberSupplies.map((sup, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs bg-white p-2 rounded-lg border border-emerald-200">
                              <span className="text-emerald-700 font-bold">✔</span>
                              <span className="font-semibold text-gray-800">{sup.item}</span>
                              <span className="text-gray-500 text-[11px]">({sup.quantity})</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-600">
                          جميع المستلزمات والأدوات يوفرها الفوج. يكفي ارتداء الزي الكشفي وإحضار قارورة ماء شخصية.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* --- TAB 3: ACTIVITY OUTPUTS (PHOTOS & SUMMARY) --- */}
      {activeTab === 'outputs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-lg text-emerald-950">
              آخر مخرجات أنشطة فرق أبنائك
            </h2>
          </div>

          {activityOutputs.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
              <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="font-bold text-gray-700 text-sm">لم يتم نشر مخرجات أنشطة جديدة بعد</p>
              <p className="text-xs text-gray-500 mt-1">
                فور انتهاء النشاط، يرفع قائد الفرقة الصور والتقرير لتشاهدوا إنجازات أبنائكم.
              </p>
            </div>
          ) : (
            activityOutputs.map(output => {
              const section = SCOUT_SECTIONS.find(s => s.id === output.sectionId);
              return (
                <div key={output.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        {section?.name}
                      </span>
                      <h3 className="text-base font-black text-emerald-950 mt-1">{output.title}</h3>
                    </div>
                    <span className="text-xs text-gray-500">{output.date}</span>
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed font-medium bg-stone-50 p-3 rounded-xl border border-stone-200">
                    {output.summary}
                  </p>

                  {/* Photo gallery */}
                  {output.photos && output.photos.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-600 mb-2">صور من النشاط:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {output.photos.map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt="نشاط كشفي"
                            className="w-full h-40 object-cover rounded-xl border border-gray-200 shadow-xs"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Badges awarded */}
                  {output.awardedBadges && output.awardedBadges.length > 0 && (
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs">
                      <p className="font-bold text-amber-900 mb-1">الشارات الممنوحة في هذا النشاط:</p>
                      <div className="flex flex-wrap gap-2">
                        {output.awardedBadges.map((b, i) => (
                          <span key={i} className="bg-white text-amber-900 px-2.5 py-1 rounded-lg border border-amber-300 font-bold">
                            🎖️ {b.badgeName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* --- TAB 4: SUBSCRIPTIONS --- */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-4">
          <h2 className="font-extrabold text-lg text-emerald-950">
            حالة الاشتراكات المالية للأبناء
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children.map(child => {
              const subs = scoutService.getSubscriptionsForMember(child.id);
              const section = SCOUT_SECTIONS.find(s => s.id === child.sectionId);
              return (
                <div key={child.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                    <div>
                      <h3 className="font-black text-sm text-emerald-950">{child.fullName}</h3>
                      <p className="text-xs text-gray-500">{section?.name}</p>
                    </div>
                    <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                      الموسم 2026 / 2027
                    </span>
                  </div>

                  <div className="space-y-2">
                    {subs.map(sub => (
                      <div
                        key={sub.id}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                          sub.isPaid
                            ? 'bg-emerald-50/60 border-emerald-200'
                            : 'bg-amber-50/60 border-amber-300'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-gray-900">{sub.month}</p>
                          <p className="text-[11px] text-gray-600 mt-0.5">
                            المبلغ: {sub.amount} د.ت {sub.paymentMethod ? `(${sub.paymentMethod})` : ''}
                          </p>
                        </div>

                        {sub.isPaid ? (
                          <span className="bg-emerald-600 text-white font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            خالص
                          </span>
                        ) : (
                          <div className="text-left">
                            <span className="bg-amber-600 text-white font-bold px-2.5 py-1 rounded-lg">
                              غير خالص
                            </span>
                            <p className="text-[10px] text-amber-800 font-semibold mt-1">
                              يمكن الخلاص مباشرة لقائد الفرقة
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TAB 5: NEWS & ANNOUNCEMENTS --- */}
      {activeTab === 'news' && (
        <div className="space-y-4">
          <h2 className="font-extrabold text-lg text-emerald-950">
            أخبار وإعلانات فوج الطيب المهيري بتطاوين
          </h2>

          <div className="space-y-3">
            {announcements.map(anc => (
              <div
                key={anc.id}
                className={`p-5 rounded-2xl border bg-white shadow-xs ${
                  anc.priority === 'urgent' ? 'border-amber-400 bg-amber-50/20' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {anc.priority === 'urgent' && (
                      <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                        هام وعاجل
                      </span>
                    )}
                    <h3 className="font-black text-sm text-emerald-950">{anc.title}</h3>
                  </div>
                  <span className="text-[11px] text-gray-400">
                    {new Date(anc.createdAt).toLocaleDateString('ar-TN')}
                  </span>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed font-medium">
                  {anc.content}
                </p>

                <div className="mt-3 pt-2 border-t border-gray-100 text-left text-[11px] text-gray-500 font-bold">
                  {anc.authorName}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 6: MESSAGES WITH LEADERS --- */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-lg text-emerald-950">
              المراسلات المباشرة مع القادة
            </h2>
            <button
              onClick={() => setShowMessageModal(true)}
              className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow"
            >
              <Send className="w-3.5 h-3.5" />
              إرسال رسالة جديدة للقادة
            </button>
          </div>

          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="font-bold text-gray-700 text-sm">لا توجد رسائل سابقة</p>
                <p className="text-xs text-gray-500 mt-1 mb-3">
                  يمكنك مراسلة قائد فرقة ابنك أو قيادة الفوج لأي استفسار أو إشعار خاص.
                </p>
                <button
                  onClick={() => setShowMessageModal(true)}
                  className="bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-bold"
                >
                  إرسال أول رسالة
                </button>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-emerald-950">{msg.subject}</h4>
                      <p className="text-xs text-gray-500">
                        الجهة المرسل إليها: {msg.recipientType === 'troop_leader' ? 'قيادة الفوج' : 'قائد الفرقة'}
                      </p>
                    </div>
                    {msg.status === 'replied' ? (
                      <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                        تم الرد ✓
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                        في انتظار الرد
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-800 bg-stone-50 p-3 rounded-xl border border-stone-100">
                    {msg.content}
                  </p>

                  {/* Reply */}
                  {msg.reply && (
                    <div className="bg-emerald-50/80 border border-emerald-200 p-3.5 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-emerald-950">
                        <span>رد {msg.repliedByName}:</span>
                        <span className="text-[10px] text-emerald-700">
                          {msg.repliedAt ? new Date(msg.repliedAt).toLocaleDateString('ar-TN') : ''}
                        </span>
                      </div>
                      <p className="text-emerald-900 leading-relaxed">{msg.reply}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* --- MODAL: REGISTER NEW SCOUT CHILD --- */}
      {showRegisterChild && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-emerald-900/20">
            <div className="bg-emerald-900 text-white p-4 px-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
                  ⚜️
                </div>
                <div>
                  <h3 className="font-extrabold text-base">تسجيل منضو جديد في الفوج الكشفي</h3>
                  <p className="text-xs text-emerald-200">فوج الطيب المهيري - تطاوين</p>
                </div>
              </div>
              <button
                onClick={() => setShowRegisterChild(false)}
                className="text-emerald-200 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterChildSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              {regSuccess && (
                <div className="bg-emerald-100 text-emerald-900 p-3 rounded-xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  <span>تم إرسال طلب التسجيل بنجاح! طلبك الآن قيد مراجعة قيادة الفوج.</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    الاسم واللقب للابن(ة) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="مثال: يوسف الدغسني"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    تاريخ الميلاد <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={e => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">الجنس</label>
                  <div className="flex gap-4 p-2 bg-stone-50 rounded-xl border border-stone-200">
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                      <input
                        type="radio"
                        name="gender"
                        checked={gender === 'male'}
                        onChange={() => setGender('male')}
                      />
                      <span>ذكر (أشبال / فتيان)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                      <input
                        type="radio"
                        name="gender"
                        checked={gender === 'female'}
                        onChange={() => setGender('female')}
                      />
                      <span>أنثى (زهرات / مرشدات)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    الفرقة الكشفية
                  </label>
                  {birthDate ? (
                    <div className="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50/80 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{autoSection.section.badge}</span>
                        <div>
                          <p className="font-black text-emerald-950 text-xs">{autoSection.section.name}</p>
                          <p className="text-[10px] text-emerald-700 font-bold">
                            {autoSection.section.stageName} ({autoSection.section.ageRange})
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl border border-gray-200 bg-stone-50 text-[11px] text-gray-500 font-semibold flex items-center gap-1.5">
                      <span>⚜️</span>
                      <span>تظهر الفرقة تلقائياً بعد اختيار تاريخ الميلاد والجنس</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">المستوى الدراسي والمدرسة</label>
                  <input
                    type="text"
                    value={gradeSchool}
                    onChange={e => setGradeSchool(e.target.value)}
                    placeholder="مثال: مدرسة ابن خلدون بتطاوين - سنة 4"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">العنوان السكني بتطاوين</label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="مثال: حي النور، تطاوين"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    هاتف الولي الرئيسي <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone1}
                    onChange={e => setPhone1(e.target.value)}
                    placeholder="+216 98 000 000"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">هاتف ثانٍ للطوارئ</label>
                  <input
                    type="tel"
                    value={phone2}
                    onChange={e => setPhone2(e.target.value)}
                    placeholder="هاتف الأم أو قريب"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  معلومات صحية وتوصيات خاصة (حساسية، أدوية، أمراض):
                </label>
                <textarea
                  rows={2}
                  value={healthNotes}
                  onChange={e => setHealthNotes(e.target.value)}
                  placeholder="إذا كان يعاني من حساسية غذائية أو يتناول دواء معيناً يرجى ذكره هنا لسلامته..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowRegisterChild(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-emerald-800 hover:bg-emerald-900 text-white font-black px-6 py-2.5 rounded-xl shadow-md transition"
                >
                  إرسال ملف التسجيل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: SEND MESSAGE TO LEADERS --- */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-emerald-900/20">
            <div className="bg-emerald-900 text-white p-4 px-6 flex items-center justify-between">
              <h3 className="font-bold text-base">إرسال رسالة إلى قيادة الفوج أو قائد الفرقة</h3>
              <button onClick={() => setShowMessageModal(false)} className="text-emerald-200">✕</button>
            </div>

            <form onSubmit={handleSendMessageSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">الجهة الموجه إليها الرسالة</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMsgRecipientType('section_leader')}
                    className={`p-2.5 rounded-xl border font-bold text-center transition ${
                      msgRecipientType === 'section_leader'
                        ? 'bg-emerald-100 border-emerald-700 text-emerald-950'
                        : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    قائد الفرقة
                  </button>
                  <button
                    type="button"
                    onClick={() => setMsgRecipientType('troop_leader')}
                    className={`p-2.5 rounded-xl border font-bold text-center transition ${
                      msgRecipientType === 'troop_leader'
                        ? 'bg-emerald-100 border-emerald-700 text-emerald-950'
                        : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    قيادة الفوج (المدير)
                  </button>
                </div>
              </div>

              {msgRecipientType === 'section_leader' && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">الفرقة المعنية</label>
                  <select
                    value={msgSectionId}
                    onChange={e => setMsgSectionId(e.target.value)}
                    className="w-full p-2 rounded-xl border border-gray-300 font-bold"
                  >
                    {SCOUT_SECTIONS.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 mb-1">موضوع الرسالة</label>
                <input
                  type="text"
                  required
                  value={msgSubject}
                  onChange={e => setMsgSubject(e.target.value)}
                  placeholder="مثال: استفسار حول موعد الخرجة القادمة"
                  className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">نص الرسالة</label>
                <textarea
                  rows={4}
                  required
                  value={msgContent}
                  onChange={e => setMsgContent(e.target.value)}
                  placeholder="اكتب رسالتك هنا..."
                  className="w-full p-3 rounded-xl border border-gray-300 focus:outline-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMessageModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-emerald-800 hover:bg-emerald-900 text-white font-black px-6 py-2 rounded-xl shadow"
                >
                  إرسال الرسالة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
