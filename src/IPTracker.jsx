import React, { useEffect, useRef, useState } from "react";
import bgPattern from "./images/pattern-bg-desktop.png";
import searchIcon from "./images/icon-arrow.svg";
import locationIcon from "./images/icon-location.svg"; // used for custom marker
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const API_KEY = import.meta.env.VITE_IPIFY_API_KEY;
const API_URL = import.meta.env.VITE_IPIFY_API_URL;

const IPTracker = () => {
  const [ipData, setIpData] = useState(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState(false);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  const customIcon = new L.Icon({
    iconUrl: locationIcon,
    iconSize: [40, 50], // adjust for your SVG size
    iconAnchor: [20, 50],
  });

  const fetchIpData = async (input) => {
    try {
      setError(false);
      const ipPattern = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
      const param = ipPattern.test(input) ? "ipAddress" : "domain";

      const response = await fetch(`${API_URL}${API_KEY}&${param}=${input}`);
      if (!response.ok) throw new Error("Invalid input");

      const data = await response.json();

      const transformed = {
        ip: data.ip,
        isp: data.isp,
        location: {
          region: data.location.region,
          city: data.location.city,
          timezone: data.location.timezone,
          lat: data.location.lat,
          lng: data.location.lng,
        },
      };

      setIpData(transformed);
      updateMap(transformed.location.lat, transformed.location.lng);
      setQuery("");
    } catch (err) {
      console.error(err);
      setError(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError(true);
      return;
    }
    fetchIpData(query);
  };

  const updateMap = (lat, lng) => {
    if (!mapInstance.current) return;

    mapInstance.current.setView([lat, lng], 13, {
      animate: true,
      pan: { duration: 1 },
    });

    // Clear existing markers
    mapInstance.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapInstance.current.removeLayer(layer);
      }
    });

    // Add custom marker
    L.marker([lat, lng], { icon: customIcon }).addTo(mapInstance.current);
  };

  useEffect(() => {
    if (mapRef.current && mapRef.current._leaflet_id != null) {
      mapRef.current._leaflet_id = null;
    }

    mapInstance.current = L.map(mapRef.current, {
      dragging: false,
      doubleClickZoom: false,
      scrollWheelZoom: false,
      zoomControl: false,
    }).setView([0, 0], 13);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapInstance.current);
  }, []);

  useEffect(() => {
    const fetchInitialIp = async () => {
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      fetchIpData(data.ip);
    };
    fetchInitialIp();
  }, []);

  return (
    <main className="font-[Roboto,sans-serif] h-screen overflow-hidden">
      {/* Header Section */}
      <section
        className="relative h-2/6 bg-cover bg-center flex flex-col items-center pt-8 px-4"
        style={{ backgroundImage: `url(${bgPattern})` }}
      >
        <h1 className="text-white text-2xl lg:text-3xl font-medium mb-4">
          IP Address Tracker
        </h1>

        {/* Search */}
        <form onSubmit={handleSubmit} className="relative w-full max-w-lg">
          <input
            type="text"
            placeholder="Search for any IP address or domain"
            className={`w-full px-6 py-4 rounded-xl text-lg outline-none text-gray-800 bg-white border ${
              error ? "border-2 border-red-500" : "border border-transparent"
            }`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <button
            type="submit"
            className="absolute right-0 top-0 h-full px-5 bg-black hover:bg-gray-900 rounded-r-xl"
          >
            <img src={searchIcon} alt="Search" />
          </button>
          {error && (
            <p className="text-red-500 text-sm italic mt-1 absolute right-0 -bottom-5">
              Invalid input
            </p>
          )}
        </form>

        {/* Details */}
        {ipData && (
          <div className="relative z-10 mt-6 w-full max-w-7xl bg-white rounded-3xl shadow-xl grid lg:grid-cols-4 gap-6 px-6 py-8 text-center lg:text-left">
            <div className="flex flex-col lg:border-r border-gray-400">
              <h4 className="text-gray-500 text-sm font-bold mb-2 tracking-wider">
                IP ADDRESS
              </h4>
              <span className="text-gray-900 text-xl lg:text-2xl font-bold break-words">
                {ipData.ip}
              </span>
            </div>

            <div className="flex flex-col lg:border-r border-gray-400">
              <h4 className="text-gray-500 text-sm font-bold mb-2 tracking-wider">
                LOCATION
              </h4>
              <span className="text-gray-900 text-xl lg:text-2xl font-bold break-words">
                {ipData.location.city}, {ipData.location.region}
              </span>
            </div>

            <div className="flex flex-col lg:border-r border-gray-400">
              <h4 className="text-gray-500 text-sm font-bold mb-2 tracking-wider">
                TIMEZONE
              </h4>
              <span className="text-gray-900 text-xl lg:text-2xl font-bold">
                UTC{ipData.location.timezone}
              </span>
            </div>

            <div className="flex flex-col">
              <h4 className="text-gray-500 text-sm font-bold mb-2 tracking-wider">
                ISP
              </h4>
              <span className="text-gray-900 text-xl lg:text-2xl font-bold break-words">
                {ipData.isp}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Map Section */}
      <section className="h-4/6 relative bg-gray-500">
        <div ref={mapRef} className="h-full w-full z-0" />
      </section>
    </main>
  );
};

export default IPTracker;
