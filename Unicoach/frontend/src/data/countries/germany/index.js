/**
 * GERMANY COUNTRY MODULE
 */
import UNIVERSITIES, { UNIVERSITIES_GERMANY } from './universities/index.js';
import CITIES, { CITIES_GERMANY } from './cities/index.js';
import COURSES, { COURSES_GERMANY } from './courses/index.js';

export { UNIVERSITIES, UNIVERSITIES_GERMANY };
export { CITIES, CITIES_GERMANY };
export { COURSES, COURSES_GERMANY };

export default {
  country: 'germany',
  name: 'Germany',
  universities: UNIVERSITIES,
  cities: CITIES,
  courses: COURSES
};
