import { Agent } from '@/models/agent';
import { User } from '@/models/user';
import { Op } from 'sequelize';

interface Coordinates {
  latitude: number;
  longitude: number;
}

// Calculate distance between two points using Haversine formula
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km

  return distance;
}

// Find nearby agents within radius
export async function findNearbyAgents(
  coordinates: Coordinates,
  radiusInKm: number = 10,
  limit: number = 20
): Promise<Array<Agent & { user: User, distance: number }>> {
  try {
    // First, get all active agents
    const agents = await Agent.findAll({
      where: {
        isAvailable: true,
        latitude: { [Op.not]: null },
        longitude: { [Op.not]: null },
      },
      include: [
        {
          model: User,
          as: 'user',
          where: {
            isActive: true,
            approvalStatus: 'approved',
          },
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'profileImage'],
        },
      ],
    });

    // Calculate distance for each agent and filter by radius
    const nearbyAgents = agents
      .map(agent => {
        const distance = calculateDistance(
          coordinates.latitude,
          coordinates.longitude,
          agent.latitude!,
          agent.longitude!
        );
        return { ...agent.toJSON(), distance };
      })
      .filter(agent => agent.distance <= radiusInKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return nearbyAgents;
  } catch (error) {
    console.error('Error finding nearby agents:', error);
    throw new Error('Failed to find nearby agents');
  }
}

// Validate coordinates
export function validateCoordinates(coordinates: any): Coordinates | null {
  if (!coordinates || typeof coordinates !== 'object') {
    return null;
  }

  const { latitude, longitude } = coordinates;

  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    isNaN(latitude) ||
    isNaN(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return { latitude, longitude };
}

// Update agent location
export async function updateAgentLocation(
  agentId: string,
  coordinates: Coordinates
): Promise<void> {
  try {
    const agent = await Agent.findByPk(agentId);

    if (!agent) {
      throw new Error('Agent not found');
    }

    agent.latitude = coordinates.latitude;
    agent.longitude = coordinates.longitude;
    agent.locationUpdatedAt = new Date();

    await agent.save();
  } catch (error) {
    console.error('Error updating agent location:', error);
    throw error;
  }
}