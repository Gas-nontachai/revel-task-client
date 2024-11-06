const protectors: { [key: string]: { key: string, access: 'view' | 'add' | 'edit' } } = {
  'invoice-supplier': { key: 'invoice-supplier', access: 'view', },
  'invoice-supplier-add': { key: 'invoice-supplier', access: 'add', },
  'invoice-supplier-update': { key: 'invoice-supplier', access: 'edit', },
  'invoice-supplier-detail': { key: 'invoice-supplier', access: 'view', },
  'report-product-invoice': { key: 'report-product-invoice', access: 'view', },
  'report-product-invoice-summary': { key: 'report-product-invoice', access: 'view', },
  'report-supplier-invoice': { key: 'report-supplier-invoice', access: 'view', },
  'report-supplier-invoice-summary': { key: 'report-supplier-invoice', access: 'view', },
  'report-payment': { key: 'report-payment', access: 'view', },
  'user': { key: 'user', access: 'view', },
  'user-add': { key: 'user', access: 'add', },
  'user-update': { key: 'user', access: 'edit', },
  'user-detail': { key: 'user', access: 'view', },
  'license': { key: 'license', access: 'view', },
  'license-add': { key: 'license', access: 'add', },
  'license-update': { key: 'license', access: 'edit', },
  'license-detail': { key: 'license', access: 'view', },
  'company': { key: 'company', access: 'view', },
  'company-add': { key: 'company', access: 'add', },
  'company-update': { key: 'company', access: 'edit', },
  'company-detail': { key: 'company', access: 'view', },
  'branch': { key: 'branch', access: 'view', },
  'branch-add': { key: 'branch', access: 'add', },
  'branch-update': { key: 'branch', access: 'edit', },
  'branch-detail': { key: 'branch', access: 'view', },
  'book-bank': { key: 'book-bank', access: 'view', },
  'book-bank-add': { key: 'book-bank', access: 'add', },
  'book-bank-update': { key: 'book-bank', access: 'edit', },
  'book-bank-detail': { key: 'book-bank', access: 'view', },
  'supplier': { key: 'supplier', access: 'view', },
  'supplier-add': { key: 'supplier', access: 'add', },
  'supplier-update': { key: 'supplier', access: 'edit', },
  'supplier-detail': { key: 'supplier', access: 'view', },
  'product': { key: 'product', access: 'view', },
  'product-add': { key: 'product', access: 'add', },
  'product-update': { key: 'product', access: 'edit', },
  'product-detail': { key: 'product', access: 'view', },
  'product-type': { key: 'product-type', access: 'view', },
  'product-type-add': { key: 'product-type', access: 'add', },
  'product-type-update': { key: 'product-type', access: 'edit', },
  'product-type-detail': { key: 'product-type', access: 'view', },
  'product-category': { key: 'product-category', access: 'view', },
  'product-category-add': { key: 'product-category', access: 'add', },
  'product-category-update': { key: 'product-category', access: 'edit', },
  'product-category-detail': { key: 'product-category', access: 'view', },
}

export default protectors