import HomeV2 from '../homeV2/Home';
import CinematicHero from './CinematicHero';

// Demo only (/home-v3): the new homepage with a scroll-driven hero through the plane window
const Home = () => <HomeV2 hero={<CinematicHero />} />;

export default Home;
