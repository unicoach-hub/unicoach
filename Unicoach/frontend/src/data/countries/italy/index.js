/**
 * ITALY COUNTRY MODULE
 */
import UNIVERSITIES, { UNIVERSITIES_ITALY } from './universities/index.js';
import CITIES, { CITIES_ITALY } from './cities/index.js';
import COURSES, { COURSES_ITALY } from './courses/index.js';

export { UNIVERSITIES, UNIVERSITIES_ITALY };
export { CITIES, CITIES_ITALY };
export { COURSES, COURSES_ITALY };

export default {
  country: 'italy',
  name: 'Italy',
  universities: UNIVERSITIES,
  cities: CITIES,
  courses: COURSES
};
