'use client';

import { useCartStore } from '@/stores/useCartStore';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getCart } from '@/services/cartService';
import type { CartItem } from '@/store/useCartStore';
import { checkout } from '@/services/orderService';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import Navbar from '@/components/Navbar';
import axiosClient, { unwrapResponse } from '@/services/axiosClient';

// ─── TYPES ────────────────────────────────────────────────────
interface Address {
  id: number;
  fullName: string;
  phoneNumber: string;
  houseNumber: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface AddressFormFields {
  fullName: string;
  phoneNumber: string;
  houseNumber: string;
  street: string;
  landmark: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

enum PaymentMethod {
  COD = 'COD',
  UPI = 'UPI',
  CARD = 'CARD',
  NET_BANKING = 'NET_BANKING',
}

function CheckoutContent() {
  const { items, setItems, clearCart } = useCartStore();
  const { user } = useAuth();
  const router = useRouter();

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  
  // Payment State
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(PaymentMethod.COD);
  
  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Address Modal States
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState<AddressFormFields>({
    fullName: '',
    phoneNumber: '',
    houseNumber: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false,
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof AddressFormFields, string>>>({});
  
  // Submit State
  const [placingOrder, setPlacingOrder] = useState(false);

  // ─── FETCH ADDRESSES FROM BACKEND ──────────────────────────────
  const fetchAddresses = useCallback(async (userId: number) => {
    try {
      const response = await axiosClient.get(`/addresses/user/${userId}`);
      const data = unwrapResponse<Address[]>(response.data);
      
      // If backend has 0 addresses, attempt to migrate from localStorage
      if (data.length === 0) {
        const localRaw = localStorage.getItem('user_addresses');
        if (localRaw) {
          try {
            const localAddresses = JSON.parse(localRaw);
            if (Array.isArray(localAddresses) && localAddresses.length > 0) {
              toast.info('Migrating saved addresses to your secure cloud account...');
              for (const la of localAddresses) {
                const payload = {
                  fullName: la.name || 'User',
                  phoneNumber: (la.mobile && la.mobile.match(/^\d{10}$/)) ? la.mobile : '9999999999',
                  houseNumber: 'N/A',
                  street: la.street || 'Street Address',
                  landmark: la.label || 'Home',
                  city: la.city || 'City',
                  state: la.state || 'State',
                  postalCode: (la.zip && la.zip.match(/^\d{6}$/)) ? la.zip : '400001',
                  country: la.country || 'India',
                  isDefault: false,
                };
                await axiosClient.post('/addresses', payload, { params: { userId } });
              }
              localStorage.removeItem('user_addresses');
              // Re-fetch
              const refetchRes = await axiosClient.get(`/addresses/user/${userId}`);
              const refetchData = unwrapResponse<Address[]>(refetchRes.data);
              setAddresses(refetchData);
              const defaultAddr = refetchData.find(a => a.isDefault) || refetchData[0];
              if (defaultAddr) setSelectedAddressId(defaultAddr.id);
              return;
            }
          } catch (migrateErr) {
            console.error('Error migrating addresses:', migrateErr);
          }
        }
      }

      setAddresses(data);
      const defaultAddr = data.find(a => a.isDefault) || data[0];
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
    } catch (err) {
      console.error('Failed to load addresses:', err);
      toast.error('Failed to load shipping addresses.');
    }
  }, []);

  // ─── LOAD INITIAL DATA ─────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const loadAll = async () => {
      try {
        // Load cart
        const cartItems = await getCart(user.id);
        const mapped: CartItem[] = cartItems.map((si) => ({
          id: String(si.productId),
          cartId: si.id,
          name: si.productName,
          price: si.price,
          image: si.imageUrl ?? "/placeholder.png",
          quantity: si.quantity,
        }));
        setItems(mapped);

        // Load addresses
        await fetchAddresses(user.id);
      } catch (err) {
        console.error('Error loading checkout details:', err);
        toast.error('Error loading checkout resources.');
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [user?.id, setItems, fetchAddresses]);

  // ─── COUPON VALIDATION ──────────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    setApplyingCoupon(true);
    setCouponError(null);
    const orderAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    try {
      const response = await axiosClient.post('/coupons/apply', {
        code: couponCode.trim(),
        orderAmount
      });
      const finalAmount = unwrapResponse<number>(response.data);
      const discount = orderAmount - finalAmount;
      
      setDiscountAmount(discount);
      setAppliedCoupon(couponCode.trim().toUpperCase());
      setCouponError(null);
      toast.success('Coupon applied successfully!');
    } catch (err: unknown) {
      console.error('Coupon error:', err);
      let message = 'Failed to apply coupon. Code may be invalid or expired.';
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        if (response?.data?.message) {
          message = response.data.message;
        }
      }
      setCouponError(message);
      setDiscountAmount(0);
      setAppliedCoupon(null);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponError(null);
    toast.info('Coupon removed.');
  };

  // ─── ADDRESS FORM VALIDATION & SUBMISSION ───────────────────────
  const validateAddressForm = (): boolean => {
    const errors: Partial<Record<keyof AddressFormFields, string>> = {};
    if (!addressForm.fullName.trim()) errors.fullName = 'Full name is required';
    if (!addressForm.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(addressForm.phoneNumber)) {
      errors.phoneNumber = 'Phone number must be exactly 10 digits';
    }
    if (!addressForm.houseNumber.trim()) errors.houseNumber = 'House/Flat details are required';
    if (!addressForm.street.trim()) errors.street = 'Street details are required';
    if (!addressForm.city.trim()) errors.city = 'City is required';
    if (!addressForm.state.trim()) errors.state = 'State is required';
    if (!addressForm.postalCode.trim()) {
      errors.postalCode = 'Postal code is required';
    } else if (!/^\d{6}$/.test(addressForm.postalCode)) {
      errors.postalCode = 'Postal code must be exactly 6 digits';
    }
    if (!addressForm.country.trim()) errors.country = 'Country is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !validateAddressForm()) return;

    try {
      if (editingAddress) {
        // Edit flow
        const response = await axiosClient.put(`/addresses/${editingAddress.id}`, addressForm);
        const updated = unwrapResponse<Address>(response.data);
        toast.success('Address updated successfully');
        setAddresses(prev => prev.map(a => a.id === updated.id ? updated : a));
      } else {
        // Create flow
        const response = await axiosClient.post(`/addresses`, addressForm, {
          params: { userId: user.id }
        });
        const created = unwrapResponse<Address>(response.data);
        toast.success('Address added successfully');
        setAddresses(prev => [...prev, created]);
        setSelectedAddressId(created.id);
      }
      setShowAddressModal(false);
      resetAddressForm();
    } catch (err: unknown) {
      console.error('Failed to save address:', err);
      let message = 'Error occurred while saving address.';
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        if (response?.data?.message) {
          message = response.data.message;
        }
      }
      toast.error(message);
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm({
      fullName: address.fullName,
      phoneNumber: address.phoneNumber,
      houseNumber: address.houseNumber,
      street: address.street,
      landmark: address.landmark || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
    });
    setFormErrors({});
    setShowAddressModal(true);
  };

  const handleDeleteAddress = async (addressId: number) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await axiosClient.delete(`/addresses/${addressId}`);
      toast.success('Address deleted successfully');
      setAddresses(prev => prev.filter(a => a.id !== addressId));
      if (selectedAddressId === addressId) {
        setSelectedAddressId(null);
      }
    } catch (err) {
      console.error('Failed to delete address:', err);
      toast.error('Failed to delete address.');
    }
  };

  const handleSetDefaultAddress = async (addressId: number) => {
    try {
      const response = await axiosClient.patch(`/addresses/${addressId}/default`);
      const updated = unwrapResponse<Address>(response.data);
      toast.success('Default address updated');
      setAddresses(prev =>
        prev.map(a => (a.id === updated.id ? updated : { ...a, isDefault: false }))
      );
    } catch (err) {
      console.error('Failed to set default address:', err);
      toast.error('Failed to update default address.');
    }
  };

  const resetAddressForm = () => {
    setEditingAddress(null);
    setAddressForm({
      fullName: '',
      phoneNumber: '',
      houseNumber: '',
      street: '',
      landmark: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      isDefault: false,
    });
    setFormErrors({});
  };

  // ─── PLACE ORDER ───────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!user?.id) return;
    if (!selectedAddressId) {
      toast.warn('Please select a shipping address.');
      return;
    }

    setPlacingOrder(true);
    try {
      await checkout({
        userId: user.id,
        addressId: selectedAddressId,
        paymentMethod: selectedPayment,
        couponCode: appliedCoupon,
      });
      toast.success('🎉 Order placed successfully!');
      clearCart();
      router.push('/orders');
    } catch (err: unknown) {
      console.error('Order placement failed:', err);
      let message = 'Failed to place order. Please try again.';
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        if (response?.data?.message) {
          message = response.data.message;
        }
      }
      toast.error(message);
    } finally {
      setPlacingOrder(false);
    }
  };

  // Math Calculations
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = 0; // Free
  const tax = subtotal * 0.0018; // 18% tax
  const grandTotal = Math.max(0, subtotal + shipping + tax - discountAmount);

  // Delivery Date Calculation (Current + 5 Days)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (loading) {
    return (
      <div className="bg-background min-h-screen text-dark flex flex-col justify-between">
        <div>
          <Navbar />
          <div className="max-w-6xl mx-auto px-6 md:px-8 py-8 space-y-6">
            <div className="h-6 bg-slate-200 rounded w-1/4 animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-borders rounded-xl p-6 space-y-4 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="h-28 bg-slate-100 rounded-xl" />
                    <div className="h-28 bg-slate-100 rounded-xl" />
                  </div>
                </div>
                <div className="bg-white border border-borders rounded-xl p-6 h-36 animate-pulse" />
              </div>
              <div className="bg-white border border-borders rounded-xl p-6 h-96 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen text-dark flex flex-col justify-between">
      <div>
        <Navbar />
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

        <div className="max-w-6xl mx-auto px-6 md:px-8 py-8 space-y-6">
          {/* Header */}
          <div className="border-b border-borders pb-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-light mb-1.5">
              <Link href="/cart" className="hover:text-dark transition-colors">Cart</Link>
              <svg className="h-3 w-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
              <span className="text-dark">Checkout</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-dark">Secure Checkout</h1>
            <p className="text-xs text-light mt-0.5">
              Provide your details below to finalize your order.
            </p>
          </div>

          {items.length === 0 ? (
            /* Empty Cart Warning */
            <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-xl bg-white border border-borders shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-light border border-borders/85">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-dark">No checkout items</h3>
                <p className="text-xs text-light max-w-xs font-normal">
                  Your cart is empty. Please add products to check out.
                </p>
              </div>
              <Link href="/" className="inline-flex items-center justify-center px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Form details column */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* SECTION 1: Shipping Address */}
                <section className="bg-white border border-borders rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4">
                  <div className="flex justify-between items-center border-b border-borders pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-dark">
                        1
                      </div>
                      <h2 className="text-sm font-bold text-dark tracking-tight">Shipping Address</h2>
                    </div>
                    <button
                      onClick={() => { resetAddressForm(); setShowAddressModal(true); }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      + Add New Address
                    </button>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-8 border border-dashed border-borders/85 rounded-xl space-y-3">
                      <p className="text-xs text-light max-w-xs">
                        No saved shipping addresses found on this account.
                      </p>
                      <button
                        onClick={() => { resetAddressForm(); setShowAddressModal(true); }}
                        className="px-3.5 py-1.5 border border-borders hover:bg-slate-50 text-dark rounded-lg text-xs font-semibold shadow-sm transition-colors"
                      >
                        + Add Shipping Address
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`border rounded-xl p-4 flex flex-col justify-between gap-3 cursor-pointer transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${
                            selectedAddressId === addr.id
                              ? 'border-primary bg-primary/[0.01] ring-1 ring-primary/20'
                              : 'border-borders hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex items-start gap-2.5">
                                <input
                                  type="radio"
                                  name="shippingAddress"
                                  checked={selectedAddressId === addr.id}
                                  onChange={() => setSelectedAddressId(addr.id)}
                                  className="mt-1 h-3.5 w-3.5 text-primary border-slate-300 focus:ring-primary/20"
                                />
                                <div>
                                  <p className="font-semibold text-dark text-xs sm:text-sm">{addr.fullName}</p>
                                  <p className="text-[10px] text-light mt-0.5">{addr.landmark || 'Home'}</p>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                {addr.isDefault && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded border border-success/20 bg-success/5 font-bold uppercase tracking-wider text-success">
                                    Default
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-xs font-normal text-light space-y-0.5 pl-6">
                              <p>{addr.houseNumber}, {addr.street}</p>
                              <p>{addr.city}, {addr.state} - {addr.postalCode}</p>
                              <p>{addr.country}</p>
                              <p className="text-dark font-medium mt-1">Mobile: {addr.phoneNumber}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-borders/60 pt-2.5 mt-1.5 pl-6 gap-2 text-[11px] font-semibold">
                            <div className="flex gap-3">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleEditAddress(addr); }}
                                className="text-slate-600 hover:text-dark transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr.id); }}
                                className="text-danger hover:text-red-700 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                            
                            {!addr.isDefault && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleSetDefaultAddress(addr.id); }}
                                className="text-primary hover:underline text-[10px]"
                              >
                                Set Default
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* SECTION 2: Payment Method */}
                <section className="bg-white border border-borders rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4">
                  <div className="flex items-center gap-2 border-b border-borders pb-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-dark">
                      2
                    </div>
                    <h2 className="text-sm font-bold text-dark tracking-tight">Payment Method</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* COD */}
                    <div
                      onClick={() => setSelectedPayment(PaymentMethod.COD)}
                      className={`border p-3.5 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                        selectedPayment === PaymentMethod.COD
                          ? 'border-primary bg-primary/[0.01] ring-1 ring-primary/20'
                          : 'border-borders hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={selectedPayment === PaymentMethod.COD}
                          onChange={() => setSelectedPayment(PaymentMethod.COD)}
                          className="h-3.5 w-3.5 text-primary border-slate-300 focus:ring-primary/20"
                        />
                        <div>
                          <p className="font-semibold text-dark text-xs sm:text-sm">Cash on Delivery</p>
                          <p className="text-[10px] text-light mt-0.5">Pay in cash upon doorstep delivery</p>
                        </div>
                      </div>
                      <div className="text-light">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.12-1.014L1.5 6H18.75m-18 12.75V12h11.25m-11.25 0c0-2.485 2.015-4.5 4.5-4.5M10.5 3h3a1.5 1.5 0 011.5 1.5v3M10.5 3a1.5 1.5 0 00-1.5 1.5v3m3-3h.008v.008H12V3zm.562 10.29l3 3m0 0l3-3m-3 3V12" />
                        </svg>
                      </div>
                    </div>

                    {/* UPI */}
                    <div
                      onClick={() => setSelectedPayment(PaymentMethod.UPI)}
                      className={`border p-3.5 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                        selectedPayment === PaymentMethod.UPI
                          ? 'border-primary bg-primary/[0.01] ring-1 ring-primary/20'
                          : 'border-borders hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={selectedPayment === PaymentMethod.UPI}
                          onChange={() => setSelectedPayment(PaymentMethod.UPI)}
                          className="h-3.5 w-3.5 text-primary border-slate-300 focus:ring-primary/20"
                        />
                        <div>
                          <p className="font-semibold text-dark text-xs sm:text-sm">UPI</p>
                          <p className="text-[10px] text-light mt-0.5">Pay via Google Pay, PhonePe, Paytm</p>
                        </div>
                      </div>
                      <div className="text-light">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                        </svg>
                      </div>
                    </div>

                    {/* CARD */}
                    <div
                      onClick={() => setSelectedPayment(PaymentMethod.CARD)}
                      className={`border p-3.5 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                        selectedPayment === PaymentMethod.CARD
                          ? 'border-primary bg-primary/[0.01] ring-1 ring-primary/20'
                          : 'border-borders hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={selectedPayment === PaymentMethod.CARD}
                          onChange={() => setSelectedPayment(PaymentMethod.CARD)}
                          className="h-3.5 w-3.5 text-primary border-slate-300 focus:ring-primary/20"
                        />
                        <div>
                          <p className="font-semibold text-dark text-xs sm:text-sm">Credit / Debit Card</p>
                          <p className="text-[10px] text-light mt-0.5">Visa, MasterCard, RuPay, Amex</p>
                        </div>
                      </div>
                      <div className="text-light">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-5.625-12h17.25c.621 0 1.125.504 1.125 1.125v13.5c0 .621-.504 1.125-1.125 1.125H3.375C2.754 18 2.25 17.496 2.25 16.875V3.375c0-.621.504-1.125 1.125-1.125z" />
                        </svg>
                      </div>
                    </div>

                    {/* NET_BANKING */}
                    <div
                      onClick={() => setSelectedPayment(PaymentMethod.NET_BANKING)}
                      className={`border p-3.5 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                        selectedPayment === PaymentMethod.NET_BANKING
                          ? 'border-primary bg-primary/[0.01] ring-1 ring-primary/20'
                          : 'border-borders hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={selectedPayment === PaymentMethod.NET_BANKING}
                          onChange={() => setSelectedPayment(PaymentMethod.NET_BANKING)}
                          className="h-3.5 w-3.5 text-primary border-slate-300 focus:ring-primary/20"
                        />
                        <div>
                          <p className="font-semibold text-dark text-xs sm:text-sm">Net Banking</p>
                          <p className="text-[10px] text-light mt-0.5">Pay directly through your bank account</p>
                        </div>
                      </div>
                      <div className="text-light">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.5m-15 10.5V10.5M3 21h18M12 10.5h.008v.008H12V10.5z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </section>

                {/* SECTION 5: Estimated Delivery & Trust Badge */}
                <section className="bg-slate-50/50 border border-borders rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4">
                  <h3 className="text-xs font-bold text-dark uppercase tracking-wider">Shipping Details</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="bg-white border border-borders/85 rounded-xl p-3.5 flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-success/5 border border-success/10 text-success flex items-center justify-center flex-shrink-0">
                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.12-1.014L1.5 6H18.75m-18 12.75V12h11.25m-11.25 0c0-2.485 2.015-4.5 4.5-4.5M10.5 3h3a1.5 1.5 0 011.5 1.5v3M10.5 3a1.5 1.5 0 00-1.5 1.5v3m3-3h.008v.008H12V3zm.562 10.29l3 3m0 0l3-3m-3 3V12" />
                        </svg>
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-semibold text-dark">Free Shipping</p>
                        <p className="text-light">Delivering to your selection with 0 extra costs.</p>
                      </div>
                    </div>

                    <div className="bg-white border border-borders/85 rounded-xl p-3.5 flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/5 border border-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zM14.25 15h.008v.008H14.25V15zm0 2.25h.008v.008H14.25v-.008zM16.5 15h.008v.008H16.5V15zm0 2.25h.008v.008H16.5v-.008z" />
                        </svg>
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-semibold text-dark">Estimated Delivery</p>
                        <p className="text-light font-medium text-slate-700">{formattedDeliveryDate}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-borders/60 pt-3 flex items-center gap-2.5 text-[11px] text-light">
                    <svg className="h-4 w-4 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    <span>Secure 256-Bit SSL Checkout. We protect your privacy and purchase details.</span>
                  </div>
                </section>
              </div>

              {/* Order Summary Sidebar */}
              <div className="relative">
                <div className="sticky top-24 border border-borders bg-white rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-5">
                  <h2 className="text-sm font-bold text-dark tracking-tight">Order Summary</h2>

                  {/* Item preview list */}
                  <div className="divide-y divide-borders/60 max-h-48 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2.5 gap-3 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-2.5">
                          <div className="h-10 w-10 rounded border border-borders/50 bg-slate-50 flex items-center justify-center p-1 overflow-hidden flex-shrink-0">
                            <img
                              src={item.image || "/placeholder.png"}
                              alt={item.name}
                              className="h-full w-full object-contain"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-dark text-xs line-clamp-1">{item.name}</p>
                            <p className="text-[10px] text-light">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-dark flex-shrink-0">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* SECTION 4: Coupon Section */}
                  <div className="border-t border-borders/60 pt-4 space-y-2">
                    <span className="text-[10px] font-bold text-light uppercase tracking-wider block">Apply Promo Code</span>
                    
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between border border-success/20 bg-success/5 rounded-lg p-2 text-xs">
                        <div className="flex items-center gap-2">
                          <svg className="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <span className="font-bold text-success">{appliedCoupon}</span>
                            <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                              Discount applied: ₹{discountAmount.toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-[10px] font-bold text-slate-500 hover:text-dark uppercase tracking-wider underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. WELCOME10"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            disabled={applyingCoupon}
                            className="w-full px-3 py-1.5 text-xs rounded-lg border border-borders bg-white text-dark placeholder-light focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-150"
                          />
                          <button
                            onClick={handleApplyCoupon}
                            disabled={applyingCoupon || !couponCode.trim()}
                            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-dark hover:bg-slate-900 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                          >
                            {applyingCoupon ? '...' : 'Apply'}
                          </button>
                        </div>
                        {couponError && (
                          <p className="text-[10px] font-semibold text-danger">{couponError}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bill Breakdown */}
                  <div className="border-t border-borders pt-4 space-y-2.5 text-[11px] font-semibold text-light uppercase tracking-wider">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-dark font-semibold text-xs">₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-success">
                        <span>Coupon Discount</span>
                        <span className="font-semibold text-xs">- ₹{discountAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span>Shipping</span>
                      <span className="rounded border border-success/20 bg-success/5 px-2 py-0.5 text-[9px] font-bold text-success capitalize tracking-normal">Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Taxes</span>
                      <span className="text-dark font-semibold text-xs">₹{(subtotal * 0.0018).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Grand Total */}
                  <div className="border-t border-borders pt-3.5 flex justify-between items-baseline">
                    <span className="text-xs font-bold text-dark">Grand Total</span>
                    <span className="text-lg font-bold text-primary">₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Place Order CTA */}
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placingOrder || !selectedAddressId}
                    className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg text-xs font-semibold text-white bg-primary hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
                  >
                    {placingOrder ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Placing Order...
                      </span>
                    ) : !selectedAddressId ? (
                      'Select Shipping Address'
                    ) : (
                      'Place Order'
                    )}
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-borders py-5 text-center text-xs font-medium text-light bg-white">
        © {new Date().getFullYear()} Tech Haven. All rights reserved.
      </footer>

      {/* ─── ADD/EDIT ADDRESS MODAL ──────────────────────────────── */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-borders shadow-xl rounded-xl max-w-lg w-full p-6 relative animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button
              onClick={() => { setShowAddressModal(false); resetAddressForm(); }}
              className="absolute top-4 right-4 text-light hover:text-dark transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-sm font-bold text-dark border-b border-borders pb-3 mb-4">
              {editingAddress ? 'Modify Address' : 'Create Shipping Address'}
            </h3>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="col-span-1 sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-light uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    placeholder="Recipient's Name"
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                    className={`w-full p-2 bg-slate-50 border rounded-lg text-xs text-dark placeholder-light focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all ${
                      formErrors.fullName ? 'border-danger' : 'border-borders focus:border-primary'
                    }`}
                  />
                  {formErrors.fullName && <p className="text-[10px] font-semibold text-danger mt-0.5">{formErrors.fullName}</p>}
                </div>

                {/* Mobile Number */}
                <div className="col-span-1 sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-light uppercase tracking-wider">Mobile Number (10 Digits)</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={addressForm.phoneNumber}
                    onChange={(e) => setAddressForm({ ...addressForm, phoneNumber: e.target.value.replace(/\D/g, '') })}
                    maxLength={10}
                    className={`w-full p-2 bg-slate-50 border rounded-lg text-xs text-dark placeholder-light focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all ${
                      formErrors.phoneNumber ? 'border-danger' : 'border-borders focus:border-primary'
                    }`}
                  />
                  {formErrors.phoneNumber && <p className="text-[10px] font-semibold text-danger mt-0.5">{formErrors.phoneNumber}</p>}
                </div>

                {/* Flat/House details */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-light uppercase tracking-wider">Flat / House Number</label>
                  <input
                    type="text"
                    placeholder="e.g. Apartment 4B"
                    value={addressForm.houseNumber}
                    onChange={(e) => setAddressForm({ ...addressForm, houseNumber: e.target.value })}
                    className={`w-full p-2 bg-slate-50 border rounded-lg text-xs text-dark placeholder-light focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all ${
                      formErrors.houseNumber ? 'border-danger' : 'border-borders focus:border-primary'
                    }`}
                  />
                  {formErrors.houseNumber && <p className="text-[10px] font-semibold text-danger mt-0.5">{formErrors.houseNumber}</p>}
                </div>

                {/* Street Address */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-light uppercase tracking-wider">Street / Locality</label>
                  <input
                    type="text"
                    placeholder="e.g. MG Road"
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                    className={`w-full p-2 bg-slate-50 border rounded-lg text-xs text-dark placeholder-light focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all ${
                      formErrors.street ? 'border-danger' : 'border-borders focus:border-primary'
                    }`}
                  />
                  {formErrors.street && <p className="text-[10px] font-semibold text-danger mt-0.5">{formErrors.street}</p>}
                </div>

                {/* Landmark */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-light uppercase tracking-wider">Landmark / Tag (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Next to Metro Station, Home, Work"
                    value={addressForm.landmark}
                    onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-borders rounded-lg text-xs text-dark placeholder-light focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                  />
                </div>

                {/* City */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-light uppercase tracking-wider">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className={`w-full p-2 bg-slate-50 border rounded-lg text-xs text-dark placeholder-light focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all ${
                      formErrors.city ? 'border-danger' : 'border-borders focus:border-primary'
                    }`}
                  />
                  {formErrors.city && <p className="text-[10px] font-semibold text-danger mt-0.5">{formErrors.city}</p>}
                </div>

                {/* State */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-light uppercase tracking-wider">State</label>
                  <input
                    type="text"
                    placeholder="e.g. Maharashtra"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className={`w-full p-2 bg-slate-50 border rounded-lg text-xs text-dark placeholder-light focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all ${
                      formErrors.state ? 'border-danger' : 'border-borders focus:border-primary'
                    }`}
                  />
                  {formErrors.state && <p className="text-[10px] font-semibold text-danger mt-0.5">{formErrors.state}</p>}
                </div>

                {/* Postal Code */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-light uppercase tracking-wider">Postal Code (6 Digits)</label>
                  <input
                    type="text"
                    placeholder="e.g. 400001"
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value.replace(/\D/g, '') })}
                    maxLength={6}
                    className={`w-full p-2 bg-slate-50 border rounded-lg text-xs text-dark placeholder-light focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all ${
                      formErrors.postalCode ? 'border-danger' : 'border-borders focus:border-primary'
                    }`}
                  />
                  {formErrors.postalCode && <p className="text-[10px] font-semibold text-danger mt-0.5">{formErrors.postalCode}</p>}
                </div>

                {/* Country */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-light uppercase tracking-wider">Country</label>
                  <input
                    type="text"
                    placeholder="e.g. India"
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    className={`w-full p-2 bg-slate-50 border rounded-lg text-xs text-dark placeholder-light focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all ${
                      formErrors.country ? 'border-danger' : 'border-borders focus:border-primary'
                    }`}
                  />
                  {formErrors.country && <p className="text-[10px] font-semibold text-danger mt-0.5">{formErrors.country}</p>}
                </div>

                {/* Set as Default Checkbox */}
                <div className="col-span-1 sm:col-span-2 flex items-center gap-2 pt-1.5">
                  <input
                    type="checkbox"
                    id="isDefaultCheckbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="h-3.5 w-3.5 text-primary border-slate-300 rounded focus:ring-primary/20"
                  />
                  <label htmlFor="isDefaultCheckbox" className="text-xs text-slate-600 font-semibold cursor-pointer select-none">
                    Make this my default shipping address
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex pt-4 gap-3 border-t border-borders/60 justify-end">
                <button
                  type="button"
                  onClick={() => { setShowAddressModal(false); resetAddressForm(); }}
                  className="px-4 py-2 rounded-lg border border-borders text-dark hover:bg-slate-50 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  {editingAddress ? 'Update' : 'Add Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  );
}
