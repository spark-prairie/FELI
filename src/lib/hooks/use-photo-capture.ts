import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';

type PhotoCaptureResult = {
  launchCamera: () => Promise<string | null>;
  launchGallery: () => Promise<string | null>;
  isLoading: boolean;
  hasPermissions: boolean;
};

export function usePhotoCapture(): PhotoCaptureResult {
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const mediaLibraryPermission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    const granted = cameraPermission.granted && mediaLibraryPermission.granted;
    setHasPermissions(granted);
    return granted;
  }, []);

  const launchCamera = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setIsLoading(false);
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      setIsLoading(false);

      if (!result.canceled && result.assets && result.assets[0]) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.warn('Camera launch error:', error);
      setIsLoading(false);
      return null;
    }
  }, [requestPermissions]);

  const launchGallery = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setIsLoading(false);
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      setIsLoading(false);

      if (!result.canceled && result.assets && result.assets[0]) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.warn('Gallery launch error:', error);
      setIsLoading(false);
      return null;
    }
  }, [requestPermissions]);

  return {
    launchCamera,
    launchGallery,
    isLoading,
    hasPermissions,
  };
}
