"use client";

import React, { useState, useEffect, useRef } from "react";
import { TimelineItem } from "@/lib/api";

interface GoogleEarthViewerProps {
  coordinates: [number, number][]; // [lng, lat]
  timeline?: TimelineItem[];
  estimatedConstructionYear?: number | null;
  estimatedLastChangeYear?: number | null;
}

export default function GoogleEarthViewer({
  coordinates,
  timeline = [],
  estimatedConstructionYear,
  estimatedLastChangeYear,
}: GoogleEarthViewerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);
  const [mapLayer, setMapLayer] = useState<"satellite" | "hybrid">("satellite");
  const [copiedPoint, setCopiedPoint] = useState<number | null>(null);

  // Center coordinate [lng, lat]
  const centerCoord = React.useMemo(() => {
    const lngs = coordinates.map((c) => c[0]);
    const lats = coordinates.map((c) => c[1]);
    return [
      (Math.min(...lngs) + Math.max(...lngs)) / 2,
      (Math.min(...lats) + Math.max(...lats)) / 2,
    ] as [number, number];
  }, [coordinates]);

  const centerLat = centerCoord[1];
  const centerLng = centerCoord[0];

  const googleEarthUrl = `https://earth.google.com/web/search/${centerLat},+${centerLng}`;
  const googleMapsSatelliteUrl = `https://www.google.com/maps/place/${centerLat},${centerLng}/@${centerLat},${centerLng},20z/data=!3m1!1e3`;

  // Download KML file with polygon & pins for Google Earth
  const downloadKml = () => {
    const kmlCoordinates = coordinates
      .map(([lng, lat]) => `${lng},${lat},0`)
      .concat([`${coordinates[0][0]},${coordinates[0][1]},0`])
      .join(" ");

    const placemarks = coordinates
      .map(
        ([lng, lat], idx) => `
    <Placemark>
      <name>📍 النقطة ${idx + 1} (P${idx + 1})</name>
      <description>خط العرض: ${lat}&#10;خط الطول: ${lng}</description>
      <Point>
        <coordinates>${lng},${lat},0</coordinates>
      </Point>
    </Placemark>`
      )
      .join("");

    const kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>موقع المبنى والـ 4 نقاط</name>
    <description>تحليل تاريخ المبنى عبر الاستشعار عن بعد وGoogle Earth</description>
    <Style id="polyStyle">
      <LineStyle>
        <color>ff00d7ff</color>
        <width>3.5</width>
      </LineStyle>
      <PolyStyle>
        <color>6600d7ff</color>
      </PolyStyle>
    </Style>
    <Placemark>
      <name>محيط المبنى (4 أركان)</name>
      <styleUrl>#polyStyle</styleUrl>
      <Polygon>
        <tessellate>1</tessellate>
        <altitudeMode>clampToGround</altitudeMode>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>${kmlCoordinates}</coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
    ${placemarks}
    <Placemark>
      <name>🎯 مركز المبنى</name>
      <description>سنة البناء التقديرية: ${estimatedConstructionYear || "غير محدد"}</description>
      <Point>
        <coordinates>${centerLng},${centerLat},0</coordinates>
      </Point>
    </Placemark>
  </Document>
</kml>`;

    const blob = new Blob([kmlContent], {
      type: "application/vnd.google-earth.kml+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `building_pins_${centerLat.toFixed(5)}_${centerLng.toFixed(5)}.kml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Initialize and manage Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;
    let tileLayerInstance: any = null;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Cleanup existing instance if any
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 20,
        maxZoom: 22,
        zoomControl: false,
        attributionControl: false,
      });

      // Google Satellite Pure or Hybrid Tile URLs
      const tileUrl =
        mapLayer === "hybrid"
          ? "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
          : "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}";

      tileLayerInstance = L.tileLayer(tileUrl, {
        maxZoom: 22,
        maxNativeZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
      }).addTo(map);

      // Polygon connecting the 4 points
      const latLngs = coordinates.map(
        ([lng, lat]) => [lat, lng] as [number, number]
      );

      const polygonLayer = L.polygon(latLngs, {
        color: "#fbbf24",
        weight: 3.5,
        fillColor: "#f59e0b",
        fillOpacity: 0.35,
        dashArray: "6, 6",
      }).addTo(map);

      // Numbered Point Pins P1..P4
      markersRef.current = [];

      coordinates.forEach(([lng, lat], idx) => {
        const customIcon = L.divIcon({
          className: "ge-pin-wrapper",
          html: `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
              <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #ffffff; width: 30px; height: 30px; border-radius: 50%; border: 2.5px solid #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; font-family: system-ui, sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.6);">
                P${idx + 1}
              </div>
              <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #d97706; margin-top: -2px;"></div>
            </div>
          `,
          iconSize: [30, 38],
          iconAnchor: [15, 38],
          popupAnchor: [0, -38],
        });

        const pointMapsUrl = `https://www.google.com/maps/place/${lat},${lng}/@${lat},${lng},20z/data=!3m1!1e3`;
        const pointEarthUrl = `https://earth.google.com/web/search/${lat},+${lng}`;

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(`
          <div style="direction: rtl; text-align: right; font-family: system-ui, sans-serif; min-width: 180px; padding: 4px;">
            <div style="font-weight: 800; color: #0f172a; font-size: 13px; margin-bottom: 4px;">
              📍 النقطة ${idx + 1} (P${idx + 1})
            </div>
            <div style="font-size: 11px; font-family: monospace; color: #475569; margin-bottom: 8px; line-height: 1.6;">
              <div>العرض: <b>${lat}</b></div>
              <div>الطول: <b>${lng}</b></div>
            </div>
            <div style="display: flex; gap: 6px; border-top: 1px solid #e2e8f0; padding-top: 6px;">
              <a href="${pointEarthUrl}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; font-size: 10px; background: #2563eb; color: white; padding: 4px 6px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                📍 دبابيس Earth
              </a>
              <a href="${pointMapsUrl}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; font-size: 10px; background: #059669; color: white; padding: 4px 6px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                🗺️ Maps
              </a>
            </div>
          </div>
        `);

        marker.on("click", () => setActivePointIndex(idx));
        markersRef.current.push(marker);
      });

      // Center marker
      const centerIcon = L.divIcon({
        className: "ge-center-pin",
        html: `
          <div style="width: 16px; height: 16px; border-radius: 50%; background: #ffffff; border: 3px solid #ef4444; box-shadow: 0 0 10px rgba(239,68,68,0.9);"></div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      L.marker([centerLat, centerLng], { icon: centerIcon })
        .addTo(map)
        .bindPopup(`
          <div style="direction: rtl; text-align: right; font-family: system-ui, sans-serif; font-size: 11px;">
            <b>مركز مساحة المبنى</b><br/>
            ${centerLat.toFixed(6)}, ${centerLng.toFixed(6)}
          </div>
        `);

      // Invalidate size after rendering and fit bounds with high zoom
      const fitAndRefresh = () => {
        if (!map) return;
        map.invalidateSize();
        map.fitBounds(polygonLayer.getBounds(), { padding: [30, 30], maxZoom: 20 });
      };

      fitAndRefresh();
      const timer1 = setTimeout(fitAndRefresh, 150);
      const timer2 = setTimeout(fitAndRefresh, 450);

      window.addEventListener("resize", fitAndRefresh);
      leafletMapRef.current = map;

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        window.removeEventListener("resize", fitAndRefresh);
      };
    });

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [coordinates, centerLat, centerLng, mapLayer]);

  const zoomIn = () => {
    if (leafletMapRef.current) leafletMapRef.current.zoomIn();
  };

  const zoomOut = () => {
    if (leafletMapRef.current) leafletMapRef.current.zoomOut();
  };

  const focusPoint = (idx: number) => {
    setActivePointIndex(idx);
    const coord = coordinates[idx];
    if (coord && leafletMapRef.current) {
      leafletMapRef.current.flyTo([coord[1], coord[0]], 20);
      if (markersRef.current[idx]) {
        markersRef.current[idx].openPopup();
      }
    }
  };

  const copyPointCoordinates = (idx: number, lng: number, lat: number) => {
    navigator.clipboard.writeText(`${lat}, ${lng}`);
    setCopiedPoint(idx);
    setTimeout(() => setCopiedPoint(null), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 rounded-3xl bg-[#111216] text-white border border-[#262832] shadow-2xl overflow-hidden relative select-none animate-fade-in print:rounded-2xl print:m-0 print:shadow-none print-avoid-break print:border-2 print:border-black print:bg-white print:text-black">
      {/* Header Bar */}
      <div className="p-4 md:p-5 border-b border-[#262832] bg-[#1a1b22] flex flex-col md:flex-row md:items-center justify-between gap-4 print:bg-white print:border-b-2 print:border-black print:p-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl print:text-2xl">🌍</span>
            <h2 className="text-lg font-bold text-white tracking-tight print:text-base print:font-black print:text-black">
              معاينة Google Earth المباشرة للأركان الـ 4
            </h2>
          </div>
          <p className="text-xs text-neutral-400 print:text-xs print:font-bold print:text-neutral-900">
            صور الأقمار الصناعية البصرية الطبيعية عالية الدقة مع دبابيس ومحيط الموقع
          </p>
        </div>

        {/* Action Launchers */}
        <div className="flex items-center flex-wrap gap-2.5 no-print">
          <button
            type="button"
            onClick={downloadKml}
            title="تحميل ملف KML لفتح الـ 4 نقاط مع الدبابيس والمضلع مباشرة في Google Earth"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/30 transition-all duration-200 cursor-pointer"
          >
            <span>📌</span>
            <span>تحميل دبابيس (KML)</span>
          </button>

          <a
            href={googleEarthUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="فتح الموقع مع الدبوس في Google Earth"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all duration-200"
          >
            <span>📍</span>
            <span>Google Earth مع الدبوس</span>
            <svg
              className="w-3.5 h-3.5 opacity-80"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>

          <a
            href={googleMapsSatelliteUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="فتح الموقع مع الدبوس في Google Maps Satellite"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all duration-200"
          >
            <span>🗺️</span>
            <span>Google Maps Satellite (مع دبوس)</span>
            <svg
              className="w-3.5 h-3.5 opacity-80"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </div>

      {/* Layer Switcher Bar */}
      <div className="bg-[#14151a] px-4 py-2.5 border-b border-[#262832] flex items-center justify-between text-xs print:bg-neutral-100 print:border-b-2 print:border-black print:text-black print:px-3 print:py-1.5">
        <div className="flex items-center gap-2">
          <span className="text-neutral-400 print:text-black print:font-bold print:text-xs">نمط الخريطة:</span>
          <span className="hidden print:inline text-black font-black print:text-xs">
            {mapLayer === "hybrid" ? "فضائي مع التسميات (Hybrid)" : "فضائي نقي (Google Earth)"}
          </span>
          <div className="inline-flex rounded-lg bg-[#1e1f26] p-0.5 border border-neutral-700 no-print">
            <button
              type="button"
              onClick={() => setMapLayer("satellite")}
              className={`px-3 py-1 rounded-md font-bold transition-all ${
                mapLayer === "satellite"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-neutral-300 hover:text-white"
              }`}
            >
              فضائي نقي (Google Earth)
            </button>
            <button
              type="button"
              onClick={() => setMapLayer("hybrid")}
              className={`px-3 py-1 rounded-md font-bold transition-all ${
                mapLayer === "hybrid"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-neutral-300 hover:text-white"
              }`}
            >
              فضائي مع التسميات (Hybrid)
            </button>
          </div>
        </div>

        <div className="text-[11px] font-mono text-amber-400 print:text-black print:font-black print:text-xs">
          المركز: {centerLat.toFixed(5)}, {centerLng.toFixed(5)}
        </div>
      </div>

      {/* Map Viewport */}
      <div className="relative w-full h-[460px] md:h-[540px] print:h-[350px] bg-[#0b0c10]">
        {/* Leaflet Mount Container */}
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Zoom & Center Buttons (Bottom Left) */}
        <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-2 no-print">
          <div className="flex flex-col rounded-xl bg-[#1e1f26]/95 backdrop-blur-md border border-neutral-700 shadow-2xl overflow-hidden">
            <button
              type="button"
              onClick={zoomIn}
              title="تكبير"
              className="p-2.5 hover:bg-neutral-700 text-neutral-100 font-bold border-b border-neutral-700 text-sm w-10 h-10 flex items-center justify-center"
            >
              +
            </button>
            <button
              type="button"
              onClick={zoomOut}
              title="تصغير"
              className="p-2.5 hover:bg-neutral-700 text-neutral-100 font-bold text-sm w-10 h-10 flex items-center justify-center"
            >
              −
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (leafletMapRef.current) {
                leafletMapRef.current.flyTo([centerLat, centerLng], 20);
              }
            }}
            title="إعادة التركيز على مركز الـ 4 نقاط"
            className="w-10 h-10 rounded-xl bg-[#1e1f26]/95 backdrop-blur-md border border-neutral-700 shadow-2xl flex items-center justify-center text-amber-400 hover:bg-neutral-700 font-bold text-base"
          >
            🎯
          </button>
        </div>
      </div>

      {/* 4 Points Cards below map (Hidden in PDF print) */}
      <div className="p-4 md:p-6 bg-[#16171d] border-t border-[#262832] space-y-4 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 print:text-black print:font-black print:text-base">
            <span>📍</span>
            <span>دبابيس وإحداثيات أركان المبنى الـ 4:</span>
          </span>
          <span className="text-[11px] text-neutral-400 no-print">
            انقر على أي نقطة للتركيز عليها في الخريطة أو فتحها مباشرة
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 print:grid-cols-4 print:gap-3">
          {coordinates.map(([lng, lat], idx) => {
            const isHovered = activePointIndex === idx;
            const isCopied = copiedPoint === idx;
            const pointEarthLink = `https://earth.google.com/web/search/${lat},+${lng}`;
            const pointMapsLink = `https://www.google.com/maps/place/${lat},${lng}/@${lat},${lng},20z/data=!3m1!1e3`;

            return (
              <div
                key={idx}
                onClick={() => focusPoint(idx)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between print:p-3 print:rounded-xl print:border-2 print:border-black print:bg-white print:space-y-2 ${
                  isHovered
                    ? "bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/10 scale-[1.02]"
                    : "bg-[#1e1f28] border-[#2e3040] hover:border-neutral-600"
                }`}
              >
                <div className="flex items-center justify-between mb-2 print:mb-0 print:border-b print:border-neutral-300 print:pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-neutral-950 text-xs font-black print:bg-black print:text-white print:font-black print:text-xs print:px-2 print:py-0.5 print:rounded print:w-auto print:h-auto">
                      P{idx + 1}
                    </span>
                    <span className="text-xs font-bold text-neutral-200 print:text-black print:font-black print:text-sm">
                      النقطة {idx + 1}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyPointCoordinates(idx, lng, lat);
                    }}
                    title="نسخ الإحداثيات"
                    className="text-[10px] text-neutral-400 hover:text-white px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 no-print"
                  >
                    {isCopied ? "تم النسخ ✓" : "نسخ 📋"}
                  </button>
                </div>

                <div className="font-mono text-[11px] text-neutral-300 space-y-0.5 mb-3 print:mb-0 print:text-black print:space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="print:text-neutral-900 print:font-bold print:text-xs">العرض:</span>
                    <strong className="text-amber-300 print:text-black print:font-black print:text-sm">{lat}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="print:text-neutral-900 print:font-bold print:text-xs">الطول:</span>
                    <strong className="text-amber-300 print:text-black print:font-black print:text-sm">{lng}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-2 border-t border-neutral-700/60 no-print">
                  <a
                    href={pointEarthLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 text-center py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white text-[10px] font-bold transition-colors"
                  >
                    📍 دبابيس Earth
                  </a>
                  <a
                    href={pointMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 text-center py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[10px] font-bold transition-colors"
                  >
                    🗺️ Maps
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
