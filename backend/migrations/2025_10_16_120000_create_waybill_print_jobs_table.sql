-- Migration: Create waybill_print_jobs table
-- Timestamp: 2025-10-16 12:00:00
-- Description: Initial table for storing waybill print job records with multi-tenancy support

CREATE TABLE IF NOT EXISTS waybill_print_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id TEXT NOT NULL,
    invoice_number TEXT NOT NULL,
    waybill_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    error_logs TEXT DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_waybill_print_jobs_tenant_id ON waybill_print_jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_waybill_print_jobs_status ON waybill_print_jobs(status);
CREATE INDEX IF NOT EXISTS idx_waybill_print_jobs_created_at ON waybill_print_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_waybill_print_jobs_invoice_number ON waybill_print_jobs(invoice_number);
CREATE INDEX IF NOT EXISTS idx_waybill_print_jobs_tenant_status ON waybill_print_jobs(tenant_id, status);
