import { Product, CompanySettings, Order, CartItem, Customer, SampleLeadRequest, RecurringSubscription } from '../types';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS, INITIAL_ORDERS, INITIAL_CUSTOMERS, INITIAL_SAMPLE_REQUESTS } from '../data/initialData';
import { normalizeWhatsAppNumber } from './whatsapp';

const STORAGE_KEYS = {
  PRODUCTS: 'alnoor_wholesale_products_v1',
  SETTINGS: 'alnoor_wholesale_settings_v1',
  ORDERS: 'alnoor_wholesale_orders_v1',
  CUSTOMERS: 'alnoor_wholesale_customers_v1',
  SAMPLE_REQUESTS: 'alnoor_wholesale_leads_v1',
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
  getProducts(): Product[] {
    const stored = safeGetItem<Product[] | null>(STORAGE_KEYS.PRODUCTS, null);
    if (!stored || stored.length === 0) {
      safeSetItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }
    return stored;
  },

  saveProducts(products: Product[]): void {
    safeSetItem(STORAGE_KEYS.PRODUCTS, products);
  },

  resetProducts(): Product[] {
    safeSetItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    return INITIAL_PRODUCTS;
  },

  getSettings(): CompanySettings {
    const stored = safeGetItem<Partial<CompanySettings> | null>(STORAGE_KEYS.SETTINGS, null);
    if (!stored) {
      safeSetItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
      return INITIAL_SETTINGS;
    }
    // Zero minimum order guarantee & cutoff defaults
    return {
      ...INITIAL_SETTINGS,
      ...stored,
      minOrderAmount: stored.minOrderAmount ?? 0,
      cutOffHour: stored.cutOffHour ?? 21,
    };
  },

  saveSettings(settings: CompanySettings): void {
    safeSetItem(STORAGE_KEYS.SETTINGS, settings);
  },

  getOrders(): Order[] {
    const stored = safeGetItem<Order[] | null>(STORAGE_KEYS.ORDERS, null);
    if (!stored) {
      safeSetItem(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
      return INITIAL_ORDERS;
    }
    return stored;
  },

  saveOrders(orders: Order[]): void {
    safeSetItem(STORAGE_KEYS.ORDERS, orders);
  },

  addOrder(newOrder: Order): Order[] {
    const orders = this.getOrders();
    const updated = [newOrder, ...orders];
    this.saveOrders(updated);
    return updated;
  },

  updateOrderStatus(orderId: string, status: Order['status']): Order[] {
    const orders = this.getOrders();
    const updated = orders.map(order => 
      order.id === orderId ? { ...order, status } : order
    );
    this.saveOrders(updated);
    return updated;
  },

  deleteOrder(orderId: string): Order[] {
    const orders = this.getOrders();
    const updated = orders.filter(order => order.id !== orderId);
    this.saveOrders(updated);
    return updated;
  },

  resetOrders(): Order[] {
    safeSetItem(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    return INITIAL_ORDERS;
  },

  // CRM Customers Management
  getCustomers(): Customer[] {
    const stored = safeGetItem<Customer[] | null>(STORAGE_KEYS.CUSTOMERS, null);
    if (!stored || stored.length === 0) {
      safeSetItem(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
      return INITIAL_CUSTOMERS;
    }
    return stored;
  },

  saveCustomers(customers: Customer[]): void {
    safeSetItem(STORAGE_KEYS.CUSTOMERS, customers);
  },

  addCustomer(customer: Customer): Customer[] {
    const customers = this.getCustomers();
    const updated = [customer, ...customers];
    this.saveCustomers(updated);
    return updated;
  },

  updateCustomer(customer: Customer): Customer[] {
    const customers = this.getCustomers();
    const updated = customers.map(c => c.id === customer.id ? customer : c);
    this.saveCustomers(updated);
    return updated;
  },

  deleteCustomer(customerId: string): Customer[] {
    const customers = this.getCustomers();
    const updated = customers.filter(c => c.id !== customerId);
    this.saveCustomers(updated);
    return updated;
  },

  resetCustomers(): Customer[] {
    safeSetItem(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    return INITIAL_CUSTOMERS;
  },

  // Auto-capture or update customer from an incoming order
  upsertCustomerFromOrder(order: Order): Customer[] {
    const customers = this.getCustomers();
    const orderNormPhone = normalizeWhatsAppNumber(order.phone);

    const existingIndex = customers.findIndex(c => {
      const custNormPhone = normalizeWhatsAppNumber(c.phone);
      return custNormPhone === orderNormPhone ||
        (orderNormPhone.length >= 9 && custNormPhone.endsWith(orderNormPhone.slice(-9)));
    });

    if (existingIndex >= 0) {
      const existing = customers[existingIndex];
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
          : `آخر طلبية: #${order.id} بمبلغ ${order.totalAmount} ج`
      };
      customers[existingIndex] = updatedCust;
    } else {
      const newCust: Customer = {
        id: `CUST-${Math.floor(100 + Math.random() * 900)}`,
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
        createdAt: order.createdAt || new Date().toISOString()
      };
      customers.unshift(newCust);
    }

    this.saveCustomers(customers);
    return [...customers];
  },

  // Sample Lead Requests
  getSampleRequests(): SampleLeadRequest[] {
    const stored = safeGetItem<SampleLeadRequest[] | null>(STORAGE_KEYS.SAMPLE_REQUESTS, null);
    if (!stored || stored.length === 0) {
      safeSetItem(STORAGE_KEYS.SAMPLE_REQUESTS, INITIAL_SAMPLE_REQUESTS);
      return INITIAL_SAMPLE_REQUESTS;
    }
    return stored;
  },

  saveSampleRequests(requests: SampleLeadRequest[]): void {
    safeSetItem(STORAGE_KEYS.SAMPLE_REQUESTS, requests);
  },

  addSampleRequest(req: SampleLeadRequest): SampleLeadRequest[] {
    const requests = this.getSampleRequests();
    const updated = [req, ...requests];
    this.saveSampleRequests(updated);

    // Also register in CRM customers as new potential lead
    const customers = this.getCustomers();
    const existing = customers.find(c => normalizeWhatsAppNumber(c.phone) === normalizeWhatsAppNumber(req.phone));
    if (!existing) {
      const leadCust: Customer = {
        id: `CUST-${Math.floor(100 + Math.random() * 900)}`,
        shopName: req.shopName,
        businessType: req.businessType,
        responsibleName: req.responsibleName,
        phone: req.phone,
        district: req.district,
        status: 'عميل محتمل / مسجل جديد',
        notes: `طلب زيارة سيارة التوريدات وعينات أصناف: (${req.interestedItems.join('، ')})`,
        totalOrdersCount: 0,
        totalSpent: 0,
        createdAt: req.createdAt,
      };
      this.saveCustomers([leadCust, ...customers]);
    }

    return updated;
  },

  updateSampleRequestStatus(id: string, status: SampleLeadRequest['status']): SampleLeadRequest[] {
    const requests = this.getSampleRequests();
    const updated = requests.map(r => r.id === id ? { ...r, status } : r);
    this.saveSampleRequests(updated);
    return updated;
  },

  getCart(): CartItem[] {
    return safeGetItem<CartItem[]>(STORAGE_KEYS.CART, []);
  },

  saveCart(cart: CartItem[]): void {
    safeSetItem(STORAGE_KEYS.CART, cart);
  },

  clearCart(): void {
    safeSetItem(STORAGE_KEYS.CART, []);
  },

  getAdminAuth(): boolean {
    return safeGetItem<boolean>(STORAGE_KEYS.AUTH, false);
  },

  setAdminAuth(isAuthed: boolean): void {
    safeSetItem(STORAGE_KEYS.AUTH, isAuthed);
  }
};
