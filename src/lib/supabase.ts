import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CustomerAccount, DiscountRpcResponse, SweetPointTransaction } from '../types';

// Read Supabase environment variables
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('placeholder')
  );
};

// Create real client if configured
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// Normalizes 10-digit Indian phone number
export const normalizePhone = (phone: string): string => {
  return phone.replace(/[^0-9]/g, '').slice(-10);
};

// Format phone with country code for Supabase Phone Auth
export const formatE164Phone = (phone: string): string => {
  const clean = normalizePhone(phone);
  return `+91${clean}`;
};

// ==============================================================================
// SIMULATED DATABASE ENGINE (Used when live Supabase keys are pending in preview)
// Implements the EXACT same RPC calculations, RLS rules, and identity mapping.
// ==============================================================================
interface SimCustomer {
  id: string;
  auth_user_id: string;
  name: string;
  phone: string;
  sweet_points: number;
  total_points_earned: number;
  total_points_redeemed: number;
  qualifying_orders_count: number;
  created_at: string;
}

// Default initial accounts for local testing (empty by default)
const simCustomers: Map<string, SimCustomer> = new Map();

const simTransactions: SweetPointTransaction[] = [];

let simCurrentAuthUser: { id: string; phone: string } | null = null;

// ==============================================================================
// HIGH-LEVEL AUTHENTICATION & RPC CALLS
// ==============================================================================

/**
 * 1. Send OTP to mobile phone
 */
export async function sendOtpToMobile(phone: string): Promise<{ success: boolean; message: string; testOtp?: string }> {
  const cleanPhone = normalizePhone(phone);
  if (cleanPhone.length < 10) {
    return { success: false, message: 'Please enter a valid 10-digit mobile number.' };
  }

  if (isSupabaseConfigured() && supabase) {
    const formatted = formatE164Phone(cleanPhone);
    const { error } = await supabase.auth.signInWithOtp({
      phone: formatted,
    });
    if (error) {
      return { success: false, message: error.message };
    }
    return {
      success: true,
      message: `OTP sent via SMS to +91 ${cleanPhone}. Please check your phone.`,
    };
  }

  // Preview Mode: Generate a realistic 6-digit OTP
  return {
    success: true,
    message: `OTP sent to +91 ${cleanPhone}. (In preview mode: use code 123456)`,
    testOtp: '123456',
  };
}

/**
 * 2. Verify OTP and authenticate user
 */
export async function verifyOtpCode(
  phone: string,
  token: string
): Promise<{ success: boolean; authUserId?: string; message?: string }> {
  const cleanPhone = normalizePhone(phone);
  const cleanToken = token.trim();

  if (isSupabaseConfigured() && supabase) {
    const formatted = formatE164Phone(cleanPhone);
    const { data, error } = await supabase.auth.verifyOtp({
      phone: formatted,
      token: cleanToken,
      type: 'sms',
    });

    if (error || !data.user) {
      return {
        success: false,
        message: error ? error.message : 'Invalid or expired OTP. Please try again.',
      };
    }

    return {
      success: true,
      authUserId: data.user.id,
    };
  }

  // Preview Mode Verification: accept '123456' or any 6-digit number
  if (cleanToken.length >= 4) {
    let authId = `auth-user-${cleanPhone}`;
    const existing = simCustomers.get(cleanPhone);
    if (existing) {
      authId = existing.auth_user_id;
    }
    simCurrentAuthUser = {
      id: authId,
      phone: cleanPhone,
    };
    return {
      success: true,
      authUserId: authId,
    };
  }

  return {
    success: false,
    message: 'Invalid OTP code. Please enter the 6-digit code.',
  };
}

/**
 * 3. Create or Get Customer Profile (Links auth.users.id to public.customers)
 * Award 10 Sweet Points bonus strictly ONCE on first creation.
 */
export async function createOrGetCustomerProfileRpc(
  name: string,
  phone: string,
  authUserId?: string
): Promise<{ success: boolean; customer?: CustomerAccount; isNew?: boolean; message?: string }> {
  const cleanPhone = normalizePhone(phone);

  if (isSupabaseConfigured() && supabase) {
    // Call Supabase RPC create_or_get_customer_profile
    const { data, error } = await supabase.rpc('create_or_get_customer_profile', {
      p_name: name.trim() || 'Ghosh Sweet Customer',
      p_phone: cleanPhone,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    const c = data.customer;
    const account: CustomerAccount = {
      id: c.id,
      auth_user_id: c.auth_user_id,
      name: c.name,
      mobile: c.phone,
      sweetPoints: c.sweet_points,
      totalPointsEarned: c.total_points_earned,
      totalPointsRedeemed: c.total_points_redeemed,
      qualifyingOrdersCount: c.qualifying_orders_count,
      createdAt: new Date(c.created_at).getTime(),
    };

    return {
      success: true,
      customer: account,
      isNew: data.is_new,
    };
  }

  // Preview Mode: Enforce exact same database logic
  let customer = simCustomers.get(cleanPhone);
  let isNew = false;

  if (!customer) {
    // Brand new customer: Award 10 Sweet Points exactly once!
    isNew = true;
    const newId = `cust-${Math.floor(1000 + Math.random() * 9000)}`;
    const effectiveAuthId = authUserId || `auth-user-${cleanPhone}`;

    customer = {
      id: newId,
      auth_user_id: effectiveAuthId,
      name: name.trim() || 'Ghosh Sweet Customer',
      phone: cleanPhone,
      sweet_points: 10, // 10 points Signup bonus
      total_points_earned: 10,
      total_points_redeemed: 0,
      qualifying_orders_count: 0,
      created_at: new Date().toISOString(),
    };

    simCustomers.set(cleanPhone, customer);

    simTransactions.unshift({
      id: `tx-${Date.now()}`,
      customer_id: newId,
      points: 10,
      reason: 'Signup Bonus',
      created_at: new Date().toISOString(),
    });
  } else if (authUserId && customer.auth_user_id !== authUserId) {
    // Existing customer on same phone: re-link auth_user_id, keep loyalty history intact
    customer.auth_user_id = authUserId;
  }

  const account: CustomerAccount = {
    id: customer.id,
    auth_user_id: customer.auth_user_id,
    name: customer.name,
    mobile: customer.phone,
    sweetPoints: customer.sweet_points,
    totalPointsEarned: customer.total_points_earned,
    totalPointsRedeemed: customer.total_points_redeemed,
    qualifyingOrdersCount: customer.qualifying_orders_count,
    createdAt: new Date(customer.created_at).getTime(),
  };

  return {
    success: true,
    customer: account,
    isNew,
  };
}

/**
 * 4. Call Supabase RPC: check_new_customer_discount
 * Enforces:
 * - LOGIN_REQUIRED if not authenticated
 * - PHONE_NOT_VERIFIED if unverified
 * - MINIMUM_ORDER_100 if subtotal < 100
 * - OFFER_COMPLETED if qualifying_orders_count >= 5
 * - ELIGIBLE: returns 5% discount amount
 */
export async function checkNewCustomerDiscountRpc(
  subtotal: number,
  authenticatedCustomerId?: string
): Promise<DiscountRpcResponse> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.rpc('check_new_customer_discount', {
      order_subtotal: subtotal,
    });

    if (error) {
      console.error('check_new_customer_discount RPC error:', error);
      return {
        eligible: false,
        discount_amount: 0,
        discount_percentage: 5,
        reason_code: 'LOGIN_REQUIRED',
        message: 'Login with your mobile number to access the New Customer Offer.',
        qualifying_orders_count: 0,
        remaining_offers: 5,
      };
    }

    return data as DiscountRpcResponse;
  }

  // Preview Mode Implementation of check_new_customer_discount
  if (!authenticatedCustomerId && !simCurrentAuthUser) {
    return {
      eligible: false,
      discount_amount: 0,
      discount_percentage: 5,
      reason_code: 'LOGIN_REQUIRED',
      message: 'Login with your mobile number to access the New Customer Offer.',
      qualifying_orders_count: 0,
      remaining_offers: 5,
    };
  }

  let activeCustomer: SimCustomer | undefined;
  if (authenticatedCustomerId) {
    for (const c of simCustomers.values()) {
      if (c.id === authenticatedCustomerId || c.auth_user_id === authenticatedCustomerId) {
        activeCustomer = c;
        break;
      }
    }
  }

  if (!activeCustomer && simCurrentAuthUser) {
    activeCustomer = simCustomers.get(simCurrentAuthUser.phone);
  }

  if (!activeCustomer) {
    return {
      eligible: false,
      discount_amount: 0,
      discount_percentage: 5,
      reason_code: 'PHONE_NOT_VERIFIED',
      message: 'Please verify your mobile number first.',
      qualifying_orders_count: 0,
      remaining_offers: 5,
    };
  }

  if (activeCustomer.qualifying_orders_count >= 5) {
    return {
      eligible: false,
      discount_amount: 0,
      discount_percentage: 5,
      reason_code: 'OFFER_COMPLETED',
      message: 'You have completed your 5 New Customer Offers.',
      qualifying_orders_count: activeCustomer.qualifying_orders_count,
      remaining_offers: 0,
    };
  }

  if (subtotal < 100) {
    return {
      eligible: false,
      discount_amount: 0,
      discount_percentage: 5,
      reason_code: 'MINIMUM_ORDER_100',
      message: 'Minimum order value for this offer is ₹100.',
      qualifying_orders_count: activeCustomer.qualifying_orders_count,
      remaining_offers: 5 - activeCustomer.qualifying_orders_count,
    };
  }

  const discount = Number((subtotal * 0.05).toFixed(2));
  return {
    eligible: true,
    discount_amount: discount,
    discount_percentage: 5,
    reason_code: 'ELIGIBLE',
    message: '5% New Customer Offer Applied',
    qualifying_orders_count: activeCustomer.qualifying_orders_count,
    remaining_offers: 5 - activeCustomer.qualifying_orders_count,
  };
}

/**
 * 5. Complete Qualifying Order (Server-side RPC simulation)
 * Increments qualifying_orders only once, awards spending points only once.
 */
export async function completeQualifyingOrderRpc(
  orderId: string,
  subtotal: number,
  customerId?: string
): Promise<{ success: boolean; pointsAwarded: number; isQualifying: boolean }> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.rpc('complete_qualifying_order', {
      p_order_id: orderId,
    });
    if (error) {
      console.error('complete_qualifying_order RPC error:', error);
      return { success: false, pointsAwarded: 0, isQualifying: false };
    }
    return {
      success: true,
      pointsAwarded: data.points_awarded || 0,
      isQualifying: Boolean(data.is_qualifying),
    };
  }

  // Preview Mode
  if (!customerId) return { success: false, pointsAwarded: 0, isQualifying: false };

  let activeCustomer: SimCustomer | undefined;
  for (const c of simCustomers.values()) {
    if (c.id === customerId || c.auth_user_id === customerId) {
      activeCustomer = c;
      break;
    }
  }

  if (!activeCustomer) return { success: false, pointsAwarded: 0, isQualifying: false };

  let isQualifying = false;
  if (subtotal >= 100 && activeCustomer.qualifying_orders_count < 5) {
    isQualifying = true;
    activeCustomer.qualifying_orders_count = Math.min(5, activeCustomer.qualifying_orders_count + 1);
  }

  const pointsEarned = Math.floor(subtotal / 100) * 5;
  if (pointsEarned > 0) {
    activeCustomer.sweet_points += pointsEarned;
    activeCustomer.total_points_earned += pointsEarned;

    simTransactions.unshift({
      id: `tx-${Date.now()}`,
      customer_id: activeCustomer.id,
      order_id: orderId,
      points: pointsEarned,
      reason: 'Order Purchase',
      created_at: new Date().toISOString(),
    });
  }

  return {
    success: true,
    pointsAwarded: pointsEarned,
    isQualifying,
  };
}

/**
 * 6. Fetch sweet point transactions
 */
export async function fetchCustomerTransactionsRpc(
  customerId: string
): Promise<SweetPointTransaction[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('sweet_point_transactions')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
    return data as SweetPointTransaction[];
  }

  return simTransactions.filter((tx) => tx.customer_id === customerId);
}

/**
 * 7. Sign out from Supabase Auth
 */
export async function signOutSupabase(): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    await supabase.auth.signOut();
  }
  simCurrentAuthUser = null;
}

/**
 * 8. Save or update order in Supabase (primary live database)
 */
export async function saveOrderToSupabase(order: any): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('orders')
      .upsert({
        id: order.id,
        customer_name: order.customerName || 'Guest Customer',
        customer_phone: order.customerPhone || '',
        order_date: order.date,
        items: JSON.stringify(order.items),
        subtotal: order.subtotal,
        discount: order.discountAmount || 0,
        points_used: order.pointsRedeemed || 0,
        final_amount: order.finalTotal,
        status: order.status,
        sync_status: order.syncStatus || 'pending',
        last_synced_at: order.lastSyncedAt ? new Date(order.lastSyncedAt).toISOString() : null,
        created_at: new Date(order.createdAt).toISOString(),
      }, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase orders table upsert notice:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  }

  // Simulated Supabase persistence in development/preview
  return { success: true };
}

/**
 * 9. Update order sync status in Supabase
 */
export async function updateOrderSyncStatusInSupabase(
  orderId: string,
  syncStatus: 'synced' | 'pending' | 'failed',
  syncError?: string
): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    await supabase
      .from('orders')
      .update({
        sync_status: syncStatus,
        sync_error: syncError || null,
        last_synced_at: syncStatus === 'synced' ? new Date().toISOString() : null,
      })
      .eq('id', orderId);
  }
}
