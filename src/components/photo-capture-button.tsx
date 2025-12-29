import React, { useCallback } from 'react';

import { Button, Modal, useModal, View } from '@/components/ui';

type Props = {
  onCameraPress: () => void;
  onGalleryPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
};

export function PhotoCaptureButton({
  onCameraPress,
  onGalleryPress,
  disabled = false,
  isLoading = false,
}: Props) {
  const { ref, present, dismiss } = useModal();

  const handleCameraPress = useCallback(() => {
    dismiss();
    // Small delay to ensure modal dismissal completes before navigation
    setTimeout(() => {
      onCameraPress();
    }, 100);
  }, [dismiss, onCameraPress]);

  const handleGalleryPress = useCallback(() => {
    dismiss();
    // Small delay to ensure modal dismissal completes before navigation
    setTimeout(() => {
      onGalleryPress();
    }, 100);
  }, [dismiss, onGalleryPress]);

  return (
    <>
      <Button
        label="Take or Choose Photo"
        onPress={present}
        disabled={disabled}
        loading={isLoading}
        size="lg"
        testID="photo-capture-button"
      />

      <Modal ref={ref} snapPoints={['40%']} title="Select Photo">
        <View className="gap-4 px-4 pb-8">
          <Button
            label="📷 Take Photo"
            onPress={handleCameraPress}
            variant="outline"
            size="lg"
            testID="take-photo-option"
          />

          <Button
            label="🖼️ Choose from Gallery"
            onPress={handleGalleryPress}
            variant="outline"
            size="lg"
            testID="choose-gallery-option"
          />
        </View>
      </Modal>
    </>
  );
}
