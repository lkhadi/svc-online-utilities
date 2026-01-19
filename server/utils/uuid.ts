let lastTimestamp = 0;

export function generateUUIDv7(): string {
  const timestamp = Date.now();
  const currentTimestamp = Math.max(timestamp, lastTimestamp);
  lastTimestamp = currentTimestamp;

  const time = BigInt(currentTimestamp) & BigInt('0xFFFFFFFFFFFF');
  const timeHex = time.toString(16).padStart(12, '0');
  
  const randA = Math.floor(Math.random() * 0x10000).toString(16).padStart(4, '0');
  
  const version = 0x7000 | (Math.floor(Math.random() * 0x1000));
  const verHex = version.toString(16).padStart(4, '0');
  
  const variant = 0x8000 | (Math.floor(Math.random() * 0x4000));
  const varHex = variant.toString(16).padStart(4, '0');
  
  const randB = Math.floor(Math.random() * 0xFFFFFFFFFFFF).toString(16).padStart(12, '0');

  return `${timeHex.slice(0, 8)}-${timeHex.slice(8, 12)}${randA.slice(0, 2)}-${verHex.slice(0, 2)}${randA.slice(2, 4)}-${varHex}${randB.slice(0, 2)}-${randB.slice(2)}`;
}
