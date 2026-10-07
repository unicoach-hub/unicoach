import React from 'react';
import { Globe } from 'lucide-react';
import { countries } from './countries';

export const POPULAR_COURSES = [
  // Computer Science & Tech
  { value: 'Computer Science', label: 'Computer Science (CSE / CS)', shortLabel: 'Computer Science', icon: '💻', description: 'Algorithms, Software Systems, Cloud & Full Stack', aliases: ['cs', 'cse', 'computer science & engineering', 'computer science and engineering', 'software systems'] },
  { value: 'Software Engineering', label: 'Software Engineering', shortLabel: 'Software Engineering', icon: '⚡', description: 'Software Architecture, DevOps & App Development', aliases: ['swe', 'software', 'software engineering'] },
  { value: 'Data Science', label: 'Data Science & Big Data Analytics', shortLabel: 'Data Science', icon: '📊', description: 'Machine Learning, Statistics & Data Engineering', aliases: ['ds', 'data analytics', 'big data', 'data science'] },
  { value: 'Artificial Intelligence', label: 'Artificial Intelligence & Machine Learning', shortLabel: 'Artificial Intelligence', icon: '🤖', description: 'Deep Learning, NLP, Generative AI & Vision', aliases: ['ai', 'ml', 'machine learning', 'artificial intelligence'] },
  { value: 'Cybersecurity', label: 'Cybersecurity & InfoSec', shortLabel: 'Cybersecurity', icon: '🛡️', description: 'Network Defense, Ethical Hacking & Cryptography', aliases: ['security', 'infosec', 'cyber', 'cybersecurity'] },
  { value: 'Information Technology', label: 'Information Technology (IT / MIS)', shortLabel: 'Information Technology', icon: '🖥️', description: 'Enterprise Tech, Cloud Infrastructure & IT Systems', aliases: ['it', 'mis', 'information systems', 'information technology'] },
  { value: 'Cloud Computing', label: 'Cloud Computing & DevOps', shortLabel: 'Cloud Computing', icon: '☁️', description: 'AWS, Azure, Kubernetes, CI/CD Architecture', aliases: ['devops', 'cloud', 'cloud computing'] },
  { value: 'UI-UX Design', label: 'UI/UX Design & Human-Computer Interaction', shortLabel: 'UI/UX Design', icon: '🎨', description: 'Product Design, Interaction Design & Research', aliases: ['hci', 'design', 'ui', 'ux', 'ui/ux'] },
  { value: 'Robotics', label: 'Robotics & Autonomous Systems', shortLabel: 'Robotics', icon: '🦾', description: 'Mechatronics, Control Systems & Autonomous Vehicles', aliases: ['robotics', 'mechatronics', 'automation'] },

  // Engineering & Core Tech
  { value: 'Mechanical Engineering', label: 'Mechanical Engineering', shortLabel: 'Mechanical Engineering', icon: '⚙️', description: 'Thermodynamics, CAD, Robotics & Automotive', aliases: ['mech', 'mechanical', 'mechanical engineering'] },
  { value: 'Electrical Engineering', label: 'Electrical & Electronics Engineering (EEE / ECE)', shortLabel: 'Electrical Engineering', icon: '🔌', description: 'Embedded Systems, Microchips, VLSI & Power', aliases: ['eee', 'ece', 'electrical', 'electronics', 'electrical engineering'] },
  { value: 'Civil Engineering', label: 'Civil & Structural Engineering', shortLabel: 'Civil Engineering', icon: '🏗️', description: 'Infrastructure, Geotechnical & Urban Development', aliases: ['civil', 'construction', 'civil engineering', 'structural engineering'] },
  { value: 'Aerospace Engineering', label: 'Aerospace & Aeronautical Engineering', shortLabel: 'Aerospace Engineering', icon: '🚀', description: 'Aircraft Design, Propulsion & Space Systems', aliases: ['aero', 'aviation', 'space', 'aerospace engineering', 'aeronautical'] },
  { value: 'Biomedical Engineering', label: 'Biomedical Engineering & Bioengineering', shortLabel: 'Biomedical Engineering', icon: '🧬', description: 'Medical Devices, Prosthetics & Biomaterials', aliases: ['bme', 'biomed', 'biomedical', 'biomedical engineering'] },
  { value: 'Chemical Engineering', label: 'Chemical & Materials Engineering', shortLabel: 'Chemical Engineering', icon: '🧪', description: 'Process Engineering, Nanotechnology & Polymers', aliases: ['chemical', 'chem', 'chemical engineering', 'materials'] },
  { value: 'Industrial Engineering', label: 'Industrial & Systems Engineering', shortLabel: 'Industrial Engineering', icon: '🏭', description: 'Operations Optimization, Logistics & Manufacturing', aliases: ['industrial', 'operations', 'industrial engineering'] },
  { value: 'Environmental Engineering', label: 'Environmental Engineering & Clean Energy', shortLabel: 'Environmental Engineering', icon: '🌱', description: 'Renewable Power, Climate Tech & Sustainability', aliases: ['environmental', 'green energy', 'clean energy', 'environmental engineering'] },

  // Business, Management & Finance
  { value: 'Business Administration', label: 'Business Administration (MBA / BBA)', shortLabel: 'Business Administration', icon: '📈', description: 'Leadership, Corporate Strategy & General Management', aliases: ['mba', 'bba', 'business', 'management', 'business administration'] },
  { value: 'Business Analytics', label: 'Business Analytics & Data Management', shortLabel: 'Business Analytics', icon: '📉', description: 'Data-driven Strategy, BI, Tableau & SQL', aliases: ['ba', 'business intelligence', 'business analytics'] },
  { value: 'Finance', label: 'Finance & Investment Banking', shortLabel: 'Finance', icon: '💰', description: 'Corporate Finance, Asset Management & FinTech', aliases: ['finance', 'banking', 'fintech', 'investment banking'] },
  { value: 'Marketing', label: 'Marketing & Digital Communication', shortLabel: 'Marketing', icon: '📢', description: 'Brand Growth, SEO, Performance & Social Marketing', aliases: ['marketing', 'digital marketing', 'advertising'] },
  { value: 'International Business', label: 'International Business & Global Trade', shortLabel: 'International Business', icon: '🌐', description: 'Cross-Border Operations, Globalization & Policy', aliases: ['ib', 'global trade', 'international business'] },
  { value: 'Supply Chain Management', label: 'Supply Chain & Logistics Management', shortLabel: 'Supply Chain', icon: '📦', description: 'Global Logistics, Procurement & Warehouse Ops', aliases: ['supply chain', 'logistics', 'scm'] },
  { value: 'Accounting', label: 'Accounting & Taxation (CPA / ACCA)', shortLabel: 'Accounting', icon: '📑', description: 'Auditing, Forensic Accounting & Financial Law', aliases: ['accounting', 'accounts', 'tax', 'cpa', 'acca'] },
  { value: 'Human Resource Management', label: 'Human Resource Management (HRM)', shortLabel: 'HR Management', icon: '👥', description: 'Talent Acquisition, People Analytics & Leadership', aliases: ['hr', 'hrm', 'human resources'] },

  // Health, Medicine & Sciences
  { value: 'Public Health', label: 'Public Health (MPH) & Health Informatics', shortLabel: 'Public Health', icon: '🏥', description: 'Epidemiology, Healthcare Policy & Systems', aliases: ['mph', 'public health', 'health administration'] },
  { value: 'Medicine', label: 'Medicine & Surgery (MBBS / MD / Pre-Med)', shortLabel: 'Medicine', icon: '🩺', description: 'Clinical Medicine, Medical Sciences & Surgery', aliases: ['mbbs', 'medicine', 'md', 'pre-med', 'doctor'] },
  { value: 'Nursing', label: 'Nursing & Healthcare Practice', shortLabel: 'Nursing', icon: '🩹', description: 'Clinical Care, Patient Support & Global Nursing', aliases: ['nursing', 'nurse', 'healthcare'] },
  { value: 'Pharmacy', label: 'Pharmacy & Pharmacology (PharmD)', shortLabel: 'Pharmacy', icon: '💊', description: 'Drug Discovery, Clinical Trials & Pharmaceutics', aliases: ['pharmacy', 'pharmd', 'pharmacology'] },
  { value: 'Biotechnology', label: 'Biotechnology & Bioinformatics', shortLabel: 'Biotechnology', icon: '🧫', description: 'Genomics, Molecular Biology & Vaccine Research', aliases: ['biotech', 'bioinformatics', 'biotechnology'] },
  { value: 'Clinical Psychology', label: 'Psychology & Behavioral Science', shortLabel: 'Psychology', icon: '🧠', description: 'Clinical Mental Health, Cognitive Science & Therapy', aliases: ['psychology', 'psych', 'behavioral science'] },

  // Law, Humanities & Design
  { value: 'Law', label: 'Law & Legal Studies (LLM / Corporate Law)', shortLabel: 'Law & Legal Studies', icon: '⚖️', description: 'International Law, Corporate Disputes & Intellectual Property', aliases: ['law', 'llm', 'legal', 'law studies'] },
  { value: 'Economics', label: 'Economics & Econometrics', shortLabel: 'Economics', icon: '🏛️', description: 'Macroeconomics, Fiscal Policy, Quantitative Economics', aliases: ['economics', 'econ', 'econometrics'] },
  { value: 'Architecture', label: 'Architecture, Urban & Interior Design', shortLabel: 'Architecture', icon: '📐', description: 'Building Design, Sustainable Architecture & BIM', aliases: ['architecture', 'arch', 'interior design', 'urban design'] },
  { value: 'Media & Journalism', label: 'Media, Journalism & Film Production', shortLabel: 'Media & Journalism', icon: '🎙️', description: 'Broadcasting, Digital Storytelling & Public Relations', aliases: ['journalism', 'media', 'mass comm', 'film'] },
  { value: 'Hospitality Management', label: 'Hospitality & Tourism Management', shortLabel: 'Hospitality Management', icon: '🏨', description: 'Hotel Management, Luxury Hospitality & Events', aliases: ['hospitality', 'hotel management', 'tourism', 'hotel'] },
];

export const TOP_DESTINATIONS = [
  {
    value: 'All',
    label: 'All Global Destinations',
    shortLabel: 'All Destinations',
    icon: <Globe size={18} className="text-indigo-500" />,
    description: 'Search & match across 500+ global universities & scholarships',
    aliases: ['all', 'global', 'any', 'worldwide']
  },
  {
    value: 'USA',
    label: 'United States (USA)',
    shortLabel: 'United States',
    icon: <img src="https://flagcdn.com/w40/us.png" alt="US" className="w-5 h-3.5 rounded-xs object-cover" />,
    description: 'Ivy League, STEM OPT & top research institutions',
    aliases: ['usa', 'united states', 'us', 'america']
  },
  {
    value: 'UK',
    label: 'United Kingdom (UK)',
    shortLabel: 'United Kingdom',
    icon: <img src="https://flagcdn.com/w40/gb.png" alt="UK" className="w-5 h-3.5 rounded-xs object-cover" />,
    description: 'Russell Group & 2-year Graduate Route work visa',
    aliases: ['uk', 'united kingdom', 'gb', 'england', 'britain', 'scotland']
  },
  {
    value: 'Canada',
    label: 'Canada',
    shortLabel: 'Canada',
    icon: <img src="https://flagcdn.com/w40/ca.png" alt="CA" className="w-5 h-3.5 rounded-xs object-cover" />,
    description: 'PGWP work permit & streamlined PR pathways',
    aliases: ['canada', 'ca']
  },
  {
    value: 'Australia',
    label: 'Australia',
    shortLabel: 'Australia',
    icon: <img src="https://flagcdn.com/w40/au.png" alt="AU" className="w-5 h-3.5 rounded-xs object-cover" />,
    description: 'Group of Eight (Go8) & high minimum student wage',
    aliases: ['australia', 'au']
  },
  {
    value: 'Germany',
    label: 'Germany',
    shortLabel: 'Germany',
    icon: <img src="https://flagcdn.com/w40/de.png" alt="DE" className="w-5 h-3.5 rounded-xs object-cover" />,
    description: 'Tuition-free public universities & EU Blue Card',
    aliases: ['germany', 'de', 'deutschland']
  },
  {
    value: 'Ireland',
    label: 'Ireland',
    shortLabel: 'Ireland',
    icon: <img src="https://flagcdn.com/w40/ie.png" alt="IE" className="w-5 h-3.5 rounded-xs object-cover" />,
    description: 'Silicon Valley of Europe & English-speaking hub',
    aliases: ['ireland', 'ie']
  },
  {
    value: 'New Zealand',
    label: 'New Zealand',
    shortLabel: 'New Zealand',
    icon: <img src="https://flagcdn.com/w40/nz.png" alt="NZ" className="w-5 h-3.5 rounded-xs object-cover" />,
    description: 'High quality of life & post-study work rights',
    aliases: ['new zealand', 'nz']
  },
  {
    value: 'France',
    label: 'France',
    shortLabel: 'France',
    icon: <img src="https://flagcdn.com/w40/fr.png" alt="FR" className="w-5 h-3.5 rounded-xs object-cover" />,
    description: 'Grandes Écoles, affordable tuition & 5-year alumni visa',
    aliases: ['france', 'fr']
  },
  {
    value: 'Italy',
    label: 'Italy',
    shortLabel: 'Italy',
    icon: <img src="https://flagcdn.com/w40/it.png" alt="IT" className="w-5 h-3.5 rounded-xs object-cover" />,
    description: 'Historic universities & regional DSU scholarships',
    aliases: ['italy', 'it', 'italia']
  },
  {
    value: 'Singapore',
    label: 'Singapore',
    shortLabel: 'Singapore',
    icon: <img src="https://flagcdn.com/w40/sg.png" alt="SG" className="w-5 h-3.5 rounded-xs object-cover" />,
    description: 'NUS, NTU & global Asian financial headquarters',
    aliases: ['singapore', 'sg']
  },
  {
    value: 'Netherlands',
    label: 'Netherlands',
    shortLabel: 'Netherlands',
    icon: <img src="https://flagcdn.com/w40/nl.png" alt="NL" className="w-5 h-3.5 rounded-xs object-cover" />,
    description: 'High English proficiency & leading EU innovation center',
    aliases: ['netherlands', 'holland', 'nl']
  },
  {
    value: 'Switzerland',
    label: 'Switzerland',
    shortLabel: 'Switzerland',
    icon: <img src="https://flagcdn.com/w40/ch.png" alt="CH" className="w-5 h-3.5 rounded-xs object-cover" />,
    description: 'ETH Zurich & world-class banking / luxury management',
    aliases: ['switzerland', 'ch']
  },
  {
    value: 'United Arab Emirates',
    label: 'United Arab Emirates (UAE / Dubai)',
    shortLabel: 'UAE',
    icon: <img src="https://flagcdn.com/w40/ae.png" alt="AE" className="w-5 h-3.5 rounded-xs object-cover" />,
    description: 'Tax-free, global branch campuses & Middle East hub',
    aliases: ['uae', 'united arab emirates', 'dubai', 'ae']
  },
  {
    value: 'Spain',
    label: 'Spain',
    shortLabel: 'Spain',
    icon: <img src="https://flagcdn.com/w40/es.png" alt="ES" className="w-5 h-3.5 rounded-xs object-cover" />,
    description: 'Top European business schools & vibrant lifestyle',
    aliases: ['spain', 'es', 'espana']
  },
  {
    value: 'Sweden',
    label: 'Sweden',
    shortLabel: 'Sweden',
    icon: <img src="https://flagcdn.com/w40/se.png" alt="SE" className="w-5 h-3.5 rounded-xs object-cover" />,
    description: 'Innovation, sustainability & high-tech research',
    aliases: ['sweden', 'se']
  },
  {
    value: 'Japan',
    label: 'Japan',
    shortLabel: 'Japan',
    icon: <img src="https://flagcdn.com/w40/jp.png" alt="JP" className="w-5 h-3.5 rounded-xs object-cover" />,
    description: 'Advanced robotics, AI tech & MEXT scholarships',
    aliases: ['japan', 'jp']
  },
  {
    value: 'South Korea',
    label: 'South Korea',
    shortLabel: 'South Korea',
    icon: <img src="https://flagcdn.com/w40/kr.png" alt="KR" className="w-5 h-3.5 rounded-xs object-cover" />,
    description: 'SKY universities & high-tech semiconductor hub',
    aliases: ['south korea', 'korea', 'kr']
  },
];

// Set of already included top destination names & aliases in lowercase
const TOP_COUNTRY_NAMES = new Set(
  TOP_DESTINATIONS.flatMap(d => [d.value.toLowerCase(), d.label.toLowerCase(), ...(d.aliases || [])])
);

// Map remaining 150+ world countries
const REMAINING_WORLD_COUNTRIES = (countries || [])
  .filter(c => !TOP_COUNTRY_NAMES.has(c.name.toLowerCase()))
  .sort((a, b) => a.name.localeCompare(b.name))
  .map(c => ({
    value: c.name,
    label: c.name,
    shortLabel: c.name,
    icon: (
      <span className="w-5 h-3.5 flex items-center justify-center overflow-hidden rounded-xs flex-shrink-0 bg-slate-100 border border-slate-200/60">
        <img 
          src={`https://flagcdn.com/w40/${c.iso.toLowerCase()}.png`} 
          alt={c.iso} 
          className="w-5 h-3.5 object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      </span>
    ),
    description: `Country code: ${c.iso} (${c.code}) • Global destination`,
    aliases: [c.name.toLowerCase(), c.iso.toLowerCase(), c.code]
  }));

export const ALL_COUNTRY_OPTIONS = [...TOP_DESTINATIONS, ...REMAINING_WORLD_COUNTRIES];
