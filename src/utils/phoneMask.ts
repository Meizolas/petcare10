// Phone mask utility for Brazilian phone numbers with DDI

export function formatPhoneWithDDI(value: string): string {
  // Remove all non-numeric characters
  const numbers = value.replace(/\D/g, '');
  
  // Limit to 13 digits (DDI + DDD + phone)
  const limited = numbers.slice(0, 13);
  
  // Apply mask: +55 (11) 99999-9999
  if (limited.length === 0) return '';
  if (limited.length <= 2) return `+${limited}`;
  if (limited.length <= 4) return `+${limited.slice(0, 2)} (${limited.slice(2)}`;
  if (limited.length <= 9) return `+${limited.slice(0, 2)} (${limited.slice(2, 4)}) ${limited.slice(4)}`;
  return `+${limited.slice(0, 2)} (${limited.slice(2, 4)}) ${limited.slice(4, 9)}-${limited.slice(9)}`;
}

export function getPhoneNumbers(maskedPhone: string): string {
  // Return only numbers with + prefix for international format
  const numbers = maskedPhone.replace(/\D/g, '');
  return numbers ? `+${numbers}` : '';
}

export function initializePhone(phone: string): string {
  // If phone doesn't start with 55, add it
  const numbers = phone.replace(/\D/g, '');
  
  if (numbers.length === 0) return '+55 ';
  
  // If already has country code
  if (numbers.startsWith('55')) {
    return formatPhoneWithDDI(numbers);
  }
  
  // Add Brazil country code
  return formatPhoneWithDDI('55' + numbers);
}

export function validatePhone(phone: string): boolean {
  const numbers = phone.replace(/\D/g, '');
  // Must have DDI (2) + DDD (2) + phone (8-9) = 12-13 digits
  return numbers.length >= 12 && numbers.length <= 13;
}
