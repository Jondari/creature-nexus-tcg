import { Platform } from 'react-native';
import type { RCProduct } from './RevenueCatService.native';
import type RevenueCatServiceNative from './RevenueCatService.native';

type RevenueCatServiceModule = typeof RevenueCatServiceNative;

const serviceModule: RevenueCatServiceModule =
  Platform.OS === 'web'
    ? require('./RevenueCatService.web').default
    : require('./RevenueCatService.native').default;

export type { RCProduct };
export default serviceModule;
