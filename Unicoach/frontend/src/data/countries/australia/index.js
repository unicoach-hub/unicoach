/**
 * AUSTRALIA COUNTRY MODULE
 */
import UNIVERSITIES, { UNIVERSITIES_AUSTRALIA } from './universities/index.js';
import CITIES, { CITIES_AUSTRALIA } from './cities/index.js';
import COURSES, { COURSES_AUSTRALIA } from './courses/index.js';

export { UNIVERSITIES, UNIVERSITIES_AUSTRALIA };
export { CITIES, CITIES_AUSTRALIA };
export { COURSES, COURSES_AUSTRALIA };

export default {
  country: 'australia',
  name: 'Australia',
  universities: UNIVERSITIES,
  cities: CITIES,
  courses: COURSES
};
