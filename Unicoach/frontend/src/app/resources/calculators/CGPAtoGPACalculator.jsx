import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Award, ArrowRightLeft, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';

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
                let descriptor = 'Good';
                let gradeClass = 'A-';
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
                    let descriptor = 'Sufficient';
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
        <main className="min-h-screen bg-slate-50/50 pt-24 pb-16">
            <div className="max-w-[1040px] mx-auto px-6 md:px-10">
                
                {/* Hero header */}
                <div className="text-center mb-10 max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 border border-orange-200 rounded-full text-[#DE5C2B] text-xs font-bold uppercase tracking-wider mb-3">
                        <Calculator size={12} />
                        <span>Interactive Tools</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-tight">
                        CGPA to GPA Calculator
                    </h1>
                    <p className="text-slate-500 mt-2 text-[0.95rem] font-semibold">
                        Instantly convert your Indian 10-point CGPA into a US 4.0 scale or German Bavarian grade for study abroad applications.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Calculator Card (Left/Mid) */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl overflow-hidden">
                            
                            {/* Toggle Tabs */}
                            <div className="flex border-b border-slate-100 bg-slate-50/80 p-1">
                                <button
                                    onClick={() => { setActiveTab('cgpa-to-gpa'); setResult(null); setError(''); }}
                                    className={`flex-1 py-3 px-4 rounded-2xl text-[0.9rem] font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer
                                        ${activeTab === 'cgpa-to-gpa' 
                                            ? 'bg-white text-[#DE5C2B] shadow-sm' 
                                            : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    <Sparkles size={15} />
                                    <span>CGPA to GPA</span>
                                </button>
                                <button
                                    onClick={() => { setActiveTab('gpa-to-cgpa'); setResult(null); setError(''); }}
                                    className={`flex-1 py-3 px-4 rounded-2xl text-[0.9rem] font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer
                                        ${activeTab === 'gpa-to-cgpa' 
                                            ? 'bg-white text-[#DE5C2B] shadow-sm' 
                                            : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    <ArrowRightLeft size={15} />
                                    <span>GPA to CGPA</span>
                                </button>
                            </div>

                            <div className="p-6 md:p-8">
                                <form onSubmit={handleConvert} className="space-y-6">
                                    {activeTab === 'cgpa-to-gpa' ? (
                                        <>
                                            {/* Scale Toggle */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block">
                                                    Target Grading Scale
                                                </label>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => setScaleType('us')}
                                                        className={`py-3 px-4 rounded-xl border text-sm font-bold text-center transition-all cursor-pointer
                                                            ${scaleType === 'us' 
                                                                ? 'border-blue-500 bg-orange-50/50 text-[#DE5C2B]' 
                                                                : 'border-slate-200 hover:border-slate-350 text-slate-600'}`}
                                                    >
                                                        US Scale (4.0 Max)
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setScaleType('germany')}
                                                        className={`py-3 px-4 rounded-xl border text-sm font-bold text-center transition-all cursor-pointer
                                                            ${scaleType === 'germany' 
                                                                ? 'border-blue-500 bg-orange-50/50 text-[#DE5C2B]' 
                                                                : 'border-slate-200 hover:border-slate-350 text-slate-600'}`}
                                                    >
                                                        German Scale (Bavarian)
                                                    </button>
                                                </div>
                                            </div>

                                            {/* CGPA Input */}
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
                                                        placeholder="e.g. 8.25"
                                                        className="w-full bg-transparent text-slate-800 text-lg font-bold outline-none placeholder-slate-300"
                                                        required
                                                    />
                                                    <span className="absolute right-4 top-3.5 text-xs text-slate-400 font-bold uppercase tracking-wide">
                                                        Max 10.0
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        /* GPA to CGPA Input */
                                        <div className="space-y-2">
                                            <label htmlFor="gpaInput" className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block">
                                                Enter US GPA (4.0 Scale)
                                            </label>
                                            <div className="relative rounded-2xl bg-slate-50 border border-slate-200/80 px-4 py-3 focus-within:border-blue-500 focus-within:bg-white transition-all">
                                                <input
                                                    id="gpaInput"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="4"
                                                    value={gpaInput}
                                                    onChange={(e) => setGpaInput(e.target.value)}
                                                    placeholder="e.g. 3.45"
                                                    className="w-full bg-transparent text-slate-800 text-lg font-bold outline-none placeholder-slate-300"
                                                    required
                                                />
                                                <span className="absolute right-4 top-3.5 text-xs text-slate-400 font-bold uppercase tracking-wide">
                                                    Max 4.0
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action button */}
                                    <button
                                        type="submit"
                                        className="w-full py-4 rounded-2xl text-white font-bold text-sm bg-gradient-to-r from-orange-500 to-[#DE5C2B] hover:shadow-lg shadow-indigo-600/15 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                                    >
                                        Convert GPA Now
                                    </button>
                                </form>

                                {/* Errors & Results */}
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
                                                GPA
                                            </div>
                                            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">
                                                Conversion Result
                                            </h4>
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-4xl md:text-5xl font-black text-[#DE5C2B]">
                                                        {activeTab === 'cgpa-to-gpa' ? result.gpa : result.cgpa}
                                                    </span>
                                                    <span className="text-slate-400 font-bold text-sm">
                                                        out of {activeTab === 'cgpa-to-gpa' ? (scaleType === 'us' ? '4.0' : '1.0') : '10.0'}
                                                    </span>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-orange-100 rounded-full text-xs font-bold text-[#DE5C2B]">
                                                        <Award size={13} />
                                                        <span>{result.descriptor}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-400 font-bold tracking-tight pl-1">
                                                        Equivalent: {result.scale}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="w-full h-[1px] bg-orange-100/50 my-4" />
                                            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                                                <strong>Note:</strong> {result.note} This conversion is standard, but some universities might calculate your GPA subject-by-subject.
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                        </div>
                    </div>

                    {/* Explanatory Sidebar (Right) */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 space-y-4">
                            <h3 className="text-[1.05rem] font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                                <HelpCircle size={18} className="text-[#DE5C2B]" />
                                <span>Understanding Scales</span>
                            </h3>
                            <p className="text-slate-600 text-xs leading-relaxed font-semibold">
                                Foreign universities evaluate academic merits on custom grading systems. While US colleges require a 4.0 scale GPA, German universities use the Bavarian formula where 1.0 is a perfect score and 4.0 is minimum passing.
                            </p>
                            <div className="w-full h-[1px] bg-slate-100 my-2" />
                            <div>
                                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2">US GPA Conversion Chart</h4>
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between font-bold text-slate-700">
                                        <span>CGPA 9.0 - 10.0</span>
                                        <span className="text-[#DE5C2B]">GPA 3.8 - 4.0</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-slate-700">
                                        <span>CGPA 8.0 - 8.9</span>
                                        <span className="text-[#DE5C2B]">GPA 3.4 - 3.7</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-slate-700">
                                        <span>CGPA 7.0 - 7.9</span>
                                        <span className="text-[#DE5C2B]">GPA 3.0 - 3.3</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-slate-700">
                                        <span>CGPA 6.0 - 6.9</span>
                                        <span className="text-[#DE5C2B]">GPA 2.5 - 2.9</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </main>
    );
};

export default CGPAtoGPACalculator;
