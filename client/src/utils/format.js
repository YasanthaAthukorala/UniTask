/** Format amount in Sri Lankan Rupees */
export function formatCurrency(amount) {
  const n = Number(amount);
  if (Number.isNaN(n)) return 'Rs. 0';
  return `Rs. ${n.toLocaleString('en-LK', { maximumFractionDigits: 0 })}`;
}

/** Display phone in +94 XX XXX XXXX style when possible */
export function formatPhone(phone) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('94') && digits.length === 11) {
    const rest = digits.slice(2);
    return `+94 ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5)}`;
  }
  return phone;
}
