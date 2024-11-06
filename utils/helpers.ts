export const handleCancel = () => {
  window.history.back();
};

export const pageItemNo = (pagination: { page: number, size: number }, index: number) => {
  return `${(pagination.size * (pagination.page - 1)) + index + 1}`
};