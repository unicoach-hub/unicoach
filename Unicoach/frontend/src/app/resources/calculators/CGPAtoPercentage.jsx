import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Sparkles, ArrowRightLeft, HelpCircle, AlertCircle, Award } from 'lucide-react';

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
        <main className="min-h-screen bg-slate-50/50 pt-24 pb-16">
            <div className="max-w-[1040px] mx-auto px-6 md:px-10">
                
                {/* Hero header */}
                <div className="text-center mb-10 max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-indigo-600 text-xs font-bold uppercase tracking-wider mb-3">
                        <Calculator size={12} />
                        <span>Interactive Tools</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-tight">
                        CGPA to Percentage Converter
                    </h1>
                    <p className="text-slate-500 mt-2 text-[0.95rem] font-semibold">
                        Convert your academic 10-point CGPA into an equivalent percentage using official CBSE or general university rules.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Main converter card */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl overflow-hidden">
                            
                            {/* Toggle Tabs */}
                            <div className="flex border-b border-slate-100 bg-slate-50/80 p-1">
                                <button
                                    onClick={() => { setActiveTab('cgpa-to-percentage'); setResult(null); setError(''); }}
                                    className={`flex-1 py-3 px-4 rounded-2xl text-[0.9rem] font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer
                                        ${activeTab === 'cgpa-to-percentage' 
                                            ? 'bg-white text-[#DE5C2B] shadow-sm' 
                                            : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    <Sparkles size={15} />
                                    <span>CGPA to Percentage</span>
                                </button>
                                <button
                                    onClick={() => { setActiveTab('percentage-to-cgpa'); setResult(null); setError(''); }}
                                    className={`flex-1 py-3 px-4 rounded-2xl text-[0.9rem] font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer
                                        ${activeTab === 'percentage-to-cgpa' 
                                            ? 'bg-white text-[#DE5C2B] shadow-sm' 
                                            : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    <ArrowRightLeft size={15} />
                                    <span>Percentage to CGPA</span>
                                </button>
                            </div>

                            <div className="p-6 md:p-8">
                                <form onSubmit={handleConvert} className="space-y-6">
                                    
                                    {/* Formula Toggle */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block">
                                            Multiplier / Board standard
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setFormulaType('cbse')}
                                                className={`py-3 px-4 rounded-xl border text-sm font-bold text-center transition-all cursor-pointer
                                                    ${formulaType === 'cbse' 
                                                        ? 'border-indigo-500 bg-indigo-50/50 text-indigo-600' 
                                                        : 'border-slate-200 hover:border-slate-355 text-slate-600'}`}
                                            >
                                                CBSE Scale (* 9.5)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormulaType('general')}
                                                className={`py-3 px-4 rounded-xl border text-sm font-bold text-center transition-all cursor-pointer
                                                    ${formulaType === 'general' 
                                                        ? 'border-indigo-500 bg-indigo-50/50 text-indigo-600' 
                                                        : 'border-slate-200 hover:border-slate-355 text-slate-600'}`}
                                            >
                                                General Scale (* 10)
                                            </button>
                                        </div>
                                    </div>

                                    {activeTab === 'cgpa-to-percentage' ? (
                                        /* CGPA Input */
                                        <div className="space-y-2">
                                            <label htmlFor="cgpaInput" className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block">
                                                Enter CGPA (10-Point Scale)
                                            </label>
                                            <div className="relative rounded-2xl bg-slate-50 border border-slate-200/80 px-4 py-3 focus-within:border-indigo-500 focus-within:bg-white transition-all">
                                                <input
                                                    id="cgpaInput"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="10"
                                                    value={cgpaInput}
                                                    onChange={(e) => setCgpaInput(e.target.value)}
                                                    placeholder="e.g. 8.2"
                                                    className="w-full bg-transparent text-slate-800 text-lg font-bold outline-none placeholder-slate-300"
                                                    required
                                                />
                                                <span className="absolute right-4 top-3.5 text-xs text-slate-400 font-bold uppercase tracking-wide">
                                                    Max 10.0
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Percentage Input */
                                        <div className="space-y-2">
                                            <label htmlFor="percentageInput" className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block">
                                                Enter Percentage (%)
                                            </label>
                                            <div className="relative rounded-2xl bg-slate-50 border border-slate-200/80 px-4 py-3 focus-within:border-indigo-500 focus-within:bg-white transition-all">
                                                <input
                                                    id="percentageInput"
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    max="100"
                                                    value={percentageInput}
                                                    onChange={(e) => setPercentageInput(e.target.value)}
                                                    placeholder="e.g. 78.5"
                                                    className="w-full bg-transparent text-slate-800 text-lg font-bold outline-none placeholder-slate-300"
                                                    required
                                                />
                                                <span className="absolute right-4 top-3.5 text-xs text-slate-400 font-bold uppercase tracking-wide">
                                                    Max 100%
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action button */}
                                    <button
                                        type="submit"
                                        className="w-full py-4 rounded-2xl text-white font-bold text-sm bg-gradient-to-r from-orange-500 to-[#DE5C2B] hover:shadow-lg shadow-indigo-600/15 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                                    >
                                        Convert Percentage Now
                                    </button>
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
                        </div>
                    </div>

                    {/* Explanatory Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 space-y-4">
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
            </div>
        </main>
    );
};

export default CGPAtoPercentage;
