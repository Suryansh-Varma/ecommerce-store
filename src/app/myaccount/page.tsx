'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';

interface Address {
  id?: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  mobile: string;
  label: 'Home' | 'Work';
}

function MyAccountContent() {
  const { user } = useAuth();
  const [view, setView] = useState<'menu' | 'address' | 'order'>('menu');
  const [addresses, setAddresses] = useState<Address[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [newAddress, setNewAddress] = useState<Address>({
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    mobile: '',
    label: 'Home',
  });

  // Load addresses from localStorage
  const loadAddresses = useCallback(() => {
    try {
      const stored = localStorage.getItem('user_addresses');
      if (stored) setAddresses(JSON.parse(stored));
    } catch {
      setAddresses([]);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const handleAddNew = () => {
    setEditingId(null);
    setNewAddress({
      name: '',
      street: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      mobile: '',
      label: 'Home',
    });
    setShowForm(true);
  };

  const handleEdit = (address: Address) => {
    setEditingId(address.id || null);
    setNewAddress(address);
    setShowForm(true);
  };

  const handleSaveAddress = () => {
    try {
      const stored = localStorage.getItem('user_addresses');
      const existing: Address[] = stored ? JSON.parse(stored) : [];
      let updated: Address[];

      if (editingId) {
        // Update existing address
        updated = existing.map((a) =>
          a.id === editingId ? { ...newAddress, id: editingId } : a
        );
      } else {
        // Add new address with a local ID
        const newId = `addr_${Date.now()}`;
        updated = [...existing, { ...newAddress, id: newId }];
      }

      localStorage.setItem('user_addresses', JSON.stringify(updated));
      setAddresses(updated);
      setShowForm(false);
      setEditingId(null);
      setNewAddress({
        name: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        mobile: '',
        label: 'Home',
      });

      alert(editingId ? 'Address updated successfully!' : 'Address added successfully!');
    } catch (error) {
      console.error(error);
      alert('Error while saving address.');
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
                          value={newAddress.name}
                          onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                          className="w-full p-2.5 bg-slate-50/50 border border-borders rounded-lg text-xs text-dark placeholder-light focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-150 col-span-1 sm:col-span-2"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Street Address"
                          value={newAddress.street}
                          onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                          className="w-full p-2.5 bg-slate-50/50 border border-borders rounded-lg text-xs text-dark placeholder-light focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-150 col-span-1 sm:col-span-2"
                          required
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
                          placeholder="ZIP Code"
                          value={newAddress.zip}
                          onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                          className="w-full p-2.5 bg-slate-50/50 border border-borders rounded-lg text-xs text-dark placeholder-light focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-150"
                          required
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
                          placeholder="Mobile Number"
                          value={newAddress.mobile}
                          onChange={(e) => setNewAddress({ ...newAddress, mobile: e.target.value })}
                          pattern="[0-9]{10}"
                          className="w-full p-2.5 bg-slate-50/50 border border-borders rounded-lg text-xs text-dark placeholder-light focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-150 col-span-1 sm:col-span-2"
                          required
                        />
                      </div>

                      {/* Tag Selector */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setNewAddress({ ...newAddress, label: 'Home' })}
                          className={`px-3 py-1.5 text-xs font-semibold border rounded-lg transition-colors duration-150 ${
                            newAddress.label === 'Home'
                              ? 'bg-primary border-primary text-white shadow-sm'
                              : 'bg-white border-borders text-light hover:text-dark'
                          }`}
                        >
                          Home
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewAddress({ ...newAddress, label: 'Work' })}
                          className={`px-3 py-1.5 text-xs font-semibold border rounded-lg transition-colors duration-150 ${
                            newAddress.label === 'Work'
                              ? 'bg-primary border-primary text-white shadow-sm'
                              : 'bg-white border-borders text-light hover:text-dark'
                          }`}
                        >
                          Work
                        </button>
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
                      {addresses.length === 0 ? (
                        <p className="text-xs font-medium text-light">No saved addresses found. Add one to expedite your checkouts.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {addresses.map((addr) => (
                            <div
                              key={addr.id}
                              className="border border-borders p-4 rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between gap-4"
                            >
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <p className="font-semibold text-dark text-xs sm:text-sm">{addr.name}</p>
                                  <span className="text-[9px] px-1.5 py-0.5 rounded border border-primary/10 bg-primary/5 font-bold uppercase tracking-wider text-primary">
                                    {addr.label}
                                  </span>
                                </div>
                                <div className="text-xs font-normal text-light space-y-0.5">
                                  <p>{addr.street}</p>
                                  <p>{addr.city}, {addr.state} - {addr.zip}</p>
                                  <p>{addr.country}</p>
                                  <p className="text-dark font-medium mt-1">Mobile: {addr.mobile}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleEdit(addr)}
                                className="w-full py-2 text-center text-xs font-semibold text-dark bg-white hover:bg-slate-50 rounded-lg border border-borders shadow-sm transition-colors"
                              >
                                Edit Address
                              </button>
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
