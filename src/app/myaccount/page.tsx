'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import axiosClient from '@/services/axiosClient';

// Matches the backend AddressResponse and AddressRequest
interface Address {
  id?: number;
  fullName: string;
  phoneNumber: string;
  houseNumber: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  default?: boolean;
}

function MyAccountContent() {
  const { user } = useAuth();
  const [view, setView] = useState<'menu' | 'address' | 'order'>('menu');
  const [addresses, setAddresses] = useState<Address[]>([]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const emptyAddress: Address = {
    fullName: '',
    phoneNumber: '',
    houseNumber: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    default: false,
  };

  const [newAddress, setNewAddress] = useState<Address>(emptyAddress);

  // Load addresses from backend
  const loadAddresses = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await axiosClient.get(`/addresses/user/${user.id}`);
      if (res.data?.data) {
        setAddresses(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const handleAddNew = () => {
    setEditingId(null);
    setNewAddress(emptyAddress);
    setShowForm(true);
  };

  const handleEdit = (address: Address) => {
    setEditingId(address.id || null);
    setNewAddress(address);
    setShowForm(true);
  };

  const handleSetDefault = async (addressId: number) => {
    try {
      await axiosClient.patch(`/addresses/${addressId}/default`);
      await loadAddresses();
    } catch (error) {
      console.error('Failed to set default address:', error);
      alert('Error setting default address.');
    }
  };

  const handleDelete = async (addressId: number) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await axiosClient.delete(`/addresses/${addressId}`);
      await loadAddresses();
    } catch (error) {
      console.error('Failed to delete address:', error);
      alert('Error deleting address.');
    }
  };

  const handleSaveAddress = async () => {
    try {
      if (editingId) {
        // Update existing address
        await axiosClient.put(`/addresses/${editingId}`, newAddress);
      } else {
        // Add new address
        await axiosClient.post(`/addresses?userId=${user?.id}`, newAddress);
      }
      
      await loadAddresses();
      setShowForm(false);
      setEditingId(null);
      setNewAddress(emptyAddress);
    } catch (error) {
      console.error(error);
      alert('Error while saving address. Please ensure all fields are valid.');
    }
  };

  return (
    <div className="bg-background min-h-screen text-dark flex flex-col justify-between">
      <div>
        <Navbar />

        <div className="max-w-6xl mx-auto px-6 md:px-8 py-8 space-y-6">
          
          {/* Header Card */}
          <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-6 md:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-lg bg-white/10 flex items-center justify-center text-white text-xl font-bold border border-white/10">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="space-y-0.5">
                <h1 className="text-lg font-bold text-white tracking-tight">{user?.name || 'Customer Profile'}</h1>
                <p className="text-xs text-slate-400">{user?.email || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="border border-white/10 bg-white/5 rounded-lg px-3.5 py-1.5 text-center">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Total Addresses</p>
                <p className="text-base font-bold text-accent">{addresses.length}</p>
              </div>
              <div className="border border-white/10 bg-white/5 rounded-lg px-3.5 py-1.5 text-center">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Status</p>
                <p className="text-base font-bold text-success">Active</p>
              </div>
            </div>
          </div>

          {/* Grid Layout Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Left sidebar nav panel */}
            <div className="md:col-span-1 border border-borders bg-white p-3 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] h-fit space-y-1">
              <span className="text-[9px] font-bold text-light uppercase tracking-wider px-3.5 pb-1 block">Account Settings</span>
              <button
                onClick={() => { setView('menu'); setShowForm(false); }}
                className={`w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  view === 'menu'
                    ? 'bg-slate-50 text-dark'
                    : 'text-light hover:text-dark hover:bg-slate-50/50'
                }`}
              >
                Profile Overview
              </button>
              <button
                onClick={() => { setView('address'); }}
                className={`w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  view === 'address'
                    ? 'bg-slate-50 text-dark'
                    : 'text-light hover:text-dark hover:bg-slate-50/50'
                }`}
              >
                Saved Addresses
              </button>
              <button
                onClick={() => { setView('order'); setShowForm(false); }}
                className={`w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  view === 'order'
                    ? 'bg-slate-50 text-dark'
                    : 'text-light hover:text-dark hover:bg-slate-50/50'
                }`}
              >
                Order History
              </button>
            </div>

            {/* Right content panel */}
            <div className="md:col-span-3 border border-borders bg-white p-6 md:p-8 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] min-h-[300px]">
              
              {/* Profile Overview Tab */}
              {view === 'menu' && (
                <div className="space-y-6">
                  <h2 className="text-sm font-bold text-dark border-b border-borders pb-3">Personal Details</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-light uppercase tracking-wider">Full Name</span>
                      <p className="font-semibold text-dark p-3 bg-slate-50/50 border border-borders rounded-lg">
                        {user?.name || 'Not Provided'}
                      </p>
                    </div>
                    
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-light uppercase tracking-wider">Email Address</span>
                      <p className="font-semibold text-dark p-3 bg-slate-50/50 border border-borders rounded-lg">
                        {user?.email || 'Not Provided'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-borders flex flex-wrap gap-3">
                    <button
                      onClick={() => setView('address')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 border border-borders hover:bg-slate-50 text-dark text-xs font-semibold rounded-lg shadow-sm transition-colors duration-150"
                    >
                      Manage Addresses
                    </button>
                    <button
                      onClick={() => setView('order')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 border border-borders hover:bg-slate-50 text-dark text-xs font-semibold rounded-lg shadow-sm transition-colors duration-150"
                    >
                      Order History
                    </button>
                  </div>
                </div>
              )}

              {/* Saved Addresses Tab */}
              {view === 'address' && (
                <div className="space-y-6">
                  
                  {/* Address Tab Header */}
                  <div className="flex justify-between items-center border-b border-borders pb-3">
                    <h2 className="text-sm font-bold text-dark">Saved Addresses</h2>
                    
                    {!showForm && (
                      <button
                        onClick={handleAddNew}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        + Add New
                      </button>
                    )}
                  </div>

                  {/* Add/Edit Form */}
                  {showForm ? (
                    <div className="space-y-4 max-w-xl">
                      <h3 className="text-xs font-bold text-dark uppercase tracking-wider">
                        {editingId ? 'Edit Address' : 'Add New Address'}
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={newAddress.fullName}
                          onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                          className="w-full p-2.5 bg-slate-50/50 border border-borders rounded-lg text-xs text-dark placeholder-light focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-150 col-span-1 sm:col-span-2"
                          required
                        />
                        <input
                          type="text"
                          placeholder="House Number / Flat No."
                          value={newAddress.houseNumber}
                          onChange={(e) => setNewAddress({ ...newAddress, houseNumber: e.target.value })}
                          className="w-full p-2.5 bg-slate-50/50 border border-borders rounded-lg text-xs text-dark placeholder-light focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-150"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Street Address"
                          value={newAddress.street}
                          onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                          className="w-full p-2.5 bg-slate-50/50 border border-borders rounded-lg text-xs text-dark placeholder-light focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-150"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Landmark (Optional)"
                          value={newAddress.landmark || ''}
                          onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                          className="w-full p-2.5 bg-slate-50/50 border border-borders rounded-lg text-xs text-dark placeholder-light focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-150 col-span-1 sm:col-span-2"
                        />
                        <input
                          type="text"
                          placeholder="City"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          className="w-full p-2.5 bg-slate-50/50 border border-borders rounded-lg text-xs text-dark placeholder-light focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-150"
                          required
                        />
                        <input
                          type="text"
                          placeholder="State"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          className="w-full p-2.5 bg-slate-50/50 border border-borders rounded-lg text-xs text-dark placeholder-light focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-150"
                          required
                        />
                        <input
                          type="text"
                          placeholder="ZIP/Postal Code (6 digits)"
                          value={newAddress.postalCode}
                          onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                          className="w-full p-2.5 bg-slate-50/50 border border-borders rounded-lg text-xs text-dark placeholder-light focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-150"
                          required
                          maxLength={6}
                        />
                        <input
                          type="text"
                          placeholder="Country"
                          value={newAddress.country}
                          onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                          className="w-full p-2.5 bg-slate-50/50 border border-borders rounded-lg text-xs text-dark placeholder-light focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-150"
                          required
                        />
                        <input
                          type="tel"
                          placeholder="Mobile Number (10 digits)"
                          value={newAddress.phoneNumber}
                          onChange={(e) => setNewAddress({ ...newAddress, phoneNumber: e.target.value })}
                          pattern="[0-9]{10}"
                          className="w-full p-2.5 bg-slate-50/50 border border-borders rounded-lg text-xs text-dark placeholder-light focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-150 col-span-1 sm:col-span-2"
                          required
                          maxLength={10}
                        />
                      </div>

                      {/* Form Actions */}
                      <div className="flex pt-4 gap-3">
                        <button
                          onClick={handleSaveAddress}
                          className="px-4 py-2 bg-primary hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                        >
                          {editingId ? 'Update Address' : 'Save Address'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowForm(false)}
                          className="px-4 py-2 rounded-lg border border-borders text-dark hover:bg-slate-50 text-xs font-semibold transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Saved Addresses List */
                    <div className="space-y-4">
                      {loading ? (
                        <p className="text-xs font-medium text-light animate-pulse">Loading addresses...</p>
                      ) : addresses.length === 0 ? (
                        <p className="text-xs font-medium text-light">No saved addresses found. Add one to expedite your checkouts.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {addresses.map((addr) => (
                            <div
                              key={addr.id}
                              className={`border ${addr.default ? 'border-primary shadow-sm bg-blue-50/10' : 'border-borders bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]'} p-4 rounded-xl flex flex-col justify-between gap-4 relative`}
                            >
                              {addr.default && (
                                <span className="absolute top-4 right-4 text-[9px] px-2 py-0.5 rounded-full bg-primary text-white font-bold uppercase tracking-wider">
                                  Default
                                </span>
                              )}
                              <div className="space-y-2 pr-16">
                                <p className="font-semibold text-dark text-xs sm:text-sm">{addr.fullName}</p>
                                <div className="text-xs font-normal text-light space-y-0.5">
                                  <p>{addr.houseNumber}, {addr.street}</p>
                                  {addr.landmark && <p>Landmark: {addr.landmark}</p>}
                                  <p>{addr.city}, {addr.state} - {addr.postalCode}</p>
                                  <p>{addr.country}</p>
                                  <p className="text-dark font-medium mt-1">Mobile: {addr.phoneNumber}</p>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2 pt-2 border-t border-borders">
                                <button
                                  onClick={() => handleEdit(addr)}
                                  className="flex-1 py-1.5 text-center text-[11px] font-semibold text-dark bg-white hover:bg-slate-50 rounded-lg border border-borders transition-colors"
                                >
                                  Edit
                                </button>
                                {!addr.default && (
                                  <button
                                    onClick={() => addr.id && handleSetDefault(addr.id)}
                                    className="flex-1 py-1.5 text-center text-[11px] font-semibold text-primary bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                                  >
                                    Set Default
                                  </button>
                                )}
                                <button
                                  onClick={() => addr.id && handleDelete(addr.id)}
                                  className="px-3 py-1.5 text-center text-[11px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Order History Tab */}
              {view === 'order' && (
                <div className="space-y-6">
                  <h2 className="text-sm font-bold text-dark border-b border-borders pb-3">Order History</h2>
                  <div className="p-6 rounded-xl bg-slate-50/50 border border-borders text-center space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    <p className="text-xs font-medium text-light max-w-sm mx-auto">
                      Your full order records are stored in our secure tracking console.
                    </p>
                    <Link
                      href="/orders"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors duration-150"
                    >
                      Access Tracking Console
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-borders py-5 text-center text-xs font-medium text-light bg-white">
        © {new Date().getFullYear()} Tech Haven. All rights reserved.
      </footer>
    </div>
  );
}

function MyAccountPage() {
  return (
    <ProtectedRoute>
      <MyAccountContent />
    </ProtectedRoute>
  );
}

export default MyAccountPage;
