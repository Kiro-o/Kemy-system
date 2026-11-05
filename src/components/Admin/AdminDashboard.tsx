import React, { useState } from 'react';
import {
  ClipboardList,
  Package,
  Settings,
  LogOut,
  ShieldCheck,
  Store,
  Users,
  Send,
  Truck,
  Repeat,
  Megaphone,
} from 'lucide-react';
import { Product, Order, OrderStatus, CompanySettings, Customer } from '../../types';
import { OrdersManager } from './OrdersManager';
import { ProductsManager } from './ProductsManager';
import { SettingsManager } from './SettingsManager';
import { CustomersManager } from './CustomersManager';
import { RouteBroadcaster } from './RouteBroadcaster';
import { TruckManifestManager } from './TruckManifestManager';
import { RecurringOrdersManager } from './RecurringOrdersManager';
import { AdLinkBuilder } from './AdLinkBuilder';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  products: Product[];
  orders: Order[];
  customers: Customer[];
  settings: CompanySettings;
  onAddProduct: (newProduct: Product) => void;
  onUpdateProduct: (updated: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onResetProducts: () => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onDeleteOrder: (orderId: string) => void;
  onSaveSettings: (settings: CompanySettings) => void;
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: string) => void;
  onResetCustomers: () => void;
}

type AdminTab = 
  | 'orders' 
  | 'manifest' 
  | 'products' 
  | 'customers' 
  | 'recurring' 
  | 'broadcaster' 
  | 'adlinks' 
  | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  onLogout,
  products,
  orders,
  customers,
  settings,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onResetProducts,
  onUpdateOrderStatus,
  onDeleteOrder,
  onSaveSettings,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onResetCustomers,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');

  if (!isOpen) return null;

  const pendingOrdersCount = orders.filter((o) => o.status === 'جديد').length;
  const recurringSubscribersCount = customers.filter((c) => c.isRecurringSubscriber).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col overflow-hidden">
      {/* Top Admin Navbar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 px-4 py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600/30 border border-brand-500/40 text-brand-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black tracking-tight">منظومة إدارة التوزيع والعمليات</h2>
                <span className="bg-brand-500/20 text-brand-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-brand-500/30">
                  {settings.city}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                {settings.companyName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition-all shadow-sm"
            >
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">متجر المحلات</span>
              <span className="sm:hidden">المتجر</span>
            </button>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-red-950/60 text-slate-300 hover:text-red-300 font-bold text-xs px-2.5 py-2 rounded-xl transition-all border border-slate-700"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tabs Navigation (Horizontally scrollable with smooth touch) */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex-shrink-0 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ClipboardList className="w-4 h-4 text-amber-400" />
            <span>لوحة الطلبات</span>
            {pendingOrdersCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === 'orders' ? 'bg-amber-400 text-slate-950' : 'bg-red-500 text-white'
                }`}
              >
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('manifest')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'manifest'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Truck className="w-4 h-4 text-emerald-400" />
            <span>لستة تحميل السيارة والسائق</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-1.5 py-0.5 rounded-full">
              تحميل
            </span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4 text-blue-400" />
            <span>المنتجات والأسعار</span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'customers'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4 text-teal-400" />
            <span>دليل العملاء (CRM)</span>
            <span className="text-[10px] bg-teal-100 text-teal-900 font-black px-1.5 py-0.5 rounded-full">
              {customers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('recurring')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'recurring'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Repeat className="w-4 h-4 text-purple-400" />
            <span>الطلبيات الدورية</span>
            {recurringSubscribersCount > 0 && (
              <span className="text-[10px] bg-purple-100 text-purple-900 font-bold px-1.5 py-0.5 rounded-full">
                {recurringSubscribersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('broadcaster')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'broadcaster'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Send className="w-4 h-4 text-green-400" />
            <span>حملات خط السير (واتساب)</span>
          </button>

          <button
            onClick={() => setActiveTab('adlinks')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'adlinks'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Megaphone className="w-4 h-4 text-orange-400" />
            <span>روابط الإعلانات</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>الإعدادات</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'orders' && (
            <OrdersManager
              orders={orders}
              onUpdateStatus={onUpdateOrderStatus}
              onDeleteOrder={onDeleteOrder}
              schedules={settings.routeSchedules}
              settings={settings}
            />
          )}

          {activeTab === 'manifest' && (
            <TruckManifestManager
              orders={orders}
              schedules={settings.routeSchedules}
              settings={settings}
              onUpdateOrderStatus={onUpdateOrderStatus}
            />
          )}

          {activeTab === 'products' && (
            <ProductsManager
              products={products}
              onAddProduct={onAddProduct}
              onUpdateProduct={onUpdateProduct}
              onDeleteProduct={onDeleteProduct}
              onResetProducts={onResetProducts}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersManager
              customers={customers}
              onAddCustomer={onAddCustomer}
              onUpdateCustomer={onUpdateCustomer}
              onDeleteCustomer={onDeleteCustomer}
              onResetCustomers={onResetCustomers}
            />
          )}

          {activeTab === 'recurring' && (
            <RecurringOrdersManager
              customers={customers}
              products={products}
              settings={settings}
              onUpdateCustomer={onUpdateCustomer}
            />
          )}

          {activeTab === 'broadcaster' && (
            <RouteBroadcaster
              customers={customers}
              products={products}
              schedules={settings.routeSchedules}
              settings={settings}
            />
          )}

          {activeTab === 'adlinks' && <AdLinkBuilder settings={settings} />}

          {activeTab === 'settings' && (
            <SettingsManager settings={settings} onSaveSettings={onSaveSettings} />
          )}
        </div>
      </main>
    </div>
  );
};
