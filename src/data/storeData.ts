import storeHeroImg from '../assets/images/store_hero_entrance_1790699645622.jpg';
import smartShelfImg from '../assets/images/smart_shelf_aisle_1790699661065.jpg';
import sensorFusionImg from '../assets/images/sensor_fusion_checkout_1790699672566.jpg';
import autonomousInfraImg from '../assets/images/autonomous_infrastructure_1790699685533.jpg';

export const STORE_IMAGES = {
  heroEntrance: storeHeroImg,
  smartShelf: smartShelfImg,
  sensorFusion: sensorFusionImg,
  autonomousInfra: autonomousInfraImg,
};

export type ExpiryStatus = 'SAFE' | 'EXPIRING SOON' | 'EXPIRED';

export interface SmartProduct {
  id: string;
  sku: string;
  name: string;
  category: string;
  batchNumber: string;
  mfgDate: string;
  expiryDate: string;
  price: number;
  stock: number;
  shelfId: string;
  barcode: string;
  rfidId: string;
  storageCondition: string;
  weightGrams: number;
  status: ExpiryStatus;
  colorHex: string;
  shelfPosition: [number, number, number];
  description: string;
}

export const SMART_PRODUCTS: SmartProduct[] = [
  {
    id: 'prod-energy',
    sku: 'SKU-EN-4092',
    name: 'Energy Drink',
    category: 'Functional Beverage',
    batchNumber: 'BCH-2026-089A',
    mfgDate: '12 Aug 2026',
    expiryDate: '12 Feb 2027',
    price: 45,
    stock: 28,
    shelfId: 'SH-A02-T1',
    barcode: '8901492004518',
    rfidId: 'EPC-E280-6894-01A9',
    storageCondition: 'Chilled 4°C · 65% RH',
    weightGrams: 250,
    status: 'SAFE',
    colorHex: '#06B6D4',
    shelfPosition: [-1.8, 1.45, -1.2],
    description: 'Zero-sugar electrolyte energy can monitored by load-cell array and UHF RFID.',
  },
  {
    id: 'prod-snacks',
    sku: 'SKU-SN-7821',
    name: 'Snacks (Artisan Trail Mix)',
    category: 'Packaged Nutrition',
    batchNumber: 'BCH-2026-104C',
    mfgDate: '01 Sep 2026',
    expiryDate: '01 Mar 2027',
    price: 50,
    stock: 19,
    shelfId: 'SH-A02-T2',
    barcode: '8901492007823',
    rfidId: 'EPC-E280-6894-04C2',
    storageCondition: 'Ambient 24°C · Dry',
    weightGrams: 180,
    status: 'SAFE',
    colorHex: '#F59E0B',
    shelfPosition: [-0.9, 1.05, -1.2],
    description: 'Nitrogen-flushed roasted almond and cranberry pouch with inlaid smart label.',
  },
  {
    id: 'prod-juice',
    sku: 'SKU-JC-3310',
    name: 'Juice (Cold-Pressed Valencia)',
    category: 'Fresh Beverage',
    batchNumber: 'BCH-2026-095B',
    mfgDate: '20 Sep 2026',
    expiryDate: '03 Oct 2026',
    price: 50,
    stock: 9,
    shelfId: 'SH-A02-T1',
    barcode: '8901492003313',
    rfidId: 'EPC-E280-6894-09B7',
    storageCondition: 'Chilled 4°C · Cold Chain',
    weightGrams: 300,
    status: 'EXPIRING SOON',
    colorHex: '#10B981',
    shelfPosition: [0.0, 1.45, -1.2],
    description: 'Unpasteurized citrus bottle tracked with real-time shelf-life countdown.',
  },
  {
    id: 'prod-dairy-expired',
    sku: 'SKU-DR-9904',
    name: 'Probiotic Oat Shake',
    category: 'Cultured Dairy-Free',
    batchNumber: 'BCH-2026-041X',
    mfgDate: '10 Aug 2026',
    expiryDate: '25 Sep 2026',
    price: 65,
    stock: 3,
    shelfId: 'SH-A02-T3',
    barcode: '8901492009902',
    rfidId: 'EPC-E280-6894-99X0',
    storageCondition: 'Chilled 4°C · Alert Active',
    weightGrams: 275,
    status: 'EXPIRED',
    colorHex: '#EF4444',
    shelfPosition: [0.9, 0.65, -1.2],
    description: 'Past-expiry batch flagged by database rule engine; checkout lock engaged.',
  },
];

export interface ArchitectureLayer {
  index: string;
  id: string;
  name: string;
  role: string;
  protocol: string;
  latency: string;
}

export const ARCHITECTURE_LAYERS: ArchitectureLayer[] = [
  { index: '01', id: 'customer', name: 'CUSTOMER', role: 'Mobile Identity Token', protocol: 'Dynamic QR / TLS 1.3', latency: '12 ms' },
  { index: '02', id: 'qr-auth', name: 'QR AUTHENTICATION', role: 'Optical Scanner Validation', protocol: 'OAuth 2.0 JWT Verify', latency: '18 ms' },
  { index: '03', id: 'entry-control', name: 'ENTRY CONTROL', role: 'Motorized Glass Barrier', protocol: 'RS-485 Actuator Bus', latency: '45 ms' },
  { index: '04', id: 'cameras', name: 'CAMERAS', role: 'Multi-Angle Optical Tracking', protocol: 'RTSP 60fps Edge Stream', latency: '16 ms' },
  { index: '05', id: 'smart-shelves', name: 'SMART SHELVES', role: 'Load-Cell Weight Delta Array', protocol: 'HX711 24-bit ADC / MQTT', latency: '8 ms' },
  { index: '06', id: 'rfid', name: 'RFID', role: 'UHF Item-Level EPC Interrogation', protocol: 'ISO 18000-6C / 865 MHz', latency: '6 ms' },
  { index: '07', id: 'sensor-fusion', name: 'AI SENSOR FUSION', role: 'Multi-Modal Confidence Engine', protocol: 'Edge Tensor Inference', latency: '22 ms' },
  { index: '08', id: 'product-db', name: 'PRODUCT DATABASE', role: 'SKU, Batch & Telemetry Ledger', protocol: 'ACID In-Memory Sync', latency: '4 ms' },
  { index: '09', id: 'expiry-validation', name: 'EXPIRY + STOCK VALIDATION', role: 'Policy & Safety Gatekeeper', protocol: 'Deterministic Rule Engine', latency: '3 ms' },
  { index: '10', id: 'virtual-cart', name: 'VIRTUAL CART', role: 'Real-Time Session Basket', protocol: 'WebSocket State Stream', latency: '9 ms' },
  { index: '11', id: 'billing', name: 'BILLING', role: 'Automated Tax & Itemized Ledger', protocol: 'Zero-Touch Invoice Calc', latency: '5 ms' },
  { index: '12', id: 'payment', name: 'PAYMENT', role: 'Pre-Authorized Token Capture', protocol: 'UPI / Tokenized Mandate', latency: '110 ms' },
  { index: '13', id: 'exit-verification', name: 'EXIT VERIFICATION', role: 'Gate Release & Digital Receipt', protocol: 'RFID Exit Curtain + Gate', latency: '30 ms' },
];

export interface JourneyStep {
  step: string;
  code: 'SCAN' | 'ENTER' | 'SHOP' | 'VERIFY' | 'PAY' | 'EXIT';
  question: string;
  summary: string;
  detail: string;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
}

export const CUSTOMER_JOURNEY_STEPS: JourneyStep[] = [
  {
    step: 'STEP 01',
    code: 'SCAN',
    question: 'What is happening at the threshold?',
    summary: 'Customer scans dynamic smartphone QR code at the entrance pedestal.',
    detail: 'Optical scanner reads the encrypted session token and binds a temporary anonymous 3D skeletal track ID to the verified payment mandate.',
    cameraPosition: [0, 2.2, 8.8],
    cameraTarget: [0, 1.3, 3.8],
  },
  {
    step: 'STEP 02',
    code: 'ENTER',
    question: 'How does the store grant access?',
    summary: 'Authentication succeeds and motorized glass entrance opens automatically.',
    detail: 'Controller actuates the dual-leaf glass barrier within 45 ms while overhead ceiling cameras initialize multi-angle spatial tracking.',
    cameraPosition: [1.5, 2.1, 6.2],
    cameraTarget: [0, 1.4, 1.5],
  },
  {
    step: 'STEP 03',
    code: 'SHOP',
    question: 'How does the customer interact with shelves?',
    summary: 'Customer walks naturally through the aisle and picks products without scanning.',
    detail: 'No barcode gun, no manual basket scan. The shopper picks up an Energy Drink (₹45), Snacks (₹50), and Juice (₹50) directly from the smart shelf.',
    cameraPosition: [-1.6, 1.9, 2.4],
    cameraTarget: [-0.6, 1.3, -1.2],
  },
  {
    step: 'STEP 04',
    code: 'VERIFY',
    question: 'How does AI verify every pickup?',
    summary: 'AI computer vision, load-cell smart shelves, and RFID confirm product identity and expiry.',
    detail: 'Weight displacement (-250g), UHF EPC tag drop, and 3D pose bounding box converge in the AI Sensor Fusion engine while verifying batch expiry status.',
    cameraPosition: [2.2, 2.0, 1.8],
    cameraTarget: [-0.3, 1.2, -1.2],
  },
  {
    step: 'STEP 05',
    code: 'PAY',
    question: 'How does checkout happen without a cashier?',
    summary: 'The system automatically calculates the ₹145 final bill as the shopper walks toward the exit.',
    detail: 'Pre-authorized session mandate captures ₹145 for the 3 valid items in the Virtual Cart. Expired items are automatically blocked from billing.',
    cameraPosition: [2.4, 1.9, 4.8],
    cameraTarget: [2.0, 1.2, 2.8],
  },
  {
    step: 'STEP 06',
    code: 'EXIT',
    question: 'How is the exit verified?',
    summary: 'Payment capture is confirmed and the exit gate opens seamlessly.',
    detail: 'UHF exit curtain reconciles the Virtual Cart with physical items carried through the lane, opens the glass exit barrier, and dispatches the digital receipt.',
    cameraPosition: [3.2, 2.3, 7.8],
    cameraTarget: [1.8, 1.2, 3.5],
  },
];

export interface CameraStation {
  id: string;
  label: string;
  pos: [number, number, number];
  target: [number, number, number];
}

export const CAMERA_STATIONS: Record<string, CameraStation> = {
  hero: {
    id: 'hero',
    label: '01. Entrance & QR Access',
    pos: [0.4, 2.4, 9.6],
    target: [0, 1.4, 2.5],
  },
  registration: {
    id: 'registration',
    label: '02. Product Identity',
    pos: [-1.1, 1.65, 1.35],
    target: [-0.9, 1.25, -1.25],
  },
  lifecycle: {
    id: 'lifecycle',
    label: '03. Expiry Intelligence',
    pos: [0.3, 1.65, 1.6],
    target: [0.1, 1.15, -1.25],
  },
  detection: {
    id: 'detection',
    label: '04. AI CV & Sensor Fusion',
    pos: [2.4, 2.15, 2.1],
    target: [-0.4, 1.3, -1.1],
  },
  architecture: {
    id: 'architecture',
    label: '05. 3D Store Architecture',
    pos: [7.8, 6.8, 8.6],
    target: [0, 1.4, 0],
  },
  infrastructure: {
    id: 'infrastructure',
    label: '06. Autonomous Infrastructure',
    pos: [-5.8, 4.8, 6.4],
    target: [0, 1.6, -0.4],
  },
  journey: {
    id: 'journey',
    label: '07. Customer Journey & Pay',
    pos: [2.8, 2.1, 6.4],
    target: [1.5, 1.2, 2.6],
  },
  overview: {
    id: 'overview',
    label: '08. Full Autonomous Store',
    pos: [0.0, 7.6, 11.8],
    target: [0, 1.2, 0],
  },
};
