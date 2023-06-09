if ((window.location.href.includes("/account/orders") || window.location.href.includes("/account/billing")) && typeof kapow_alt_billing !== 'undefined' && isValidURL(kapow_alt_billing)) {
  window.location.href = kapow_alt_billing;
}

function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}
