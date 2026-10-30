import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRightLeft, HelpCircle, AlertCircle, Award } from 'lucide-react';
import { DesiHero, DesiHeading, InkCard, Sticker } from '../../../components/desi/DesiKit';
import { DESI, INK } from '../../../components/desi/desiTokens';
import { BookOkCta } from '../../../components/desi/BookOkCta';

/* ── Desi Pop calculator kit: ink-bordered card, cream inputs, sindoor pill, railway-board result ── */
const TONE = DESI.mustard;

const LABEL = 'text-[11px] font-extrabold uppercase tracking-wider text-[#5B544A]';
const INPUT = 'w-full h-12 px-3.5 bg-[#FFF6E5] border-[3px] border-[#16130F] rounded-[10px] font-urbanist text-[18px] font-extrabold text-[#16130F] placeholder:text-[#8A7F70] placeholder:font-semibold outline-none focus:bg-white focus:shadow-[3px_3px_0_#16130F] transition-shadow';
const BUTTON = 'w-full sm:w-auto h-12 px-7 inline-flex items-center justify-center gap-2 rounded-full bg-[#D0362E] text-white text-[15px] font-extrabold border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#16130F] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#16130F] transition-all';
const ERROR_BOX = 'mt-6 flex items-start gap-2.5 p-4 rounded-xl bg-[#FCE3DA] text-[#9E2620] text-[13px] font-bold border-[3px] border-[#16130F] shadow-[3px_3px_0_#D0362E]';

const CalcCard = ({ hi, en, children }) => (
    <div className="bg-white text-[#16130F] border-[3px] border-[#16130F] rounded-[18px] shadow-[8px_8px_0_#16130F] overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-[#16130F]">
            <span className="font-urbanist font-extrabold text-[18px] leading-none text-[#F2B705]">{hi}</span>
            <span className="font-['Anton',sans-serif] tracking-[0.14em] text-[12px] leading-none text-white">{en}</span>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
    </div>
);

const InkPill = ({ on, tone = { bg: INK, fg: '#FFFFFF' }, children, ...props }) => (
    <button
        type="button"
        aria-pressed={on}
        {...props}
        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border-2 border-[#16130F] text-[13px] font-bold transition-all ${on ? 'shadow-[2px_2px_0_#16130F]' : 'bg-[#FFF6E5] text-[#3D362E] hover:bg-white'}`}
        style={on ? { background: tone.bg, color: tone.fg } : undefined}
    >
        {children}
    </button>
);

const Field = ({ label, hint, children }) => (
    <label className="flex flex-col gap-1.5 min-w-0">
        <span className={LABEL}>{label}</span>
        {children}
        {hint && <span className="text-[11.5px] font-semibold text-[#5B544A] leading-tight">{hint}</span>}
    </label>
);

// The result, painted like a railway departure board with a stamped ticket stub below
const ResultBoard = ({ watermark, heading, label, value, unit, stamp, meta, children }) => (
    <div className="border-[3px] border-[#16130F] rounded-[14px] overflow-hidden shadow-[5px_5px_0_#D0362E]">
        <div className="relative overflow-hidden bg-[#16130F] text-white px-5 py-5 sm:px-6">
            <span aria-hidden="true" className="absolute right-[-8px] bottom-[-20px] font-['Anton',sans-serif] text-[96px] leading-none text-white/[0.06] select-none pointer-events-none">{watermark}</span>
            <h4 className="relative font-['Anton',sans-serif] tracking-[0.16em] text-[12px] uppercase text-[#F2B705]">{heading}</h4>
            <div className="relative mt-3 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="min-w-0">
                    {label && <span className="block text-[11px] font-extrabold uppercase tracking-wider text-white/60 mb-1">{label}</span>}
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-['Anton',sans-serif] text-[56px] sm:text-[72px] leading-[0.95] tracking-wide text-[#F2B705] break-all">{value}</span>
                        {unit && <span className="text-[14px] font-bold text-white/70">{unit}</span>}
                    </div>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-2.5 min-w-0">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border-[3px] border-[#D0362E] bg-[#FFF6E5] text-[#D0362E] text-[13px] font-black -rotate-3 shadow-[2px_2px_0_#D0362E]">{stamp}</span>
                    {meta && <p className="text-[12px] font-bold text-white/70 break-words sm:text-right">{meta}</p>}
                </div>
            </div>
        </div>
        <div className="relative bg-[#FFF6E5] border-t-[3px] border-dashed border-[#16130F] px-5 py-4 sm:px-6 text-[13px] text-[#3D362E] font-medium leading-relaxed">
            <span aria-hidden="true" className="absolute -top-[12px] -left-[12px] w-5 h-5 rounded-full bg-white border-[3px] border-[#16130F]" />
            <span aria-hidden="true" className="absolute -top-[12px] -right-[12px] w-5 h-5 rounded-full bg-white border-[3px] border-[#16130F]" />
            {children}
        </div>
    </div>
);


const CGPAtoMarks = () => {
    const [activeTab, setActiveTab] = useState('cgpa-to-marks'); // 'cgpa-to-marks' or 'marks-to-cgpa'
    const [cgpaInput, setCgpaInput] = useState('');
    const [obtainedMarksInput, setObtainedMarksInput] = useState('');
    const [maxMarksInput, setMaxMarksInput] = useState('500'); // Default to typical 5 subjects
    const [multiplier, setMultiplier] = useState(9.5); // CBSE standard 9.5 vs general 10.0
    
    // Result states
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleConvert = (e) => {
        e.preventDefault();
        setError('');
        setResult(null);

        const maxMarks = parseFloat(maxMarksInput);
        if (isNaN(maxMarks) || maxMarks <= 0) {
            setError('Please enter a valid Maximum Marks greater than 0.');
            return;
        }

        if (activeTab === 'cgpa-to-marks') {
            const cgpa = parseFloat(cgpaInput);
            if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
                setError('Please enter a valid CGPA between 0 and 10.');
                return;
            }

            // Formula: Obtained Marks = (CGPA * Multiplier / 100) * MaxMarks
            const percentage = cgpa * multiplier;
            const obtainedMarks = (percentage / 100) * maxMarks;

            if (obtainedMarks > maxMarks) {
                setError('Calculation exceeded Maximum Marks. Please check inputs.');
                return;
            }

            setResult({
                obtainedMarks: obtainedMarks.toFixed(1),
                maxMarks,
                percentage: percentage.toFixed(1),
                cgpa,
                formula: `(${cgpa} × ${multiplier} / 100) × ${maxMarks}`,
                note: `At a ${multiplier} conversion factor, CGPA ${cgpa} equates to ${percentage.toFixed(1)}%, yielding ${obtainedMarks.toFixed(1)} out of ${maxMarks} total marks.`
            });
        } else {
            const obtainedMarks = parseFloat(obtainedMarksInput);
            if (isNaN(obtainedMarks) || obtainedMarks < 0) {
                setError('Please enter valid obtained marks (greater than or equal to 0).');
                return;
            }

            if (obtainedMarks > maxMarks) {
                setError('Obtained marks cannot exceed Maximum Marks.');
                return;
            }

            // Formula: Percentage = (Obtained / Max) * 100
            // CGPA = Percentage / Multiplier
            const percentage = (obtainedMarks / maxMarks) * 100;
            let cgpa = percentage / multiplier;
            if (cgpa > 10.0) cgpa = 10.0; // Cap at 10.0

            setResult({
                cgpa: cgpa.toFixed(2),
                obtainedMarks,
                maxMarks,
                percentage: percentage.toFixed(1),
                formula: `(${obtainedMarks} / ${maxMarks} × 100) ÷ ${multiplier}`,
                note: `An aggregate score of ${obtainedMarks}/${maxMarks} equates to ${percentage.toFixed(1)}%. Dividing by the scale factor of ${multiplier} gives a CGPA of ${cgpa.toFixed(2)}.`
            });
        }
    };

    return (
        <main className="min-h-screen bg-[#FFF6E5] pb-16 font-['Onest',sans-serif] text-[#16130F]">
            {/* ── HERO: mustard poster band, the calculator is the hero piece ── */}
            <DesiHero
                tone="mustard"
                sign={{ hi: 'नंबर का हिसाब', en: 'MARKS CALCULATOR' }}
                crumbs={[{ label: 'Home', to: '/' }, { label: 'Resources' }, { label: 'CGPA to Marks' }]}
                title="CGPA to marks calculator"
                subtitle="Convert your CGPA to obtained marks, or marks back to CGPA, using your exam total."
                stickers={(
                    <>
                        <Sticker tilt={-2}><b>1</b> CGPA <span className="font-medium opacity-70">Your score</span></Sticker>
                        <Sticker bg="#FBD9E6" tilt={1.5}><b>2</b> × 9.5 or 10 <span className="font-medium opacity-70">Percentage</span></Sticker>
                        <Sticker bg="#DDF3EF" tilt={-1}><b>3</b> × Max marks <span className="font-medium opacity-70">÷ 100</span></Sticker>
                        <Sticker bg="#FCE3DA" tilt={1}><b>4</b> Marks <span className="font-medium opacity-70">Obtained</span></Sticker>
                    </>
                )}
                aside={(
                    <CalcCard hi="Quick maths" en="CGPA TO MARKS">
                        {/* Direction */}
                        <div className="flex flex-wrap gap-2">
                            <InkPill on={activeTab === 'cgpa-to-marks'} onClick={() => { setActiveTab('cgpa-to-marks'); setResult(null); setError(''); }}>
                                <Sparkles size={14} /> CGPA to Marks
                            </InkPill>
                            <InkPill on={activeTab === 'marks-to-cgpa'} onClick={() => { setActiveTab('marks-to-cgpa'); setResult(null); setError(''); }}>
                                <ArrowRightLeft size={14} /> Marks to CGPA
                            </InkPill>
                        </div>

                        <div className="mt-5 pt-5 border-t-2 border-dashed border-[#16130F]/30">
                            <form onSubmit={handleConvert} className="space-y-5">
                                <div className="flex flex-col gap-2">
                                    <span className={LABEL}>Conversion factor</span>
                                    <div className="flex flex-wrap gap-2">
                                        <InkPill tone={TONE} on={multiplier === 9.5} onClick={() => setMultiplier(9.5)}>CBSE factor (9.5)</InkPill>
                                        <InkPill tone={TONE} on={multiplier === 10.0} onClick={() => setMultiplier(10.0)}>General factor (10.0)</InkPill>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                                    <Field label="Maximum marks *">
                                        <input
                                            id="maxMarksInput"
                                            type="number"
                                            min="1"
                                            value={maxMarksInput}
                                            onChange={(e) => setMaxMarksInput(e.target.value)}
                                            placeholder="e.g. 500 or 1000"
                                            className={INPUT}
                                            required
                                        />
                                    </Field>
                                    {activeTab === 'cgpa-to-marks' ? (
                                        <Field label="CGPA (10-point scale) *" hint="Max 10.0">
                                            <input
                                                id="cgpaInput"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="10"
                                                value={cgpaInput}
                                                onChange={(e) => setCgpaInput(e.target.value)}
                                                placeholder="e.g. 8.4"
                                                className={INPUT}
                                                required
                                            />
                                        </Field>
                                    ) : (
                                        <Field label="Obtained marks *">
                                            <input
                                                id="obtainedMarksInput"
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                value={obtainedMarksInput}
                                                onChange={(e) => setObtainedMarksInput(e.target.value)}
                                                placeholder="e.g. 425"
                                                className={INPUT}
                                                required
                                            />
                                        </Field>
                                    )}
                                </div>

                                <button type="submit" className={BUTTON}>
                                    Calculate marks
                                </button>
                            </form>

                            {/* Results display */}
                            <AnimatePresence mode="wait">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className={ERROR_BOX}
                                    >
                                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                                        <span>{error}</span>
                                    </motion.div>
                                )}

                                {result && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-7"
                                    >
                                        <ResultBoard
                                            watermark="MARKS"
                                            heading="Conversion Result"
                                            label={activeTab === 'cgpa-to-marks' ? 'Obtained Marks' : 'CGPA Score'}
                                            value={activeTab === 'cgpa-to-marks' ? result.obtainedMarks : result.cgpa}
                                            unit={`/ ${activeTab === 'cgpa-to-marks' ? result.maxMarks : '10.0'}`}
                                            stamp={<><Award size={14} /><span>{result.percentage}% Marks</span></>}
                                            meta={`Formula: ${result.formula}`}
                                        >
                                            <strong>Multiplier note:</strong> {result.note} This provides a standard conversion for Indian boards, but you should verify with specific university requirements.
                                        </ResultBoard>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </CalcCard>
                )}
            />

            <div className="max-w-[1240px] mx-auto px-4 md:px-8 pt-12 space-y-8">
                {/* Explainer */}
                <InkCard className="p-6 md:p-8 space-y-5" shadow="#F2B705">
                    <div className="flex items-start gap-3">
                        <span className="w-10 h-10 rounded-full border-2 border-[#16130F] bg-[#F2B705] text-[#16130F] grid place-items-center shrink-0 shadow-[2px_2px_0_#16130F]">
                            <HelpCircle size={18} />
                        </span>
                        <DesiHeading hi="Kaise hota hai?">How It Works</DesiHeading>
                    </div>
                    <p className="text-[#5B544A] text-[14.5px] leading-relaxed max-w-3xl">
                        The conversion maps CGPA to a percentage value first (using standard 9.5 or 10 multipliers) and then scales it to your total maximum marks.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { title: '1. CGPA to Marks', formula: 'Obtained = (CGPA × Multiplier / 100) × Max Marks', bg: '#F2B705', fg: '#16130F' },
                            { title: '2. Marks to CGPA', formula: 'CGPA = (Obtained / Max Marks × 100) ÷ Multiplier', bg: '#14837E', fg: '#FFFFFF' },
                        ].map((s) => (
                            <div key={s.title} className="border-[3px] border-[#16130F] rounded-xl overflow-hidden shadow-[3px_3px_0_#16130F]">
                                <h4 className="px-4 py-2.5 border-b-[3px] border-[#16130F] font-urbanist font-black text-[15px]" style={{ background: s.bg, color: s.fg }}>{s.title}</h4>
                                <p className="px-4 py-3 bg-[#FFF6E5] text-[14px] font-semibold text-[#3D362E] break-words">{s.formula}</p>
                            </div>
                        ))}
                    </div>
                </InkCard>

                <BookOkCta
                    hi="Marks ke baad?"
                    text="Marks nikal liye? Ab is score pe kahan apply karein, free call pe mentor se poochho. 1:1, ek ghante ki baat."
                />
            </div>
        </main>
    );
};

export default CGPAtoMarks;
