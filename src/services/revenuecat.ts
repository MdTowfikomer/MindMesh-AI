import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

// RevenueCat Service wrapper with safe fallback support for Expo Go / Web testing
export class RevenueCatService {
  private static isInitialized = false;

  // Detect if running inside standard Expo Go client
  private static isExpoGo(): boolean {
    return (
      Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
      Constants.appOwnership === 'expo'
    );
  }

  public static async configure() {
    if (this.isInitialized) return;

    try {
      if ((Platform.OS === 'ios' || Platform.OS === 'android') && !this.isExpoGo()) {
        const Purchases = require('react-native-purchases').default;
        const apiKey = Platform.OS === 'ios' ? 'appl_mock_revenuecat_ios_key' : 'goog_mock_revenuecat_android_key';
        await Purchases.configure({ apiKey });
        console.log('[RevenueCat] Native SDK Initialized successfully (Dev Build)');
      } else {
        console.log('[RevenueCat] Expo Go / Sandbox environment: Using mock entitlement mode');
      }
      this.isInitialized = true;
    } catch (error) {
      console.warn('[RevenueCat] Purchases SDK fallback mode:', error);
    }
  }

  public static async getOfferings() {
    try {
      if ((Platform.OS === 'ios' || Platform.OS === 'android') && !this.isExpoGo()) {
        const Purchases = require('react-native-purchases').default;
        const offerings = await Purchases.getOfferings();
        if (offerings.current !== null) {
          return offerings.current;
        }
      }
    } catch (e) {
      console.log('[RevenueCat] Mock offerings returned');
    }

    return {
      identifier: 'default',
      monthly: {
        identifier: 'pro_monthly_999',
        product: { title: 'MindMesh Pro Monthly', priceString: '$9.99/mo', price: 9.99 }
      },
      annual: {
        identifier: 'pro_annual_4999',
        product: { title: 'MindMesh Pro Annual (7-Day Trial)', priceString: '$49.99/yr', price: 49.99 }
      }
    };
  }

  public static async purchasePro(): Promise<boolean> {
    try {
      if ((Platform.OS === 'ios' || Platform.OS === 'android') && !this.isExpoGo()) {
        const Purchases = require('react-native-purchases').default;
        const offerings = await Purchases.getOfferings();
        if (offerings.current?.annual) {
          const { customerInfo } = await Purchases.purchasePackage(offerings.current.annual);
          return customerInfo.entitlements.active['Pro Access'] !== undefined;
        }
      }
    } catch (error: any) {
      if (error.userCancelled) {
        return false;
      }
    }
    // Sandbox / Mock simulation success
    return true;
  }

  public static async restorePurchases(): Promise<boolean> {
    try {
      if ((Platform.OS === 'ios' || Platform.OS === 'android') && !this.isExpoGo()) {
        const Purchases = require('react-native-purchases').default;
        const customerInfo = await Purchases.restorePurchases();
        return customerInfo.entitlements.active['Pro Access'] !== undefined;
      }
    } catch (error) {
      console.warn('[RevenueCat] Restore fallback:', error);
    }
    return true;
  }
}
