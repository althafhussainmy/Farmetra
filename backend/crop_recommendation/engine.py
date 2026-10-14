"""
Rule-based crop recommendation engine.
Inputs: soil_type, pH, water_availability, climate, previous_crop.
Output: list of recommended crop names with brief reason.
Designed for extension with ML (e.g. scikit-learn) later.
"""
from decimal import Decimal
from typing import Any

# Rule base: crop -> conditions (all must be satisfied for inclusion)
# Conditions: soil_types (list), ph_range (min, max), water (list), climate (list)
CROP_RULES = [
    {
        "crop": "Rice",
        "soil_types": ["clay", "clay_loam", "silty_clay"],
        "ph_range": (5.0, 8.0),
        "water": ["high"],
        "climate": ["tropical", "subtropical"],
    },
    {
        "crop": "Wheat",
        "soil_types": ["loam", "clay_loam", "sandy_loam"],
        "ph_range": (5.5, 7.5),
        "water": ["medium", "high"],
        "climate": ["temperate", "subtropical"],
    },
    {
        "crop": "Maize",
        "soil_types": ["loam", "sandy_loam", "clay_loam"],
        "ph_range": (5.5, 7.5),
        "water": ["medium", "high"],
        "climate": ["tropical", "subtropical", "temperate"],
    },
    {
        "crop": "Sugarcane",
        "soil_types": ["loam", "clay_loam", "sandy_loam"],
        "ph_range": (6.0, 8.0),
        "water": ["high"],
        "climate": ["tropical", "subtropical"],
    },
    {
        "crop": "Cotton",
        "soil_types": ["black_soil", "clay_loam", "loam"],
        "ph_range": (6.0, 8.0),
        "water": ["medium"],
        "climate": ["tropical", "subtropical"],
    },
    {
        "crop": "Groundnut",
        "soil_types": ["sandy_loam", "loam"],
        "ph_range": (6.0, 7.5),
        "water": ["low", "medium"],
        "climate": ["tropical", "subtropical"],
    },
    {
        "crop": "Pulses (Black Gram)",
        "soil_types": ["loam", "sandy_loam", "clay_loam"],
        "ph_range": (6.0, 7.5),
        "water": ["low", "medium"],
        "climate": ["tropical", "subtropical", "temperate"],
    },
    {
        "crop": "Millets (Pearl Millet)",
        "soil_types": ["sandy_loam", "sandy", "loam"],
        "ph_range": (6.0, 8.0),
        "water": ["low", "medium"],
        "climate": ["tropical", "subtropical", "arid"],
    },
    {
        "crop": "Vegetables (Tomato)",
        "soil_types": ["loam", "sandy_loam", "clay_loam"],
        "ph_range": (6.0, 7.0),
        "water": ["medium", "high"],
        "climate": ["tropical", "subtropical", "temperate"],
    },
    {
        "crop": "Coconut",
        "soil_types": ["sandy", "sandy_loam", "loam"],
        "ph_range": (5.0, 8.0),
        "water": ["high"],
        "climate": ["tropical"],
    },
]


def _normalize(value: str) -> str:
    return value.strip().lower().replace(" ", "_") if value else ""


def _ph_in_range(ph_val: float | Decimal | None, ph_min: float, ph_max: float) -> bool:
    if ph_val is None:
        return True
    try:
        p = float(ph_val)
        return ph_min <= p <= ph_max
    except (TypeError, ValueError):
        return True


def recommend_crops(
    soil_type: str,
    water_availability: str,
    climate: str,
    ph: float | Decimal | None = None,
    previous_crop: str = "",
) -> list[dict[str, Any]]:
    """
    Returns list of recommended crops, each with keys: crop, match_reason.
    """
    soil_n = _normalize(soil_type)
    water_n = _normalize(water_availability)
    climate_n = _normalize(climate)

    results = []
    for rule in CROP_RULES:
        soil_ok = soil_n in [_normalize(s) for s in rule["soil_types"]]
        water_ok = water_n in [_normalize(w) for w in rule["water"]]
        climate_ok = climate_n in [_normalize(c) for c in rule["climate"]]
        ph_ok = _ph_in_range(ph, rule["ph_range"][0], rule["ph_range"][1])

        if soil_ok and water_ok and climate_ok and ph_ok:
            reasons = [f"Soil: {soil_type}", f"Water: {water_availability}", f"Climate: {climate}"]
            if ph is not None:
                reasons.append(f"pH: {ph} in range {rule['ph_range']}")
            results.append({
                "crop": rule["crop"],
                "match_reason": "; ".join(reasons),
            })

    if not results:
        results.append({
            "crop": "General mixed cropping (pulses + cereals)",
            "match_reason": "No exact match; consider soil test and local advisory.",
        })
    return results
