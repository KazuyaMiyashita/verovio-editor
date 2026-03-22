import { vi } from "vitest";

const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver as any;

// Mock Worker which is not implemented in jsdom
class MockWorker {
  onmessage: any;
  onerror: any;
  postMessage() {}
  terminate() {}
  addEventListener() {}
  removeEventListener() {}
}
window.Worker = MockWorker as any;

// Mock fetch
window.fetch = vi.fn().mockImplementation(() => 
    Promise.resolve({
        ok: true,
        text: () => Promise.resolve(""),
        json: () => Promise.resolve({}),
    })
);
