export type Product = {
  product_id: string,
  branch_id: string,
  product_origin_id: string,
  product_category_id: string,
  product_main_id: string,
  product_type_id: string,
  product_name: string,
  product_description: string,
  product_unit_name1: string,
  product_unit_name2: string,
  product_unit_name3: string,
  product_unit_name4: string,
  product_unit_name5: string,
  product_unit_qty1: number | null,
  product_unit_qty2: number | null,
  product_unit_qty3: number | null,
  product_unit_qty4: number | null,
  product_unit_qty5: number | null,
  product_unit_conv1: number | null,
  product_unit_conv2: number | null,
  product_unit_conv3: number | null,
  product_unit_conv4: number | null,
  product_unit_conv5: number | null,
  product_status: 'active' | 'inactive',
  addby?: string,
  adddate?: Date,
  updateby?: string,
  lastupdate?: string,
  branch_name?: string,
  company_name?: string,
  product_category_name?: string,
  product_type_name?: string,
}

export type ProductCategory = {
  product_category_id: string;
  product_category_name: string;
  product_category_detail?: string;
  addby?: string,
  adddate?: Date,
  updateby?: string,
  lastupdate?: string,
}

export type ProductType = {
  product_type_id: string;
  product_type_name: string;
  product_type_detail?: string;
  addby?: string,
  adddate?: Date,
  updateby?: string,
  lastupdate?: string,
}