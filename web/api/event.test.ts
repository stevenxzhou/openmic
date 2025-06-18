import { postEventData } from './event';

describe('postEventData', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should POST event data and return response', async () => {
    
    const mockEvent = {
      event_id: 0,
      title: 'Test Event',
      description: 'desc',
      start_date:"2025-06-05T19:00:00",
      end_date: "2025-06-05T21:00:00",
      location: 'Test Location'
    };

    // Mock fetch response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const result = await postEventData(mockEvent);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/events'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(mockEvent),
      })
    );
    expect(result).toEqual({ success: true });
  });

  it('should throw if response is not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    await expect(postEventData({} as any)).rejects.toThrow('Network response was not ok');
  });
});