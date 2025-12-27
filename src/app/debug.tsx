import React from 'react';

import { FocusAwareStatusBar, View } from '@/components/ui';
import { StoreTester } from '@/debug/StoreTester';

export default function DebugScreen() {
  return (
    <>
      <FocusAwareStatusBar />
      <View className="flex-1">
        <StoreTester />
      </View>
    </>
  );
}
