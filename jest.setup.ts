import '@testing-library/jest-dom';

// Stub out Dexie since IndexedDB doesn't exist in jsdom
jest.mock('@/lib/db', () => ({
  db: {
    events: {
      toArray: jest.fn().mockResolvedValue([]),
      put: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
      clear: jest.fn().mockResolvedValue(undefined),
      bulkAdd: jest.fn().mockResolvedValue(undefined),
      filter: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([]) }),
    },
    // Dexie transactions: just execute the callback directly in tests
    transaction: jest.fn().mockImplementation((_mode, _tables, callback) => callback()),
  },
}));

// Stub Web Notifications API
global.Notification = {
  permission: 'granted',
  requestPermission: jest.fn().mockResolvedValue('granted'),
} as any;

// Stub crypto.randomUUID
global.crypto.randomUUID = () => 'test-uuid-12-34-56';
