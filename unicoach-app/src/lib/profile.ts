import { api } from './api';
import type { User } from './auth';
import { COUNTRIES } from './courses';

// Same values the website's onboarding saves (frontend/src/pages/OnboardingPage.jsx), so both stay in step.
export type ProfileInput = {
  name: string;
  phone: string;
  dreamCountry: string;
  preferredIntake: string;
  dreamCourse: string;
  highestEducation: string;
  percentage: string;
  passoutYear: string;
};

export const EDUCATION = ['12th / High School', 'Diploma', "Bachelor's", 'PG Diploma', "Master's", 'PhD'];

// Countries beyond the six with Course Finder data
export const MORE_COUNTRIES = ['New Zealand', 'France', 'Netherlands', 'Singapore', 'Italy', 'Sweden', 'United Arab Emirates', 'Japan'];

export const COURSES = [
  'Computer Science',
  'Data Science',
  'Artificial Intelligence',
  'Business Administration',
  'Business Analytics',
  'Finance',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Civil Engineering',
  'Public Health',
  'Biotechnology',
  'Hospitality Management',
];

export function intakeOptions() {
  const y = new Date().getFullYear();
  const out: string[] = [];
  for (const year of [y, y + 1, y + 2]) for (const m of ['January', 'May', 'September']) out.push(`${m} ${year}`);
  // Intakes already behind us this year are no use
  const month = new Date().getMonth();
  return out.filter((label) => {
    const [m, yr] = label.split(' ');
    if (Number(yr) !== y) return true;
    return ['January', 'May', 'September'].indexOf(m) * 4 > month;
  });
}

export async function saveProfile(input: ProfileInput) {
  const res = await api<{ success: boolean; profile: Partial<User> }>('/student/profile', { method: 'PUT', body: input });
  return res.profile;
}

// --- Helpers that turn the saved profile into app defaults ---

// Course Finder country id for the student's dream country, if we have data for it
export function countryIdFor(name?: string) {
  if (!name) return null;
  const n = name.trim().toLowerCase();
  const alias: Record<string, string> = { 'united states': 'usa', 'united kingdom': 'uk' };
  return COUNTRIES.find((c) => c.name.toLowerCase() === (alias[n] ?? n))?.id ?? null;
}

// After a bachelor's you look for a master's; before it, a bachelor's.
export function levelIdFor(education?: string) {
  if (!education) return null;
  return ['12th / High School', 'Diploma'].includes(education) ? 1 : 2;
}

export function levelLabelFor(education?: string) {
  const id = levelIdFor(education);
  return id === 1 ? 'Bachelors' : id === 2 ? 'Masters' : null;
}

// "September 2027" -> "SEP 2027"
export function intakeShort(intake?: string) {
  if (!intake) return null;
  const [m, y] = intake.split(' ');
  return y ? `${m.slice(0, 3).toUpperCase()} ${y}` : intake.toUpperCase();
}
