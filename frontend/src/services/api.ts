import { HealthStatus } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export async function checkBackendHealth(): Promise<HealthStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: HealthStatus = await response.json();
    return data;
  } catch (error) {
    return {
      status: 'offline',
      service: 'network-hunter-api',
      timestamp: new Date().toISOString(),
    };
  }
}
