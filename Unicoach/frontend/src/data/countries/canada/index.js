/**
 * CANADA COUNTRY MODULE
 */
import UNIVERSITIES, { UNIVERSITIES_CANADA } from './universities/index.js';
import CITIES, { CITIES_CANADA } from './cities/index.js';
import COURSES, { COURSES_CANADA } from './courses/index.js';

export { UNIVERSITIES, UNIVERSITIES_CANADA };
export { CITIES, CITIES_CANADA };
export { COURSES, COURSES_CANADA };

export default {
  country: 'canada',
  name: 'Canada',
  universities: UNIVERSITIES,
  cities: CITIES,
  courses: COURSES
};
