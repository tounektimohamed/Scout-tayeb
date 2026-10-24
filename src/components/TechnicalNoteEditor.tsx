import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  TechnicalNote,
  SCOUT_SECTIONS,
  EDUCATIONAL_DOMAINS,
  SCOUT_BADGES,
  ActivityMaterial,
  ActivityStage
} from '../types/scout';
import { scoutService } from '../services/scoutService';
import { SignaturePad } from './SignaturePad';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface TechnicalNoteEditorProps {
  initialNote?: Partial<TechnicalNote>;
  sectionId: string;
  onClose: () => void;
  onSaved: (savedNote: TechnicalNote) => void;
}

export const TechnicalNoteEditor: React.FC<TechnicalNoteEditorProps> = ({
  initialNote,
  sectionId,
  onClose,
  onSaved
}) => {
  const { profile, user } = useAuth();
  const currentUser = profile || {
    uid: user?.uid || 'guest',
    name: user?.displayName || 'القائد المشرف',
    role: 'section_leader' as const,
    isActive: true,
    createdAt: ''
  };
  const currentSection = SCOUT_SECTIONS.find(s => s.id === sectionId) || SCOUT_SECTIONS[0];
  const sectionMembers = scoutService.getMembersForSection(sectionId);

  // 11 Mandatory fields state
  const [title, setTitle] = useState(initialNote?.title || '');
  const [educationalDomain, setEducationalDomain] = useState(initialNote?.educationalDomain || 'scout_method');
  const [scoutStage, setScoutStage] = useState(initialNote?.scoutStage || currentSection.stageName);
  const [targetGroup, setTargetGroup] = useState(initialNote?.targetGroup || `طلائع / سداسيات ${currentSection.name}`);
  const [suggestedCount, setSuggestedCount] = useState<number>(initialNote?.suggestedCount || (sectionMembers.length > 0 ? sectionMembers.length : 18));
  const [date, setDate] = useState(initialNote?.date || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(initialNote?.startTime || '09:00');
  const [location, setLocation] = useState(initialNote?.location || 'دار الكشافة بتطاوين');
  const [durationMinutes, setDurationMinutes] = useState<number>(initialNote?.durationMinutes || 90);

  // Objectives
  const [generalObjective, setGeneralObjective] = useState(initialNote?.generalObjective || '');
  const [specificObjectives, setSpecificObjectives] = useState<string[]>(
    initialNote?.specificObjectives && initialNote.specificObjectives.length > 0
      ? initialNote.specificObjectives
      : ['يكون كل كشاف قادرًا على ']
  );

  // Materials
  const [materials, setMaterials] = useState<ActivityMaterial[]>(
    initialNote?.materials || [
      { item: 'حبال كشفية تدريبية', quantity: '10 حبال', provider: 'الفوج' },
      { item: 'قارورة ماء وقبعة شخصية', quantity: '1 لكل كشاف', provider: 'المنضو' }
    ]
  );

  // Stages
  const [stages, setStages] = useState<ActivityStage[]>(
    initialNote?.stages || [
      {
        id: '1',
        stageType: 'التهيئة / البداية',
        description: 'تجمع الطلائع وتحية العلم وصيحة الفرقة والتفتيش على الهندام',
        leaderRole: 'افتتاح النشاط وبعث الحماس ومراجعة شريعة الفرقة',
        durationMinutes: 15
      },
      {
        id: '2',
        stageType: 'صلب الموضوع / التطبيق',
        description: 'التطبيق العملي لموضوع النشاط بمحطات تناوب وتنافس إيجابي',
        leaderRole: 'توجيه التطبيق، تصحيح الأخطاء، وتشجيع المبادرة والتعاون',
        durationMinutes: 60
      },
      {
        id: '3',
        stageType: 'الخاتمة / التقييم',
        description: 'تقييم العمل، تنظيف المكان، وإعلان الطليعة الفائزة والدعاء الكشفي',
        leaderRole: 'التقييم التشجيعي، التأكد من سلامة الجميع وتسليمهم للأولياء',
        durationMinutes: 15
      }
    ]
  );

  // Success indicators
  const [successIndicators, setSuccessIndicators] = useState(initialNote?.successIndicators || '');

  // Badges
  const [selectedBadges, setSelectedBadges] = useState<string[]>(initialNote?.badges || []);

  // Signature
  const [signature, setSignature] = useState(initialNote?.leaderSignature || '');

  // Validation
  const [errorMsg, setErrorMsg] = useState('');

  // Calculate sum of stages
  const stagesTotalDuration = stages.reduce((acc, s) => acc + (Number(s.durationMinutes) || 0), 0);
  const isDurationMatching = stagesTotalDuration === Number(durationMinutes);

  // Add specific objective
  const addSpecificObjective = () => {
    setSpecificObjectives([...specificObjectives, 'يكون كل كشاف قادرًا على ']);
  };

  const updateSpecificObjective = (index: number, val: string) => {
    const updated = [...specificObjectives];
    updated[index] = val;
    setSpecificObjectives(updated);
  };

  const removeSpecificObjective = (index: number) => {
    if (specificObjectives.length > 1) {
      setSpecificObjectives(specificObjectives.filter((_, i) => i !== index));
    }
  };

  // Add Material
  const addMaterial = () => {
    setMaterials([...materials, { item: '', quantity: '1', provider: 'الفوج' }]);
  };

  const updateMaterial = (index: number, field: keyof ActivityMaterial, val: string) => {
    const updated = [...materials];
    updated[index] = { ...updated[index], [field]: val };
    setMaterials(updated);
  };

  const removeMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  // Add Stage
  const addStage = () => {
    setStages([
      ...stages,
      {
        id: 'stg_' + Date.now(),
        stageType: 'صلب الموضوع / التطبيق',
        description: '',
        leaderRole: '',
        durationMinutes: 15
      }
    ]);
  };

  const updateStage = (index: number, field: keyof ActivityStage, val: any) => {
    const updated = [...stages];
    updated[index] = { ...updated[index], [field]: val };
    setStages(updated);
  };

  const removeStage = (index: number) => {
    if (stages.length > 1) {
      setStages(stages.filter((_, i) => i !== index));
    }
  };

  // Toggle badge
  const toggleBadge = (badgeName: string) => {
    if (selectedBadges.includes(badgeName)) {
      setSelectedBadges(selectedBadges.filter(b => b !== badgeName));
    } else {
      setSelectedBadges([...selectedBadges, badgeName]);
    }
  };

  // Save / Submit handler
  const handleSave = async (status: 'draft' | 'submitted') => {
    setErrorMsg('');

    // Check mandatory fields
    if (!title.trim()) {
      setErrorMsg('يرجى كتابة موضوع / عنوان النشاط الكشفي');
      return;
    }
    if (!generalObjective.trim()) {
      setErrorMsg('يرجى تحديد الهدف التربوي العام للنشاط');
      return;
    }
    if (!successIndicators.trim()) {
      setErrorMsg('يرجى إدخال مؤشرات النجاح ومعايير التقييم للنشاط');
      return;
    }
    if (!isDurationMatching) {
      setErrorMsg(`مجموع مدد المراحل (${stagesTotalDuration} د) لا يطابق مدة النشاط الإجمالية (${durationMinutes} د). يرجى ضبط الأوقات.`);
      return;
    }
    if (status === 'submitted' && !signature) {
      setErrorMsg('يرجى إمضاء المذكرة قبل إرسالها إلى قيادة الفوج للاعتماد.');
      return;
    }

    try {
      const saved = await scoutService.saveTechnicalNote({
        id: initialNote?.id,
        title,
        educationalDomain,
        scoutStage,
        targetGroup,
        suggestedCount: Number(suggestedCount),
        actualCount: Number(suggestedCount),
        date,
        startTime,
        location,
        durationMinutes: Number(durationMinutes),
        generalObjective,
        specificObjectives: specificObjectives.filter(o => o.trim().length > 0),
        materials,
        stages,
        successIndicators,
        badges: selectedBadges,
        leaderId: currentUser.uid,
        leaderName: currentUser.name,
        leaderSignature: signature,
        status,
        sectionId: initialNote?.sectionId || sectionId
      });

      onSaved(saved);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء حفظ المذكرة');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden border border-emerald-900/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold text-xl shadow-inner">
              ⚜️
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-white">
                المذكرة الفنية الكشفية الأسبوعية الإلكترونية
              </h2>
              <p className="text-xs text-emerald-200">
                فوج الطيب المهيري - تطاوين | {currentSection.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-2 rounded-xl hover:bg-white/10 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Feedback alert if change requested */}
        {initialNote?.status === 'change_requested' && (
          <div className="bg-amber-100 border-b border-amber-300 p-4 text-amber-950 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">توجيه قائد الفوج (طلب تعديل):</p>
              <p className="mt-1">{initialNote.leaderFeedback}</p>
              {initialNote.feedbackField && (
                <p className="mt-1 font-semibold text-amber-900">
                  الحقل المعني: {initialNote.feedbackField}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {errorMsg && (
            <div className="bg-red-50 border border-red-300 text-red-800 p-3 rounded-xl flex items-center gap-2 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              1. الموضوع / عنوان النشاط الكشفي <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="مثال: مغامرة واحة قطوفة واستكشاف الطبيعة الصحراوية"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-bold text-base text-emerald-950"
            />
          </div>

          {/* 2 & 3. Domain & Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                2. المجال التربوي <span className="text-red-500">*</span>
              </label>
              <select
                value={educationalDomain}
                onChange={e => setEducationalDomain(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-medium"
              >
                {EDUCATIONAL_DOMAINS.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.icon} {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                3. المرحلة الكشفية <span className="text-red-500">*</span>
              </label>
              <select
                value={scoutStage}
                onChange={e => setScoutStage(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-medium"
              >
                {SCOUT_SECTIONS.map(s => (
                  <option key={s.id} value={s.stageName}>
                    {s.name} ({s.ageRange})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4 & 5. Target group, counts, location, date & time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                4. الفئة المستهدفة والعدد
              </label>
              <input
                type="text"
                value={targetGroup}
                onChange={e => setTargetGroup(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs mb-2"
                placeholder="الفئة المستهدفة"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">العدد المقترح:</span>
                <input
                  type="number"
                  value={suggestedCount}
                  onChange={e => setSuggestedCount(Number(e.target.value))}
                  className="w-20 px-2 py-1 rounded border border-gray-300 text-xs font-bold text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                5. التاريخ والتوقيت <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs mb-2"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">ساعة البدء:</span>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-24 px-2 py-1 rounded border border-gray-300 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                المكان والمدة الإجمالية <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs mb-2"
                placeholder="مكان النشاط"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">المدة بالدقائق:</span>
                <input
                  type="number"
                  step="5"
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(Number(e.target.value))}
                  className="w-24 px-2 py-1 rounded border border-gray-300 text-xs font-bold text-center text-emerald-900"
                />
              </div>
            </div>
          </div>

          {/* 6. Objectives */}
          <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-200">
            <h3 className="font-bold text-emerald-950 mb-2 flex items-center gap-1.5">
              <span>🎯 6. الأهداف التربوية للنشاط</span>
            </h3>

            <div className="mb-3">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                الهدف التربوي العام <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                value={generalObjective}
                onChange={e => setGeneralObjective(e.target.value)}
                placeholder="مثال: ترسيخ مهارات حياة الخلاء واستكشاف البيئة المحلية وتنمية روح العمل الجماعي لدى الكشافين"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-700">
                  الأهداف الخاصة (بصيغة "يكون كل كشاف قادرًا على...")
                </label>
                <button
                  type="button"
                  onClick={addSpecificObjective}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  إضافة هدف خاص
                </button>
              </div>

              <div className="space-y-2">
                {specificObjectives.map((obj, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-800 w-5 text-center">{idx + 1}.</span>
                    <input
                      type="text"
                      value={obj}
                      onChange={e => updateSpecificObjective(idx, e.target.value)}
                      placeholder="يكون كل كشاف قادرًا على..."
                      className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 text-xs focus:outline-emerald-600"
                    />
                    {specificObjectives.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSpecificObjective(idx)}
                        className="text-red-500 hover:text-red-700 p-1 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 7. Materials Table */}
          <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                <span>📦 7. المستلزمات والأدوات المطلوبة</span>
              </h3>
              <button
                type="button"
                onClick={addMaterial}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md"
              >
                <Plus className="w-3.5 h-3.5" />
                إضافة أداة / مستلزم
              </button>
            </div>

            <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-2 text-right">المادة / الوسيلة</th>
                  <th className="p-2 text-center w-28">الكمية</th>
                  <th className="p-2 text-center w-36">من يوفرها</th>
                  <th className="p-2 text-center w-12">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {materials.map((mat, i) => (
                  <tr key={i}>
                    <td className="p-2">
                      <input
                        type="text"
                        value={mat.item}
                        onChange={e => updateMaterial(i, 'item', e.target.value)}
                        placeholder="اسم المادة أو الأداة"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={mat.quantity}
                        onChange={e => updateMaterial(i, 'quantity', e.target.value)}
                        placeholder="مثال: 5 حبال"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-center"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <select
                        value={mat.provider}
                        onChange={e => updateMaterial(i, 'provider', e.target.value as any)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-semibold"
                      >
                        <option value="الفوج">الفوج</option>
                        <option value="المنضو">المنضو</option>
                        <option value="القائد">القائد</option>
                      </select>
                    </td>
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeMaterial(i)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 8. Stages Table with Live Duration Validator */}
          <div className="border border-emerald-300 rounded-xl p-4 bg-emerald-50/20">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                  <span>⏱️ 8. مراحل النشاط (التحقق التلقائي للمدة)</span>
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  التحقق التلقائي: يجب أن يساوي مجموع مدد المراحل مدة النشاط المحددة ({durationMinutes} دقيقة)
                </p>
              </div>

              {/* Automatic duration match badge */}
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black transition ${
                  isDurationMatching
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-400'
                    : 'bg-red-100 text-red-900 border border-red-400 animate-pulse'
                }`}
              >
                {isDurationMatching ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>مجموع المراحل متطابق: {stagesTotalDuration} / {durationMinutes} د</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>
                      غير متطابق: المجموع الحالي {stagesTotalDuration} د (الفرق: {stagesTotalDuration - durationMinutes} د)
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {stages.map((stage, i) => (
                <div key={stage.id} className="bg-white p-3 rounded-xl border border-gray-300 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center justify-center">
                        {i + 1}
                      </span>
                      <select
                        value={stage.stageType}
                        onChange={e => updateStage(i, 'stageType', e.target.value)}
                        className="px-2 py-1 rounded border border-gray-300 text-xs font-bold text-emerald-950 bg-stone-50"
                      >
                        <option value="التهيئة / البداية">التهيئة / البداية</option>
                        <option value="صلب الموضوع / التطبيق">صلب الموضوع / التطبيق</option>
                        <option value="الخاتمة / التقييم">الخاتمة / التقييم</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-xs text-gray-600">المدة:</span>
                        <input
                          type="number"
                          step="5"
                          min="1"
                          value={stage.durationMinutes}
                          onChange={e => updateStage(i, 'durationMinutes', Number(e.target.value))}
                          className="w-16 px-2 py-0.5 border border-gray-300 rounded text-center text-xs font-bold text-emerald-900"
                        />
                        <span className="text-xs text-gray-500">د</span>
                      </div>
                      {stages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStage(i)}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-0.5">الوصف والتطبيق:</label>
                      <textarea
                        rows={2}
                        value={stage.description}
                        onChange={e => updateStage(i, 'description', e.target.value)}
                        placeholder="ماذا سيفعل الكشافون بالتفصيل في هذه المرحلة؟"
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-0.5">دور القائد المشرف:</label>
                      <textarea
                        rows={2}
                        value={stage.leaderRole}
                        onChange={e => updateStage(i, 'leaderRole', e.target.value)}
                        placeholder="التوجيه، الشرح، التحكيم، الإشراف، إلخ"
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 text-left">
              <button
                type="button"
                onClick={addStage}
                className="text-xs text-emerald-800 hover:text-emerald-950 font-bold bg-white border border-emerald-300 px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1.5 mr-auto"
              >
                <Plus className="w-4 h-4" />
                إضافة مرحلة جديدة
              </button>
            </div>
          </div>

          {/* 9. Success Indicators */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              9. مؤشرات النجاح ومعايير التقييم <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              value={successIndicators}
              onChange={e => setSuccessIndicators(e.target.value)}
              placeholder="مثال: إتقان 85% من الكشافين للمهارة بنجاح، التزام جميع الطلائع بتنظيف الموقع..."
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          {/* 10. Associated Badges Picker */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              10. الشارات أو المهارات الكشفية المرتبطة بالنشاط
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 bg-stone-50 rounded-xl border border-stone-200">
              {SCOUT_BADGES.map(b => {
                const isSelected = selectedBadges.includes(b.name);
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => toggleBadge(b.name)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs font-semibold text-right transition border ${
                      isSelected
                        ? 'bg-amber-100 border-amber-500 text-amber-950 font-bold'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-base">{b.icon}</span>
                    <span className="truncate">{b.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 11. Leader Supervisor & Electronic Signature Pad */}
          <div>
            <div className="mb-2">
              <span className="text-xs font-bold text-gray-700">11. القائد المشرف: </span>
              <span className="text-xs font-black text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {currentUser.name} ({currentSection.name})
              </span>
            </div>
            <SignaturePad
              leaderName={currentUser.name}
              initialValue={signature}
              onSave={dataUrl => setSignature(dataUrl)}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-stone-100 border-t border-stone-200 p-4 px-6 flex items-center justify-end gap-3">

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-200 font-bold text-xs transition"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={() => handleSave('draft')}
              className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs transition flex items-center gap-1.5"
            >
              حفظ كمسودة
            </button>
            <button
              type="button"
              onClick={() => handleSave('submitted')}
              className="px-6 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs shadow-md transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              إرسال لاعتماد قيادة الفوج
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
