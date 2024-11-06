import {
  UserIcon,
  UsersIcon,
  LayersDifferenceIcon,
  SmartHomeIcon,
  MapPinsIcon,
  FileIcon,
  FolderIcon,
  ReportAnalyticsIcon,
  CategoryIcon,
  Category2Icon
} from 'vue-tabler-icons';

export interface Menu {
  key?: string;
  header?: string;
  title?: string;
  icon?: any;
  to?: string;
  chip?: string;
  chipColor?: string;
  chipVariant?: string;
  chipIcon?: string;
  children?: Menu[];
  disabled?: boolean;
  type?: string;
  subCaption?: string;
}

const sidebarItem: { header: string, childs: Menu[] }[] = [
  {
    header: 'รายการรับสินค้า',
    childs: [
      {
        key: 'invoice-supplier',
        title: 'ตามบริษัท',
        icon: ReportAnalyticsIcon,
        to: '/invoice-supplier'
      },
      {
        key: 'invoice-supplier',
        title: 'ตามสาขา',
        icon: ReportAnalyticsIcon,
        to: '/invoice-supplier-branch'
      },
      {
        key: 'invoice-supplier',
        title: 'ตามบัญชีการโอน',
        icon: ReportAnalyticsIcon,
        to: '/invoice-supplier-book-bank'
      }
    ]
  },
  {
    header: 'รายงาน',
    childs: [
      {
        key: 'report-product-invoice',
        title: 'รับสินค้าตามสินค้า',
        icon: ReportAnalyticsIcon,
        to: '/report-product-invoice'
      },
      {
        key: 'report-supplier-invoice',
        title: 'รับสินค้าตาม Supplier',
        icon: ReportAnalyticsIcon,
        to: '/report-supplier-invoice'
      },
      {
        key: 'report-payment',
        title: 'การโอนเงิน',
        icon: ReportAnalyticsIcon,
        to: '/report-payment'
      }
    ],
  },
  {
    header: 'ข้อมูลหลัก',
    childs: [
      {
        key: 'supplier',
        title: 'ข้อมูล Supplier',
        icon: UsersIcon,
        to: '/supplier'
      },
      {
        key: 'product',
        title: 'ข้อมูลสินค้า',
        icon: FolderIcon,
        to: '/product'
      },
      {
        key: 'product-type',
        title: 'ประเภทสินค้า',
        icon: Category2Icon,
        to: '/product-type'
      },
      {
        key: 'product-category',
        title: 'หมวดหมู่สินค้า',
        icon: CategoryIcon,
        to: '/product-category'
      },
      {
        key: 'company',
        title: 'ข้อมูลบริษัท',
        icon: SmartHomeIcon,
        to: '/company'
      },
      {
        key: 'branch',
        title: 'ข้อมูลสาขา',
        icon: MapPinsIcon,
        to: '/branch'
      },
      {
        key: 'book-bank',
        title: 'สมุดบัญชี',
        icon: FileIcon,
        to: '/book-bank'
      },
      {
        key: 'user',
        title: 'ผู้ใช้งานระบบ',
        icon: UserIcon,
        to: '/user'
      },
      {
        key: 'license',
        title: 'สิทธิ์การใช้งาน',
        icon: LayersDifferenceIcon,
        to: '/license'
      },
    ],
  }
];

export default sidebarItem