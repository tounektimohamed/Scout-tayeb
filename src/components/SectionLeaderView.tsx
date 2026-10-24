import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  SCOUT_SECTIONS,
  TechnicalNote,
  MonthlyProgram,
  ActivityOutput,
  ScoutMember,
  SubscriptionRecord,
  SCOUT_BADGES,
  ScoutMessage
} from '../types/scout';
import { scoutService } from '../services/scoutService';
import { TechnicalNoteEditor } from './TechnicalNoteEditor';
import { TechnicalNotePDFView } from './TechnicalNotePDFView';
import { WhatsAppModal } from './WhatsAppModal';
import {
  FileText,
  Calendar,
  Sparkles,
  DollarSign,
  Users,
  Plus,
  Copy,
  Printer,
  Edit,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  MessageSquare,
  Award,
  Search,
  ExternalLink,
  MessageCircle,
  Phone
} from 'lucide-react';

export const SectionLeaderView: React.FC = () => {
  const { profile, user } = useAuth();
  const currentUser = profile || {
    uid: user?.uid || 'guest',
    name: user?.displayName || 'قائد الفرقة',
    role: 'section_leader' as const,
    sectionId: 'ashbal',
    isActive: true,
    createdAt: ''
  };
  const sectionId = currentUser.sectionId || 'ashbal';
  const section = SCOUT_SECTIONS.find(s => s.id === sectionId) || SCOUT_SECTIONS[0];

  const [activeTab, setActiveTab] = useState<'notes' | 'monthly' | 'outputs' | 'subscriptions' | 'members' | 'messages'>('notes');

  // Modals
  const [editingNote, setEditingNote] = useState<Partial<TechnicalNote> | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [viewingPDFNote, setViewingPDFNote] = useState<TechnicalNote | null>(null);
  const [whatsAppSub, setWhatsAppSub] = useState<SubscriptionRecord | null>(null);
  const [showAddOutputModal, setShowAddOutputModal] = useState(false);
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);
  const [selectedLibraryNote, setSelectedLibraryNote] = useState<TechnicalNote | null>(null);

  // Search in approved notes library
  const [librarySearch, setLibrarySearch] = useState('');

  // Section Data
  const members = scoutService.getMembersForSection(sectionId);
  const allSectionNotes = scoutService.getNotesForSection(sectionId);
  const monthlyPrograms = scoutService.getProgramsForSection(sectionId);
  const activityOutputs = scoutService.getOutputsForSection(sectionId);
  const subscriptions = scoutService.getSubscriptionsForSection(sectionId);
  const messages = scoutService.getMessagesForUser(currentUser.uid, 'section_leader', sectionId);
  const allApprovedLibrary = scoutService.getApprovedNotes();

  // New Output Form State
  const [outTitle, setOutTitle] = useState('');
  const [outDate, setOutDate] = useState(new Date().toISOString().split('T')[0]);
  const [outSummary, setOutSummary] = useState('');
  const [outPhotos, setOutPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&h=400&fit=crop'
  ]);
  const [outAttendees, setOutAttendees] = useState<string[]>(members.map(m => m.id));
  const [outBadges, setOutBadges] = useState<{ memberId: string; badgeName: string }[]>([]);

  // Monthly Program Form State
  const nextMonth = new Date().getMonth() + 2 > 12 ? 1 : new Date().getMonth() + 2;
  const currentYear = new Date().getFullYear();
  const [progMonth, setProgMonth] = useState(nextMonth);
  const [progYear, setProgYear] = useState(currentYear);
  const [progNotes, setProgNotes] = useState('');
  const [progActivities, setProgActivities] = useState([
    { weekNumber: 1, date: `${currentYear}-11-01`, title: 'نشاط الأسبوع الأول: استكشاف ومهارات كشفية', educationalDomain: 'scout_method' },
    { weekNumber: 2, date: `${currentYear}-11-08`, title: 'نشاط الأسبوع الثاني: بيئة وعناية بالطبيعة', educationalDomain: 'social' },
    { weekNumber: 3, date: `${currentYear}-11-15`, title: 'نشاط الأسبوع الثالث: مسامرة وتعبير درامي', educationalDomain: 'emotional' },
    { weekNumber: 4, date: `${currentYear}-11-22`, title: 'نشاط الأسبوع الرابع: ألعاب ذكاء وتحدي الطلائع', educationalDomain: 'intellectual' }
  ]);

  // Reply message state
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  // Handlers
  const handleDuplicate = async (noteId: string) => {
    try {
      const dup = await scoutService.duplicateTechnicalNote(noteId);
      setEditingNote(dup);
      setShowEditor(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateNewNote = () => {
    setEditingNote({
      sectionId,
      scoutStage: section.stageName,
      targetGroup: `سداسيات / طلائع ${section.name}`,
      suggestedCount: members.length > 0 ? members.length : 18
    });
    setShowEditor(true);
  };

  const handleSaveOutputSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outTitle || !outSummary) return;

    await scoutService.addActivityOutput({
      sectionId,
      title: outTitle,
      date: outDate,
      summary: outSummary,
      photos: outPhotos,
      attendees: outAttendees,
      awardedBadges: outBadges
    });

    setShowAddOutputModal(false);
    setOutTitle('');
    setOutSummary('');
    setActiveTab('outputs');
  };

  const handleSaveMonthlySubmit = async (status: 'draft' | 'submitted') => {
    await scoutService.saveMonthlyProgram({
      sectionId,
      month: Number(progMonth),
      year: Number(progYear),
      status,
      activities: progActivities,
      notes: progNotes
    });

    setShowMonthlyModal(false);
    setActiveTab('monthly');
  };

  const handleSendReply = async (msgId: string) => {
    const text = replyText[msgId];
    if (!text || !text.trim()) return;
    await scoutService.replyToMessage(msgId, text);
    setReplyText({ ...replyText, [msgId]: '' });
  };

  // Monthly program deadline check (must be sent 7 days before month start; reminder 10 days before)
  const now = new Date();
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const daysUntilNextMonth = Math.ceil((nextMonthStart.getTime() - now.getTime()) / (1000 * 3600 * 24));
  const isSubmissionDueSoon = daysUntilNextMonth <= 10 && daysUntilNextMonth >= 7;
  const isSubmissionLate = daysUntilNextMonth < 7;

  return (
    <div className="space-y-6">
      {/* Leader Header Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs px-2.5 py-0.5 rounded-full font-bold shadow-xs"
                style={{ backgroundColor: section.bgLight, color: section.color }}
              >
                {section.badge} {section.name} ({section.ageRange})
              </span>
              <span className="text-emerald-200 text-xs">فوج الطيب المهيري - تطاوين</span>
            </div>
            <h1 className="text-2xl font-black">لوحة قيادة الفرقة: {currentUser.name}</h1>
            <p className="text-xs text-emerald-200 mt-1 max-w-xl">
              إعداد المذكرات الفنية، البرامج الشهرية، تسجيل الحضور، ومتابعة اشتراكات وتواصل أولياء {section.name}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCreateNewNote}
              className="bg-amber-400 hover:bg-amber-500 text-emerald-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-md transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              مذكرة فنية جديدة
            </button>
            <button
              onClick={() => setShowMonthlyModal(true)}
              className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs border border-emerald-600 transition flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-amber-300" />
              البرنامج الشهري
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
        <button
          onClick={() => setActiveTab('notes')}
          className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition border ${
            activeTab === 'notes'
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-md'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50'
          }`}
        >
          <FileText className="w-5 h-5 text-amber-400" />
          <span>المذكرات الفنية ({allSectionNotes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('monthly')}
          className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition border ${
            activeTab === 'monthly'
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-md'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50'
          }`}
        >
          <Calendar className="w-5 h-5 text-blue-500" />
          <span>البرامج الشهرية ({monthlyPrograms.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('outputs')}
          className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition border ${
            activeTab === 'outputs'
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-md'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50'
          }`}
        >
          <Sparkles className="w-5 h-5 text-purple-500" />
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
          <DollarSign className="w-5 h-5 text-emerald-600" />
          <span>الاشتراكات ({subscriptions.filter(s => !s.isPaid).length} غير خالص)</span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition border ${
            activeTab === 'members'
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-md'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50'
          }`}
        >
          <Users className="w-5 h-5 text-teal-600" />
          <span>منضوي الفرقة ({members.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition border ${
            activeTab === 'messages'
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-md'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50'
          }`}
        >
          <MessageSquare className="w-5 h-5 text-amber-600" />
          <span>رسائل الأولياء ({messages.length})</span>
        </button>
      </div>

      {/* --- TAB 1: TECHNICAL NOTES --- */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-extrabold text-lg text-emerald-950">
                المذكرات الفنية الكشفية الأسبوعية لـ {section.name}
              </h2>
              <p className="text-xs text-gray-600">
                إعداد المذكرة الأسبوعية وإرسالها لقيادة الفوج للاعتماد مع إمكانية التصدير والطباعة.
              </p>
            </div>
            <button
              onClick={handleCreateNewNote}
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow"
            >
              <Plus className="w-4 h-4" />
              إنشاء مذكرة نشاط جديد
            </button>
          </div>

          {/* Technical Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allSectionNotes.map(note => {
              const isApproved = note.status === 'approved';
              return (
                <div
                  key={note.id}
                  className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs hover:shadow-md transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {/* Status Badges */}
                      {note.status === 'approved' && (
                        <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit mb-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          معتمدة ومختومة رسمياً
                        </span>
                      )}
                      {note.status === 'submitted' && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit mb-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-700" />
                          مرسلة قيد المراجعة
                        </span>
                      )}
                      {note.status === 'change_requested' && (
                        <span className="bg-amber-100 text-amber-900 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit mb-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                          طلب تعديل من قائد الفوج
                        </span>
                      )}
                      {note.status === 'draft' && (
                        <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit mb-1.5">
                          مسودة
                        </span>
                      )}
                      {note.status === 'rejected' && (
                        <span className="bg-red-100 text-red-800 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit mb-1.5">
                          مرفوضة
                        </span>
                      )}

                      <h3 className="font-black text-base text-emerald-950">{note.title}</h3>
                    </div>

                    <div className="text-left text-xs text-gray-500 font-semibold bg-stone-50 px-2 py-1 rounded-lg">
                      {note.date}
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2">{note.generalObjective}</p>

                  <div className="flex flex-wrap gap-2 text-[11px] text-gray-600">
                    <span className="bg-stone-100 px-2 py-0.5 rounded">المكان: {note.location}</span>
                    <span className="bg-stone-100 px-2 py-0.5 rounded">المدة: {note.durationMinutes} د</span>
                    <span className="bg-stone-100 px-2 py-0.5 rounded">المراحل: {note.stages?.length || 0}</span>
                  </div>

                  {/* Feedback notice if change requested */}
                  {note.status === 'change_requested' && (
                    <div className="bg-amber-50 border border-amber-300 p-2.5 rounded-xl text-xs text-amber-950">
                      <strong>توجيه التعديل المطلوب:</strong> {note.leaderFeedback}
                    </div>
                  )}

                  {/* Card Actions */}
                  <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewingPDFNote(note)}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 border border-emerald-200"
                        title="معاينة رسمية وطباعة PDF"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        تصدير PDF
                      </button>

                      <button
                        onClick={() => handleDuplicate(note.id)}
                        className="bg-stone-100 hover:bg-stone-200 text-gray-700 px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1"
                        title="نسخ كقالب لنشاط جديد"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        نسخ كقالب
                      </button>
                    </div>

                    {!isApproved ? (
                      <button
                        onClick={() => {
                          setEditingNote(note);
                          setShowEditor(true);
                        }}
                        className="bg-emerald-800 hover:bg-emerald-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        تعديل وإرسال
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2 py-1 rounded">
                        غير قابلة للتعديل (معتمدة)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Library of previously approved notes (مكتبة المذكرات المعتمدة) */}
          <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-4 mt-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-base text-emerald-950 flex items-center gap-2">
                  <span>📚 مكتبة المذكرات الفنية المعتمدة بالفوج</span>
                  <span className="text-xs bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                    {allApprovedLibrary.length} مذكرة
                  </span>
                </h3>
                <p className="text-xs text-gray-600">
                  استفد من خبرات قادة الفوج السابقة واستخدم أي مذكرة معتمدة كقالب لنشاطك.
                </p>
              </div>

              <div className="relative w-64">
                <input
                  type="text"
                  value={librarySearch}
                  onChange={e => setLibrarySearch(e.target.value)}
                  placeholder="ابحث في بنك المذكرات..."
                  className="w-full pl-3 pr-8 py-1.5 rounded-xl border border-gray-300 text-xs bg-white"
                />
                <Search className="w-4 h-4 text-gray-400 absolute right-2.5 top-2" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {allApprovedLibrary
                .filter(n => !librarySearch || n.title.includes(librarySearch) || n.generalObjective.includes(librarySearch))
                .map(libNote => (
                  <div key={libNote.id} className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                        {libNote.scoutStage}
                      </span>
                      <span className="text-[10px] text-gray-400">{libNote.date}</span>
                    </div>
                    <h4 className="font-bold text-xs text-emerald-950 line-clamp-1">{libNote.title}</h4>
                    <p className="text-[11px] text-gray-500 line-clamp-2">{libNote.generalObjective}</p>
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <button
                        onClick={() => setViewingPDFNote(libNote)}
                        className="text-emerald-700 hover:underline text-[11px] font-bold"
                      >
                        معاينة المذكرة
                      </button>
                      <button
                        onClick={() => handleDuplicate(libNote.id)}
                        className="bg-amber-100 hover:bg-amber-200 text-amber-900 px-2 py-0.5 rounded text-[11px] font-bold"
                      >
                        استخدام كقالب
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: MONTHLY PROGRAMS --- */}
      {activeTab === 'monthly' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-extrabold text-lg text-emerald-950">
                البرامج الشهرية لـ {section.name}
              </h2>
              <p className="text-xs text-gray-600">
                البرنامج الشهري يجب إرساله قبل بداية الشهر بأسبوع على الأقل للاعتماد.
              </p>
            </div>
            <button
              onClick={() => setShowMonthlyModal(true)}
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow"
            >
              <Plus className="w-4 h-4" />
              إعداد برنامج شهر جديد
            </button>
          </div>

          <div className="space-y-4">
            {monthlyPrograms.map(prog => (
              <div key={prog.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="font-black text-base text-emerald-950">
                      برنامج شهر {prog.month} / {prog.year}
                    </h3>
                    <p className="text-xs text-gray-500">{section.name}</p>
                  </div>
                  {prog.status === 'approved' ? (
                    <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      معتمد من قائد الفوج
                    </span>
                  ) : prog.status === 'submitted' ? (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      مرسل للاعتماد
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded-full font-bold">
                      مسودة
                    </span>
                  )}
                </div>

                {/* Table of weekly activities */}
                <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-stone-100 text-gray-700">
                    <tr>
                      <th className="p-2 text-center w-16">الأسبوع</th>
                      <th className="p-2 text-right">عنوان النشاط المخطط</th>
                      <th className="p-2 text-center w-36">المجال التربوي</th>
                      <th className="p-2 text-center w-36">المذكرة الفنية المرتبطة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {prog.activities.map((act, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="p-2 text-center font-bold text-emerald-900">الأسبوع {act.weekNumber}</td>
                        <td className="p-2 font-semibold text-gray-900">{act.title}</td>
                        <td className="p-2 text-center text-gray-600">{act.educationalDomain}</td>
                        <td className="p-2 text-center">
                          {act.linkedTechnicalNoteId ? (
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              مذكرة مرتبطة ✓
                            </span>
                          ) : (
                            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                              لم تُربط بعد
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {prog.notes && (
                  <p className="text-xs text-gray-600 bg-stone-50 p-2.5 rounded-lg">
                    <strong>التوجيه التربوي:</strong> {prog.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 3: ACTIVITY OUTPUTS --- */}
      {activeTab === 'outputs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-lg text-emerald-950">
                مخرجات أنشطة {section.name} (الصور والملخص وتأكيد الحضور)
              </h2>
              <p className="text-xs text-gray-600">
                ترفع الملخص والصور بعد كل نشاط لتصل مباشرة لأولياء فرقك فقط.
              </p>
            </div>
            <button
              onClick={() => setShowAddOutputModal(true)}
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow"
            >
              <Plus className="w-4 h-4" />
              نشر مخرجات نشاط جديد
            </button>
          </div>

          <div className="space-y-4">
            {activityOutputs.map(output => (
              <div key={output.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="font-black text-base text-emerald-950">{output.title}</h3>
                    <p className="text-xs text-gray-500">
                      التاريخ: {output.date} | عدد الحاضرين: {output.attendees?.length || 0} كشافاً
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-700 bg-stone-50 p-3 rounded-xl">{output.summary}</p>

                {output.photos && output.photos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {output.photos.map((url, i) => (
                      <img key={i} src={url} alt="مخرجات" className="h-32 w-full object-cover rounded-xl border border-gray-200" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 4: SUBSCRIPTIONS & WHATSAPP REMINDERS --- */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-extrabold text-lg text-emerald-950">
                متابعة اشتراكات منضوي {section.name}
              </h2>
              <p className="text-xs text-gray-600">
                تسجيل الدفع وتذكير سريع للولي عبر واتساب برسالة كشفية جاهزة أو اتصال هاتفي.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-xs">
              <thead className="bg-stone-100 text-gray-800">
                <tr>
                  <th className="p-3 text-right">المنضو الكشفي</th>
                  <th className="p-3 text-right">هاتف الولي</th>
                  <th className="p-3 text-center">الشهر والموسم</th>
                  <th className="p-3 text-center">المبلغ</th>
                  <th className="p-3 text-center">حالة الاشتراك</th>
                  <th className="p-3 text-center">إجراءات القائد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subscriptions.map(sub => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="p-3 font-bold text-emerald-950">{sub.memberName}</td>
                    <td className="p-3 text-gray-700">{sub.parentPhone}</td>
                    <td className="p-3 text-center text-gray-600">{sub.month}</td>
                    <td className="p-3 text-center font-bold">{sub.amount} د.ت</td>
                    <td className="p-3 text-center">
                      {sub.isPaid ? (
                        <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold">
                          خالص ✓
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full font-bold">
                          غير خالص
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {!sub.isPaid && (
                          <>
                            <button
                              onClick={() => setWhatsAppSub(sub)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 shadow-xs"
                              title="تذكير عبر واتساب"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              واتساب
                            </button>
                            <a
                              href={`tel:${sub.parentPhone}`}
                              className="bg-stone-200 hover:bg-stone-300 text-gray-700 p-1 rounded-lg"
                              title="اتصال هاتفي"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => scoutService.recordPayment(sub.id, 'نقداً لقائد الفرقة')}
                              className="bg-amber-500 hover:bg-amber-600 text-emerald-950 font-bold px-2 py-1 rounded-lg text-[11px]"
                            >
                              تسجيل دفع
                            </button>
                          </>
                        )}
                        {sub.isPaid && (
                          <span className="text-[11px] text-gray-400 font-medium">
                            {sub.paymentMethod}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 5: SECTION MEMBERS --- */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <h2 className="font-extrabold text-lg text-emerald-950">
            قائمة منضوي {section.name} المعتمدين ({members.length})
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {members.map(member => (
              <div key={member.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-2">
                <div className="flex items-center gap-3">
                  <img src={member.photoUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-amber-400" />
                  <div>
                    <h3 className="font-bold text-sm text-emerald-950">{member.fullName}</h3>
                    <p className="text-[11px] text-gray-500">{member.gradeSchool}</p>
                  </div>
                </div>

                <div className="text-xs text-gray-600 space-y-0.5 pt-2 border-t border-gray-100">
                  <p><span className="font-bold">الولي:</span> {member.parentName} ({member.phone1})</p>
                  <p><span className="font-bold">الميلاد:</span> {member.birthDate}</p>
                  {member.healthNotes && (
                    <p className="text-red-700 font-medium bg-red-50 p-1 rounded text-[11px]">
                      صحة: {member.healthNotes}
                    </p>
                  )}
                </div>

                {/* Badges */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-gray-500 block mb-1">الشارات:</span>
                  <div className="flex flex-wrap gap-1">
                    {member.badges.map((b, i) => (
                      <span key={i} className="bg-amber-100 text-amber-900 text-[10px] px-1.5 py-0.5 rounded font-bold">
                        🎖️ {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 6: MESSAGES FROM PARENTS --- */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          <h2 className="font-extrabold text-lg text-emerald-950">
            رسائل أولياء {section.name} الواردة
          </h2>

          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-gray-500 text-xs">
                لا توجد رسائل جديدة من الأولياء حالياً.
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-emerald-950">{msg.subject}</h4>
                      <p className="text-xs text-gray-500">من الولي: {msg.senderName}</p>
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

                  <p className="text-xs text-gray-800 bg-stone-50 p-3 rounded-xl">{msg.content}</p>

                  {/* Previous Reply */}
                  {msg.reply ? (
                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-950">
                      <strong>ردك: </strong> {msg.reply}
                    </div>
                  ) : (
                    /* Reply Box */
                    <div className="pt-2 flex gap-2">
                      <input
                        type="text"
                        value={replyText[msg.id] || ''}
                        onChange={e => setReplyText({ ...replyText, [msg.id]: e.target.value })}
                        placeholder="اكتب ردك للولي هنا..."
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-xl text-xs"
                      />
                      <button
                        onClick={() => handleSendReply(msg.id)}
                        className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-4 py-1.5 rounded-xl text-xs flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        إرسال الرد
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* --- MODAL: TECHNICAL NOTE EDITOR --- */}
      {showEditor && (
        <TechnicalNoteEditor
          sectionId={sectionId}
          initialNote={editingNote || undefined}
          onClose={() => setShowEditor(false)}
          onSaved={() => {
            setShowEditor(false);
            setActiveTab('notes');
          }}
        />
      )}

      {/* --- MODAL: PDF PRINT PREVIEW --- */}
      {viewingPDFNote && (
        <TechnicalNotePDFView
          note={viewingPDFNote}
          onClose={() => setViewingPDFNote(null)}
        />
      )}

      {/* --- MODAL: WHATSAPP REMINDER --- */}
      {whatsAppSub && (
        <WhatsAppModal
          subscription={whatsAppSub}
          onClose={() => setWhatsAppSub(null)}
        />
      )}

      {/* --- MODAL: MONTHLY PROGRAM CREATOR --- */}
      {showMonthlyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-emerald-900/20">
            <div className="bg-emerald-900 text-white p-4 px-6 flex items-center justify-between">
              <h3 className="font-bold text-base">إعداد البرنامج الشهري لـ {section.name}</h3>
              <button onClick={() => setShowMonthlyModal(false)} className="text-emerald-200">✕</button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">الشهر</label>
                  <select
                    value={progMonth}
                    onChange={e => setProgMonth(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-gray-300 font-bold"
                  >
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                      <option key={m} value={m}>شهر {m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">السنة</label>
                  <input
                    type="number"
                    value={progYear}
                    onChange={e => setProgYear(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-gray-300 font-bold"
                  />
                </div>
              </div>

              {/* Weeks Activities */}
              <div>
                <label className="block font-bold text-gray-700 mb-2">أنشطة الأسابيع الأربعة:</label>
                <div className="space-y-2">
                  {progActivities.map((act, i) => (
                    <div key={i} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-emerald-950">
                        <span>الأسبوع {act.weekNumber}</span>
                        <input
                          type="date"
                          value={act.date}
                          onChange={e => {
                            const updated = [...progActivities];
                            updated[i].date = e.target.value;
                            setProgActivities(updated);
                          }}
                          className="px-2 py-0.5 border border-gray-300 rounded text-[11px]"
                        />
                      </div>
                      <input
                        type="text"
                        value={act.title}
                        onChange={e => {
                          const updated = [...progActivities];
                          updated[i].title = e.target.value;
                          setProgActivities(updated);
                        }}
                        placeholder="عنوان النشاط"
                        className="w-full p-1.5 border border-gray-300 rounded text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">توجيهات إضافية لقيادة الفوج:</label>
                <textarea
                  rows={2}
                  value={progNotes}
                  onChange={e => setProgNotes(e.target.value)}
                  placeholder="أهداف عامة واحتياجات لوجستية..."
                  className="w-full p-2 rounded-xl border border-gray-300"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowMonthlyModal(false)}
                  className="px-4 py-2 text-gray-600 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveMonthlySubmit('draft')}
                  className="px-4 py-2 bg-gray-200 text-gray-800 font-bold rounded-xl"
                >
                  حفظ كمسودة
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveMonthlySubmit('submitted')}
                  className="px-6 py-2 bg-emerald-800 text-white font-black rounded-xl shadow"
                >
                  إرسال للاعتماد
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: ADD ACTIVITY OUTPUT --- */}
      {showAddOutputModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-emerald-900/20">
            <div className="bg-emerald-900 text-white p-4 px-6 flex items-center justify-between">
              <h3 className="font-bold text-base">نشر مخرجات نشاط كشفي للأولياء</h3>
              <button onClick={() => setShowAddOutputModal(false)} className="text-emerald-200">✕</button>
            </div>

            <form onSubmit={handleSaveOutputSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">عنوان المخرجات / النشاط</label>
                <input
                  type="text"
                  required
                  value={outTitle}
                  onChange={e => setOutTitle(e.target.value)}
                  placeholder="مثال: مخرجات خرجة واحة قطوفة الاستكشافية للأشبال"
                  className="w-full p-2.5 rounded-xl border border-gray-300 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">ملخص النشاط والإنجازات (يصل للأولياء)</label>
                <textarea
                  rows={4}
                  required
                  value={outSummary}
                  onChange={e => setOutSummary(e.target.value)}
                  placeholder="صف كيف جرى النشاط، ما تعلمه الفتيان، واللحظات الإيجابية..."
                  className="w-full p-2.5 rounded-xl border border-gray-300"
                />
              </div>

              {/* Attendance Checklist */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">تسجيل حضور المنضوين:</label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-stone-50 rounded-xl border border-stone-200">
                  {members.map(m => {
                    const isAttending = outAttendees.includes(m.id);
                    return (
                      <label key={m.id} className="flex items-center gap-2 cursor-pointer font-semibold p-1 hover:bg-white rounded">
                        <input
                          type="checkbox"
                          checked={isAttending}
                          onChange={e => {
                            if (e.target.checked) {
                              setOutAttendees([...outAttendees, m.id]);
                            } else {
                              setOutAttendees(outAttendees.filter(id => id !== m.id));
                            }
                          }}
                        />
                        <span>{m.fullName}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddOutputModal(false)}
                  className="px-4 py-2 text-gray-600 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-emerald-800 hover:bg-emerald-900 text-white font-black px-6 py-2 rounded-xl shadow"
                >
                  نشر المخرجات للأولياء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
