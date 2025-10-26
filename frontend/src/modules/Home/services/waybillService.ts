import apiClient from '@/lib/api';
import { WAYBILL_ENDPOINTS } from './endpoints';

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
      const response = await apiClient.get<PaginatedWaybillsResponse>(WAYBILL_ENDPOINTS.LIST_PRINTS, {
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
};

export default waybillService;
