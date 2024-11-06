export const onlyNumeric = (evt: any) => {
  evt = (evt) ? evt : window.event;

  const charCode = (evt.which) ? evt.which : evt.keyCode;

  if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
    evt.preventDefault();
  } else {
    return true;
  }
}