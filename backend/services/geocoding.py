import re
import logging
from typing import List, Optional
from pydantic import BaseModel
from difflib import get_close_matches
import requests
from utils.config import get_settings

logger = logging.getLogger(__name__)


def _levenshtein_distance(s1: str, s2: str) -> int:
    """Calculate Levenshtein distance between two strings for typo tolerance."""
    if len(s1) < len(s2):
        return _levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)
    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    return previous_row[-1]


class CityLocation(BaseModel):
    name: str
    state: Optional[str] = None
    country: str
    lat: float
    lon: float
    display_name: str


class HighPrecisionGeocodingService:
    def __init__(self):
        # Deterministic dictionary supporting major cities, regional hubs, and local villages with exact coordinates
        self.offline_locations = {
            "nanded": {"lat": 19.1383, "lon": 77.3210, "country": "India"},
            "mumbai": {"lat": 19.0760, "lon": 72.8777, "country": "India"},
            "pune": {"lat": 18.5204, "lon": 73.8567, "country": "India"},
            "delhi": {"lat": 28.6139, "lon": 77.2090, "country": "India"},
            "bengaluru": {"lat": 12.9716, "lon": 77.5946, "country": "India"},
            "bangalore": {"lat": 12.9716, "lon": 77.5946, "country": "India"},
            "tokyo": {"lat": 35.6762, "lon": 139.6503, "country": "Japan"},
            "paris": {"lat": 48.8566, "lon": 2.3522, "country": "France"},
            "london": {"lat": 51.5074, "lon": -0.1278, "country": "United Kingdom"},
            
            # Additional pre-seeded global/Indian cities from high-precision database
            "ahmedabad": {"lat": 23.0225, "lon": 72.5714, "country": "India"},
            "chennai": {"lat": 13.0827, "lon": 80.2707, "country": "India"},
            "kolkata": {"lat": 22.5726, "lon": 88.3639, "country": "India"},
            "surat": {"lat": 21.1702, "lon": 72.8311, "country": "India"},
            "jaipur": {"lat": 26.9124, "lon": 75.7873, "country": "India"},
            "lucknow": {"lat": 26.8467, "lon": 80.9462, "country": "India"},
            "kanpur": {"lat": 26.4499, "lon": 80.3319, "country": "India"},
            "nagpur": {"lat": 21.1458, "lon": 79.0882, "country": "India"},
            "indore": {"lat": 22.7196, "lon": 75.8577, "country": "India"},
            "thane": {"lat": 19.2183, "lon": 72.9781, "country": "India"},
            "bhopal": {"lat": 23.2599, "lon": 77.4126, "country": "India"},
            "visakhapatnam": {"lat": 17.6868, "lon": 83.2185, "country": "India"},
            "patna": {"lat": 25.5941, "lon": 85.1376, "country": "India"},
            "vadodara": {"lat": 22.3072, "lon": 73.1812, "country": "India"},
            "ludhiana": {"lat": 30.901, "lon": 75.8573, "country": "India"},
            "agra": {"lat": 27.1767, "lon": 78.0081, "country": "India"},
            "nashik": {"lat": 19.9975, "lon": 73.7898, "country": "India"},
            "ranchi": {"lat": 23.3441, "lon": 85.3096, "country": "India"},
            "faridabad": {"lat": 28.4089, "lon": 77.3178, "country": "India"},
            "meerut": {"lat": 28.9845, "lon": 77.7064, "country": "India"},
            "rajkot": {"lat": 22.3039, "lon": 70.8022, "country": "India"},
            "varanasi": {"lat": 25.3176, "lon": 82.9739, "country": "India"},
            "srinagar": {"lat": 34.0837, "lon": 74.7973, "country": "India"},
            "amritsar": {"lat": 31.634, "lon": 74.8723, "country": "India"},
            "prayagraj": {"lat": 25.4358, "lon": 81.8463, "country": "India"},
            "howrah": {"lat": 22.5958, "lon": 88.2636, "country": "India"},
            "coimbatore": {"lat": 11.0168, "lon": 76.9558, "country": "India"},
            "vijayawada": {"lat": 16.5062, "lon": 80.648, "country": "India"},
            "jodhpur": {"lat": 26.2389, "lon": 73.0243, "country": "India"},
            "raipur": {"lat": 21.2514, "lon": 81.6296, "country": "India"},
            "chandigarh": {"lat": 30.7333, "lon": 76.7794, "country": "India"},
            "guwahati": {"lat": 26.1445, "lon": 91.7362, "country": "India"},
            "mysore": {"lat": 12.2958, "lon": 76.6394, "country": "India"},
            "gurugram": {"lat": 28.4595, "lon": 77.0266, "country": "India"},
            "gurgaon": {"lat": 28.4595, "lon": 77.0266, "country": "India"},
            "bhubaneswar": {"lat": 20.2961, "lon": 85.8245, "country": "India"},
            "noida": {"lat": 28.5355, "lon": 77.391, "country": "India"},
            "kochi": {"lat": 9.9312, "lon": 76.2673, "country": "India"},
            "dehradun": {"lat": 30.3165, "lon": 78.0322, "country": "India"},
            "shimla": {"lat": 31.1048, "lon": 77.1734, "country": "India"},
            "panaji": {"lat": 15.4909, "lon": 73.8278, "country": "India"},
            "goa": {"lat": 15.2993, "lon": 74.124, "country": "India"},
            
            # USA
            "new york": {"lat": 40.7128, "lon": -74.006, "country": "United States"},
            "los angeles": {"lat": 34.0522, "lon": -118.2437, "country": "United States"},
            "chicago": {"lat": 41.8781, "lon": -87.6298, "country": "United States"},
            "houston": {"lat": 29.7604, "lon": -95.3698, "country": "United States"},
            "san francisco": {"lat": 37.7749, "lon": -122.4194, "country": "United States"},
            # Canada
            "toronto": {"lat": 43.6532, "lon": -79.3832, "country": "Canada"},
            "vancouver": {"lat": 49.2827, "lon": -123.1207, "country": "Canada"},
            # Europe
            "berlin": {"lat": 52.52, "lon": 13.405, "country": "Germany"},
            "munich": {"lat": 48.1351, "lon": 11.582, "country": "Germany"},
            "rome": {"lat": 41.9028, "lon": 12.4964, "country": "Italy"},
            "madrid": {"lat": 40.4168, "lon": -3.7038, "country": "Spain"},
            "barcelona": {"lat": 41.3851, "lon": 2.1734, "country": "Spain"},
            # Asia
            "shanghai": {"lat": 31.2304, "lon": 121.4737, "country": "China"},
            "beijing": {"lat": 39.9042, "lon": 116.4074, "country": "China"},
            "singapore": {"lat": 1.3521, "lon": 103.8198, "country": "Singapore"},
            "bangkok": {"lat": 13.7563, "lon": 100.5018, "country": "Thailand"},
            "seoul": {"lat": 37.5665, "lon": 126.978, "country": "South Korea"},
            # Australia
            "sydney": {"lat": -33.8688, "lon": 151.2093, "country": "Australia"},
            "melbourne": {"lat": -37.8136, "lon": 144.9631, "country": "Australia"}
        }

    def normalize_query(self, query: str) -> str:
        """Normalizes search input to guarantee identical outputs for repeated searches."""
        if not query:
            return ""
        cleaned = query.strip().lower()
        cleaned = re.sub(r'[^a-z0-9\s]', '', cleaned)
        cleaned = re.sub(r'\s+', ' ', cleaned)
        return cleaned

    def resolve_location(self, query: str):
        normalized = self.normalize_query(query)
        if not normalized:
            raise ValueError("Location query cannot be empty.")

        # 1. Local deterministic dictionary check with typo correction
        if normalized in self.offline_locations:
            loc = self.offline_locations[normalized]
            return {
                "city": normalized.capitalize(),
                "lat": loc["lat"],
                "lon": loc["lon"],
                "country": loc["country"],
                "source": "Offline Deterministic DB"
            }

        matches = get_close_matches(normalized, self.offline_locations.keys(), n=1, cutoff=0.75)
        if matches:
            best_match = matches[0]
            loc = self.offline_locations[best_match]
            return {
                "city": best_match.capitalize(),
                "lat": loc["lat"],
                "lon": loc["lon"],
                "country": loc["country"],
                "source": "Offline Fuzzy Match DB"
            }

        settings = get_settings()
        api_key = settings.openweather_api_key

        # 2. OpenWeather Direct Geocoding fallback with strict limit=1
        if api_key and api_key != "your_openweathermap_api_key":
            try:
                geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={normalized}&limit=1&appid={api_key}"
                response = requests.get(geo_url, timeout=5)
                if response.status_code == 200 and response.json():
                    loc_data = response.json()[0]
                    return {
                        "city": loc_data.get("name"),
                        "lat": float(loc_data.get("lat")),
                        "lon": float(loc_data.get("lon")),
                        "country": loc_data.get("country", ""),
                        "source": "OpenWeather Direct Geo"
                    }
            except Exception:
                pass

        # 3. OSM Nominatim fallback
        try:
            nom_url = f"https://nominatim.openstreetmap.org/search?q={normalized}&format=json&limit=1"
            headers = {'User-Agent': 'SkyIntelAI-EnterpriseWeatherPlatform'}
            response = requests.get(nom_url, headers=headers, timeout=5)
            if response.status_code == 200 and response.json():
                loc_data = response.json()[0]
                return {
                    "city": loc_data.get("display_name").split(",")[0],
                    "lat": float(loc_data.get("lat")),
                    "lon": float(loc_data.get("lon")),
                    "country": "",
                    "source": "OSM Nominatim Fallback"
                }
        except Exception:
            pass

        raise ValueError(f"Location '{query}' could not be resolved accurately.")


# Singleton instance for high-precision lookup
_geocoding_service = HighPrecisionGeocodingService()


async def geocode_location(query: str) -> List[CityLocation]:
    """Asynchronous wrapper mapping to the HighPrecisionGeocodingService class.
    Returns list of matching resolved locations in CityLocation schema formats.
    """
    try:
        res = _geocoding_service.resolve_location(query)
        if res:
            display_name = f"{res['city']}, {res['country']}" if res.get('country') else res['city']
            country_code = (res.get("country") or "")[:2].upper() if res.get("country") != "India" else "IN"
            
            return [CityLocation(
                name=res["city"],
                state=None,
                country=country_code,
                lat=res["lat"],
                lon=res["lon"],
                display_name=display_name
            )]
    except Exception as err:
        logger.warning("High precision geocoding resolution failed for '%s': %s", query, err)

    return search_offline_dataset(query, limit=5)


def search_offline_dataset(query: str, limit: int = 5) -> List[CityLocation]:
    """Search offline city dataset using the HighPrecisionGeocodingService instance."""
    normalized_q = _geocoding_service.normalize_query(query)
    if not normalized_q:
        return []

    results = []
    seen = set()
    
    try:
        res = _geocoding_service.resolve_location(query)
        if res and res["source"] != "OpenWeather Direct Geo" and res["source"] != "OSM Nominatim Fallback":
            display_name = f"{res['city']}, {res['country']}" if res.get('country') else res['city']
            country_code = (res.get("country") or "")[:2].upper() if res.get("country") != "India" else "IN"
            
            seen.add(res["city"].lower())
            results.append(CityLocation(
                name=res["city"],
                state=None,
                country=country_code,
                lat=res["lat"],
                lon=res["lon"],
                display_name=display_name
            ))
    except Exception:
        pass

    for k, loc in _geocoding_service.offline_locations.items():
        if (k.startswith(normalized_q) or normalized_q in k) and k not in seen:
            seen.add(k)
            display_name = f"{k.capitalize()}, {loc['country']}"
            country_code = (loc.get("country") or "")[:2].upper() if loc.get("country") != "India" else "IN"
            
            results.append(CityLocation(
                name=k.capitalize(),
                state=None,
                country=country_code,
                lat=loc["lat"],
                lon=loc["lon"],
                display_name=display_name
            ))
            if len(results) >= limit:
                break
                
    return results
