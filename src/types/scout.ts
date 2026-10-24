export type UserRole = 'parent' | 'section_leader' | 'troop_leader';

export interface AssignedLeader {
  email: string;
  name: string;
  sectionId: string;
  assignedAt: string;
  assignedBy: string;
  isActive: boolean;
}

export interface UserProfile {
  uid: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  sectionId?: string; // For section leaders
  isActive: boolean;
  createdAt: string;
}

export interface ScoutSectionInfo {
  id: string;
  name: string;
  stageName: string;
  ageRange: string;
  gender: 'ذكور' | 'إناث' | 'مختلط';
  color: string;
  bgLight: string;
  badge: string;
  description: string;
}

export const SCOUT_SECTIONS: ScoutSectionInfo[] = [
  {
    id: 'ashbal',
    name: 'فرقة الأشبال',
    stageName: 'أشبال',
    ageRange: '7 - 11 سنة',
    gender: 'ذكور',
    color: '#d97706', // Golden yellow
    bgLight: '#fef3c7',
    badge: '🦁',
    description: 'المرحلة الابتدائية - تربية في إطار شريعة الغاب والتضامن الكشفي'
  },
  {
    id: 'zaharat',
    name: 'فرقة الزهرات',
    stageName: 'زهرات',
    ageRange: '7 - 11 سنة',
    gender: 'إناث',
    color: '#0284c7', // Sky Blue
    bgLight: '#e0f2fe',
    badge: '🌸',
    description: 'المرحلة الابتدائية للفتيات - حديقة الزهرات والعطاء'
  },
  {
    id: 'kashafa',
    name: 'فرقة الكشافة (الفتيان)',
    stageName: 'كشافة',
    ageRange: '12 - 15 سنة',
    gender: 'ذكور',
    color: '#15803d', // Scout Forest Green
    bgLight: '#dcfce7',
    badge: '⚜️',
    description: 'المرحلة الإعدادية - نظام الطلائع والمغامرة وتحديات الخلاء'
  },
  {
    id: 'murshidat',
    name: 'فرقة المرشدات',
    stageName: 'مرشدات',
    ageRange: '12 - 15 سنة',
    gender: 'إناث',
    color: '#7c3aed', // Purple
    bgLight: '#f3e8ff',
    badge: '🌟',
    description: 'المرحلة الإعدادية للفتيات - القيادة والمهارات الحياتية والتطوع'
  },
  {
    id: 'mutaqaddim',
    name: 'فرقة الكشاف المتقدم',
    stageName: 'متقدم',
    ageRange: '15 - 18 سنة',
    gender: 'ذكور',
    color: '#b45309', // Rust Amber
    bgLight: '#ffedd5',
    badge: '🧭',
    description: 'المرحلة الثانوية - المشروعات الكبرى والريادة والمسؤولية المجتمعية'
  },
  {
    id: 'ruwwad',
    name: 'رهط الجوالة والرواد',
    stageName: 'رواد',
    ageRange: '18+ سنة',
    gender: 'مختلط',
    color: '#b91c1c', // Deep Crimson
    bgLight: '#fee2e2',
    badge: '🏕️',
    description: 'مرحلة الشباب والجامعة - خدمة وتنمية المجتمع وقيادة المبادرات'
  }
];

export function calculateAge(birthDateString: string): number {
  if (!birthDateString) return 0;
  const birth = new Date(birthDateString);
  if (isNaN(birth.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

export function determineScoutSection(birthDateString: string, gender: 'male' | 'female'): {
  sectionId: string;
  section: ScoutSectionInfo;
  age: number;
} {
  const age = calculateAge(birthDateString);
  let targetId = 'ashbal';

  if (gender === 'female') {
    if (age <= 11) {
      targetId = 'zaharat';
    } else if (age <= 15) {
      targetId = 'murshidat';
    } else if (age <= 18) {
      targetId = 'murshidat';
    } else {
      targetId = 'ruwwad';
    }
  } else {
    // male
    if (age <= 11) {
      targetId = 'ashbal';
    } else if (age <= 15) {
      targetId = 'kashafa';
    } else if (age <= 18) {
      targetId = 'mutaqaddim';
    } else {
      targetId = 'ruwwad';
    }
  }

  const section = SCOUT_SECTIONS.find(s => s.id === targetId) || SCOUT_SECTIONS[0];
  return {
    sectionId: targetId,
    section,
    age
  };
}


export interface EducationalDomainOption {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const EDUCATIONAL_DOMAINS: EducationalDomainOption[] = [
  { id: 'scout_method', name: 'المجال الكشفي', icon: '⚜️', description: 'حياة الخلاء، العقد والربطات، تقاليد الكشافة، نظام الطلائع' },
  { id: 'religious', name: 'المجال الديني / الروحي', icon: '🕌', description: 'القيم الأخلاقية، الصدق، الأمانة، والواجب نحو الله' },
  { id: 'physical', name: 'المجال البدني / الصحي', icon: '🏃', description: 'اللياقة البدنية، التغذية السليمة، السلامة والإسعافات' },
  { id: 'intellectual', name: 'المجال العقلي / العلمي', icon: '💡', description: 'حل المشكلات، الملاحظة، الابتكار، والتقنيات' },
  { id: 'social', name: 'المجال الاجتماعي / البيئي', icon: '🤝', description: 'خدمة المجتمع، حماية الطبيعة، العمل الجماعي والتواصل' },
  { id: 'emotional', name: 'المجال الانفعالي / النفسي', icon: '❤️', description: 'الثقة بالنفس، التعبير عن الذات، وضبط المشاعر' }
];

export interface ScoutBadgeOption {
  id: string;
  name: string;
  category: string;
  icon: string;
}

export const SCOUT_BADGES: ScoutBadgeOption[] = [
  { id: 'first_aid', name: 'شارة المسعف الكشفي', category: 'صحي وبدني', icon: '🩺' },
  { id: 'pioneering', name: 'شارة ريادة الخلاء والعقد', category: 'كشفي', icon: '🪵' },
  { id: 'environment', name: 'شارة حامي البيئة والطبيعة', category: 'بيئي', icon: '🌱' },
  { id: 'camp_cook', name: 'شارة الطاهي الماهر', category: 'حياتي', icon: '🍳' },
  { id: 'tracking', name: 'شارة المقتفي ورسم الخرائط', category: 'استكشاف', icon: '🗺️' },
  { id: 'morse', name: 'شارة الإشارات والاتصالات', category: 'اتصال', icon: '📡' },
  { id: 'fire_safety', name: 'شارة الإطفاء والسلامة', category: 'سلامة', icon: '🧯' },
  { id: 'digital_maker', name: 'شارة المبرمج والمبتكر', category: 'علمي', icon: '💻' },
  { id: 'astronomy', name: 'شارة الفلكي الصغير', category: 'علمي', icon: '🔭' },
  { id: 'journalist', name: 'شارة الصحفي الكشفي', category: 'إعلامي', icon: '📷' },
  { id: 'musician', name: 'شارة المنشد والموسيقي', category: 'فني', icon: '🎵' },
  { id: 'swimmer', name: 'شارة السباح والمنقذ', category: 'رياضي', icon: '🏊' },
  { id: 'good_citizen', name: 'شارة المواطنة الفاعلة', category: 'اجتماعي', icon: '🇹🇳' },
  { id: 'artisan', name: 'شارة الحرفي والفنون اليدوية', category: 'يدوي', icon: '🎨' }
];

export interface ScoutMember {
  id: string;
  parentId: string;
  parentName: string;
  fullName: string;
  birthDate: string;
  gender: 'male' | 'female';
  gradeSchool: string;
  address: string;
  phone1: string;
  phone2?: string;
  healthNotes?: string;
  photoUrl?: string;
  sectionId: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  badges: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface ActivityMaterial {
  item: string;
  quantity: string;
  provider: 'الفوج' | 'المنضو' | 'القائد';
}

export interface ActivityStage {
  id: string;
  stageType: 'التهيئة / البداية' | 'صلب الموضوع / التطبيق' | 'الخاتمة / التقييم';
  description: string;
  leaderRole: string;
  durationMinutes: number;
}

export type TechnicalNoteStatus = 'draft' | 'submitted' | 'approved' | 'change_requested' | 'rejected';

export interface TechnicalNote {
  id: string;
  title: string; // 1. الموضوع / عنوان النشاط
  educationalDomain: string; // 2. المجال التربوي
  scoutStage: string; // 3. المرحلة الكشفية
  targetGroup: string; // 4. الفئة المستهدفة
  suggestedCount: number;
  actualCount: number;
  date: string; // 5. التاريخ والزمان والمكان والمدة
  startTime: string;
  location: string;
  durationMinutes: number;
  generalObjective: string; // 6. الهدف التربوي العام
  specificObjectives: string[]; // الأهداف الخاصة: "يكون كل كشاف قادرًا على..."
  materials: ActivityMaterial[]; // 7. المستلزمات والأدوات
  stages: ActivityStage[]; // 8. مراحل النشاط
  successIndicators: string; // 9. مؤشرات النجاح
  badges: string[]; // 10. الشارات أو المهارات المرتبطة
  leaderId: string; // 11. القائد المشرف والإمضاء
  leaderName: string;
  leaderSignature?: string; // canvas signature image data
  status: TechnicalNoteStatus;
  sectionId: string;
  leaderFeedback?: string; // ملاحظة قائد الفوج عند طلب تعديل أو رفض
  feedbackField?: string; // الحقل المعني بالتعديل
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MonthlyActivityItem {
  weekNumber: number;
  date: string;
  title: string;
  educationalDomain: string;
  linkedTechnicalNoteId?: string;
}

export interface MonthlyProgram {
  id: string;
  sectionId: string;
  month: number;
  year: number;
  status: TechnicalNoteStatus;
  activities: MonthlyActivityItem[];
  notes?: string;
  createdAt: string;
  submittedAt?: string;
  approvedAt?: string;
  leaderFeedback?: string;
}

export interface ActivityOutput {
  id: string;
  technicalNoteId?: string;
  sectionId: string;
  title: string;
  date: string;
  summary: string;
  photos: string[];
  attendees: string[]; // member IDs
  awardedBadges: { memberId: string; badgeName: string }[];
  createdAt: string;
}

export interface SubscriptionRecord {
  id: string;
  memberId: string;
  memberName: string;
  sectionId: string;
  parentId: string;
  parentPhone: string;
  seasonYear: string;
  month: string;
  amount: number;
  isPaid: boolean;
  paidAt?: string;
  paymentMethod?: string;
  notes?: string;
}

export interface TroopAnnouncement {
  id: string;
  title: string;
  content: string;
  targetSection: string; // 'all' or sectionId
  authorName: string;
  priority: 'normal' | 'urgent';
  createdAt: string;
}

export interface ScoutMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientType: 'section_leader' | 'troop_leader';
  sectionId?: string;
  subject: string;
  content: string;
  reply?: string;
  repliedAt?: string;
  repliedByName?: string;
  status: 'unread' | 'replied';
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  performedBy: string;
  performedByName: string;
  role: string;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
}
