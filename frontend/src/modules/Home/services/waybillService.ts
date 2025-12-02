import { api } from '@/lib/api';
import { WAYBILL_ENDPOINTS, NETWORK_ENDPOINTS } from '@/modules/Home/services/endpoints';

export interface WaybillPrint {
  id: number;
  tenant_id: number;
  created_at: string;
  updated_at: string;
  invoice_number: string | null;
  waybill_url: string | null;
  marketplace: string | null;
  status: 'pending' | 'downloading' | 'downloaded' | 'for printing' | 'completed' | 'error';
  local_file_path: string | null;
  error_message: string | null;
  downloaded_at: string | null;
  // Print-related fields
  print_status: 'idle' | 'pending' | 'printing' | 'completed' | 'error';
  cups_job_id: number | null;
  printer_name: string | null;
  print_error: string | null;
  print_completed_at: string | null;
  auto_print: boolean | null;
}

export interface WaybillsResponse {
  status: string;
  data?: WaybillPrint[];
  message?: string;
  error?: string;
}

export interface PaginatedWaybillsResponse extends WaybillsResponse {
  data?: WaybillPrint[];
  total?: number;
  page?: number;
  per_page?: number;
  total_pages?: number;
}

export interface NetworkInfo {
  local_ip: string;
  api_url: string;
}

const waybillService = {
  /**
   * Fetch all waybill prints with optional pagination and search
   * @param page - Page number (1-based)
   * @param perPage - Items per page
   * @param search - Optional search query for invoice number
   * @returns Promise with waybill prints
   */
  async getWaybillPrints(
    page: number = 1,
    perPage: number = 10,
    search?: string
  ): Promise<PaginatedWaybillsResponse> {
    try {
      const params: Record<string, any> = {
        page,
        per_page: perPage,
      };
      
      // Add search parameter if provided and non-empty
      if (search && search.trim()) {
        params.search = search.trim();
      }
      
      const response = await api.get<PaginatedWaybillsResponse>(WAYBILL_ENDPOINTS.LIST_PRINTS, {
        params,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to fetch waybill prints: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  },

  /**
   * Create a new waybill print
   * @param invoiceNumber - Invoice number for the waybill
   * @param tenantId - Tenant ID for the waybill (as string)
   * @param waybillUrl - URL of the waybill to print (optional)
   * @param marketplace - Marketplace identifier (optional)
   * @returns Promise with created waybill print
   */
  async createWaybillPrint(
    invoiceNumber: string,
    tenantId: string,
    waybillUrl?: string | null,
    marketplace?: string | null
  ): Promise<WaybillsResponse> {
    try {
      const payload: Record<string, any> = {
        invoice_number: invoiceNumber,
        tenant_id: tenantId,
      };
      
      // Only include waybill_url if it's provided
      if (waybillUrl) {
        payload.waybill_url = waybillUrl;
      }
      
      // Only include marketplace if it's provided
      if (marketplace) {
        payload.marketplace = marketplace;
      }
      
      const response = await api.post<WaybillsResponse>(WAYBILL_ENDPOINTS.CREATE_PRINT, payload);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to create waybill print: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  },

  /**
   * Download a waybill file from URL and save to local storage
   * @param waybillId - ID of the waybill to download
   * @returns Promise with download result
   */
  async downloadWaybill(waybillId: string | number): Promise<WaybillsResponse> {
    try {
      const response = await api.post<WaybillsResponse>(
        WAYBILL_ENDPOINTS.DOWNLOAD_PRINT(Number(waybillId))
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to download waybill: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  },

  /**
   * Print a waybill file
   * @param waybillId - ID of the waybill to print
   * @returns Promise with print result
   */
  async printWaybill(waybillId: string | number): Promise<WaybillsResponse> {
    try {
      const response = await api.post<WaybillsResponse>(
        WAYBILL_ENDPOINTS.PRINT_PRINT(Number(waybillId))
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to print waybill: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  },

  /**
   * Cancel an ongoing print job
   * @param waybillId - ID of the waybill print job to cancel
   * @returns Promise with cancel result
   */
  async cancelPrintWaybill(waybillId: string | number): Promise<WaybillsResponse> {
    try {
      const response = await api.post<WaybillsResponse>(
        WAYBILL_ENDPOINTS.CANCEL_PRINT(Number(waybillId))
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to cancel print: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  },

  /**
   * Update an existing waybill print
   * @param waybillId - ID of the waybill to update
   * @param invoiceNumber - Updated invoice number
   * @param tenantId - Updated tenant ID
   * @param waybillUrl - Updated waybill URL (optional)
   * @param marketplace - Updated marketplace (optional)
   * @returns Promise with updated waybill print
   */
  async updateWaybillPrint(
    waybillId: string | number,
    invoiceNumber: string,
    tenantId: string,
    waybillUrl?: string | null,
    marketplace?: string | null
  ): Promise<WaybillsResponse> {
    try {
      const payload: Record<string, any> = {
        invoice_number: invoiceNumber,
        tenant_id: tenantId,
      };

      if (waybillUrl) {
        payload.waybill_url = waybillUrl;
      }

      if (marketplace) {
        payload.marketplace = marketplace;
      }

      const response = await api.put<WaybillsResponse>(
        WAYBILL_ENDPOINTS.UPDATE_PRINT(Number(waybillId)),
        payload
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to update waybill print: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  },

  /**
   * Delete a waybill print
   * @param waybillId - ID of the waybill to delete
   * @returns Promise with delete result
   */
  async deleteWaybill(waybillId: string | number): Promise<WaybillsResponse> {
    try {
      const response = await api.delete<WaybillsResponse>(
        WAYBILL_ENDPOINTS.DELETE_PRINT(Number(waybillId))
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to delete waybill: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  },

  /**
   * Fetch network information for print job QR endpoint
   * @returns Promise with network info containing local IP and API URL
   */
  async getPrintJobQREndPoint(): Promise<NetworkInfo> {
    try {
      const response = await api.get<NetworkInfo>(NETWORK_ENDPOINTS.GET_PRINT_JOB_QR);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to fetch print job QR endpoint: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  },
};

export default waybillService;
