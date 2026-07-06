import React, { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import L from "leaflet";

// Fix default marker icon path issue with bundlers (not used here since we use CircleMarker, but safe to keep)
delete L.Icon.Default.prototype._getIconUrl;

const defaultCenter = [8.5241, 76.9366];

const CATEGORY_COLORS = {
  roads: "#e74c3c",
  schools: "#3498db",
  health: "#27ae60",
  sanitation: "#f39c12",
  livelihood: "#9b59b6",
  other: "#7f8c8d",
};

function LeafletMapPanel({ hotspots, wardMeta, height = 400, zoom = 12 }) {
  const markers = useMemo(() => {
    return hotspots.map((h) => {
      const meta = wardMeta[h.wardId];
      return {
        ...h,
        lat: h.latitude ?? meta?.lat ?? defaultCenter[0],
        lng: h.longitude ?? meta?.lng ?? defaultCenter[1],
        wardName: meta?.name ?? `Ward ${h.wardId}`,
      };
    });
  }, [hotspots, wardMeta]);

  const center = markers.length
    ? [markers[0].lat, markers[0].lng]
    : defaultCenter;

  return (
    <div style={{ borderRadius: 8, overflow: "hidden" }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: "100%", height }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m, i) => (
          <CircleMarker
            key={i}
            center={[m.lat, m.lng]}
            radius={8 + Math.min(m.count, 10) * 1.5}
            pathOptions={{
              color: "#fff",
              weight: 1,
              fillColor: CATEGORY_COLORS[m.category] || "#7f8c8d",
              fillOpacity: 0.85,
            }}
          >
            <Popup>
              <strong>{m.wardName}</strong>
              <br />
              {m.category} · {m.count} issue{m.count !== 1 ? "s" : ""}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

export default LeafletMapPanel;
