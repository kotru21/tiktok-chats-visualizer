/**
 * Утилиты для оптимизации производительности
 */

/**
 * Создаёт debounced версию функции
 * @param fn - функция для обёртки
 * @param delay - задержка в миллисекундах
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Создаёт throttled версию функции
 * @param fn - функция для обёртки
 * @param limit - минимальный интервал между вызовами в миллисекундах
 */
export function throttle<T extends (...args: Parameters<T>) => void>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>): void => {
    const now = Date.now();

    if (now - lastCall >= limit) {
      lastCall = now;
      fn(...args);
    } else {
      timeoutId ??=
        // Планирование вызова в конец интервала
        timeoutId = setTimeout(
          () => {
            lastCall = Date.now();
            fn(...args);
            timeoutId = null;
          },
          limit - (now - lastCall)
        );
    }
  };
}

/**
 * Простой LRU (Least Recently Used) кеш
 */
export class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private readonly maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Перемещение в конец (самый свежий)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Удаление самого старого элемента (первый в Map)
      const firstKey = this.cache.keys().next().value as K;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

/**
 * Мемоизированная функция с LRU кешем
 * @param fn - чистая функция для мемоизации
 * @param maxSize - максимальный размер кеша
 * @param keyFn - функция генерации ключа кеша (по умолчанию JSON.stringify)
 */
export function memoize<Args extends unknown[], R>(
  fn: (...args: Args) => R,
  maxSize = 100,
  keyFn: (...args: Args) => string = (...args) => JSON.stringify(args)
): ((...args: Args) => R) & { cache: LRUCache<string, R>; clear: () => void } {
  const cache = new LRUCache<string, R>(maxSize);

  const memoized = (...args: Args): R => {
    const key = keyFn(...args);
    const cached = cache.get(key);
    if (cached !== undefined) {
      return cached;
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };

  memoized.cache = cache;
  memoized.clear = (): void => cache.clear();

  return memoized;
}

/**
 * Асинхронная мемоизированная функция
 */
export function memoizeAsync<Args extends unknown[], R>(
  fn: (...args: Args) => Promise<R>,
  maxSize = 50,
  keyFn: (...args: Args) => string = (...args) => JSON.stringify(args)
): ((...args: Args) => Promise<R>) & { cache: LRUCache<string, R>; clear: () => void } {
  const cache = new LRUCache<string, R>(maxSize);
  const pending = new Map<string, Promise<R>>();

  const memoized = async (...args: Args): Promise<R> => {
    const key = keyFn(...args);

    // Проверка кеша
    const cached = cache.get(key);
    if (cached !== undefined) {
      return cached;
    }

    // Проверка pending запросов (дедупликация)
    const pendingRequest = pending.get(key);
    if (pendingRequest) {
      return pendingRequest;
    }

    // Создание нового запроса
    const request = fn(...args)
      .then((result) => {
        cache.set(key, result);
        pending.delete(key);
        return result;
      })
      .catch((error: unknown) => {
        pending.delete(key);
        throw error;
      });

    pending.set(key, request);
    return request;
  };

  memoized.cache = cache;
  memoized.clear = (): void => {
    cache.clear();
    pending.clear();
  };

  return memoized;
}

/**
 * Группирует множественные вызовы в один микротаск
 */
export function batch<T>(fn: (items: T[]) => void): (item: T) => void {
  let queue: T[] = [];
  let scheduled = false;

  return (item: T): void => {
    queue.push(item);

    if (!scheduled) {
      scheduled = true;
      queueMicrotask(() => {
        const items = queue;
        queue = [];
        scheduled = false;
        fn(items);
      });
    }
  };
}
