import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  getDocs,
  getDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  Product,
  Order,
  Customer,
  CompanySettings,
  SampleLeadRequest,
  OrderStatus,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS,
  INITIAL_SAMPLE_REQUESTS,
} from '../data/initialData';
import { normalizeWhatsAppNumber } from '../utils/whatsapp';

/**
 * Firestore Collections & Document Identifiers
 * Firestore serves as the SINGLE SOURCE OF TRUTH across the application.
 */
export const COLLECTIONS = {
  SETTINGS: 'settings',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  CUSTOMERS: 'customers',
  SAMPLE_REQUESTS: 'sampleRequests',
} as const;

export const SETTINGS_DOC_ID = 'general';

export const FirestoreService = {
  /**
   * Seed initial data into Cloud Firestore if collections / docs are brand new
   */
  async seedInitialFirestoreData(): Promise<void> {
    try {
      // 1. Settings & Store Profile (Collection: settings, Doc: general)
      const settingsDocRef = doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID);
      const settingsSnap = await getDoc(settingsDocRef);
      if (!settingsSnap.exists()) {
        await setDoc(settingsDocRef, {
          ...INITIAL_SETTINGS,
          adminPin: '1980', // Default PIN is strictly "1980"
        });
      }

      // 2. Products collection
      const prodSnap = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
      if (prodSnap.empty) {
        await this.seedProducts();
      }

      // 3. Customers CRM collection
      const custSnap = await getDocs(collection(db, COLLECTIONS.CUSTOMERS));
      if (custSnap.empty) {
        const batch = writeBatch(db);
        INITIAL_CUSTOMERS.forEach((c) => {
          batch.set(doc(db, COLLECTIONS.CUSTOMERS, c.id), c);
        });
        await batch.commit();
      }

      // 4. Orders collection
      const ordersSnap = await getDocs(collection(db, COLLECTIONS.ORDERS));
      if (ordersSnap.empty) {
        const batch = writeBatch(db);
        INITIAL_ORDERS.forEach((o) => {
          batch.set(doc(db, COLLECTIONS.ORDERS, o.id), o);
        });
        await batch.commit();
      }

      // 5. Sample Lead Requests collection
      const leadsSnap = await getDocs(collection(db, COLLECTIONS.SAMPLE_REQUESTS));
      if (leadsSnap.empty) {
        const batch = writeBatch(db);
        INITIAL_SAMPLE_REQUESTS.forEach((l) => {
          batch.set(doc(db, COLLECTIONS.SAMPLE_REQUESTS, l.id), l);
        });
        await batch.commit();
      }
    } catch (err) {
      console.warn('Firestore initial seeding warning (network or permissions):', err);
    }
  },

  /**
   * Seed default product catalog to Firestore
   */
  async seedProducts(): Promise<void> {
    try {
      const batch = writeBatch(db);
      INITIAL_PRODUCTS.forEach((p) => {
        batch.set(doc(db, COLLECTIONS.PRODUCTS, p.id), p);
      });
      await batch.commit();
    } catch (err) {
      console.error('Error seeding products to Firestore:', err);
    }
  },

  // =========================================================================
  // 1. SETTINGS & STORE PROFILE (Collection: settings, Doc: general)
  // =========================================================================

  /**
   * Real-time listener for Settings & Store Profile
   * Header, Contact Buttons, and Auth Modal read live from this doc via onSnapshot
   */
  subscribeSettings(
    onData: (settings: CompanySettings) => void,
    onError?: (err: Error) => void
  ): () => void {
    try {
      const docRef = doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID);
      return onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            const merged: CompanySettings = {
              ...INITIAL_SETTINGS,
              ...data,
              adminPin: data.adminPin || '1980',
              minOrderAmount: data.minOrderAmount ?? 0,
              cutOffHour: data.cutOffHour ?? 21,
            };
            onData(merged);
          } else {
            // Document does not exist yet: seed it with 1980 PIN and notify
            const initialWithPin = { ...INITIAL_SETTINGS, adminPin: '1980' };
            setDoc(docRef, initialWithPin, { merge: true }).catch(console.warn);
            onData(initialWithPin);
          }
        },
        (error) => {
          console.warn('Settings Firestore snapshot error:', error);
          if (onError) onError(error);
        }
      );
    } catch (err) {
      console.warn('Failed to subscribe to settings:', err);
      return () => {};
    }
  },

  /**
   * Update Settings & Store Profile immediately in Firestore
   * Calls setDoc(doc(db, "settings", "general"), updatedData, { merge: true })
   */
  async saveSettings(updatedData: Partial<CompanySettings>): Promise<void> {
    try {
      await setDoc(doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID), updatedData, { merge: true });
    } catch (err) {
      console.error('Failed to save settings to Firestore doc settings/general:', err);
      throw err;
    }
  },

  // =========================================================================
  // 2. PRODUCTS & INVENTORY (Collection: products)
  // =========================================================================

  /**
   * Real-time listener for Products collection
   */
  subscribeProducts(
    onData: (products: Product[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    try {
      const q = collection(db, COLLECTIONS.PRODUCTS);
      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const items = snapshot.docs.map((d) => d.data() as Product);
            // Stable ordering using initial index or product id
            const initialMap = new Map<string, number>(INITIAL_PRODUCTS.map((p, idx) => [p.id, idx]));
            items.sort((a, b) => {
              const aIdx = initialMap.has(a.id) ? (initialMap.get(a.id) as number) : 999;
              const bIdx = initialMap.has(b.id) ? (initialMap.get(b.id) as number) : 999;
              return aIdx - bIdx;
            });
            onData(items);
          } else {
            // If collection is empty, seed once with initial product list
            this.seedProducts().catch(console.warn);
            onData(INITIAL_PRODUCTS);
          }
        },
        (error) => {
          console.warn('Products Firestore snapshot error:', error);
          if (onError) onError(error);
        }
      );
    } catch (err) {
      console.warn('Failed to subscribe to products:', err);
      return () => {};
    }
  },

  /**
   * Save or update product in Firestore
   */
  async saveProduct(product: Product): Promise<void> {
    try {
      await setDoc(doc(db, COLLECTIONS.PRODUCTS, product.id), product, { merge: true });
    } catch (err) {
      console.error('Failed to save product to Firestore:', err);
      throw err;
    }
  },

  /**
   * Partial update for product (e.g. price, inStock, isWeeklyDeal)
   */
  async updateProduct(productId: string, data: Partial<Product>): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTIONS.PRODUCTS, productId), data);
    } catch (err) {
      console.error('Failed to update product in Firestore:', err);
      throw err;
    }
  },

  /**
   * Delete product from Firestore
   */
  async deleteProduct(productId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, productId));
    } catch (err) {
      console.error('Failed to delete product from Firestore:', err);
      throw err;
    }
  },

  /**
   * Reset all products to initial seed
   */
  async resetProducts(): Promise<void> {
    try {
      const snap = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
      const batch = writeBatch(db);
      snap.docs.forEach((d) => batch.delete(d.ref));
      INITIAL_PRODUCTS.forEach((p) => {
        batch.set(doc(db, COLLECTIONS.PRODUCTS, p.id), p);
      });
      await batch.commit();
    } catch (err) {
      console.error('Failed to reset products in Firestore:', err);
      throw err;
    }
  },

  // =========================================================================
  // 3. ORDERS (Collection: orders)
  // =========================================================================

  /**
   * Real-time listener for Orders collection
   */
  subscribeOrders(
    onData: (orders: Order[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    try {
      const q = collection(db, COLLECTIONS.ORDERS);
      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const items = snapshot.docs.map((d) => d.data() as Order);
            items.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            onData(items);
          } else {
            onData([]);
          }
        },
        (error) => {
          console.warn('Orders Firestore snapshot error:', error);
          if (onError) onError(error);
        }
      );
    } catch (err) {
      console.warn('Failed to subscribe to orders:', err);
      return () => {};
    }
  },

  /**
   * Save new order to Firestore
   */
  async saveOrder(order: Order): Promise<void> {
    try {
      await setDoc(doc(db, COLLECTIONS.ORDERS, order.id), order);
    } catch (err) {
      console.error('Failed to save order to Firestore:', err);
      throw err;
    }
  },

  /**
   * Update order status in Firestore
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), { status });
    } catch (err) {
      console.error('Failed to update order status in Firestore:', err);
      throw err;
    }
  },

  /**
   * Delete order from Firestore
   */
  async deleteOrder(orderId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.ORDERS, orderId));
    } catch (err) {
      console.error('Failed to delete order from Firestore:', err);
      throw err;
    }
  },

  // =========================================================================
  // 4. CUSTOMERS CRM (Collection: customers)
  // =========================================================================

  /**
   * Real-time listener for Customers CRM collection
   */
  subscribeCustomers(
    onData: (customers: Customer[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    try {
      const q = collection(db, COLLECTIONS.CUSTOMERS);
      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const items = snapshot.docs.map((d) => d.data() as Customer);
            items.sort(
              (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            );
            onData(items);
          } else {
            onData([]);
          }
        },
        (error) => {
          console.warn('Customers Firestore snapshot error:', error);
          if (onError) onError(error);
        }
      );
    } catch (err) {
      console.warn('Failed to subscribe to customers:', err);
      return () => {};
    }
  },

  /**
   * Save or update customer record in Firestore
   */
  async saveCustomer(customer: Customer): Promise<void> {
    try {
      await setDoc(doc(db, COLLECTIONS.CUSTOMERS, customer.id), customer, { merge: true });
    } catch (err) {
      console.error('Failed to save customer to Firestore:', err);
      throw err;
    }
  },

  /**
   * Delete customer record from Firestore
   */
  async deleteCustomer(customerId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.CUSTOMERS, customerId));
    } catch (err) {
      console.error('Failed to delete customer from Firestore:', err);
      throw err;
    }
  },

  /**
   * Reset customers to initial seed in Firestore
   */
  async resetCustomers(): Promise<void> {
    try {
      const snap = await getDocs(collection(db, COLLECTIONS.CUSTOMERS));
      const batch = writeBatch(db);
      snap.docs.forEach((d) => batch.delete(d.ref));
      INITIAL_CUSTOMERS.forEach((c) => {
        batch.set(doc(db, COLLECTIONS.CUSTOMERS, c.id), c);
      });
      await batch.commit();
    } catch (err) {
      console.error('Failed to reset customers in Firestore:', err);
      throw err;
    }
  },

  /**
   * Auto-capture or update customer from an incoming order directly in Firestore
   */
  async upsertCustomerFromOrder(order: Order, currentCustomers: Customer[]): Promise<void> {
    try {
      const orderNormPhone = normalizeWhatsAppNumber(order.phone);
      const existing = currentCustomers.find((c) => {
        const custNormPhone = normalizeWhatsAppNumber(c.phone);
        return (
          custNormPhone === orderNormPhone ||
          (orderNormPhone.length >= 9 && custNormPhone.endsWith(orderNormPhone.slice(-9)))
        );
      });

      if (existing) {
        const updatedCust: Customer = {
          ...existing,
          shopName: order.shopName || existing.shopName,
          businessType: order.businessType || existing.businessType,
          responsibleName: order.responsibleName || existing.responsibleName,
          district: order.district || existing.district,
          address: order.fullAddress || existing.address,
          status: existing.status === 'متوقف' ? 'عميل منتظم' : existing.status,
          totalOrdersCount: (existing.totalOrdersCount || 0) + 1,
          totalSpent: (existing.totalSpent || 0) + order.totalAmount,
          lastOrderDate: order.createdAt,
          notes: existing.notes
            ? `${existing.notes} | آخر طلب: #${order.id} (${order.totalAmount} ج)`
            : `آخر طلبية: #${order.id} بمبلغ ${order.totalAmount} ج`,
        };
        await setDoc(doc(db, COLLECTIONS.CUSTOMERS, existing.id), updatedCust, { merge: true });
      } else {
        const newCust: Customer = {
          id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
          shopName: order.shopName,
          businessType: order.businessType,
          responsibleName: order.responsibleName,
          phone: order.phone,
          district: order.district,
          address: order.fullAddress,
          status: 'عميل منتظم',
          notes: `مسجل تلقائياً من الطلبية #${order.id} بمبلغ ${order.totalAmount} ج.م`,
          totalOrdersCount: 1,
          totalSpent: order.totalAmount,
          lastOrderDate: order.createdAt,
          createdAt: order.createdAt || new Date().toISOString(),
        };
        await setDoc(doc(db, COLLECTIONS.CUSTOMERS, newCust.id), newCust);
      }
    } catch (err) {
      console.error('Failed to upsert customer from order in Firestore:', err);
    }
  },

  // =========================================================================
  // 5. SAMPLE REQUESTS & LEADS (Collection: sampleRequests)
  // =========================================================================

  /**
   * Real-time listener for Sample Requests
   */
  subscribeSampleRequests(
    onData: (requests: SampleLeadRequest[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    try {
      const q = collection(db, COLLECTIONS.SAMPLE_REQUESTS);
      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const items = snapshot.docs.map((d) => d.data() as SampleLeadRequest);
            items.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            onData(items);
          } else {
            onData([]);
          }
        },
        (error) => {
          console.warn('Sample requests Firestore snapshot error:', error);
          if (onError) onError(error);
        }
      );
    } catch (err) {
      console.warn('Failed to subscribe to sample requests:', err);
      return () => {};
    }
  },

  /**
   * Save sample request & auto-register lead customer in Firestore
   */
  async saveSampleRequest(request: SampleLeadRequest, currentCustomers: Customer[]): Promise<void> {
    try {
      await setDoc(doc(db, COLLECTIONS.SAMPLE_REQUESTS, request.id), request);

      // Also register in CRM customers collection as new potential lead
      const reqNormPhone = normalizeWhatsAppNumber(request.phone);
      const existing = currentCustomers.find(
        (c) => normalizeWhatsAppNumber(c.phone) === reqNormPhone
      );

      if (!existing) {
        const leadCust: Customer = {
          id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
          shopName: request.shopName,
          businessType: request.businessType,
          responsibleName: request.responsibleName,
          phone: request.phone,
          district: request.district,
          status: 'عميل محتمل / مسجل جديد',
          notes: `طلب زيارة سيارة التوريدات وعينات أصناف: (${request.interestedItems.join('، ')})`,
          totalOrdersCount: 0,
          totalSpent: 0,
          createdAt: request.createdAt,
        };
        await setDoc(doc(db, COLLECTIONS.CUSTOMERS, leadCust.id), leadCust);
      }
    } catch (err) {
      console.error('Failed to save sample request to Firestore:', err);
    }
  },
};
