import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

const EARTH_TEXTURE_URL = 'https://unpkg.com/three-globe@2.35.0/example/img/earth-blue-marble.jpg';
const EARTH_BUMP_URL = 'https://unpkg.com/three-globe@2.35.0/example/img/earth-topology.png';

const loadingStages = [
  { emoji: '🎓', text: 'Evaluating Academic Profiles & GPAs...' },
  { emoji: '🏛️', text: 'Shortlisting Top Global Universities...' },
  { emoji: '📝', text: 'Drafting SOPs & Recommendation Letters...' },
  { emoji: '💸', text: 'Securing Scholarships & Financial Aid...' },
  { emoji: '🛂', text: 'Processing Express Visa Applications...' },
  { emoji: '✈️', text: 'Arranging Flight & Pre-Departure Logistics...' }
];

interface LoaderProps {
  onLoadingComplete?: () => void;
}

export const Loader: React.FC<LoaderProps> = ({ onLoadingComplete }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const zoomStartRef = useRef<number | null>(null);

  useEffect(() => {
    const totalDuration = 2200;
    const intervalTime = 30;
    const totalSteps = totalDuration / intervalTime;
    let step = 0;

    const progressInterval = setInterval(() => {
      step++;
      const currentProgress = Math.min((step / totalSteps) * 100, 100);
      setProgress(currentProgress);
      const newStageIndex = Math.min(
        Math.floor((currentProgress / 100) * loadingStages.length),
        loadingStages.length - 1
      );
      setStageIndex(newStageIndex);

      if (step >= totalSteps) {
        clearInterval(progressInterval);
        setIsZooming(true);
        zoomStartRef.current = performance.now();

        setTimeout(() => {
          setIsVisible(false);
          if (onLoadingComplete) onLoadingComplete();
        }, 600);
      }
    }, intervalTime);

    return () => clearInterval(progressInterval);
  }, [onLoadingComplete]);

  // Fast Instant Three.js Earth Scene
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 4.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Star Field
    const starCount = 1800;
    const starPositions = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 100;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 100;
      starSizes[i] = Math.random() * 1.5 + 0.5;
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.08,
      transparent: true,
      opacity: 0.85,
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // Earth Sphere
    const earthGeo = new THREE.SphereGeometry(1.3, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      color: 0x1a365d,
      shininess: 18,
      specular: new THREE.Color(0x333333),
      transparent: true,
      opacity: 1,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earthMesh);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(EARTH_TEXTURE_URL, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      earthMat.color.setHex(0xffffff);
      earthMat.map = tex;
      earthMat.needsUpdate = true;
    });
    textureLoader.load(EARTH_BUMP_URL, (tex) => {
      earthMat.bumpMap = tex;
      earthMat.bumpScale = 0.03;
      earthMat.needsUpdate = true;
    });

    // Atmosphere Glow
    const glowGeo = new THREE.SphereGeometry(1.34, 64, 64);
    const glowMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        uniform float uOpacity;
        void main() {
          float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.5);
          gl_FragColor = vec4(0.35, 0.65, 1.0, intensity * 0.4 * uOpacity);
        }
      `,
      uniforms: {
        uOpacity: { value: 1.0 },
      },
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glowMesh);

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(5, 3, 5);
    scene.add(sun);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      earthMesh.rotation.y += 0.005;
      starField.rotation.y += 0.0002;

      if (zoomStartRef.current) {
        const elapsed = performance.now() - zoomStartRef.current;
        const duration = 600;
        const p = Math.min(1.0, elapsed / duration);
        const easeP = Math.pow(p, 3);

        camera.position.z = 4.5 - easeP * 3.8;
        const op = Math.max(0, 1 - easeP * 0.9);
        earthMat.opacity = op;
        if (glowMat.uniforms.uOpacity) {
          glowMat.uniforms.uOpacity.value = op;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      glowGeo.dispose();
      glowMat.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const stageVariants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="loader-overlay"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.5, ease: "easeOut" } 
          }}
          className="fixed inset-0 z-[9999] bg-[#070e1c] flex flex-col items-center justify-between overflow-hidden select-none"
        >
          {/* Star particles */}
          <div className="absolute inset-0 pointer-events-none z-0">
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0.2 }}
                animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 2 + (i % 4), repeat: Infinity, delay: (i % 3) * 0.4 }}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${(i * 19 + 7) % 100}%`,
                  top: `${(i * 29 + 13) % 100}%`,
                  boxShadow: '0 0 8px rgba(255, 255, 255, 0.9)',
                }}
              />
            ))}
          </div>

          <div ref={mountRef} className="absolute inset-0 pointer-events-none z-0" />

          <motion.div 
            animate={isZooming ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 pt-8 text-center"
          >
            <span className="text-white/40 text-xs font-black tracking-[0.35em] uppercase">
              UniCoach Global Admissions
            </span>
          </motion.div>

          <motion.div 
            animate={isZooming ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 pb-12 flex flex-col items-center w-full max-w-md px-6"
          >
            <div className="h-8 mb-4 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={stageIndex}
                  variants={stageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/15"
                >
                  <span className="text-base">{loadingStages[stageIndex].emoji}</span>
                  <span className="text-white/90 text-xs md:text-sm font-semibold tracking-wide">
                    {loadingStages[stageIndex].text}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-3 border border-white/10">
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #3b82f6, #06b6d4, #818cf8)',
                  boxShadow: '0 0 16px rgba(59, 130, 246, 0.8)',
                }}
                transition={{ duration: 0.1 }}
              />
            </div>

            <p className="text-white/50 text-xs font-black tracking-[0.25em] uppercase">
              {Math.floor(progress)}%
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loader;
