import React, { useState, useEffect, useMemo } from 'react';
import {
  Product,
  CartItem,
  Order,
  OrderStatus,
  CompanySettings,
  Customer,
  SampleLeadRequest,
} from './types';
import { StorageService } from './utils/storage';
import { Header } from './components/Header';
import { CutOffBanner } from './components/CutOffBanner';
import { RouteBanner } from './components/RouteBanner';
import { CategoryFilter, CategoryFilterType } from './components/CategoryFilter';
import { ProductCard } from './components/ProductCard';
import { CartBottomBar } from './components/CartBottomBar';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { LeadMachineModal } from './components/LeadMachineModal';
import { AdminAuthModal } from './components/Admin/AdminAuthModal';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { Footer } from './components/Footer';
import { PackageX, Sparkles, Gift } from 'lucide-react';

export function App() {
  // Primary persistent state from localStorage
  const [products, setProducts] = useState<Product[]>(() => StorageService.getProducts());
  const [cart, setCart] = useState<CartItem[]>(() => StorageService.getCart());
  const [orders, setOrders] = useState<Order[]>(() => StorageService.getOrders());
  const [customers, setCustomers] = useState<Customer[]>(() => StorageService.getCustomers());
  const [settings, setSettings] = useState<CompanySettings>(() => StorageService.getSettings());
  const [isAdminAuthed, setIsAdminAuthed] = useState<boolean>(() => StorageService.getAdminAuth());

  // Search & Filtering state
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilterType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Navigation
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isOrderSuccessModalOpen, setIsOrderSuccessModalOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [currentSuccessOrder, setCurrentSuccessOrder] = useState<Order | null>(null);
  const [currentWhatsAppUrl, setCurrentWhatsAppUrl] = useState<string>('');

  // Save cart changes to localStorage
  useEffect(() => {
    StorageService.saveCart(cart);
  }, [cart]);

  // Handle Cart Updates
  const handleUpdateQuantity = (product: Product, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.product.id !== product.id);
      }
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity } : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleClearCart = () => {
    setCart([]);
    StorageService.clearCart();
  };

  // Handle Order Placed (With Auto-Capture to CRM Database)
  const handleOrderCompleted = (order: Order, whatsappUrl: string) => {
    const updatedOrders = StorageService.addOrder(order);
    setOrders(updatedOrders);

    // Auto-capture or update in CRM database
    const updatedCustomers = StorageService.upsertCustomerFromOrder(order);
    setCustomers(updatedCustomers);

    handleClearCart();
    setIsCheckoutModalOpen(false);
    setIsCartDrawerOpen(false);
    setCurrentSuccessOrder(order);
    setCurrentWhatsAppUrl(whatsappUrl);
    setIsOrderSuccessModalOpen(true);
  };

  const handleNewOrder = () => {
    setIsOrderSuccessModalOpen(false);
    setCurrentSuccessOrder(null);
  };

  // Handle Lead Request (Public Floating Visit / Sample Form)
  const handleLeadRequestSubmit = (request: SampleLeadRequest) => {
    StorageService.addSampleRequest(request);
    // Reload customers to reflect new lead in CRM
    setCustomers(StorageService.getCustomers());
  };

  // Admin Actions
  const handleOpenAdmin = () => {
    if (isAdminAuthed) {
      setIsAdminDashboardOpen(true);
    } else {
      setIsAdminAuthModalOpen(true);
    }
  };

  const handleAdminAuthenticated = () => {
    setIsAdminAuthed(true);
    StorageService.setAdminAuth(true);
    setIsAdminAuthModalOpen(false);
    setIsAdminDashboardOpen(true);
  };

  const handleAdminLogout = () => {
    setIsAdminAuthed(false);
    StorageService.setAdminAuth(false);
    setIsAdminDashboardOpen(false);
  };

  const handleAddProduct = (newProduct: Product) => {
    const updated = [newProduct, ...products];
    setProducts(updated);
    StorageService.saveProducts(updated);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    const updated = products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
    setProducts(updated);
    StorageService.saveProducts(updated);

    // Also update product inside cart if present
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === updatedProduct.id
          ? { ...item, product: updatedProduct }
          : item
      )
    );
  };

  const handleDeleteProduct = (productId: string) => {
    const updated = products.filter((p) => p.id !== productId);
    setProducts(updated);
    StorageService.saveProducts(updated);
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleResetProducts = () => {
    const defaults = StorageService.resetProducts();
    setProducts(defaults);
    setCart([]);
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    const updated = StorageService.updateOrderStatus(orderId, status);
    setOrders(updated);
  };

  const handleDeleteOrder = (orderId: string) => {
    const updated = StorageService.deleteOrder(orderId);
    setOrders(updated);
  };

  const handleSaveSettings = (newSettings: CompanySettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
  };

  // Customer CRM Handlers
  const handleAddCustomer = (newCustomer: Customer) => {
    const updated = StorageService.addCustomer(newCustomer);
    setCustomers(updated);
  };

  const handleUpdateCustomer = (updatedCustomer: Customer) => {
    const updated = StorageService.updateCustomer(updatedCustomer);
    setCustomers(updated);
  };

  const handleDeleteCustomer = (customerId: string) => {
    const updated = StorageService.deleteCustomer(customerId);
    setCustomers(updated);
  };

  const handleResetCustomers = () => {
    const defaults = StorageService.resetCustomers();
    setCustomers(defaults);
  };

  // Filtered products calculation
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      let matchesCat = true;
      if (selectedCategory === 'weekly-deals') {
        matchesCat = product.isWeeklyDeal;
      } else if (selectedCategory !== 'all') {
        matchesCat = product.category === selectedCategory;
      }

      // Search query filter
      let matchesSearch = true;
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        matchesSearch = Boolean(
          product.name.toLowerCase().includes(query) ||
          product.unit.toLowerCase().includes(query) ||
          (product.description && product.description.toLowerCase().includes(query)) ||
          (product.bulkDiscountNote && product.bulkDiscountNote.toLowerCase().includes(query))
        );
      }

      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const dealsCount = useMemo(() => products.filter((p) => p.isWeeklyDeal).length, [products]);

  // Cart quantity lookup helper
  const getProductCartQuantity = (productId: string) => {
    const item = cart.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Top Header */}
      <Header settings={settings} onOpenAdmin={handleOpenAdmin} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6">
        {/* Order Cut-Off Timer & Next-Day Delivery Status Banner */}
        <CutOffBanner settings={settings} />

        {/* Dynamic Alexandria Route Schedule Banner */}
        <RouteBanner schedules={settings.routeSchedules} />

        {/* Category Selector Pills & Search Bar */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalProductsCount={products.length}
          dealsCount={dealsCount}
        />

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 pb-28">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                cartQuantity={getProductCartQuantity(product.id)}
                onUpdateQuantity={handleUpdateQuantity}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center text-slate-400 my-8 shadow-sm">
            <PackageX className="w-16 h-16 stroke-1 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-base">لا توجد أصناف تطابق بحثك حالياً</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              جرب تغيير كلمة البحث أو اختيار قسم آخر لعرض منتجات التوريد والجملة المتاحة
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-xl border border-brand-200 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>إعادة عرض كافة المنتجات ({products.length} صنف)</span>
            </button>
          </div>
        )}
      </main>

      {/* Public Floating Action Button for New Restaurants / Sample Visits */}
      <div className="fixed bottom-24 right-4 sm:right-6 z-30">
        <button
          onClick={() => setIsLeadModalOpen(true)}
          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 active:scale-95 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-xl shadow-orange-600/30 flex items-center gap-2 transition-all border border-white/20 animate-soft-pulse"
          title="اطلب عينات مجانية أو زيارة مندوب لمحلك بالإسكندرية"
        >
          <Gift className="w-4 h-4 text-white" />
          <span className="hidden xs:inline">صاحب مطعم جديد؟ اطلب عينات أو زيارة لمحلك 🎁</span>
          <span className="xs:hidden">اطلب عينات مجانية 🎁</span>
        </button>
      </div>

      {/* Sticky Floating Bottom Cart Bar */}
      <CartBottomBar
        cart={cart}
        onOpenCheckout={() => setIsCheckoutModalOpen(true)}
        onOpenDrawer={() => setIsCartDrawerOpen(true)}
        minOrderAmount={settings.minOrderAmount}
      />

      {/* Cart Preview Drawer */}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => setIsCheckoutModalOpen(true)}
        minOrderAmount={settings.minOrderAmount}
      />

      {/* Checkout & WhatsApp Order Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        cart={cart}
        settings={settings}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* Order Success & Invoice Modal */}
      <OrderSuccessModal
        isOpen={isOrderSuccessModalOpen}
        order={currentSuccessOrder}
        settings={settings}
        whatsappUrl={currentWhatsAppUrl}
        onClose={() => setIsOrderSuccessModalOpen(false)}
        onNewOrder={handleNewOrder}
      />

      {/* Public Lead / Sample Request Modal */}
      <LeadMachineModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        settings={settings}
        onSubmitRequest={handleLeadRequestSubmit}
      />

      {/* Admin Authentication PIN Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onAuthenticated={handleAdminAuthenticated}
        correctPin={settings.adminPin}
      />

      {/* Full Autonomous Admin Operations Dashboard */}
      <AdminDashboard
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        onLogout={handleAdminLogout}
        products={products}
        orders={orders}
        customers={customers}
        settings={settings}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onResetProducts={handleResetProducts}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onDeleteOrder={handleDeleteOrder}
        onSaveSettings={handleSaveSettings}
        onAddCustomer={handleAddCustomer}
        onUpdateCustomer={handleUpdateCustomer}
        onDeleteCustomer={handleDeleteCustomer}
        onResetCustomers={handleResetCustomers}
      />

      {/* Commercial Footer */}
      <Footer settings={settings} onOpenAdmin={handleOpenAdmin} />
    </div>
  );
}

export default App;
