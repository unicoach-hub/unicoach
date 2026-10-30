import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FinderPage, FinderHero, FinderCard, FinderField, FinderButton, FinderChip, FINDER_FIELD, FIELD_RADIUS } from '../../../components/ui/FinderForm';
import { Sparkles, ArrowRightLeft, HelpCircle, AlertCircle, Award } from 'lucide-react';

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
        <FinderPage>
            <FinderHero
                eyebrow="CGPA to Marks"
                title="CGPA to marks calculator"
                subtitle="Convert your CGPA to obtained marks, or marks back to CGPA, using your exam total."
                steps={[
                    { label: 'CGPA', sub: 'Your score' },
                    { label: '× 9.5 or 10', sub: 'Percentage' },
                    { label: '× Max marks', sub: '÷ 100' },
                    { label: 'Marks', sub: 'Obtained' },
                ]}
                active={0}
            />

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Main converter card */}
                <div className="lg:col-span-2">
                    <FinderCard>
                        
                        {/* Direction */}
                        <div className="flex flex-wrap gap-2">
                            <FinderChip on={activeTab === 'cgpa-to-marks'} onClick={() => { setActiveTab('cgpa-to-marks'); setResult(null); setError(''); }}>
                                <Sparkles size={14} /> CGPA to Marks
                            </FinderChip>
                            <FinderChip on={activeTab === 'marks-to-cgpa'} onClick={() => { setActiveTab('marks-to-cgpa'); setResult(null); setError(''); }}>
                                <ArrowRightLeft size={14} /> Marks to CGPA
                            </FinderChip>
                        </div>

                        <div className="mt-5 pt-5 border-t border-[#ECE6DA]">
                            <form onSubmit={handleConvert} className="space-y-4">
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-[12.5px] font-semibold text-[#16130F]">Conversion factor</span>
                                    <div className="flex flex-wrap gap-2">
                                        <FinderChip on={multiplier === 9.5} onClick={() => setMultiplier(9.5)}>CBSE factor (9.5)</FinderChip>
                                        <FinderChip on={multiplier === 10.0} onClick={() => setMultiplier(10.0)}>General factor (10.0)</FinderChip>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                                    <FinderField label="Maximum marks *">
                                        <input
                                            id="maxMarksInput"
                                            type="number"
                                            min="1"
                                            value={maxMarksInput}
                                            onChange={(e) => setMaxMarksInput(e.target.value)}
                                            placeholder="e.g. 500 or 1000"
                                            className={FINDER_FIELD}
                                            style={FIELD_RADIUS}
                                            required
                                        />
                                    </FinderField>
                                    {activeTab === 'cgpa-to-marks' ? (
                                        <FinderField label="CGPA (10-point scale) *" hint="Max 10.0">
                                            <input
                                                id="cgpaInput"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="10"
                                                value={cgpaInput}
                                                onChange={(e) => setCgpaInput(e.target.value)}
                                                placeholder="e.g. 8.4"
                                                className={FINDER_FIELD}
                                                style={FIELD_RADIUS}
                                                required
                                            />
                                        </FinderField>
                                    ) : (
                                        <FinderField label="Obtained marks *">
                                            <input
                                                id="obtainedMarksInput"
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                value={obtainedMarksInput}
                                                onChange={(e) => setObtainedMarksInput(e.target.value)}
                                                placeholder="e.g. 425"
                                                className={FINDER_FIELD}
                                                style={FIELD_RADIUS}
                                                required
                                            />
                                        </FinderField>
                                    )}
                                </div>

                                <FinderButton type="submit" className="w-full sm:w-auto">
                                    Calculate marks
                                </FinderButton>
                            </form>

                            {/* Results display */}
                            <AnimatePresence mode="wait">
                                {error && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="mt-6 flex items-start gap-2.5 p-4 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold border border-rose-100"
                                    >
                                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                                        <span>{error}</span>
                                    </motion.div>
                                )}

                                {result && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-8 bg-orange-50/40 border border-orange-100 rounded-2xl p-6 relative overflow-hidden"
                                    >
                                        <div className="absolute right-[-20px] bottom-[-20px] text-[#DE5C2B]/5 font-black text-8xl pointer-events-none select-none">
                                            MARKS
                                        </div>
                                        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">
                                            Conversion Result
                                        </h4>
                                        
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="space-y-1">
                                                <span className="text-xs font-bold text-slate-400 block uppercase">
                                                    {activeTab === 'cgpa-to-marks' ? 'Obtained Marks' : 'CGPA Score'}
                                                </span>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-4xl md:text-5xl font-black text-[#DE5C2B]">
                                                        {activeTab === 'cgpa-to-marks' ? result.obtainedMarks : result.cgpa}
                                                    </span>
                                                    <span className="text-slate-400 font-bold text-sm">
                                                        / {activeTab === 'cgpa-to-marks' ? result.maxMarks : '10.0'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="space-y-1 text-left md:text-right">
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-orange-100 rounded-full text-xs font-bold text-[#DE5C2B]">
                                                    <Award size={13} />
                                                    <span>{result.percentage}% Marks</span>
                                                </div>
                                                <p className="text-xs text-slate-400 font-bold tracking-tight pl-1 block">
                                                    Formula: {result.formula}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="w-full h-[1px] bg-orange-100/50 my-4" />
                                        <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                                            <strong>Multiplier note:</strong> {result.note} This provides a standard conversion for Indian boards, but you should verify with specific university requirements.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        </div>
                    </FinderCard>
                </div>

                {/* Explanatory Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border border-[#E6E0D4] p-5 sm:p-6 space-y-4" style={{ borderRadius: 18 }}>
                        <h3 className="text-[1.05rem] font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                            <HelpCircle size={18} className="text-[#DE5C2B]" />
                            <span>How It Works</span>
                        </h3>
                        <p className="text-slate-650 text-xs leading-relaxed font-semibold">
                            The conversion maps CGPA to a percentage value first (using standard 9.5 or 10 multipliers) and then scales it to your total maximum marks.
                        </p>
                        <div className="w-full h-[1px] bg-slate-100 my-2" />
                        <div className="space-y-3 text-xs">
                            <div>
                                <h4 className="font-bold text-slate-800 mb-1">1. CGPA to Marks</h4>
                                <p className="text-slate-500">Obtained = (CGPA × Multiplier / 100) × Max Marks</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 mb-1">2. Marks to CGPA</h4>
                                <p className="text-slate-500">CGPA = (Obtained / Max Marks × 100) ÷ Multiplier</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </FinderPage>
    );
};

export default CGPAtoMarks;
