import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Search, X, Loader2 } from 'lucide-react';

// Fix for default marker icon
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Location {
  lat: number;
  lng: number;
  name: string;
  description: string;
}

interface SearchResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  distance?: number;
}

function LocationMarker() {
  const [position, setPosition] = useState<LatLng | null>(null);
  const map = useMap();

  useEffect(() => {
    map.locate().on("locationfound", (e) => {
      setPosition(e.latlng);
      map.flyTo(e.latlng, 13);
    });
  }, [map]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>You are here!</Popup>
    </Marker>
  );
}

function MapController({ location }: { location: Location | null }) {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], 14, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }
  }, [location, map]);

  return null;
}

export default function Map() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  console.log(searchTimeout)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.error("Error getting location:", error);
      }
    );

    // Cleanup function to clear timeout on unmount
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);
  
  const searchLocation = useCallback(async (query: string) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      setSearchTimeout(null);
    }
  
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
  
    setIsSearching(true);
  
    const fetchResults = async (url: string): Promise<SearchResult[]> => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch results");
      return res.json();
    };
  
    try {
      let data: SearchResult[] = [];
  
      // Try local bounded search if userLocation is available
      if (userLocation) {
        const radius = 0.2; // About ~20km search radius
        const boundingBox = {
          north: userLocation.lat + radius,
          south: userLocation.lat - radius,
          east: userLocation.lng + radius,
          west: userLocation.lng - radius
        };
  
        const localSearchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=20&viewbox=${boundingBox.west},${boundingBox.north},${boundingBox.east},${boundingBox.south}&bounded=1`;
  
        data = await fetchResults(localSearchUrl);
      }
  
      // If there is no local results found, try global fallback
      if (!data.length) {
        const globalSearchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=20`;
        data = await fetchResults(globalSearchUrl);
      }
  
      // 3️⃣ If user location available, add and sort by distance
      if (userLocation) {
        data.forEach(result => {
          result.distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            parseFloat(result.lat),
            parseFloat(result.lon)
          );
        });
  
        data.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
      }
  
      setSearchResults(data.slice(0, 10));
    } catch (error) {
      console.error("Error searching location:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [userLocation, searchTimeout, calculateDistance]);
  

  const handleSearchInput = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const newTimeout = setTimeout(() => {
      searchLocation(query);
    }, 500);

    setSearchTimeout(newTimeout);
  }, [searchLocation, searchTimeout]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      setSearchTimeout(null);
    }

    setTimeout(() => {
      setSearchResults([]);
    }, 150);
  }, [searchTimeout]);

  const selectLocation = useCallback((result: SearchResult) => {
    const newLocation: Location = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      name: result.display_name,
      description: `Type: ${result.type}${result.distance ? ` • Distance: ${result.distance.toFixed(1)}km` : ''}`,
    };
    setLocations(prevLocations => [...prevLocations, newLocation]);
    setSelectedLocation(newLocation);
    clearSearch();
  }, [clearSearch]);

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white p-4 shadow-md relative z-[1000]">
        <div className="flex items-center gap-4 max-w-2xl mx-auto">
          <div className="flex-1 relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for a location (minimum 3 characters)..."
                className="w-full px-4 py-2 border rounded-lg pr-10"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              )}
            </div>
            
            {searchResults.length > 0 && (
              <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-[1001]">
                {searchResults.map((result) => (
                  <button
                    key={result.place_id}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => selectLocation(result)}
                  >
                    <MapPin size={16} className="text-blue-500 flex-shrink-0" />
                    <div className="truncate">
                      <div className="font-medium">{result.display_name.split(',')[0]}</div>
                      <div className="text-sm text-gray-500 truncate">
                        {result.distance && `${result.distance.toFixed(1)}km • `}
                        {result.display_name.split(',').slice(1).join(',')}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => searchLocation(searchQuery)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSearching || searchQuery.length < 3}
          >
            {isSearching ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Search size={20} />
            )}
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      <div className="flex-1 relative z-0">
        <MapContainer
          center={userLocation ? [userLocation.lat, userLocation.lng] : [51.505, -0.09]}
          zoom={13}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />
          <MapController location={selectedLocation} />
          
          {locations.map((location, index) => (
            <Marker
              key={`${location.lat}-${location.lng}-${index}`}
              position={[location.lat, location.lng]}
              eventHandlers={{
                click: () => setSelectedLocation(location),
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-lg">{location.name}</h3>
                  <p className="text-sm text-gray-600">{location.description}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {selectedLocation && (
          <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-sm z-[999]">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Navigation size={20} className="text-blue-500" />
              Selected Location
            </h3>
            <p className="text-sm text-gray-600 mt-2">{selectedLocation.name}</p>
            <button
              onClick={() => setSelectedLocation(null)}
              className="mt-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}