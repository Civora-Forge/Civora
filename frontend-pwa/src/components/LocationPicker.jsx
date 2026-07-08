import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Helper component to bind map events and center dynamically
function LocationMarker({ position, setPosition }) {
  const map = useMap();
  
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          setPosition(e.target.getLatLng());
        },
      }}
    />
  );
}

export function LocationPicker({ lat, lng, onChange }) {
  // 'initial' | 'gps' | 'map' | 'manual' | 'confirmed'
  const [method, setMethod] = useState('initial');
  
  // 'idle' | 'loading' | 'error' | 'success'
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Selected map position
  const [mapPosition, setMapPosition] = useState(lat && lng ? { lat, lng } : null);
  
  // Display data
  const [address, setAddress] = useState('');
  
  // Manual data
  const [manual, setManual] = useState({ landmark: '', area: '', pincode: '', ward: '' });

  // Update parent when confirmed
  const confirmLocation = (latitude, longitude, extraText = '') => {
    setMethod('confirmed');
    setStatus('success');
    onChange(latitude, longitude, extraText);
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      const data = await res.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
        return data.display_name;
      }
    } catch (err) {
      console.warn("Reverse geocode failed", err);
    }
    return '';
  };

  const useCurrentLocation = () => {
    setMethod('gps');
    setStatus('loading');
    setErrorMsg('');

    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setMapPosition({ lat: latitude, lng: longitude });
        const addr = await reverseGeocode(latitude, longitude);
        confirmLocation(latitude, longitude, addr);
      },
      (err) => {
        setStatus('error');
        setErrorMsg("We couldn't detect your location. Please check your permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const openMap = () => {
    setMethod('map');
    if (!mapPosition) {
      // Default to Kerala, India broadly if no location is set
      setMapPosition({ lat: 10.8505, lng: 76.2711 });
    }
  };

  const confirmMapSelection = async () => {
    if (!mapPosition) return;
    setStatus('loading');
    const addr = await reverseGeocode(mapPosition.lat, mapPosition.lng);
    confirmLocation(mapPosition.lat, mapPosition.lng, addr);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const parts = [manual.landmark, manual.area, manual.pincode, manual.ward ? `Ward: ${manual.ward}` : ''].filter(Boolean);
    const fullAddress = parts.join(', ');
    setAddress(fullAddress);
    // Since GPS failed, we send 0,0 but append address to text, as per original contract
    confirmLocation(0, 0, fullAddress);
  };

  if (method === 'confirmed') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="text-xl mt-0.5">📍</div>
          <div>
            <h4 className="font-semibold text-emerald-900 text-sm">Selected Location</h4>
            <p className="text-emerald-700 text-xs mt-1 leading-relaxed">
              {address || (lat !== 0 ? `Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}` : 'Manual Location Set')}
            </p>
            <button
              type="button"
              onClick={() => setMethod('initial')}
              className="text-emerald-600 font-medium text-xs mt-2 hover:underline"
            >
              Change Location
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {method === 'initial' && (
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={useCurrentLocation}
            className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-blue-100 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100 transition-colors text-center"
          >
            <span className="text-2xl">📍</span>
            <span className="font-semibold text-sm">Use Current Location</span>
            <span className="text-[10px] opacity-80">(Recommended)</span>
          </button>
          
          <button
            type="button"
            onClick={openMap}
            className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-700 hover:border-slate-200 hover:bg-slate-100 transition-colors text-center"
          >
            <span className="text-2xl">🗺️</span>
            <span className="font-semibold text-sm">Select on Map</span>
            <span className="text-[10px] opacity-80">Tap exactly where it is</span>
          </button>
        </div>
      )}

      {method === 'gps' && status === 'loading' && (
        <div className="flex items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-100 animate-pulse text-slate-500 text-sm font-medium">
          Detecting your location...
        </div>
      )}

      {method === 'gps' && status === 'error' && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
          <p className="text-rose-700 text-sm font-medium mb-3">{errorMsg}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={useCurrentLocation} className="px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold hover:bg-rose-200 transition">Try Again</button>
            <button type="button" onClick={openMap} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition">Select on Map</button>
            <button type="button" onClick={() => setMethod('manual')} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition">Enter Manually</button>
          </div>
        </div>
      )}

      {method === 'map' && (
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white flex flex-col h-[400px]">
          <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center text-sm">
            <span className="text-slate-600 font-medium">Drag map to position marker</span>
            <button type="button" onClick={() => setMethod('initial')} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
          </div>
          <div className="flex-1 w-full relative">
            <MapContainer center={[mapPosition.lat, mapPosition.lng]} zoom={14} style={{ width: '100%', height: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationMarker position={mapPosition} setPosition={setMapPosition} />
            </MapContainer>
          </div>
          <div className="p-3 bg-white border-t border-slate-200">
            <button
              type="button"
              onClick={confirmMapSelection}
              disabled={status === 'loading'}
              className="w-full py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {status === 'loading' ? 'Confirming...' : 'Confirm Location'}
            </button>
          </div>
        </div>
      )}

      {method === 'manual' && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-slate-800 text-sm">Enter Details Manually</h4>
            <button type="button" onClick={() => setMethod('initial')} className="text-slate-500 text-xs hover:underline">Back</button>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Landmark"
              value={manual.landmark}
              onChange={e => setManual({...manual, landmark: e.target.value})}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Area / Locality"
              value={manual.area}
              onChange={e => setManual({...manual, area: e.target.value})}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Pincode"
                value={manual.pincode}
                onChange={e => setManual({...manual, pincode: e.target.value})}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Ward (Optional)"
                value={manual.ward}
                onChange={e => setManual({...manual, ward: e.target.value})}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="button"
              onClick={handleManualSubmit}
              disabled={!manual.landmark && !manual.area}
              className="w-full py-2.5 mt-2 bg-slate-800 text-white font-semibold text-sm rounded-lg hover:bg-slate-900 transition disabled:opacity-50"
            >
              Set Location
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
