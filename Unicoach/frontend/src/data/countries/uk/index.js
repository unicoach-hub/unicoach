/**
 * UNITED KINGDOM COUNTRY MODULE
 */
import UNIVERSITIES, { UNIVERSITIES_UK } from './universities/index.js';
import CITIES, { CITIES_UK } from './cities/index.js';
import COURSES, { COURSES_UK } from './courses/index.js';

export { UNIVERSITIES, UNIVERSITIES_UK };
export { CITIES, CITIES_UK };
export { COURSES, COURSES_UK };

export default {
  country: 'uk',
  name: 'United Kingdom',
  universities: UNIVERSITIES,
  cities: CITIES,
  courses: COURSES
};
