import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Product, Order, Customer, CompanySettings, SampleLeadRequest, OrderStatus } from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS,
  INITIAL_SAMPLE_REQUESTS,
} from '../data/initialData';

// Firestore collection names
const COLLECTIONS = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
  CUSTOMERS: 'customers',
  SETTINGS: 'settings',
  SAMPLE_REQUESTS: 'sampleRequests',
};

export const FirestoreService = {
  /**
   * Seed initial data into Cloud Firestore if collections are empty
   */
  async seedInitialFirestoreData(): Promise<void> {
    try {
      // Check products
      const prodSnap = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
      if (prodSnap.empty) {
        const batch = writeBatch(db);
        INITIAL_PRODUCTS.forEach((p) => {
          batch.set(doc(db, COLLECTIONS.PRODUCTS, p.id), p);
        });
        await batch.commit();
      }

      // Check settings
      const settingsSnap = await getDocs(collection(db, COLLECTIONS.SETTINGS));
      if (settingsSnap.empty) {
        await setDoc(doc(db, COLLECTIONS.SETTINGS, 'company'), INITIAL_SETTINGS);
      }

      // Check orders
      const ordersSnap = await getDocs(collection(db, COLLECTIONS.ORDERS));
      if (ordersSnap.empty) {
        const batch = writeBatch(db);
        INITIAL_ORDERS.forEach((o) => {
          batch.set(doc(db, COLLECTIONS.ORDERS, o.id), o);
        });
        await batch.commit();
      }

      // Check customers
      const custSnap = await getDocs(collection(db, COLLECTIONS.CUSTOMERS));
      if (custSnap.empty) {
        const batch = writeBatch(db);
        INITIAL_CUSTOMERS.forEach((c) => {
          batch.set(doc(db, COLLECTIONS.CUSTOMERS, c.id), c);
        });
        await batch.commit();
      }

      // Check sample requests
      const leadsSnap = await getDocs(collection(db, COLLECTIONS.SAMPLE_REQUESTS));
      if (leadsSnap.empty) {
        const batch = writeBatch(db);
        INITIAL_SAMPLE_REQUESTS.forEach((l) => {
          batch.set(doc(db, COLLECTIONS.SAMPLE_REQUESTS, l.id), l);
        });
        await batch.commit();
      }
    } catch (err) {
      console.warn('Firestore initial seeding skipped or permissions restricted:', err);
    }
  },

  /**
   * Real-time listener for Products
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
            onData(items);
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
   * Real-time listener for Orders
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
            // Sort by createdAt descending
            items.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            onData(items);
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
   * Real-time listener for Customers CRM
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
            onData(items);
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
   * Real-time listener for Company Settings
   */
  subscribeSettings(
    onData: (settings: CompanySettings) => void,
    onError?: (err: Error) => void
  ): () => void {
    try {
      const docRef = doc(db, COLLECTIONS.SETTINGS, 'company');
      return onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            onData(snapshot.data() as CompanySettings);
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
   * Real-time listener for Sample Lead Requests
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

  // --- Cloud Write Operations ---

  async saveProduct(product: Product): Promise<void> {
    try {
      await setDoc(doc(db, COLLECTIONS.PRODUCTS, product.id), product);
    } catch (err) {
      console.warn('Failed to save product to Firestore:', err);
    }
  },

  async deleteProduct(productId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, productId));
    } catch (err) {
      console.warn('Failed to delete product from Firestore:', err);
    }
  },

  async saveOrder(order: Order): Promise<void> {
    try {
      await setDoc(doc(db, COLLECTIONS.ORDERS, order.id), order);
    } catch (err) {
      console.warn('Failed to save order to Firestore:', err);
    }
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), { status });
    } catch (err) {
      console.warn('Failed to update order status in Firestore:', err);
    }
  },

  async deleteOrder(orderId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.ORDERS, orderId));
    } catch (err) {
      console.warn('Failed to delete order from Firestore:', err);
    }
  },

  async saveCustomer(customer: Customer): Promise<void> {
    try {
      await setDoc(doc(db, COLLECTIONS.CUSTOMERS, customer.id), customer);
    } catch (err) {
      console.warn('Failed to save customer to Firestore:', err);
    }
  },

  async deleteCustomer(customerId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.CUSTOMERS, customerId));
    } catch (err) {
      console.warn('Failed to delete customer from Firestore:', err);
    }
  },

  async saveSettings(settings: CompanySettings): Promise<void> {
    try {
      await setDoc(doc(db, COLLECTIONS.SETTINGS, 'company'), settings);
    } catch (err) {
      console.warn('Failed to save settings to Firestore:', err);
    }
  },

  async saveSampleRequest(request: SampleLeadRequest): Promise<void> {
    try {
      await setDoc(doc(db, COLLECTIONS.SAMPLE_REQUESTS, request.id), request);
    } catch (err) {
      console.warn('Failed to save sample request to Firestore:', err);
    }
  },
};

