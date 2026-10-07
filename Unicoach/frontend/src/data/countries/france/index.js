/**
 * FRANCE COUNTRY MODULE
 */
import UNIVERSITIES, { UNIVERSITIES_FRANCE } from './universities/index.js';
import CITIES, { CITIES_FRANCE } from './cities/index.js';
import COURSES, { COURSES_FRANCE } from './courses/index.js';

export { UNIVERSITIES, UNIVERSITIES_FRANCE };
export { CITIES, CITIES_FRANCE };
export { COURSES, COURSES_FRANCE };

export default {
  country: 'france',
  name: 'France',
  universities: UNIVERSITIES,
  cities: CITIES,
  courses: COURSES
};
