export interface FakeDataConfig {
  enabled: boolean;
  entriesCount: number;
  medicinesCount: number;
  daysBack: number;
}

export const FAKE_MEDICINES = [
  { id: 1, name: 'Caffeine', dose: 100, created_at: '2025-09-20 08:00:00' },
  { id: 2, name: 'Vitamin D', dose: 2000, created_at: '2025-09-20 08:30:00' },
  { id: 3, name: 'Omega-3', dose: 1000, created_at: '2025-09-20 09:00:00' },
  { id: 4, name: 'Magnesium', dose: 400, created_at: '2025-09-20 21:00:00' },
  { id: 5, name: 'B-Complex', dose: 1, created_at: '2025-09-20 08:15:00' },
];

export const FAKE_ENTRIES = [
  { id: 1, text: 'Morning workout completed', completed: true, created_at: '2025-09-20 07:00:00' },
  { id: 2, text: 'Review quarterly goals', completed: false, created_at: '2025-09-20 10:00:00' },
  { id: 3, text: 'Call dentist for appointment', completed: true, created_at: '2025-09-20 14:30:00' },
  { id: 4, text: 'Read 30 minutes before bed', completed: false, created_at: '2025-09-20 22:00:00' },
  { id: 5, text: 'Meal prep for tomorrow', completed: true, created_at: '2025-09-20 18:00:00' },
];

const MEDICINE_NAMES = ['Caffeine', 'Vitamin D', 'Omega-3', 'Magnesium', 'B-Complex', 'Zinc', 'Iron', 'Creatine', 'Water'];
const ENTRY_TEMPLATES = [
  'Morning workout completed',
  'Review project documentation',
  'Call dentist for appointment', 
  'Read for 30 minutes',
  'Meal prep for tomorrow',
  'Walk in the park',
  'Finish weekly report',
  'Organize workspace',
  'Practice meditation',
  'Check financial goals',
];

export const generateFakeMedicines = (config: FakeDataConfig) => {
  const medicines = [];
  // Use a fixed current date for consistent fake data generation
  const now = new Date('2025-09-24T12:00:00Z');
  
  for (let i = 0; i < config.daysBack; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate 2-5 medicine entries per day
    const entriesPerDay = Math.floor(Math.random() * 4) + 2;
    
    for (let j = 0; j < entriesPerDay; j++) {
      const hour = 7 + Math.floor(Math.random() * 14); // 7 AM - 9 PM
      const minute = Math.floor(Math.random() * 60);
      const entryDate = new Date(date);
      entryDate.setHours(hour, minute, 0, 0);
      
      const medicine = MEDICINE_NAMES[Math.floor(Math.random() * MEDICINE_NAMES.length)];
      const baseDose = medicine === 'Caffeine' ? 100 : 
                     medicine === 'Vitamin D' ? 2000 :
                     medicine === 'Omega-3' ? 1000 :
                     medicine === 'Magnesium' ? 400 : 1;
      
      const variation = baseDose * 0.2; // ±20% variation
      const dose = Math.max(1, Math.round(baseDose + (Math.random() - 0.5) * 2 * variation));
      
      medicines.push({
        id: medicines.length + 1,
        name: medicine,
        dose,
        created_at: entryDate.toLocaleDateString()
      });
    }
  }
  
  return medicines.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const generateFakeEntries = (config: FakeDataConfig) => {
  const entries = [];
  // Use a fixed current date for consistent fake data generation
  const now = new Date('2025-09-24T12:00:00Z');
  
  for (let i = 0; i < config.daysBack; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate 1-4 task entries per day
    const entriesPerDay = Math.floor(Math.random() * 4) + 1;
    
    for (let j = 0; j < entriesPerDay; j++) {
      const hour = 8 + Math.floor(Math.random() * 12); // 8 AM - 8 PM
      const minute = Math.floor(Math.random() * 60);
      const entryDate = new Date(date);
      entryDate.setHours(hour, minute, 0, 0);
      
      const text = ENTRY_TEMPLATES[Math.floor(Math.random() * ENTRY_TEMPLATES.length)];
      const completed = Math.random() > 0.3; // 70% completion rate
      
      entries.push({
        id: entries.length + 1,
        text,
        completed,
        completed_at: completed ? entryDate.toISOString() : undefined,
        created_at: entryDate.toLocaleDateString(),
        // displayTime: entryDate.toLocaleTimeString('en-US', { 
        //   hour: 'numeric', 
        //   minute: '2-digit',
        //   hour12: true 
        // })
      });
    }
  }
  
  return entries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const generateDayTotals = (medicines: { created_at: string; dose: number }[]) => {
  // Create totals map for existing data
  const totals = new Map<string, number>();

  medicines.forEach(medicine => {
    const day = new Date(medicine.created_at).toDateString();
    totals.set(day, (totals.get(day) || 0) + medicine.dose);
  });

  // Generate exactly 10 datapoints for the last 10 days
  const result = [];
  const now = new Date('2025-09-24T12:00:00Z');

  for (let i = 9; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayString = date.toDateString();
    const total = totals.get(dayString) || 0;

    result.push({
      day: date.getDate(),
      total
    });
  }

  return result;
};

export const FAKE_DATA_CONFIG: FakeDataConfig = {
  enabled: process.env.NODE_ENV === 'development',
  entriesCount: 100,
  medicinesCount: 50,
  daysBack: 14
};
