import { Env } from '@env';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { Alert, Linking, Platform } from 'react-native';

import { Item } from '@/components/settings/item';
import { ItemsContainer } from '@/components/settings/items-container';
import { LanguageItem } from '@/components/settings/language-item';
import { ThemeItem } from '@/components/settings/theme-item';
import {
  colors,
  FocusAwareStatusBar,
  Pressable,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import { Github, Rate, Share, Support, Website } from '@/components/ui/icons';
import { translate, useAuth } from '@/lib';
import { useAnalysisStore } from '@/stores/analysis-store';

// eslint-disable-next-line max-lines-per-function
export default function Settings() {
  const router = useRouter();
  const signOut = useAuth.use.signOut();
  const { colorScheme } = useColorScheme();
  const iconColor =
    colorScheme === 'dark' ? colors.neutral[400] : colors.neutral[500];

  const clearAllLocalData = useAnalysisStore((s) => s.clearAllLocalData);
  const isPro = useAnalysisStore((s) => s.isPro);
  const syncProStatus = useAnalysisStore((s) => s.syncProStatus);

  const handleDeleteData = () => {
    Alert.alert(
      translate('settings.delete_confirm_title'),
      translate('settings.delete_confirm_message'),
      [
        {
          text: translate('settings.cancel'),
          style: 'cancel',
        },
        {
          text: translate('settings.delete_button'),
          style: 'destructive',
          onPress: () => {
            clearAllLocalData();
            router.replace('/(app)/home');
          },
        },
      ]
    );
  };

  const handleToggleMockPro = () => {
    syncProStatus(!isPro, Date.now());
  };

  const handleManageSubscription = () => {
    // Open system subscription settings
    if (Platform.OS === 'ios') {
      // iOS: App Store subscriptions
      Linking.openURL('https://apps.apple.com/account/subscriptions');
    } else {
      // Android: Google Play subscriptions
      Linking.openURL('https://play.google.com/store/account/subscriptions');
    }
  };

  return (
    <>
      <FocusAwareStatusBar />

      <ScrollView>
        <View className="flex-1 px-4 pt-16 ">
          <Text className="text-xl font-bold">
            {translate('settings.title')}
          </Text>
          <ItemsContainer title="settings.generale">
            <LanguageItem />
            <ThemeItem />
          </ItemsContainer>

          <ItemsContainer title="settings.about">
            <Item text="settings.app_name" value={Env.NAME} />
            <Item text="settings.version" value={Env.VERSION} />
          </ItemsContainer>

          {/* Subscription Management (Pro users only) */}
          {isPro && (
            <ItemsContainer title="settings.subscription">
              <Item
                text="settings.manage_subscription"
                icon={<Text className="text-xl">⭐</Text>}
                onPress={handleManageSubscription}
              />
            </ItemsContainer>
          )}

          <ItemsContainer title="settings.support_us">
            <Item
              text="settings.share"
              icon={<Share color={iconColor} />}
              onPress={() => {}}
            />
            <Item
              text="settings.rate"
              icon={<Rate color={iconColor} />}
              onPress={() => {}}
            />
            <Item
              text="settings.support"
              icon={<Support color={iconColor} />}
              onPress={() => {}}
            />
          </ItemsContainer>

          <ItemsContainer title="settings.links">
            <Item text="settings.privacy" onPress={() => {}} />
            <Item text="settings.terms" onPress={() => {}} />
            <Item
              text="settings.github"
              icon={<Github color={iconColor} />}
              onPress={() => {}}
            />
            <Item
              text="settings.website"
              icon={<Website color={iconColor} />}
              onPress={() => {}}
            />
          </ItemsContainer>

          {/* Developer Tools (Dev Mode Only) */}
          {__DEV__ && (
            <ItemsContainer title="settings.developer_tools">
              <Pressable
                onPress={handleToggleMockPro}
                className="flex-1 flex-row items-center justify-between px-4 py-2"
              >
                <Text className="text-neutral-800 dark:text-neutral-100">
                  {translate('settings.toggle_mock_pro')}
                </Text>
                <Text
                  className={
                    isPro
                      ? 'text-purple-600 dark:text-purple-400'
                      : 'text-neutral-500 dark:text-neutral-400'
                  }
                >
                  {isPro
                    ? translate('settings.mock_pro_enabled')
                    : translate('settings.mock_pro_disabled')}
                </Text>
              </Pressable>
            </ItemsContainer>
          )}

          {/* Privacy & Data */}
          <ItemsContainer title="settings.privacy_and_data">
            <Pressable
              onPress={handleDeleteData}
              className="flex-1 flex-row items-center justify-between px-4 py-2"
            >
              <Text className="text-red-600 dark:text-red-400">
                {translate('settings.delete_all_data')}
              </Text>
            </Pressable>
          </ItemsContainer>

          <View className="my-8">
            <ItemsContainer>
              <Item text="settings.logout" onPress={signOut} />
            </ItemsContainer>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
