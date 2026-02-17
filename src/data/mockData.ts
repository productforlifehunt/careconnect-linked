export interface Caregiver {
  id: string;
  name: string;
  avatar: string;
  specialty: string[];
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  experience: number;
  location: string;
  coordinates: { lat: number; lng: number };
  bio: string;
  verified: boolean;
  availability: string[];
  languages: string[];
  certifications: string[];
  responseTime: string;
  backgroundCheck: boolean;
}

export interface Booking {
  id: string;
  caregiverId: string;
  caregiverName: string;
  date: string;
  time: string;
  duration: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  type: string;
  notes: string;
  total: number;
}

export interface CareCircleMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: "online" | "offline";
  lastActive: string;
}

export interface CareTask {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  category: string;
}

export interface JournalEntry {
  id: string;
  author: string;
  date: string;
  content: string;
  type: "update" | "milestone" | "note";
}

export const caregivers: Caregiver[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
    specialty: ["Elder Care", "Dementia Care", "Companionship"],
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: 28,
    experience: 8,
    location: "Brooklyn, NY",
    coordinates: { lat: 40.6782, lng: -73.9442 },
    bio: "Compassionate caregiver with 8 years of experience specializing in elder care and dementia support. I believe in maintaining dignity and joy in every interaction.",
    verified: true,
    availability: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    languages: ["English", "Spanish"],
    certifications: ["CNA", "CPR", "First Aid", "Alzheimer's Care"],
    responseTime: "Under 1 hour",
    backgroundCheck: true,
  },
  {
    id: "2",
    name: "Michael Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    specialty: ["Physical Therapy", "Post-Surgery Care", "Mobility Support"],
    rating: 4.8,
    reviewCount: 89,
    hourlyRate: 35,
    experience: 12,
    location: "Manhattan, NY",
    coordinates: { lat: 40.7831, lng: -73.9712 },
    bio: "Licensed physical therapy assistant with over a decade of experience. I help patients recover strength and independence after surgery or injury.",
    verified: true,
    availability: ["Mon", "Wed", "Fri", "Sat"],
    languages: ["English", "Mandarin"],
    certifications: ["PTA License", "CPR", "Post-Surgical Care"],
    responseTime: "Under 2 hours",
    backgroundCheck: true,
  },
  {
    id: "3",
    name: "Aisha Williams",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
    specialty: ["Child Care", "Special Needs", "Tutoring"],
    rating: 5.0,
    reviewCount: 203,
    hourlyRate: 25,
    experience: 6,
    location: "Queens, NY",
    coordinates: { lat: 40.7282, lng: -73.7949 },
    bio: "Experienced childcare provider with a background in special education. I create engaging, safe environments for children of all abilities.",
    verified: true,
    availability: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    languages: ["English", "French"],
    certifications: ["Child Development Associate", "CPR", "Special Ed Certificate"],
    responseTime: "Under 30 min",
    backgroundCheck: true,
  },
  {
    id: "4",
    name: "Robert Martinez",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    specialty: ["Elder Care", "Meal Preparation", "Transportation"],
    rating: 4.7,
    reviewCount: 64,
    hourlyRate: 22,
    experience: 4,
    location: "Bronx, NY",
    coordinates: { lat: 40.8448, lng: -73.8648 },
    bio: "Dedicated caregiver focused on daily living support. I provide meal preparation, transportation, and companionship for seniors.",
    verified: true,
    availability: ["Tue", "Thu", "Sat", "Sun"],
    languages: ["English", "Spanish"],
    certifications: ["Home Health Aide", "CPR", "Food Safety"],
    responseTime: "Under 3 hours",
    backgroundCheck: true,
  },
  {
    id: "5",
    name: "Emily Park",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    specialty: ["Nursing Care", "Medication Management", "Wound Care"],
    rating: 4.9,
    reviewCount: 156,
    hourlyRate: 42,
    experience: 15,
    location: "Staten Island, NY",
    coordinates: { lat: 40.5795, lng: -74.1502 },
    bio: "Registered nurse with 15 years of clinical and home care experience. I provide skilled nursing services with a gentle, patient approach.",
    verified: true,
    availability: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    languages: ["English", "Korean"],
    certifications: ["RN License", "BSN", "IV Certification", "Wound Care"],
    responseTime: "Under 1 hour",
    backgroundCheck: true,
  },
  {
    id: "6",
    name: "James Thompson",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    specialty: ["Respite Care", "Overnight Care", "Palliative Support"],
    rating: 4.8,
    reviewCount: 92,
    hourlyRate: 30,
    experience: 10,
    location: "Hoboken, NJ",
    coordinates: { lat: 40.744, lng: -74.0324 },
    bio: "Providing compassionate respite and overnight care for families. I understand the importance of giving primary caregivers a well-deserved break.",
    verified: true,
    availability: ["Mon", "Tue", "Wed", "Fri", "Sat", "Sun"],
    languages: ["English"],
    certifications: ["CNA", "Hospice Care", "CPR", "First Aid"],
    responseTime: "Under 2 hours",
    backgroundCheck: true,
  },
];

export const sampleBookings: Booking[] = [
  {
    id: "b1",
    caregiverId: "1",
    caregiverName: "Sarah Johnson",
    date: "2026-02-20",
    time: "09:00 AM",
    duration: 4,
    status: "confirmed",
    type: "Elder Care",
    notes: "Mom needs help with morning routine and medication",
    total: 112,
  },
  {
    id: "b2",
    caregiverId: "3",
    caregiverName: "Aisha Williams",
    date: "2026-02-22",
    time: "02:00 PM",
    duration: 3,
    status: "pending",
    type: "Child Care",
    notes: "After school care for two kids",
    total: 75,
  },
  {
    id: "b3",
    caregiverId: "5",
    caregiverName: "Emily Park",
    date: "2026-02-18",
    time: "10:00 AM",
    duration: 2,
    status: "completed",
    type: "Nursing Care",
    notes: "Wound care follow-up",
    total: 84,
  },
];

export const careCircleMembers: CareCircleMember[] = [
  { id: "m1", name: "You", role: "Primary Caregiver", avatar: "", status: "online", lastActive: "Now" },
  { id: "m2", name: "David Smith", role: "Son", avatar: "", status: "online", lastActive: "5 min ago" },
  { id: "m3", name: "Lisa Smith", role: "Daughter", avatar: "", status: "offline", lastActive: "2 hours ago" },
  { id: "m4", name: "Dr. Rachel Green", role: "Doctor", avatar: "", status: "offline", lastActive: "1 day ago" },
  { id: "m5", name: "Sarah Johnson", role: "Hired Caregiver", avatar: "", status: "online", lastActive: "10 min ago" },
];

export const careTasks: CareTask[] = [
  { id: "t1", title: "Pick up prescription from CVS", assignee: "David Smith", dueDate: "2026-02-18", status: "pending", priority: "high", category: "Medical" },
  { id: "t2", title: "Schedule dentist appointment", assignee: "Lisa Smith", dueDate: "2026-02-20", status: "in-progress", priority: "medium", category: "Medical" },
  { id: "t3", title: "Grocery shopping - weekly list", assignee: "You", dueDate: "2026-02-19", status: "pending", priority: "medium", category: "Daily Living" },
  { id: "t4", title: "Physical therapy session", assignee: "Sarah Johnson", dueDate: "2026-02-21", status: "pending", priority: "high", category: "Medical" },
  { id: "t5", title: "Update insurance paperwork", assignee: "David Smith", dueDate: "2026-02-25", status: "completed", priority: "low", category: "Administrative" },
];

export const journalEntries: JournalEntry[] = [
  { id: "j1", author: "You", date: "2026-02-17", content: "Mom had a great day today. She was more alert and engaged during our morning walk. She remembered the name of her neighbor's dog!", type: "update" },
  { id: "j2", author: "Sarah Johnson", date: "2026-02-16", content: "Assisted with physical therapy exercises. She completed all 3 sets today - great progress! Blood pressure was 128/82.", type: "note" },
  { id: "j3", author: "Dr. Rachel Green", date: "2026-02-15", content: "Adjusted medication dosage. New prescription should be picked up by Friday. Monitor for any side effects.", type: "milestone" },
  { id: "j4", author: "Lisa Smith", date: "2026-02-14", content: "Visited Mom this afternoon. We looked through old photo albums together. She seemed very happy and nostalgic.", type: "update" },
];

export const careCategories = [
  { name: "Elder Care", icon: "heart", count: 248 },
  { name: "Child Care", icon: "baby", count: 412 },
  { name: "Special Needs", icon: "accessibility", count: 156 },
  { name: "Nursing Care", icon: "stethoscope", count: 189 },
  { name: "Companionship", icon: "users", count: 320 },
  { name: "Respite Care", icon: "moon", count: 97 },
];
