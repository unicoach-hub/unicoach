import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Sparkles, ArrowRightLeft, HelpCircle, AlertCircle, Award } from 'lucide-react';

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
        <main className="min-h-screen bg-slate-50/50 pt-24 pb-16">
            <div className="max-w-[1040px] mx-auto px-6 md:px-10">
                
                {/* Hero header */}
                <div className="text-center mb-10 max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 border border-orange-200 rounded-full text-[#DE5C2B] text-xs font-bold uppercase tracking-wider mb-3">
                        <Calculator size={12} />
                        <span>Interactive Tools</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-tight">
                        CGPA to Marks Calculator
                    </h1>
                    <p className="text-slate-500 mt-2 text-[0.95rem] font-semibold">
                        Convert your CGPA to exact obtained marks or vice-versa based on your total maximum exam score.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Main converter card */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl overflow-hidden">
                            
                            {/* Toggle Tabs */}
                            <div className="flex border-b border-slate-100 bg-slate-50/80 p-1">
                                <button
                                    onClick={() => { setActiveTab('cgpa-to-marks'); setResult(null); setError(''); }}
                                    className={`flex-1 py-3 px-4 rounded-2xl text-[0.9rem] font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer
                                        ${activeTab === 'cgpa-to-marks' 
                                            ? 'bg-white text-[#DE5C2B] shadow-sm' 
                                            : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    <Sparkles size={15} />
                                    <span>CGPA to Marks</span>
                                </button>
                                <button
                                    onClick={() => { setActiveTab('marks-to-cgpa'); setResult(null); setError(''); }}
                                    className={`flex-1 py-3 px-4 rounded-2xl text-[0.9rem] font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer
                                        ${activeTab === 'marks-to-cgpa' 
                                            ? 'bg-white text-[#DE5C2B] shadow-sm' 
                                            : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    <ArrowRightLeft size={15} />
                                    <span>Marks to CGPA</span>
                                </button>
                            </div>

                            <div className="p-6 md:p-8">
                                <form onSubmit={handleConvert} className="space-y-6">
                                    
                                    {/* Factor Toggle */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block">
                                            Conversion Standard / Factor
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setMultiplier(9.5)}
                                                className={`py-3 px-4 rounded-xl border text-sm font-bold text-center transition-all cursor-pointer
                                                    ${multiplier === 9.5 
                                                        ? 'border-blue-500 bg-orange-50/50 text-[#DE5C2B]' 
                                                        : 'border-slate-200 hover:border-slate-350 text-slate-600'}`}
                                            >
                                                CBSE Factor (9.5)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setMultiplier(10.0)}
                                                className={`py-3 px-4 rounded-xl border text-sm font-bold text-center transition-all cursor-pointer
                                                    ${multiplier === 10.0 
                                                        ? 'border-blue-500 bg-orange-50/50 text-[#DE5C2B]' 
                                                        : 'border-slate-200 hover:border-slate-350 text-slate-600'}`}
                                            >
                                                General Factor (10.0)
                                            </button>
                                        </div>
                                    </div>

                                    {/* Max Marks Input */}
                                    <div className="space-y-2">
                                        <label htmlFor="maxMarksInput" className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block">
                                            Maximum Marks in Exam
                                        </label>
                                        <div className="relative rounded-2xl bg-slate-50 border border-slate-200/80 px-4 py-3 focus-within:border-blue-500 focus-within:bg-white transition-all">
                                            <input
                                                id="maxMarksInput"
                                                type="number"
                                                min="1"
                                                value={maxMarksInput}
                                                onChange={(e) => setMaxMarksInput(e.target.value)}
                                                placeholder="e.g. 500 or 1000"
                                                className="w-full bg-transparent text-slate-800 text-lg font-bold outline-none placeholder-slate-300"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {activeTab === 'cgpa-to-marks' ? (
                                        /* CGPA Input */
                                        <div className="space-y-2">
                                            <label htmlFor="cgpaInput" className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block">
                                                Enter CGPA (10-Point Scale)
                                            </label>
                                            <div className="relative rounded-2xl bg-slate-50 border border-slate-200/80 px-4 py-3 focus-within:border-blue-500 focus-within:bg-white transition-all">
                                                <input
                                                    id="cgpaInput"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="10"
                                                    value={cgpaInput}
                                                    onChange={(e) => setCgpaInput(e.target.value)}
                                                    placeholder="e.g. 8.4"
                                                    className="w-full bg-transparent text-slate-800 text-lg font-bold outline-none placeholder-slate-300"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        /* Obtained Marks Input */
                                        <div className="space-y-2">
                                            <label htmlFor="obtainedMarksInput" className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block">
                                                Enter Obtained Marks
                                            </label>
                                            <div className="relative rounded-2xl bg-slate-50 border border-slate-200/80 px-4 py-3 focus-within:border-blue-500 focus-within:bg-white transition-all">
                                                <input
                                                    id="obtainedMarksInput"
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    value={obtainedMarksInput}
                                                    onChange={(e) => setObtainedMarksInput(e.target.value)}
                                                    placeholder="e.g. 425"
                                                    className="w-full bg-transparent text-slate-800 text-lg font-bold outline-none placeholder-slate-300"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Action button */}
                                    <button
                                        type="submit"
                                        className="w-full py-4 rounded-2xl text-white font-bold text-sm bg-gradient-to-r from-orange-500 to-[#DE5C2B] hover:shadow-lg shadow-indigo-600/15 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                                    >
                                        Calculate Marks Now
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
                        </div>
                    </div>

                    {/* Explanatory Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 space-y-4">
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
            </div>
        </main>
    );
};

export default CGPAtoMarks;
