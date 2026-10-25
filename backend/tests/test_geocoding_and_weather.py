import pytest
from services.geocoding_service import geocode_location, search_offline_dataset, _levenshtein_distance

def test_levenshtein_distance():
    assert _levenshtein_distance("mumbai", "mubmai") == 2
    assert _levenshtein_distance("delhi", "delhy") == 1
    assert _levenshtein_distance("tokyo", "tokyo") == 0

def test_search_offline_dataset():
    results = search_offline_dataset("Mubmai")
    assert len(results) > 0
    assert results[0].name == "Mumbai"
    assert results[0].country == "IN"

def test_search_offline_dataset_london():
    results = search_offline_dataset("Londn")
    assert len(results) > 0
    assert results[0].name == "London"

@pytest.mark.asyncio
async def test_geocode_location():
    locations = await geocode_location("Bengaluru")
    assert len(locations) > 0
    assert locations[0].lat is not None
    assert locations[0].lon is not None
