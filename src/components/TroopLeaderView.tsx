import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  SCOUT_SECTIONS,
  TechnicalNote,
  MonthlyProgram,
  ScoutMember,
  SubscriptionRecord,
  TroopAnnouncement,
  ScoutMessage,
  AuditLogItem,
  UserProfile
} from '../types/scout';
import { scoutService } from '../services/scoutService';
import { TechnicalNotePDFView } from './TechnicalNotePDFView';
import { WhatsAppModal } from './WhatsAppModal';
import {
  Shield,
  Users,
  FileCheck,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Printer,
  Plus,
  Send,
  MessageSquare,
  History,
  Search,
  Filter,
  Check,
  X,
  UserCheck,
  UserX,
  FileSpreadsheet
} from 'lucide-react';

export const TroopLeaderView: React.FC = () => {
  const { profile, user } = useAuth();
  const currentUser = profile || {
    uid: user?.uid || 'guest',
    name: user?.displayName || 'القائد سالم لبيض (قائد الفوج)',
    role: 'troop_leader' as const,
    isActive: true,
    createdAt: ''
  };
  const [activeTab, setActiveTab] = useState<'notes' | 'registrations' | 'subscriptions' | 'compliance' | 'leaders' | 'announcements' | 'messages' | 'audit'>('notes');

  // Modals & Inspection
  const [inspectingNote, setInspectingNote] = useState<TechnicalNote | null>(null);
  const [reviewDecisionNote, setReviewDecisionNote] = useState<TechnicalNote | null>(null);
  const [decisionType, setDecisionType] = useState<'approved' | 'change_requested' | 'rejected'>('approved');
  const [decisionFeedback, setDecisionFeedback] = useState('');
  const [decisionField, setDecisionField] = useState('المراحل');
  const [viewingPDFNote, setViewingPDFNote] = useState<TechnicalNote | null>(null);
  const [whatsAppSub, setWhatsAppSub] = useState<SubscriptionRecord | null>(null);

  // New Leader Modal
  const [showAddLeaderModal, setShowAddLeaderModal] = useState(false);
  const [newLeaderName, setNewLeaderName] = useState('');
  const [newLeaderEmail, setNewLeaderEmail] = useState('');
  const [newLeaderPhone, setNewLeaderPhone] = useState('+216 ');
  const [newLeaderSection, setNewLeaderSection] = useState('ashbal');

  // New Announcement Modal
  const [showAddAnnouncementModal, setShowAddAnnouncementModal] = useState(false);
  const [ancTitle, setAncTitle] = useState('');
  const [ancContent, setAncContent] = useState('');
  const [ancTarget, setAncTarget] = useState('all');
  const [ancPriority, setAncPriority] = useState<'normal' | 'urgent'>('normal');

  // Reply message
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  // Filtering states
  const [notesFilterSection, setNotesFilterSection] = useState('all');
  const [notesFilterStatus, setNotesFilterStatus] = useState('all');

  // Data fetching
  const allNotes = scoutService.getTechnicalNotes();
  const allMembers = scoutService.getMembers();
  const allPrograms = scoutService.getMonthlyPrograms();
  const allSubscriptions = scoutService.getSubscriptions();
  const announcements = scoutService.getAnnouncements();
  const messages = scoutService.getMessagesForUser(currentUser.uid, 'troop_leader');
  const auditLogs = scoutService.getAuditLogs();
  const leaders = scoutService.getLeaders();

  // Pending items counts
  const pendingRegistrations = allMembers.filter(m => m.status === 'pending');
  const pendingNotes = allNotes.filter(n => n.status === 'submitted');
  const pendingPrograms = allPrograms.filter(p => p.status === 'submitted');

  // Financial statistics
  const totalExpectedAmount = allSubscriptions.reduce((acc, s) => acc + s.amount, 0);
  const totalCollectedAmount = allSubscriptions.filter(s => s.isPaid).reduce((acc, s) => acc + s.amount, 0);
  const collectionRate = totalExpectedAmount > 0 ? Math.round((totalCollectedAmount / totalExpectedAmount) * 100) : 0;
  const unpaidSubscriptions = allSubscriptions.filter(s => !s.isPaid);

  // Note review execution
  const handleExecuteNoteReview = async () => {
    if (!reviewDecisionNote) return;

    await scoutService.reviewTechnicalNote(
      reviewDecisionNote.id,
      decisionType,
      decisionFeedback,
      decisionType === 'change_requested' ? decisionField : undefined
    );

    setReviewDecisionNote(null);
    setDecisionFeedback('');
  };

  const assignedLeaders = scoutService.getAssignedLeaders();

  const handleCreateLeader = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeaderEmail || !newLeaderName) return;

    await scoutService.assignSectionLeaderByEmail(
      newLeaderEmail,
      newLeaderName,
      newLeaderSection
    );

    setShowAddLeaderModal(false);
    setNewLeaderName('');
    setNewLeaderEmail('');
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ancTitle || !ancContent) return;

    await scoutService.addAnnouncement({
      title: ancTitle,
      content: ancContent,
      targetSection: ancTarget,
      authorName: currentUser.name,
      priority: ancPriority
    });

    setShowAddAnnouncementModal(false);
    setAncTitle('');
    setAncContent('');
  };

  const handleSendReply = async (msgId: string) => {
    const text = replyText[msgId];
    if (!text || !text.trim()) return;
    await scoutService.replyToMessage(msgId, text);
    setReplyText({ ...replyText, [msgId]: '' });
  };

  return (
    <div className="space-y-6">
      {/* Troop Leader Dashboard Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-amber-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-400 text-emerald-950 text-xs px-2.5 py-0.5 rounded-full font-black shadow-xs">
                قيادة الفوج (المدير)
              </span>
              <span className="text-emerald-200 text-xs">فوج الطيب المهيري - تطاوين</span>
            </div>
            <h1 className="text-2xl font-black">{currentUser.name}</h1>
            <p className="text-xs text-emerald-200 mt-1 max-w-xl">
              إدارة الفوج المركزية: اعتماد المذكرات الفنية، متابعة التزام الفرق، قبول المنضوين، ورقابة المداخيل المالية.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {allNotes.length === 0 && (
              <button
                onClick={() => scoutService.seedInitialFirestoreData()}
                className="bg-amber-400 hover:bg-amber-500 text-emerald-950 font-black px-3.5 py-2.5 rounded-xl text-xs shadow transition flex items-center gap-1.5"
                title="إدراج نموذج كشفي تأسيسي للموسم"
              >
                <span>⚜️ إدراج نموذج تأسيسي للموسم</span>
              </button>
            )}
            <button
              onClick={() => setShowAddAnnouncementModal(true)}
              className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs border border-emerald-600 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              نشر بلاغ كشفي
            </button>
            <button
              onClick={() => window.print()}
              className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs border border-emerald-600 transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              طباعة تقرير الفوج
            </button>
          </div>
        </div>

        {/* Quick KPI stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-emerald-800/80 text-xs">
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
            <p className="text-emerald-200">مذكرات بانتظار الاعتماد</p>
            <p className="text-xl font-black text-amber-300 mt-1">{pendingNotes.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
            <p className="text-emerald-200">طلبات تسجيل جديدة</p>
            <p className="text-xl font-black text-white mt-1">{pendingRegistrations.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
            <p className="text-emerald-200">نسبة استخلاص الاشتراكات</p>
            <p className="text-xl font-black text-emerald-300 mt-1">{collectionRate}%</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
            <p className="text-emerald-200">إجمالي المنضوين</p>
            <p className="text-xl font-black text-white mt-1">{allMembers.filter(m => m.status === 'approved').length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-8 gap-2">
        <button
          onClick={() => setActiveTab('notes')}
          className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition border ${
            activeTab === 'notes'
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-md'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50'
          }`}
        >
          <FileCheck className="w-5 h-5 text-amber-400" />
          <span>المذكرات ({pendingNotes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('registrations')}
          className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition border ${
            activeTab === 'registrations'
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-md'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50'
          }`}
        >
          <Users className="w-5 h-5 text-teal-500" />
          <span>التسجيلات ({pendingRegistrations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition border ${
            activeTab === 'subscriptions'
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-md'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50'
          }`}
        >
          <DollarSign className="w-5 h-5 text-emerald-600" />
          <span>الاشتراكات</span>
        </button>

        <button
          onClick={() => setActiveTab('compliance')}
          className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition border ${
            activeTab === 'compliance'
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-md'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50'
          }`}
        >
          <TrendingUp className="w-5 h-5 text-blue-500" />
          <span>متابعة الفرق</span>
        </button>

        <button
          onClick={() => setActiveTab('leaders')}
          className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition border ${
            activeTab === 'leaders'
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-md'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50'
          }`}
        >
          <Shield className="w-5 h-5 text-purple-500" />
          <span>قادة الفرق ({leaders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition border ${
            activeTab === 'announcements'
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-md'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50'
          }`}
        >
          <Calendar className="w-5 h-5 text-orange-500" />
          <span>الإعلانات</span>
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition border ${
            activeTab === 'messages'
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-md'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50'
          }`}
        >
          <MessageSquare className="w-5 h-5 text-rose-500" />
          <span>الرسائل ({messages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition border ${
            activeTab === 'audit'
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-md'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50'
          }`}
        >
          <History className="w-5 h-5 text-gray-500" />
          <span>سجل العمليات</span>
        </button>
      </div>

      {/* --- TAB 1: TECHNICAL NOTES & REVIEW DECISION --- */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-extrabold text-lg text-emerald-950">
                مراجعة واعتماد المذكرات الفنية الكشفية الأسبوعية
              </h2>
            </div>

            {/* Filter by section */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-gray-600">الفرقة:</span>
              <select
                value={notesFilterSection}
                onChange={e => setNotesFilterSection(e.target.value)}
                className="p-1.5 rounded-lg border border-gray-300 font-semibold"
              >
                <option value="all">جميع الفرق</option>
                {SCOUT_SECTIONS.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <span className="font-bold text-gray-600">الحالة:</span>
              <select
                value={notesFilterStatus}
                onChange={e => setNotesFilterStatus(e.target.value)}
                className="p-1.5 rounded-lg border border-gray-300 font-semibold"
              >
                <option value="all">الكل</option>
                <option value="submitted">مرسلة للاعتماد</option>
                <option value="approved">معتمدة</option>
                <option value="change_requested">طلب تعديل</option>
                <option value="draft">مسودة</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allNotes
              .filter(n => notesFilterSection === 'all' || n.sectionId === notesFilterSection)
              .filter(n => notesFilterStatus === 'all' || n.status === notesFilterStatus)
              .map(note => {
                const section = SCOUT_SECTIONS.find(s => s.id === note.sectionId);
                return (
                  <div
                    key={note.id}
                    className={`bg-white rounded-2xl p-5 border shadow-sm transition space-y-3 ${
                      note.status === 'submitted'
                        ? 'border-2 border-amber-400 bg-amber-50/10'
                        : 'border-stone-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span
                          className="text-[11px] font-bold px-2 py-0.5 rounded-md"
                          style={{ backgroundColor: section?.bgLight, color: section?.color }}
                        >
                          {section?.name}
                        </span>
                        <h3 className="font-black text-base text-emerald-950 mt-1">{note.title}</h3>
                      </div>

                      {/* Status */}
                      {note.status === 'submitted' && (
                        <span className="bg-amber-100 text-amber-900 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 animate-pulse">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          بانتظار قرارك
                        </span>
                      )}
                      {note.status === 'approved' && (
                        <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          معتمدة رسمياً
                        </span>
                      )}
                      {note.status === 'change_requested' && (
                        <span className="bg-orange-100 text-orange-900 text-xs px-2.5 py-1 rounded-full font-bold">
                          طلب تعديل
                        </span>
                      )}
                      {note.status === 'rejected' && (
                        <span className="bg-red-100 text-red-900 text-xs px-2.5 py-1 rounded-full font-bold">
                          مرفوضة
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-gray-700 bg-stone-50 p-2.5 rounded-xl border border-stone-200 space-y-1">
                      <p><span className="font-bold">القائد المشرف:</span> {note.leaderName}</p>
                      <p><span className="font-bold">التاريخ والتوقيت:</span> {note.date} على الساعة {note.startTime} ({note.durationMinutes} دقيقة)</p>
                      <p><span className="font-bold">المكان:</span> {note.location}</p>
                      <p><span className="font-bold">الهدف العام:</span> {note.generalObjective}</p>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                      <button
                        onClick={() => setViewingPDFNote(note)}
                        className="bg-stone-100 hover:bg-stone-200 text-gray-800 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5 text-emerald-800" />
                        معاينة المذكرة
                      </button>

                      {/* Review Decision Buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setReviewDecisionNote(note);
                            setDecisionType('approved');
                          }}
                          className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5 text-amber-300" />
                          موافقة واعتماد
                        </button>

                        <button
                          onClick={() => {
                            setReviewDecisionNote(note);
                            setDecisionType('change_requested');
                          }}
                          className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          طلب تعديل
                        </button>

                        <button
                          onClick={() => {
                            setReviewDecisionNote(note);
                            setDecisionType('rejected');
                          }}
                          className="bg-red-50 hover:bg-red-100 text-red-700 font-bold px-2.5 py-1.5 rounded-lg text-xs"
                        >
                          رفض
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* --- TAB 2: MEMBER REGISTRATIONS REVIEW --- */}
      {activeTab === 'registrations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-lg text-emerald-950">
                مراجعة طلبات تسجيل المنضوين وتوزيعهم على الفرق
              </h2>
              <p className="text-xs text-gray-600">
                قبول أو رفض المنضوين وتحديد الفرقة المناسبة حسب السن والجنس.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {allMembers.map(member => {
              const currentSection = SCOUT_SECTIONS.find(s => s.id === member.sectionId);
              return (
                <div
                  key={member.id}
                  className={`bg-white rounded-2xl p-5 border shadow-sm flex flex-wrap items-center justify-between gap-4 ${
                    member.status === 'pending' ? 'border-amber-400 bg-amber-50/15' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src={member.photoUrl} alt="" className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-base text-emerald-950">{member.fullName}</h3>
                        {member.status === 'pending' && (
                          <span className="bg-amber-100 text-amber-900 text-xs px-2.5 py-0.5 rounded-full font-bold">
                            قيد المراجعة
                          </span>
                        )}
                        {member.status === 'approved' && (
                          <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                            مقبول بالفوج
                          </span>
                        )}
                        {member.status === 'rejected' && (
                          <span className="bg-red-100 text-red-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                            مرفوض
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">
                        الولي: {member.parentName} ({member.phone1}) | المدرسة: {member.gradeSchool}
                      </p>
                      {member.healthNotes && (
                        <p className="text-[11px] text-amber-800 font-semibold mt-1">
                          صحة: {member.healthNotes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Section assignment */}
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="block text-[11px] font-bold text-gray-500 mb-0.5">الفرقة المخصصة:</span>
                      <select
                        value={member.sectionId}
                        onChange={e => scoutService.updateMemberStatus(member.id, member.status, e.target.value)}
                        className="px-2 py-1 rounded-lg border border-gray-300 text-xs font-bold"
                      >
                        {SCOUT_SECTIONS.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    {member.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => scoutService.updateMemberStatus(member.id, 'approved', member.sectionId)}
                          className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow"
                        >
                          <Check className="w-3.5 h-3.5" />
                          قبول وتثبيت
                        </button>
                        <button
                          onClick={() => scoutService.updateMemberStatus(member.id, 'rejected', undefined, 'اكتمال طاقة استيعاب الفرقة')}
                          className="bg-red-50 hover:bg-red-100 text-red-700 font-bold px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          رفض
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TAB 3: SUBSCRIPTIONS & FINANCIAL DASHBOARD --- */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-extrabold text-lg text-emerald-950">
                لوحة إحصائيات الاشتراكات والمداخيل المالية للفوج
              </h2>
              <p className="text-xs text-gray-600">
                متابعة المبالغ المستخلصة مقابل المتوقعة، تفصيل حسب الفرق، وقائمة غير الخالصين.
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="bg-emerald-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-300" />
              تصدير القوائم المالية
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs font-bold text-gray-500">المبلغ المستخلص الفعلي</span>
              <p className="text-2xl font-black text-emerald-800 mt-1">{totalCollectedAmount} د.ت</p>
              <span className="text-xs text-emerald-600 font-semibold">دينار تونسي في صندوق الفوج</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs font-bold text-gray-500">إجمالي المبلغ المتوقع</span>
              <p className="text-2xl font-black text-gray-900 mt-1">{totalExpectedAmount} د.ت</p>
              <span className="text-xs text-gray-500 font-semibold">بناءً على عدد المنضوين</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs font-bold text-gray-500">نسبة التحصيل الكلية</span>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-2xl font-black text-amber-600">{collectionRate}%</p>
                <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className="bg-emerald-700 h-full rounded-full" style={{ width: `${collectionRate}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Section Breakdown */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
            <h3 className="font-extrabold text-sm text-emerald-950 mb-3">التفصيل حسب فرق الفوج:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SCOUT_SECTIONS.map(sec => {
                const secSubs = allSubscriptions.filter(s => s.sectionId === sec.id);
                const exp = secSubs.reduce((a, b) => a + b.amount, 0);
                const col = secSubs.filter(s => s.isPaid).reduce((a, b) => a + b.amount, 0);
                const rate = exp > 0 ? Math.round((col / exp) * 100) : 0;
                return (
                  <div key={sec.id} className="p-3 rounded-xl border border-stone-200 bg-stone-50 space-y-1 text-xs">
                    <p className="font-bold text-emerald-950">{sec.name}</p>
                    <div className="flex justify-between text-gray-600">
                      <span>المستخلص: {col} د.ت</span>
                      <span className="font-bold text-emerald-800">{rate}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Unpaid Members Table */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
              <h3 className="font-black text-sm text-amber-950">قائمة المنضوين غير الخالصين ({unpaidSubscriptions.length})</h3>
              <span className="text-xs text-amber-800 font-semibold">تذكير الأولياء مباشرة عبر واتساب</span>
            </div>
            <table className="w-full text-xs">
              <thead className="bg-stone-100 text-gray-700">
                <tr>
                  <th className="p-2.5 text-right">المنضو</th>
                  <th className="p-2.5 text-right">الفرقة</th>
                  <th className="p-2.5 text-right">هاتف الولي</th>
                  <th className="p-2.5 text-center">المبلغ</th>
                  <th className="p-2.5 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {unpaidSubscriptions.map(sub => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="p-2.5 font-bold text-emerald-950">{sub.memberName}</td>
                    <td className="p-2.5 text-gray-600">{SCOUT_SECTIONS.find(s => s.id === sub.sectionId)?.name}</td>
                    <td className="p-2.5 text-gray-800">{sub.parentPhone}</td>
                    <td className="p-2.5 text-center font-bold text-amber-800">{sub.amount} د.ت</td>
                    <td className="p-2.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setWhatsAppSub(sub)}
                          className="bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-bold text-[11px]"
                        >
                          تذكير واتساب
                        </button>
                        <button
                          onClick={() => scoutService.recordPayment(sub.id, 'نقداً لقيادة الفوج')}
                          className="bg-amber-500 text-emerald-950 px-2 py-1 rounded-lg font-bold text-[11px]"
                        >
                          خلاص
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 4: COMPLIANCE MONITORING --- */}
      {activeTab === 'compliance' && (
        <div className="space-y-4">
          <h2 className="font-extrabold text-lg text-emerald-950">
            لوحة متابعة التزام الفرق بإرسال المذكرات والبرامج الشهرية
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SCOUT_SECTIONS.map(sec => {
              const secNotes = allNotes.filter(n => n.sectionId === sec.id);
              const secPrograms = allPrograms.filter(p => p.sectionId === sec.id);
              const leader = leaders.find(l => l.sectionId === sec.id);

              return (
                <div key={sec.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <h3 className="font-black text-base text-emerald-950">{sec.name}</h3>
                    <span className="text-xs text-gray-500">القائد: {leader?.name || 'قيد التعيين'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                      <span className="text-gray-500 font-bold">المذكرات الفنية:</span>
                      <p className="font-extrabold text-sm text-emerald-900 mt-1">{secNotes.length} مذكرات</p>
                      <span className="text-[11px] text-emerald-700">
                        {secNotes.filter(n => n.status === 'approved').length} معتمدة
                      </span>
                    </div>

                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                      <span className="text-gray-500 font-bold">البرامج الشهرية:</span>
                      <p className="font-extrabold text-sm text-emerald-900 mt-1">{secPrograms.length} برامج</p>
                      <span className="text-[11px] text-emerald-700">
                        {secPrograms.filter(p => p.status === 'approved').length} معتمدة
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-600 font-semibold pt-1">
                    حالة الالتزام الكشفي:{' '}
                    <span className="text-emerald-700 font-bold">ملتزمة بالجدول الزمني ✓</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TAB 5: LEADERS ACCOUNTS MANAGEMENT BY EMAIL --- */}
      {activeTab === 'leaders' && (
        <div className="space-y-4">

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-extrabold text-lg text-emerald-950">
                قادة الفرق المعتمدون بالبريد الإلكتروني ({assignedLeaders.length})
              </h2>
              <p className="text-xs text-gray-600">قائمة الإيميلات المسند إليها قيادة فرق فوج الطيب المهيري بتطاوين.</p>
            </div>
            <button
              onClick={() => setShowAddLeaderModal(true)}
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              إسناد قيادة فرقة لبريد إلكتروني جديد
            </button>
          </div>

          {assignedLeaders.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
              <Shield className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="font-bold text-gray-700 text-sm">لم تسند قيادة أي فرقة بالبريد بعد</p>
              <p className="text-xs text-gray-500 mt-1 mb-4">
                اضغط على الزر أعلاه لإسناد فرقة كشفية (أشبال، زهرات، كشافة...) إلى بريد القائد.
              </p>
              <button
                onClick={() => setShowAddLeaderModal(true)}
                className="bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow"
              >
                إسناد قيادة فرقة الآن
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
              <table className="w-full text-xs">
                <thead className="bg-stone-100 text-gray-800">
                  <tr>
                    <th className="p-3 text-right">البريد الإلكتروني للقائد</th>
                    <th className="p-3 text-right">اسم القائد</th>
                    <th className="p-3 text-right">الفرقة المسندة</th>
                    <th className="p-3 text-center">تاريخ الإسناد</th>
                    <th className="p-3 text-center">حالة الصلاحية</th>
                    <th className="p-3 text-center">إجراءات قائد الفوج</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {assignedLeaders.map(ldr => {
                    const sec = SCOUT_SECTIONS.find(s => s.id === ldr.sectionId);
                    return (
                      <tr key={ldr.email} className="hover:bg-gray-50">
                        <td className="p-3 font-bold text-emerald-950 font-mono text-xs">{ldr.email}</td>
                        <td className="p-3 font-semibold text-gray-800">{ldr.name}</td>
                        <td className="p-3">
                          <span
                            className="px-2.5 py-0.5 rounded-md font-bold text-[11px]"
                            style={{ backgroundColor: sec?.bgLight, color: sec?.color }}
                          >
                            {sec?.badge} {sec?.name}
                          </span>
                        </td>
                        <td className="p-3 text-center text-gray-400">
                          {new Date(ldr.assignedAt).toLocaleDateString('ar-TN')}
                        </td>
                        <td className="p-3 text-center">
                          {ldr.isActive ? (
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[11px]">
                              مفعل ✓
                            </span>
                          ) : (
                            <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold text-[11px]">
                              معطل
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => scoutService.toggleAssignedLeaderStatus(ldr.email)}
                              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] border ${
                                ldr.isActive
                                  ? 'border-amber-400 text-amber-800 hover:bg-amber-50'
                                  : 'border-emerald-400 text-emerald-800 hover:bg-emerald-50'
                              }`}
                            >
                              {ldr.isActive ? 'تعطيل' : 'تفعيل'}
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`هل أنت متأكد من إلغاء إسناد قيادة الفرقة للبريد ${ldr.email}؟`)) {
                                  scoutService.removeAssignedLeader(ldr.email);
                                }
                              }}
                              className="px-2 py-1 rounded-lg font-bold text-[11px] text-red-600 hover:bg-red-50"
                            >
                              إلغاء الإسناد
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 6: ANNOUNCEMENTS --- */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-lg text-emerald-950">
              أخبار وإعلانات الفوج المنشورة
            </h2>
            <button
              onClick={() => setShowAddAnnouncementModal(true)}
              className="bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-bold shadow flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              نشر بلاغ كشفي جديد
            </button>
          </div>

          <div className="space-y-3">
            {announcements.map(anc => (
              <div key={anc.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm text-emerald-950">{anc.title}</h3>
                    <span className="text-xs bg-stone-100 text-gray-700 px-2 py-0.5 rounded">
                      الجهة: {anc.targetSection === 'all' ? 'جميع الفرق' : SCOUT_SECTIONS.find(s=>s.id === anc.targetSection)?.name}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400">{new Date(anc.createdAt).toLocaleDateString('ar-TN')}</span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">{anc.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 7: MESSAGES TO TROOP LEADERSHIP --- */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          <h2 className="font-extrabold text-lg text-emerald-950">
            الرسائل الواردة لقيادة الفوج من الأولياء والقادة
          </h2>

          <div className="space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-emerald-950">{msg.subject}</h4>
                    <p className="text-xs text-gray-500">من: {msg.senderName} ({msg.senderRole === 'parent' ? 'ولي' : 'قائد'})</p>
                  </div>
                  {msg.status === 'replied' ? (
                    <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                      تم الرد
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                      بانتظار الرد
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-800 bg-stone-50 p-3 rounded-xl">{msg.content}</p>

                {msg.reply ? (
                  <div className="bg-emerald-50 p-3 rounded-xl text-xs text-emerald-950">
                    <strong>رد قيادة الفوج: </strong> {msg.reply}
                  </div>
                ) : (
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      value={replyText[msg.id] || ''}
                      onChange={e => setReplyText({ ...replyText, [msg.id]: e.target.value })}
                      placeholder="اكتب رد قيادة الفوج..."
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded-xl text-xs"
                    />
                    <button
                      onClick={() => handleSendReply(msg.id)}
                      className="bg-emerald-800 text-white font-bold px-4 py-1.5 rounded-xl text-xs flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      إرسال الرد
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 8: AUDIT LOGS (سجل العمليات) --- */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <h2 className="font-extrabold text-lg text-emerald-950">
            سجل العمليات والقرارات الكشفية (غير قابل للتعديل)
          </h2>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <table className="w-full text-xs">
              <thead className="bg-stone-100 text-gray-700">
                <tr>
                  <th className="p-3 text-right">العملية والقرار</th>
                  <th className="p-3 text-right">القائم بالعملية</th>
                  <th className="p-3 text-right">الدور</th>
                  <th className="p-3 text-right">التفاصيل</th>
                  <th className="p-3 text-left">التاريخ والتوقيت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="p-3 font-bold text-emerald-950">{log.action}</td>
                    <td className="p-3 text-gray-800">{log.performedByName}</td>
                    <td className="p-3 font-semibold text-emerald-800">{log.role}</td>
                    <td className="p-3 text-gray-600">{log.details}</td>
                    <td className="p-3 text-left text-gray-400">
                      {new Date(log.timestamp).toLocaleString('ar-TN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- MODAL: NOTE REVIEW DECISION (موافقة / طلب تعديل / رفض) --- */}
      {reviewDecisionNote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-emerald-900/20">
            <div className="bg-emerald-900 text-white p-4 px-6 flex items-center justify-between">
              <h3 className="font-bold text-base">قرار قيادة الفوج حول المذكرة الفنية</h3>
              <button onClick={() => setReviewDecisionNote(null)} className="text-emerald-200">✕</button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                <p className="font-bold text-emerald-950 text-sm">{reviewDecisionNote.title}</p>
                <p className="text-gray-500 mt-0.5">
                  القائد: {reviewDecisionNote.leaderName} | التاريخ: {reviewDecisionNote.date}
                </p>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-2">نوع القرار:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecisionType('approved')}
                    className={`p-2.5 rounded-xl border font-bold text-center transition flex flex-col items-center gap-1 ${
                      decisionType === 'approved'
                        ? 'bg-emerald-100 border-emerald-700 text-emerald-950 font-black'
                        : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>موافقة واعتماد</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecisionType('change_requested')}
                    className={`p-2.5 rounded-xl border font-bold text-center transition flex flex-col items-center gap-1 ${
                      decisionType === 'change_requested'
                        ? 'bg-amber-100 border-amber-600 text-amber-950 font-black'
                        : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>طلب تعديل</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecisionType('rejected')}
                    className={`p-2.5 rounded-xl border font-bold text-center transition flex flex-col items-center gap-1 ${
                      decisionType === 'rejected'
                        ? 'bg-red-100 border-red-600 text-red-950 font-black'
                        : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span>رفض المذكرة</span>
                  </button>
                </div>
              </div>

              {decisionType === 'change_requested' && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">الحقل المعني بالتعديل:</label>
                  <select
                    value={decisionField}
                    onChange={e => setDecisionField(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-xl font-bold"
                  >
                    <option value="المراحل التنفيذية والمدد">المراحل التنفيذية والمدد</option>
                    <option value="الهدف التربوي العام والخاص">الهدف التربوي العام والخاص</option>
                    <option value="المستلزمات والأدوات">المستلزمات والأدوات</option>
                    <option value="مؤشرات النجاح">مؤشرات النجاح</option>
                    <option value="التاريخ أو المكان">التاريخ أو المكان</option>
                  </select>
                </div>
              )}

              {(decisionType === 'change_requested' || decisionType === 'rejected') && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {decisionType === 'change_requested' ? 'توجيه التعديل المطلوب للقائد:' : 'سبب الرفض:'}
                  </label>
                  <textarea
                    rows={3}
                    value={decisionFeedback}
                    onChange={e => setDecisionFeedback(e.target.value)}
                    placeholder="يرجى كتابة التوجيه المطلوب تعديله بدقة..."
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-emerald-600"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setReviewDecisionNote(null)}
                  className="px-4 py-2 text-gray-600 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleExecuteNoteReview}
                  className="bg-emerald-800 hover:bg-emerald-900 text-white font-black px-6 py-2 rounded-xl shadow"
                >
                  تأكيد القرار وختم المذكرة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: PDF VIEW --- */}
      {viewingPDFNote && (
        <TechnicalNotePDFView
          note={viewingPDFNote}
          onClose={() => setViewingPDFNote(null)}
        />
      )}

      {/* --- MODAL: WHATSAPP --- */}
      {whatsAppSub && (
        <WhatsAppModal
          subscription={whatsAppSub}
          onClose={() => setWhatsAppSub(null)}
        />
      )}

      {/* --- MODAL: ASSIGN LEADER BY EMAIL --- */}
      {showAddLeaderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-emerald-900/20">
            <div className="bg-emerald-900 text-white p-4 px-6 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">إسناد قيادة فرقة كشفية بالبريد</h3>
                <p className="text-xs text-emerald-200">صلاحية قائد الفوج الحصرية</p>
              </div>
              <button onClick={() => setShowAddLeaderModal(false)} className="text-emerald-200">✕</button>
            </div>

            <form onSubmit={handleCreateLeader} className="p-6 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  البريد الإلكتروني للقائد (Google / Gmail) <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newLeaderEmail}
                  onChange={e => setNewLeaderEmail(e.target.value)}
                  placeholder="scout.leader@gmail.com"
                  className="w-full p-2.5 border border-gray-300 rounded-xl font-mono text-xs font-bold"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  فور دخول القائد بهذا البريد عبر Google من شاشة الدخول الموحدة، سيحصل فوراً على قيادة الفرقة المحددة.
                </p>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  اسم ولقب القائد <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newLeaderName}
                  onChange={e => setNewLeaderName(e.target.value)}
                  placeholder="مثال: القائد طارق العايب"
                  className="w-full p-2.5 border border-gray-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">الفرقة المكلف بقيادتها</label>
                <select
                  value={newLeaderSection}
                  onChange={e => setNewLeaderSection(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl font-bold"
                >
                  {SCOUT_SECTIONS.map(s => (
                    <option key={s.id} value={s.id}>{s.badge} {s.name} ({s.ageRange})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddLeaderModal(false)}
                  className="px-4 py-2 text-gray-600 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-emerald-800 hover:bg-emerald-900 text-white font-black px-6 py-2 rounded-xl shadow"
                >
                  إسناد قيادة الفرقة لهذا البريد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: ADD ANNOUNCEMENT --- */}
      {showAddAnnouncementModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-emerald-900/20">
            <div className="bg-emerald-900 text-white p-4 px-6 flex items-center justify-between">
              <h3 className="font-bold text-base">نشر بلاغ كشفي من قيادة الفوج</h3>
              <button onClick={() => setShowAddAnnouncementModal(false)} className="text-emerald-200">✕</button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="p-6 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">عنوان البلاغ</label>
                <input
                  type="text"
                  required
                  value={ancTitle}
                  onChange={e => setAncTitle(e.target.value)}
                  placeholder="مثال: موعد انطلاق المخيم الشتوي..."
                  className="w-full p-2.5 border border-gray-300 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">الجهة المستهدفة</label>
                  <select
                    value={ancTarget}
                    onChange={e => setAncTarget(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-xl font-semibold"
                  >
                    <option value="all">جميع فرق الفوج والأولياء</option>
                    {SCOUT_SECTIONS.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">الأهمية</label>
                  <select
                    value={ancPriority}
                    onChange={e => setAncPriority(e.target.value as any)}
                    className="w-full p-2 border border-gray-300 rounded-xl font-semibold"
                  >
                    <option value="normal">عادي</option>
                    <option value="urgent">عاجل وهام</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">نص البلاغ الكشفي</label>
                <textarea
                  rows={4}
                  required
                  value={ancContent}
                  onChange={e => setAncContent(e.target.value)}
                  placeholder="اكتب تفاصيل البلاغ هنا..."
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddAnnouncementModal(false)}
                  className="px-4 py-2 text-gray-600 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-emerald-800 text-white font-black px-6 py-2 rounded-xl shadow"
                >
                  نشر البلاغ الآن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
