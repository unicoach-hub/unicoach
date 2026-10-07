import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// ==========================================
// REALISTIC 3D EARTH GLOBE
// - Interactive 360° Cursor Drag on ANY Section (Hero, Services, HQ Tour, Stats)!
// - Uses Three.js Raycaster on window level so users can drag the Earth on the Hero section smoothly!
// - Hero: x = 1.30, scale = 1.05 (Right side, 100% round)
// - Services: Glides from Right (1.30) to Left (-1.8)
// - HQ Tour: x = -1.8, y = -0.35, scale = 0.78 (Left side, locked on active office)
// - Stats ("Numbers That Speak For Themselves"): Centered inside Stats section (x: 0, y: 0, scale: 0.72)
// - ZERO BLEED into Testimonials: Fades to opacity 0 before Stats bottom leaves screen!
// ==========================================

const EARTH_TEXTURE = 'https://unpkg.com/three-globe@2.35.0/example/img/earth-blue-marble.jpg';
const EARTH_BUMP = 'https://unpkg.com/three-globe@2.35.0/example/img/earth-topology.png';

const locations = [
  { name: 'Panipat', lat: 29.39, lon: 76.97, color: 0x6366f1 },
  { name: 'Delhi', lat: 28.55, lon: 77.21, color: 0x10b981 },
  { name: 'Jaipur', lat: 26.91, lon: 75.79, color: 0xf97316 },
  { name: 'Bangalore', lat: 12.97, lon: 77.59, color: 0xeab308 },
  { name: 'Kolkata', lat: 22.57, lon: 88.36, color: 0x3b82f6 },
  { name: 'Nepal', lat: 28.3949, lon: 84.124, color: 0xec4899 },
  { name: 'Sri Lanka', lat: 7.8731, lon: 80.7718, color: 0x06b6d4 },
  { name: 'Bangladesh', lat: 23.685, lon: 90.3563, color: 0x10b981 },
];

const EarthGlobe = ({ activeOffice }) => {
  const mountRef = useRef(null);
  const earthRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const frameRef = useRef(null);
  const scrollDataRef = useRef({ x: 1.30, y: 0, scale: 1.05, opacity: 1, phase: 'hero' });
  const currentOpacityRef = useRef(1);
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const targetRotYRef = useRef((76.97 * Math.PI / 180) + Math.PI / 2);
  const targetRotXRef = useRef(-(29.39 * Math.PI / 180) * 0.7);
  const markersRef = useRef([]);
  const glowRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 6);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Balanced Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaf0, 2.5);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x8ab4f8, 0.6);
    fillLight.position.set(-4, -1, -4);
    scene.add(fillLight);

    const textureLoader = new THREE.TextureLoader();

    // Earth Sphere Geometry
    const earthGeometry = new THREE.SphereGeometry(1.65, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a365d, // Deep ocean blue base color so globe is never white!
      shininess: 18,
      specular: new THREE.Color(0x222222),
      transparent: true,
      opacity: 1,
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    earthMesh.position.set(1.30, 0, 0);
    earthMesh.scale.setScalar(1.05);
    earthMesh.rotation.y = (76.97 * Math.PI / 180) + Math.PI / 2;
    earthMesh.rotation.x = (29.39 * Math.PI / 180) * 0.65;
    scene.add(earthMesh);
    earthRef.current = earthMesh;

    // Load Earth textures
    textureLoader.load(EARTH_TEXTURE, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      earthMaterial.color.setHex(0xffffff);
      earthMaterial.map = tex;
      earthMaterial.needsUpdate = true;
    });
    textureLoader.load(EARTH_BUMP, (tex) => {
      earthMaterial.bumpMap = tex;
      earthMaterial.bumpScale = 0.035;
      earthMaterial.needsUpdate = true;
    });

    // Atmosphere Glow
    const glowGeometry = new THREE.SphereGeometry(1.70, 64, 64);
    const glowMaterial = new THREE.ShaderMaterial({
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
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.8);
          gl_FragColor = vec4(0.35, 0.65, 1.0, intensity * 0.35 * uOpacity);
        }
      `,
      uniforms: {
        uOpacity: { value: 1.0 },
      },
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    glowMesh.position.copy(earthMesh.position);
    scene.add(glowMesh);
    glowRef.current = glowMesh;

    // 3D Pins on Earth Surface
    const markers = [];
    locations.forEach((loc) => {
      const latRad = (loc.lat * Math.PI) / 180;
      const lonRad = (loc.lon * Math.PI) / 180;
      const r = 1.67;

      const x = r * Math.cos(latRad) * Math.cos(lonRad);
      const y = r * Math.sin(latRad);
      const z = -r * Math.cos(latRad) * Math.sin(lonRad);

      const pinGeo = new THREE.SphereGeometry(0.065, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color: loc.color, transparent: true, opacity: 1 });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.set(x, y, z);
      earthMesh.add(pin);

      const beaconGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: loc.color,
        transparent: true,
        opacity: 0.6,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.copy(pin.position);
      earthMesh.add(beacon);

      markers.push({ pin, beacon, name: loc.name });
    });
    markersRef.current = markers;

    const clock = new THREE.Clock();

    // Render loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const data = scrollDataRef.current;

      // Smooth Opacity Interpolation
      currentOpacityRef.current += (data.opacity - currentOpacityRef.current) * 0.12;

      if (earthRef.current) {
        earthRef.current.position.x += (data.x - earthRef.current.position.x) * 0.08;
        earthRef.current.position.y += (data.y - earthRef.current.position.y) * 0.08;

        const currentScale = earthRef.current.scale.x;
        const newScale = currentScale + (data.scale - currentScale) * 0.08;
        earthRef.current.scale.setScalar(newScale);

        // Opacity & Visibility
        const op = Math.max(0, Math.min(1, currentOpacityRef.current));
        earthMaterial.opacity = op;
        earthMesh.visible = op > 0.01;

        if (glowMaterial.uniforms.uOpacity) {
          glowMaterial.uniforms.uOpacity.value = op;
        }

        if (!isDraggingRef.current) {
          if (data.phase === 'hero' || data.phase === 'services' || data.phase === 'stats') {
            earthRef.current.rotation.y += 0.0025;
            earthRef.current.rotation.x += (-0.25 - earthRef.current.rotation.x) * 0.05;
          } else if (data.phase === 'hqtour' && targetRotYRef.current !== null) {
            const diffY = targetRotYRef.current - earthRef.current.rotation.y;
            const shortDiffY = Math.atan2(Math.sin(diffY), Math.cos(diffY));
            earthRef.current.rotation.y += shortDiffY * 0.07;

            const diffX = targetRotXRef.current - earthRef.current.rotation.x;
            earthRef.current.rotation.x += diffX * 0.07;
          }
        }

        markers.forEach((m) => {
          if (m.beacon.visible) {
            m.beacon.scale.setScalar(1 + Math.sin(elapsed * 4.0) * 0.45);
          }
        });
      }

      if (glowRef.current && earthRef.current) {
        glowRef.current.position.copy(earthRef.current.position);
        glowRef.current.scale.copy(earthRef.current.scale);
        glowRef.current.visible = earthMesh.visible;
      }

      renderer.render(scene, camera);
    };
    animate();

    // RAYCASTER POINTER DRAG (Works on Hero Section & all other sections!)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (e) => {
      if (!earthMesh || !earthMesh.visible) return;
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(earthMesh);

      if (intersects.length > 0) {
        isDraggingRef.current = true;
        prevMouseRef.current = { x: e.clientX, y: e.clientY };
        document.body.style.cursor = 'grabbing';
      }
    };

    const onPointerMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      if (isDraggingRef.current && earthRef.current) {
        const dx = e.clientX - prevMouseRef.current.x;
        const dy = e.clientY - prevMouseRef.current.y;
        earthRef.current.rotation.y += dx * 0.006;
        earthRef.current.rotation.x += dy * 0.004;
        earthRef.current.rotation.x = Math.max(-0.8, Math.min(0.8, earthRef.current.rotation.x));
        prevMouseRef.current = { x: e.clientX, y: e.clientY };
      } else if (earthMesh && earthMesh.visible) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(earthMesh);
        if (intersects.length > 0) {
          document.body.style.cursor = 'grab';
        } else {
          if (document.body.style.cursor === 'grab' || document.body.style.cursor === 'grabbing') {
            document.body.style.cursor = 'default';
          }
        }
      }
    };

    const onPointerUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        document.body.style.cursor = 'default';
      }
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

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
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      earthGeometry.dispose();
      earthMaterial.dispose();
      glowGeometry.dispose();
      glowMaterial.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Active office pin selection
  useEffect(() => {
    const currentName = activeOffice ? activeOffice.city || activeOffice.name : 'Panipat';

    markersRef.current.forEach((m) => {
      const isActive = m.name === currentName;
      m.pin.visible = isActive;
      m.beacon.visible = isActive;
    });

    const currentLoc = locations.find((l) => l.name === currentName) || locations[0];
    const lonRad = (currentLoc.lon * Math.PI) / 180;
    const latRad = (currentLoc.lat * Math.PI) / 180;

    targetRotYRef.current = lonRad + Math.PI / 2;
    targetRotXRef.current = latRad * 0.65;
  }, [activeOffice]);

  // Section Scroll Choreography
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const data = scrollDataRef.current;
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const isMobile = vw < 768;

      const hqSection = document.getElementById('hq-tour-section');
      const statsSection = document.getElementById('stats-section');

      // Stats Section ("Numbers That Speak For Themselves"): Earth STAYS HERE as the LAST SECTION!
      if (statsSection) {
        const statsRect = statsSection.getBoundingClientRect();

        // As soon as Stats section starts scrolling up out of view:
        if (statsRect.bottom < vh * 0.90) {
          const fade = Math.max(0, (statsRect.bottom - vh * 0.45) / (vh * 0.45));
          data.opacity = fade;
          data.x = 0;
          data.y = isMobile ? 0.35 : 0.25;
          data.scale = isMobile ? 0.48 : 0.68;
          data.phase = 'stats';
          return;
        }

        // When Stats section is centered in viewport:
        if (statsRect.top <= vh * 0.75) {
          data.x = 0;
          data.y = isMobile ? 0.35 : 0.25;
          data.scale = isMobile ? 0.48 : 0.68;
          data.opacity = 1.0;
          data.phase = 'stats';
          return;
        }
      }

      // HQ Tour Section: Earth shifted LEFT on Desktop, centered & subtle on Mobile!
      if (hqSection) {
        const hqRect = hqSection.getBoundingClientRect();
        if (hqRect.top <= vh * 0.8 && hqRect.bottom >= 0) {
          data.x = isMobile ? 0 : -1.8;
          data.y = isMobile ? 0.58 : -0.35;
          data.scale = isMobile ? 0.48 : 0.78;
          data.opacity = isMobile ? 0.35 : 1.0; // Subtle transparent background on mobile so card text is 100% clear!
          data.phase = 'hqtour';
          return;
        }
      }

      // Hero / Services fallback
      const scrollVH = scrollY / vh;

      if (scrollVH <= 1.0) {
        data.x = isMobile ? 0 : 1.30;
        data.y = isMobile ? 0.65 : 0;
        data.scale = isMobile ? 0.58 : 1.05;
        data.opacity = isMobile ? 0.85 : 1.0;
        data.phase = 'hero';
      } else {
        const t = Math.min(1, (scrollVH - 1.0) / 1.5);
        data.x = isMobile ? 0 : (1.30 - t * 3.10);
        data.y = isMobile ? 0 : -0.40;
        data.scale = isMobile ? 0.45 : 0.70;
        data.opacity = isMobile ? 0.20 : 0.85;
        data.phase = 'services';
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 z-10 pointer-events-none"
      style={{ willChange: 'transform' }}
    />
  );
};

export default EarthGlobe;
