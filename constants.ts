
import { User, Question } from './types';

export const SECURITY_QUESTIONS = [
  "What is the name of your first school?",
  "In which city were you born?",
  "What is your mother's maiden name?",
  "What was the name of your first pet?",
  "What is the name of your favorite childhood teacher?"
];

export const EXAM_TOPICS = {
  'Biology': [
    'Cell Biology', 'Molecular Biology', 'Genetics', 'Ecology',
    'Evolution & Biodiversity', 'Human Physiology', 'Nucleic Acids',
    'Metabolism', 'Plant Biology', 'Microbiology', 'Animal Physiology'
  ],
  'Physics': [
    'Measurements & Uncertainties', 'Mechanics', 'Thermal Physics',
    'Waves', 'Electricity & Magnetism', 'Circular Motion & Gravitation',
    'Atomic, Nuclear & Particle Physics', 'Energy Production', 'Fields',
    'Electromagnetic Induction', 'Quantum Physics', 'Space Physics'
  ],
  'Chemistry': [
    'Stoichiometric Relationships', 'Atomic Structure', 'Periodicity',
    'Chemical Bonding & Structure', 'Energetics / Thermochemistry',
    'Chemical Kinetics', 'Equilibrium', 'Acids & Bases', 'Redox Processes',
    'Organic Chemistry', 'Measurement & Analysis', 'Environmental Chemistry'
  ]
};

export const DEFAULT_THEME = 'Cosmic';

// Only keep the master admin. Removed demo_teacher and demo_student.
// Password is hashed as 'Cosmic2025!' + 'newel_salt_2025' -> SHA256
export const DEMO_USERS: User[] = [
  {
    username: 'admin',
    // This is the hashed version of 'Cosmic2025!' used by the AuthModal
    password: '72e5050212002717019253507d9b972e2759e51c88191266e778732f79038753',
    role: 'admin',
    approved: true,
    securityQuestion: SECURITY_QUESTIONS[4],
    securityAnswer: 'newelacademy'
  }
];

// --- CORE SCIENCE QUESTION BANK ---
// (Maintained for platform functionality)

export const QUESTION_BANK: Record<string, Question[]> = {
  'Biology': [
    { id: 'cb_1', topic: 'Cell Structure', difficulty: 'IGCSE', type: 'MCQ', text: "Which structure is found in plant cells but not animal cells?", options: ["Mitochondria", "Nucleus", "Cell wall", "Cell membrane"], correctAnswer: "Cell wall" },
    { id: 'cb_2', topic: 'Cell Structure', difficulty: 'IGCSE', type: 'MCQ', text: "What is the function of the nucleus?", options: ["Protein synthesis", "Cellular respiration", "Contains genetic material", "Photosynthesis"], correctAnswer: "Contains genetic material" },
    { id: 'cb_3', topic: 'Cell Structure', difficulty: 'IGCSE', type: 'MCQ', text: "Which process requires energy from respiration?", options: ["Osmosis", "Diffusion", "Active transport", "All of the above"], correctAnswer: "Active transport" },
    { id: 'p_i_1', topic: 'General Physics', difficulty: 'IGCSE', type: 'MCQ', text: "Which quantity has both magnitude and direction?", options: ["Speed", "Distance", "Velocity", "Time"], correctAnswer: "Velocity" },
    { id: 'c_i_1', topic: 'Chemistry', difficulty: 'IGCSE', type: 'MCQ', text: "Subatomic particle positive charge?", options: ["Electron", "Neutron", "Proton", "Photon"], correctAnswer: "Proton" }
  ],
  'Physics': [
    { id: 'p_i_1', topic: 'Physics', difficulty: 'IGCSE', type: 'MCQ', text: "Unit of Force?", options: ["Watt", "Newton", "Joule", "Pascal"], correctAnswer: "Newton" },
    { id: 'p_as_1', topic: 'Physics', difficulty: 'AS', type: 'MCQ', text: "Area under a velocity-time graph represents?", options: ["Acceleration", "Force", "Displacement", "Jerk"], correctAnswer: "Displacement" }
  ],
  'Chemistry': [
    { id: 'c_i_1', topic: 'Chemistry', difficulty: 'IGCSE', type: 'MCQ', text: "Formula for Sodium Chloride?", options: ["NaCl2", "Na2Cl", "NaCl", "Na3Cl"], correctAnswer: "NaCl" },
    { id: 'c_as_1', topic: 'Chemistry', difficulty: 'AS', type: 'MCQ', text: "The oxidation state of Manganese in KMnO4 is?", options: ["+2", "+4", "+6", "+7"], correctAnswer: "+7" }
  ]
};

export const IGCSE_CELL_BIO_THEORY: Question[] = [
  { id: 'igcse_theory_1', topic: 'Cell Structure', difficulty: 'IGCSE', type: 'THEORY', text: "Explain how the structure of a root hair cell is adapted to its function of absorbing water and mineral ions.", options: [], correctAnswer: "" }
];
export const AS_CELL_BIO_THEORY: Question[] = [];
export const ALEVEL_CELL_BIO_THEORY: Question[] = [];
