import { createClient } from '@supabase/supabase-js';

// Environment variables or fallback
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ============================================================================
// SEEDED DEMO DATA (Compliant with the 9-table schema and IIITD Hackathon context)
// ============================================================================

const SEED_PROFILES = [
  {
    id: 'user-rohit-34',
    full_name: 'Rohit Sharma',
    phone: '+91 98765 43210',
    preferred_language: 'hinglish',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'user-sunita-62',
    full_name: 'Sunita Devi',
    phone: '+91 98111 22334',
    preferred_language: 'hi',
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

const SEED_MEMBERS = [
  {
    id: 'mem-101',
    account_owner_id: 'user-rohit-34',
    full_name: 'Ramesh Sharma',
    relationship: 'father',
    date_of_birth: '1958-05-14',
    gender: 'Male',
    blood_group: 'B+',
    allergies: 'Penicillin, Dust',
    existing_conditions: 'Diabetes, Blood pressure, Mild arthritis',
    current_medications: 'Metformin 500mg, Telmisartan 40mg',
    medical_notes: 'Walks with a stick. Gets tired quickly on stairs.',
    emergency_contact_name: 'Rohit Sharma (Son)',
    emergency_contact_phone: '+91 98765 43210',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mem-102',
    account_owner_id: 'user-rohit-34',
    full_name: 'Kamla Sharma',
    relationship: 'mother',
    date_of_birth: '1962-11-20',
    gender: 'Female',
    blood_group: 'O+',
    allergies: 'None known',
    existing_conditions: 'Asthma / breathing problem, High cholesterol',
    current_medications: 'Inhaler as needed, Atorvastatin',
    medical_notes: 'Weather changes trigger wheezing.',
    emergency_contact_name: 'Rohit Sharma',
    emergency_contact_phone: '+91 98765 43210',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mem-103',
    account_owner_id: 'user-rohit-34',
    full_name: 'Rohit Sharma',
    relationship: 'self',
    date_of_birth: '1992-03-15',
    gender: 'Male',
    blood_group: 'B+',
    allergies: 'No known allergies',
    existing_conditions: 'None',
    current_medications: 'None',
    medical_notes: 'Primary account manager.',
    emergency_contact_name: 'Priya Sharma (Wife)',
    emergency_contact_phone: '+91 98765 99999',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mem-104',
    account_owner_id: 'user-rohit-34',
    full_name: 'Aarav Sharma',
    relationship: 'child',
    date_of_birth: '2020-08-04',
    gender: 'Male',
    blood_group: 'O+',
    allergies: 'Peanuts, Pollen',
    existing_conditions: 'None',
    current_medications: 'Pediatric vitamins',
    medical_notes: 'Vaccinations up to date.',
    emergency_contact_name: 'Rohit Sharma',
    emergency_contact_phone: '+91 98765 43210',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const SEED_CAREGIVERS = [
  {
    id: 'cg-uuid-014',
    caregiver_code: 'CG_014',
    full_name: 'Anjali Verma, RN',
    phone: '+91 98100 11223',
    care_types: ['nurse', 'paramedic_home_visit'],
    languages: ['Hindi', 'English', 'Hinglish'],
    latitude: 28.545,
    longitude: 77.272,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'cg-uuid-008',
    caregiver_code: 'CG_008',
    full_name: 'Rajesh Kumar, EMT-P',
    phone: '+91 98111 88776',
    care_types: ['paramedic_home_visit', 'nurse'],
    languages: ['Hindi', 'Hinglish'],
    latitude: 28.538,
    longitude: 77.265,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'cg-uuid-021',
    caregiver_code: 'CG_021',
    full_name: 'Dr. Vikram Sen, MBBS',
    phone: '+91 98700 55443',
    care_types: ['gp_teleconsult'],
    languages: ['Hindi', 'English'],
    latitude: 28.550,
    longitude: 77.280,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'cg-uuid-035',
    caregiver_code: 'CG_035',
    full_name: 'Dr. Meera Nambiar, MD',
    phone: '+91 99100 44332',
    care_types: ['specialist'],
    languages: ['English', 'Hindi'],
    latitude: 28.560,
    longitude: 77.250,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'cg-uuid-001',
    caregiver_code: 'CG_001',
    full_name: 'Delhi Rapid Care Response',
    phone: '112',
    care_types: ['emergency_referral', 'paramedic_home_visit'],
    languages: ['Hindi', 'English'],
    latitude: 28.549,
    longitude: 77.269,
    is_active: true,
    created_at: new Date().toISOString()
  }
];

export const SEED_AVAILABILITY = [
  {
    id: 'slot-1',
    caregiver_id: 'cg-uuid-014',
    start_time: new Date(Date.now() + 45 * 60000).toISOString(),
    end_time: new Date(Date.now() + 105 * 60000).toISOString(),
    status: 'available',
    created_at: new Date().toISOString()
  },
  {
    id: 'slot-2',
    caregiver_id: 'cg-uuid-014',
    start_time: new Date(Date.now() + 180 * 60000).toISOString(),
    end_time: new Date(Date.now() + 240 * 60000).toISOString(),
    status: 'available',
    created_at: new Date().toISOString()
  },
  {
    id: 'slot-3',
    caregiver_id: 'cg-uuid-008',
    start_time: new Date(Date.now() + 60 * 60000).toISOString(),
    end_time: new Date(Date.now() + 120 * 60000).toISOString(),
    status: 'available',
    created_at: new Date().toISOString()
  },
  {
    id: 'slot-4',
    caregiver_id: 'cg-uuid-021',
    start_time: new Date(Date.now() + 30 * 60000).toISOString(),
    end_time: new Date(Date.now() + 60 * 60000).toISOString(),
    status: 'available',
    created_at: new Date().toISOString()
  },
  {
    id: 'slot-5',
    caregiver_id: 'cg-uuid-035',
    start_time: new Date(Date.now() + 120 * 60000).toISOString(),
    end_time: new Date(Date.now() + 180 * 60000).toISOString(),
    status: 'available',
    created_at: new Date().toISOString()
  }
];

// Seeded triage history to showcase the `/history` screen immediately
const SEED_HISTORY = [
  {
    id: 'sess-seed-1',
    user_id: 'user-rohit-34',
    user_input: 'Papa ko subah se mild dizziness ho rahi hai aur BP 145 hai',
    detected_language: 'hinglish',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    status: 'completed',
    decision: {
      care_type: 'nurse',
      urgency: 'same_day',
      reasoning: 'Mild dizziness with slightly elevated BP. In-person vitals check and caregiver assessment advised.',
      red_flags: []
    },
    booking: {
      id: 'book-seed-1',
      caregiver_id: 'cg-uuid-014',
      caregiver_name: 'Anjali Verma, RN',
      scheduled_at: new Date(Date.now() - 5 * 86400000 + 7200000).toISOString(),
      status: 'completed'
    },
    patient_name: 'Ramesh Sharma'
  },
  {
    id: 'sess-seed-2',
    user_id: 'user-rohit-34',
    user_input: 'Papa needs blood sugar fasting test review',
    detected_language: 'en',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    status: 'completed',
    decision: {
      care_type: 'gp_teleconsult',
      urgency: 'routine',
      reasoning: 'Routine fasting lab review for ongoing diabetes management without acute symptoms.',
      red_flags: []
    },
    booking: {
      id: 'book-seed-2',
      caregiver_id: 'cg-uuid-021',
      caregiver_name: 'Dr. Vikram Sen, MBBS',
      scheduled_at: new Date(Date.now() - 14 * 86400000 + 3600000).toISOString(),
      status: 'completed'
    },
    patient_name: 'Ramesh Sharma'
  }
];

// ============================================================================
// LOCAL STORAGE ADAPTER (High-Fidelity Mock & Offline Store)
// ============================================================================

const STORAGE_KEYS = {
  CURRENT_USER: 'carecompass_current_user',
  MEMBERS: 'carecompass_members',
  BOOKINGS: 'carecompass_bookings',
  SESSIONS: 'carecompass_sessions',
  DECISIONS: 'carecompass_decisions',
  HISTORY: 'carecompass_history',
  AUDIT: 'carecompass_audit'
};

const getStorageItem = (key, defaultVal) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (err) {
    console.warn(`Error reading localStorage key "${key}":`, err);
    return defaultVal;
  }
};

const setStorageItem = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.warn(`Error writing localStorage key "${key}":`, err);
  }
};

// Initialize default storage data if missing
export const initLocalStorageData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
    setStorageItem(STORAGE_KEYS.MEMBERS, SEED_MEMBERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.HISTORY)) {
    setStorageItem(STORAGE_KEYS.HISTORY, SEED_HISTORY);
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    setStorageItem(STORAGE_KEYS.BOOKINGS, [SEED_HISTORY[0].booking, SEED_HISTORY[1].booking]);
  }
};

// ============================================================================
// DATA API (Unified abstraction for Supabase + Local Demo Engine)
// ============================================================================

export const dataService = {
  // --- AUTH & PROFILES ---
  getCurrentUser() {
    const stored = getStorageItem(STORAGE_KEYS.CURRENT_USER, null);
    if (stored) return stored;
    // Default demo user: Rohit Sharma
    const defaultUser = SEED_PROFILES[0];
    setStorageItem(STORAGE_KEYS.CURRENT_USER, defaultUser);
    return defaultUser;
  },

  setCurrentUser(user) {
    setStorageItem(STORAGE_KEYS.CURRENT_USER, user);
  },

  signInDemo(personaId = 'rohit') {
    const profile = personaId === 'sunita' ? SEED_PROFILES[1] : SEED_PROFILES[0];
    this.setCurrentUser(profile);
    return profile;
  },

  signOut() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  // --- MEMBERS (Family profiles) ---
  async getMembers(userId) {
    const currentUserId = userId || this.getCurrentUser()?.id;
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase getMembers fallback to local:', e);
      }
    }
    const all = getStorageItem(STORAGE_KEYS.MEMBERS, SEED_MEMBERS);
    return all.filter(m => !currentUserId || m.account_owner_id === currentUserId);
  },

  async getMemberById(id) {
    const members = await this.getMembers();
    return members.find(m => m.id === id) || null;
  },

  async saveMember(memberData) {
    const currentUser = this.getCurrentUser();
    const ownerId = currentUser ? currentUser.id : 'user-rohit-34';
    
    const newMember = {
      id: memberData.id || `mem-${Date.now()}`,
      account_owner_id: ownerId,
      full_name: memberData.full_name || 'Family Member',
      relationship: memberData.relationship || 'other',
      date_of_birth: memberData.date_of_birth || null,
      gender: memberData.gender || 'Not specified',
      blood_group: memberData.blood_group || '',
      allergies: memberData.allergies || '',
      existing_conditions: memberData.existing_conditions || '',
      current_medications: memberData.current_medications || '',
      medical_notes: memberData.medical_notes || '',
      emergency_contact_name: memberData.emergency_contact_name || currentUser?.full_name || '',
      emergency_contact_phone: memberData.emergency_contact_phone || currentUser?.phone || '',
      created_at: memberData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('members').upsert([newMember]);
      } catch (err) {
        console.warn('Supabase upsert member error:', err);
      }
    }

    const currentMembers = getStorageItem(STORAGE_KEYS.MEMBERS, SEED_MEMBERS);
    const existingIndex = currentMembers.findIndex(m => m.id === newMember.id);
    let updated;
    if (existingIndex >= 0) {
      updated = [...currentMembers];
      updated[existingIndex] = newMember;
    } else {
      updated = [newMember, ...currentMembers];
    }
    setStorageItem(STORAGE_KEYS.MEMBERS, updated);
    return newMember;
  },

  async deleteMember(id) {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('members').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete member error:', err);
      }
    }
    const currentMembers = getStorageItem(STORAGE_KEYS.MEMBERS, SEED_MEMBERS);
    const updated = currentMembers.filter(m => m.id !== id);
    setStorageItem(STORAGE_KEYS.MEMBERS, updated);
    return true;
  },

  // --- CAREGIVERS & AVAILABILITY ---
  async getCaregivers() {
    return SEED_CAREGIVERS;
  },

  async getAvailability(caregiverId) {
    return SEED_AVAILABILITY.filter(a => a.caregiver_id === caregiverId && a.status === 'available');
  },

  // --- BOOKINGS ---
  async createBooking({ sessionId, caregiverId, availabilityId, scheduledAt, patientName }) {
    const currentUser = this.getCurrentUser();
    const cg = SEED_CAREGIVERS.find(c => c.id === caregiverId) || SEED_CAREGIVERS[0];
    
    const newBooking = {
      id: `bk-${Date.now().toString(36)}`,
      session_id: sessionId || `sess-${Date.now()}`,
      caregiver_id: caregiverId,
      caregiver_name: cg.full_name,
      caregiver_phone: cg.phone,
      availability_id: availabilityId || null,
      user_id: currentUser ? currentUser.id : null,
      patient_name: patientName || 'Patient',
      status: 'confirmed',
      scheduled_at: scheduledAt || new Date(Date.now() + 60 * 60000).toISOString(),
      created_at: new Date().toISOString()
    };

    const bookings = getStorageItem(STORAGE_KEYS.BOOKINGS, []);
    setStorageItem(STORAGE_KEYS.BOOKINGS, [newBooking, ...bookings]);

    // Record decision audit
    this.recordAudit(newBooking.session_id, 'booking_created', { booking_id: newBooking.id });

    return newBooking;
  },

  async getBookings() {
    return getStorageItem(STORAGE_KEYS.BOOKINGS, []);
  },

  async getBookingById(bookingId) {
    const list = getStorageItem(STORAGE_KEYS.BOOKINGS, []);
    return list.find(b => b.id === bookingId) || null;
  },

  async updateBookingStatus(bookingId, status) {
    const list = getStorageItem(STORAGE_KEYS.BOOKINGS, []);
    const updated = list.map(b => b.id === bookingId ? { ...b, status } : b);
    setStorageItem(STORAGE_KEYS.BOOKINGS, updated);
    return updated.find(b => b.id === bookingId);
  },

  // --- HISTORY & SESSIONS ---
  async getHistory() {
    return getStorageItem(STORAGE_KEYS.HISTORY, SEED_HISTORY);
  },

  async addHistoryItem(item) {
    const list = getStorageItem(STORAGE_KEYS.HISTORY, SEED_HISTORY);
    const updated = [item, ...list];
    setStorageItem(STORAGE_KEYS.HISTORY, updated);
    return item;
  },

  // --- AUDIT LOGS ---
  recordAudit(sessionId, eventType, details = {}) {
    const audits = getStorageItem(STORAGE_KEYS.AUDIT, []);
    const newEntry = {
      id: `audit-${Date.now()}`,
      session_id: sessionId,
      event_type: eventType,
      details,
      created_at: new Date().toISOString()
    };
    setStorageItem(STORAGE_KEYS.AUDIT, [newEntry, ...audits]);
  },

  // --- DPDP 2023: Full Data Wipe ---
  async wipeAllUserData() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.MEMBERS);
    localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.DECISIONS);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    localStorage.removeItem(STORAGE_KEYS.AUDIT);
    return true;
  }
};
