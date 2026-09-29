import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  CAMERA_STATIONS,
  CUSTOMER_JOURNEY_STEPS,
  SMART_PRODUCTS,
  STORE_IMAGES,
  SmartProduct,
} from '../data/storeData';

interface SmartStoreCanvasProps {
  activeStation: string;
  selectedProduct: SmartProduct;
  onSelectProduct: (product: SmartProduct) => void;
  entryVerified: boolean;
  xrayMode: boolean;
  sensorFusionActive: boolean;
  robotMode: 'CLEANING' | 'DOCKED' | 'LOW_TRAFFIC_PATROL';
  hvacTemp: number;
  solarActive: boolean;
  journeyStepIndex: number;
  freeLookEnabled: boolean;
}

export const SmartStoreCanvas: React.FC<SmartStoreCanvasProps> = ({
  activeStation,
  selectedProduct,
  onSelectProduct,
  entryVerified,
  xrayMode,
  sensorFusionActive,
  robotMode,
  hvacTemp,
  solarActive,
  journeyStepIndex,
  freeLookEnabled,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglError, setWebglError] = useState(false);

  // Store latest props in refs for the 60fps animation loop
  const stateRef = useRef({
    activeStation,
    selectedProduct,
    entryVerified,
    xrayMode,
    sensorFusionActive,
    robotMode,
    hvacTemp,
    solarActive,
    journeyStepIndex,
    freeLookEnabled,
  });

  useEffect(() => {
    stateRef.current = {
      activeStation,
      selectedProduct,
      entryVerified,
      xrayMode,
      sensorFusionActive,
      robotMode,
      hvacTemp,
      solarActive,
      journeyStepIndex,
      freeLookEnabled,
    };
  }, [
    activeStation,
    selectedProduct,
    entryVerified,
    xrayMode,
    sensorFusionActive,
    robotMode,
    hvacTemp,
    solarActive,
    journeyStepIndex,
    freeLookEnabled,
  ]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch {
      setWebglError(true);
      return;
    }

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // WebGL context loss safety
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglError(true);
    };
    const handleContextRestored = () => {
      setWebglError(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    // Scene & Atmosphere
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07080c);
    scene.fog = new THREE.FogExp2(0x07080c, 0.038);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0.4, 2.4, 9.6);
    const currentLookAt = new THREE.Vector3(0, 1.4, 2.5);

    // Three-Point Studio + Architectural Store Lighting
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.4);
    scene.add(ambientLight);

    // Warm interior store illumination
    const storeCeilingLight1 = new THREE.PointLight(0xfffbeb, 3.2, 14, 1.5);
    storeCeilingLight1.position.set(-1.5, 3.3, 0);
    storeCeilingLight1.castShadow = true;
    scene.add(storeCeilingLight1);

    const storeCeilingLight2 = new THREE.PointLight(0xfffbeb, 3.0, 14, 1.5);
    storeCeilingLight2.position.set(1.8, 3.3, 0.5);
    scene.add(storeCeilingLight2);

    // Cool exterior moon/street rim light
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    rimLight.position.set(-6, 9, 10);
    scene.add(rimLight);

    // Warm architectural key light
    const keyLight = new THREE.DirectionalLight(0xf59e0b, 1.1);
    keyLight.position.set(7, 10, 6);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // =========================================================================
    // 1. ARCHITECTURAL STORE STRUCTURE & FLOOR
    // =========================================================================
    const storeGroup = new THREE.Group();
    scene.add(storeGroup);

    // Exterior dark asphalt pavement
    const asphaltGeo = new THREE.PlaneGeometry(46, 46);
    const asphaltMat = new THREE.MeshStandardMaterial({
      color: 0x090b10,
      roughness: 0.35,
      metalness: 0.25,
    });
    const asphalt = new THREE.Mesh(asphaltGeo, asphaltMat);
    asphalt.rotation.x = -Math.PI / 2;
    asphalt.receiveShadow = true;
    storeGroup.add(asphalt);

    // Subtle exterior architectural grid
    const gridHelper = new THREE.GridHelper(36, 36, 0x1e293b, 0x111827);
    gridHelper.position.y = 0.01;
    storeGroup.add(gridHelper);

    // Interior polished dark concrete floor slab (8m wide x 7m deep)
    const floorGeo = new THREE.BoxGeometry(8.4, 0.12, 7.2);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x12161f,
      roughness: 0.2,
      metalness: 0.3,
    });
    const interiorFloor = new THREE.Mesh(floorGeo, floorMat);
    interiorFloor.position.set(0, 0.06, 0);
    interiorFloor.receiveShadow = true;
    storeGroup.add(interiorFloor);

    // Architectural dark aluminum pillars & frame
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x1e2430,
      roughness: 0.3,
      metalness: 0.8,
    });

    const pillarPositions: [number, number, number][] = [
      [-4.1, 1.8, 3.5],
      [4.1, 1.8, 3.5],
      [-4.1, 1.8, -3.5],
      [4.1, 1.8, -3.5],
      [-1.3, 1.8, 3.5],
      [1.1, 1.8, 3.5],
    ];
    pillarPositions.forEach((pos) => {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.6, 0.18), frameMat);
      p.position.set(...pos);
      p.castShadow = true;
      storeGroup.add(p);
    });

    // Store Roof Slab + Translucent X-Ray Control
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x161b26,
      roughness: 0.4,
      metalness: 0.6,
      transparent: true,
      opacity: 0.92,
    });
    const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.22, 7.4), roofMat);
    roofSlab.position.set(0, 3.65, 0);
    storeGroup.add(roofSlab);

    // Glowing architectural fascia strip along the roofline
    const fasciaMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const fasciaStrip = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.05, 0.06), fasciaMat);
    fasciaStrip.position.set(0, 3.52, 3.68);
    storeGroup.add(fasciaStrip);

    // Back & Side Glass/Architectural Walls
    const glassWallMat = new THREE.MeshPhysicalMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.16,
      roughness: 0.08,
      metalness: 0.1,
      transmission: 0.6,
    });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(8.2, 3.5, 0.08), glassWallMat);
    backWall.position.set(0, 1.8, -3.5);
    storeGroup.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.5, 7.0), glassWallMat);
    leftWall.position.set(-4.1, 1.8, 0);
    storeGroup.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.5, 7.0), glassWallMat);
    rightWall.position.set(4.1, 1.8, 0);
    storeGroup.add(rightWall);

    // =========================================================================
    // 2. MOTORIZED ENTRANCE GATE & QR SCANNER PEDESTAL (Left-Center Front)
    // =========================================================================
    const entranceGateMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.28,
      roughness: 0.1,
      metalness: 0.2,
    });
    const entranceDoorLeft = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 2.6, 0.06),
      entranceGateMat
    );
    entranceDoorLeft.position.set(-0.6, 1.35, 3.5);
    storeGroup.add(entranceDoorLeft);

    const entranceDoorRight = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 2.6, 0.06),
      entranceGateMat
    );
    entranceDoorRight.position.set(0.4, 1.35, 3.5);
    storeGroup.add(entranceDoorRight);

    // QR Scanner Pedestal outside the entrance
    const pedestalGroup = new THREE.Group();
    pedestalGroup.position.set(-1.15, 0.12, 4.35);
    storeGroup.add(pedestalGroup);

    const pedStand = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 1.15, 0.22),
      frameMat
    );
    pedStand.position.y = 0.575;
    pedestalGroup.add(pedStand);

    const qrScannerPadMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const qrScannerPad = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.22, 0.06),
      qrScannerPadMat
    );
    qrScannerPad.position.set(0, 1.18, 0.1);
    qrScannerPad.rotation.x = -0.35;
    pedestalGroup.add(qrScannerPad);

    // Optical Scan Beam between Customer Smartphone and QR Scanner
    const qrBeamGeo = new THREE.ConeGeometry(0.24, 0.75, 16, 1, true);
    const qrBeamMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const qrBeam = new THREE.Mesh(qrBeamGeo, qrBeamMat);
    qrBeam.position.set(0.25, 1.25, 0.38);
    qrBeam.rotation.x = Math.PI / 2;
    qrBeam.rotation.z = -0.4;
    pedestalGroup.add(qrBeam);

    // =========================================================================
    // 3. SMART SHELVES, WEIGHT SENSORS & INTERACTIVE 3D PRODUCTS
    // =========================================================================
    const shelfUnitGroup = new THREE.Group();
    shelfUnitGroup.position.set(-0.45, 0.12, -1.25);
    storeGroup.add(shelfUnitGroup);

    // Backboard of smart shelf
    const shelfBack = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 2.2, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x151922, roughness: 0.4, metalness: 0.7 })
    );
    shelfBack.position.set(0, 1.1, -0.22);
    shelfBack.castShadow = true;
    shelfUnitGroup.add(shelfBack);

    // 3 Horizontal Smart Shelf Tiers with LED edge strips & weight sensors
    const shelfLevels = [0.5, 0.9, 1.3];
    shelfLevels.forEach((yLevel) => {
      const tier = new THREE.Mesh(
        new THREE.BoxGeometry(3.7, 0.05, 0.55),
        frameMat
      );
      tier.position.set(0, yLevel, 0.08);
      tier.receiveShadow = true;
      shelfUnitGroup.add(tier);

      // LED edge rail
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(3.7, 0.018, 0.02),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      rail.position.set(0, yLevel, 0.36);
      shelfUnitGroup.add(rail);
    });

    // Interactive Product Meshes + Weight Sensor Pads
    const productMeshes: THREE.Object3D[] = [];
    const productMap = new Map<THREE.Object3D, SmartProduct>();

    SMART_PRODUCTS.forEach((prod) => {
      const prodGroup = new THREE.Group();
      // Position relative to scene
      prodGroup.position.set(
        prod.shelfPosition[0],
        prod.shelfPosition[1],
        prod.shelfPosition[2]
      );
      storeGroup.add(prodGroup);

      // Smart Load-Cell Weight Pad underneath product
      const weightPadMat = new THREE.MeshBasicMaterial({
        color: prod.status === 'EXPIRED' ? 0xef4444 : 0x06b6d4,
        transparent: true,
        opacity: 0.45,
      });
      const weightPad = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.02, 0.34),
        weightPadMat
      );
      weightPad.position.y = -0.14;
      prodGroup.add(weightPad);

      // Product 3D geometry (distinct silhouette per product category)
      let meshGeo: THREE.BufferGeometry;
      if (prod.id === 'prod-energy') {
        meshGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.3, 24);
      } else if (prod.id === 'prod-snacks') {
        meshGeo = new THREE.BoxGeometry(0.26, 0.32, 0.14);
      } else if (prod.id === 'prod-juice') {
        meshGeo = new THREE.CylinderGeometry(0.09, 0.12, 0.32, 20);
      } else {
        meshGeo = new THREE.CylinderGeometry(0.11, 0.1, 0.28, 20);
      }

      const prodMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(prod.colorHex),
        roughness: 0.25,
        metalness: 0.45,
        emissive: new THREE.Color(prod.colorHex),
        emissiveIntensity: prod.status === 'EXPIRED' ? 0.35 : 0.12,
      });

      const prodMesh = new THREE.Mesh(meshGeo, prodMat);
      prodMesh.castShadow = true;
      prodGroup.add(prodMesh);

      // Subtle status ring above each product
      const statusRingColor =
        prod.status === 'SAFE'
          ? 0x10b981
          : prod.status === 'EXPIRING SOON'
          ? 0xf59e0b
          : 0xef4444;
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.14, 0.17, 24),
        new THREE.MeshBasicMaterial({
          color: statusRingColor,
          side: THREE.DoubleSide,
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.21;
      prodGroup.add(ring);

      productMeshes.push(prodMesh);
      productMap.set(prodMesh, prod);
    });

    // 3D AI Tracking Wireframe Bounding Box around the currently selected product
    const aiBoxGeo = new THREE.BoxGeometry(0.46, 0.46, 0.46);
    const aiBoxEdges = new THREE.EdgesGeometry(aiBoxGeo);
    const aiBoxMat = new THREE.LineBasicMaterial({
      color: 0x06b6d4,
      linewidth: 2,
    });
    const aiTrackingBox = new THREE.LineSegments(aiBoxEdges, aiBoxMat);
    storeGroup.add(aiTrackingBox);

    // =========================================================================
    // 4. CEILING AI CAMERAS, RFID INTERROGATOR & SENSOR FUSION CORE
    // =========================================================================
    const cameraNodes: THREE.Vector3[] = [
      new THREE.Vector3(-1.6, 3.35, 0.8),
      new THREE.Vector3(0.4, 3.35, 0.8),
      new THREE.Vector3(1.9, 3.35, 2.2),
    ];

    cameraNodes.forEach((pos) => {
      const camHousing = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.8 })
      );
      camHousing.position.copy(pos);
      storeGroup.add(camHousing);

      const camLens = new THREE.Mesh(
        new THREE.RingGeometry(0.05, 0.08, 16),
        new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide })
      );
      camLens.position.set(pos.x, pos.y - 0.12, pos.z);
      camLens.rotation.x = Math.PI / 2;
      storeGroup.add(camLens);
    });

    // Floating AI Sensor Fusion Core & Data Stream Lines
    const fusionCorePos = new THREE.Vector3(-0.4, 2.15, 0.2);
    const fusionCoreMesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.18, 1),
      new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        wireframe: true,
        transparent: true,
        opacity: 0.85,
      })
    );
    fusionCoreMesh.position.copy(fusionCorePos);
    storeGroup.add(fusionCoreMesh);

    // Dynamic Sensor Stream Lines connecting Camera, Weight Pad, RFID, DB -> Fusion Core
    const sensorLineGroup = new THREE.Group();
    storeGroup.add(sensorLineGroup);

    const createDataBeam = (start: THREE.Vector3, end: THREE.Vector3, colorHex: number) => {
      const curve = new THREE.QuadraticBezierCurve3(
        start,
        new THREE.Vector3(
          (start.x + end.x) * 0.5,
          Math.max(start.y, end.y) + 0.25,
          (start.z + end.z) * 0.5
        ),
        end
      );
      const points = curve.getPoints(28);
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.65,
      });
      return { line: new THREE.Line(geo, mat), curve };
    };

    // Animated Data Packets traveling along sensor streams
    const packetMeshes: { mesh: THREE.Mesh; curve: THREE.QuadraticBezierCurve3; offset: number }[] = [];
    const sensorSources = [
      { pos: cameraNodes[0], color: 0x06b6d4 }, // Camera
      { pos: new THREE.Vector3(-1.8, 1.3, -1.2), color: 0x10b981 }, // Weight Sensor
      { pos: new THREE.Vector3(-0.4, 2.5, -1.2), color: 0xf59e0b }, // Overhead RFID Reader
      { pos: new THREE.Vector3(-3.3, 1.5, -2.5), color: 0x38bdf8 }, // Product DB Rack
    ];

    sensorSources.forEach((src, idx) => {
      const { line, curve } = createDataBeam(src.pos, fusionCorePos, src.color);
      sensorLineGroup.add(line);

      const pkt = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 10, 10),
        new THREE.MeshBasicMaterial({ color: src.color })
      );
      sensorLineGroup.add(pkt);
      packetMeshes.push({ mesh: pkt, curve, offset: idx * 0.25 });
    });

    // Edge Database / AI Server Rack in Back-Left Corner
    const dbRack = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 2.3, 0.75),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.85 })
    );
    dbRack.position.set(-3.3, 1.25, -2.5);
    storeGroup.add(dbRack);

    // =========================================================================
    // 5. AUTONOMOUS INFRASTRUCTURE: VACUUM ROBOT, HVAC (24°C), ROOFTOP SOLAR
    // =========================================================================
    // 5A. Autonomous Vacuum Cleaning Robot
    const robotGroup = new THREE.Group();
    robotGroup.position.set(-2.2, 0.14, 1.5);
    storeGroup.add(robotGroup);

    const robotBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.34, 0.14, 32),
      new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.2, metalness: 0.8 })
    );
    robotBody.position.y = 0.07;
    robotBody.castShadow = true;
    robotGroup.add(robotBody);

    const lidarTurret = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.06, 20),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    lidarTurret.position.y = 0.16;
    robotGroup.add(lidarTurret);

    // LiDAR Obstacle Detection Scan Fan
    const lidarFanGeo = new THREE.CircleGeometry(0.85, 24, -Math.PI / 4, Math.PI / 2);
    const lidarFanMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
    });
    const lidarFan = new THREE.Mesh(lidarFanGeo, lidarFanMat);
    lidarFan.rotation.x = -Math.PI / 2;
    lidarFan.position.y = 0.02;
    robotGroup.add(lidarFan);

    // Robot Charging Dock in Front-Left Corner
    const chargingDock = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.35, 0.25),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, emissive: 0x10b981, emissiveIntensity: 0.25 })
    );
    chargingDock.position.set(-3.5, 0.3, 2.8);
    storeGroup.add(chargingDock);

    // 5B. Smart Thermostat & HVAC Climate Unit
    const hvacGroup = new THREE.Group();
    hvacGroup.position.set(-3.95, 2.1, 0.2);
    storeGroup.add(hvacGroup);

    const thermostatBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.36, 0.52),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, emissive: 0x06b6d4, emissiveIntensity: 0.35 })
    );
    hvacGroup.add(thermostatBox);

    // 5C. Rooftop Solar Panel Array & Inverter
    const solarGroup = new THREE.Group();
    solarGroup.position.set(0, 3.85, 0);
    storeGroup.add(solarGroup);

    const solarPanelMat = new THREE.MeshStandardMaterial({
      color: 0x0c4a6e,
      roughness: 0.15,
      metalness: 0.9,
      emissive: 0x0284c7,
      emissiveIntensity: 0.2,
    });

    for (let row = -1; row <= 1; row++) {
      for (let col = -2; col <= 2; col++) {
        const panel = new THREE.Mesh(
          new THREE.BoxGeometry(1.25, 0.04, 1.55),
          solarPanelMat
        );
        panel.position.set(col * 1.45, 0.18, row * 1.85);
        panel.rotation.x = 0.22; // Tilted toward sun/sky
        solarGroup.add(panel);
      }
    }

    // Solar Power Conduit Line from Roof to Store Inverter & Battery
    const solarConduitCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 3.9, -2.2),
      new THREE.Vector3(-3.6, 3.7, -2.5),
      new THREE.Vector3(-3.6, 1.6, -2.5),
    ]);
    const solarConduitGeo = new THREE.TubeGeometry(solarConduitCurve, 24, 0.035, 8, false);
    const solarConduitMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.75,
    });
    const solarConduit = new THREE.Mesh(solarConduitGeo, solarConduitMat);
    storeGroup.add(solarConduit);

    // =========================================================================
    // 6. CUSTOMER AVATAR & AUTOMATED PAYMENT / EXIT GATE (Right Front)
    // =========================================================================
    const customerAvatar = new THREE.Group();
    customerAvatar.position.set(-0.2, 0.12, 4.6);
    storeGroup.add(customerAvatar);

    const avatarMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.3,
      metalness: 0.2,
    });
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.65, 12, 16), avatarMat);
    torso.position.y = 0.95;
    torso.castShadow = true;
    customerAvatar.add(torso);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), avatarMat);
    head.position.y = 1.56;
    customerAvatar.add(head);

    // Smartphone in customer's hand
    const phoneMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.15, 0.02),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    phoneMesh.position.set(-0.24, 1.15, -0.22);
    phoneMesh.rotation.x = -0.5;
    customerAvatar.add(phoneMesh);

    // Automated Exit Gate & Payment Terminal (Right Front Lane)
    const exitGateDoor = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 2.6, 0.06),
      new THREE.MeshPhysicalMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.3,
        roughness: 0.1,
      })
    );
    exitGateDoor.position.set(2.35, 1.35, 3.5);
    storeGroup.add(exitGateDoor);

    const paymentPedestal = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 1.2, 0.24),
      frameMat
    );
    paymentPedestal.position.set(1.55, 0.72, 3.15);
    storeGroup.add(paymentPedestal);

    const paymentScreen = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.24, 0.04),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b })
    );
    paymentScreen.position.set(1.55, 1.36, 3.15);
    paymentScreen.rotation.x = -0.3;
    storeGroup.add(paymentScreen);

    // Subtle Atmospheric Floating Data Particles inside the store
    const particleCount = 90;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 9;
      particlePositions[i * 3 + 1] = 0.4 + Math.random() * 3.6;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.045,
      transparent: true,
      opacity: 0.45,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    storeGroup.add(particles);

    // =========================================================================
    // 7. MOUSE PARALLAX, FREE-LOOK DRAG & RAYCAST PRODUCT SELECTION
    // =========================================================================
    const mouse = new THREE.Vector2(0, 0);
    let dragYaw = 0;
    let dragPitch = 0;
    let isDragging = false;
    let prevPointer = { x: 0, y: 0 };
    const raycaster = new THREE.Raycaster();

    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging && stateRef.current.freeLookEnabled) {
        const dx = e.clientX - prevPointer.x;
        const dy = e.clientY - prevPointer.y;
        dragYaw -= dx * 0.006;
        dragPitch = Math.max(-0.5, Math.min(0.6, dragPitch + dy * 0.005));
        prevPointer = { x: e.clientX, y: e.clientY };
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevPointer = { x: e.clientX, y: e.clientY };

      // Check raycast against 3D product meshes on shelf
      const rect = renderer.domElement.getBoundingClientRect();
      const clickCoords = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(clickCoords, camera);
      const intersects = raycaster.intersectObjects(productMeshes, false);
      if (intersects.length > 0) {
        const hitProd = productMap.get(intersects[0].object);
        if (hitProd) {
          onSelectProduct(hitProd);
        }
      }
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);

    // Resize listener
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // =========================================================================
    // 8. CONTINUOUS 60FPS SIMULATION & CAMERA CHOREOGRAPHY LOOP
    // =========================================================================
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const st = stateRef.current;

      // Determine Target Camera Position & LookAt based on activeStation or Journey Step
      let station = CAMERA_STATIONS[st.activeStation] || CAMERA_STATIONS.hero;
      if (st.activeStation === 'journey') {
        const jStep = CUSTOMER_JOURNEY_STEPS[st.journeyStepIndex] || CUSTOMER_JOURNEY_STEPS[0];
        station = {
          id: 'journey',
          label: jStep.code,
          pos: jStep.cameraPosition,
          target: jStep.cameraTarget,
        };
      }

      if (!st.freeLookEnabled) {
        dragYaw *= 0.92;
        dragPitch *= 0.92;
      }

      const targetCamPos = new THREE.Vector3(
        station.pos[0] + mouse.x * 0.28 + Math.sin(dragYaw) * 2.5,
        station.pos[1] + mouse.y * 0.16 + dragPitch * 2.0,
        station.pos[2] + (1 - Math.cos(dragYaw)) * 1.5
      );
      const targetLook = new THREE.Vector3(...station.target);

      camera.position.lerp(targetCamPos, 0.045);
      currentLookAt.lerp(targetLook, 0.055);
      camera.lookAt(currentLookAt);

      // Animate Entrance Doors (slide open when entryVerified or past hero station)
      const doorShouldOpen = st.entryVerified || st.activeStation !== 'hero';
      const leftDoorTargetX = doorShouldOpen ? -1.35 : -0.6;
      const rightDoorTargetX = doorShouldOpen ? 1.15 : 0.4;
      entranceDoorLeft.position.x = THREE.MathUtils.lerp(
        entranceDoorLeft.position.x,
        leftDoorTargetX,
        0.06
      );
      entranceDoorRight.position.x = THREE.MathUtils.lerp(
        entranceDoorRight.position.x,
        rightDoorTargetX,
        0.06
      );

      // Pulse QR beam
      qrBeamMat.opacity = doorShouldOpen ? 0.15 + Math.sin(elapsed * 5) * 0.1 : 0.45;

      // Move 3D AI Tracking Box smoothly to the currently selected product
      const selPos = st.selectedProduct.shelfPosition;
      aiTrackingBox.position.lerp(new THREE.Vector3(selPos[0], selPos[1], selPos[2]), 0.12);
      aiTrackingBox.rotation.y = Math.sin(elapsed * 1.5) * 0.08;
      aiBoxMat.color.set(
        st.selectedProduct.status === 'EXPIRED'
          ? 0xef4444
          : st.selectedProduct.status === 'EXPIRING SOON'
          ? 0xf59e0b
          : 0x06b6d4
      );

      // Rotate AI Sensor Fusion Core & animate data packets along Bezier streams
      fusionCoreMesh.rotation.y = elapsed * 0.8;
      fusionCoreMesh.rotation.x = elapsed * 0.5;
      sensorLineGroup.visible =
        st.sensorFusionActive ||
        st.activeStation === 'detection' ||
        st.activeStation === 'architecture' ||
        st.activeStation === 'overview';

      packetMeshes.forEach((pktObj) => {
        const t = (elapsed * 0.45 + pktObj.offset) % 1;
        const pt = pktObj.curve.getPoint(t);
        pktObj.mesh.position.copy(pt);
      });

      // Architectural X-Ray Roof Transparency
      const targetRoofOpacity =
        st.xrayMode ||
        st.activeStation === 'architecture' ||
        st.activeStation === 'infrastructure' ||
        st.activeStation === 'overview'
          ? 0.18
          : 0.92;
      roofMat.opacity = THREE.MathUtils.lerp(roofMat.opacity, targetRoofOpacity, 0.06);

      // Autonomous Vacuum Robot Patrol vs Docked
      if (st.robotMode === 'DOCKED') {
        robotGroup.position.lerp(new THREE.Vector3(-3.3, 0.14, 2.6), 0.04);
        lidarFan.visible = false;
      } else {
        lidarFan.visible = true;
        const speedMult = st.robotMode === 'LOW_TRAFFIC_PATROL' ? 0.85 : 0.55;
        const rx = -1.6 + Math.sin(elapsed * speedMult) * 1.6;
        const rz = 0.7 + Math.cos(elapsed * speedMult * 0.7) * 1.5;
        const nextPos = new THREE.Vector3(rx, 0.14, rz);
        const dir = nextPos.clone().sub(robotGroup.position);
        if (dir.lengthSq() > 0.0001) {
          robotGroup.rotation.y = Math.atan2(dir.x, dir.z);
        }
        robotGroup.position.copy(nextPos);
        lidarFan.rotation.z = Math.sin(elapsed * 4) * 0.35;
      }

      // Solar Array Energy Conduit Glow
      solarConduitMat.opacity = st.solarActive ? 0.55 + Math.sin(elapsed * 4) * 0.25 : 0.15;

      // Customer Avatar position along the 6-step Journey
      let targetAvatarPos = new THREE.Vector3(-0.3, 0.12, 4.4);
      if (st.activeStation === 'journey') {
        const stepPositions: [number, number, number][] = [
          [-0.5, 0.12, 4.45], // 01 SCAN
          [-0.1, 0.12, 2.8],  // 02 ENTER
          [-0.9, 0.12, 0.2],  // 03 SHOP
          [-0.3, 0.12, 0.1],  // 04 VERIFY
          [1.8, 0.12, 2.5],   // 05 PAY
          [2.35, 0.12, 4.6],  // 06 EXIT
        ];
        const coords = stepPositions[st.journeyStepIndex] || stepPositions[0];
        targetAvatarPos.set(...coords);
      } else if (st.activeStation === 'detection' || st.activeStation === 'registration') {
        targetAvatarPos.set(-1.3, 0.12, 0.15);
      } else if (st.entryVerified) {
        targetAvatarPos.set(-0.2, 0.12, 2.2);
      }
      customerAvatar.position.lerp(targetAvatarPos, 0.05);

      // Exit Gate opens when customer is at step 05/06 or in overview
      const exitOpen =
        (st.activeStation === 'journey' && st.journeyStepIndex >= 4) ||
        st.activeStation === 'overview';
      exitGateDoor.position.x = THREE.MathUtils.lerp(
        exitGateDoor.position.x,
        exitOpen ? 3.35 : 2.35,
        0.06
      );

      // Subtle vertical float on atmospheric particles
      particles.rotation.y = elapsed * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      renderer.dispose();
    };
  }, []);

  if (webglError) {
    return (
      <div className="fixed inset-0 z-0 bg-[#090A0D]">
        <img
          src={STORE_IMAGES.heroEntrance}
          alt="Autonomous Smart Store Exterior"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090A0D] via-[#090A0D]/60 to-transparent" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-0 pointer-events-auto">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      {/* Subtle atmospheric radial vignette so foreground typography always meets WCAG AA contrast */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#090A0D]/85 via-[#090A0D]/25 to-[#090A0D]/75" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#090A0D]/70 via-transparent to-[#090A0D]/90" />
    </div>
  );
};
