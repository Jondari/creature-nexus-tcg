import Purchases, { 
  PurchasesPackage, 
  CustomerInfo, 
  PurchasesOfferings,
  LOG_LEVEL 
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

export class RevenueCatService {
  private static isInitialized = false;
  private static offerings: PurchasesOfferings | null = null;

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
      // Fetch offerings from RevenueCat
      this.offerings = await Purchases.getOfferings();
      const currentOffering = this.offerings.current;
      
      if (!currentOffering || !currentOffering.availablePackages.length) {
        if (__DEV__) {
          console.warn('No current offering or packages found');
          console.log('Available offerings:', Object.keys(this.offerings.all));
        }
        return [];
      }

      // Map packages to our product interface
      const products: RCProduct[] = currentOffering.availablePackages.map((pkg: PurchasesPackage) => ({
        id: pkg.product.identifier,           // SKU from store
        title: pkg.product.title,
        description: pkg.product.description || '',
        price: pkg.product.priceString,       // Localized price string
        priceAmount: pkg.product.price,       // Numeric price
        currency: pkg.product.currencyCode,
        packageType: pkg.packageType,
      }));

      if (__DEV__) {
        console.log('RevenueCat products:', products.map(p => ({ 
          id: p.id, 
          title: p.title, 
          price: p.price, 
          packageType: p.packageType 
        })));
      }

      return products;
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to get RevenueCat products:', error);
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
    customerInfo?: CustomerInfo;
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Get the package for this product ID
      const products = await this.getProducts();
      const product = products.find(p => p.id === productId);
      
      if (!product) {
        return {
          success: false,
          error: 'Product not found'
        };
      }

      // Find the package in current offering
      const currentOffering = this.offerings?.current;
      const packageToPurchase = currentOffering?.availablePackages.find(
        pkg => pkg.product.identifier === productId
      );

      if (!packageToPurchase) {
        return {
          success: false,
          error: 'Package not found'
        };
      }

      // Make the purchase
      const { customerInfo, productIdentifier } = await Purchases.purchasePackage(packageToPurchase);
      
      if (__DEV__) {
        console.log('RevenueCat purchase successful:', {
          productIdentifier,
          activeEntitlements: Object.keys(customerInfo.entitlements.active),
          latestExpirationDate: customerInfo.latestExpirationDate
        });
      }

      return {
        success: true,
        customerInfo,
        purchaseToken: productIdentifier // RevenueCat handles tokens internally
      };

    } catch (error: any) {
      if (__DEV__) {
        console.error('RevenueCat purchase failed:', error);
      }

      let errorMessage = 'Purchase failed. Please try again.';
      
      if (error.code) {
        switch (error.code) {
          case 'PURCHASE_CANCELLED':
            errorMessage = 'Purchase cancelled';
            break;
          case 'STORE_PROBLEM':
            errorMessage = 'Store is currently unavailable';
            break;
          case 'PURCHASE_NOT_ALLOWED':
            errorMessage = 'Purchase not allowed on this device';
            break;
          case 'PURCHASE_INVALID':
            errorMessage = 'Invalid purchase';
            break;
          case 'PRODUCT_NOT_AVAILABLE':
            errorMessage = 'Product not available';
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      }

      return {
        success: false,
        error: errorMessage
      };
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
    this.offerings = null;
    
    if (__DEV__) {
      console.log('RevenueCatService disconnected');
    }
  }
}

export default RevenueCatService;