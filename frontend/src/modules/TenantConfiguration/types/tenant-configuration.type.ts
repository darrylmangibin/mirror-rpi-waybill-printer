export interface TenantConfiguration {
  charset: string | null;
  connection_timeout_ms: number | null;
  created_at: string;
  database_name: string;
  database_url: string | null;
  host: string;
  id: string;
  is_ssl: boolean | null;
  password: string;
  port: number;
  ssl_reject_unauthorized: boolean | null;
  supabase_anon_key: string | null;
  supabase_project_url: string | null;
  system_logo_path: string | null;
  system_name: string | null;
  tenant_base_url: string | null;
  tenant_id: string;
  timezone: string | null;
  updated_at: string;
  username: string;
}
