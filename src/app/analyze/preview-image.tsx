import React from 'react';

import { Image, Text, View } from '@/components/ui';

type PreviewImageProps = {
  imageUri: string;
};

export default function PreviewImage({ imageUri }: PreviewImageProps) {
  return (
    <View className="flex-1 items-center justify-center p-6">
      <View className="mb-6 w-full overflow-hidden rounded-2xl">
        <Image
          source={{ uri: imageUri }}
          className="aspect-square w-full"
          contentFit="cover"
        />
      </View>
      <Text className="mb-8 text-center text-sm text-neutral-600 dark:text-neutral-400">
        Review your photo before analysis
      </Text>
    </View>
  );
}
