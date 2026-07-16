import { Platform } from 'react-native';
import type BillingServiceNative from './billingService.native';
import type { BillingProduct } from './billingService.native';

type BillingServiceModule = typeof BillingServiceNative;

const serviceModule: BillingServiceModule =
  Platform.OS === 'web'
    ? require('./billingService.web').default
    : require('./billingService.native').default;

export type { BillingProduct };
export const BillingService = serviceModule;
export default serviceModule;
