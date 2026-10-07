/**
 * UNITED STATES COUNTRY MODULE
 */
import UNIVERSITIES, { UNIVERSITIES_USA } from './universities/index.js';
import CITIES, { CITIES_USA } from './cities/index.js';
import COURSES, { COURSES_USA } from './courses/index.js';

export { UNIVERSITIES, UNIVERSITIES_USA };
export { CITIES, CITIES_USA };
export { COURSES, COURSES_USA };

export default {
  country: 'usa',
  name: 'United States',
  universities: UNIVERSITIES,
  cities: CITIES,
  courses: COURSES
};
