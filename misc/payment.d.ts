import { BookBank } from "./bank";
import { InvoiceSupplier } from "./invoice-supplier";

export type Payment = {
  payment_id: string,
  book_bank_id: string,
  branch_id: string,
  invoice_supplier_id: string,
  user_id: string,
  payment_type: string,
  payment_date: date | string,
  payment_price: any,
  payment_vat_price: any,
  payment_net_price: any,
  payment_remark: string,
  payment_slip_url: string,
  addby?: string,
  adddate?: Date,
  updateby?: string,
  lastupdate?: Date,
  book_bank?: BookBank,
  invoice_supplier?: InvoiceSupplier,
  user_fullname?: string,
};

export type PaymentLog = {
  payment_log_id: string,
  payment_id: string,
  payment_log_text: string,
  payment_log_event: string,
  addby?: string,
  adddate?: Date | string,
};

interface PaymentInvoice extends Payment {
  invoice_supplier_id: string,
  invoice_supplier_origin_id: string,
  branch_id: string,
  company_id: string,
  supplier_id: string,
  user_id: string,
  invoice_supplier_name: string,
  invoice_supplier_branch_name: string,
  invoice_supplier_company_name: string,
  invoice_supplier_account: string,
  invoice_supplier_license_plate: string,
  invoice_supplier_date: Date | string,
  invoice_supplier_contact: string,
  invoice_supplier_weight: any,
  invoice_supplier_price: any,
  invoice_supplier_vat_type: 'exc' | 'inc',
  invoice_supplier_vat_rate: any,
  invoice_supplier_vat_price: any,
  invoice_supplier_net_price: any,
  invoice_supplier_remark: string,
  invoice_supplier_status: string,
}