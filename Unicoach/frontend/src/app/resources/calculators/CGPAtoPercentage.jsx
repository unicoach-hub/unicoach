import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HookBand, VersusCard } from '../../../components/ui/Infographics';
import { FinderPage, FinderHero, FinderCard, FinderField, FinderButton, FinderChip, FINDER_FIELD, FIELD_RADIUS } from '../../../components/ui/FinderForm';
import { Sparkles, ArrowRightLeft, HelpCircle, AlertCircle, Award } from 'lucide-react';

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

            let gradeClass = 'Second Division';
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
        <FinderPage>
            <FinderHero
                eyebrow="CGPA to Percentage"
                title="CGPA to percentage converter"
                subtitle="Turn your 10-point CGPA into a percentage using the CBSE or general university rule."
                steps={[
                    { label: 'CGPA', sub: 'Your score' },
                    { label: 'Pick a scale', sub: '× 9.5 or × 10' },
                    { label: 'Percentage', sub: 'Instant' },
                ]}
                active={0}
            />

            <HookBand
                value="× 9.5"
                label="The CBSE multiplier for CGPA to percentage. A standard 10-point university scale uses × 10."
                hi="गुणा"
                className="mt-8 mb-6"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Main converter card */}
                <div className="lg:col-span-2">
                    <FinderCard>
                        
                        {/* Direction */}
                        <div className="flex flex-wrap gap-2">
                            <FinderChip on={activeTab === 'cgpa-to-percentage'} onClick={() => { setActiveTab('cgpa-to-percentage'); setResult(null); setError(''); }}>
                                <Sparkles size={14} /> CGPA to Percentage
                            </FinderChip>
                            <FinderChip on={activeTab === 'percentage-to-cgpa'} onClick={() => { setActiveTab('percentage-to-cgpa'); setResult(null); setError(''); }}>
                                <ArrowRightLeft size={14} /> Percentage to CGPA
                            </FinderChip>
                        </div>

                        <div className="mt-5 pt-5 border-t border-[#ECE6DA]">
                            <form onSubmit={handleConvert} className="space-y-4">
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-[12.5px] font-semibold text-[#16130F]">Board standard</span>
                                    <div className="flex flex-wrap gap-2">
                                        <FinderChip on={formulaType === 'cbse'} onClick={() => setFormulaType('cbse')}>CBSE scale (× 9.5)</FinderChip>
                                        <FinderChip on={formulaType === 'general'} onClick={() => setFormulaType('general')}>General scale (× 10)</FinderChip>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                                    {activeTab === 'cgpa-to-percentage' ? (
                                        <FinderField label="CGPA (10-point scale) *" hint="Max 10.0">
                                            <input
                                                id="cgpaInput"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="10"
                                                value={cgpaInput}
                                                onChange={(e) => setCgpaInput(e.target.value)}
                                                placeholder="e.g. 8.2"
                                                className={FINDER_FIELD}
                                                style={FIELD_RADIUS}
                                                required
                                            />
                                        </FinderField>
                                    ) : (
                                        <FinderField label="Percentage (%) *" hint="Max 100%">
                                            <input
                                                id="percentageInput"
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="100"
                                                value={percentageInput}
                                                onChange={(e) => setPercentageInput(e.target.value)}
                                                placeholder="e.g. 78.5"
                                                className={FINDER_FIELD}
                                                style={FIELD_RADIUS}
                                                required
                                            />
                                        </FinderField>
                                    )}
                                </div>

                                <FinderButton type="submit" className="w-full sm:w-auto">
                                    Convert
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
                                        className="mt-8 bg-indigo-50/40 border border-indigo-100 rounded-2xl p-6 relative overflow-hidden"
                                    >
                                        <div className="absolute right-[-20px] bottom-[-20px] text-indigo-500/5 font-black text-8xl pointer-events-none select-none">
                                            %
                                        </div>
                                        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">
                                            Calculation Results
                                        </h4>
                                        
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl md:text-5xl font-black text-indigo-600">
                                                    {activeTab === 'cgpa-to-percentage' ? `${result.percentage}%` : result.cgpa}
                                                </span>
                                                {activeTab === 'percentage-to-cgpa' && (
                                                    <span className="text-slate-400 font-bold text-sm">
                                                        out of 10.0
                                                    </span>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-indigo-100 rounded-full text-xs font-bold text-indigo-600">
                                                    <Award size={13} />
                                                    <span>{result.gradeClass}</span>
                                                </div>
                                                <p className="text-xs text-slate-400 font-bold tracking-tight pl-1">
                                                    Formula: {result.formula}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="w-full h-[1px] bg-indigo-100/50 my-4" />
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
                            <HelpCircle size={18} className="text-indigo-650" />
                            <span>Why a 9.5 Multiplier?</span>
                        </h3>
                        <p className="text-slate-650 text-xs leading-relaxed font-semibold">
                            The Central Board of Secondary Education (CBSE) analyzed the last five years of student scores and concluded that the average percentage scored by top performance groups sits around 95 marks. Thus, a linear 9.5 multiplier was established for converting CGPA to percentages:
                        </p>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center font-bold text-[#DE5C2B] text-sm">
                            Percentage = CGPA × 9.5
                        </div>
                        <p className="text-slate-600 text-xs leading-relaxed font-semibold">
                            For general engineering and non-engineering colleges under AICTE, a standard 10-point scale usually maps directly:
                        </p>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center font-bold text-indigo-600 text-sm">
                            Percentage = CGPA × 10
                        </div>
                    </div>
                </div>

            </div>

            {/* The two formulas this converter offers, side by side */}
            <VersusCard
                className="mt-8"
                kicker="Which formula?"
                title="CBSE scale vs university scale"
                left={{ title: 'CBSE scale', tag: '× 9.5', points: ['Percentage = CGPA × 9.5', 'Set by CBSE from the last five years of student scores'] }}
                right={{ title: 'University scale', tag: '× 10', points: ['Percentage = CGPA × 10', 'Usual for engineering and non-engineering colleges under AICTE'] }}
            />
        </FinderPage>
    );
};

export default CGPAtoPercentage;
