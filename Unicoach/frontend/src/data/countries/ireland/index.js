/**
 * IRELAND COUNTRY MODULE
 */
import UNIVERSITIES, { UNIVERSITIES_IRELAND } from './universities/index.js';
import CITIES, { CITIES_IRELAND } from './cities/index.js';
import COURSES, { COURSES_IRELAND } from './courses/index.js';

export { UNIVERSITIES, UNIVERSITIES_IRELAND };
export { CITIES, CITIES_IRELAND };
export { COURSES, COURSES_IRELAND };

export default {
  country: 'ireland',
  name: 'Ireland',
  universities: UNIVERSITIES,
  cities: CITIES,
  courses: COURSES
};
