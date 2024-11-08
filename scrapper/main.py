import requests
import json
from dotenv import load_dotenv
import os
from typing import List, Dict, Any, Set
from enum import Enum

load_dotenv()

API_KEY = os.getenv('API_KEY')
latitude: float = 48.8669563479972
longitude: float = 2.3512810728914677
url: str = "https://places.googleapis.com/v1/places:searchNearby"

class PriceLevel(Enum):
    FREE = 'PRICE_LEVEL_FREE'
    INEXPENSIVE = 'PRICE_LEVEL_INEXPENSIVE'
    MODERATE = 'PRICE_LEVEL_MODERATE'
    EXPENSIVE = 'PRICE_LEVEL_EXPENSIVE'
    VERY_EXPENSIVE = 'PRICE_LEVEL_VERY_EXPENSIVE'

all_places: List[Dict[str, Any]] = []
unique_names: Set[str] = set()

for radius in range(100, 1100, 100):
    payload = {
        "includedTypes": ["restaurant"],
        "excludedPrimaryTypes": ["shopping_mall"],
        "maxResultCount": 20,
        "locationRestriction": {
            "circle": {
                "center": {
                    "latitude": latitude,
                    "longitude": longitude
                },
                "radius": radius
            }
        }
    }
    headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.priceLevel,places.primaryType,places.rating,places.googleMapsUri'
    }
    
    response = requests.post(url, json=payload, headers=headers)
    data = response.json()
    
    for place in data.get('places', []):
        name_data = place.get('displayName')
        name_text: str = name_data["text"] if isinstance(name_data, dict) else (name_data or "")
        
        if not name_text or any(banned_word in name_text.lower() for banned_word in ["bistro", "gastronomie", "café", "brasserie", "bar"]):
            continue

        address: str = place.get('formattedAddress', "")
        price_level: Any = place.get('priceLevel', None)
        primary_type: str = place.get('primaryType', "")
        rating: float = place.get('rating', 0.0)
        maps_url: str = place.get('googleMapsUri', "")

        if not address or price_level is None or primary_type is None or rating is None:
            continue
        if rating <= 4.0 or price_level == PriceLevel.EXPENSIVE.value or name_text in unique_names:
            continue

        unique_names.add(name_text)
        all_places.append({
            "Name": name_text,
            "Address": address,
            "Rating": rating,
            "Price Level": price_level,
            "Type": primary_type,
            "Google Maps URL": maps_url
        })

with open('scrapper/filtered_restaurants.json', 'w', encoding='utf-8') as file:
    json.dump(all_places, file, ensure_ascii=False, indent=4)

print("Data collection complete. Results saved to 'filtered_restaurants.json'")
