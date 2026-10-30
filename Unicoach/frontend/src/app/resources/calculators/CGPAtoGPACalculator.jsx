import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, ArrowRightLeft, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';
import { BarCompare } from '../../../components/ui/Infographics';
import { DesiHero, DesiHeading, InkCard, Sticker } from '../../../components/desi/DesiKit';
import { DESI, INK } from '../../../components/desi/desiTokens';
import { BookOkCta } from '../../../components/desi/BookOkCta';

/* ── Desi Pop calculator kit: ink-bordered card, cream inputs, sindoor pill, railway-board result ── */
const TONE = DESI.teal;

const LABEL = 'text-[11px] font-extrabold uppercase tracking-wider text-[#5B544A]';
const INPUT = 'w-full h-12 px-3.5 bg-[#FFF6E5] border-[3px] border-[#16130F] rounded-[10px] font-urbanist text-[18px] font-extrabold text-[#16130F] placeholder:text-[#8A7F70] placeholder:font-semibold outline-none focus:bg-white focus:shadow-[3px_3px_0_#14837E] transition-shadow';
const BUTTON = 'w-full sm:w-auto h-12 px-7 inline-flex items-center justify-center gap-2 rounded-full bg-[#D0362E] text-white text-[15px] font-extrabold border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#16130F] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#16130F] transition-all';
const ERROR_BOX = 'mt-6 flex items-start gap-2.5 p-4 rounded-xl bg-[#FCE3DA] text-[#9E2620] text-[13px] font-bold border-[3px] border-[#16130F] shadow-[3px_3px_0_#D0362E]';

const CalcCard = ({ hi, en, children }) => (
    <div className="bg-white text-[#16130F] border-[3px] border-[#16130F] rounded-[18px] shadow-[8px_8px_0_#16130F] overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-[#16130F]">
            <span className="font-['Rozha_One',serif] text-[18px] leading-none text-[#F2B705]">{hi}</span>
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

// Big hook number, ink-bordered, in the page's tone
const HookStrip = ({ value, label, hi }) => (
    <InkCard className="flex flex-col sm:flex-row overflow-hidden" shadow="#D0362E">
        <div className="px-6 py-4 flex items-center border-b-[3px] sm:border-b-0 sm:border-r-[3px] border-[#16130F]" style={{ background: TONE.bg, color: TONE.fg }}>
            <span className="font-urbanist font-black text-[44px] sm:text-[52px] leading-none tracking-[-0.04em] whitespace-nowrap">{value}</span>
        </div>
        <div className="flex-1 flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
            <p className="flex-1 min-w-[200px] text-[14.5px] font-semibold leading-snug text-[#3D362E]">{label}</p>
            {hi && <span className="font-['Rozha_One',serif] text-[26px] leading-none text-[#D0362E]">{hi}</span>}
        </div>
    </InkCard>
);


const CGPAtoGPACalculator = () => {
    const [activeTab, setActiveTab] = useState('cgpa-to-gpa'); // 'cgpa-to-gpa' or 'gpa-to-cgpa'
    const [cgpaInput, setCgpaInput] = useState('');
    const [gpaInput, setGpaInput] = useState('');
    const [scaleType, setScaleType] = useState('us'); // 'us' or 'germany'
    
    // Result states
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleConvert = (e) => {
        e.preventDefault();
        setError('');
        setResult(null);

        if (activeTab === 'cgpa-to-gpa') {
            const val = parseFloat(cgpaInput);
            if (isNaN(val) || val < 0 || val > 10) {
                setError('Please enter a valid CGPA between 0 and 10.');
                return;
            }

            if (scaleType === 'us') {
                // US 4.0 Scale conversion. Standard formula: (CGPA / 10) * 4
                // Many institutions use: (CGPA * 0.4) or a mapping. Let's do (CGPA / 10) * 4
                const convertedGpa = (val / 10) * 4;
                
                // Let's add a rough grade descriptor
                let descriptor;
                let gradeClass;
                if (convertedGpa >= 3.7) { descriptor = 'Outstanding'; gradeClass = 'A'; }
                else if (convertedGpa >= 3.3) { descriptor = 'Very Good'; gradeClass = 'B+'; }
                else if (convertedGpa >= 3.0) { descriptor = 'Good'; gradeClass = 'B'; }
                else if (convertedGpa >= 2.7) { descriptor = 'Above Average'; gradeClass = 'B-'; }
                else if (convertedGpa >= 2.0) { descriptor = 'Average'; gradeClass = 'C'; }
                else { descriptor = 'Below Average'; gradeClass = 'D/F'; }

                setResult({
                    gpa: convertedGpa.toFixed(2),
                    cgpa: val,
                    scale: '4.0 Scale (US)',
                    descriptor,
                    gradeClass,
                    note: 'Calculated using the standard linear conversion formula.'
                });
            } else {
                // German Bavarian Formula: 1 + 3 * (10 - Nd) / (10 - Nmin)
                // Nd = Student's CGPA, Nmin = Minimum pass mark (usually 4.0)
                // Result scale: 1.0 (excellent) to 4.0 (sufficient)
                if (val < 4.0) {
                    setResult({
                        gpa: '5.0',
                        cgpa: val,
                        scale: '1.0 - 5.0 German Scale',
                        descriptor: 'Fail (Nicht ausreichend)',
                        gradeClass: 'F',
                        note: 'CGPA is below the minimum passing grade of 4.0.'
                    });
                } else {
                    const germanGpa = 1 + 3 * (10 - val) / (10 - 4);
                    let descriptor;
                    if (germanGpa <= 1.5) descriptor = 'Excellent (Sehr Gut)';
                    else if (germanGpa <= 2.5) descriptor = 'Good (Gut)';
                    else if (germanGpa <= 3.5) descriptor = 'Satisfactory (Befriedigend)';
                    else descriptor = 'Sufficient (Ausreichend)';

                    setResult({
                        gpa: germanGpa.toFixed(2),
                        cgpa: val,
                        scale: 'German Scale (1.0 - 5.0)',
                        descriptor,
                        gradeClass: germanGpa <= 2.0 ? 'A' : germanGpa <= 3.0 ? 'B' : 'C',
                        note: 'Calculated using the official Modified Bavarian Formula (Nmin = 4.0).'
                    });
                }
            }
        } else {
            const val = parseFloat(gpaInput);
            if (isNaN(val) || val < 0 || val > 4) {
                setError('Please enter a valid US GPA between 0 and 4.0.');
                return;
            }

            // Reverse linear: CGPA = (GPA / 4) * 10
            const convertedCgpa = (val / 4) * 10;
            setResult({
                gpa: val,
                cgpa: convertedCgpa.toFixed(2),
                scale: '10-Point Indian Scale',
                descriptor: val >= 3.7 ? 'Outstanding' : val >= 3.0 ? 'Good' : 'Average',
                gradeClass: val >= 3.5 ? 'First Class with Dist.' : 'First Class',
                note: 'Calculated using reverse linear mapping.'
            });
        }
    };

    return (
        <main className="min-h-screen bg-[#FFF6E5] pb-16 font-['Onest',sans-serif] text-[#16130F]">
            {/* ── HERO: teal poster band, the calculator is the hero piece ── */}
            <DesiHero
                tone="teal"
                sign={{ hi: 'हिसाब किताब', en: 'CGPA CALCULATOR' }}
                crumbs={[{ label: 'Home', to: '/' }, { label: 'Resources' }, { label: 'CGPA to GPA' }]}
                title="CGPA to GPA calculator"
                subtitle="Convert your Indian 10-point CGPA to the US 4.0 scale or the German Bavarian grade."
                stickers={(
                    <>
                        <Sticker tilt={-2}><b>1</b> CGPA <span className="font-medium opacity-70">Your score</span></Sticker>
                        <Sticker bg="#FCE38A" tilt={1.5}><b>2</b> Pick a scale <span className="font-medium opacity-70">US or Germany</span></Sticker>
                        <Sticker bg="#FBD9E6" tilt={-1}><b>3</b> GPA <span className="font-medium opacity-70">Instant</span></Sticker>
                    </>
                )}
                aside={(
                    <CalcCard hi="अंक बदलो" en="CGPA TO GPA">
                        {/* Direction */}
                        <div className="flex flex-wrap gap-2">
                            <InkPill on={activeTab === 'cgpa-to-gpa'} onClick={() => { setActiveTab('cgpa-to-gpa'); setResult(null); setError(''); }}>
                                <Sparkles size={14} /> CGPA to GPA
                            </InkPill>
                            <InkPill on={activeTab === 'gpa-to-cgpa'} onClick={() => { setActiveTab('gpa-to-cgpa'); setResult(null); setError(''); }}>
                                <ArrowRightLeft size={14} /> GPA to CGPA
                            </InkPill>
                        </div>

                        <div className="mt-5 pt-5 border-t-2 border-dashed border-[#16130F]/30">
                            <form onSubmit={handleConvert} className="space-y-5">
                                {activeTab === 'cgpa-to-gpa' ? (
                                    <>
                                        <div className="flex flex-col gap-2">
                                            <span className={LABEL}>Target grading scale</span>
                                            <div className="flex flex-wrap gap-2">
                                                <InkPill tone={TONE} on={scaleType === 'us'} onClick={() => setScaleType('us')}>US scale (4.0 max)</InkPill>
                                                <InkPill tone={TONE} on={scaleType === 'germany'} onClick={() => setScaleType('germany')}>German scale (Bavarian)</InkPill>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                                            <Field label="CGPA (10-point scale) *" hint="Max 10.0">
                                                <input
                                                    id="cgpaInput"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="10"
                                                    value={cgpaInput}
                                                    onChange={(e) => setCgpaInput(e.target.value)}
                                                    placeholder="e.g. 8.25"
                                                    className={INPUT}
                                                    required
                                                />
                                            </Field>
                                        </div>
                                    </>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                                        <Field label="US GPA (4.0 scale) *" hint="Max 4.0">
                                            <input
                                                id="gpaInput"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="4"
                                                value={gpaInput}
                                                onChange={(e) => setGpaInput(e.target.value)}
                                                placeholder="e.g. 3.45"
                                                className={INPUT}
                                                required
                                            />
                                        </Field>
                                    </div>
                                )}

                                <button type="submit" className={BUTTON}>
                                    Convert GPA
                                </button>
                            </form>

                            {/* Errors & Results */}
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
                                            watermark="GPA"
                                            heading="Conversion Result"
                                            value={activeTab === 'cgpa-to-gpa' ? result.gpa : result.cgpa}
                                            unit={`out of ${activeTab === 'cgpa-to-gpa' ? (scaleType === 'us' ? '4.0' : '1.0') : '10.0'}`}
                                            stamp={<><Award size={14} /><span>{result.descriptor}</span></>}
                                            meta={`Equivalent: ${result.scale}`}
                                        >
                                            <strong>Note:</strong> {result.note} This conversion is standard, but some universities might calculate your GPA subject-by-subject.
                                        </ResultBoard>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </CalcCard>
                )}
            />

            <div className="max-w-[1240px] mx-auto px-4 md:px-8 pt-12 space-y-8">
                {/* Hook number */}
                <HookStrip
                    value="4.0"
                    label="The top of the US GPA scale. Germany's Bavarian formula runs the other way: 1.0 is a perfect score, 4.0 the minimum pass."
                    hi="पैमाना"
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Explainer */}
                    <InkCard className="p-6 md:p-7 space-y-5" shadow={TONE.bg}>
                        <div className="flex items-start gap-3">
                            <span className="w-10 h-10 rounded-full border-2 border-[#16130F] text-white grid place-items-center shrink-0 shadow-[2px_2px_0_#16130F]" style={{ background: TONE.bg }}>
                                <HelpCircle size={18} />
                            </span>
                            <DesiHeading hi="पैमाने समझो">Understanding Scales</DesiHeading>
                        </div>
                        <p className="text-[#5B544A] text-[14.5px] leading-relaxed">
                            Foreign universities evaluate academic merits on custom grading systems. While US colleges require a 4.0 scale GPA, German universities use the Bavarian formula where 1.0 is a perfect score and 4.0 is minimum passing.
                        </p>
                        <div className="border-[3px] border-[#16130F] rounded-xl overflow-hidden">
                            <h4 className="px-4 py-2.5 bg-[#F2B705] border-b-[3px] border-[#16130F] text-[12px] font-extrabold uppercase tracking-widest text-[#16130F]">US GPA Conversion Chart</h4>
                            <div className="divide-y-2 divide-[#16130F]/15 text-[14px] bg-white">
                                {[
                                    ['CGPA 9.0 - 10.0', 'GPA 3.8 - 4.0'],
                                    ['CGPA 8.0 - 8.9', 'GPA 3.4 - 3.7'],
                                    ['CGPA 7.0 - 7.9', 'GPA 3.0 - 3.3'],
                                    ['CGPA 6.0 - 6.9', 'GPA 2.5 - 2.9'],
                                ].map(([c, g], i) => (
                                    <div key={c} className={`flex justify-between gap-3 px-4 py-2.5 font-bold ${i % 2 ? 'bg-[#FFF6E5]' : ''}`}>
                                        <span className="text-[#3D362E]">{c}</span>
                                        <span style={{ color: TONE.bg }}>{g}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </InkCard>

                    {/* The US GPA conversion chart from the sidebar, as bars (top of each GPA band) */}
                    <BarCompare
                        kicker="US GPA chart"
                        title="Your CGPA band on the 4.0 scale"
                        items={[
                            { label: 'CGPA 9.0–10.0', value: 4.0, display: 'GPA 3.8–4.0' },
                            { label: 'CGPA 8.0–8.9', value: 3.7, display: 'GPA 3.4–3.7' },
                            { label: 'CGPA 7.0–7.9', value: 3.3, display: 'GPA 3.0–3.3' },
                            { label: 'CGPA 6.0–6.9', value: 2.9, display: 'GPA 2.5–2.9' },
                        ]}
                    />
                </div>

                <BookOkCta
                    hi="GPA के बाद?"
                    text="GPA nikal liya? Ab is score pe kaunsi university fit hai, free call pe mentor se poochho. 1:1, ek ghante ki baat."
                />
            </div>
        </main>
    );
};

export default CGPAtoGPACalculator;
