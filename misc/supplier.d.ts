export type Supplier = {
  supplier_id: string,
  company_id: string,
  branch_id: string,
  supplier_main_id: string,
  supplier_origin_id: string,
  supplier_name: string,
  supplier_contact_name: string,
  supplier_contact1: string,
  supplier_contact2: string,
  supplier_contact3: string,
  supplier_address: string;
  supplier_tax: string,
  supplier_vat_type: 'exc' | 'inc',
  supplier_vat_rate: number,
  supplier_remark: string,
  addby?: string,
  adddate?: Date | string,
  updateby?: string,
  lastupdate?: Date | string,
  company_name?: string,
  branch_name?: string,
};

