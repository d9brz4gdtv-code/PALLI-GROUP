import { useEffect } from 'react';
import { User } from '../types';
import { firestoreService } from '../lib/firestoreService';

interface LocationTrackerProps {
  user: User | null;
}

export default function LocationTracker({ user }: LocationTrackerProps) {
  useEffect(() => {
    if (!user) return;

    let watchId: number;

    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          firestoreService.updateUserLocation(user.uid, {
            lat: latitude,
            lng: longitude,
            lastUpdated: new Date().toISOString()
          }).catch(err => console.error('Error updating location:', err));
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [user]);

  return null;
}
