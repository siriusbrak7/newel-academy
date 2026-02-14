
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
    { id: 'b1', topic: 'Cell Biology', difficulty: 'IGCSE', type: 'MCQ', text: "Which organelle is known as the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondrion", "Vacuole"], correctAnswer: "Mitochondrion" },
    { id: 'b2', topic: 'Cell Biology', difficulty: 'IGCSE', type: 'MCQ', text: "What structure in plant cells performs photosynthesis?", options: ["Cell Wall", "Chloroplast", "Cytoplasm", "Nucleus"], correctAnswer: "Chloroplast" },
    { id: 'b3', topic: 'Genetics', difficulty: 'IGCSE', type: 'MCQ', text: "What is the molecule that carries genetic information?", options: ["RNA", "DNA", "ATP", "Glucose"], correctAnswer: "DNA" },
    { id: 'b4', topic: 'Ecology', difficulty: 'IGCSE', type: 'MCQ', text: "What is the primary source of energy for most ecosystems?", options: ["Wind", "Water", "Sunlight", "Geothermal"], correctAnswer: "Sunlight" },
    { id: 'b5', topic: 'Human Physiology', difficulty: 'IGCSE', type: 'MCQ', text: "Which system is responsible for transporting oxygen throughout the body?", options: ["Nervous", "Excretory", "Circulatory", "Skeletal"], correctAnswer: "Circulatory" },
    { id: 'b6', topic: 'Human Physiology', difficulty: 'IGCSE', type: 'MCQ', text: "Where does most nutrient absorption occur in the digestive system?", options: ["Stomach", "Large intestine", "Small intestine", "Esophagus"], correctAnswer: "Small intestine" },
    { id: 'b7', topic: 'Microbiology', difficulty: 'IGCSE', type: 'MCQ', text: "Which of these is a prokaryotic organism?", options: ["Yeast", "Amoeba", "Bacteria", "Mushroom"], correctAnswer: "Bacteria" },
    { id: 'b8', topic: 'Plant Biology', difficulty: 'IGCSE', type: 'MCQ', text: "What is the function of xylem in plants?", options: ["Sugar transport", "Water transport", "Defense", "Support"], correctAnswer: "Water transport" },
    { id: 'b9', topic: 'Animal Physiology', difficulty: 'IGCSE', type: 'MCQ', text: "What gas do animals primarily exhale as a waste product of respiration?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correctAnswer: "Carbon Dioxide" },
    { id: 'b10', topic: 'Genetics', difficulty: 'IGCSE', type: 'MCQ', text: "Which base pairs with Adenine in DNA?", options: ["Cytosine", "Guanine", "Thymine", "Uracil"], correctAnswer: "Thymine" },
    { id: 'b11', topic: 'Ecology', difficulty: 'IGCSE', type: 'MCQ', text: "What do we call an organism that eats only plants?", options: ["Carnivore", "Herbivore", "Omnivore", "Detritivore"], correctAnswer: "Herbivore" },
    { id: 'b12', topic: 'Cell Biology', difficulty: 'IGCSE', type: 'MCQ', text: "Which process moves substances against a concentration gradient?", options: ["Diffusion", "Osmosis", "Active Transport", "Filtration"], correctAnswer: "Active Transport" },
    { id: 'b13', topic: 'Human Physiology', difficulty: 'IGCSE', type: 'MCQ', text: "Which blood component creates clots?", options: ["Red Blood Cells", "White Blood Cells", "Plasma", "Platelets"], correctAnswer: "Platelets" },
    { id: 'b14', topic: 'Plant Biology', difficulty: 'IGCSE', type: 'MCQ', text: "Through which part of the leaf does gas exchange primarily occur?", options: ["Cuticle", "Stomata", "Vein", "Mesophyll"], correctAnswer: "Stomata" },
    { id: 'b15', topic: 'Molecular Biology', difficulty: 'IGCSE', type: 'MCQ', text: "Enzymes are biological examples of what?", options: ["Catalysts", "Solvents", "Substrates", "Products"], correctAnswer: "Catalysts" }
  ],
  'Physics': [
    { id: 'p1', topic: 'Mechanics', difficulty: 'IGCSE', type: 'MCQ', text: "What is the SI unit of force?", options: ["Joule", "Pascal", "Newton", "Watt"], correctAnswer: "Newton" },
    { id: 'p2', topic: 'Mechanics', difficulty: 'IGCSE', type: 'MCQ', text: "Acceleration is defined as the rate of change of...", options: ["Distance", "Velocity", "Mass", "Force"], correctAnswer: "Velocity" },
    { id: 'p3', topic: 'Electricity', difficulty: 'IGCSE', type: 'MCQ', text: "What is the unit of electrical resistance?", options: ["Volt", "Ampere", "Ohm", "Farad"], correctAnswer: "Ohm" },
    { id: 'p4', topic: 'Waves', difficulty: 'IGCSE', type: 'MCQ', text: "Light travels as what type of wave?", options: ["Longitudinal", "Transverse", "Mechanical", "Sound"], correctAnswer: "Transverse" },
    { id: 'p5', topic: 'Thermal Physics', difficulty: 'IGCSE', type: 'MCQ', text: "The process by which heat travels through a vacuum is...", options: ["Conduction", "Convection", "Radiation", "Evaporation"], correctAnswer: "Radiation" },
    { id: 'p6', topic: 'Atomic Physics', difficulty: 'IGCSE', type: 'MCQ', text: "What particles are found in the nucleus of an atom?", options: ["Electrons only", "Protons and electrons", "Protons and neutrons", "Neutrons and electrons"], correctAnswer: "Protons and neutrons" },
    { id: 'p7', topic: 'Mechanics', difficulty: 'IGCSE', type: 'MCQ', text: "Work done is equal to force multiplied by...", options: ["Time", "Distance", "Mass", "Acceleration"], correctAnswer: "Distance" },
    { id: 'p8', topic: 'Waves', difficulty: 'IGCSE', type: 'MCQ', text: "The pitch of a sound depends on its...", options: ["Amplitude", "Velocity", "Frequency", "Wavelength"], correctAnswer: "Frequency" },
    { id: 'p9', topic: 'Electricity', difficulty: 'IGCSE', type: 'MCQ', text: "Which material is the best electrical conductor?", options: ["Glass", "Copper", "Rubber", "Wood"], correctAnswer: "Copper" },
    { id: 'p10', topic: 'Mechanics', difficulty: 'IGCSE', type: 'MCQ', text: "Which of these is a scalar quantity?", options: ["Velocity", "Force", "Speed", "Displacement"], correctAnswer: "Speed" },
    { id: 'p11', topic: 'Energy Production', difficulty: 'IGCSE', type: 'MCQ', text: "Which energy source is non-renewable?", options: ["Solar", "Wind", "Coal", "Hydroelectric"], correctAnswer: "Coal" },
    { id: 'p12', topic: 'Atomic Physics', difficulty: 'IGCSE', type: 'MCQ', text: "What is the term for atoms of the same element with different numbers of neutrons?", options: ["Isotopes", "Ions", "Isomers", "Allotropes"], correctAnswer: "Isotopes" },
    { id: 'p13', topic: 'Thermal Physics', difficulty: 'IGCSE', type: 'MCQ', text: "At what temperature does water boil at standard pressure?", options: ["0°C", "50°C", "100°C", "273 K"], correctAnswer: "100°C" },
    { id: 'p14', topic: 'Waves', difficulty: 'IGCSE', type: 'MCQ', text: "What phenomenon causes a pencil to look bent in water?", options: ["Reflection", "Refraction", "Diffraction", "Interference"], correctAnswer: "Refraction" },
    { id: 'p15', topic: 'Electricity', difficulty: 'IGCSE', type: 'MCQ', text: "In a series circuit, what stays the same across all components?", options: ["Voltage", "Current", "Resistance", "Power"], correctAnswer: "Current" }
  ],
  'Chemistry': [
    { id: 'c1', topic: 'Atomic Structure', difficulty: 'IGCSE', type: 'MCQ', text: "What is the atomic number of an element based on?", options: ["Number of neutrons", "Number of protons", "Total mass", "Number of shells"], correctAnswer: "Number of protons" },
    { id: 'c2', topic: 'Periodicity', difficulty: 'IGCSE', type: 'MCQ', text: "Which group in the Periodic Table contains the Noble Gases?", options: ["Group 1", "Group 7", "Group 0", "Group 2"], correctAnswer: "Group 0" },
    { id: 'c3', topic: 'Bonding', difficulty: 'IGCSE', type: 'MCQ', text: "What type of bond involves sharing of electrons?", options: ["Ionic", "Covalent", "Metallic", "Hydrogen"], correctAnswer: "Covalent" },
    { id: 'c4', topic: 'Acids and Bases', difficulty: 'IGCSE', type: 'MCQ', text: "What is the pH of a neutral solution?", options: ["0", "1", "7", "14"], correctAnswer: "7" },
    { id: 'c5', topic: 'Energetics', difficulty: 'IGCSE', type: 'MCQ', text: "A reaction that releases heat to the surroundings is...", options: ["Endothermic", "Exothermic", "Reversible", "Catalytic"], correctAnswer: "Exothermic" },
    { id: 'c6', topic: 'Organic Chemistry', difficulty: 'IGCSE', type: 'MCQ', text: "What is the general formula for Alkanes?", options: ["CnH2n", "CnH2n-2", "CnH2n+2", "CnHn"], correctAnswer: "CnH2n+2" },
    { id: 'c7', topic: 'Atomic Structure', difficulty: 'IGCSE', type: 'MCQ', text: "What charge does an electron carry?", options: ["Positive", "Negative", "Neutral", "Double positive"], correctAnswer: "Negative" },
    { id: 'c8', topic: 'Periodic Table', difficulty: 'IGCSE', type: 'MCQ', text: "Which element is a Liquid at room temperature?", options: ["Iron", "Bromine", "Oxygen", "Carbon"], correctAnswer: "Bromine" },
    { id: 'c9', topic: 'Kinetics', difficulty: 'IGCSE', type: 'MCQ', text: "A substance that speeds up a reaction without being used up is a...", options: ["Reactant", "Product", "Catalyst", "Solvent"], correctAnswer: "Catalyst" },
    { id: 'c10', topic: 'Stoichiometric Relationships', difficulty: 'IGCSE', type: 'MCQ', text: "What is the Avogadro constant primarily associated with?", options: ["Moles", "Mass", "Volume", "Density"], correctAnswer: "Moles" },
    { id: 'c11', topic: 'Acids and Bases', difficulty: 'IGCSE', type: 'MCQ', text: "Which acid is found in stomach acid?", options: ["Sulfuric Acid", "Nitric Acid", "Hydrochloric Acid", "Acetic Acid"], correctAnswer: "Hydrochloric Acid" },
    { id: 'c12', topic: 'Organic Chemistry', difficulty: 'IGCSE', type: 'MCQ', text: "Ethene belongs to which homologous series?", options: ["Alkanes", "Alkenes", "Alcohols", "Carboxylic Acids"], correctAnswer: "Alkenes" },
    { id: 'c13', topic: 'Redox Processes', difficulty: 'IGCSE', type: 'MCQ', text: "Oxidation is the...", options: ["Gain of electrons", "Loss of electrons", "Gain of hydrogen", "Loss of oxygen"], correctAnswer: "Loss of electrons" },
    { id: 'c14', topic: 'Atmosphere', difficulty: 'IGCSE', type: 'MCQ', text: "Which gas makes up approximately 78% of the Earth's atmosphere?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Argon"], correctAnswer: "Nitrogen" },
    { id: 'c15', topic: 'Bonding', difficulty: 'IGCSE', type: 'MCQ', text: "Diamond and Graphite are allotropes of which element?", options: ["Silicon", "Carbon", "Sulfur", "Oxygen"], correctAnswer: "Carbon" }
  ]
};

export const IGCSE_CELL_BIO_THEORY: Question[] = [
  { id: 'igcse_theory_1', topic: 'Cell Structure', difficulty: 'IGCSE', type: 'THEORY', text: "Explain how the structure of a root hair cell is adapted to its function of absorbing water and mineral ions.", options: [], correctAnswer: "" }
];
export const AS_CELL_BIO_THEORY: Question[] = [];
export const ALEVEL_CELL_BIO_THEORY: Question[] = [];
