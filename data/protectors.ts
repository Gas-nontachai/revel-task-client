const protectors: { [key: string]: { key: string, access: 'view' | 'add' | 'edit' } } = {
  'user': { key: 'user', access: 'view', },
  'user-add': { key: 'user', access: 'add', },
  'user-update': { key: 'user', access: 'edit', },
  'user-detail': { key: 'user', access: 'view', },
  'license': { key: 'license', access: 'view', },
  'license-add': { key: 'license', access: 'add', },
  'license-update': { key: 'license', access: 'edit', },
  'license-detail': { key: 'license', access: 'view', },
}

export default protectors