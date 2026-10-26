// Pencil sketch + soft paper palette per country, shared by the homepage destination cards,
// the country page heroes and the study-abroad hub cards.
import usaSketch from '../assets/destinations/sketch/usa.webp';
import ukSketch from '../assets/destinations/sketch/uk.webp';
import canadaSketch from '../assets/destinations/sketch/canada.webp';
import australiaSketch from '../assets/destinations/sketch/australia.webp';
import germanySketch from '../assets/destinations/sketch/germany.webp';
import irelandSketch from '../assets/destinations/sketch/ireland.webp';

export const SKETCH_THEMES = {
  usa: { sketch: usaSketch, bg: '#EEF1F8', ink: '#16233F', soft: '#4A5A7C', line: '#C9D2E6' },
  uk: { sketch: ukSketch, bg: '#E8EEE6', ink: '#1E3324', soft: '#4F6654', line: '#C4D3C2' },
  canada: { sketch: canadaSketch, bg: '#F6E9E6', ink: '#4A1E17', soft: '#7D4A40', line: '#E6C9C2' },
  australia: { sketch: australiaSketch, bg: '#F5EEDF', ink: '#3E2E12', soft: '#7A6334', line: '#E6D7B5' },
  germany: { sketch: germanySketch, bg: '#ECEBE8', ink: '#24221E', soft: '#5C5850', line: '#D6D3CC' },
  ireland: { sketch: irelandSketch, bg: '#E5F0EC', ink: '#123A30', soft: '#3F6A5E', line: '#C1DCD3' },
};

// Fades the sketch out at the top and bottom so it sits on the paper colour
export const SKETCH_MASK = 'linear-gradient(to bottom, transparent, #000 18%, #000 78%, transparent)';
