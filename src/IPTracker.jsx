import L from "leaflet";
import "leaflet/dist/leaflet.css";
import * as React from "react";
import searchIcon from "./images/icon-arrow.svg";
import locationIcon from "./images/icon-location.svg";
import bgPattern from "./images/pattern-bg-desktop.png";

const API_KEY = import.meta.env.VITE_IPIFY_API_KEY;
const API_URL = import.meta.env.VITE_IPIFY_API_URL;
const IPV4_REGEX = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
const IPV6_REGEX = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|:([0-9a-fA-F]{1,4}:){1,7}|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4})$/;
const DOMAIN_REGEX = /^(?=.{1,253}$)(?!-)(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,63}$/;

const normalizeIpifyPayload = (payload) => ({
  ip: payload.ip,
  isp: payload.isp,
  location: {
    region: payload.location.region,
    city: payload.location.city,
    timezone: payload.location.timezone,
    lat: payload.location.lat,
    lng: payload.location.lng,
  },
});

const normalizeSearchInput = (value) => {
  const trimmed = value.trim();
  const withoutProtocol = trimmed.replace(/^[a-zA-Z][a-zA-Z\d+.-]*:\/\//, "");
  const withoutPath = withoutProtocol.replace(/[/?#].*$/, "");
  const withoutPort = withoutPath.replace(/:\d+$/, "");
  return withoutPort;
};

const expandBareDomain = (input) => {
  if (input.includes(".")) return input;
  if (/^[a-zA-Z][a-zA-Z0-9-]{1,62}$/.test(input)) {
    return `${input}.com`;
  }
  return input;
};

const getQueryParam = (input) =>
  IPV4_REGEX.test(input) || IPV6_REGEX.test(input) ? "ipAddress" : "domain";

const isValidInput = (input) =>
  IPV4_REGEX.test(input) || IPV6_REGEX.test(input) || DOMAIN_REGEX.test(input);

const extractApiErrorMessage = async (response) => {
  try {
    const payload = await response.json();
    if (typeof payload?.messages === "string") return payload.messages;
    if (Array.isArray(payload?.messages) && payload.messages.length > 0) {
      return payload.messages.join(", ");
    }
  } catch {}
  return "Lookup request failed. Please try again.";
};

const IPTracker = () => {
  const [ipData, setIpData] = React.useState(null);
  const [query, setQuery] = React.useState("");
  const [error, setError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("Invalid input");
  const mapRef = React.useRef(null);
  const mapInstance = React.useRef(null);
  const markerRef = React.useRef(null);

  const customIcon = new L.Icon({
    iconUrl: locationIcon,
    iconSize: [40, 50],
    iconAnchor: [20, 50],
  });

  const updateMap = (lat, lng) => {
    if (!mapInstance.current) return;

    mapInstance.current.setView([lat, lng], 13, {
      animate: true,
      pan: { duration: 1 },
    });

    if (markerRef.current) {
      markerRef.current.remove();
    }

    markerRef.current = L.marker([lat, lng], { icon: customIcon }).addTo(
      mapInstance.current,
    );
  };

  const requestIpData = async (value) => {
    const normalizedValue = expandBareDomain(normalizeSearchInput(value));

    if (!normalizedValue || !isValidInput(normalizedValue)) {
      throw new Error("Please enter a valid IP address or domain.");
    }

    const queryParam = getQueryParam(normalizedValue);
    if (!API_URL || !API_KEY) {
      throw new Error("API is not configured. Update .env and restart the server.");
    }

    const ipifyUrl = `${API_URL}${API_KEY}&${queryParam}=${encodeURIComponent(normalizedValue)}`;
    let ipifyResponse;
    try {
      ipifyResponse = await fetch(ipifyUrl);
    } catch {
      throw new Error("Network error. Check your internet connection.");
    }

    if (!ipifyResponse.ok) {
      throw new Error(await extractApiErrorMessage(ipifyResponse));
    }

    const ipifyPayload = await ipifyResponse.json();
    if (!ipifyPayload.ip || !ipifyPayload.location) {
      throw new Error("Received invalid data from IP service.");
    }

    return normalizeIpifyPayload(ipifyPayload);
  };

  const requestCurrentIpData = async () => {
    let ipResponse;
    try {
      ipResponse = await fetch("https://api.ipify.org?format=json");
    } catch {
      throw new Error("Network error. Check your internet connection.");
    }

    if (!ipResponse.ok) {
      throw new Error("Could not detect current IP.");
    }

    const ipPayload = await ipResponse.json();
    if (!ipPayload.ip) {
      throw new Error("Could not detect current IP.");
    }

    return requestIpData(ipPayload.ip);
  };

  const loadIpData = async (value, shouldResetInput = false) => {
    try {
      setError(false);
      setErrorMessage("");
      const nextData = await requestIpData(value);
      setIpData(nextData);
      updateMap(nextData.location.lat, nextData.location.lng);
      if (shouldResetInput) setQuery("");
    } catch (err) {
      setErrorMessage(err.message || "Something went wrong. Please try again.");
      setError(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setErrorMessage("Please enter an IP address or domain.");
      setError(true);
      return;
    }

    loadIpData(trimmedQuery, true);
  };

  React.useEffect(() => {
    if (!mapRef.current || mapInstance.current) {
      return;
    }

    if (mapRef.current._leaflet_id != null) {
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

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      markerRef.current = null;
    };
  }, []);

  React.useEffect(() => {
    const init = async () => {
      try {
        const currentData = await requestCurrentIpData();
        setIpData(currentData);
        updateMap(currentData.location.lat, currentData.location.lng);
      } catch {}
    };

    init();
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
            onChange={(e) => {
              setQuery(e.target.value);
              if (error) {
                setError(false);
                setErrorMessage("");
              }
            }}
          />

          <button
            type="submit"
            className="absolute right-0 top-0 h-full px-5 bg-black hover:bg-gray-900 rounded-r-xl"
          >
            <img src={searchIcon} alt="Search" />
          </button>
          {error && (
            <p className="text-red-500 text-sm italic mt-1 absolute right-0 -bottom-5">
              {errorMessage}
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
