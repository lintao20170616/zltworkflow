import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useUserStore } from './user';

vi.mock('../service', () => ({
  default: {
    auth: {
      userLogout: vi.fn().mockResolvedValue({}),
      getCurrentUser: vi.fn().mockResolvedValue({ userInfo: null }),
    },
  },
}));

describe('UserStore', () => {
  let store: ReturnType<typeof useUserStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useUserStore();
    vi.clearAllMocks();
  });

  it('should initialize with empty state', () => {
    expect(store.userInfo).toBeNull();
    expect(store.isLoggedIn).toBe(false);
  });

  it('should set user info correctly', () => {
    const mockUser = { id: 1, username: 'admin', email: 'admin@test.com', status: 1 };

    store.setUserInfo(mockUser);

    expect(store.userInfo).toEqual(mockUser);
    expect(store.isLoggedIn).toBe(true);
    expect(store.user).toEqual(mockUser);
  });

  it('should clear user info correctly', () => {
    const mockUser = { id: 1, username: 'admin', email: 'admin@test.com', status: 1 };

    store.setUserInfo(mockUser);
    expect(store.isLoggedIn).toBe(true);

    store.clearUserInfo();
    expect(store.userInfo).toBeNull();
    expect(store.isLoggedIn).toBe(false);
  });

  it('should login and set user info', () => {
    const mockUser = { id: 1, username: 'admin', email: 'admin@test.com', status: 1 };

    store.login(mockUser);

    expect(store.userInfo).toEqual(mockUser);
    expect(store.isLoggedIn).toBe(true);
  });
});
