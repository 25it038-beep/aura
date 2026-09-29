/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronRight,
  Cpu,
  Eye,
  Lock,
  Play,
  QrCode,
  RefreshCw,
  ShieldAlert,
  ShoppingBag,
  Sliders,
  Sun,
  Thermometer,
} from 'lucide-react';
import { SmartStoreCanvas } from './components/SmartStoreCanvas';
import { LiveStoreStatusHUD } from './components/LiveStoreStatusHUD';
import {
  ARCHITECTURE_LAYERS,
  CUSTOMER_JOURNEY_STEPS,
  ExpiryStatus,
  SMART_PRODUCTS,
  STORE_IMAGES,
  SmartProduct,
} from './data/storeData';

interface CartItem {
  product: SmartProduct;
  quantity: number;
}

export default function App() {
  // Active 3D camera station synced with scroll or navigation
  const [activeStation, setActiveStation] = useState<string>('hero');

  // Interactive Store Simulation States
  const [authStage, setAuthStage] = useState<
    'PHONE' | 'QR_SCAN' | 'AUTHENTICATION' | 'STORE_ACCESS'
  >('STORE_ACCESS');
  const [entryVerified, setEntryVerified] = useState<boolean>(true);

  // Selected product for Section 2 (Registration), Lifecycle & Section 3 (AI Detection)
  const [selectedProduct, setSelectedProduct] = useState<SmartProduct>(SMART_PRODUCTS[0]);
  const [lifecycleFilter, setLifecycleFilter] = useState<'ALL' | ExpiryStatus>('ALL');
  const [blockedAlertMessage, setBlockedAlertMessage] = useState<string | null>(null);

  // Virtual Cart initialized with the exact prompt showcase items (Energy Drink ₹45, Snacks ₹50, Juice ₹50 = ₹145)
  const [cart, setCart] = useState<CartItem[]>([
    { product: SMART_PRODUCTS[0], quantity: 1 },
    { product: SMART_PRODUCTS[1], quantity: 1 },
    { product: SMART_PRODUCTS[2], quantity: 1 },
  ]);

  // Sensor Fusion & Architecture interactive inspection
  const [activeSensorStream, setActiveSensorStream] = useState<string>('ALL');
  const [activeArchLayerId, setActiveArchLayerId] = useState<string>('sensor-fusion');
  const [xrayMode, setXrayMode] = useState<boolean>(false);
  const [freeLookEnabled, setFreeLookEnabled] = useState<boolean>(false);

  // Autonomous Infrastructure interactive controls
  const [robotMode, setRobotMode] = useState<'CLEANING' | 'DOCKED' | 'LOW_TRAFFIC_PATROL'>(
    'CLEANING'
  );
  const [hvacTemp, setHvacTemp] = useState<number>(24);
  const [solarActive, setSolarActive] = useState<boolean>(true);

  // Customer Journey & Automated Payment states
  const [journeyStepIndex, setJourneyStepIndex] = useState<number>(0);
  const [paymentStageIndex, setPaymentStageIndex] = useState<number>(5);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState<boolean>(false);
  const [hudExpanded, setHudExpanded] = useState<boolean>(true);

  // Section refs for scroll-based 3D camera choreography
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stationId = entry.target.getAttribute('data-station');
            if (stationId) {
              setActiveStation(stationId);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '-35% 0px -35% 0px',
        threshold: 0.05,
      }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Trigger full QR Entrance Authentication sequence animation
  const runEntranceScanSequence = () => {
    setEntryVerified(false);
    setAuthStage('PHONE');
    setTimeout(() => setAuthStage('QR_SCAN'), 550);
    setTimeout(() => setAuthStage('AUTHENTICATION'), 1150);
    setTimeout(() => {
      setAuthStage('STORE_ACCESS');
      setEntryVerified(true);
    }, 1750);
  };

  // Add item to Virtual Cart (enforcing Expiry Validation rule engine)
  const handlePickupProduct = (product: SmartProduct) => {
    setSelectedProduct(product);
    if (product.status === 'EXPIRED') {
      setBlockedAlertMessage(
        `EXPIRED PRODUCT DETECTED (${product.name} · Batch ${product.batchNumber}). SALE BLOCKED — Admin Alert Dispatched.`
      );
      return;
    }
    setBlockedAlertMessage(null);
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const resetDemoCart = () => {
    setBlockedAlertMessage(null);
    setCart([
      { product: SMART_PRODUCTS[0], quantity: 1 },
      { product: SMART_PRODUCTS[1], quantity: 1 },
      { product: SMART_PRODUCTS[2], quantity: 1 },
    ]);
  };

  // Run Automated Payment pipeline animation
  const triggerPaymentSimulation = () => {
    if (isSimulatingPayment) return;
    setIsSimulatingPayment(true);
    setPaymentStageIndex(0);
    [1, 2, 3, 4, 5, 6].forEach((stepIdx, idx) => {
      setTimeout(() => {
        setPaymentStageIndex(stepIdx);
        if (stepIdx === 6) {
          setIsSimulatingPayment(false);
        }
      }, (idx + 1) * 450);
    });
  };

  const scrollToStation = (stationKey: string) => {
    const el = sectionRefs.current[stationKey];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts =
    lifecycleFilter === 'ALL'
      ? SMART_PRODUCTS
      : SMART_PRODUCTS.filter((p) => p.status === lifecycleFilter);

  const paymentPipelineStages = [
    'PAYMENT AUTHORIZATION',
    'SHOPPING SESSION',
    'FINAL CART',
    `₹${cartTotal}`,
    'PAYMENT CAPTURE',
    'EXIT VERIFIED',
    'THANK YOU',
  ];

  return (
    <div className="relative min-h-screen bg-[#090A0D] text-[#F8FAFC] selection:bg-amber-500/30 selection:text-amber-200">
      {/* Persistent Full-Viewport Interactive 3D Smart Store WebGL Scene */}
      <SmartStoreCanvas
        activeStation={activeStation}
        selectedProduct={selectedProduct}
        onSelectProduct={(prod) => setSelectedProduct(prod)}
        entryVerified={entryVerified}
        xrayMode={xrayMode}
        sensorFusionActive={true}
        robotMode={robotMode}
        hvacTemp={hvacTemp}
        solarActive={solarActive}
        journeyStepIndex={journeyStepIndex}
        freeLookEnabled={freeLookEnabled}
      />

      {/* Top Navigation Bar — Strict 3-Zone Contract */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 lg:px-12 py-4 bg-[#090A0D]/75 backdrop-blur-xl border-b border-white/10">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            scrollToStation('hero');
          }}
          className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap"
        >
          AURA
        </a>

        {/* Zone 2: 5 single-line navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              scrollToStation('hero');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap ${
              activeStation === 'hero' ? 'text-white underline underline-offset-8 decoration-amber-400' : ''
            }`}
          >
            Entrance
          </a>
          <a
            href="#registration"
            onClick={(e) => {
              e.preventDefault();
              scrollToStation('registration');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap ${
              activeStation === 'registration' || activeStation === 'lifecycle'
                ? 'text-white underline underline-offset-8 decoration-amber-400'
                : ''
            }`}
          >
            Product Identity
          </a>
          <a
            href="#detection"
            onClick={(e) => {
              e.preventDefault();
              scrollToStation('detection');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap ${
              activeStation === 'detection'
                ? 'text-white underline underline-offset-8 decoration-amber-400'
                : ''
            }`}
          >
            Sensor Fusion
          </a>
          <a
            href="#architecture"
            onClick={(e) => {
              e.preventDefault();
              scrollToStation('architecture');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap ${
              activeStation === 'architecture' || activeStation === 'infrastructure'
                ? 'text-white underline underline-offset-8 decoration-amber-400'
                : ''
            }`}
          >
            Architecture
          </a>
          <a
            href="#journey"
            onClick={(e) => {
              e.preventDefault();
              scrollToStation('journey');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap ${
              activeStation === 'journey' || activeStation === 'overview'
                ? 'text-white underline underline-offset-8 decoration-amber-400'
                : ''
            }`}
          >
            Checkout
          </a>
        </nav>

        {/* Zone 3: 2 Primary Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setXrayMode((prev) => !prev)}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
              xrayMode
                ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-200'
                : 'bg-white/5 border-white/15 text-slate-200 hover:bg-white/10'
            }`}
          >
            {xrayMode ? 'X-Ray Model: Active' : '3D X-Ray Cutaway'}
          </button>
          <button
            type="button"
            onClick={() => scrollToStation('journey')}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Virtual Cart · ₹{cartTotal}
          </button>
        </div>
      </header>

      {/* Floating 3D Live Store Status Control Interface */}
      <LiveStoreStatusHUD
        activeStation={activeStation}
        robotMode={robotMode}
        hvacTemp={hvacTemp}
        solarActive={solarActive}
        xrayMode={xrayMode}
        onToggleXray={() => setXrayMode((prev) => !prev)}
        freeLookEnabled={freeLookEnabled}
        onToggleFreeLook={() => setFreeLookEnabled((prev) => !prev)}
        cartCount={cartCount}
        cartTotal={cartTotal}
        isExpanded={hudExpanded}
        onToggleExpand={() => setHudExpanded((prev) => !prev)}
      />

      {/* Semantic Foreground Storytelling Journey layered over the 3D Store */}
      <main className="relative z-10 pointer-events-none">
        {/* =====================================================================
            SECTION 1: HERO — ENTER THE STORE
        ===================================================================== */}
        <section
          id="hero"
          data-station="hero"
          ref={(el) => {
            sectionRefs.current.hero = el;
          }}
          className="min-h-screen flex flex-col justify-between pt-28 pb-12 px-6 lg:px-16 max-w-[1440px] mx-auto"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-auto">
            {/* Left Dominant Focal Anchor: Store Headline & Journey Trigger */}
            <div className="lg:col-span-7 pointer-events-auto space-y-6">
              <div className="flex items-center gap-2 text-xs font-medium tracking-wider text-amber-400">
                <span>Computer Vision</span>
                <span aria-hidden="true">•</span>
                <span>IoT</span>
                <span aria-hidden="true">•</span>
                <span>AI</span>
                <span aria-hidden="true">•</span>
                <span>Smart Infrastructure</span>
              </div>

              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.04] text-white">
                AI-POWERED
                <span className="block text-slate-200">24/7 AUTONOMOUS</span>
                <span className="block text-amber-400">CASHIERLESS SMART STORE</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
                Step inside a continuous 3D simulation of an autonomous retail environment.
                Optical computer vision, load-cell smart shelves, UHF RFID, and self-managing
                building infrastructure operate together with zero checkout queues.
              </p>

              {/* Main Interaction Sequence Bar: SCAN -> SHOP -> PAY -> EXIT */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={runEntranceScanSequence}
                  className="flex items-center gap-2.5 px-5 py-3 text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shadow-lg shadow-amber-500/10"
                >
                  <QrCode className="w-4 h-4 shrink-0" />
                  <span>Simulate QR Entrance Scan</span>
                </button>

                <button
                  type="button"
                  onClick={() => scrollToStation('registration')}
                  className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-white bg-white/10 hover:bg-white/15 border border-white/15 rounded-lg transition-colors whitespace-nowrap"
                >
                  <span>Enter Product Aisle</span>
                  <ArrowDown className="w-4 h-4 shrink-0" />
                </button>
              </div>

              {/* Interactive Journey Ribbon: SCAN -> SHOP -> PAY -> EXIT */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-3 text-xs font-mono text-slate-300">
                <button
                  type="button"
                  onClick={() => scrollToStation('hero')}
                  className="hover:text-amber-400 transition-colors whitespace-nowrap"
                >
                  01. SCAN
                </button>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <button
                  type="button"
                  onClick={() => scrollToStation('registration')}
                  className="hover:text-amber-400 transition-colors whitespace-nowrap"
                >
                  02. SHOP
                </button>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <button
                  type="button"
                  onClick={() => scrollToStation('journey')}
                  className="hover:text-amber-400 transition-colors whitespace-nowrap"
                >
                  03. PAY
                </button>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <button
                  type="button"
                  onClick={() => scrollToStation('overview')}
                  className="hover:text-amber-400 transition-colors whitespace-nowrap"
                >
                  04. EXIT
                </button>
              </div>
            </div>

            {/* Right Floating 3D Glass Authentication Interface */}
            <div className="lg:col-span-5 pointer-events-auto bg-[#0C0F17]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl">
              <div className="relative h-44 rounded-xl overflow-hidden border border-white/10 bg-slate-900">
                <img
                  src={STORE_IMAGES.heroEntrance}
                  alt="Autonomous Smart Store Entrance and QR Scanner Pedestal"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090A0D] via-[#090A0D]/30 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-200">
                    ENTRANCE GATE · OPTICAL QR TERMINAL
                  </span>
                  <span
                    className={`text-xs font-mono font-semibold ${
                      entryVerified ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {entryVerified ? 'ACCESS VERIFIED' : 'SCANNING TOKEN...'}
                  </span>
                </div>
              </div>

              {/* Animated Sequence: PHONE -> QR SCAN -> AUTHENTICATION -> STORE ACCESS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>ENTRANCE HANDSHAKE PIPELINE</span>
                  <span className="font-mono text-emerald-400">
                    {entryVerified ? 'GATE OPEN (45 ms)' : 'VERIFYING...'}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-1">
                  {[
                    { id: 'PHONE', label: 'PHONE' },
                    { id: 'QR_SCAN', label: 'QR SCAN' },
                    { id: 'AUTHENTICATION', label: 'AUTH' },
                    { id: 'STORE_ACCESS', label: 'ACCESS' },
                  ].map((step, idx) => {
                    const order = ['PHONE', 'QR_SCAN', 'AUTHENTICATION', 'STORE_ACCESS'];
                    const activeIdx = order.indexOf(authStage);
                    const isPassed = idx <= activeIdx;
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => {
                          setAuthStage(step.id as typeof authStage);
                          setEntryVerified(step.id === 'STORE_ACCESS');
                        }}
                        className={`px-2 py-2.5 rounded-lg border text-center font-mono text-[11px] transition-colors whitespace-nowrap ${
                          isPassed
                            ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-300 font-semibold'
                            : 'bg-white/5 border-white/10 text-slate-400'
                        }`}
                      >
                        {step.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Floating Access Verified Status Box */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-white flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>ACCESS VERIFIED · GATE ACTUATED</span>
                  </p>
                  <p className="text-xs text-slate-400">
                    Session bound to anonymous 3D spatial tracker · Cashierless mandate active
                  </p>
                </div>
                <span className="font-mono text-xs text-emerald-400 shrink-0">ONLINE</span>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 2: THE STORE UNDERSTANDS EVERY PRODUCT (DIGITAL IDENTITY)
        ===================================================================== */}
        <section
          id="registration"
          data-station="registration"
          ref={(el) => {
            sectionRefs.current.registration = el;
          }}
          className="min-h-screen flex items-center py-24 px-6 lg:px-16 max-w-[1440px] mx-auto"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-center">
            {/* Left Column: Narrative & Product Selector */}
            <div className="lg:col-span-5 pointer-events-auto space-y-6 bg-[#0B0E16]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:p-8">
              <div className="text-xs font-mono text-cyan-400 tracking-wider">
                01. DIGITAL PRODUCT IDENTITY
              </div>

              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
                The Store Understands Every Product on the Shelf.
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Before a shopper ever enters the aisle, every item is paired with a cryptographic
                digital twin combining optical features, calibrated mass, and item-level UHF RFID.
              </p>

              {/* Visual Process Chain: REGISTER -> MONITOR -> DETECT -> VERIFY */}
              <div className="py-3 border-y border-white/10 flex items-center justify-between text-xs font-mono text-slate-200">
                <span>REGISTER</span>
                <span className="text-slate-500">→</span>
                <span>MONITOR</span>
                <span className="text-slate-500">→</span>
                <span>DETECT</span>
                <span className="text-slate-500">→</span>
                <span className="text-amber-400 font-semibold">VERIFY</span>
              </div>

              {/* Interactive Product Shelf Selector */}
              <div className="space-y-2.5">
                <p className="text-xs font-medium text-slate-400">
                  Select a product on the 3D smart shelf to inspect its registered identity:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SMART_PRODUCTS.map((prod) => {
                    const isSelected = selectedProduct.id === prod.id;
                    return (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => setSelectedProduct(prod)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-white/12 border-amber-400/70 text-white shadow-lg'
                            : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.07]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold truncate">{prod.name}</span>
                          <span className="font-mono text-xs text-amber-400 shrink-0">
                            ₹{prod.price}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                          <span>{prod.sku}</span>
                          <span>·</span>
                          <span
                            className={
                              prod.status === 'SAFE'
                                ? 'text-emerald-400'
                                : prod.status === 'EXPIRING SOON'
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }
                          >
                            {prod.status}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Floating 3D Product Registration Panel (12 Mandatory Fields) */}
            <div className="lg:col-span-7 pointer-events-auto bg-[#0B0E16]/85 backdrop-blur-2xl border border-white/15 rounded-2xl p-6 lg:p-8 shadow-2xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs font-mono text-amber-400">
                    PRODUCT REGISTRATION LEDGER
                  </span>
                  <h3 className="font-display text-2xl font-bold text-white mt-0.5">
                    {selectedProduct.name}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-mono font-semibold ${
                      selectedProduct.status === 'SAFE'
                        ? 'text-emerald-400'
                        : selectedProduct.status === 'EXPIRING SOON'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    STATUS: {selectedProduct.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePickupProduct(selectedProduct)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap"
                  >
                    Simulate Shelf Pickup
                  </button>
                </div>
              </div>

              {/* All 12 Mandatory Registration Attributes in Tabular Monospace */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-[11px] text-slate-400 block">Product Name</span>
                  <span className="text-xs text-white font-semibold mt-1 block truncate">
                    {selectedProduct.name}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-[11px] text-slate-400 block">Product ID / SKU</span>
                  <span className="text-xs text-cyan-300 font-semibold mt-1 block">
                    {selectedProduct.sku}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-[11px] text-slate-400 block">Category</span>
                  <span className="text-xs text-slate-200 mt-1 block truncate">
                    {selectedProduct.category}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-[11px] text-slate-400 block">Batch Number</span>
                  <span className="text-xs text-slate-200 mt-1 block">
                    {selectedProduct.batchNumber}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-[11px] text-slate-400 block">Manufacturing Date</span>
                  <span className="text-xs text-slate-200 mt-1 block">
                    {selectedProduct.mfgDate}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-[11px] text-slate-400 block">Expiry Date</span>
                  <span
                    className={`text-xs font-semibold mt-1 block ${
                      selectedProduct.status === 'EXPIRED'
                        ? 'text-rose-400'
                        : selectedProduct.status === 'EXPIRING SOON'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {selectedProduct.expiryDate}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-[11px] text-slate-400 block">Price</span>
                  <span className="text-xs text-amber-400 font-semibold mt-1 block">
                    ₹{selectedProduct.price}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-[11px] text-slate-400 block">Quantity / Stock</span>
                  <span className="text-xs text-slate-200 mt-1 block">
                    {selectedProduct.stock} units ({selectedProduct.weightGrams}g/unit)
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-[11px] text-slate-400 block">Shelf ID</span>
                  <span className="text-xs text-cyan-300 mt-1 block">
                    {selectedProduct.shelfId}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-[11px] text-slate-400 block">Barcode / QR</span>
                  <span className="text-xs text-slate-200 mt-1 block">
                    {selectedProduct.barcode}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-[11px] text-slate-400 block">RFID ID</span>
                  <span className="text-xs text-emerald-300 mt-1 block truncate">
                    {selectedProduct.rfidId}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-[11px] text-slate-400 block">Storage Condition</span>
                  <span className="text-xs text-slate-200 mt-1 block truncate">
                    {selectedProduct.storageCondition}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 2B: PRODUCT LIFECYCLE + EXPIRY INTELLIGENCE
        ===================================================================== */}
        <section
          id="lifecycle"
          data-station="lifecycle"
          ref={(el) => {
            sectionRefs.current.lifecycle = el;
          }}
          className="min-h-screen flex items-center py-24 px-6 lg:px-16 max-w-[1440px] mx-auto"
        >
          <div className="w-full pointer-events-auto bg-[#0B0E16]/85 backdrop-blur-2xl border border-white/15 rounded-2xl p-6 lg:p-10 space-y-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/10 pb-6">
              <div className="space-y-2 max-w-2xl">
                <div className="text-xs font-mono text-amber-400 tracking-wider">
                  02. PRODUCT LIFECYCLE + EXPIRY INTELLIGENCE
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
                  Automated Expiry Gatekeeper & Batch Safety.
                </h2>
                <p className="text-sm sm:text-base text-slate-300">
                  The store database continuously cross-checks expiry dates, stock quantity,
                  shelf location, and batch telemetry. If a customer picks up an expired batch,
                  store rules prevent it from entering the virtual cart and notify staff.
                </p>
              </div>

              {/* Interactive Filter Controls (Functional Buttons) */}
              <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl self-start">
                {(['ALL', 'SAFE', 'EXPIRING SOON', 'EXPIRED'] as const).map((statusFilter) => (
                  <button
                    key={statusFilter}
                    type="button"
                    onClick={() => setLifecycleFilter(statusFilter)}
                    className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-colors whitespace-nowrap ${
                      lifecycleFilter === statusFilter
                        ? 'bg-amber-400 text-slate-950 font-semibold'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {statusFilter}
                  </button>
                ))}
              </div>
            </div>

            {/* Shelf Monitoring Matrix + Photorealistic Smart Shelf Reference */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProducts.map((prod) => {
                  const isExpired = prod.status === 'EXPIRED';
                  const isExpiringSoon = prod.status === 'EXPIRING SOON';
                  return (
                    <div
                      key={prod.id}
                      onClick={() => setSelectedProduct(prod)}
                      className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isExpired
                          ? 'bg-rose-950/25 border-rose-500/50 hover:border-rose-400'
                          : isExpiringSoon
                          ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-400'
                          : 'bg-white/[0.03] border-white/10 hover:border-cyan-400/50'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-400">{prod.shelfId}</span>
                          <span
                            className={`font-semibold ${
                              isExpired
                                ? 'text-rose-400'
                                : isExpiringSoon
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {prod.status}
                          </span>
                        </div>

                        <h3 className="font-display text-lg font-bold text-white">
                          {prod.name}
                        </h3>

                        <p className="text-xs font-mono text-slate-400">
                          Batch {prod.batchNumber} · Exp: {prod.expiryDate}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                        <span className="text-xs font-mono text-slate-300">
                          Stock: {prod.stock} · ₹{prod.price}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePickupProduct(prod);
                          }}
                          className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-lg transition-colors whitespace-nowrap ${
                            isExpired
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                              : 'bg-white/10 text-white hover:bg-amber-400 hover:text-slate-950'
                          }`}
                        >
                          {isExpired ? 'Test Expiry Block' : 'Add to Virtual Cart'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Live Expiry Rule Engine & Visual Verification */}
              <div className="lg:col-span-5 flex flex-col justify-between bg-black/50 border border-white/10 rounded-xl p-5 space-y-4">
                <div className="relative h-44 rounded-lg overflow-hidden border border-white/10">
                  <img
                    src={STORE_IMAGES.smartShelf}
                    alt="Smart Retail Shelf with Integrated Load Sensors and RFID"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-200">SMART SHELF TELEMETRY</span>
                    <span className="text-emerald-400">CONTINUOUS SCAN</span>
                  </div>
                </div>

                {/* Expired Product Detection Alert Panel */}
                <div
                  className={`p-4 rounded-xl border transition-colors ${
                    selectedProduct.status === 'EXPIRED' || blockedAlertMessage
                      ? 'bg-rose-950/40 border-rose-500/60'
                      : 'bg-white/[0.03] border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-rose-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>EXPIRED PRODUCT DETECTED</span>
                    </span>
                    <span className="text-xs font-mono text-rose-300">RULE ENGINE</span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-xs">
                    <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-200 font-semibold text-center">
                      SALE BLOCKED
                    </div>
                    <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-200 font-semibold text-center">
                      ADMIN ALERT
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                    {blockedAlertMessage ||
                      'When an expired item (such as Probiotic Oat Shake · Batch BCH-2026-041X) is lifted from Shelf SH-A02-T3, the system blocks virtual cart insertion and flags inventory staff for removal.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 3: AI PRODUCT DETECTION + MULTI-MODAL SENSOR FUSION
        ===================================================================== */}
        <section
          id="detection"
          data-station="detection"
          ref={(el) => {
            sectionRefs.current.detection = el;
          }}
          className="min-h-screen flex items-center py-24 px-6 lg:px-16 max-w-[1440px] mx-auto"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
            {/* Left Column: AI Computer Vision Pipeline + Virtual Cart */}
            <div className="lg:col-span-6 pointer-events-auto bg-[#0B0E16]/85 backdrop-blur-2xl border border-white/15 rounded-2xl p-6 lg:p-8 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400">
                  03. AI COMPUTER VISION & VIRTUAL CART
                </span>
                <span className="text-xs font-mono font-semibold text-emerald-400">
                  PRODUCT DETECTED
                </span>
              </div>

              <h2 className="font-display text-3xl font-bold text-white">
                Instant Recognition From Shelf to Virtual Cart.
              </h2>

              {/* 7-Layer Vertical Intelligence Cascade */}
              <div className="space-y-1.5 font-mono text-xs">
                {[
                  { step: 'CAMERA', detail: 'Overhead 60fps optical dome tracks hand-to-shelf vector' },
                  { step: 'OBJECT DETECTION', detail: `3D bounding box locks onto ${selectedProduct.name}` },
                  { step: 'PRODUCT DATABASE', detail: `Matches SKU ${selectedProduct.sku} · ₹${selectedProduct.price}` },
                  { step: 'EXPIRY VALIDATION', detail: `Batch ${selectedProduct.batchNumber} status: ${selectedProduct.status}` },
                  { step: 'SHELF / WEIGHT SENSOR', detail: `Load-cell delta confirms -${selectedProduct.weightGrams}g lift` },
                  { step: 'RFID', detail: `UHF reader logs EPC ${selectedProduct.rfidId} displacement` },
                  { step: 'VIRTUAL CART', detail: selectedProduct.status === 'EXPIRED' ? 'Blocked by expiry rule' : 'Item appended to active session' },
                ].map((node, i, arr) => (
                  <React.Fragment key={node.step}>
                    <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-between gap-3">
                      <span className="font-semibold text-cyan-300 whitespace-nowrap">
                        {node.step}
                      </span>
                      <span className="text-slate-300 text-[11px] text-right truncate">
                        {node.detail}
                      </span>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="text-center text-cyan-400/70 text-xs leading-none">↓</div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Floating Virtual Cart Live Readout (Matching Exact Prompt Example) */}
              <div className="p-4 rounded-xl bg-cyan-950/25 border border-cyan-400/40 space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-semibold text-white">
                    LIVE DETECTION READOUT
                  </span>
                  <span className="text-xs text-cyan-300">CONFIDENCE: 99.4%</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">PRODUCT</span>
                    <span className="text-white font-semibold">{selectedProduct.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">PRICE</span>
                    <span className="text-amber-400 font-semibold">₹{selectedProduct.price}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">STATUS</span>
                    <span
                      className={`font-semibold ${
                        selectedProduct.status === 'EXPIRED' ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {selectedProduct.status === 'EXPIRED' ? 'BLOCKED' : 'VALID'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">CART</span>
                    <span className="text-cyan-300 font-semibold">
                      {selectedProduct.status === 'EXPIRED' ? '+0 (LOCKED)' : '+1'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Multi-Sensor Fusion Visualization */}
            <div className="lg:col-span-6 pointer-events-auto bg-[#0B0E16]/85 backdrop-blur-2xl border border-white/15 rounded-2xl p-6 lg:p-8 space-y-6 shadow-2xl">
              <div className="space-y-2">
                <span className="text-xs font-mono text-amber-400">
                  MULTI-MODAL SENSOR FUSION
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                  Zero Single-Point Sensor Dependency.
                </h3>
                <p className="text-sm text-slate-300">
                  Five independent physical and digital observation streams converge simultaneously
                  to confirm product identity even if a label is occluded by a shopper&apos;s hand.
                </p>
              </div>

              {/* 5 Independent Sensor Nodes Converging into AI SENSOR FUSION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'CAMERA',
                    title: 'Camera (Optical CV)',
                    metric: '60 fps Pose + Object Class',
                  },
                  {
                    id: 'WEIGHT',
                    title: 'Smart Shelf Weight Sensor',
                    metric: `Delta: -${selectedProduct.weightGrams}g ± 0.5g`,
                  },
                  {
                    id: 'RFID',
                    title: 'RFID Interrogator',
                    metric: `EPC: ${selectedProduct.rfidId}`,
                  },
                  {
                    id: 'AI',
                    title: 'AI Detection Tensor',
                    metric: 'Spatial Hand-to-Cart Association',
                  },
                  {
                    id: 'DB',
                    title: 'Product Database',
                    metric: `SKU ${selectedProduct.sku} · ${selectedProduct.status}`,
                  },
                ].map((sensor) => (
                  <button
                    key={sensor.id}
                    type="button"
                    onClick={() => setActiveSensorStream(sensor.id)}
                    className={`p-3.5 rounded-xl border text-left transition-colors ${
                      activeSensorStream === sensor.id || activeSensorStream === 'ALL'
                        ? 'bg-white/[0.06] border-cyan-400/50 text-white'
                        : 'bg-white/[0.02] border-white/10 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-semibold text-white">{sensor.title}</div>
                    <div className="text-[11px] font-mono text-cyan-300 mt-1">
                      {sensor.metric}
                    </div>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setActiveSensorStream('ALL')}
                  className="p-3.5 rounded-xl border border-amber-400/50 bg-amber-500/10 text-left flex flex-col justify-center"
                >
                  <span className="text-xs font-mono font-semibold text-amber-300">
                    CONVERGENCE NODE
                  </span>
                  <span className="text-sm font-display font-bold text-white mt-0.5">
                    AI SENSOR FUSION
                  </span>
                </button>
              </div>

              {/* Convergence Confirmation Banner */}
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-emerald-400 block">
                    MULTI-SENSOR CONSENSUS
                  </span>
                  <span className="font-display text-lg font-bold text-white">
                    PRODUCT IDENTITY CONFIRMED
                  </span>
                </div>
                <span className="font-mono text-xs text-emerald-300">5 / 5 STREAMS SYNCED</span>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 4: COMPLETE AUTONOMOUS STORE ARCHITECTURE (13 FLOATING LAYERS)
        ===================================================================== */}
        <section
          id="architecture"
          data-station="architecture"
          ref={(el) => {
            sectionRefs.current.architecture = el;
          }}
          className="min-h-screen flex items-center py-24 px-6 lg:px-16 max-w-[1440px] mx-auto"
        >
          <div className="w-full pointer-events-auto bg-[#0B0E16]/85 backdrop-blur-2xl border border-white/15 rounded-2xl p-6 lg:p-10 space-y-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/10 pb-6">
              <div className="space-y-2 max-w-2xl">
                <div className="text-xs font-mono text-cyan-400 tracking-wider">
                  04. TRANSPARENT 3D ARCHITECTURAL MODEL
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
                  End-to-End Autonomous Store Architecture.
                </h2>
                <p className="text-sm sm:text-base text-slate-300">
                  Zoom out to inspect the 13 interconnected hardware and software layers. Click any
                  architectural node below to inspect its real-time communication protocol and latency.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setXrayMode((prev) => !prev)}
                className="px-4 py-2.5 text-xs font-mono font-semibold rounded-lg bg-cyan-500/20 border border-cyan-400/50 text-cyan-200 hover:bg-cyan-500/30 transition-colors self-start whitespace-nowrap"
              >
                {xrayMode ? '3D Cutaway Roof: Transparent' : 'Toggle 3D X-Ray Roof'}
              </button>
            </div>

            {/* 13 Connected Architecture Nodes with Animated Flow */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {ARCHITECTURE_LAYERS.map((layer, idx) => {
                const isSelected = activeArchLayerId === layer.id;
                return (
                  <button
                    key={layer.id}
                    type="button"
                    onClick={() => setActiveArchLayerId(layer.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400 text-white shadow-lg'
                        : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>{layer.index}</span>
                      <span className="text-cyan-400">{layer.latency}</span>
                    </div>
                    <div className="my-1.5 font-mono text-xs font-semibold text-white flex items-center justify-between">
                      <span>{layer.name}</span>
                      {idx < ARCHITECTURE_LAYERS.length - 1 && (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{layer.role}</div>
                  </button>
                );
              })}
            </div>

            {/* Selected Layer Telemetry Inspection Bar */}
            {(() => {
              const currentLayer =
                ARCHITECTURE_LAYERS.find((l) => l.id === activeArchLayerId) ||
                ARCHITECTURE_LAYERS[6];
              return (
                <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
                  <div className="space-y-1">
                    <span className="text-amber-400 font-semibold">
                      ACTIVE LAYER {currentLayer.index}: {currentLayer.name}
                    </span>
                    <p className="text-slate-300 font-sans">
                      Function: {currentLayer.role} · Transport Protocol: {currentLayer.protocol}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-slate-400 block">EDGE BUDGET</span>
                    <span className="text-emerald-400 font-semibold">
                      {currentLayer.latency} nominal
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>

        {/* =====================================================================
            SECTION 4B: AUTONOMOUS INFRASTRUCTURE (VACUUM ROBOT, HVAC, SOLAR)
        ===================================================================== */}
        <section
          id="infrastructure"
          data-station="infrastructure"
          ref={(el) => {
            sectionRefs.current.infrastructure = el;
          }}
          className="min-h-screen flex items-center py-24 px-6 lg:px-16 max-w-[1440px] mx-auto"
        >
          <div className="w-full pointer-events-auto space-y-8">
            <div className="max-w-2xl bg-[#0B0E16]/85 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-2">
              <span className="text-xs font-mono text-amber-400">
                05. SELF-MANAGING BUILDING INFRASTRUCTURE
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
                Autonomous Cleaning, Climate & Solar Energy.
              </h2>
              <p className="text-sm text-slate-300">
                While the retail computer-vision pipeline handles commerce, three physical IoT
                subsystems maintain hygiene, environmental stability, and supplemental renewable power.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Subsystem 1: Autonomous Vacuum Cleaning Robot */}
              <div className="bg-[#0B0E16]/85 backdrop-blur-2xl border border-white/15 rounded-2xl p-6 flex flex-col justify-between space-y-5 shadow-2xl">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-400 font-semibold">AUTONOMOUS CLEANING</span>
                    <span className="text-slate-400">LIDAR SLAM</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white">
                    Vacuum Cleaning Robot
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Operates independently in the background with LiDAR obstacle detection, aisle
                    waypoint navigation, low-traffic scheduling, and automatic dock recharging.
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2 font-mono text-[11px] text-slate-300">
                    <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/10">
                      Obstacle Detection: <span className="text-emerald-400">ACTIVE</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/10">
                      Navigation: <span className="text-cyan-300">AISLE SLAM</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/10">
                      Schedule: <span className="text-slate-200">LOW-TRAFFIC</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/10">
                      Charging Dock: <span className="text-amber-400">BAY A-01</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                  {(['CLEANING', 'LOW_TRAFFIC_PATROL', 'DOCKED'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setRobotMode(mode)}
                      className={`flex-1 py-2 px-2 text-[11px] font-mono rounded-lg border transition-colors whitespace-nowrap ${
                        robotMode === mode
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-semibold'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {mode === 'CLEANING'
                        ? 'Clean Aisle'
                        : mode === 'LOW_TRAFFIC_PATROL'
                        ? 'Fast Patrol'
                        : 'Return Dock'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subsystem 2: Smart Thermostat / Climate Control */}
              <div className="bg-[#0B0E16]/85 backdrop-blur-2xl border border-white/15 rounded-2xl p-6 flex flex-col justify-between space-y-5 shadow-2xl">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-cyan-400 font-semibold">CLIMATE CONTROL</span>
                    <span className="text-slate-300">SENSE → ANALYZE → CONTROL</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-display text-2xl font-bold text-white">
                      Smart Thermostat
                    </h3>
                    <span className="font-mono text-3xl font-bold text-cyan-300 tabular-nums">
                      {hvacTemp}°C
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Interior temperature and humidity sensors feed the smart controller to modulate
                    HVAC airflow based on customer occupancy and refrigeration heat dissipation.
                  </p>

                  {/* Flow: TEMPERATURE SENSOR -> SMART CONTROLLER -> HVAC */}
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 font-mono text-xs flex items-center justify-between text-slate-200">
                    <span>TEMP SENSOR</span>
                    <span className="text-cyan-400">→</span>
                    <span>CONTROLLER</span>
                    <span className="text-cyan-400">→</span>
                    <span className="text-emerald-400 font-semibold">HVAC</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>Adjust Target Store Temperature</span>
                    <span className="text-cyan-300">{hvacTemp}°C Setpoint</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[22, 23, 24, 25].map((tempVal) => (
                      <button
                        key={tempVal}
                        type="button"
                        onClick={() => setHvacTemp(tempVal)}
                        className={`flex-1 py-2 text-xs font-mono rounded-lg border transition-colors ${
                          hvacTemp === tempVal
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-semibold'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {tempVal}°C
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subsystem 3: Rooftop Solar Energy System */}
              <div className="bg-[#0B0E16]/85 backdrop-blur-2xl border border-white/15 rounded-2xl p-6 flex flex-col justify-between space-y-5 shadow-2xl">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-amber-400 font-semibold">RENEWABLE MICROGRID</span>
                    <span className="text-slate-300">SOLAR → BATTERY → LOADS</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white">
                    Solar Energy System
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Rooftop monocrystalline panels feed a hybrid solar inverter and lithium battery
                    buffer, supplementing grid power for AI/IoT nodes, LED lighting, HVAC, and robot
                    charging.
                  </p>

                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="p-2 rounded-lg bg-white/[0.03] border border-white/10 flex justify-between">
                      <span className="text-amber-300">SOLAR PANELS ↓ SOLAR INVERTER</span>
                      <span className="text-slate-300">DC → AC</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white/[0.03] border border-white/10 flex justify-between">
                      <span className="text-cyan-300">ENERGY MANAGEMENT ↓ BATTERY</span>
                      <span className="text-slate-300">BUFFER STORAGE</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white/[0.03] border border-white/10 flex justify-between">
                      <span className="text-emerald-300">STORE LOADS</span>
                      <span className="text-slate-300">AI · Lighting · HVAC · Dock</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">
                    Supplemental Solar Bus
                  </span>
                  <button
                    type="button"
                    onClick={() => setSolarActive((prev) => !prev)}
                    className={`px-3.5 py-2 text-xs font-mono font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                      solarActive
                        ? 'bg-amber-400 text-slate-950 border-amber-400'
                        : 'bg-white/5 border-white/10 text-slate-300'
                    }`}
                  >
                    {solarActive ? 'Solar Bus: Active' : 'Solar Bus: Standby'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 5: CUSTOMER JOURNEY + AUTOMATED PAYMENT VISUALIZATION
        ===================================================================== */}
        <section
          id="journey"
          data-station="journey"
          ref={(el) => {
            sectionRefs.current.journey = el;
          }}
          className="min-h-screen flex items-center py-24 px-6 lg:px-16 max-w-[1440px] mx-auto"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
            {/* Left 7 Columns: 6-Stage Interactive Customer Journey Camera Sequencer */}
            <div className="lg:col-span-7 pointer-events-auto bg-[#0B0E16]/85 backdrop-blur-2xl border border-white/15 rounded-2xl p-6 lg:p-8 space-y-6 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-mono text-amber-400">
                    06. CONTINUOUS CUSTOMER JOURNEY
                  </span>
                  <h2 className="font-display text-3xl font-bold text-white mt-0.5">
                    Six Steps. Zero Cashiers.
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setJourneyStepIndex((prev) => (prev + 1) % CUSTOMER_JOURNEY_STEPS.length)
                  }
                  className="px-3.5 py-2 text-xs font-mono font-semibold bg-white/10 hover:bg-white/15 border border-white/15 rounded-lg text-white transition-colors whitespace-nowrap"
                >
                  Next Camera Step →
                </button>
              </div>

              {/* 6 Interactive Journey Steps */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CUSTOMER_JOURNEY_STEPS.map((st, idx) => {
                  const isActive = journeyStepIndex === idx;
                  return (
                    <button
                      key={st.step}
                      type="button"
                      onClick={() => setJourneyStepIndex(idx)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        isActive
                          ? 'bg-amber-400/15 border-amber-400 text-white shadow-lg'
                          : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="text-[11px] font-mono text-amber-400">{st.step}</div>
                      <div className="font-display text-lg font-bold text-white mt-0.5">
                        {st.code}
                      </div>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2">{st.summary}</p>
                    </button>
                  );
                })}
              </div>

              {/* Active Step Engineering Explanation */}
              {(() => {
                const currentStep = CUSTOMER_JOURNEY_STEPS[journeyStepIndex];
                return (
                  <div className="p-5 rounded-xl bg-white/[0.04] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-cyan-300">
                      <span>
                        {currentStep.step} — {currentStep.code}
                      </span>
                      <span>3D CAMERA TRACKING CUSTOMER</span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-white">
                      {currentStep.question}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {currentStep.detail}
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* Right 5 Columns: Automated Digital Payment Interface (₹145 Example) */}
            <div className="lg:col-span-5 pointer-events-auto bg-[#0B0E16]/90 backdrop-blur-2xl border border-white/15 rounded-2xl p-6 lg:p-8 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs font-mono text-emerald-400">
                    AUTOMATED PAYMENT TERMINAL
                  </span>
                  <h3 className="font-display text-2xl font-bold text-white mt-0.5">
                    Zero-Touch Checkout
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={resetDemoCart}
                  className="px-2.5 py-1.5 text-xs font-mono text-slate-300 hover:text-white bg-white/5 rounded-lg border border-white/10 whitespace-nowrap"
                >
                  Reset ₹145 Demo
                </button>
              </div>

              {/* Itemized Virtual Cart */}
              <div className="space-y-2.5 font-mono text-xs">
                <div className="text-slate-400 text-[11px]">ITEMS IN VIRTUAL CART</div>
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between py-2 border-b border-white/10 text-slate-200"
                  >
                    <span>
                      {item.product.name.split(' (')[0]}
                      {item.quantity > 1 ? ` × ${item.quantity}` : ''}
                    </span>
                    <span className="font-semibold text-white tabular-nums">
                      ₹{item.product.price * item.quantity}
                    </span>
                  </div>
                ))}

                <div className="pt-2 flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">TOTAL</span>
                  <span className="font-display text-3xl font-bold text-amber-400 tabular-nums">
                    ₹{cartTotal}
                  </span>
                </div>
              </div>

              {/* Animated Payment Authorization Cascade */}
              <div className="space-y-1.5 font-mono text-xs">
                {paymentPipelineStages.map((stageLabel, idx) => {
                  const isCompleted = idx <= paymentStageIndex;
                  return (
                    <React.Fragment key={stageLabel}>
                      <div
                        className={`px-3 py-2 rounded-lg border flex items-center justify-between transition-colors ${
                          isCompleted
                            ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-200 font-semibold'
                            : 'bg-white/[0.02] border-white/10 text-slate-500'
                        }`}
                      >
                        <span>{stageLabel}</span>
                        {isCompleted && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                      </div>
                      {idx < paymentPipelineStages.length - 1 && (
                        <div className="text-center text-slate-500 text-[10px] leading-none">
                          ↓
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={triggerPaymentSimulation}
                className="w-full py-3 px-4 text-xs font-mono font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap"
              >
                {isSimulatingPayment
                  ? 'Processing Contactless Exit...'
                  : `Simulate Walk-Out Payment (₹${cartTotal})`}
              </button>
            </div>
          </div>
        </section>

        {/* =====================================================================
            FINAL SECTION: THE STORE RUNS ITSELF (FULL 3D STORE OVERVIEW)
        ===================================================================== */}
        <section
          id="overview"
          data-station="overview"
          ref={(el) => {
            sectionRefs.current.overview = el;
          }}
          className="min-h-screen flex flex-col justify-between py-24 px-6 lg:px-16 max-w-[1440px] mx-auto"
        >
          <div className="my-auto pointer-events-auto max-w-4xl mx-auto text-center bg-[#0B0E16]/85 backdrop-blur-2xl border border-white/15 rounded-3xl p-8 sm:p-12 lg:p-16 space-y-8 shadow-2xl">
            <div className="text-xs font-mono text-amber-400 tracking-widest">
              COMPLETE AUTONOMOUS RETAIL ECOSYSTEM
            </div>

            <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08]">
              THE STORE DOESN&apos;T JUST SELL PRODUCTS.
              <span className="block text-amber-400 mt-2">IT MANAGES ITSELF.</span>
            </h2>

            {/* Core Lifecycle Sequence */}
            <div className="py-4 px-4 rounded-xl bg-white/[0.04] border border-white/10 font-mono text-xs sm:text-sm text-slate-200 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <span>REGISTER</span>
              <span className="text-amber-400">→</span>
              <span>DETECT</span>
              <span className="text-amber-400">→</span>
              <span>VERIFY</span>
              <span className="text-amber-400">→</span>
              <span>SHOP</span>
              <span className="text-amber-400">→</span>
              <span>PAY</span>
              <span className="text-amber-400">→</span>
              <span className="text-emerald-400 font-semibold">EXIT</span>
            </div>

            <p className="font-mono text-xs sm:text-sm tracking-wider text-cyan-300 font-semibold">
              AI + COMPUTER VISION + IoT + SMART INFRASTRUCTURE
            </p>

            {/* Interactive Camera Jump Controls for Evaluators */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => scrollToStation('hero')}
                className="px-5 py-2.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap"
              >
                Replay 3D Store Journey
              </button>
              <button
                type="button"
                onClick={() => setFreeLookEnabled((prev) => !prev)}
                className="px-5 py-2.5 text-xs font-medium text-white bg-white/10 hover:bg-white/15 border border-white/15 rounded-lg transition-colors whitespace-nowrap"
              >
                {freeLookEnabled ? 'Disable 3D Orbit Drag' : 'Enable 3D Free-Camera Orbit'}
              </button>
            </div>
          </div>

          {/* Quiet Engineering Project Attribution Footer */}
          <footer className="pointer-events-auto mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
            <div className="space-y-1">
              <p className="font-semibold text-slate-200">
                AI-Powered 24/7 Autonomous Cashierless Smart Store Using Computer Vision and IoT
              </p>
              <p>
                Computer Vision · Multi-Sensor Fusion · Smart Shelf Telemetry · Autonomous Facility
                Infrastructure
              </p>
            </div>
            <div className="sm:text-right space-y-1">
              <p className="font-semibold text-white">Harshan Seliyan B. S.</p>
              <p>Department of Information Technology · RMK Engineering College</p>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}
