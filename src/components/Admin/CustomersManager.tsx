import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Phone,
  MessageCircle,
  MapPin,
  Store,
  Calendar,
  DollarSign,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCcw,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { Customer, CustomerStatus, BusinessType } from '../../types';
import { ALL_ALEX_DISTRICTS } from '../../data/initialData';
import { normalizeWhatsAppNumber } from '../../utils/whatsapp';
import { exportCustomersToCsv } from '../../utils/exportCsv';
import { formatArabicDateTime } from '../../utils/dateUtils';

interface CustomersManagerProps {
  customers: Customer[];
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: string) => void;
  onResetCustomers: () => void;
}

const BUSINESS_TYPES: BusinessType[] = [
  'محل كريب وبرجر',
  'مطعم مأكولات سريعة',
  'سوبرماركت وبقالة',
  'مطعم بيتزا وفطائر',
  'كافيه ومشروبات',
  'علاّفة وسرج',
  'مطبخ سحابي وفندق',
  'أخرى',
];

const CUSTOMER_STATUSES: CustomerStatus[] = [
  'عميل منتظم',
  'عميل محتمل / مسجل جديد',
  'متوقف',
];

export const CustomersManager: React.FC<CustomersManagerProps> = ({
  customers,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onResetCustomers,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Customer>>({
    shopName: '',
    businessType: 'محل كريب وبرجر',
    responsibleName: '',
    phone: '',
    district: ALL_ALEX_DISTRICTS[0],
    address: '',
    status: 'عميل منتظم',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Filter customers
  const filteredCustomers = customers.filter((cust) => {
    const matchesSearch =
      cust.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.responsibleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.phone.includes(searchQuery) ||
      (cust.notes && cust.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDistrict =
      selectedDistrict === 'all' || cust.district === selectedDistrict;

    const matchesStatus =
      selectedStatus === 'all' || cust.status === selectedStatus;

    return matchesSearch && matchesDistrict && matchesStatus;
  });

  // KPI Metrics
  const totalCount = customers.length;
  const regularCount = customers.filter((c) => c.status === 'عميل منتظم').length;
  const potentialCount = customers.filter((c) => c.status === 'عميل محتمل / مسجل جديد').length;
  const totalLifetimeSpent = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      shopName: '',
      businessType: 'محل كريب وبرجر',
      responsibleName: '',
      phone: '',
      district: ALL_ALEX_DISTRICTS[0],
      address: '',
      status: 'عميل منتظم',
      notes: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormData({ ...cust });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.shopName?.trim()) {
      errors.shopName = 'اسم المحل أو المطعم مطلوب';
    }
    if (!formData.responsibleName?.trim()) {
      errors.responsibleName = 'اسم المسؤول مطلوب';
    }
    const cleanPhone = (formData.phone || '').replace(/[^\d]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      errors.phone = 'يرجى إدخال رقم موبايل صحيح (11 رقم)';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingCustomer) {
      onUpdateCustomer({
        ...(formData as Customer),
        id: editingCustomer.id,
        totalOrdersCount: editingCustomer.totalOrdersCount,
        totalSpent: editingCustomer.totalSpent,
        lastOrderDate: editingCustomer.lastOrderDate,
        createdAt: editingCustomer.createdAt,
      });
    } else {
      const newCust: Customer = {
        id: `CUST-${Math.floor(100 + Math.random() * 900)}`,
        shopName: formData.shopName!.trim(),
        businessType: (formData.businessType || 'محل كريب وبرجر') as BusinessType,
        responsibleName: formData.responsibleName!.trim(),
        phone: formData.phone!.trim(),
        district: formData.district || ALL_ALEX_DISTRICTS[0],
        address: formData.address?.trim() || undefined,
        status: (formData.status || 'عميل منتظم') as CustomerStatus,
        notes: formData.notes?.trim() || undefined,
        totalOrdersCount: 0,
        totalSpent: 0,
        createdAt: new Date().toISOString(),
      };
      onAddCustomer(newCust);
    }

    setIsModalOpen(false);
  };

  const handleExportCsv = () => {
    if (filteredCustomers.length === 0) {
      alert('لا توجد بيانات عملاء لتصديرها وفقاً للتصفية الحالية');
      return;
    }
    exportCustomersToCsv(filteredCustomers);
  };

  const getStatusBadge = (status: CustomerStatus) => {
    switch (status) {
      case 'عميل منتظم':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'عميل محتمل / مسجل جديد':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'متوقف':
        return 'bg-slate-200 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-5">
      {/* CRM Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold">إجمالي المنشآت المسجلة</span>
            <Users className="w-4 h-4 text-brand-700" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900">{totalCount}</span>
            <span className="text-xs text-slate-500 font-bold">محل ومطعم</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">محفوظة في قاعدة بيانات CRM</span>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 shadow-sm">
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="text-xs font-bold">العملاء المنتظمين</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-950">{regularCount}</span>
            <span className="text-xs text-emerald-800 font-bold">عميل دائم</span>
          </div>
          <span className="text-[11px] text-emerald-700 mt-1 block">سحب أسبوعي مستمر لباب المحل</span>
        </div>

        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 shadow-sm">
          <div className="flex items-center justify-between text-amber-800 mb-1">
            <span className="text-xs font-bold">عملاء جدد ومحتملين</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-amber-950">{potentialCount}</span>
            <span className="text-xs text-amber-800 font-bold">منشأة</span>
          </div>
          <span className="text-[11px] text-amber-700 mt-1 block">فرص للتحويل لحملات التوزيع القادمة</span>
        </div>

        <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between text-blue-800 mb-1">
            <span className="text-xs font-bold">إجمالي مسحوبات العملاء</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-blue-950">
              {totalLifetimeSpent.toLocaleString('ar-EG')}
            </span>
            <span className="text-xs text-blue-800 font-bold">ج.م</span>
          </div>
          <span className="text-[11px] text-blue-700 mt-1 block">القيمة التراكمية لمبيعات الدليل</span>
        </div>
      </div>

      {/* Control & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap flex-1">
          {/* Instant Search Bar */}
          <div className="relative flex-1 min-w-[200px] sm:min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم المحل، المسؤول، أو رقم الهاتف..."
              className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm rounded-xl pr-9 pl-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* District Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs">
            <MapPin className="w-4 h-4 text-brand-700" />
            <span className="font-bold text-slate-700">المنطقة:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none"
            >
              <option value="all">كافة مناطق الإسكندرية</option>
              {ALL_ALEX_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="font-bold text-slate-700">الحالة:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none"
            >
              <option value="all">جميع الحالات</option>
              {CUSTOMER_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end md:self-center flex-wrap">
          <button
            onClick={() => {
              if (confirm('هل تريد استعادة بيانات العملاء التجريبية الافتراضية؟')) {
                onResetCustomers();
              }
            }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            title="استعادة العملاء الافتراضيين"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl shadow-sm transition-colors"
            title="تصدير بيانات دليل العملاء إلى إكسيل"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>تصدير إكسيل</span>
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors active:scale-98"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة منشأة / عميل جديد</span>
          </button>
        </div>
      </div>

      {/* Auto-capture informative notice */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-950 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
        <span>
          🤖 <strong>تسجيل ذكي تلقائي:</strong> كل طلبية يقوم أي مطعم أو سوبرماركت بطلبها عبر المتجر يتم حفظ بياناته تلقائياً وتحديث إجمالي مسحوباته في هذا الدليل دون تدخل منك.
        </span>
      </div>

      {/* Customers Table / Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">المنشأة والمسؤول</th>
                <th className="py-3 px-3">المنطقة والنشاط</th>
                <th className="py-3 px-3">رقم الواتساب والهاتف</th>
                <th className="py-3 px-3">حالة العميل</th>
                <th className="py-3 px-3">المسحوبات التراكمية</th>
                <th className="py-3 px-3">ملاحظات واحتياجات</th>
                <th className="py-3 px-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
                    <p className="font-bold text-slate-700">لا توجد منشآت مطابقة للبحث</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      جرب تغيير المنطقة أو كلمة البحث
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const directWhatsAppUrl = `https://wa.me/${normalizeWhatsAppNumber(
                    cust.phone
                  )}?text=${encodeURIComponent(
                    `السلام عليكم ورحمة الله، مرحباً أستاذ ${cust.responsibleName} (${cust.shopName})، شركة النور للتوريدات الغذائية بالإسكندرية تتمنى لكم دوام التوفيق.`
                  )}`;

                  return (
                    <tr key={cust.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Shop Name & Responsible */}
                      <td className="py-3 px-4">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                            <Store className="w-4 h-4 text-brand-700" />
                          </div>
                          <div>
                            <span className="font-black text-slate-900 block text-xs sm:text-sm">
                              {cust.shopName}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">
                              المسؤول: {cust.responsibleName}
                            </span>
                            {cust.address && (
                              <span className="text-[10px] text-slate-400 block truncate max-w-xs">
                                {cust.address}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* District & Type */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-bold text-brand-800 bg-brand-50 px-2 py-0.5 rounded-md">
                          <MapPin className="w-3 h-3 text-brand-600" />
                          <span>{cust.district}</span>
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-1">
                          {cust.businessType}
                        </span>
                      </td>

                      {/* Phone & WhatsApp Link */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <a
                            href={directWhatsAppUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] px-2 py-1 rounded-lg font-bold transition-colors"
                            title="فتح محادثة واتساب فورية"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-[#25D366] text-transparent" />
                            <span dir="ltr">{cust.phone}</span>
                          </a>
                          <a
                            href={`tel:${cust.phone}`}
                            className="text-slate-400 hover:text-slate-700 p-1 rounded"
                            title="اتصال هاتفي"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                            cust.status
                          )}`}
                        >
                          {cust.status}
                        </span>
                      </td>

                      {/* Orders Count & Spent */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-black text-brand-900 block text-xs">
                          {(cust.totalSpent || 0).toLocaleString('ar-EG')} ج.م
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {cust.totalOrdersCount || 0} طلبيات منفذة
                        </span>
                      </td>

                      {/* Notes */}
                      <td className="py-3 px-3">
                        <span className="text-[11px] text-slate-600 line-clamp-2 max-w-xs">
                          {cust.notes || '—'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(cust)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            title="تعديل بيانات العميل"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف العميل "${cust.shopName}"؟`)) {
                                onDeleteCustomer(cust.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="حذف العميل"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick-Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="min-h-full flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl relative z-10 text-right border border-slate-200">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-brand-700" />
                  <h3 className="font-black text-slate-900 text-base">
                    {editingCustomer ? 'تعديل بيانات المنشأة' : 'إضافة منشأة وعميل جديد للدليل'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="space-y-3.5 mt-4 text-xs">
                {/* Shop Name & Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      اسم المحل أو المطعم <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.shopName || ''}
                      onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                      placeholder="مثال: كريب الملك، كافيتريا المحطة"
                      className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-500 ${
                        formErrors.shopName ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {formErrors.shopName && (
                      <span className="text-[10px] text-red-500 mt-0.5 block">{formErrors.shopName}</span>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">نوع النشاط</label>
                    <select
                      value={formData.businessType || 'محل كريب وبرجر'}
                      onChange={(e) =>
                        setFormData({ ...formData, businessType: e.target.value as BusinessType })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-500 font-medium"
                    >
                      {BUSINESS_TYPES.map((bt) => (
                        <option key={bt} value={bt}>
                          {bt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Responsible & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      اسم الشخص المسؤول <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.responsibleName || ''}
                      onChange={(e) => setFormData({ ...formData, responsibleName: e.target.value })}
                      placeholder="الشيف أو صاحب المحل"
                      className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-500 ${
                        formErrors.responsibleName ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {formErrors.responsibleName && (
                      <span className="text-[10px] text-red-500 mt-0.5 block">{formErrors.responsibleName}</span>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      رقم الواتساب والموبايل <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      dir="ltr"
                      required
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="010XXXXXXXX"
                      className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs font-mono text-right focus:ring-2 focus:ring-brand-500 ${
                        formErrors.phone ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {formErrors.phone && (
                      <span className="text-[10px] text-red-500 mt-0.5 block">{formErrors.phone}</span>
                    )}
                  </div>
                </div>

                {/* District & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      المنطقة في الإسكندرية
                    </label>
                    <select
                      value={formData.district || ALL_ALEX_DISTRICTS[0]}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-500 font-bold"
                    >
                      {ALL_ALEX_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">حالة العميل</label>
                    <select
                      value={formData.status || 'عميل منتظم'}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value as CustomerStatus })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-500 font-bold"
                    >
                      {CUSTOMER_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    العنوان بالتفصيل وعلامة مميزة (اختياري)
                  </label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="الشارع، رقم المحل، بجوار..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* Quick Notes */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ملاحظات سريعة واحتياجات العميل
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="مثال: بيسحب مايونيز ومخلل أسبوعياً، يفضل الاتصال قبل الظهر..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* Submit / Cancel Buttons */}
                <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="bg-brand-700 hover:bg-brand-800 text-white px-5 py-2 rounded-xl font-bold transition-colors shadow-sm"
                  >
                    {editingCustomer ? 'حفظ التعديلات' : 'إضافة العميل للدليل'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

