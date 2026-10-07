import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';

// ==========================================
// COUNTRY DATA WITH COORDINATES
// ==========================================
const countryData = [
  {
    name: 'India',
    capital: 'New Delhi',
    lat: 20.5937,
    lng: 78.9629,
    color: '#FF6B35',
    description: 'Home to 1.4 billion people, known for Taj Mahal, yoga, and diverse cultures.'
  },
  {
    name: 'United States',
    capital: 'Washington D.C.',
    lat: 37.0902,
    lng: -95.7129,
    color: '#FFD700',
    description: 'Leading global economy, known for Hollywood, Silicon Valley, and national parks.',
    link: '/study-abroad/usa'
  },
  {
    name: 'China',
    capital: 'Beijing',
    lat: 35.8617,
    lng: 104.1954,
    color: '#FF4444',
    description: 'World\'s most populous country, birthplace of the Great Wall and pandas.'
  },
  {
    name: 'Brazil',
    capital: 'Brasília',
    lat: -14.2350,
    lng: -51.9253,
    color: '#00B894',
    description: 'Amazon rainforest, carnival, samba, and the largest country in South America.'
  },
  {
    name: 'Australia',
    capital: 'Canberra',
    lat: -25.2744,
    lng: 133.7751,
    color: '#E17055',
    description: 'Land of kangaroos, koalas, the Great Barrier Reef, and outback adventures.',
    link: '/study-abroad/australia'
  },
  {
    name: 'Japan',
    capital: 'Tokyo',
    lat: 36.2048,
    lng: 138.2529,
    color: '#FD79A8',
    description: 'Land of the Rising Sun, known for sushi, anime, and cherry blossom season.'
  },
  {
    name: 'Germany',
    capital: 'Berlin',
    lat: 51.1657,
    lng: 10.4515,
    color: '#FDCB6E',
    description: 'European powerhouse, famous for Autobahn, beer festivals, and engineering.',
    link: '/study-abroad/germany'
  },
  {
    name: 'United Kingdom',
    capital: 'London',
    lat: 55.3781,
    lng: -3.4360,
    color: '#6C5CE7',
    description: 'Birthplace of the Industrial Revolution, known for Big Ben and royal heritage.',
    link: '/study-abroad/uk'
  },
  {
    name: 'Canada',
    capital: 'Ottawa',
    lat: 56.1304,
    lng: -106.3468,
    color: '#FF4D4D',
    description: 'Known for maple syrup, friendly people, stunning natural landscapes, and top universities.',
    link: '/study-abroad/canada'
  }
];

// ==========================================
// ATMOSPHERE GLOW SHADER
// ==========================================
const AtmosphereShader = {
  vertexShader: `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    void main() {
      float intensity = pow(0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
      intensity = clamp(intensity, 0.0, 1.0);
      
      vec3 blueColor = vec3(0.04, 0.39, 0.96);
      vec3 orangeColor = vec3(1.0, 0.42, 0.0);
      vec3 finalGlow = mix(blueColor, orangeColor, vNormal.y * 0.5 + 0.5);
      
      gl_FragColor = vec4(finalGlow, intensity * 0.92);
    }
  `
};

// Helper to draw rounded rectangle in 2D canvas
const drawRoundedRect = (ctx, x, y, width, height, radius) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

// Generates a 2D CanvasTexture showing the UniCoach U logo with graduation cap
const createUTexture = () => {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Clear transparent
  ctx.clearRect(0, 0, size, size);

  // Draw rounded square background (logo style)
  const pad = 16;
  const r = 24;
  const w = size - pad * 2;
  const h = size - pad * 2;
  
  // Create gradient background matching the brand logo
  const grad = ctx.createLinearGradient(pad, pad, pad + w, pad + h);
  grad.addColorStop(0, '#DE5C2B'); // brand blue
  grad.addColorStop(1, '#ff6b00'); // brand orange

  ctx.fillStyle = grad;
  drawRoundedRect(ctx, pad, pad, w, h, r);
  ctx.fill();

  // Draw white "U" inside
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 54px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Draw U slightly offset downwards
  ctx.fillText('U', size / 2, size / 2 + 3);

  // Draw graduation cap on top right
  const capX = size - 32;
  const capY = 28;
  
  // Draw graduation cap diamond
  ctx.fillStyle = '#fcd34d'; // Gold
  ctx.beginPath();
  ctx.moveTo(capX, capY - 10);
  ctx.lineTo(capX + 14, capY - 3);
  ctx.lineTo(capX, capY + 4);
  ctx.lineTo(capX - 14, capY - 3);
  ctx.closePath();
  ctx.fill();
  
  // Skull cap below diamond
  ctx.beginPath();
  ctx.moveTo(capX - 7, capY - 2);
  ctx.quadraticCurveTo(capX, capY + 5, capX + 7, capY - 2);
  ctx.lineTo(capX + 7, capY + 3);
  ctx.quadraticCurveTo(capX, capY + 9, capX - 7, capY + 3);
  ctx.closePath();
  ctx.fill();

  // Tassel
  ctx.strokeStyle = '#fcd34d';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(capX + 7, capY - 2);
  ctx.lineTo(capX + 11, capY + 6);
  ctx.stroke();

  return new THREE.CanvasTexture(canvas);
};

const CartoonEarth = () => {
  const mountRef = useRef(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 450;
    let height = container.clientHeight || 450;

    // ---- Scene Setup ----
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0.1, 2.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    // ---- Earth Globe Material with Midnight Blue Fallback ----
    const earthGeo = new THREE.SphereGeometry(1, 72, 72);
    const earthMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x0a1a2a), // Midnight blue base before texture loads
      roughness: 0.7,
      metalness: 0.05,
      emissive: new THREE.Color(0x0a1a2a),
      emissiveIntensity: 0.05,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earth.rotation.x = 0.1;
    earth.rotation.z = -0.05;
    scene.add(earth);

    // ---- Load Texture with callbacks to smoothly swap ----
    const textureLoader = new THREE.TextureLoader();
    const animeTexture = textureLoader.load(
      '/textures/cartoon_earth.png',
      (texture) => {
        earthMat.map = texture;
        earthMat.color = new THREE.Color(0xffffff); // Remove base color filter
        earthMat.needsUpdate = true;
      },
      undefined,
      (err) => {
        console.error("Earth texture failed to load, keeping clean fallback", err);
      }
    );
    animeTexture.colorSpace = THREE.SRGBColorSpace;

    // ---- Country Markers (3D Pins) ----
    const markerGroup = new THREE.Group();
    const markers = [];
    
    // Create shared logo texture
    const uTexture = createUTexture();

    countryData.forEach((country, index) => {
      const lat = country.lat * Math.PI / 180;
      const lng = country.lng * Math.PI / 180;

      // Convert lat/lng to 3D position on sphere (corrected projection)
      const radius = 1.02;
      const x = -radius * Math.cos(lat) * Math.sin(lng);
      const y = radius * Math.sin(lat);
      const z = radius * Math.cos(lat) * Math.cos(lng);

      // Create marker pin
      const pinGroup = new THREE.Group();

      // U logo Sprite
      const spriteMat = new THREE.SpriteMaterial({
        map: uTexture,
        transparent: true,
        opacity: 0.95,
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(0.12, 0.12, 1);
      sprite.position.set(0, 0, 0);

      // Outer glow
      const glowGeo = new THREE.CircleGeometry(0.055, 16);
      const glowMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(country.color),
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.lookAt(0, 0, 0);

      // Small line/pin
      const pinGeo = new THREE.BufferGeometry();
      const vertices = new Float32Array([
        0, 0, 0,
        x * 0.02, y * 0.02, z * 0.02
      ]);
      pinGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      const pinMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(country.color),
        transparent: true,
        opacity: 0.5,
      });
      const pinLine = new THREE.Line(pinGeo, pinMat);

      pinGroup.add(pinLine);
      pinGroup.add(glow);
      pinGroup.add(sprite);
      pinGroup.position.set(x, y, z);

      // Store marker data for raycasting
      markerGroup.add(pinGroup);
      markers.push({
        mesh: pinGroup,
        country: country,
        sprite: sprite,
        glow: glow,
        originalOpacity: 0.95,
      });
    });

    scene.add(markerGroup);

    // ---- Atmosphere Halo ----
    const haloGeo = new THREE.SphereGeometry(1.12, 64, 64);
    const haloMat = new THREE.ShaderMaterial({
      vertexShader: AtmosphereShader.vertexShader,
      fragmentShader: AtmosphereShader.fragmentShader,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    scene.add(halo);

    // ---- Cute Orbiting Cartoon Clouds ----
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.05,
      emissive: 0xffffff,
      emissiveIntensity: 0.05,
    });
    const geo1 = new THREE.SphereGeometry(0.065, 12, 12);
    const geo2 = new THREE.SphereGeometry(0.048, 10, 10);
    const geo3 = new THREE.SphereGeometry(0.042, 10, 10);
    const geo4 = new THREE.SphereGeometry(0.038, 10, 10);

    const createCartoonCloud = () => {
      const cloudGroup = new THREE.Group();
      
      const sphere1 = new THREE.Mesh(geo1, cloudMat);
      cloudGroup.add(sphere1);

      const sphere2 = new THREE.Mesh(geo2, cloudMat);
      sphere2.position.set(-0.045, -0.01, 0);
      cloudGroup.add(sphere2);

      const sphere3 = new THREE.Mesh(geo3, cloudMat);
      sphere3.position.set(0.045, -0.012, 0);
      cloudGroup.add(sphere3);

      const sphere4 = new THREE.Mesh(geo4, cloudMat);
      sphere4.position.set(0.01, 0.035, 0);
      cloudGroup.add(sphere4);

      return cloudGroup;
    };

    const cloudsOrbitGroup = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const cloud = createCartoonCloud();
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 1.15 + Math.random() * 0.08;
      
      cloud.position.x = r * Math.sin(phi) * Math.cos(theta);
      cloud.position.y = r * Math.sin(phi) * Math.sin(theta);
      cloud.position.z = r * Math.cos(phi);
      
      cloud.lookAt(0, 0, 0);
      cloud.rotation.y += Math.PI;
      
      cloudsOrbitGroup.add(cloud);
    }
    scene.add(cloudsOrbitGroup);

    // ---- Cute Orbiting Cartoon Airplane ----
    const bodyGeo = new THREE.CylinderGeometry(0.015, 0.008, 0.08, 8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xff3838,
      roughness: 0.4,
      metalness: 0.1,
    });
    const wingGeo = new THREE.BoxGeometry(0.12, 0.005, 0.025);
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4,
    });
    const tailGeo = new THREE.BoxGeometry(0.005, 0.025, 0.02);
    const tailMat = new THREE.MeshStandardMaterial({
      color: 0xffc000,
      roughness: 0.4,
    });
    const propHubGeo = new THREE.SphereGeometry(0.01, 8, 8);
    const propHubMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
    });
    const propGeo = new THREE.BoxGeometry(0.05, 0.008, 0.002);
    const propMat = new THREE.MeshBasicMaterial({
      color: 0x333333,
    });

    const createCartoonPlane = () => {
      const planeGroup = new THREE.Group();
      
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.rotation.x = Math.PI / 2;
      planeGroup.add(body);

      const wings = new THREE.Mesh(wingGeo, wingMat);
      wings.position.set(0, 0, 0.01);
      planeGroup.add(wings);

      const tail = new THREE.Mesh(tailGeo, tailMat);
      tail.position.set(0, 0.015, -0.03);
      planeGroup.add(tail);

      const propHub = new THREE.Mesh(propHubGeo, propHubMat);
      propHub.position.set(0, 0, 0.04);
      planeGroup.add(propHub);

      const prop = new THREE.Mesh(propGeo, propMat);
      prop.position.set(0, 0, 0.042);
      planeGroup.add(prop);
      planeGroup.userData = { prop };

      return planeGroup;
    };

    const planeOrbitGroup = new THREE.Group();
    const plane = createCartoonPlane();
    planeOrbitGroup.rotation.x = 0.3;
    planeOrbitGroup.rotation.z = -0.2;
    plane.position.set(1.22, 0, 0); 
    plane.rotation.y = Math.PI / 2;
    
    planeOrbitGroup.add(plane);
    scene.add(planeOrbitGroup);

    // ---- Background Stars ----
    const starCount = 160;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const radius = 1.8 + Math.random() * 1.2;
      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.022,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // Second layer of smaller stars
    const starMat2 = new THREE.PointsMaterial({
      color: 0xaaccff,
      size: 0.012,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const starPoints2 = new THREE.Points(starGeo.clone(), starMat2);
    starPoints2.scale.set(1.6, 1.6, 1.6);
    scene.add(starPoints2);

    // ---- Lighting ----
    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    const sunLight = new THREE.DirectionalLight(0xffeedd, 1.6);
    sunLight.position.set(4, 2, 5);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x88ccff, 0.6);
    fillLight.position.set(-4, -1, -3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xff99cc, 0.4);
    rimLight.position.set(-2, 3, -4);
    scene.add(rimLight);

    // ---- Raycaster for hover detection ----
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const onPointerMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const clientX = event.clientX || event.touches?.[0]?.clientX || 0;
      const clientY = event.clientY || event.touches?.[0]?.clientY || 0;

      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      // Update mouse position for tooltip
      setMousePosition({ x: clientX - rect.left, y: clientY - rect.top });
    };

    const checkHover = () => {
      raycaster.setFromCamera(pointer, camera);

      // Get all marker sprites
      const spriteMeshes = markers.map(m => m.sprite);
      const intersects = raycaster.intersectObjects(spriteMeshes);

      // Reset all markers
      markers.forEach(m => {
        m.sprite.material.opacity = 0.95;
        m.glow.material.opacity = 0.3;
        m.sprite.scale.set(0.12, 0.12, 1);
        m.glow.scale.set(1, 1, 1);
      });

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const marker = markers.find(m => m.sprite === hit);
        if (marker) {
          // Highlight hovered marker
          marker.sprite.material.opacity = 1;
          marker.glow.material.opacity = 0.8;
          marker.sprite.scale.set(0.18, 0.18, 1);
          marker.glow.scale.set(2, 2, 2);
          setHoveredCountry(marker.country);
          if (marker.country.link) {
            renderer.domElement.style.cursor = 'pointer';
          } else {
            renderer.domElement.style.cursor = 'default';
          }
        }
      } else {
        setHoveredCountry(null);
        renderer.domElement.style.cursor = 'default';
      }
    };

    // ---- Drag Interaction ----
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let isDraggingGlobe = false;

    const onPointerDown = (e) => {
      isDragging = true;
      isDraggingGlobe = false;
      const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
      const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
      prevMouse = { x: clientX, y: clientY };
    };

    const onPointerMoveGlobe = (e) => {
      if (!isDragging) return;
      const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
      const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
      const deltaX = clientX - prevMouse.x;
      const deltaY = clientY - prevMouse.y;

      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
        isDraggingGlobe = true;
      }

      if (isDraggingGlobe) {
        earth.rotation.y += deltaX * 0.008;
        earth.rotation.x += deltaY * 0.008;
        earth.rotation.x = Math.max(-0.8, Math.min(0.8, earth.rotation.x));
        // Rotate markers with earth
        markerGroup.rotation.copy(earth.rotation);
      }
      prevMouse = { x: clientX, y: clientY };
    };

    const onPointerUp = () => {
      if (isDragging && !isDraggingGlobe) {
        // Raycast on click
        raycaster.setFromCamera(pointer, camera);
        const spriteMeshes = markers.map(m => m.sprite);
        const intersects = raycaster.intersectObjects(spriteMeshes);
        if (intersects.length > 0) {
          const hit = intersects[0].object;
          const marker = markers.find(m => m.sprite === hit);
          if (marker && marker.country.link) {
            navigate(marker.country.link);
          }
        }
      }
      isDragging = false;
      isDraggingGlobe = false;
    };

    const canvas = renderer.domElement;
    canvas.addEventListener('mousedown', onPointerDown);
    canvas.addEventListener('mousemove', (e) => {
      onPointerMove(e);
      onPointerMoveGlobe(e);
    });
    canvas.addEventListener('mouseup', onPointerUp);
    canvas.addEventListener('mouseleave', () => {
      onPointerUp();
      setHoveredCountry(null);
    });
    canvas.addEventListener('touchstart', (e) => {
      onPointerDown(e);
      onPointerMove(e);
    }, { passive: false });
    canvas.addEventListener('touchmove', (e) => {
      onPointerMove(e);
      onPointerMoveGlobe(e);
    }, { passive: false });
    canvas.addEventListener('touchend', onPointerUp, { passive: false });
    canvas.addEventListener('touchcancel', onPointerUp, { passive: false });

    // ---- Animation Loop ----
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isDragging) {
        earth.rotation.y += 0.0035;
        earth.rotation.x += (0.08 - earth.rotation.x) * 0.002;
        // Keep markers aligned with earth
        markerGroup.rotation.copy(earth.rotation);
      }

      // Animate clouds
      cloudsOrbitGroup.rotation.y += 0.0012;
      cloudsOrbitGroup.rotation.x -= 0.0003;

      // Animate plane
      planeOrbitGroup.rotation.y -= 0.007;
      plane.rotation.x = Math.sin(Date.now() * 0.003) * 0.12;
      plane.rotation.z = Math.cos(Date.now() * 0.003) * 0.15;
      if (plane.userData && plane.userData.prop) {
        plane.userData.prop.rotation.z += 0.35;
      }

      // Check hover every frame
      checkHover();

      starPoints.rotation.y += 0.0002;
      starPoints2.rotation.y -= 0.00015;

      renderer.render(scene, camera);
    };
    animate();

    // ---- Resize Handler ----
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      if (width === 0 || height === 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // ---- Cleanup ----
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', onPointerDown);
      canvas.removeEventListener('mousemove', onPointerMove);
      canvas.removeEventListener('mouseup', onPointerUp);
      canvas.removeEventListener('mouseleave', onPointerUp);
      canvas.removeEventListener('touchstart', onPointerDown);
      canvas.removeEventListener('touchmove', onPointerMove);
      canvas.removeEventListener('touchend', onPointerUp);
      canvas.removeEventListener('touchcancel', onPointerUp);

      earthGeo.dispose();
      earthMat.dispose();
      animeTexture.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      starMat2.dispose();
      
      // Dispose cloud and plane assets
      bodyGeo.dispose();
      bodyMat.dispose();
      wingGeo.dispose();
      wingMat.dispose();
      tailGeo.dispose();
      tailMat.dispose();
      propHubGeo.dispose();
      propHubMat.dispose();
      propGeo.dispose();
      propMat.dispose();
      geo1.dispose();
      geo2.dispose();
      geo3.dispose();
      geo4.dispose();
      cloudMat.dispose();

      renderer.dispose();
      if (canvas && container.contains(canvas)) {
        container.removeChild(canvas);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="w-full h-full" />

      {/* Futuristic Glassmorphic Loading Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/20 backdrop-blur-[3px] rounded-[32px] pointer-events-none transition-opacity duration-300">
          <div className="w-10 h-10 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin mb-3" />
          <span className="text-[10px] font-black text-indigo-500 tracking-[0.2em] uppercase animate-pulse">
            Loading Globe
          </span>
        </div>
      )}

      {/* Hover Tooltip */}
      {hoveredCountry && (
        <div
          className="absolute bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 max-w-[220px] pointer-events-none transition-all duration-200 border border-gray-100"
          style={{
            left: Math.min(mousePosition.x + 20, window.innerWidth - 240),
            top: Math.min(mousePosition.y - 20, window.innerHeight - 200),
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: hoveredCountry.color }}
            />
            <h3 className="font-bold text-gray-800 text-sm">{hoveredCountry.name}</h3>
          </div>
          <p className="text-xs text-gray-500 mb-1">
            <span className="font-semibold">Capital:</span> {hoveredCountry.capital}
          </p>
          <p className="text-xs text-gray-600 leading-relaxed">
            {hoveredCountry.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default CartoonEarth;