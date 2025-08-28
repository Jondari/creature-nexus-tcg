import {
  initConnection,
  endConnection,
  requestProducts,        // ✅ replaces getProducts / getSubscriptions
  requestPurchase,        // ✅ new signature
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,      // ✅ new signature
  type Product,
  type Purchase,
} from 'expo-iap';
import { Platform } from 'react-native';

export interface BillingProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  priceAmount: number;
  currency: string;
}

let purchaseUpdateSub: ReturnType<typeof purchaseUpdatedListener> | null = null;
let purchaseErrorSub: ReturnType<typeof purchaseErrorListener> | null = null;

// Helper function to parse localized price strings
function parseLocalizedAmount(priceString: string): number {
  // "€2,99" -> 2.99 ; "R$ 12,50" -> 12.50 ; "$3.49" -> 3.49
  const numericMatch = priceString.replace(/[^\d.,]/g, '').replace(',', '.').match(/\d+(\.\d+)?/);
  return numericMatch ? parseFloat(numericMatch[0]) : 0;
}

export class BillingService {
  private static isInitialized = false;
  private static products: BillingProduct[] = [];
  private static purchaseCallbacks: {
    onSuccess?: (purchase: Purchase) => void;
    onError?: (error: any) => void;
  } = {};

  // Define your product IDs - these must match what you create in Google Play Console
  static readonly PRODUCT_IDS = {
    STANDARD_PACK: 'standard_pack',
    ELEMENTAL_PACK: 'elemental_pack', 
    LEGENDARY_PACK: 'legendary_pack',
    MYTHIC_PACK: 'mythic_pack',
    NEXUS_COINS_100: 'nexus_coins_100',
    NEXUS_COINS_500: 'nexus_coins_500',
    NEXUS_COINS_1000: 'nexus_coins_1000',
  } as const;

  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await initConnection();
      this.setupPurchaseListeners();
      this.isInitialized = true;
      
      if (__DEV__) {
        console.log('Billing service initialized successfully');
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to initialize billing service:', error);
      }
      throw error;
    }
  }

  private static setupPurchaseListeners(): void {
    purchaseUpdateSub = purchaseUpdatedListener(async (purchase: Purchase) => {
      try {
        if (__DEV__) {
          console.log('IAP purchase:', { id: purchase.id, productId: purchase.productId, token: purchase.purchaseToken });
        }
        
        // Finish the transaction - Android consumable
        await finishTransaction({ purchase, isConsumable: true });
        
        // Call success callback if set
        if (this.purchaseCallbacks.onSuccess) {
          this.purchaseCallbacks.onSuccess(purchase);
        }
      } catch (error) {
        if (__DEV__) {
          console.error('Error finishing transaction:', error);
        }
        
        if (this.purchaseCallbacks.onError) {
          this.purchaseCallbacks.onError(error);
        }
      }
    });

    purchaseErrorSub = purchaseErrorListener((error: any) => {
      if (__DEV__) {
        console.error('Purchase error:', error);
      }
      
      if (this.purchaseCallbacks.onError) {
        this.purchaseCallbacks.onError(error);
      }
    });
  }

  static async getProducts(): Promise<BillingProduct[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.products.length > 0) {
      return this.products;
    }

    try {
      const skus = Object.values(this.PRODUCT_IDS);
      const products = await requestProducts({ skus, type: 'inapp' }) as Product[];
      
      this.products = products.map((p: Product) => ({
        id: p.id,                                   // ✅ correct field name
        title: p.title,
        description: p.description ?? '',
        price: p.displayPrice,                      // ✅ localized string ("€2,99")
        priceAmount: typeof p.price === 'number'    // ✅ numeric value if available
          ? p.price
          : parseLocalizedAmount(p.displayPrice),
        currency: p.currency,
      }));

      if (__DEV__) {
        console.log('IAP products keys:', products.map(p => ({ id: p.id, displayPrice: p.displayPrice, currency: p.currency })));
        console.log('Retrieved products:', this.products);
      }

      return this.products;
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to get products:', error);
      }
      return [];
    }
  }

  static async getProduct(productId: string): Promise<BillingProduct | null> {
    const products = await this.getProducts();
    return products.find(product => product.id === productId) || null;
  }

  static async purchaseProduct(productId: string): Promise<{
    success: boolean;
    error?: string;
    purchaseToken?: string;
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve) => {
      // Set up callbacks for this purchase
      this.purchaseCallbacks = {
        onSuccess: (purchase: Purchase) => {
          resolve({
            success: true,
            purchaseToken: purchase.purchaseToken
          });
        },
        onError: (error: any) => {
          const errorMessage = this.getErrorMessage(error);
          resolve({
            success: false,
            error: errorMessage
          });
        }
      };

      // Initiate the purchase - Android only
      requestPurchase({
        request: { android: { skus: [productId] } },
        type: 'inapp'
      })
        .catch((error) => {
          if (__DEV__) {
            console.error('Purchase request failed:', error);
          }
          resolve({
            success: false,
            error: 'Failed to initiate purchase. Please try again.'
          });
        });
    });
  }

  private static getErrorMessage(error: any): string {
    // Handle different types of errors from expo-iap
    if (typeof error === 'string') {
      if (error.includes('cancelled') || error.includes('canceled')) {
        return 'Purchase cancelled';
      }
    }
    
    if (error?.code) {
      switch (error.code) {
        case 'USER_CANCELED':
          return 'Purchase cancelled';
        case 'SERVICE_UNAVAILABLE':
          return 'Billing service is currently unavailable';
        case 'BILLING_UNAVAILABLE':
          return 'Billing is not available on this device';
        case 'ITEM_UNAVAILABLE':
          return 'This item is not available for purchase';
        case 'DEVELOPER_ERROR':
          return 'There was a configuration error. Please contact support.';
        default:
          return error.message || 'An error occurred during purchase. Please try again.';
      }
    }

    return error?.message || 'An error occurred during purchase. Please try again.';
  }

  static async finishTransaction(purchaseToken: string): Promise<void> {
    // Note: expo-iap handles transaction finishing automatically in the listener
    // This method is kept for compatibility but doesn't need to do anything
    if (__DEV__) {
      console.log('Transaction finished (handled automatically by expo-iap)');
    }
  }

  static async disconnect(): Promise<void> {
    try {
      // Clean up listeners
      if (purchaseUpdateSub) {
        purchaseUpdateSub.remove();
        purchaseUpdateSub = null;
      }
      if (purchaseErrorSub) {
        purchaseErrorSub.remove();
        purchaseErrorSub = null;
      }

      await endConnection();
      this.isInitialized = false;
      this.products = [];
      
      if (__DEV__) {
        console.log('Billing service disconnected');
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to disconnect billing service:', error);
      }
    }
  }
}

export default BillingService;