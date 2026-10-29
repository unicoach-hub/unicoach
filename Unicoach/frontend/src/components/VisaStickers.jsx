/**
 * Visa stickers for the passport journey. Each follows the layout of the real
 * label (US, Australia, Schengen) but every detail is made up, the holder is
 * "YOU" (a photo slot with YOU on it, so the visitor sees their own visa), and
 * each carries a SPECIMEN mark. Text sizes use container
 * units (cqw) so the whole label scales with its width.
 */

const INK = '#16130F';

// The photo slot belongs to the visitor: a soft silhouette with a big "YOU" across it
const YouPhoto = ({ bg = '#EEF0F1', accent = '#2E4A86' }) => (
  <div className="relative w-full h-full" style={{ background: bg }}>
    <svg viewBox="0 0 60 75" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <circle cx="30" cy="31" r="12" fill="rgba(22,19,15,0.13)" />
      <path d="M8 75c0-14 10-22 22-22s22 8 22 22z" fill="rgba(22,19,15,0.13)" />
    </svg>
    <span className="absolute inset-[6%] border-dashed rounded-[2px]" style={{ borderWidth: '0.35cqw', borderColor: accent, opacity: 0.55 }} />
    <span className="absolute inset-0 grid place-items-center">
      <span className="font-black leading-none -rotate-6" style={{ fontFamily: 'Urbanist, sans-serif', fontSize: '7.4cqw', color: accent, letterSpacing: '-0.02em' }}>YOU</span>
    </span>
  </div>
);

const Specimen = ({ color = 'rgba(179,64,52,0.3)', top = '48%' }) => (
  <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[14deg] font-black pointer-events-none select-none"
    style={{ top, color, fontSize: '7.5cqw', letterSpacing: '0.3em', fontFamily: 'Urbanist, sans-serif' }}>SPECIMEN</span>
);

const Field = ({ k, v, x, y, big = false, color = INK }) => (
  <div className="absolute leading-none" style={{ left: x, top: y }}>
    <div style={{ fontSize: '1.8cqw', color: 'rgba(22,19,15,0.7)', fontWeight: 600 }}>{k}</div>
    <div style={{ fontSize: big ? '3.2cqw' : '2.8cqw', color, fontWeight: 700, marginTop: '0.4cqw', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>{v}</div>
  </div>
);

/* United States: navy "VISA" block, red banner title, photo left, field grid, two-line MRZ */
export const UsVisa = () => (
  <div className="relative w-full aspect-[1.78/1] overflow-hidden rounded-[6px] [container-type:inline-size]"
    style={{ background: 'linear-gradient(115deg, #F6F1EC 0%, #F1EDE6 45%, #EAF0EC 70%, #F3E9E8 100%)', fontFamily: 'Onest, system-ui, sans-serif' }}>
    {/* faint building + script watermark */}
    <svg className="absolute right-[8%] top-[24%] w-[46%] opacity-[0.12]" viewBox="0 0 100 60" aria-hidden="true">
      <path d="M50 4l22 12H28z M30 18h40v4H30z" fill="#5B6B7A" />
      {Array.from({ length: 8 }, (_, i) => <rect key={i} x={31 + i * 5} y="23" width="2.4" height="24" fill="#5B6B7A" />)}
      <rect x="26" y="48" width="48" height="5" fill="#5B6B7A" />
      <ellipse cx="50" cy="10" rx="6" ry="8" fill="#5B6B7A" />
    </svg>
    {/* left security border */}
    <div className="absolute left-0 top-0 bottom-0 w-[4.5%]" style={{ background: 'repeating-linear-gradient(45deg, #2E3F78 0 2px, #9BA6C9 2px 4px)' }} />
    {/* right gold border */}
    <div className="absolute right-0 top-[3%] bottom-[24%] w-[5%]" style={{ background: 'repeating-linear-gradient(-45deg, #A8964F 0 2px, #D9CC8C 2px 4px)' }} />
    {/* header: VISA block + red title banner */}
    <div className="absolute left-[4.5%] top-0 w-[33%] h-[17%] flex items-center justify-center" style={{ background: 'repeating-linear-gradient(60deg, #34477F 0 3px, #5D6FA6 3px 6px)' }}>
      <span style={{ fontSize: '8cqw', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.05em', fontFamily: 'Urbanist, sans-serif', textShadow: '0 0.3cqw 0 #1B2A4A' }}>VISA</span>
    </div>
    <div className="absolute left-[37.5%] right-[5%] top-0 h-[17%] flex flex-col items-center justify-center" style={{ background: 'repeating-linear-gradient(60deg, #B3242B 0 3px, #D2555A 3px 6px)' }}>
      <span style={{ fontSize: '4.3cqw', fontWeight: 900, color: '#9E1C24', lineHeight: 1, fontFamily: 'Georgia, serif', WebkitTextStroke: '0.25cqw #FFFFFF', letterSpacing: '0.02em' }}>UNITED STATES</span>
      <span style={{ fontSize: '4.3cqw', fontWeight: 900, color: '#9E1C24', lineHeight: 1, fontFamily: 'Georgia, serif', WebkitTextStroke: '0.25cqw #FFFFFF', letterSpacing: '0.02em' }}>OF AMERICA</span>
    </div>
    {/* photo */}
    <div className="absolute left-[7.5%] top-[19%] w-[22%] h-[46%] overflow-hidden"><YouPhoto bg="#EEF0F1" accent="#B3242B" /></div>
    <div className="absolute left-[31.5%] top-[20%] bottom-[34%] w-[0.25%] bg-[#16130F]/60" />
    {/* fields */}
    <Field k="Issuing Post Name" v="MUMBAI" x="33%" y="19%" big />
    <Field k="Control Number" v="20270512340007" x="64%" y="19%" big />
    <Field k="Surname" v="YOU" x="33%" y="29%" big color="#B3242B" />
    <Field k="Given Name" v="FUTURE STUDENT" x="33%" y="39%" big />
    <Field k="Visa Type/Class" v="R    F1" x="74%" y="39%" big />
    <Field k="Passport Number" v="UC2027050" x="33%" y="49%" />
    <Field k="Sex" v="M" x="56%" y="49%" />
    <Field k="Birth Date" v="04DEC2004" x="64%" y="49%" />
    <Field k="Nationality" v="IND" x="82%" y="49%" />
    <Field k="Entries" v="M" x="33%" y="59%" />
    <Field k="Issue Date" v="20JUN2027" x="44%" y="59%" />
    <Field k="Expiration Date" v="19JUN2032" x="64%" y="59%" />
    <Field k="Annotation" v="SEVIS N0012345678  STUDENT" x="7.5%" y="69%" />
    {/* MRZ */}
    <div className="absolute left-[6%] right-[6%] bottom-[3%] font-mono leading-[1.3]" style={{ fontSize: '3.3cqw', color: INK, letterSpacing: '0.06em' }}>
      <div className="whitespace-nowrap overflow-hidden">VNUSAYOU&lt;&lt;FUTURE&lt;STUDENT&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
      <div className="whitespace-nowrap overflow-hidden">UC2027050&lt;5IND0412042F3206199R1F&lt;&lt;&lt;&lt;&lt;</div>
    </div>
    <Specimen />
  </div>
);

/* Australia: plain label, diagonal orange band with a pale centre, class lines, grant text. No photo, like the real label. */
export const AuVisa = () => (
  <div className="relative w-full aspect-[1.77/1] overflow-hidden rounded-[6px] [container-type:inline-size]"
    style={{ background: '#EFE8D8', fontFamily: 'ui-monospace, Menlo, monospace', color: INK }}>
    <div className="absolute left-[4%] top-[5%]" style={{ fontSize: '3.4cqw' }}>UC20270533C1 WA 500</div>
    <div className="absolute right-[10%] top-[5%]" style={{ fontSize: '3.4cqw' }}>UC20270533C</div>
    {/* striped band */}
    <div className="absolute left-0 right-[8%] top-[14%] h-[46%]" style={{ background: 'repeating-linear-gradient(120deg, #E8743B 0 3px, #F5B48C 3px 7px)' }}>
      <div className="absolute left-[34%] w-[34%] top-0 bottom-0" style={{ background: 'radial-gradient(ellipse at center, #FFF6EE 30%, rgba(255,246,238,0.85) 55%, rgba(255,246,238,0) 75%)' }} />
      {/* stylised crest: shield and two figures */}
      <svg className="absolute left-[42%] top-[18%] w-[18%] opacity-50" viewBox="0 0 60 50" aria-hidden="true">
        <path d="M22 10h16v18c0 7-8 11-8 11s-8-4-8-11z" fill="none" stroke="#C4602E" strokeWidth="1.6" />
        <path d="M10 40c2-10 6-18 10-22M50 40c-2-10-6-18-10-22" stroke="#C4602E" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <circle cx="30" cy="6" r="3" fill="#C4602E" />
      </svg>
      <div className="absolute left-[4%] top-[8%] leading-[1.5]" style={{ fontSize: '3.3cqw', fontFamily: 'Onest, sans-serif', fontWeight: 600 }}>
        <div style={{ fontWeight: 800, fontSize: '3.8cqw' }}>AUSTRALIA VISA</div>
        <div className="mt-[3cqw]">NEW DELHI</div>
        <div className="mt-[1.5cqw]" style={{ fontWeight: 900, fontSize: '4.4cqw', color: '#16130F' }}>YOU</div>
        <div className="mt-[0.5cqw] tracking-[0.3em] opacity-60">- - - - - - - - - -</div>
      </div>
      <div className="absolute left-[45%] top-[8%] leading-[1.35]" style={{ fontSize: '3.3cqw' }}>
        <div>CLASS TU STUDENT</div>
        <div>SUB CLASS 500</div>
        <div>CONDITIONS 8105 8202</div>
        <div className="mt-[2cqw]">8105 WORK LIMITATION</div>
        <div>8202 MEET COURSE REQS</div>
      </div>
    </div>
    <div className="absolute right-[2.5%] top-[22%] origin-center rotate-90 translate-x-[35%]" style={{ fontSize: '3.2cqw' }}>UC1050027</div>
    <div className="absolute left-[4%] right-[4%] top-[63%] leading-[1.35]" style={{ fontSize: '2.9cqw' }}>
      GRANTED 20JUN27.<br />HOLDER(S) PERMITTED TO REMAIN IN AUSTRALIA UNTIL 31 DEC 2029.
    </div>
    <div className="absolute left-[4%] bottom-[4%]" style={{ fontSize: '3.4cqw' }}>V500&lt;UC20270533C</div>
    <Specimen color="rgba(160,70,30,0.28)" top="42%" />
  </div>
);

const QR = () => {
  // deterministic pattern so it never looks like a real code
  const cells = Array.from({ length: 81 }, (_, i) => ((i * 37 + (i % 7) * 11) % 5) < 2);
  return (
    <div className="grid grid-cols-9 w-full h-full p-[6%] bg-white">
      {cells.map((on, i) => <span key={i} style={{ background: on ? INK : 'transparent' }} />)}
    </div>
  );
};

/* Schengen (France issued): EU box, country line, photo left, hologram, QR, MRZ */
export const SchengenVisa = () => (
  <div className="relative w-full aspect-[1.48/1] overflow-hidden rounded-[6px] [container-type:inline-size]"
    style={{ background: 'linear-gradient(125deg, #E4E9CF 0%, #EEF0DC 35%, #DDE6D5 65%, #EBE6CF 100%)', fontFamily: 'Onest, sans-serif', color: INK }}>
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 68" aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d={`M0 ${4 + i * 5.5} Q 12 ${1 + i * 5.5} 25 ${4 + i * 5.5} T 50 ${4 + i * 5.5} T 75 ${4 + i * 5.5} T 100 ${4 + i * 5.5}`} fill="none" stroke="#7E8E5A" strokeWidth="0.15" opacity="0.5" />
      ))}
    </svg>
    {/* vertical number */}
    <div className="absolute left-[0.5%] top-[40%] -rotate-90 origin-left" style={{ fontSize: '3cqw', color: '#B3242B', fontWeight: 700, letterSpacing: '0.1em' }}>UC2027051</div>
    {/* EU box + VISA */}
    <div className="absolute left-[4%] top-[4%] w-[8%] aspect-square bg-[#2E4A86] grid place-items-center">
      <svg viewBox="0 0 40 40" className="w-[80%]" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return <circle key={i} cx={20 + Math.cos(a) * 12} cy={20 + Math.sin(a) * 12} r="2" fill="#F2C230" />; })}
      </svg>
    </div>
    <div className="absolute left-[14%] top-[3.5%] leading-none">
      <div style={{ fontSize: '6cqw', fontWeight: 800, color: '#2E4A86', letterSpacing: '0.04em' }}>VISA</div>
      <div style={{ fontSize: '2.2cqw', fontWeight: 700, color: '#2E4A86', marginTop: '0.6cqw' }}>FRANCE/FRANCE/FRANCE</div>
    </div>
    <div className="absolute left-[46%] top-[5%] px-[1.2%] border border-[#2E4A86]/50 bg-[#2E4A86]/10" style={{ fontSize: '3.4cqw', fontWeight: 800, color: '#2E4A86' }}>FRA</div>
    <div className="absolute right-[5%] top-[4.5%]" style={{ fontSize: '4.2cqw', fontWeight: 700, letterSpacing: '0.04em' }}>UC2027051</div>
    {/* photo */}
    <div className="absolute left-[4%] top-[27%] w-[19%] h-[40%] overflow-hidden border border-[#16130F]/15"><YouPhoto bg="#E9ECEE" accent="#2E4A86" /></div>
    {/* fields */}
    <div className="absolute left-[26%] top-[19%]" style={{ fontSize: '2.9cqw', fontWeight: 700 }}>ETATS SCHENGEN</div>
    <div className="absolute left-[26%] top-[28%] grid grid-cols-3 gap-x-[4cqw] gap-y-[1.6cqw] font-mono" style={{ fontSize: '2.8cqw' }}>
      {[['DU', '01-09-27'], ['AU', '31-08-28'], ['TYPE', 'D'], ['ENTRÉES', 'MULT'], ['JOURS', '365'], ['ÉMIS', 'NEW DELHI']].map(([k, val]) => (
        <div key={k}><div style={{ fontSize: '1.9cqw', opacity: 0.6 }}>{k}</div><div style={{ fontWeight: 700 }}>{val}</div></div>
      ))}
    </div>
    <div className="absolute left-[26%] top-[57%] font-mono leading-[1.3]" style={{ fontSize: '2.8cqw', fontWeight: 700 }}>
      <div style={{ color: '#2E4A86', fontSize: '3.6cqw', fontWeight: 900 }}>YOU&lt;&lt;FUTURE&lt;STUDENT</div>
      <div style={{ fontWeight: 500, opacity: 0.75 }}>ÉTUDIANT · UC2027051</div>
    </div>
    {/* hologram */}
    <div className="absolute left-[63%] top-[64%] w-[10%] aspect-square rounded-full grid place-items-center"
      style={{ background: 'conic-gradient(from 30deg, #E9D9A6, #C9E1E8, #E8C9DA, #D6E6C2, #E9D9A6)', boxShadow: 'inset 0 0 0 0.4cqw rgba(46,74,134,0.35)' }}>
      <span style={{ fontSize: '3.4cqw', fontWeight: 900, color: '#2E4A86' }}>EU</span>
    </div>
    {/* QR */}
    <div className="absolute right-[5%] top-[44%] w-[15%] aspect-square border border-[#16130F]/20"><QR /></div>
    {/* MRZ */}
    <div className="absolute left-[4%] right-[4%] bottom-[3.5%] font-mono leading-[1.35] bg-white/30" style={{ fontSize: '3.15cqw', letterSpacing: '0.05em' }}>
      <div className="whitespace-nowrap overflow-hidden">VDFRAYOU&lt;&lt;FUTURE&lt;STUDENT&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
      <div className="whitespace-nowrap overflow-hidden">UC20270514IND0412042F2808312&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
    </div>
    <Specimen top="40%" />
  </div>
);
