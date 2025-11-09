import { api } from '@/lib/api';
import { WAYBILL_ENDPOINTS, NETWORK_ENDPOINTS } from '@/modules/Home/services/endpoints';

export interface WaybillPrint {
  id: number;
  created_at: string;
  updated_at: string;
  invoice_number: string | null;
  waybill_url: string | null;
  status: 'pending' | 'downloaded' | 'failed';
  local_file_path: string | null;
  error_message: string | null;
  downloaded_at: string | null;
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
   * Fetch all waybill prints with optional pagination
   * @param page - Page number (1-based)
   * @param perPage - Items per page
   * @returns Promise with waybill prints
   */
  async getWaybillPrints(
    page: number = 1,
    perPage: number = 10
  ): Promise<PaginatedWaybillsResponse> {
    try {
      const response = await api.get<PaginatedWaybillsResponse>(WAYBILL_ENDPOINTS.LIST_PRINTS, {
        params: {
          page,
          per_page: perPage,
        },
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
   * @param waybillUrl - URL of the waybill to print
   * @returns Promise with created waybill print
   */
  async createWaybillPrint(
    invoiceNumber: string,
    waybillUrl: string
  ): Promise<WaybillsResponse> {
    try {
      const response = await api.post<WaybillsResponse>(WAYBILL_ENDPOINTS.CREATE_PRINT, {
        invoice_number: invoiceNumber,
        waybill_url: waybillUrl,
      });
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
