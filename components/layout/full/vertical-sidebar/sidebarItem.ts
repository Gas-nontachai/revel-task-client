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
        key: 'my-task',
        title: 'My Task',
        icon: ReportAnalyticsIcon,
        to: '/my-task'
      },
      {
        key: 'project',
        title: 'Project Manage',
        icon: ReportAnalyticsIcon,
        to: '/project'
      },
    ]
  },
  {
    header: 'ข้อมูลหลัก',
    childs: [
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