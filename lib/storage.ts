interface StorageItem<T> {
  value: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export function setWithTTL<T>(key: string, value: T, ttl: number): void {
  if (typeof window === 'undefined') return;
  
  const item: StorageItem<T> = {
    value,
    timestamp: Date.now(),
    ttl
  };
  
  localStorage.setItem(key, JSON.stringify(item));
}

export function getWithTTL<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    
    const item: StorageItem<T> = JSON.parse(itemStr);
    const now = Date.now();
    
    // Check if item has expired
    if (now - item.timestamp > item.ttl) {
      localStorage.removeItem(key);
      return null;
    }
    
    return item.value;
  } catch {
    return null;
  }
}

export function removeStorageItem(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}
