import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';

type PhotoCaptureResult = {
  launchCamera: () => Promise<string | null>;
  launchGallery: () => Promise<string | null>;
  isLoading: boolean;
  hasPermissions: boolean;
};

const IMAGE_PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [4, 3] as [number, number],
  quality: 0.8,
};

const getImageUri = (result: ImagePicker.ImagePickerResult): string | null => {
  if (!result.canceled && result.assets?.[0]?.uri) {
    return result.assets[0].uri;
  }
  return null;
};

const requestPermissions = async (): Promise<boolean> => {
  const [cameraPermission, mediaLibraryPermission] = await Promise.all([
    ImagePicker.requestCameraPermissionsAsync(),
    ImagePicker.requestMediaLibraryPermissionsAsync(),
  ]);
  return cameraPermission.granted && mediaLibraryPermission.granted;
};

export function usePhotoCapture(): PhotoCaptureResult {
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);

  const captureImage = useCallback(
    async (action: 'camera' | 'gallery'): Promise<string | null> => {
      setIsLoading(true);
      try {
        const granted = await requestPermissions();
        setHasPermissions(granted);
        if (!granted) return null;

        let result: ImagePicker.ImagePickerResult;

        if (action === 'camera') {
          // Trigger haptic feedback for camera capture
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          result = await ImagePicker.launchCameraAsync(IMAGE_PICKER_OPTIONS);
        } else {
          result =
            await ImagePicker.launchImageLibraryAsync(IMAGE_PICKER_OPTIONS);
        }

        return getImageUri(result);
      } catch (error) {
        console.warn(`${action} error:`, error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const launchCamera = useCallback(
    () => captureImage('camera'),
    [captureImage]
  );
  const launchGallery = useCallback(
    () => captureImage('gallery'),
    [captureImage]
  );

  return { launchCamera, launchGallery, isLoading, hasPermissions };
}
