import './desi.css';

/**
 * Desi Pop: Indian pop-art poster pieces (railway board, STD sign, truck-art frame,
 * postage stamp, puffy Devanagari). All drawn in CSS, no images.
 */

/* Railway station board: Hindi + English name and a small code row */
export const RailwayBoard = ({ hi, en, codeLeft, codeRight, className = '' }) => (
  <div className={`dp-rail ${className}`}>
    <span className="dp-rail-sun" aria-hidden="true" />
    <span className="dp-rail-post dp-rail-post--l" aria-hidden="true" />
    <span className="dp-rail-post dp-rail-post--r" aria-hidden="true" />
    <div className="dp-rail-board">
      <span className="dp-rail-hi">{hi}</span>
      <span className="dp-rail-en">{en}</span>
      {(codeLeft || codeRight) && (
        <span className="dp-rail-code"><span>{codeLeft}</span><span>{codeRight}</span></span>
      )}
    </div>
  </div>
);

/* STD booth style sign: stacked English words, a Hindi word and an arrow */
export const StdSign = ({ words, hi, className = '' }) => (
  <div className={`dp-std dp-paper ${className}`} aria-hidden="true">
    {words.map((w) => <span key={w} className="dp-std-en">{w}</span>)}
    <span className="dp-std-hi">{hi}</span>
    <span className="dp-std-arrow" />
  </div>
);

/* Truck-art frame: rani pink border, dotted marigold ring, teal inside */
export const TruckArtFrame = ({ children, className = '' }) => (
  <div className={`dp-truck ${className}`}>
    <div className="dp-truck-in">{children}</div>
  </div>
);

/* Postage stamp with perforated edges */
export const PostageStamp = ({ value, title, hi, note, className = '' }) => (
  <div className={`dp-stamp ${className}`} aria-hidden="true">
    <div className="dp-stamp-face">
      {value && <span className="dp-stamp-value">{value}</span>}
      <span className="dp-stamp-title">{title}</span>
      {hi && <span className="dp-stamp-hi">{hi}</span>}
      {note && <span className="dp-stamp-note">{note}</span>}
    </div>
  </div>
);

/* Puffy 3D Devanagari word on a marigold tile */
export const PuffyWord = ({ children, className = '' }) => (
  <div className={`dp-puffy ${className}`} aria-hidden="true">
    <span className="dp-puffy-frame" />
    <span className="dp-puffy-spark" style={{ left: '14%', top: '16%' }}>✦</span>
    <span className="dp-puffy-spark dp-puffy-spark--sm" style={{ right: '16%', top: '26%' }}>✦</span>
    <span className="dp-puffy-spark dp-puffy-spark--sm" style={{ left: '22%', bottom: '18%' }}>✦</span>
    <span className="dp-puffy-word">{children}</span>
  </div>
);
