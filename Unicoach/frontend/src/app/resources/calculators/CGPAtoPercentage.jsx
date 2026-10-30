import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRightLeft, HelpCircle, AlertCircle, Award } from 'lucide-react';
import { VersusCard } from '../../../components/ui/Infographics';
import { DesiHero, DesiHeading, InkCard, Sticker } from '../../../components/desi/DesiKit';
import { DESI, INK } from '../../../components/desi/desiTokens';
import { BookOkCta } from '../../../components/desi/BookOkCta';

/* ── Desi Pop calculator kit: ink-bordered card, cream inputs, sindoor pill, railway-board result ── */
const TONE = DESI.rani;

const LABEL = 'text-[11px] font-extrabold uppercase tracking-wider text-[#5B544A]';
const INPUT = 'w-full h-12 px-3.5 bg-[#FFF6E5] border-[3px] border-[#16130F] rounded-[10px] font-urbanist text-[18px] font-extrabold text-[#16130F] placeholder:text-[#8A7F70] placeholder:font-semibold outline-none focus:bg-white focus:shadow-[3px_3px_0_#B8285B] transition-shadow';
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

// Big hook number, ink-bordered, in the page's tone
const HookStrip = ({ value, label, hi }) => (
    <InkCard className="flex flex-col sm:flex-row overflow-hidden" shadow="#D0362E">
        <div className="px-6 py-4 flex items-center border-b-[3px] sm:border-b-0 sm:border-r-[3px] border-[#16130F]" style={{ background: TONE.bg, color: TONE.fg }}>
            <span className="font-urbanist font-black text-[44px] sm:text-[52px] leading-none tracking-[-0.04em] whitespace-nowrap">{value}</span>
        </div>
        <div className="flex-1 flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
            <p className="flex-1 min-w-[200px] text-[14.5px] font-semibold leading-snug text-[#3D362E]">{label}</p>
            {hi && <span className="font-urbanist font-extrabold text-[26px] leading-none text-[#D0362E]">{hi}</span>}
        </div>
    </InkCard>
);


const CGPAtoPercentage = () => {
    const [activeTab, setActiveTab] = useState('cgpa-to-percentage'); // 'cgpa-to-percentage' or 'percentage-to-cgpa'
    const [cgpaInput, setCgpaInput] = useState('');
    const [percentageInput, setPercentageInput] = useState('');
    const [formulaType, setFormulaType] = useState('cbse'); // 'cbse' (* 9.5) or 'general' (* 10)
    
    // Result states
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleConvert = (e) => {
        e.preventDefault();
        setError('');
        setResult(null);

        if (activeTab === 'cgpa-to-percentage') {
            const val = parseFloat(cgpaInput);
            if (isNaN(val) || val < 0 || val > 10) {
                setError('Please enter a valid CGPA between 0 and 10.');
                return;
            }

            let percentage;
            let formulaDesc;
            if (formulaType === 'cbse') {
                percentage = val * 9.5;
                formulaDesc = 'CGPA × 9.5 (Standard CBSE Board formula)';
            } else {
                percentage = val * 10.0;
                formulaDesc = 'CGPA × 10.0 (Standard University scale)';
            }

            let gradeClass;
            if (percentage >= 75) gradeClass = 'First Division with Distinction';
            else if (percentage >= 60) gradeClass = 'First Division';
            else if (percentage >= 50) gradeClass = 'Second Division';
            else if (percentage >= 33) gradeClass = 'Third Division / Pass';
            else gradeClass = 'Fail';

            setResult({
                percentage: percentage.toFixed(1),
                cgpa: val,
                formula: formulaDesc,
                gradeClass,
                note: `According to the ${formulaType === 'cbse' ? 'CBSE' : 'general university'} guidelines, a CGPA of ${val} is equivalent to ${percentage.toFixed(1)}%.`
            });
        } else {
            const val = parseFloat(percentageInput);
            if (isNaN(val) || val < 0 || val > 100) {
                setError('Please enter a valid percentage between 0 and 100.');
                return;
            }

            let cgpa;
            let formulaDesc;
            if (formulaType === 'cbse') {
                cgpa = val / 9.5;
                // Cap at 10
                if (cgpa > 10) cgpa = 10;
                formulaDesc = 'Percentage ÷ 9.5 (CBSE Scale)';
            } else {
                cgpa = val / 10.0;
                formulaDesc = 'Percentage ÷ 10.0 (General Scale)';
            }

            setResult({
                cgpa: cgpa.toFixed(2),
                percentage: val,
                formula: formulaDesc,
                gradeClass: val >= 75 ? 'First Class with Dist.' : val >= 60 ? 'First Class' : 'Second Class',
                note: `Reversing the multiplier yields an equivalent CGPA of ${cgpa.toFixed(2)}.`
            });
        }
    };

    return (
        <main className="min-h-screen bg-[#FFF6E5] pb-16 font-['Onest',sans-serif] text-[#16130F]">
            {/* ── HERO: rani poster band, the converter is the hero piece ── */}
            <DesiHero
                tone="rani"
                sign={{ hi: 'प्रतिशत का हिसाब', en: 'PERCENT CALCULATOR' }}
                crumbs={[{ label: 'Home', to: '/' }, { label: 'Resources' }, { label: 'CGPA to Percentage' }]}
                title="CGPA to percentage converter"
                subtitle="Turn your 10-point CGPA into a percentage using the CBSE or general university rule."
                stickers={(
                    <>
                        <Sticker tilt={-2}><b>1</b> CGPA <span className="font-medium opacity-70">Your score</span></Sticker>
                        <Sticker bg="#FCE38A" tilt={1.5}><b>2</b> Pick a scale <span className="font-medium opacity-70">× 9.5 or × 10</span></Sticker>
                        <Sticker bg="#DDF3EF" tilt={-1}><b>3</b> Percentage <span className="font-medium opacity-70">Instant</span></Sticker>
                    </>
                )}
                aside={(
                    <CalcCard hi="Formula time" en="CGPA TO PERCENT">
                        {/* Direction */}
                        <div className="flex flex-wrap gap-2">
                            <InkPill on={activeTab === 'cgpa-to-percentage'} onClick={() => { setActiveTab('cgpa-to-percentage'); setResult(null); setError(''); }}>
                                <Sparkles size={14} /> CGPA to Percentage
                            </InkPill>
                            <InkPill on={activeTab === 'percentage-to-cgpa'} onClick={() => { setActiveTab('percentage-to-cgpa'); setResult(null); setError(''); }}>
                                <ArrowRightLeft size={14} /> Percentage to CGPA
                            </InkPill>
                        </div>

                        <div className="mt-5 pt-5 border-t-2 border-dashed border-[#16130F]/30">
                            <form onSubmit={handleConvert} className="space-y-5">
                                <div className="flex flex-col gap-2">
                                    <span className={LABEL}>Board standard</span>
                                    <div className="flex flex-wrap gap-2">
                                        <InkPill tone={TONE} on={formulaType === 'cbse'} onClick={() => setFormulaType('cbse')}>CBSE scale (× 9.5)</InkPill>
                                        <InkPill tone={TONE} on={formulaType === 'general'} onClick={() => setFormulaType('general')}>General scale (× 10)</InkPill>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                                    {activeTab === 'cgpa-to-percentage' ? (
                                        <Field label="CGPA (10-point scale) *" hint="Max 10.0">
                                            <input
                                                id="cgpaInput"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="10"
                                                value={cgpaInput}
                                                onChange={(e) => setCgpaInput(e.target.value)}
                                                placeholder="e.g. 8.2"
                                                className={INPUT}
                                                required
                                            />
                                        </Field>
                                    ) : (
                                        <Field label="Percentage (%) *" hint="Max 100%">
                                            <input
                                                id="percentageInput"
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="100"
                                                value={percentageInput}
                                                onChange={(e) => setPercentageInput(e.target.value)}
                                                placeholder="e.g. 78.5"
                                                className={INPUT}
                                                required
                                            />
                                        </Field>
                                    )}
                                </div>

                                <button type="submit" className={BUTTON}>
                                    Convert
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
                                            watermark="%"
                                            heading="Calculation Results"
                                            value={activeTab === 'cgpa-to-percentage' ? `${result.percentage}%` : result.cgpa}
                                            unit={activeTab === 'percentage-to-cgpa' ? 'out of 10.0' : null}
                                            stamp={<><Award size={14} /><span>{result.gradeClass}</span></>}
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
                {/* Hook number */}
                <HookStrip
                    value="× 9.5"
                    label="The CBSE multiplier for CGPA to percentage. A standard 10-point university scale uses × 10."
                    hi="Formula"
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Explainer */}
                    <InkCard className="p-6 md:p-7 space-y-4" shadow={TONE.bg}>
                        <div className="flex items-start gap-3">
                            <span className="w-10 h-10 rounded-full border-2 border-[#16130F] text-white grid place-items-center shrink-0 shadow-[2px_2px_0_#16130F]" style={{ background: TONE.bg }}>
                                <HelpCircle size={18} />
                            </span>
                            <DesiHeading hi="9.5 hi kyun?">Why a 9.5 Multiplier?</DesiHeading>
                        </div>
                        <p className="text-[#5B544A] text-[14.5px] leading-relaxed">
                            The Central Board of Secondary Education (CBSE) analyzed the last five years of student scores and concluded that the average percentage scored by top performance groups sits around 95 marks. Thus, a linear 9.5 multiplier was established for converting CGPA to percentages:
                        </p>
                        <div className="bg-[#F2B705] px-4 py-3 rounded-xl border-[3px] border-[#16130F] shadow-[3px_3px_0_#16130F] text-center font-urbanist font-black text-[#16130F] text-[16px]">
                            Percentage = CGPA × 9.5
                        </div>
                        <p className="text-[#5B544A] text-[14.5px] leading-relaxed">
                            For general engineering and non-engineering colleges under AICTE, a standard 10-point scale usually maps directly:
                        </p>
                        <div className="bg-[#14837E] px-4 py-3 rounded-xl border-[3px] border-[#16130F] shadow-[3px_3px_0_#16130F] text-center font-urbanist font-black text-white text-[16px]">
                            Percentage = CGPA × 10
                        </div>
                    </InkCard>

                    {/* The two formulas this converter offers, side by side */}
                    <VersusCard
                        kicker="Which formula?"
                        title="CBSE scale vs university scale"
                        left={{ title: 'CBSE scale', tag: '× 9.5', points: ['Percentage = CGPA × 9.5', 'Set by CBSE from the last five years of student scores'] }}
                        right={{ title: 'University scale', tag: '× 10', points: ['Percentage = CGPA × 10', 'Usual for engineering and non-engineering colleges under AICTE'] }}
                    />
                </div>

                <BookOkCta
                    hi="Percentage ke baad?"
                    text="Percentage nikal liya? Ab is score pe kahan apply karein, free call pe mentor se poochho. 1:1, ek ghante ki baat."
                />
            </div>
        </main>
    );
};

export default CGPAtoPercentage;
