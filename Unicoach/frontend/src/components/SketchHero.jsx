import { SKETCH_THEMES, SKETCH_MASK } from './destinationSketches';

// Country page hero art: the pencil sketch on its soft paper colour, with a small caption
const SketchHero = ({ country, alt, place, tagline }) => {
  const t = SKETCH_THEMES[country];
  return (
    <div className="w-full h-[320px] md:h-[380px] rounded-[36px] overflow-hidden shadow-xl border relative" style={{ background: t.bg, borderColor: t.line }}>
      <div className="absolute inset-x-6 top-4 bottom-[5.5rem]">
        <img
          src={t.sketch}
          alt={alt}
          className="w-full h-full object-contain mix-blend-multiply"
          style={{ maskImage: SKETCH_MASK, WebkitMaskImage: SKETCH_MASK }}
        />
      </div>
      <div className="absolute bottom-6 left-6 right-6">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: t.soft }}>{place}</p>
        <h3 className="text-xl font-black mt-1" style={{ color: t.ink }}>{tagline}</h3>
      </div>
    </div>
  );
};

export default SketchHero;
