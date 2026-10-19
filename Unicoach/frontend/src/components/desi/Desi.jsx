import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { TEAM_MENTORS, mentorLook } from '../../utils/teamMentors';
import './desi.css';

// "Desi tadka" accents: small, used sparingly next to headings and CTAs. Hindi lettering in Yatra One.

const STICKER_TONES = {
  magenta: { bg: '#1B1530', fg: '#FF3D7F', shadow: '#F7C12E' },
  yellow: { bg: '#F7C12E', fg: '#1B1530', shadow: '#B3127A' },
  green: { bg: '#0F5132', fg: '#F7C12E', shadow: '#DE5C2B' },
  orange: { bg: '#DE5C2B', fg: '#FFF4E2', shadow: '#1B1530' },
};

/** A tilted, stamped sticker that pops in, e.g. <DesiSticker>पैसा बचाओ</DesiSticker> */
export const DesiSticker = ({ children, tone = 'magenta', tilt = -6, className = '' }) => {
  const t = STICKER_TONES[tone] || STICKER_TONES.magenta;
  return (
    <motion.span
      aria-hidden="true"
      initial={{ opacity: 0, scale: 0.6, rotate: tilt - 14 }}
      whileInView={{ opacity: 1, scale: 1, rotate: tilt }}
      viewport={{ once: true }}
      whileHover={{ rotate: tilt + 4, scale: 1.06 }}
      transition={{ type: 'spring', stiffness: 260, damping: 14 }}
      className={`desi-sticker ${className}`}
      style={{ background: t.bg, color: t.fg, boxShadow: `3px 3px 0 ${t.shadow}` }}
    >
      {children}
    </motion.span>
  );
};

/** Witty one-liner in a dashed "rubber stamp" box, for tool pages */
export const MemeLine = ({ children, className = '' }) => (
  <motion.p
    initial={{ opacity: 0, y: 8, rotate: -2 }}
    whileInView={{ opacity: 1, y: 0, rotate: -1.5 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: 0.3 }}
    className={`desi-meme ${className}`}
  >
    {children}
  </motion.p>
);

/**
 * Gen-Z desi meme CTA: dark slab, big bold line, sticker-bombed with desi meme stickers.
 */
const STICKERS = [
  { t: 'Sharma ji ka beta bhi yahin se gaya 👀', bg: '#F7C12E', fg: '#1B1530', x: '6%', y: '12%', r: -8 },
  { t: 'Mummy approved ✅', bg: '#4ADE80', fg: '#0B3B1E', x: '74%', y: '10%', r: 7 },
  { t: 'No cap, free hai 🧢', bg: '#fff', fg: '#1B1530', x: '80%', y: '64%', r: -6 },
  { t: 'POV: visa approved 🛂', bg: '#38BDF8', fg: '#062F4A', x: '4%', y: '70%', r: 6 },
  { t: 'Rishtedaar ab chup 🤐', bg: '#FF3D7F', fg: '#fff', x: '62%', y: '84%', r: -4 },
  { t: 'Seniors > YouTube gyaan', bg: '#C4B5FD', fg: '#2E1065', x: '16%', y: '88%', r: 3 },
];

export const TaiyaariStamp = () => (
  <section className="gz">
    <div className="gz-grid" aria-hidden="true" />
    {STICKERS.map((st, i) => (
      <motion.span
        key={st.t}
        className="gz-sticker"
        style={{ left: st.x, top: st.y, background: st.bg, color: st.fg }}
        initial={{ opacity: 0, scale: 0.5, rotate: st.r - 20 }}
        whileInView={{ opacity: 1, scale: 1, rotate: st.r }}
        whileHover={{ scale: 1.08, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 + i * 0.08 }}
      >
        {st.t}
      </motion.span>
    ))}

    <div className="gz-inner">
      <span className="gz-kicker">abroad jaana hai? 👇</span>
      <h2 className="gz-title">
        <span>&ldquo;Bhai, bata na&rdquo;</span>
        <span>mat bolo.</span>
        <span className="hi">सीनियर से पूछो।</span>
      </h2>
      <p className="gz-sub">Real seniors, real answers. Shortlist, scholarship, loan, visa: sab ek jagah, bina gyaan ke bakwaas ke.</p>
      <div className="gz-actions">
        <Link to="/contact" className="gz-btn">Free counselling book karo <ArrowRight size={18} /></Link>
        <Link to="/unicoach" className="gz-link">Seniors dekho →</Link>
      </div>
    </div>
  </section>
);

/**
 * Retro Bollywood film poster (original artwork and lines, no film stills or song lyrics):
 * "UniCoach presents · PARDES CHALO", starring our mentors.
 */
export const FilmPoster = () => (
  <section className="desi-film-wrap">
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="desi-film"
    >
      <div className="desi-film-rays" aria-hidden="true" />
      <div className="desi-film-top">
        <span>UniCoach Films</span>
        <span className="desi-film-cert">U/A · सबके लिए</span>
      </div>
      <p className="desi-film-presents">प्रस्तुत करते हैं</p>
      <h2 className="desi-film-title">
        <span className="hi">चलो परदेस</span>
        <span className="en">PARDES CHALO</span>
      </h2>
      <p className="desi-film-tag">Ek sapna. Ek visa. Aur ghar ki yaad.</p>

      <div className="desi-film-cast">
        {TEAM_MENTORS.slice(0, 5).map((m) => {
          const look = mentorLook(m.name);
          return (
            <div key={m.name} className="desi-film-actor">
              <div className="ph" style={look.gradient ? { background: look.gradient } : undefined}>
                <img src={look.cutout || m.headshot || m.src} alt={m.name} loading="lazy" />
              </div>
              <span>{m.name.split(' ')[0]}</span>
            </div>
          );
        })}
      </div>
      <p className="desi-film-starring">Starring: seniors jo pehle hi pardesi ho chuke hain</p>

      <div className="desi-film-bottom">
        <div className="desi-film-credits">
          <b>Kahani:</b> Tumhara sapna &nbsp;·&nbsp; <b>Direction:</b> UniCoach counsellors &nbsp;·&nbsp; <b>Music:</b> Visa stamp ki thak-thak
        </div>
        <div className="desi-film-cta">
          <span className="desi-film-now">अब सिनेमाघरों में नहीं, आपके फ़ोन पर</span>
          <Link to="/events#events-grid" onClick={() => document.getElementById('events-grid')?.scrollIntoView({ behavior: 'smooth' })} className="desi-btn">Ticket book karo (free) <ArrowRight size={16} /></Link>
        </div>
      </div>
    </motion.div>
  </section>
);

/** Small muhavra line shown right before an action button, e.g. <Muhavra hi="शुभ काम में देरी क्यों?" en="Bhejo, 2 ghante mein jawab" /> */
export const Muhavra = ({ hi, en, className = '' }) => (
  <p className={`desi-muhavra ${className}`}>
    <span className="hi">{hi}</span>{en && <span className="en"> {en}</span>}
  </p>
);
