/**
 * NEW ZEALAND COUNTRY MODULE
 */
import UNIVERSITIES, { UNIVERSITIES_NEW_ZEALAND } from './universities/index.js';
import CITIES, { CITIES_NEW_ZEALAND } from './cities/index.js';
import COURSES, { COURSES_NEW_ZEALAND } from './courses/index.js';

export { UNIVERSITIES, UNIVERSITIES_NEW_ZEALAND };
export { CITIES, CITIES_NEW_ZEALAND };
export { COURSES, COURSES_NEW_ZEALAND };

export default {
  country: 'new-zealand',
  name: 'New Zealand',
  universities: UNIVERSITIES,
  cities: CITIES,
  courses: COURSES
};
