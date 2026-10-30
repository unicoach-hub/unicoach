import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HookBand, BarCompare } from '../../../components/ui/Infographics';
import { FinderPage, FinderHero, FinderCard, FinderField, FinderButton, FinderChip, FINDER_FIELD, FIELD_RADIUS } from '../../../components/ui/FinderForm';
import { Award, ArrowRightLeft, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';

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
        <FinderPage>
            <FinderHero
                eyebrow="CGPA to GPA"
                title="CGPA to GPA calculator"
                subtitle="Convert your Indian 10-point CGPA to the US 4.0 scale or the German Bavarian grade."
                steps={[
                    { label: 'CGPA', sub: 'Your score' },
                    { label: 'Pick a scale', sub: 'US or Germany' },
                    { label: 'GPA', sub: 'Instant' },
                ]}
                active={0}
            />

            <HookBand
                value="4.0"
                label="The top of the US GPA scale. Germany's Bavarian formula runs the other way: 1.0 is a perfect score, 4.0 the minimum pass."
                hi="पैमाना"
                className="mt-8 mb-6"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Calculator Card (Left/Mid) */}
                <div className="lg:col-span-2">
                    <FinderCard>
                        
                        {/* Direction */}
                        <div className="flex flex-wrap gap-2">
                            <FinderChip on={activeTab === 'cgpa-to-gpa'} onClick={() => { setActiveTab('cgpa-to-gpa'); setResult(null); setError(''); }}>
                                <Sparkles size={14} /> CGPA to GPA
                            </FinderChip>
                            <FinderChip on={activeTab === 'gpa-to-cgpa'} onClick={() => { setActiveTab('gpa-to-cgpa'); setResult(null); setError(''); }}>
                                <ArrowRightLeft size={14} /> GPA to CGPA
                            </FinderChip>
                        </div>

                        <div className="mt-5 pt-5 border-t border-[#ECE6DA]">
                            <form onSubmit={handleConvert} className="space-y-4">
                                {activeTab === 'cgpa-to-gpa' ? (
                                    <>
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-[12.5px] font-semibold text-[#16130F]">Target grading scale</span>
                                            <div className="flex flex-wrap gap-2">
                                                <FinderChip on={scaleType === 'us'} onClick={() => setScaleType('us')}>US scale (4.0 max)</FinderChip>
                                                <FinderChip on={scaleType === 'germany'} onClick={() => setScaleType('germany')}>German scale (Bavarian)</FinderChip>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                                            <FinderField label="CGPA (10-point scale) *" hint="Max 10.0">
                                                <input
                                                    id="cgpaInput"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="10"
                                                    value={cgpaInput}
                                                    onChange={(e) => setCgpaInput(e.target.value)}
                                                    placeholder="e.g. 8.25"
                                                    className={FINDER_FIELD}
                                                    style={FIELD_RADIUS}
                                                    required
                                                />
                                            </FinderField>
                                        </div>
                                    </>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                                        <FinderField label="US GPA (4.0 scale) *" hint="Max 4.0">
                                            <input
                                                id="gpaInput"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="4"
                                                value={gpaInput}
                                                onChange={(e) => setGpaInput(e.target.value)}
                                                placeholder="e.g. 3.45"
                                                className={FINDER_FIELD}
                                                style={FIELD_RADIUS}
                                                required
                                            />
                                        </FinderField>
                                    </div>
                                )}

                                <FinderButton type="submit" className="w-full sm:w-auto">
                                    Convert GPA
                                </FinderButton>
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
                    </FinderCard>
                </div>

                {/* Explanatory Sidebar (Right) */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border border-[#E6E0D4] p-5 sm:p-6 space-y-4" style={{ borderRadius: 18 }}>
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

            {/* The US GPA conversion chart from the sidebar, as bars (top of each GPA band) */}
            <BarCompare
                className="mt-8"
                kicker="US GPA chart"
                title="Your CGPA band on the 4.0 scale"
                items={[
                    { label: 'CGPA 9.0–10.0', value: 4.0, display: 'GPA 3.8–4.0' },
                    { label: 'CGPA 8.0–8.9', value: 3.7, display: 'GPA 3.4–3.7' },
                    { label: 'CGPA 7.0–7.9', value: 3.3, display: 'GPA 3.0–3.3' },
                    { label: 'CGPA 6.0–6.9', value: 2.9, display: 'GPA 2.5–2.9' },
                ]}
            />

        </FinderPage>
    );
};

export default CGPAtoGPACalculator;
