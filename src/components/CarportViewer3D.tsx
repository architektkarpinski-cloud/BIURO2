import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CarportConfig, TimeOfDay } from '../types/carport';

interface CarportViewer3DProps {
  config: CarportConfig;
  onTakeScreenshotRef?: React.MutableRefObject<(() => string) | null>;
}

export const CarportViewer3D: React.FC<CarportViewer3DProps> = ({ config, onTakeScreenshotRef }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const carportGroupRef = useRef<THREE.Group | null>(null);
  const louversRef = useRef<THREE.Mesh[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Materials cache to avoid recreating on each frame
  const materialsRef = useRef<{
    frame?: THREE.MeshStandardMaterial;
    roof?: THREE.MeshStandardMaterial;
    wood?: THREE.MeshStandardMaterial;
    glass?: THREE.MeshPhysicalMaterial;
    solar?: THREE.MeshStandardMaterial;
    ledEmissive?: THREE.MeshStandardMaterial;
    pavers?: THREE.MeshStandardMaterial;
    carPaint?: THREE.MeshStandardMaterial;
    carGlass?: THREE.MeshPhysicalMaterial;
    carTire?: THREE.MeshStandardMaterial;
    carRim?: THREE.MeshStandardMaterial;
  }>({});

  // 1. Initial Three.js Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(7.5, 4.2, 9.0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true, // For PNG screenshots
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Prevent camera sinking beneath ground
    controls.minDistance = 3.0;
    controls.maxDistance = 25.0;
    controls.target.set(0, 1.3, 0);
    controlsRef.current = controls;

    // Handle Resize
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Context lost/restored handling
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      console.warn('WebGL Context Lost');
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost, false);

    // Provide screenshot capture callback
    if (onTakeScreenshotRef) {
      onTakeScreenshotRef.current = () => {
        if (!rendererRef.current) return '';
        return rendererRef.current.domElement.toDataURL('image/png');
      };
    }

    setIsReady(true);

    // Render loop
    let lastTime = performance.now();
    const animate = (time: number) => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      controls.update();

      // Auto-animating louvers if enabled
      if (louversRef.current.length > 0 && config.louverAnimation) {
        const angle = (Math.sin(time * 0.001) * 0.5 + 0.5) * THREE.MathUtils.degToRad(120);
        louversRef.current.forEach((louver) => {
          louver.rotation.x = angle;
        });
      }

      renderer.render(scene, camera);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // 2. Camera presets update
  useEffect(() => {
    if (!controlsRef.current || !cameraRef.current) return;
    const controls = controlsRef.current;
    const camera = cameraRef.current;
    const { width, length, height } = config.dimensions;
    const centerY = height * 0.5;

    switch (config.environment.viewAngle) {
      case 'perspective':
        camera.position.set(width * 1.3, height * 1.5, length * 1.3);
        controls.target.set(0, centerY, 0);
        break;
      case 'front':
        camera.position.set(0, height * 0.9, length * 1.5 + 2);
        controls.target.set(0, height * 0.5, 0);
        break;
      case 'side':
        camera.position.set(width * 1.8 + 2, height * 0.9, 0);
        controls.target.set(0, height * 0.5, 0);
        break;
      case 'top':
        camera.position.set(0, height * 3.5 + 4, 0.01);
        controls.target.set(0, 0, 0);
        break;
      case 'isometric':
        camera.position.set(width * 1.6, height * 2.2, length * 1.6);
        controls.target.set(0, centerY, 0);
        break;
    }
    controls.update();
  }, [config.environment.viewAngle]);

  // 3. Environment Lighting & Sky update
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove existing lights & background
    const existingLights = scene.children.filter(
      (c) => c instanceof THREE.Light || c.name === 'env_bg'
    );
    existingLights.forEach((l) => scene.remove(l));

    const time = config.environment.timeOfDay;
    let bgColor = 0x0a0c10;
    let sunColor = 0xfff3e0;
    let sunIntensity = 2.4;
    let sunPos = new THREE.Vector3(12, 18, 14);
    let ambColor = 0x8aa5c0;
    let ambIntensity = 0.9;

    if (time === 'day') {
      bgColor = 0x0f172a; // Deep technical slate
      sunColor = 0xfffcf0;
      sunIntensity = 2.6;
      sunPos.set(15, 22, 12);
      ambColor = 0x94a3b8;
      ambIntensity = 1.0;
      scene.fog = new THREE.FogExp2(0x0f172a, 0.022);
    } else if (time === 'sunset') {
      bgColor = 0x1c1018;
      sunColor = 0xff8c42;
      sunIntensity = 2.0;
      sunPos.set(22, 7, 10);
      ambColor = 0xb45309;
      ambIntensity = 0.7;
      scene.fog = new THREE.FogExp2(0x1c1018, 0.026);
    } else {
      // Night
      bgColor = 0x05070a;
      sunColor = 0x38bdf8;
      sunIntensity = 0.25; // Moon
      sunPos.set(-10, 15, -10);
      ambColor = 0x1e293b;
      ambIntensity = 0.35;
      scene.fog = new THREE.FogExp2(0x05070a, 0.035);
    }

    scene.background = new THREE.Color(bgColor);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(ambColor, ambIntensity);
    ambientLight.name = 'ambient_light';
    scene.add(ambientLight);

    // Directional Sun / Moon light with soft shadows
    const sunLight = new THREE.DirectionalLight(sunColor, sunIntensity);
    sunLight.position.copy(sunPos);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 40;
    const d = 10;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0003;
    scene.add(sunLight);

    // Secondary fill light
    const fillLight = new THREE.DirectionalLight(0x60a5fa, time === 'night' ? 0.2 : 0.6);
    fillLight.position.set(-12, 10, -12);
    scene.add(fillLight);

    // Ground bounce light
    const hemiLight = new THREE.HemisphereLight(sunColor, 0x1e293b, 0.4);
    scene.add(hemiLight);

    // Carport Night LED Lighting simulation
    if (config.accessories.ledPerimeter || config.accessories.ledLouvers) {
      const ledColorHex =
        config.accessories.ledColorTemp === 'warm'
          ? 0xffe2b0
          : config.accessories.ledColorTemp === 'neutral'
          ? 0xffffff
          : 0xd6eaff;
      
      const ledPower = (config.accessories.ledBrightness / 100) * (time === 'night' ? 2.5 : time === 'sunset' ? 1.8 : 0.8);
      
      const ledCenterLight = new THREE.PointLight(ledColorHex, ledPower, 10, 1.2);
      ledCenterLight.position.set(0, config.dimensions.height - 0.25, 0);
      scene.add(ledCenterLight);

      // Downlights inside bays
      const bayX = config.bays === 2 ? config.dimensions.width * 0.25 : 0;
      const spotLeft = new THREE.SpotLight(ledColorHex, ledPower * 1.2, 8, Math.PI / 3, 0.5, 1.0);
      spotLeft.position.set(-bayX, config.dimensions.height - 0.1, 0);
      spotLeft.target.position.set(-bayX, 0, 0);
      scene.add(spotLeft);
      scene.add(spotLeft.target);

      if (config.bays === 2) {
        const spotRight = new THREE.SpotLight(ledColorHex, ledPower * 1.2, 8, Math.PI / 3, 0.5, 1.0);
        spotRight.position.set(bayX, config.dimensions.height - 0.1, 0);
        spotRight.target.position.set(bayX, 0, 0);
        scene.add(spotRight);
        scene.add(spotRight.target);
      }
    }
  }, [config.environment.timeOfDay, config.accessories, config.dimensions.height, config.bays]);

  // 4. Generate Procedural Textures & Materials
  const createProceduralTextures = useCallback(() => {
    // Canvas for pavers
    const paverCanvas = document.createElement('canvas');
    paverCanvas.width = 512;
    paverCanvas.height = 512;
    const ctx = paverCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#27272a';
      ctx.fillRect(0, 0, 512, 512);

      // Stone tiles
      const cols = 8;
      const rows = 16;
      const tileW = 512 / cols;
      const tileH = 512 / rows;

      for (let r = 0; r < rows; r++) {
        const offset = (r % 2) * (tileW * 0.5);
        for (let c = -1; c <= cols; c++) {
          const shade = 35 + Math.floor(Math.sin(r * 3 + c * 7) * 8);
          ctx.fillStyle = `rgb(${shade}, ${shade + 2}, ${shade + 4})`;
          ctx.fillRect(c * tileW + offset + 2, r * tileH + 2, tileW - 4, tileH - 4);
          
          // Subtle edge bevel
          ctx.strokeStyle = 'rgba(0,0,0,0.5)';
          ctx.strokeRect(c * tileW + offset + 2, r * tileH + 2, tileW - 4, tileH - 4);
        }
      }
    }
    const paverTexture = new THREE.CanvasTexture(paverCanvas);
    paverTexture.wrapS = THREE.RepeatWrapping;
    paverTexture.wrapT = THREE.RepeatWrapping;
    paverTexture.repeat.set(6, 6);

    return { paverTexture };
  }, []);

  // 5. Reconstruct 3D Carport Geometry when config changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !isReady) return;

    // Remove old carport group
    if (carportGroupRef.current) {
      scene.remove(carportGroupRef.current);
      carportGroupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
        }
      });
      carportGroupRef.current = null;
    }

    louversRef.current = [];
    const carportGroup = new THREE.Group();
    carportGroup.name = 'carport_main_group';

    const { width, length, height, slope } = config.dimensions;
    const postSizeMm = config.postProfile === '200x200' ? 0.20 : 0.15;
    const isAttached = config.installationType === 'attached';
    const halfW = width * 0.5;
    const halfL = length * 0.5;

    // Texture helpers
    const { paverTexture } = createProceduralTextures();

    // Material definitions
    const frameColor = new THREE.Color(config.colors.frameHex);
    const roofColor = new THREE.Color(config.colors.roofHex);
    const woodHex = config.colors.woodTone === 'walnut' ? 0x452f1e : config.colors.woodTone === 'larch' ? 0xb58045 : 0x9b6b3b;

    const frameMat = new THREE.MeshStandardMaterial({
      color: frameColor,
      roughness: 0.38,
      metalness: 0.82,
    });

    const roofMat = new THREE.MeshStandardMaterial({
      color: roofColor,
      roughness: 0.35,
      metalness: 0.75,
    });

    const woodMat = new THREE.MeshStandardMaterial({
      color: woodHex,
      roughness: 0.72,
      metalness: 0.02,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x94a3b8,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.88,
      thickness: 0.02,
      transparent: true,
      opacity: 0.65,
    });

    const solarMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.9,
    });

    // ----------------------------------------------------
    // A. GROUND PLANE
    // ----------------------------------------------------
    const groundGeo = new THREE.PlaneGeometry(24, 24);
    const groundMat = new THREE.MeshStandardMaterial({
      map: config.environment.groundType === 'pavers' ? paverTexture : null,
      color: config.environment.groundType === 'concrete' ? 0x27272a : config.environment.groundType === 'gravel' ? 0x1f2937 : 0x18181b,
      roughness: 0.85,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    carportGroup.add(ground);

    // Subtle driveway guide markings
    const markingGeo = new THREE.PlaneGeometry(0.12, length * 0.8);
    const markingMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.6,
      transparent: true,
      opacity: 0.25,
    });
    if (config.bays === 2) {
      const mark1 = new THREE.Mesh(markingGeo, markingMat);
      mark1.rotation.x = -Math.PI / 2;
      mark1.position.set(0, 0.002, 0);
      carportGroup.add(mark1);
    }

    // ----------------------------------------------------
    // B. HOUSE ELEVATION WALL (If attached or showWall)
    // ----------------------------------------------------
    if (isAttached || config.environment.showWall) {
      const wallGroup = new THREE.Group();
      const wallH = height + 1.8;
      const wallW = width + 5;
      const wallGeo = new THREE.BoxGeometry(wallW, wallH, 0.35);
      const wallMat = new THREE.MeshStandardMaterial({
        color: 0x3f3f46,
        roughness: 0.9,
      });
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.set(0, wallH * 0.5, -halfL - 0.18);
      wall.receiveShadow = true;
      wallGroup.add(wall);

      // Contemporary house window
      const winGeo = new THREE.BoxGeometry(2.4, 1.4, 0.08);
      const winFrameMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 });
      const winMesh = new THREE.Mesh(winGeo, winFrameMat);
      winMesh.position.set(0, height * 0.8, -halfL);
      wallGroup.add(winMesh);

      const glassPaneGeo = new THREE.PlaneGeometry(2.2, 1.2);
      const glassPane = new THREE.Mesh(glassPaneGeo, glassMat);
      glassPane.position.set(0, height * 0.8, -halfL + 0.045);
      wallGroup.add(glassPane);

      carportGroup.add(wallGroup);
    }

    // ----------------------------------------------------
    // C. STRUCTURAL POSTS (SŁUPY NOŚNE)
    // ----------------------------------------------------
    const postGeo = new THREE.BoxGeometry(postSizeMm, height, postSizeMm);
    const footGeo = new THREE.BoxGeometry(postSizeMm + 0.08, 0.04, postSizeMm + 0.08);
    const footMat = new THREE.MeshStandardMaterial({ color: 0x52525b, metalness: 0.8, roughness: 0.3 });

    // Determine post X and Z coordinates
    const postPositions: [number, number][] = [];
    const insetX = halfW - postSizeMm * 0.5;
    const insetZ = halfL - postSizeMm * 0.5;

    if (!isAttached) {
      // Front posts
      postPositions.push([-insetX, insetZ]);
      postPositions.push([insetX, insetZ]);

      // Back posts
      postPositions.push([-insetX, -insetZ]);
      postPositions.push([insetX, -insetZ]);

      // Intermediate posts for long carports (>6.2m)
      if (length > 6.2) {
        postPositions.push([-insetX, 0]);
        postPositions.push([insetX, 0]);
      }
    } else {
      // Attached: posts only at the front! (and mid if long)
      postPositions.push([-insetX, insetZ]);
      postPositions.push([insetX, insetZ]);
      if (length > 6.2) {
        postPositions.push([-insetX, 0]);
        postPositions.push([insetX, 0]);
      }
    }

    postPositions.forEach(([px, pz], idx) => {
      const postMesh = new THREE.Mesh(postGeo, frameMat);
      postMesh.position.set(px, height * 0.5, pz);
      postMesh.castShadow = true;
      postMesh.receiveShadow = true;
      carportGroup.add(postMesh);

      // Foot anchor base plate
      const footMesh = new THREE.Mesh(footGeo, footMat);
      footMesh.position.set(px, 0.02, pz);
      footMesh.castShadow = true;
      carportGroup.add(footMesh);

      // Add Wallbox EV Charger on the front-left post
      if (config.accessories.evCharger && idx === 0) {
        const wbGroup = new THREE.Group();
        wbGroup.position.set(px, 1.35, pz);

        // Body of Wallbox
        const wbBodyGeo = new THREE.BoxGeometry(0.24, 0.36, 0.12);
        const wbBodyMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.3, metalness: 0.5 });
        const wbBody = new THREE.Mesh(wbBodyGeo, wbBodyMat);
        wbBody.position.set(0, 0, postSizeMm * 0.5 + 0.06);
        wbGroup.add(wbBody);

        // LED Status ring
        const ringGeo = new THREE.RingGeometry(0.04, 0.055, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.set(0, 0.06, postSizeMm * 0.5 + 0.121);
        wbGroup.add(ring);

        // Hanging charging cable coil
        const cableTorus = new THREE.TorusGeometry(0.12, 0.015, 12, 24, Math.PI * 1.5);
        const cableMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.8 });
        const cableMesh = new THREE.Mesh(cableTorus, cableMat);
        cableMesh.rotation.z = Math.PI * 0.25;
        cableMesh.position.set(0.18, -0.08, postSizeMm * 0.5 + 0.08);
        wbGroup.add(cableMesh);

        carportGroup.add(wbGroup);
      }
    });

    // ----------------------------------------------------
    // D. ROOF FRAME BEAMS (WIEŃCE I BELKI OBWODOWE)
    // ----------------------------------------------------
    const beamH = 0.22;
    const beamW = 0.14;
    const slopeRad = THREE.MathUtils.degToRad(slope);

    // Front & Back beams
    const beamXGeo = new THREE.BoxGeometry(width, beamH, beamW);
    const frontBeam = new THREE.Mesh(beamXGeo, frameMat);
    frontBeam.position.set(0, height + beamH * 0.5, halfL - beamW * 0.5);
    frontBeam.castShadow = true;
    frontBeam.receiveShadow = true;
    carportGroup.add(frontBeam);

    const backBeam = new THREE.Mesh(beamXGeo, frameMat);
    backBeam.position.set(0, height + beamH * 0.5 - Math.sin(slopeRad) * length, -halfL + beamW * 0.5);
    backBeam.castShadow = true;
    backBeam.receiveShadow = true;
    carportGroup.add(backBeam);

    // Left & Right longitudinal side beams
    const beamZGeo = new THREE.BoxGeometry(beamW, beamH, length);
    const leftBeam = new THREE.Mesh(beamZGeo, frameMat);
    leftBeam.position.set(-halfW + beamW * 0.5, height + beamH * 0.5, 0);
    leftBeam.castShadow = true;
    leftBeam.receiveShadow = true;
    carportGroup.add(leftBeam);

    const rightBeam = new THREE.Mesh(beamZGeo, frameMat);
    rightBeam.position.set(halfW - beamW * 0.5, height + beamH * 0.5, 0);
    rightBeam.castShadow = true;
    rightBeam.receiveShadow = true;
    carportGroup.add(rightBeam);

    // Mid reinforcement beam for double bay
    if (config.bays === 2) {
      const midBeam = new THREE.Mesh(new THREE.BoxGeometry(beamW * 0.8, beamH * 0.8, length - beamW * 2), frameMat);
      midBeam.position.set(0, height + beamH * 0.5, 0);
      midBeam.castShadow = true;
      carportGroup.add(midBeam);
    }

    // ----------------------------------------------------
    // E. PERIMETER LED STRIP LIGHTING
    // ----------------------------------------------------
    if (config.accessories.ledPerimeter) {
      const ledColorHex =
        config.accessories.ledColorTemp === 'warm'
          ? 0xffe2b0
          : config.accessories.ledColorTemp === 'neutral'
          ? 0xffffff
          : 0xd6eaff;

      const ledMat = new THREE.MeshStandardMaterial({
        color: ledColorHex,
        emissive: ledColorHex,
        emissiveIntensity: (config.accessories.ledBrightness / 100) * 2.5,
        roughness: 0.1,
      });

      const stripThickness = 0.02;
      const stripOffset = 0.02;

      // Front & Back strip
      const stripXGeo = new THREE.BoxGeometry(width - beamW * 2, stripThickness, stripThickness);
      const stripFront = new THREE.Mesh(stripXGeo, ledMat);
      stripFront.position.set(0, height + stripOffset, halfL - beamW - stripThickness * 0.5);
      carportGroup.add(stripFront);

      const stripBack = new THREE.Mesh(stripXGeo, ledMat);
      stripBack.position.set(0, height + stripOffset, -halfL + beamW + stripThickness * 0.5);
      carportGroup.add(stripBack);

      // Left & Right strip
      const stripZGeo = new THREE.BoxGeometry(stripThickness, stripThickness, length - beamW * 2);
      const stripLeft = new THREE.Mesh(stripZGeo, ledMat);
      stripLeft.position.set(-halfW + beamW + stripThickness * 0.5, height + stripOffset, 0);
      carportGroup.add(stripLeft);

      const stripRight = new THREE.Mesh(stripZGeo, ledMat);
      stripRight.position.set(halfW - beamW - stripThickness * 0.5, height + stripOffset, 0);
      carportGroup.add(stripRight);
    }

    // ----------------------------------------------------
    // F. ROOF COVERING (LAMELE, PANELE PV, SZKŁO, PŁYTA)
    // ----------------------------------------------------
    const innerW = width - beamW * 2;
    const innerL = length - beamW * 2;
    const roofY = height + beamH * 0.7;

    if (config.roofType === 'bioclimatic') {
      // Extruded aerodynamic louvers with pivot rotation
      const louverSpacing = 0.22;
      const louverCount = Math.floor(innerL / louverSpacing);
      const startZ = -innerL * 0.5 + louverSpacing * 0.5;
      const angleRad = THREE.MathUtils.degToRad(config.louverAngle);

      // Bioclimatic blade profile geometry
      const bladeGeo = new THREE.BoxGeometry(innerW, 0.025, 0.20);

      for (let i = 0; i < louverCount; i++) {
        const louver = new THREE.Mesh(bladeGeo, roofMat);
        const lz = startZ + i * louverSpacing;
        louver.position.set(0, roofY, lz);
        louver.rotation.x = angleRad;
        louver.castShadow = true;
        louver.receiveShadow = true;
        carportGroup.add(louver);
        louversRef.current.push(louver);

        // Optional LED spots on every 3rd louver
        if (config.accessories.ledLouvers && i % 3 === 1) {
          const spotLedGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.03, 16);
          const spotLedMat = new THREE.MeshBasicMaterial({ color: 0xfff2cc });
          const spot1 = new THREE.Mesh(spotLedGeo, spotLedMat);
          spot1.position.set(-innerW * 0.25, -0.015, 0);
          louver.add(spot1);

          const spot2 = new THREE.Mesh(spotLedGeo, spotLedMat);
          spot2.position.set(innerW * 0.25, -0.015, 0);
          louver.add(spot2);
        }
      }
    } else if (config.roofType === 'solar') {
      // Photovoltaic BIPV glass-glass modules
      const panelCols = Math.max(2, Math.floor(innerW / 1.05));
      const panelRows = Math.max(3, Math.floor(innerL / 1.75));
      const pW = innerW / panelCols - 0.03;
      const pL = innerL / panelRows - 0.03;

      const pvGeo = new THREE.BoxGeometry(pW, 0.035, pL);

      for (let c = 0; c < panelCols; c++) {
        for (let r = 0; r < panelRows; r++) {
          const px = -innerW * 0.5 + (c + 0.5) * (innerW / panelCols);
          const pz = -innerL * 0.5 + (r + 0.5) * (innerL / panelRows);

          const panel = new THREE.Mesh(pvGeo, solarMat);
          panel.position.set(px, roofY, pz);
          panel.castShadow = true;
          panel.receiveShadow = true;
          carportGroup.add(panel);

          // Grid lines simulation for solar cells
          const gridGeo = new THREE.PlaneGeometry(pW * 0.94, pL * 0.94);
          const gridMat = new THREE.MeshBasicMaterial({
            color: 0x1e3a8a,
            wireframe: true,
          });
          const grid = new THREE.Mesh(gridGeo, gridMat);
          grid.rotation.x = -Math.PI / 2;
          grid.position.set(px, roofY + 0.02, pz);
          carportGroup.add(grid);
        }
      }
    } else if (config.roofType === 'glass') {
      // Safe VSG Glass Panes with aluminium mullions
      const glassSheets = Math.max(3, Math.floor(innerW / 0.9));
      const sheetW = innerW / glassSheets - 0.02;
      const sheetGeo = new THREE.BoxGeometry(sheetW, 0.015, innerL);

      for (let i = 0; i < glassSheets; i++) {
        const px = -innerW * 0.5 + (i + 0.5) * (innerW / glassSheets);
        const glassPane = new THREE.Mesh(sheetGeo, glassMat);
        glassPane.position.set(px, roofY, 0);
        glassPane.castShadow = true;
        glassPane.receiveShadow = true;
        carportGroup.add(glassPane);
      }
    } else {
      // Sandwich insulated panel with standing seam
      const panelGeo = new THREE.BoxGeometry(innerW, 0.05, innerL);
      const panelMesh = new THREE.Mesh(panelGeo, frameMat);
      panelMesh.position.set(0, roofY, 0);
      panelMesh.castShadow = true;
      panelMesh.receiveShadow = true;
      carportGroup.add(panelMesh);
    }

    // ----------------------------------------------------
    // G. SIDE WALLS ENCLOSURE (ŚCIANY BOCZNE)
    // ----------------------------------------------------
    const buildWallModule = (wallType: string, lengthM: number, isSide: boolean, posX: number, posZ: number, rotY: number) => {
      if (wallType === 'none') return;

      const wallGroup = new THREE.Group();
      wallGroup.position.set(posX, 0, posZ);
      wallGroup.rotation.y = rotY;

      const wallH = height - 0.1;
      const effectiveL = lengthM - postSizeMm * 1.5;

      if (wallType === 'wood-slats') {
        // Vertical or Horizontal architectural wood louvers
        const slatCount = 28;
        const slatH = wallH / slatCount - 0.025;
        const slatGeo = new THREE.BoxGeometry(effectiveL, slatH, 0.035);

        for (let s = 0; s < slatCount; s++) {
          const slat = new THREE.Mesh(slatGeo, woodMat);
          slat.position.set(0, 0.15 + s * (wallH / slatCount), 0);
          slat.castShadow = true;
          slat.receiveShadow = true;
          wallGroup.add(slat);
        }
      } else if (wallType === 'alu-shutters') {
        // Sliding aluminum louvers/shutters
        const panelW = effectiveL * 0.5 - 0.05;
        const panelGeo = new THREE.BoxGeometry(panelW, wallH * 0.95, 0.04);
        const shutter1 = new THREE.Mesh(panelGeo, frameMat);
        shutter1.position.set(-panelW * 0.55, wallH * 0.5, 0.02);
        shutter1.castShadow = true;
        wallGroup.add(shutter1);

        const shutter2 = new THREE.Mesh(panelGeo, frameMat);
        shutter2.position.set(panelW * 0.55, wallH * 0.5, -0.02);
        shutter2.castShadow = true;
        wallGroup.add(shutter2);
      } else if (wallType === 'glass-sliding') {
        // Sliding Glass Panels
        const glassPanelW = effectiveL * 0.48;
        const glassGeo = new THREE.BoxGeometry(glassPanelW, wallH * 0.92, 0.015);
        const gp1 = new THREE.Mesh(glassGeo, glassMat);
        gp1.position.set(-glassPanelW * 0.52, wallH * 0.5, 0.02);
        gp1.castShadow = true;
        wallGroup.add(gp1);

        const gp2 = new THREE.Mesh(glassGeo, glassMat);
        gp2.position.set(glassPanelW * 0.52, wallH * 0.5, -0.02);
        gp2.castShadow = true;
        wallGroup.add(gp2);
      } else if (wallType === 'solid-panel') {
        // Flush Anthracite insulated cassette panel
        const solidGeo = new THREE.BoxGeometry(effectiveL, wallH * 0.95, 0.05);
        const solid = new THREE.Mesh(solidGeo, frameMat);
        solid.position.set(0, wallH * 0.5, 0);
        solid.castShadow = true;
        solid.receiveShadow = true;
        wallGroup.add(solid);
      }

      carportGroup.add(wallGroup);
    };

    // Left wall
    buildWallModule(config.sideWalls.left, length, true, -halfW + postSizeMm * 0.5, 0, Math.PI / 2);
    // Right wall
    buildWallModule(config.sideWalls.right, length, true, halfW - postSizeMm * 0.5, 0, -Math.PI / 2);
    // Back wall
    if (!isAttached) {
      buildWallModule(config.sideWalls.back, width, false, 0, -halfL + postSizeMm * 0.5, 0);
    }

    // ----------------------------------------------------
    // H. STORAGE ROOM (SCHOWEK GOSPODARCZY)
    // ----------------------------------------------------
    if (config.storageRoom.enabled) {
      const sDepth = config.storageRoom.depth;
      const sW = width - postSizeMm;
      const sH = height;
      const sCenterZ = -halfL + sDepth * 0.5;

      const storageBox = new THREE.Group();

      // Front wall of storage with door
      const frontWallGeo = new THREE.BoxGeometry(sW, sH, 0.05);
      const frontWall = new THREE.Mesh(frontWallGeo, frameMat);
      frontWall.position.set(0, sH * 0.5, sCenterZ + sDepth * 0.5);
      frontWall.castShadow = true;
      storageBox.add(frontWall);

      // Aluminum door cutout outline & stainless handle
      const doorGeo = new THREE.BoxGeometry(0.95, 2.05, 0.06);
      const doorMesh = new THREE.Mesh(doorGeo, frameMat);
      doorMesh.position.set(0, 1.025, sCenterZ + sDepth * 0.5 + 0.01);
      doorMesh.castShadow = true;
      storageBox.add(doorMesh);

      // Door handle
      const handleGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.2, 16);
      const handleMat = new THREE.MeshStandardMaterial({ color: 0xe4e4e7, metalness: 0.9, roughness: 0.1 });
      const handle = new THREE.Mesh(handleGeo, handleMat);
      handle.rotation.z = Math.PI / 2;
      handle.position.set(0.38, 1.05, sCenterZ + sDepth * 0.5 + 0.06);
      storageBox.add(handle);

      carportGroup.add(storageBox);
    }

    // ----------------------------------------------------
    // I. REALISTIC CAR 3D MODEL (FOR REAL-SCALE PERSPECTIVE)
    // ----------------------------------------------------
    if (config.environment.showCar) {
      const buildCar = (carType: string, posX: number, posZ: number) => {
        const car = new THREE.Group();
        car.position.set(posX, 0, posZ);

        // Body Dimensions according to car type
        const isSuv = carType === 'suv';
        const carLength = isSuv ? 4.9 : 4.7;
        const carWidth = isSuv ? 1.95 : 1.85;
        const carHeight = isSuv ? 1.72 : 1.45;

        // Car paint material (glossy metallic finish)
        const paintColor = carType === 'ev' ? 0x0ea5e9 : isSuv ? 0x1e293b : 0xd97706;
        const carPaintMat = new THREE.MeshPhysicalMaterial({
          color: paintColor,
          metalness: 0.85,
          roughness: 0.22,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1,
        });

        // Lower Chassis & body
        const lowerBodyGeo = new THREE.BoxGeometry(carWidth, carHeight * 0.45, carLength);
        const lowerBody = new THREE.Mesh(lowerBodyGeo, carPaintMat);
        lowerBody.position.set(0, 0.35 + (carHeight * 0.45) * 0.5, 0);
        lowerBody.castShadow = true;
        car.add(lowerBody);

        // Cabin greenhouse (curved tapered roof)
        const cabinW = carWidth * 0.88;
        const cabinH = carHeight * 0.45;
        const cabinL = carLength * 0.58;
        const cabinGeo = new THREE.BoxGeometry(cabinW, cabinH, cabinL);
        const cabin = new THREE.Mesh(cabinGeo, carPaintMat);
        cabin.position.set(0, 0.35 + carHeight * 0.45 + cabinH * 0.5, -0.2);
        cabin.castShadow = true;
        car.add(cabin);

        // Dark tinted panoramic glass
        const carGlassMat = new THREE.MeshPhysicalMaterial({
          color: 0x09090b,
          metalness: 0.9,
          roughness: 0.1,
          transmission: 0.6,
          transparent: true,
          opacity: 0.85,
        });

        // Windshield
        const windshieldGeo = new THREE.BoxGeometry(cabinW * 0.94, cabinH * 0.85, 0.05);
        const windshield = new THREE.Mesh(windshieldGeo, carGlassMat);
        windshield.rotation.x = Math.PI * 0.16;
        windshield.position.set(0, 0.35 + carHeight * 0.65, cabinL * 0.5 - 0.05);
        car.add(windshield);

        // Rear window
        const rearWin = new THREE.Mesh(windshieldGeo, carGlassMat);
        rearWin.rotation.x = -Math.PI * 0.18;
        rearWin.position.set(0, 0.35 + carHeight * 0.65, -cabinL * 0.5 - 0.35);
        car.add(rearWin);

        // LED Headlights
        const headLampGeo = new THREE.BoxGeometry(0.35, 0.12, 0.08);
        const headLampMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: config.environment.timeOfDay === 'night' ? 0xffffff : 0xaaaaaa,
          emissiveIntensity: config.environment.timeOfDay === 'night' ? 2.0 : 0.4,
        });
        const leftHead = new THREE.Mesh(headLampGeo, headLampMat);
        leftHead.position.set(-carWidth * 0.38, 0.6, carLength * 0.5);
        car.add(leftHead);

        const rightHead = new THREE.Mesh(headLampGeo, headLampMat);
        rightHead.position.set(carWidth * 0.38, 0.6, carLength * 0.5);
        car.add(rightHead);

        // Red Taillights strip
        const tailGeo = new THREE.BoxGeometry(carWidth * 0.85, 0.08, 0.06);
        const tailMat = new THREE.MeshStandardMaterial({
          color: 0xef4444,
          emissive: 0xef4444,
          emissiveIntensity: config.environment.timeOfDay === 'night' ? 2.5 : 0.8,
        });
        const tailStrip = new THREE.Mesh(tailGeo, tailMat);
        tailStrip.position.set(0, 0.68, -carLength * 0.5);
        car.add(tailStrip);

        // Wheels with alloy rims & rubber tires
        const tireGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.24, 24);
        tireGeo.rotateZ(Math.PI / 2);
        const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
        const rimMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.95, roughness: 0.2 });

        const wheelPositions: [number, number][] = [
          [-carWidth * 0.5, carLength * 0.32],
          [carWidth * 0.5, carLength * 0.32],
          [-carWidth * 0.5, -carLength * 0.32],
          [carWidth * 0.5, -carLength * 0.32],
        ];

        wheelPositions.forEach(([wx, wz]) => {
          const wheel = new THREE.Mesh(tireGeo, tireMat);
          wheel.position.set(wx, 0.35, wz);
          wheel.castShadow = true;

          // Alloy rim center
          const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.242, 16);
          rimGeo.rotateZ(Math.PI / 2);
          const rim = new THREE.Mesh(rimGeo, rimMat);
          wheel.add(rim);

          car.add(wheel);
        });

        return car;
      };

      if (config.bays === 1) {
        const carZ = config.storageRoom.enabled ? config.storageRoom.depth * 0.5 : 0;
        const car = buildCar(config.environment.carType, 0, carZ);
        carportGroup.add(car);
      } else {
        // 2 bays: Add two cars for perfect spatial preview!
        const carZ = config.storageRoom.enabled ? config.storageRoom.depth * 0.5 : 0;
        const car1 = buildCar(config.environment.carType, -width * 0.25, carZ);
        const car2 = buildCar('sedan', width * 0.25, carZ);
        carportGroup.add(car1);
        carportGroup.add(car2);
      }
    }

    // ----------------------------------------------------
    // J. 3D ARCHITECTURAL DIMENSION LINES
    // ----------------------------------------------------
    if (config.environment.showDimensions) {
      const dimGroup = new THREE.Group();
      const lineMat = new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 2 });

      // Width dimension (Front bottom)
      const wY = 0.08;
      const wZ = halfL + 0.45;
      const wPoints = [
        new THREE.Vector3(-halfW, wY, wZ),
        new THREE.Vector3(halfW, wY, wZ),
      ];
      const wGeo = new THREE.BufferGeometry().setFromPoints(wPoints);
      const wLine = new THREE.Line(wGeo, lineMat);
      dimGroup.add(wLine);

      // Width ticks
      const tickH = 0.15;
      const tickW1 = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-halfW, wY, wZ - tickH * 0.5),
          new THREE.Vector3(-halfW, wY, wZ + tickH * 0.5),
        ]),
        lineMat
      );
      const tickW2 = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(halfW, wY, wZ - tickH * 0.5),
          new THREE.Vector3(halfW, wY, wZ + tickH * 0.5),
        ]),
        lineMat
      );
      dimGroup.add(tickW1);
      dimGroup.add(tickW2);

      // Length dimension (Right bottom)
      const lX = halfW + 0.45;
      const lPoints = [
        new THREE.Vector3(lX, wY, -halfL),
        new THREE.Vector3(lX, wY, halfL),
      ];
      const lGeo = new THREE.BufferGeometry().setFromPoints(lPoints);
      const lLine = new THREE.Line(lGeo, lineMat);
      dimGroup.add(lLine);

      const tickL1 = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(lX - tickH * 0.5, wY, -halfL),
          new THREE.Vector3(lX + tickH * 0.5, wY, -halfL),
        ]),
        lineMat
      );
      const tickL2 = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(lX - tickH * 0.5, wY, halfL),
          new THREE.Vector3(lX + tickH * 0.5, wY, halfL),
        ]),
        lineMat
      );
      dimGroup.add(tickL1);
      dimGroup.add(tickL2);

      // Height dimension (Front left post)
      const hX = -halfW - 0.45;
      const hZ = halfL;
      const hPoints = [
        new THREE.Vector3(hX, 0, hZ),
        new THREE.Vector3(hX, height, hZ),
      ];
      const hGeo = new THREE.BufferGeometry().setFromPoints(hPoints);
      const hLine = new THREE.Line(hGeo, lineMat);
      dimGroup.add(hLine);

      const tickH1 = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(hX - tickH * 0.5, 0, hZ),
          new THREE.Vector3(hX + tickH * 0.5, 0, hZ),
        ]),
        lineMat
      );
      const tickH2 = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(hX - tickH * 0.5, height, hZ),
          new THREE.Vector3(hX + tickH * 0.5, height, hZ),
        ]),
        lineMat
      );
      dimGroup.add(tickH1);
      dimGroup.add(tickH2);

      carportGroup.add(dimGroup);
    }

    scene.add(carportGroup);
    carportGroupRef.current = carportGroup;
  }, [config, isReady, createProceduralTextures]);

  const areaM2 = (config.dimensions.width * config.dimensions.length).toFixed(2);
  const volumeM3 = (config.dimensions.width * config.dimensions.length * config.dimensions.height).toFixed(1);
  const snowLoad = config.postProfile === '200x200' ? 160 : 125;
  const windLoad = config.postProfile === '200x200' ? 135 : 120;

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-neutral-950">
      {/* 3D Canvas mount container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* TOP ARCHITECTURAL HUD - HIGH CONTRAST & LEGIBLE */}
      <div className="pointer-events-none absolute top-4 left-4 right-4 z-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Project & Model Identity Card */}
        <div className="pointer-events-auto bg-neutral-900/95 backdrop-blur-md border border-neutral-700/80 rounded-xl px-4 py-2.5 shadow-xl flex items-center gap-3">
          <div className="w-2.5 h-8 bg-amber-400 rounded-full" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">
                {config.project?.projectName || config.name || 'Pergola Garażowa'}
              </span>
              <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/30">
                {config.installationType === 'freestanding' ? 'Wolnostojąca' : 'Przyścienna'}
              </span>
            </div>
            <div className="text-xs text-neutral-300 font-medium mt-0.5">
              Profil słupów: <span className="text-amber-300 font-semibold">{config.postProfile} mm</span> · Dach:{' '}
              <span className="text-amber-300 font-semibold">
                {config.roofType === 'bioclimatic'
                  ? `Lamele obrotowe (${config.louverAngle}°)`
                  : config.roofType === 'solar'
                  ? 'Moduły BIPV'
                  : config.roofType === 'glass'
                  ? 'Szkło VSG'
                  : 'Płyta sandwich'}
              </span>
            </div>
          </div>
        </div>

        {/* Real-time Engineering Metrics Chips */}
        <div className="pointer-events-auto flex items-center flex-wrap gap-2">
          {/* Surface Area */}
          <div className="bg-neutral-900/95 backdrop-blur-md border border-neutral-700/80 rounded-xl px-3.5 py-2 shadow-xl flex flex-col">
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">Powierzchnia</span>
            <span className="text-base font-bold font-mono text-amber-400 tabular-nums">
              {areaM2} <span className="text-xs text-neutral-300 font-sans">m²</span>
            </span>
          </div>

          {/* Volume */}
          <div className="bg-neutral-900/95 backdrop-blur-md border border-neutral-700/80 rounded-xl px-3.5 py-2 shadow-xl flex flex-col">
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">Kubatura</span>
            <span className="text-base font-bold font-mono text-white tabular-nums">
              {volumeM3} <span className="text-xs text-neutral-300 font-sans">m³</span>
            </span>
          </div>

          {/* Snow Load Standard */}
          <div className="bg-neutral-900/95 backdrop-blur-md border border-neutral-700/80 rounded-xl px-3.5 py-2 shadow-xl hidden md:flex flex-col">
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">Obciążenie śniegiem</span>
            <span className="text-base font-bold font-mono text-emerald-400 tabular-nums">
              {snowLoad} <span className="text-xs text-neutral-300 font-sans">kg/m²</span>
            </span>
          </div>

          {/* Wind Load */}
          <div className="bg-neutral-900/95 backdrop-blur-md border border-neutral-700/80 rounded-xl px-3.5 py-2 shadow-xl hidden lg:flex flex-col">
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">Wytrzymałość na wiatr</span>
            <span className="text-base font-bold font-mono text-sky-400 tabular-nums">
              {windLoad} <span className="text-xs text-neutral-300 font-sans">km/h</span>
            </span>
          </div>
        </div>
      </div>

      {/* FLOATING 3D DIMENSION BADGES (Crisp, High Contrast, Legible) */}
      {config.environment.showDimensions && (
        <div className="pointer-events-none absolute inset-x-4 bottom-20 flex flex-wrap items-center justify-between gap-3">
          <div className="pointer-events-auto bg-neutral-950/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-amber-400/60 shadow-2xl flex items-center gap-2 text-white">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-xs font-semibold uppercase text-neutral-300">Wysokość wjazdu:</span>
            <span className="text-base font-bold font-mono text-amber-300 tabular-nums">
              {config.dimensions.height.toFixed(2)} m
            </span>
          </div>

          <div className="pointer-events-auto bg-neutral-950/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-amber-400/60 shadow-2xl flex items-center gap-2 text-white">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-xs font-semibold uppercase text-neutral-300">Szerokość:</span>
            <span className="text-base font-bold font-mono text-amber-300 tabular-nums">
              {config.dimensions.width.toFixed(2)} m
            </span>
          </div>

          <div className="pointer-events-auto bg-neutral-950/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-amber-400/60 shadow-2xl flex items-center gap-2 text-white">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-xs font-semibold uppercase text-neutral-300">Długość (głębokość):</span>
            <span className="text-base font-bold font-mono text-amber-300 tabular-nums">
              {config.dimensions.length.toFixed(2)} m
            </span>
          </div>
        </div>
      )}

      {/* Interactive Helper Banner in Bottom-Left */}
      <div className="pointer-events-none absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-3 text-xs font-medium text-neutral-300 bg-neutral-900/90 backdrop-blur-md border border-neutral-700/80 px-3.5 py-2 rounded-xl shadow-lg">
        <span className="flex items-center gap-1.5 text-amber-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          Obrót: LPM
        </span>
        <span className="text-neutral-500">·</span>
        <span>Zoom: Kółko myszy</span>
        <span className="text-neutral-500">·</span>
        <span>Przesunięcie: PPM</span>
      </div>
    </div>
  );
};
