import { login, signup, refresh } from './user'; // Adjust import paths as needed

describe('User API', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should sign up a user and return response', async () => {
    const mockUser = {
      email: 'test@example.com',
      password: 'password123',
      first_name: 'Test',
      last_name: 'User'
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ email: "fake@fake.com", role: "Guest", authenticated: true, exp: "timestamp"}),
    });

    const result = await signup(mockUser.email, mockUser.password, mockUser.first_name, mockUser.last_name);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/signup'),
      expect.objectContaining({
        method: 'POST',
        body: "email=test%40example.com&password=password123&first_name=Test&last_name=User",
      })
    );
    expect(result).toEqual({ email: "fake@fake.com", role: "Guest", authenticated: true, exp: "timestamp"});
  });

  it('should log in a user and return response', async () => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ email: "fake@fake.com", role: "Guest", authenticated: true, exp: "timestamp"}),
    });

    const result = await login(credentials.email, credentials.password);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/login'),
      expect.objectContaining({
        method: 'POST',
        body: "email=test%40example.com&password=password123",
      })
    );
    expect(result).toEqual({ email: "fake@fake.com", role: "Guest", authenticated: true, exp: "timestamp"});
  });

  it('should refresh the user token and return response', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ email: "fake@fake.com", role: "Guest", authenticated: true, exp: "newtimestamp"}),
    });

    const result = await refresh();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/refresh'),
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      })
    );
    expect(result).toEqual({ email: "fake@fake.com", role: "Guest", authenticated: true, exp: "newtimestamp"});
  });
});