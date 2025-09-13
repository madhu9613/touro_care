# data/generate_gps_data.py
import pandas as pd
import numpy as np
from utils.feature_utils import compute_features

def generate_gps_data(n_points=5000, center_lat=28.6, center_lon=77.2):
    lats = [center_lat]
    lons = [center_lon]
    timestamps = [1694500000]
    
    for i in range(1, n_points):
        # small random movement ~1-5 meters
        delta_lat = np.random.uniform(-0.00005, 0.00005)
        delta_lon = np.random.uniform(-0.00005, 0.00005)
        lats.append(lats[-1] + delta_lat)
        lons.append(lons[-1] + delta_lon)
        timestamps.append(timestamps[-1] + 1)  # 1 second apart
    
    features = compute_features(lats, lons, timestamps)
    df = pd.DataFrame(features)
    df.to_csv('data/realistic_gps.csv', index=False)
    print("Generated realistic GPS dataset with", n_points, "points.")

if __name__ == "__main__":
    generate_gps_data()
