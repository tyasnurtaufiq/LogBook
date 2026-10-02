/**
 * Calculates great-circle distance between two points on Earth using the Haversine formula
 * @param {number} lat1 Latitude of point 1 (in degrees)
 * @param {number} lon1 Longitude of point 1 (in degrees)
 * @param {number} lat2 Latitude of point 2 (in degrees)
 * @param {number} lon2 Longitude of point 2 (in degrees)
 * @returns {number} Distance in meters
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Validates if coordinates are within office radius
 * @param {number} userLat
 * @param {number} userLng
 * @param {object} officeConfig
 * @returns {{ isWithin: boolean, distanceMeters: number }}
 */
function validateLocationRadius(userLat, userLng, officeConfig) {
  if (!officeConfig || !officeConfig.enabled) {
    return { isWithin: true, distanceMeters: 0 };
  }

  const { latitude, longitude, radius_meters = 100 } = officeConfig;
  const distance = calculateHaversineDistance(userLat, userLng, latitude, longitude);

  return {
    isWithin: distance <= radius_meters,
    distanceMeters: distance
  };
}

module.exports = {
  calculateHaversineDistance,
  validateLocationRadius
};
