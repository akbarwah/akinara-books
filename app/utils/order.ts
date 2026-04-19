export function generateOrderId(): string {
  const date = new Date();
  
  // YYMMDD
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // XXXX (4 random uppercase alphanumeric characters)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomStr = '';
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    randomStr += chars[randomIndex];
  }

  return `AKN-${dateStr}-${randomStr}`;
}
