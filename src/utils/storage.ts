import { CartItem } from '../types';

/**
 * Client-Side Local Storage Service
 * STRICTLY for browser-specific session state:
 * 1. User's personal shopping cart (CartItem[])
 * 2. Admin dashboard session login state (boolean)
 * 
 * ALL business data (Settings, Products, Orders, Customers CRM, Sample Leads)
 * is managed exclusively with Firebase Firestore as the Single Source of Truth.
 */

const STORAGE_KEYS = {
  CART: 'alnoor_wholesale_cart_v1',
  AUTH: 'alnoor_wholesale_admin_auth_v1',
};

// Safe wrapper to prevent crashes in private browsing or disabled storage
function safeGetItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

function safeSetItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
}

export const StorageService = {
  // Shopping Cart (Local per browser session)
  getCart(): CartItem[] {
    return safeGetItem<CartItem[]>(STORAGE_KEYS.CART, []);
  },

  saveCart(cart: CartItem[]): void {
    safeSetItem(STORAGE_KEYS.CART, cart);
  },

  clearCart(): void {
    safeSetItem(STORAGE_KEYS.CART, []);
  },

  // Admin Auth Session
  getAdminAuth(): boolean {
    return safeGetItem<boolean>(STORAGE_KEYS.AUTH, false);
  },

  setAdminAuth(isAuthed: boolean): void {
    safeSetItem(STORAGE_KEYS.AUTH, isAuthed);
  },
};
