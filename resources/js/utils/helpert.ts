export function formatRupiah(amount: number, fixed?: boolean): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: fixed ? 0 : 0,
    maximumFractionDigits: fixed ? 0 : 2,
  }).format(amount);
}

export function formatDate(raw: string): string {
  const date = new Date(raw.replace(' ', 'T')); // Ensure ISO format

  const formattedDate = date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const formattedTime = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return `${formattedDate} ${formattedTime}`;
}
