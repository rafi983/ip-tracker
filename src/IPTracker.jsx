import React, { useEffect, useRef, useState } from "react";
import bgPattern from "./images/pattern-bg-desktop.png";
import searchIcon from "./images/icon-arrow.svg";
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
          postalCode: data.location.postalCode,
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

    L.marker([lat, lng]).addTo(mapInstance.current);
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
    <main className="h-screen font-[Rubik] overflow-hidden">
      <section
        className="relative h-2/6 bg-cover flex justify-center pt-8"
        style={{ backgroundImage: `url(${bgPattern})` }}
      >
        <div className="text-center flex flex-col lg:gap-8 gap-2 -mt-3 lg:mt-0 w-4/5 lg:w-fit">
          <h1 className="text-white lg:text-3xl text-2xl font-medium">
            IP Address Tracker
          </h1>

          <form
            onSubmit={handleSubmit}
            className="relative w-full overflow-hidden"
          >
            <p
              className={`absolute bottom-0 right-20 text-sm italic text-red-500 ${
                error ? "" : "hidden"
              }`}
            >
              Invalid input
            </p>
            <input
              type="text"
              placeholder="Search for any IP address or domain"
              className={`px-6 py-4 w-full lg:w-[36rem] rounded-xl text-lg outline-none text-[#2b2b2b] ${
                error ? "border-2 border-red-500" : ""
              }`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-0 py-4 px-6 bg-black hover:bg-[#2b2b2b] duration-200 rounded-r-xl"
            >
              <img src={searchIcon} alt="Search" />
            </button>
          </form>
        </div>

        {ipData && (
          <div className="absolute z-10 -bottom-0 lg:translate-y-1/2 translate-y-2/3 lg:p-8 p-6 w-5/6 max-w-[80rem] rounded-3xl shadow-xl bg-white grid lg:grid-cols-4 text-center lg:text-left lg:gap-4 gap-2">
            <div className="lg:border-r border-[#737373] flex flex-col">
              <h4 className="text-[#737373] tracking-wider text-sm font-bold lg:mb-2">
                IP ADDRESS
              </h4>
              <span className="text-[#2b2b2b] lg:text-3xl text-xl font-bold whitespace-normal">
                {ipData.ip}
              </span>
            </div>

            <div className="lg:border-r border-[#737373] flex flex-col">
              <h4 className="text-[#737373] tracking-wider text-sm font-bold lg:mb-2">
                LOCATION
              </h4>
              <span className="text-[#2b2b2b] lg:text-3xl text-xl font-bold">
                {ipData.location.city}, {ipData.location.region}
              </span>
            </div>

            <div className="lg:border-r border-[#737373] flex flex-col">
              <h4 className="text-[#737373] tracking-wider text-sm font-bold lg:mb-2">
                TIMEZONE
              </h4>
              <span className="text-[#2b2b2b] lg:text-3xl text-xl font-bold">
                UTC{ipData.location.timezone}
              </span>
            </div>

            <div className="flex flex-col">
              <h4 className="text-[#737373] tracking-wider text-sm font-bold lg:mb-2">
                ISP
              </h4>
              <span className="text-[#2b2b2b] lg:text-3xl text-xl font-bold">
                {ipData.isp}
              </span>
            </div>
          </div>
        )}
      </section>

      <section className="h-4/6 bg-[#737373] relative">
        <img
          className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
          src="images/icon-location.svg"
          alt="location marker"
        />
        <div ref={mapRef} className="h-full w-full z-0"></div>
      </section>
    </main>
  );
};

export default IPTracker;
