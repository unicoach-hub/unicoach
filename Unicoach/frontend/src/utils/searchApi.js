// Thin client for the CourseFinder-grade /api/search engine (accurate cf_courses catalogue).
import { API_BASE_URL } from '../config';

const json = (res) => {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export const getSearchConfig = () =>
  fetch(`${API_BASE_URL}/search/config`).then(json);

export const getHighlights = () =>
  fetch(`${API_BASE_URL}/search/highlights`).then(json).then((d) => d.data || d);

export const suggest = (keyword, signal) =>
  fetch(`${API_BASE_URL}/search/suggest?keyword=${encodeURIComponent(keyword)}`, { signal })
    .then(json)
    .then((d) => d.data || []);

// filters: { searchText, country[], programLevel[], studyArea, intake[], duration[], requirements[], highlights[], eslElpAvailable }
export const searchCourses = (filters = {}, { sort = 'featured', page = 1, pageSize = 20 } = {}) =>
  fetch(`${API_BASE_URL}/search/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filters, sort, page, pageSize }),
  }).then(json);

export const getCourseDetail = (cfId) =>
  fetch(`${API_BASE_URL}/search/courses/${cfId}`).then(json).then((d) => d.data || d);

// faceted university list (name + program count) for the current filters
export const getUniversitiesFacet = (filters = {}, search = '') =>
  fetch(`${API_BASE_URL}/search/universities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filters, search }),
  }).then(json).then((d) => d.data || []);

// all matching results (capped) mapped for the Excel exporter
export const exportSearch = (filters = {}) =>
  fetch(`${API_BASE_URL}/search/export`, {
    method: 'POST',
    credentials: 'include', // export needs the signed-in student's cookie
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filters }),
  }).then(json);

// profile: { nationalityId, stateId, highestQualificationId, gradingSystem, score, englishExam, backlogs, workExperience }
export const evaluateEligibility = (filters, profile, { bucket = 'eligible', sort = 'featured', page = 1, pageSize = 20 } = {}) =>
  fetch(`${API_BASE_URL}/search/eligibility`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filters, profile, bucket, sort, page, pageSize }),
  }).then(json);
