import { useAuthStore } from './auth.store';

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset the store to initial state before each test
    useAuthStore.setState({
      accessToken: null,
      user: null,
    });
  });

  it('should initialize with default values', () => {
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.user).toBeNull();
  });

  it('should set auth credentials', () => {
    const token = 'mock-token';
    const user = { id: '123', email: 'test@example.com' };

    useAuthStore.getState().setAuth(token, user);

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe(token);
    expect(state.user).toEqual(user);
  });

  it('should clear auth credentials', () => {
    // First set some auth data
    const token = 'mock-token';
    const user = { id: '123', email: 'test@example.com' };
    useAuthStore.getState().setAuth(token, user);

    // Verify data was set
    let state = useAuthStore.getState();
    expect(state.accessToken).toBe(token);
    expect(state.user).toEqual(user);

    // Clear the auth
    useAuthStore.getState().clearAuth();

    // Verify data was cleared
    state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.user).toBeNull();
  });

  it('should update auth credentials', () => {
    // Set initial auth data
    useAuthStore.getState().setAuth('old-token', { id: 'old-id', email: 'old@example.com' });

    // Update with new auth data
    const newToken = 'new-token';
    const newUser = { id: 'new-id', email: 'new@example.com' };
    useAuthStore.getState().setAuth(newToken, newUser);

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe(newToken);
    expect(state.user).toEqual(newUser);
  });
});