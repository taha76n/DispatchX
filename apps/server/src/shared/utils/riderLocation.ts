import { redisClient } from "../../configs/redis.js";
import { Rider } from "../../modules/dispatch/rider.model.js";
import { logger } from "./logger.js";

export const updateRiderLocation = async (
  riderId: string,
  longitude: number,
  latitude: number
) => {
  const key = "riders:locations";

  const newLocation = await redisClient.geoAdd(key, {
    member: riderId,
    longitude: longitude,
    latitude: latitude,
  });

  return newLocation;
};

export const findNearbyRiders = async (
  longitude: number,
  latitude: number,
  radiusMeter: number
): Promise<string[]> => {
  const key = "riders:locations";
  try {
    const nearbyRiders = await redisClient.geoSearch(
      key,
      { longitude: longitude, latitude: latitude },
      { radius: radiusMeter, unit: "m" } // 'm' for meters
    );
    return nearbyRiders as string[];
  } catch (error) {
    logger.error(error);
    return [];
  }
};

export const findNearbyOnlineRiders = async (
  longitude: number,
  latitude: number,
  radiusMeter: number
) => {
  const nearbyRiders = await findNearbyRiders(longitude, latitude, radiusMeter);

  const nearbyOnlineRiders = await Rider.find({
    userId: { $in: nearbyRiders },
    isOnline: true,
  });
  return nearbyOnlineRiders;
};
