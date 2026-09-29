import React from 'react';
import { Eye, Navigation } from 'lucide-react';

interface LiveStoreStatusHUDProps {
  activeStation: string;
  robotMode: 'CLEANING' | 'DOCKED' | 'LOW_TRAFFIC_PATROL';
  hvacTemp: number;
  solarActive: boolean;
  xrayMode: boolean;
  onToggleXray: () => void;
  freeLookEnabled: boolean;
  onToggleFreeLook: () => void;
  cartCount: number;
  cartTotal: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const LiveStoreStatusHUD: React.FC<LiveStoreStatusHUDProps> = ({
  robotMode,
  hvacTemp,
  solarActive,
  xrayMode,
  onToggleXray,
  freeLookEnabled,
  onToggleFreeLook,
  cartCount,
  cartTotal,
  isExpanded,
  onToggleExpand,
}) => {
  const telemetryItems = [
    { label: 'STORE STATUS', value: 'ONLINE', stateColor: 'text-emerald-400' },
    { label: 'CUSTOMERS', value: '12', stateColor: 'text-slate-100' },
    { label: 'ACTIVE CAMERAS', value: '24', stateColor: 'text-cyan-400' },
    { label: 'SMART SHELVES', value: '18', stateColor: 'text-slate-100' },
    {
      label: 'ROBOT',
      value: robotMode === 'DOCKED' ? 'DOCKED' : 'CLEANING',
      stateColor: robotMode === 'DOCKED' ? 'text-amber-400' : 'text-emerald-400',
    },
    { label: 'HVAC', value: `AUTO · ${hvacTemp}°C`, stateColor: 'text-cyan-300' },
    {
      label: 'SOLAR',
      value: solarActive ? 'ACTIVE' : 'STANDBY',
      stateColor: solarActive ? 'text-amber-400' : 'text-slate-400',
    },
    { label: 'INVENTORY', value: 'MONITORING', stateColor: 'text-emerald-400' },
  ];

  return (
    <aside
      aria-label="Live Store Simulation Telemetry"
      className="fixed bottom-4 right-4 z-30 hidden lg:block w-80 bg-[#0B0D13]/80 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl transition-transform duration-200"
    >
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <p className="text-xs font-medium tracking-wider text-slate-400">
            LIVE STORE STATUS
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Simulated store telemetry · Virtual Cart: {cartCount} items (₹{cartTotal})
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleExpand}
          className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-colors whitespace-nowrap"
        >
          {isExpanded ? 'Minimize' : 'Expand'}
        </button>
      </div>

      {isExpanded && (
        <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 py-3 border-b border-white/10 font-mono">
            {telemetryItems.map((item) => (
              <div key={item.label} className="flex flex-col">
                <span className="text-[10px] text-slate-400 tracking-wide">
                  {item.label}
                </span>
                <span className={`text-xs font-semibold tabular-nums ${item.stateColor}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleXray}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                xrayMode
                  ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5 shrink-0" />
              <span>{xrayMode ? 'X-Ray Cutaway: ON' : '3D X-Ray View'}</span>
            </button>

            <button
              type="button"
              onClick={onToggleFreeLook}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                freeLookEnabled
                  ? 'bg-amber-500/20 border-amber-400/50 text-amber-200'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 shrink-0" />
              <span>{freeLookEnabled ? 'Orbit Drag: ON' : '3D Orbit Drag'}</span>
            </button>
          </div>
        </>
      )}
    </aside>
  );
};
