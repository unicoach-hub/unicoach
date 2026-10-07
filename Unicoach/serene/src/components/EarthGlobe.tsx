import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface OfficeLocation {
  name: string;
  lat: number;
  lon: number;
  color: number;
}

const EARTH_TEXTURE = 'https://unpkg.com/three-globe@2.35.0/example/img/earth-blue-marble.jpg';
const EARTH_BUMP = 'https://unpkg.com/three-globe@2.35.0/example/img/earth-topology.png';

const locations: OfficeLocation[] = [
  { name: 'Panipat', lat: 29.39, lon: 76.97, color: 0x6366f1 },
  { name: 'Delhi', lat: 28.55, lon: 77.21, color: 0x10b981 },
  { name: 'Jaipur', lat: 26.91, lon: 75.79, color: 0xf97316 },
  { name: 'Bangalore', lat: 12.97, lon: 77.59, color: 0xeab308 },
  { name: 'Kolkata', lat: 22.57, lon: 88.36, color: 0x3b82f6 },
  { name: 'Nepal', lat: 28.3949, lon: 84.124, color: 0xec4899 },
  { name: 'Sri Lanka', lat: 7.8731, lon: 80.7718, color: 0x06b6d4 },
  { name: 'Bangladesh', lat: 23.685, lon: 90.3563, color: 0x10b981 },
];

interface EarthGlobeProps {
  activeOffice?: OfficeLocation | null;
}

export const EarthGlobe: React.FC<EarthGlobeProps> = ({ activeOffice }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const earthRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number | null>(null);
  const scrollDataRef = useRef({ x: 1.30, y: 0, scale: 1.05, opacity: 1, phase: 'hero' });
  const currentOpacityRef = useRef(1);
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const targetRotYRef = useRef((76.97 * Math.PI / 180) + Math.PI / 2);
  const targetRotXRef = useRef(-(29.39 * Math.PI / 180) * 0.7);
  const markersRef = useRef<Array<{ pin: THREE.Mesh; beacon: THREE.Mesh; name: string }>>([]);

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.1);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x3b82f6, 0.35);
    fillLight.position.set(-4, -1, -4);
    scene.add(fillLight);

    const earthGroup = new THREE.Group();
    earthRef.current = earthGroup;
    scene.add(earthGroup);

    const textureLoader = new THREE.TextureLoader();

    // Earth Sphere
    const geometry = new THREE.SphereGeometry(1.6, 64, 64);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      shininess: 15,
      specular: new THREE.Color(0x222222),
    });

    textureLoader.load(EARTH_TEXTURE, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      material.map = texture;
      material.needsUpdate = true;
    });

    textureLoader.load(EARTH_BUMP, (bumpMap) => {
      material.bumpMap = bumpMap;
      material.bumpScale = 0.035;
      material.needsUpdate = true;
    });

    const earthMesh = new THREE.Mesh(geometry, material);
    earthGroup.add(earthMesh);

    // Create office location pins
    const latLonToVector3 = (lat: number, lon: number, radius: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    locations.forEach((loc) => {
      const pos = latLonToVector3(loc.lat, loc.lon, 1.62);

      const pinGeo = new THREE.SphereGeometry(0.032, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color: loc.color });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.copy(pos);
      earthGroup.add(pin);

      const beaconGeo = new THREE.RingGeometry(0.04, 0.075, 32);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: loc.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.copy(pos.clone().multiplyScalar(1.002));
      beacon.lookAt(pos.clone().multiplyScalar(2));
      earthGroup.add(beacon);

      markersRef.current.push({ pin, beacon, name: loc.name });
    });

    // Handle Window Level Mouse Drag
    const handleMouseDown = (e: MouseEvent) => {
      if (e.target && (e.target as HTMLElement).closest('button, a, input, [role="button"]')) return;
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevMouseRef.current.x;
      const dy = e.clientY - prevMouseRef.current.y;

      targetRotYRef.current += dx * 0.005;
      targetRotXRef.current += dy * 0.005;
      targetRotXRef.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotXRef.current));

      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Animation Loop
    let pulseTime = 0;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      pulseTime += 0.04;

      if (earthGroup) {
        const data = scrollDataRef.current;

        if (!isDraggingRef.current) {
          if (data.phase === 'hero' || data.phase === 'services' || data.phase === 'stats') {
            // Auto-rotate slowly in these phases
            targetRotYRef.current += 0.0018;
            earthGroup.rotation.y += (targetRotYRef.current - earthGroup.rotation.y) * 0.06;
            earthGroup.rotation.x += (-0.25 - earthGroup.rotation.x) * 0.05;
          } else if (data.phase === 'hqtour') {
            // HQ Tour: smoothly rotate to the target office location
            const diffY = targetRotYRef.current - earthGroup.rotation.y;
            const shortDiffY = Math.atan2(Math.sin(diffY), Math.cos(diffY));
            earthGroup.rotation.y += shortDiffY * 0.07;

            const diffX = targetRotXRef.current - earthGroup.rotation.x;
            earthGroup.rotation.x += diffX * 0.07;
          }
        } else {
          earthGroup.rotation.y += (targetRotYRef.current - earthGroup.rotation.y) * 0.06;
          earthGroup.rotation.x += (targetRotXRef.current - earthGroup.rotation.x) * 0.06;
        }

        earthGroup.position.x += (data.x - earthGroup.position.x) * 0.06;
        earthGroup.position.y += (data.y - earthGroup.position.y) * 0.06;

        const s = data.scale;
        earthGroup.scale.set(s, s, s);

        currentOpacityRef.current += (data.opacity - currentOpacityRef.current) * 0.08;
        const op = currentOpacityRef.current;

        earthGroup.visible = op > 0.005;
        material.opacity = op;
        material.transparent = op < 0.99;

        markersRef.current.forEach((m) => {
          (m.pin.material as THREE.MeshBasicMaterial).opacity = op;
          (m.pin.material as THREE.MeshBasicMaterial).transparent = op < 0.99;

          const beaconMat = m.beacon.material as THREE.MeshBasicMaterial;
          const scale = 1 + Math.sin(pulseTime * 2) * 0.25;
          m.beacon.scale.set(scale, scale, scale);
          beaconMat.opacity = Math.max(0, (0.7 - (scale - 1)) * op);
        });
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
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update target rotation and marker visibility when activeOffice prop changes
  useEffect(() => {
    if (!activeOffice) return;

    const currentName = activeOffice.name || '';

    // Show only the active office's marker pin + beacon
    markersRef.current.forEach((m) => {
      const isActive = m.name === currentName;
      m.pin.visible = isActive;
      m.beacon.visible = isActive;
    });

    // Rotate globe to face the active office
    const lonRad = (activeOffice.lon * Math.PI) / 180;
    const latRad = (activeOffice.lat * Math.PI) / 180;

    targetRotYRef.current = lonRad + Math.PI / 2;
    targetRotXRef.current = latRad * 0.65;
  }, [activeOffice]);

  // Handle Scroll Choreography
  useEffect(() => {
    const handleScroll = () => {
      const data = scrollDataRef.current;
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const isMobile = vw < 768;

      const hqSection = document.getElementById('hq-tour-section');
      const statsSection = document.getElementById('stats-section');

      // 1. Stats Section ("Numbers That Speak For Themselves"): Earth STAYS HERE as the LAST SECTION!
      if (statsSection) {
        const statsRect = statsSection.getBoundingClientRect();

        // When stats section has scrolled completely out of view (above viewport):
        if (statsRect.bottom <= 0) {
          data.opacity = 0;
          data.phase = 'hidden';
          return;
        }

        // As stats section scrolls up out of view:
        if (statsRect.bottom < vh) {
          const fade = Math.max(0, statsRect.bottom / vh);
          data.opacity = fade;
          data.x = 0;
          data.y = isMobile ? 0.20 : 0.05;
          data.scale = isMobile ? 0.48 : 0.68;
          data.phase = 'stats';
          return;
        }

        // When Stats section is visible in viewport:
        if (statsRect.top <= vh * 0.75) {
          data.x = 0;
          data.y = isMobile ? 0.20 : 0.05;
          data.scale = isMobile ? 0.48 : 0.68;
          data.opacity = 1.0;
          data.phase = 'stats';
          return;
        }
      }

      // 2. HQ Tour Section: Earth shifted LEFT on Desktop, centered vertically (y: 0.05)
      if (hqSection) {
        const hqRect = hqSection.getBoundingClientRect();
        if (hqRect.top <= vh * 0.8 && hqRect.bottom >= 0) {
          data.x = isMobile ? 0 : -1.65;
          data.y = isMobile ? 0.15 : 0.05;
          data.scale = isMobile ? 0.48 : 0.76;
          data.opacity = isMobile ? 0.35 : 1.0;
          data.phase = 'hqtour';
          return;
        }
      }

      // 3. Hero / Services fallback
      const scrollVH = scrollY / vh;

      if (scrollVH <= 1.0) {
        data.x = isMobile ? 0 : 1.30;
        data.y = isMobile ? 0.65 : 0;
        data.scale = isMobile ? 0.58 : 1.05;
        data.opacity = isMobile ? 0.85 : 1.0;
        data.phase = 'hero';
      } else {
        const t = Math.min(1, (scrollVH - 1.0) / 1.5);
        data.x = isMobile ? 0 : (1.30 - t * 2.95);
        data.y = isMobile ? 0.15 : 0.05;
        data.scale = isMobile ? 0.45 : 0.70;
        data.opacity = isMobile ? 0.20 : 1.0;
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
