import { OrderHistoryItem, OrderStatus, SheetsSyncStatus } from '../types';
import { DEFAULT_SPREADSHEET_ID, EXPECTED_SHEET_COLUMNS } from '../server/googleSheetsPlugin';

export interface SyncResponse {
  success: boolean;
  action?: 'insert' | 'update' | 'simulated';
  message?: string;
  error?: string;
  spreadsheetId?: string;
}

export interface SheetsStatusInfo {
  status: string;
  spreadsheetId: string;
  spreadsheetTitle: string;
  sheetName: string;
  columns: string[];
  recentSyncs: Array<{
    orderId: string;
    timestamp: string;
    status: 'synced' | 'pending' | 'failed';
    action: string;
    detail: string;
    spreadsheetId?: string;
  }>;
  serverRecordedOrdersCount?: number;
  hasGoogleToken: boolean;
}

export interface SheetRecordedOrder {
  id: string;
  date: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  itemsText: string;
  finalTotal: number;
  paymentMethod: string;
  status: OrderStatus;
  syncStatus: SheetsSyncStatus;
}

/**
 * Client service to communicate securely with server-side /api/sheets endpoints.
 * Never exposes secrets or API keys in the client bundle.
 */
export async function syncOrderToServerSheets(
  order: OrderHistoryItem,
  userToken?: string,
  spreadsheetId?: string
): Promise<SyncResponse> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (userToken) {
      headers['Authorization'] = `Bearer ${userToken}`;
    }

    const res = await fetch('/api/sheets/sync', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        order,
        accessToken: userToken,
        spreadsheetId,
      }),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error communicating with sheets sync server',
    };
  }
}

/**
 * Update an order's status in Google Sheet via server API
 */
export async function updateOrderSheetStatus(
  orderId: string,
  status: OrderStatus,
  userToken?: string,
  spreadsheetId?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (userToken) {
      headers['Authorization'] = `Bearer ${userToken}`;
    }

    const res = await fetch('/api/sheets/update-status', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        orderId,
        status,
        accessToken: userToken,
        spreadsheetId,
      }),
    });

    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Failed to update order status in Google Sheet',
    };
  }
}

/**
 * Fetch recorded orders from Google Sheet (or server persistent memory fallback)
 */
export async function fetchRecordedOrdersFromSheets(
  userToken?: string,
  spreadsheetId?: string
): Promise<{ success: boolean; orders: SheetRecordedOrder[]; source: 'google_sheets' | 'server_memory' }> {
  try {
    const headers: Record<string, string> = {};
    if (userToken) {
      headers['Authorization'] = `Bearer ${userToken}`;
    }

    const res = await fetch('/api/sheets/orders', { headers });
    if (!res.ok) {
      throw new Error(`Failed to load orders (${res.status})`);
    }

    return await res.json();
  } catch (e: any) {
    console.warn('Error reading orders from Google Sheets:', e);
    return {
      success: false,
      orders: [],
      source: 'server_memory',
    };
  }
}

/**
 * Fetch server sync status & recent sync history
 */
export async function fetchSheetsSyncStatus(): Promise<SheetsStatusInfo | null> {
  try {
    const res = await fetch('/api/sheets/status');
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('Error fetching sheets status:', e);
    return null;
  }
}

/**
 * Batch sync all pending or failed orders
 */
export async function batchSyncOrders(
  orders: OrderHistoryItem[],
  userToken?: string,
  spreadsheetId?: string
): Promise<{ success: boolean; results?: any[]; error?: string }> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (userToken) {
      headers['Authorization'] = `Bearer ${userToken}`;
    }

    const res = await fetch('/api/sheets/batch-sync', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        orders,
        accessToken: userToken,
        spreadsheetId,
      }),
    });

    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Batch sync failed',
    };
  }
}
