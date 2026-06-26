import { describe, it, expect } from 'vitest';
import http from './http';

describe('HTTP Utils', () => {
  it('should export http object with api property', () => {
    expect(http).toBeDefined();
    expect(http.api).toBeDefined();
    expect(typeof http.api.get).toBe('function');
    expect(typeof http.api.post).toBe('function');
    expect(typeof http.api.put).toBe('function');
    expect(typeof http.api.delete).toBe('function');
  });
});
