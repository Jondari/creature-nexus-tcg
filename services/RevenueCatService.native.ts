import Purchases, { 
  CustomerInfo 
} from 'react-native-purchases';

export interface RCProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  priceAmount: number;
  currency: string;
  packageType?: string;
}

// Product IDs (SKUs) for Google Play managed products
export const PRODUCT_IDS = {
  STANDARD_PACK: 'standard_pack',
  ELEMENTAL_PACK: 'elemental_pack',
  LEGENDARY_PACK: 'legendary_pack',
  MYTHIC_PACK: 'mythic_pack',
  NEXUS_COINS_100: 'nexus_coins_100',
  NEXUS_COINS_500: 'nexus_coins_500',
  NEXUS_COINS_1000: 'nexus_coins_1000',
} as const;

export class RevenueCatService {
  private static isInitialized = false;
  static readonly PRODUCT_IDS = PRODUCT_IDS;

  static async initialize(): Promise<void> {
    // RevenueCat is already configured in app startup
    // Just mark as initialized
    this.isInitialized = true;
    
    if (__DEV__) {
      console.log('RevenueCatService initialized');
    }
  }

  static async getProducts(): Promise<RCProduct[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Fetch products directly by identifiers (no Offerings)
      const skus = [
        PRODUCT_IDS.STANDARD_PACK,
        PRODUCT_IDS.ELEMENTAL_PACK,
        PRODUCT_IDS.LEGENDARY_PACK,
        PRODUCT_IDS.MYTHIC_PACK,
        PRODUCT_IDS.NEXUS_COINS_100,
        PRODUCT_IDS.NEXUS_COINS_500,
        PRODUCT_IDS.NEXUS_COINS_1000,
      ];
      
      // Force 'inapp' type for Android compatibility
      const storeProducts = await Purchases.getProducts(skus as string[], 'inapp');

      const products: RCProduct[] = storeProducts.map((p: any) => ({
        id: p.identifier,
        title: p.title,
        description: p.description || '',
        price: p.priceString,
        priceAmount: p.price,
        currency: p.currencyCode,
      }));

      if (__DEV__) {
        console.log(
          'RevenueCat products (no offerings):',
          products.map(p => ({ id: p.id, price: p.price }))
        );
      }

      return products;
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to get RevenueCat products (no offerings):', error);
      }
      return [];
    }
  }

  static async getProduct(productId: string): Promise<RCProduct | null> {
    const products = await this.getProducts();
    return products.find(product => product.id === productId) || null;
  }

  static async purchaseProduct(productId: string): Promise<{
    success: boolean;
    error?: string;
    purchaseToken?: string;
  }> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Achat direct par identifiant (SKU)
      const { customerInfo, productIdentifier } = await Purchases.purchaseProduct(productId);

      if (__DEV__) {
        console.log('Purchase successful:', { productIdentifier });
      }

      // RevenueCat gère les transactions ; on renvoie l'ID pour compat 'finishTransaction'
      return { success: true, purchaseToken: productIdentifier };
    } catch (error: any) {
      if (__DEV__) {
        console.error('Purchase failed:', error);
      }
      
      let errorMessage = 'Purchase failed';
      if (error?.userCancelled) {
        errorMessage = 'User cancelled';
      } else if (typeof error?.code === 'string') {
        switch (error.code) {
          case 'PRODUCT_ALREADY_PURCHASED':
            errorMessage = 'Product already purchased';
            break;
          case 'PURCHASE_INVALID_ERROR':
            errorMessage = 'Purchase invalid';
            break;
          case 'PRODUCT_NOT_AVAILABLE':
            errorMessage = 'Product not available';
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      }
      return { success: false, error: errorMessage };
    }
  }

  static async restorePurchases(): Promise<CustomerInfo | null> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const customerInfo = await Purchases.restorePurchases();
      
      if (__DEV__) {
        console.log('Purchases restored:', {
          activeEntitlements: Object.keys(customerInfo.entitlements.active),
          allPurchasedProductIdentifiers: customerInfo.allPurchasedProductIdentifiers
        });
      }

      return customerInfo;
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to restore purchases:', error);
      }
      return null;
    }
  }

  static async getCustomerInfo(): Promise<CustomerInfo | null> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      return await Purchases.getCustomerInfo();
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to get customer info:', error);
      }
      return null;
    }
  }

  static async finishTransaction(purchaseToken?: string): Promise<void> {
    // RevenueCat handles transaction finishing automatically
    // No need to manually finish transactions
    if (__DEV__) {
      console.log('Transaction finished automatically by RevenueCat');
    }
  }

  static async disconnect(): Promise<void> {
    // RevenueCat doesn't need explicit disconnection like expo-iap
    this.isInitialized = false;
    
    if (__DEV__) {
      console.log('RevenueCatService disconnected');
    }
  }
}

export default RevenueCatService;