import {
  ScoutMember,
  TechnicalNote,
  MonthlyProgram,
  ActivityOutput,
  SubscriptionRecord,
  TroopAnnouncement,
  ScoutMessage,
  AuditLogItem,
  UserProfile,
  AssignedLeader,
  SCOUT_SECTIONS,
  determineScoutSection
} from '../types/scout';
import { db, auth, handleFirestoreError, OperationType, cleanFirestoreData } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

class FirestoreScoutService {
  private members: ScoutMember[] = [];
  private technicalNotes: TechnicalNote[] = [];
  private monthlyPrograms: MonthlyProgram[] = [];
  private activityOutputs: ActivityOutput[] = [];
  private subscriptions: SubscriptionRecord[] = [];
  private announcements: TroopAnnouncement[] = [];
  private messages: ScoutMessage[] = [];
  private auditLogs: AuditLogItem[] = [];
  private users: UserProfile[] = [];
  private assignedLeaders: AssignedLeader[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.initListeners();
  }

  public initListeners() {
    // Clean previous listeners
    this.listeners.forEach(unsub => unsub());
    this.listeners = [];

    // Attach real-time Firestore listeners
    try {
      // 1. Members
      const unsubMembers = onSnapshot(collection(db, 'members'), snapshot => {
        this.members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ScoutMember));
      }, err => {
        console.warn("Firestore snapshot error (members):", err);
      });
      this.listeners.push(unsubMembers);

      // 2. Technical Notes
      const unsubNotes = onSnapshot(collection(db, 'technical_notes'), snapshot => {
        this.technicalNotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TechnicalNote));
      }, err => {
        console.warn("Firestore snapshot error (technical_notes):", err);
      });
      this.listeners.push(unsubNotes);

      // 3. Monthly Programs
      const unsubPrograms = onSnapshot(collection(db, 'monthly_programs'), snapshot => {
        this.monthlyPrograms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MonthlyProgram));
      }, err => {
        console.warn("Firestore snapshot error (monthly_programs):", err);
      });
      this.listeners.push(unsubPrograms);

      // 4. Activity Outputs
      const unsubOutputs = onSnapshot(collection(db, 'activity_outputs'), snapshot => {
        this.activityOutputs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActivityOutput));
      }, err => {
        console.warn("Firestore snapshot error (activity_outputs):", err);
      });
      this.listeners.push(unsubOutputs);

      // 5. Subscriptions
      const unsubSubs = onSnapshot(collection(db, 'subscriptions'), snapshot => {
        this.subscriptions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SubscriptionRecord));
      }, err => {
        console.warn("Firestore snapshot error (subscriptions):", err);
      });
      this.listeners.push(unsubSubs);

      // 6. Announcements
      const unsubAncs = onSnapshot(collection(db, 'announcements'), snapshot => {
        this.announcements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TroopAnnouncement));
      }, err => {
        console.warn("Firestore snapshot error (announcements):", err);
      });
      this.listeners.push(unsubAncs);

      // 7. Messages
      const unsubMsgs = onSnapshot(collection(db, 'messages'), snapshot => {
        this.messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ScoutMessage));
      }, err => {
        console.warn("Firestore snapshot error (messages):", err);
      });
      this.listeners.push(unsubMsgs);

      // 8. Audit Logs
      const unsubLogs = onSnapshot(collection(db, 'audit_logs'), snapshot => {
        this.auditLogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLogItem));
      }, err => {
        console.warn("Firestore snapshot error (audit_logs):", err);
      });
      this.listeners.push(unsubLogs);

      // 9. Users
      const unsubUsers = onSnapshot(collection(db, 'users'), snapshot => {
        this.users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
      }, err => {
        console.warn("Firestore snapshot error (users):", err);
      });
      this.listeners.push(unsubUsers);

      // 10. Assigned Leaders by Email
      const unsubAssigned = onSnapshot(collection(db, 'assigned_leaders'), snapshot => {
        this.assignedLeaders = snapshot.docs.map(doc => ({ email: doc.id, ...doc.data() } as AssignedLeader));
      }, err => {
        console.warn("Firestore snapshot error (assigned_leaders):", err);
      });
      this.listeners.push(unsubAssigned);
    } catch (e) {
      console.warn("Failed to attach one or more listeners", e);
    }
  }

  // --- Audit Logging to Firestore ---
  public async logAction(action: string, targetType: string, targetId: string, details: string, userProfile?: UserProfile) {
    const user = userProfile || this.getUserFromAuth();
    const logId = 'log_' + Date.now();
    const logData: AuditLogItem = {
      id: logId,
      action,
      performedBy: user.uid,
      performedByName: user.name,
      role: user.role === 'troop_leader' ? 'قائد الفوج' : user.role === 'section_leader' ? 'قائد فرقة' : 'ولي',
      targetType,
      targetId,
      details,
      timestamp: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'audit_logs', logId), logData);
    } catch (err) {
      console.warn("Audit log save error:", err);
    }
  }

  private getUserFromAuth(): UserProfile {
    const current = auth.currentUser;
    if (!current) {
      return {
        uid: 'guest',
        name: 'زائر',
        role: 'parent',
        isActive: true,
        createdAt: new Date().toISOString()
      };
    }
    const found = this.users.find(u => u.uid === current.uid);
    if (found) return found;

    const isTroopLeader = current.email === 'codeopen540@gmail.com';
    return {
      uid: current.uid,
      name: current.displayName || (isTroopLeader ? 'القائد سالم لبيض (قائد الفوج)' : 'ولي أمر'),
      email: current.email || '',
      role: isTroopLeader ? 'troop_leader' : 'parent',
      isActive: true,
      createdAt: new Date().toISOString()
    };
  }

  // --- Scout Members (منضوين) ---
  public getMembers(): ScoutMember[] {
    return this.members;
  }

  public getMembersForParent(parentId: string): ScoutMember[] {
    return this.members.filter(m => m.parentId === parentId);
  }

  public getMembersForSection(sectionId: string): ScoutMember[] {
    return this.members.filter(m => m.sectionId === sectionId && m.status === 'approved');
  }

  public async addMember(member: Omit<ScoutMember, 'id' | 'status' | 'badges' | 'createdAt'>): Promise<ScoutMember> {
    const memberId = 'mem_' + Date.now();
    // System automatically determines the section based on birthDate and gender
    const autoSection = determineScoutSection(member.birthDate, member.gender);
    const assignedSectionId = autoSection.sectionId;

    const newMember: ScoutMember = {
      ...member,
      sectionId: assignedSectionId,
      id: memberId,
      status: 'pending',
      badges: [],
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'members', memberId), cleanFirestoreData(newMember));

      // Create subscription record
      const subId = 'sub_' + Date.now();
      const sub: SubscriptionRecord = {
        id: subId,
        memberId: newMember.id,
        memberName: newMember.fullName,
        sectionId: newMember.sectionId,
        parentId: newMember.parentId,
        parentPhone: newMember.phone1,
        seasonYear: '2026 / 2027',
        month: 'أكتوبر 2026',
        amount: 15,
        isPaid: false,
        notes: 'تسجيل جديد'
      };
      await setDoc(doc(db, 'subscriptions', subId), cleanFirestoreData(sub));

      await this.logAction('تسجيل منضو جديد', 'منضو كشفي', memberId, `تسجيل: ${newMember.fullName} من طرف الولي ${newMember.parentName}`);
      return newMember;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `members/${memberId}`);
    }
  }

  public async updateMemberStatus(memberId: string, status: 'approved' | 'rejected' | 'pending', sectionId?: string, rejectionReason?: string) {
    try {
      const updatePayload: any = { status, updatedAt: new Date().toISOString() };
      if (sectionId) updatePayload.sectionId = sectionId;
      if (rejectionReason) updatePayload.rejectionReason = rejectionReason;

      await updateDoc(doc(db, 'members', memberId), updatePayload);
      await this.logAction('تحديث حالة منضو', 'منضو كشفي', memberId, `تحديث الحالة إلى ${status} ${sectionId ? '- الفرقة: ' + sectionId : ''}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `members/${memberId}`);
    }
  }

  public async awardBadge(memberId: string, badgeName: string) {
    const member = this.members.find(m => m.id === memberId);
    if (!member) return;
    if (member.badges.includes(badgeName)) return;

    try {
      const updatedBadges = [...member.badges, badgeName];
      await updateDoc(doc(db, 'members', memberId), { badges: updatedBadges, updatedAt: new Date().toISOString() });
      await this.logAction('إسناد شارة كشفية', 'منضو كشفي', memberId, `إسناد ${badgeName} للمنضو ${member.fullName}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `members/${memberId}`);
    }
  }

  // --- Technical Notes (المذكرات الفنية) ---
  public getTechnicalNotes(): TechnicalNote[] {
    return this.technicalNotes;
  }

  public getApprovedNotes(): TechnicalNote[] {
    return this.technicalNotes.filter(n => n.status === 'approved');
  }

  public getNotesForSection(sectionId: string): TechnicalNote[] {
    return this.technicalNotes.filter(n => n.sectionId === sectionId);
  }

  public getNoteById(id: string): TechnicalNote | undefined {
    return this.technicalNotes.find(n => n.id === id);
  }

  public async saveTechnicalNote(note: Partial<TechnicalNote>): Promise<TechnicalNote> {
    const now = new Date().toISOString();
    const noteId = note.id || ('note_' + Date.now());

    // If already approved, check permission
    const existing = this.technicalNotes.find(n => n.id === noteId);
    const user = this.getUserFromAuth();
    if (existing && existing.status === 'approved' && user.role !== 'troop_leader') {
      throw new Error('لا يمكن تعديل المذكرة بعد اعتمادها وختمها رسمياً من قيادة الفوج.');
    }

    const payload: TechnicalNote = {
      id: noteId,
      title: note.title || '',
      educationalDomain: note.educationalDomain || 'scout_method',
      scoutStage: note.scoutStage || 'أشبال',
      targetGroup: note.targetGroup || 'منضوي الفرقة',
      suggestedCount: note.suggestedCount || 16,
      actualCount: note.actualCount || 16,
      date: note.date || new Date().toISOString().split('T')[0],
      startTime: note.startTime || '09:00',
      location: note.location || 'دار الكشافة بتطاوين',
      durationMinutes: note.durationMinutes || 90,
      generalObjective: note.generalObjective || '',
      specificObjectives: note.specificObjectives || ['يكون كل كشاف قادرًا على...'],
      materials: note.materials || [],
      stages: note.stages || [],
      successIndicators: note.successIndicators || '',
      badges: note.badges || [],
      leaderId: note.leaderId || user.uid,
      leaderName: note.leaderName || user.name,
      leaderSignature: note.leaderSignature || '',
      status: note.status || 'draft',
      sectionId: note.sectionId || 'ashbal',
      leaderFeedback: note.leaderFeedback || '',
      feedbackField: note.feedbackField || '',
      approvedAt: note.approvedAt,
      approvedBy: note.approvedBy,
      createdAt: existing?.createdAt || now,
      updatedAt: now
    };

    try {
      await setDoc(doc(db, 'technical_notes', noteId), cleanFirestoreData(payload));
      await this.logAction(
        existing ? 'تحديث مذكرة فنية' : 'إنشاء مذكرة فنية',
        'مذكرة فنية',
        noteId,
        `مذكرة: ${payload.title} (${payload.status})`
      );
      return payload;
    } catch (err) {
      handleFirestoreError(err, existing ? OperationType.UPDATE : OperationType.CREATE, `technical_notes/${noteId}`);
    }
  }

  public async reviewTechnicalNote(noteId: string, decision: 'approved' | 'change_requested' | 'rejected', feedback?: string, feedbackField?: string) {
    const user = this.getUserFromAuth();
    const updatePayload: any = {
      status: decision,
      leaderFeedback: feedback || '',
      feedbackField: feedbackField || '',
      updatedAt: new Date().toISOString()
    };

    if (decision === 'approved') {
      updatePayload.approvedAt = new Date().toISOString();
      updatePayload.approvedBy = `${user.name} (قائد الفوج)`;
    }

    try {
      await updateDoc(doc(db, 'technical_notes', noteId), updatePayload);
      await this.logAction(
        `اعتماد مذكرة فنية: ${decision}`,
        'مذكرة فنية',
        noteId,
        `القرار: ${decision} ${feedback ? '- توجيه: ' + feedback : ''}`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `technical_notes/${noteId}`);
    }
  }

  public async duplicateTechnicalNote(noteId: string): Promise<TechnicalNote> {
    const original = this.getNoteById(noteId);
    if (!original) throw new Error('المذكرة غير موجودة');

    const duplicated: Partial<TechnicalNote> = {
      ...original,
      id: undefined,
      title: `${original.title} (نسخة جديدة)`,
      date: new Date().toISOString().split('T')[0],
      status: 'draft',
      approvedAt: undefined,
      approvedBy: undefined,
      leaderFeedback: undefined,
      feedbackField: undefined,
      createdAt: undefined,
      updatedAt: undefined
    };

    return await this.saveTechnicalNote(duplicated);
  }

  // --- Monthly Programs (البرامج الشهرية) ---
  public getMonthlyPrograms(): MonthlyProgram[] {
    return this.monthlyPrograms;
  }

  public getProgramsForSection(sectionId: string): MonthlyProgram[] {
    return this.monthlyPrograms.filter(p => p.sectionId === sectionId);
  }

  public async saveMonthlyProgram(program: Partial<MonthlyProgram>): Promise<MonthlyProgram> {
    const now = new Date().toISOString();
    const progId = program.id || ('prog_' + (program.sectionId || 'sec') + '_' + Date.now());

    const payload: MonthlyProgram = {
      id: progId,
      sectionId: program.sectionId || 'ashbal',
      month: program.month || 11,
      year: program.year || 2026,
      status: program.status || 'draft',
      activities: program.activities || [],
      notes: program.notes || '',
      createdAt: now,
      submittedAt: program.status === 'submitted' ? now : undefined
    };

    try {
      await setDoc(doc(db, 'monthly_programs', progId), cleanFirestoreData(payload));
      await this.logAction('حفظ برنامج شهري', 'برنامج شهري', progId, `برنامج شهر ${payload.month}/${payload.year}`);
      return payload;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `monthly_programs/${progId}`);
    }
  }

  // --- Activity Outputs (مخرجات الأنشطة) ---
  public getActivityOutputs(): ActivityOutput[] {
    return this.activityOutputs;
  }

  public getOutputsForSection(sectionId: string): ActivityOutput[] {
    return this.activityOutputs.filter(o => o.sectionId === sectionId);
  }

  public async addActivityOutput(output: Omit<ActivityOutput, 'id' | 'createdAt'>): Promise<ActivityOutput> {
    const outId = 'out_' + Date.now();
    const payload: ActivityOutput = {
      ...output,
      id: outId,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'activity_outputs', outId), payload);

      if (output.awardedBadges && output.awardedBadges.length > 0) {
        for (const b of output.awardedBadges) {
          await this.awardBadge(b.memberId, b.badgeName);
        }
      }

      await this.logAction('نشر مخرجات نشاط', 'مخرجات النشاط', outId, `مخرجات: ${payload.title}`);
      return payload;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `activity_outputs/${outId}`);
    }
  }

  // --- Subscriptions (الاشتراكات) ---
  public getSubscriptions(): SubscriptionRecord[] {
    return this.subscriptions;
  }

  public getSubscriptionsForMember(memberId: string): SubscriptionRecord[] {
    return this.subscriptions.filter(s => s.memberId === memberId);
  }

  public getSubscriptionsForSection(sectionId: string): SubscriptionRecord[] {
    return this.subscriptions.filter(s => s.sectionId === sectionId);
  }

  public async recordPayment(subId: string, paymentMethod: string, notes?: string) {
    try {
      await updateDoc(doc(db, 'subscriptions', subId), {
        isPaid: true,
        paidAt: new Date().toISOString(),
        paymentMethod,
        notes: notes || ''
      });
      await this.logAction('تسجيل استخلاص اشتراك', 'اشتراك كشفي', subId, `خلاص اشتراك - الطريقة: ${paymentMethod}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `subscriptions/${subId}`);
    }
  }

  // --- Announcements (أخبار الفوج) ---
  public getAnnouncements(sectionId?: string): TroopAnnouncement[] {
    if (!sectionId || sectionId === 'all') return this.announcements;
    return this.announcements.filter(a => a.targetSection === 'all' || a.targetSection === sectionId);
  }

  public async addAnnouncement(announcement: Omit<TroopAnnouncement, 'id' | 'createdAt'>): Promise<TroopAnnouncement> {
    const ancId = 'anc_' + Date.now();
    const payload: TroopAnnouncement = {
      ...announcement,
      id: ancId,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'announcements', ancId), payload);
      await this.logAction('نشر بلاغ كشفي', 'إعلان الفوج', ancId, `بلاغ: ${payload.title}`);
      return payload;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `announcements/${ancId}`);
    }
  }

  // --- Messages (المراسلات) ---
  public getMessages(): ScoutMessage[] {
    return this.messages;
  }

  public getMessagesForUser(userId: string, role: string, sectionId?: string): ScoutMessage[] {
    if (role === 'troop_leader') return this.messages;
    if (role === 'section_leader') {
      return this.messages.filter(m => (m.recipientType === 'section_leader' && m.sectionId === sectionId) || m.senderId === userId);
    }
    return this.messages.filter(m => m.senderId === userId);
  }

  public async sendMessage(msg: Omit<ScoutMessage, 'id' | 'status' | 'createdAt'>): Promise<ScoutMessage> {
    const msgId = 'msg_' + Date.now();
    const payload: ScoutMessage = {
      ...msg,
      id: msgId,
      status: 'unread',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'messages', msgId), payload);
      await this.logAction('إرسال رسالة', 'مراسلة', msgId, `من: ${payload.senderName}`);
      return payload;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `messages/${msgId}`);
    }
  }

  public async replyToMessage(messageId: string, replyContent: string) {
    const user = this.getUserFromAuth();
    try {
      await updateDoc(doc(db, 'messages', messageId), {
        reply: replyContent,
        repliedAt: new Date().toISOString(),
        repliedByName: user.name,
        status: 'replied'
      });
      await this.logAction('الرد على رسالة', 'مراسلة', messageId, `الرد من: ${user.name}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `messages/${messageId}`);
    }
  }

  // --- Leaders Management (قادة الفرق) ---
  public getLeaders(): UserProfile[] {
    return this.users.filter(u => u.role === 'section_leader');
  }

  public async toggleLeaderStatus(uid: string) {
    const ldr = this.users.find(u => u.uid === uid);
    if (!ldr) return;

    try {
      await updateDoc(doc(db, 'users', uid), { isActive: !ldr.isActive });
      await this.logAction(ldr.isActive ? 'تعطيل قائد فرقة' : 'تفعيل قائد فرقة', 'مستخدم', uid, `القائد: ${ldr.name}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    }
  }

  public async addLeader(leader: Omit<UserProfile, 'uid' | 'role' | 'isActive' | 'createdAt'>): Promise<UserProfile> {
    const uid = 'ldr_' + Date.now();
    const payload: UserProfile = {
      ...leader,
      uid,
      role: 'section_leader',
      isActive: true,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'users', uid), payload);
      await this.logAction('إنشاء حساب قائد فرقة', 'مستخدم', uid, `القائد: ${payload.name} بفرقة ${payload.sectionId}`);
      return payload;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${uid}`);
    }
  }

  public getAssignedLeaders(): AssignedLeader[] {
    return this.assignedLeaders;
  }

  public async assignSectionLeaderByEmail(email: string, name: string, sectionId: string): Promise<AssignedLeader> {
    const user = this.getUserFromAuth();
    if (user.role !== 'troop_leader') {
      throw new Error('فقط قائد الفوج مخول بإسناد قيادة الفرق عبر البريد الإلكتروني.');
    }

    const cleanEmail = email.toLowerCase().trim();
    const payload: AssignedLeader = {
      email: cleanEmail,
      name: name.trim(),
      sectionId,
      assignedAt: new Date().toISOString(),
      assignedBy: user.name,
      isActive: true
    };

    try {
      await setDoc(doc(db, 'assigned_leaders', cleanEmail), payload);
      await this.logAction('إسناد قيادة فرقة بالبريد', 'قائد فرقة', cleanEmail, `إسناد ${cleanEmail} لقيادة فرقة ${sectionId}`);
      return payload;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `assigned_leaders/${cleanEmail}`);
    }
  }

  public async toggleAssignedLeaderStatus(email: string) {
    const cleanEmail = email.toLowerCase().trim();
    const existing = this.assignedLeaders.find(l => l.email === cleanEmail);
    if (!existing) return;

    try {
      await updateDoc(doc(db, 'assigned_leaders', cleanEmail), { isActive: !existing.isActive });
      await this.logAction(
        existing.isActive ? 'تعطيل قائد فرقة' : 'تفعيل قائد فرقة',
        'قائد فرقة',
        cleanEmail,
        `الحالة الجديدة: ${!existing.isActive ? 'مفعل' : 'معطل'}`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `assigned_leaders/${cleanEmail}`);
    }
  }

  public async removeAssignedLeader(email: string) {
    const cleanEmail = email.toLowerCase().trim();
    try {
      await deleteDoc(doc(db, 'assigned_leaders', cleanEmail));
      await this.logAction('إلغاء إسناد قائد فرقة', 'قائد فرقة', cleanEmail, `حذف إسناد ${cleanEmail}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `assigned_leaders/${cleanEmail}`);
    }
  }

  public getAuditLogs(): AuditLogItem[] {
    return this.auditLogs;
  }

  public async seedInitialFirestoreData() {
    const user = this.getUserFromAuth();
    if (user.role !== 'troop_leader') return;

    // Inaugural announcement
    await this.addAnnouncement({
      title: 'افتتاح الموسم الكشفي الجديد لفوج الطيب المهيري بتطاوين 2026-2027',
      content: 'تحية كشفية عطرة لجميع الأولياء والفتيان والفتيات، يسعد قيادة فوج الطيب المهيري بتطاوين إطلاق المنظومة الإلكترونية الجديدة. نرجو من الأولياء تسجيل أبنائهم ومتابعة المذكرات الأسبوعية ومخرجات الأنشطة.',
      targetSection: 'all',
      authorName: user.name,
      priority: 'urgent'
    });

    // Create an approved model technical note for leaders to reference
    await this.saveTechnicalNote({
      title: 'مغامرة واحة قطوفة واستكشاف الطبيعة الصحراوية',
      educationalDomain: 'scout_method',
      scoutStage: 'أشبال',
      targetGroup: 'سداسيات فرقة الأشبال',
      suggestedCount: 16,
      actualCount: 16,
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      location: 'واحة قطوفة - تطاوين',
      durationMinutes: 90,
      generalObjective: 'ترسيخ مهارات حياة الخلاء واستكشاف البيئة المحلية وتنمية روح العمل الجماعي.',
      specificObjectives: [
        'يكون كل كشاف قادرًا على إتقان عقدتي الوتدية والمربعة لربط العصي',
        'يكون كل كشاف قادرًا على التعرف على نباتات طبية صحراوية بجهة تطاوين'
      ],
      materials: [
        { item: 'حبال كشفية تدريبية', quantity: '10 حبال', provider: 'الفوج' },
        { item: 'قارورة ماء وقبعة شخصية', quantity: '1 لكل كشاف', provider: 'المنضو' }
      ],
      stages: [
        { id: '1', stageType: 'التهيئة / البداية', description: 'تجمع السداسيات وتحية العلم وصيحة الفوج', leaderRole: 'افتتاح النشاط وبث الحماس', durationMinutes: 15 },
        { id: '2', stageType: 'صلب الموضوع / التطبيق', description: 'محطات تناوب لتعلم العقد وتوثيق العينات', leaderRole: 'التوجيه العملي والمتابعة', durationMinutes: 60 },
        { id: '3', stageType: 'الخاتمة / التقييم', description: 'تقييم السداسيات وتنظيف المكان والدعاء الكشفي', leaderRole: 'التقييم وتسليم الأشبال للأولياء', durationMinutes: 15 }
      ],
      successIndicators: 'إتقان 85% من الأشبال للمهارة وتطبيق مبدأ المحافظة على البيئة.',
      badges: ['شارة ريادة الخلاء والعقد', 'شارة حامي البيئة والطبيعة'],
      status: 'approved',
      sectionId: 'ashbal',
      approvedAt: new Date().toISOString(),
      approvedBy: `${user.name} (قائد الفوج)`
    });

    await this.logAction('تهيئة الفوج الأولى', 'فوج كشفي', 'tataouine_mhiri', 'إدراج البيانات التأسيسية للموسم الكشفي');
  }
}

export const scoutService = new FirestoreScoutService();
