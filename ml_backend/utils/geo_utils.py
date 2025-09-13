# utils/geo_utils.py
import json
from shapely.geometry import Point, Polygon

def load_geofences(path='data/geofences.json'):
    with open(path, 'r') as f:
        geofences = json.load(f)
    # Convert polygons to Shapely objects
    for g in geofences:
        if g['type'] == 'polygon':
            g['polygon'] = Polygon(g['vertices'])
    return geofences

def check_geofence(lat, lon, geofences):
    point = Point(lat, lon)
    for g in geofences:
        if g['type'] == 'circle':
            # distance in meters using haversine
            from utils.feature_utils import haversine
            dist = haversine(lat, lon, g['center'][0], g['center'][1])
            if dist <= g['radius']:
                return g
        elif g['type'] == 'polygon':
            if g['polygon'].contains(point):
                return g
    return None
