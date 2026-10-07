import React, { useState, useEffect, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
    Scene, 
    PerspectiveCamera, 
    WebGLRenderer, 
    Group, 
    BufferGeometry, 
    Float32BufferAttribute, 
    PointsMaterial, 
    Points, 
    LineBasicMaterial, 
    Vector3, 
    LineSegments, 
    SphereGeometry, 
    MeshBasicMaterial, 
    Mesh 
} from 'three';
import { 
    Mail, 
    User, 
    Phone, 
    GraduationCap, 
    Globe, 
    Compass, 
    Send, 
    CheckCircle2,
    Sparkles,
    AlertCircle,
    ChevronDown,
    Check
} from 'lucide-react';
import PremiumDropdown from './PremiumDropdown';
import { ALL_COUNTRY_OPTIONS } from '../utils/shortlistOptions';
import { API_BASE_URL } from '../config';
import BackButton from './ui/BackButton';

const COUNTRY_OPTIONS = ALL_COUNTRY_OPTIONS.filter(c => c.value !== 'All');

const ContactPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const targetUni = searchParams.get('university') || '';

    // Form state
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        destination: 'USA',
        intake: '2026',
        university: targetUni,
        query: ''
    });
    
    const [submitted, setSubmitted] = useState(false);
    const [warpSpeed, setWarpSpeed] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    // ── Validation Rules ──
    const validateForm = () => {
        const errors = {};

        // Name: 2-50 chars, only letters and spaces
        const nameVal = form.name.trim();
        if (!nameVal) {
            errors.name = 'Name is required';
        } else if (nameVal.length < 2) {
            errors.name = 'Name must be at least 2 characters';
        } else if (nameVal.length > 50) {
            errors.name = 'Name cannot exceed 50 characters';
        } else if (!/^[a-zA-Z\s.]+$/.test(nameVal)) {
            errors.name = 'Name can only contain letters, spaces & dots';
        }

        // Email: proper format
        const emailVal = form.email.trim();
        if (!emailVal) {
            errors.email = 'Email is required';
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailVal)) {
            errors.email = 'Enter a valid email address';
        }

        // Phone: 10-15 digits, optional + prefix
        const phoneVal = form.phone.trim();
        if (!phoneVal) {
            errors.phone = 'Phone number is required';
        } else {
            const digitsOnly = phoneVal.replace(/[\s\-()]/g, '');
            if (!/^\+?[0-9]{10,15}$/.test(digitsOnly)) {
                errors.phone = 'Enter a valid phone number (10-15 digits)';
            }
        }

        // University (optional but if filled, validate)
        const uniVal = form.university.trim();
        if (uniVal && uniVal.length > 100) {
            errors.university = 'University name too long (max 100 chars)';
        } else if (uniVal && !/^[a-zA-Z\s,.'&()-]+$/.test(uniVal)) {
            errors.university = 'University name contains invalid characters';
        }

        // Query/Message: 10-500 chars
        const queryVal = form.query.trim();
        if (!queryVal) {
            errors.query = 'Please describe your academic goals';
        } else if (queryVal.length < 10) {
            errors.query = 'Message must be at least 10 characters';
        } else if (queryVal.length > 500) {
            errors.query = 'Message cannot exceed 500 characters';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // ThreeJS refs
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const sphereRef = useRef(null);
    const formRef = useRef(null);

    // EmailJS credentials
    const EMAILJS_SERVICE_ID = 'service_dtw81wl';
    const EMAILJS_TEMPLATE_ID = 'template_5n5axc8';
    const EMAILJS_PUBLIC_KEY = 'u1dbT_vPyU62Y7A5O';

    // Controlled input handlers (filters)
    const handleNameChange = (e) => {
        const val = e.target.value;
        // Allow only letters, spaces, dots — max 50
        if (val.length <= 50 && /^[a-zA-Z\s.]*$/.test(val)) {
            setForm({ ...form, name: val });
            if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: '' }));
        }
    };

    const handleEmailChange = (e) => {
        const val = e.target.value;
        if (val.length <= 100) {
            setForm({ ...form, email: val });
            if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
        }
    };

    const handlePhoneChange = (e) => {
        const val = e.target.value;
        // Allow only digits, +, spaces, hyphens, parens — max 16
        if (val.length <= 16 && /^[0-9+\s\-()]*$/.test(val)) {
            setForm({ ...form, phone: val });
            if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: '' }));
        }
    };

    const handleUniversityChange = (e) => {
        const val = e.target.value;
        if (val.length <= 100) {
            setForm({ ...form, university: val });
            if (fieldErrors.university) setFieldErrors(prev => ({ ...prev, university: '' }));
        }
    };

    const handleQueryChange = (e) => {
        const val = e.target.value;
        if (val.length <= 500) {
            setForm({ ...form, query: val });
            if (fieldErrors.query) setFieldErrors(prev => ({ ...prev, query: '' }));
        }
    };

    // Form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setWarpSpeed(true);
        setSending(true);
        setError('');

        // Single API target (no fallback backends: retrying elsewhere created duplicate leads)
        const postJson = async (endpoint, payload) => {
            try {
                const res = await fetch(`${API_BASE_URL}${endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json().catch(() => ({}));
                return { ok: res.ok, data };
            } catch {
                return { ok: false, data: {}, networkError: true };
            }
        };

        const studentMessage = form.query.trim() || (form.university ? `Target University: ${form.university}` : 'Admissions Consultation Request');

        // 1. Persist lead into MongoDB CRM (/leads on Admin Portal) — success depends on this write
        const leadResult = await postJson('/leads/book-consultation', {
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            destination: form.destination || 'Undecided',
            intake: form.intake,
            university: form.university,
            query: studentMessage,
            source: 'Website Booking Form'
        });

        if (!leadResult.ok) {
            setError(
                leadResult.data?.error ||
                leadResult.data?.message ||
                (leadResult.networkError
                    ? 'We could not reach our servers. Please check your connection and try again.'
                    : 'We could not submit your request right now. Please try again in a moment.')
            );
            setWarpSpeed(false);
            setSending(false);
            return;
        }

        // 2. Support Requests entry: the backend's book-consultation already creates it (posting it here too
        //    produced a duplicate request in Admin -> Support Requests for every submission)

        // 3. EmailJS notification — optional, never blocks a saved lead
        const templateParams = {
            user_name: form.name,
            user_email: form.email,
            user_phone: form.phone,
            user_destination: form.destination,
            user_intake: form.intake,
            user_university: form.university || 'Not specified',
            user_query: form.query
        };

        try {
            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
        } catch (err) {
            console.warn('EmailJS Error (Lead was still captured in CRM):', err);
        }

        setSubmitted(true);
        setWarpSpeed(false);
        setSending(false);
    };

    // ThreeJS initialization
    useEffect(() => {
        const container = mountRef.current;
        if (!container) return;

        // 1. Scene setup
        const scene = new Scene();
        sceneRef.current = scene;

        // 2. Camera setup
        const width = container.clientWidth;
        const height = container.clientHeight;
        const camera = new PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.z = 25;

        // 3. Renderer setup
        const renderer = new WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // 4. Object: Glowing 3D Node Globe
        const sphereGroup = new Group();
        scene.add(sphereGroup);
        sphereRef.current = sphereGroup;

        // Nodes (Vertices)
        const nodeCount = 180;
        const radius = 7.5;
        const positions = [];
        const nodeGeom = new BufferGeometry();
        
        for (let i = 0; i < nodeCount; i++) {
            // Golden spiral coordinates for uniform spherical distribution
            const theta = Math.acos(1 - 2 * (i + 0.5) / nodeCount);
            const phi = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

            const x = radius * Math.sin(theta) * Math.cos(phi);
            const y = radius * Math.sin(theta) * Math.sin(phi);
            const z = radius * Math.cos(theta);

            positions.push(x, y, z);
        }

        nodeGeom.setAttribute('position', new Float32BufferAttribute(positions, 3));

        // Create custom points material (glowing square dots)
        const nodeMat = new PointsMaterial({
            color: 0x6366f1, // indigo-500
            size: 0.18,
            transparent: true,
            opacity: 0.85,
            sizeAttenuation: true
        });

        const points = new Points(nodeGeom, nodeMat);
        sphereGroup.add(points);

        // Connection Lines (Network Mesh)
        const lineMat = new LineBasicMaterial({
            color: 0x4f46e5, // indigo-600
            transparent: true,
            opacity: 0.2
        });

        const lineGeom = new BufferGeometry();
        const lineIndices = [];
        const posArr = nodeGeom.attributes.position.array;

        // Connect nodes that are close to each other
        for (let i = 0; i < nodeCount; i++) {
            const p1 = new Vector3(posArr[i * 3], posArr[i * 3 + 1], posArr[i * 3 + 2]);
            let connections = 0;
            
            for (let j = i + 1; j < nodeCount; j++) {
                const p2 = new Vector3(posArr[j * 3], posArr[j * 3 + 1], posArr[j * 3 + 2]);
                const dist = p1.distanceTo(p2);
                
                if (dist < 3.2 && connections < 4) {
                    lineIndices.push(i, j);
                    connections++;
                }
            }
        }

        lineGeom.setAttribute('position', new Float32BufferAttribute(positions, 3));
        lineGeom.setIndex(lineIndices);
        
        const networkLines = new LineSegments(lineGeom, lineMat);
        sphereGroup.add(networkLines);

        // Add a soft core light sphere
        const coreGeom = new SphereGeometry(radius * 0.9, 16, 16);
        const coreMat = new MeshBasicMaterial({
            color: 0x3b82f6, // blue-500
            transparent: true,
            opacity: 0.03,
            wireframe: true
        });
        const core = new Mesh(coreGeom, coreMat);
        sphereGroup.add(core);

        // 5. Mouse tracker for raycast-interactive rotations
        let mouseX = 0;
        let mouseY = 0;
        let targetRotationX = 0.002;
        let targetRotationY = 0.002;

        const onMouseMove = (e) => {
            const { clientWidth, clientHeight } = container;
            mouseX = (e.clientX - clientWidth / 2) / (clientWidth / 2);
            mouseY = (e.clientY - clientHeight / 2) / (clientHeight / 2);
        };

        window.addEventListener('mousemove', onMouseMove);

        // 6. Animation loop
        let reqId;

        const animate = () => {
            reqId = requestAnimationFrame(animate);

            // Interpolate rotations based on mouse coordinate offsets
            targetRotationX += (mouseX * 0.02 - targetRotationX) * 0.05;
            targetRotationY += (mouseY * 0.02 - targetRotationY) * 0.05;

            if (warpSpeed) {
                // Spin extremely fast and expand size during form submit
                sphereGroup.rotation.y += 0.35;
                sphereGroup.rotation.x += 0.15;
                if (sphereGroup.scale.x < 3.5) {
                    sphereGroup.scale.addScalar(0.08);
                }
                nodeMat.color.setHex(0x10b981); // Emerald green glow on success
                lineMat.color.setHex(0x34d399);
            } else {
                // Default orbit rotation
                sphereGroup.rotation.y += 0.003 + targetRotationX;
                sphereGroup.rotation.x += 0.001 + targetRotationY;
                
                // Reset size smoothly if it was stretched
                if (sphereGroup.scale.x > 1) {
                    sphereGroup.scale.subScalar(0.08);
                    if (sphereGroup.scale.x < 1) sphereGroup.scale.set(1, 1, 1);
                }
            }

            renderer.render(scene, camera);
        };

        animate();

        // 7. Handle resize
        const handleResize = () => {
            if (!container) return;
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            cancelAnimationFrame(reqId);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('resize', handleResize);
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            nodeGeom.dispose();
            nodeMat.dispose();
            lineGeom.dispose();
            lineMat.dispose();
            coreGeom.dispose();
            renderer.dispose();
        };
    }, [warpSpeed]);

    return (
        <main className="min-h-screen bg-[#fafcff] text-slate-800 relative flex flex-col justify-center pt-28 sm:pt-32 pb-20 px-4 sm:px-6 overflow-hidden select-none">
            {/* Ambient background glows */}
            <div className="absolute top-0 inset-x-0 h-[650px] bg-gradient-to-b from-indigo-100/40 via-blue-50/15 to-transparent pointer-events-none z-0" />
            <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-indigo-200/10 to-purple-300/10 rounded-full blur-3xl pointer-events-none" />

            {/* Retro dot background overlay */}
            <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(#94a3b8_1.2px,transparent_1.2px)] [background-size:24px_24px] pointer-events-none"></div>

            {/* ThreeJS Container in background with subtle opacity for elegance */}
            <div 
                ref={mountRef} 
                className="absolute inset-0 pointer-events-none z-0 opacity-10 md:opacity-15"
            />

            {/* Back Button positioned cleanly below navbar */}
            <div className="relative max-w-5xl w-full mx-auto z-10 mb-4">
                <BackButton fallback="/" />
            </div>

            {/* Main panels wrapper */}
            <div className="relative max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">
                
                {/* Left Side: Creative content info details (5 columns) */}
                <div className="lg:col-span-5 space-y-6 text-left">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 border border-orange-100 rounded-full text-[#111111] text-[10px] font-black uppercase tracking-wider">
                        <Sparkles size={12} className="text-[#111111]" />
                        <span>UniCoach Portal Hub</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.12] text-slate-900">
                        Book Your <br />
                        <span className="text-[#111111] inline-block">Global Advisor</span>
                    </h1>

                    <p className="text-slate-600 text-xs md:text-sm font-semibold leading-relaxed">
                        Complete your details to trigger our automated university evaluation system. A certified UniCoach expert will review your profile and reach out within 4 business hours.
                    </p>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="flex items-start gap-3.5">
                            <span className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 text-[#111111] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                                <CheckCircle2 size={16} />
                            </span>
                            <div>
                                <h4 className="text-xs font-black text-slate-800">Profile Evaluation</h4>
                                <p className="text-slate-500 text-[11px] font-semibold mt-0.5">We check GPA requirements against 500+ global partner lists.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3.5">
                            <span className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 text-[#111111] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                                <Compass size={16} />
                            </span>
                            <div>
                                <h4 className="text-xs font-black text-slate-800">Admissions Mapping</h4>
                                <p className="text-slate-500 text-[11px] font-semibold mt-0.5">Get mapped directly to summer/winter intakes with dates tracker.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: The Form panel (7 columns) */}
                <div className="lg:col-span-7">
                    <AnimatePresence mode="wait">
                        {submitted ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white border border-slate-200/80 p-8 md:p-12 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] text-center space-y-6"
                            >
                                <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 shadow-inner">
                                    <CheckCircle2 size={38} className="stroke-[2.5]" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black tracking-tight text-slate-900">Inquiry Received!</h2>
                                    <p className="text-slate-655 text-xs font-semibold max-w-sm mx-auto leading-relaxed">
                                        Your details are safely synced. Our U.S. and European admissions counsellors are evaluating your parameters. Keep your beacon active!
                                    </p>
                                </div>

                                <div className="pt-6 border-t border-slate-100">
                                    <button
                                        onClick={() => navigate('/')}
                                        className="px-6 py-3.5 rounded-2xl text-white bg-slate-900 hover:bg-slate-800 transition-all font-bold text-xs cursor-pointer shadow-md"
                                    >
                                        Return to Base Dashboard
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-white border border-slate-200/80 p-6 md:p-8 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] text-left"
                            >
                                <div className="mb-6 border-b border-slate-100 pb-4">
                                    <span className="text-[9px] font-black uppercase text-indigo-600 tracking-widest block mb-1">Interactive Diagnostic Ticket</span>
                                    <h3 className="text-lg font-black text-slate-800 leading-none">Evaluate Admissions Eligibility</h3>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-extrabold uppercase text-slate-500 tracking-wider">Your Name <span className="text-red-500">*</span></label>
                                            <div className={`flex items-center bg-slate-50/50 border rounded-2xl px-3.5 py-2.5 gap-2 transition-all duration-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/20 ${fieldErrors.name ? 'border-red-300 bg-red-50/20' : 'border-slate-200'}`}>
                                                <User size={14} className="text-slate-400" />
                                                <input 
                                                    type="text"
                                                    value={form.name}
                                                    onChange={handleNameChange}
                                                    placeholder="e.g. Rohan Sen"
                                                    className="bg-transparent text-xs font-semibold text-slate-800 outline-none w-full placeholder-slate-400"
                                                    maxLength={50}
                                                />
                                            </div>
                                            {fieldErrors.name && (
                                                <p className="text-red-500 text-[10px] font-bold flex items-center gap-1 mt-0.5">
                                                    <AlertCircle size={10} /> {fieldErrors.name}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[9px] font-extrabold uppercase text-slate-500 tracking-wider">Email Address <span className="text-red-500">*</span></label>
                                            <div className={`flex items-center bg-slate-50/50 border rounded-2xl px-3.5 py-2.5 gap-2 transition-all duration-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/20 ${fieldErrors.email ? 'border-red-300 bg-red-50/20' : 'border-slate-200'}`}>
                                                <Mail size={14} className="text-slate-400" />
                                                <input 
                                                    type="email"
                                                    value={form.email}
                                                    onChange={handleEmailChange}
                                                    placeholder="e.g. rohan@gmail.com"
                                                    className="bg-transparent text-xs font-semibold text-slate-800 outline-none w-full placeholder-slate-400"
                                                    maxLength={100}
                                                />
                                            </div>
                                            {fieldErrors.email && (
                                                <p className="text-red-500 text-[10px] font-bold flex items-center gap-1 mt-0.5">
                                                    <AlertCircle size={10} /> {fieldErrors.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-extrabold uppercase text-slate-500 tracking-wider">Phone Number <span className="text-red-500">*</span></label>
                                            <div className={`flex items-center bg-slate-50/50 border rounded-2xl px-3.5 py-2.5 gap-2 transition-all duration-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/20 ${fieldErrors.phone ? 'border-red-300 bg-red-50/20' : 'border-slate-200'}`}>
                                                <Phone size={14} className="text-slate-400" />
                                                <input 
                                                    type="tel"
                                                    value={form.phone}
                                                    onChange={handlePhoneChange}
                                                    placeholder="e.g. +91 9988776655"
                                                    className="bg-transparent text-xs font-semibold text-slate-800 outline-none w-full placeholder-slate-400"
                                                    maxLength={16}
                                                />
                                            </div>
                                            {fieldErrors.phone && (
                                                <p className="text-red-500 text-[10px] font-bold flex items-center gap-1 mt-0.5">
                                                    <AlertCircle size={10} /> {fieldErrors.phone}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <PremiumDropdown
                                                label={<span className="text-[9px] font-extrabold uppercase text-slate-500 tracking-wider">Preferred Destination <span className="text-red-500">*</span></span>}
                                                labelIcon={<Globe size={13} className="text-indigo-600" />}
                                                value={form.destination}
                                                onChange={(val) => setForm(prev => ({ ...prev, destination: val }))}
                                                options={COUNTRY_OPTIONS}
                                                accent="indigo"
                                                searchable={true}
                                                searchPlaceholder="Search 160+ countries (USA, UK, Germany...)"
                                                creatable={true}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-extrabold uppercase text-slate-500 tracking-wider">Intake Year <span className="text-red-500">*</span></label>
                                            <div className="flex items-center bg-slate-50/50 border border-slate-200 rounded-2xl px-3.5 py-2.5 gap-2 transition-all duration-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/20">
                                                <GraduationCap size={14} className="text-slate-400" />
                                                <select
                                                    value={form.intake}
                                                    onChange={e => setForm({...form, intake: e.target.value})}
                                                    className="bg-transparent text-xs font-semibold text-slate-800 outline-none w-full cursor-pointer"
                                                >
                                                    <option className="bg-white text-slate-850" value="2026">2026 Intake</option>
                                                    <option className="bg-white text-slate-850" value="2027">2027 Intake</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[9px] font-extrabold uppercase text-slate-500 tracking-wider">Target University (Optional)</label>
                                            <div className={`flex items-center bg-slate-50/50 border rounded-2xl px-3.5 py-2.5 gap-2 transition-all duration-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/20 ${fieldErrors.university ? 'border-red-300 bg-red-50/20' : 'border-slate-200'}`}>
                                                <Compass size={14} className="text-slate-400" />
                                                <input 
                                                    type="text"
                                                    value={form.university}
                                                    onChange={handleUniversityChange}
                                                    placeholder="e.g. Harvard, Humber, Oxford"
                                                    className="bg-transparent text-xs font-semibold text-slate-800 outline-none w-full placeholder-slate-400"
                                                    maxLength={100}
                                                />
                                            </div>
                                            {fieldErrors.university && (
                                                <p className="text-red-500 text-[10px] font-bold flex items-center gap-1 mt-0.5">
                                                    <AlertCircle size={10} /> {fieldErrors.university}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[9px] font-extrabold uppercase text-slate-500 tracking-wider">Your Academic Goals / GPA / Message <span className="text-red-500">*</span></label>
                                            <span className={`text-[9px] font-bold ${form.query.length > 450 ? 'text-amber-600' : 'text-slate-400'}`}>{form.query.length}/500</span>
                                        </div>
                                        <textarea
                                            value={form.query}
                                            onChange={handleQueryChange}
                                            placeholder="Tell us about your target course or current score benchmarks..."
                                            rows="3"
                                            className={`w-full bg-slate-50 border rounded-2xl px-4 py-3 text-xs font-semibold outline-none resize-none text-slate-800 transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 ${fieldErrors.query ? 'border-red-500/20 bg-red-50/20' : 'border-slate-200 bg-slate-50/50'}`}
                                            maxLength={500}
                                        />
                                        {fieldErrors.query && (
                                            <p className="text-red-500 text-[10px] font-bold flex items-center gap-1 mt-0.5">
                                                <AlertCircle size={10} /> {fieldErrors.query}
                                            </p>
                                        )}
                                    </div>

                                    {error && (
                                        <div className="text-red-500 text-[11px] font-bold bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-center">
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={sending}
                                        className="w-full mt-4 py-4 rounded-2xl text-white font-black text-xs bg-indigo-600 hover:bg-indigo-750 hover:shadow-lg hover:shadow-indigo-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        <Send size={14} className="text-white" />
                                        <span>{sending ? "Sending..." : warpSpeed ? "Processing Vector Math..." : "Initiate Consultation Evaluation"}</span>
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Simulated footer */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[9px] text-slate-400 font-black uppercase tracking-widest pointer-events-none">
                UniCoach 3D Navigation Console v8.16
            </div>
        </main>
    );
};

export default ContactPage;
