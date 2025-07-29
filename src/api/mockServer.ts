import type { FeatureFlag, ApiResponse } from '@/types';

// Mock feature flags data
const mockFlags: FeatureFlag[] = [
  {
    id: 'new-ui-design',
    name: 'New UI Design',
    description: 'Enable the new user interface design with improved UX',
    enabled: true,
    rules: [
      {
        id: 'rule-1',
        condition: 'user.segments.includes("beta")',
        value: true,
        userSegments: ['beta'],
        percentage: 50,
      },
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    version: 3,
  },
  {
    id: 'advanced-analytics',
    name: 'Advanced Analytics',
    description: 'Show advanced analytics dashboard for premium users',
    enabled: true,
    rules: [
      {
        id: 'rule-2',
        condition: 'user.segments.includes("premium")',
        value: true,
        userSegments: ['premium'],
      },
    ],
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
    version: 2,
  },
  {
    id: 'dark-mode',
    name: 'Dark Mode',
    description: 'Toggle dark mode theme across the application',
    enabled: false,
    rules: [],
    createdAt: '2024-01-05T08:00:00Z',
    updatedAt: '2024-01-05T08:00:00Z',
    version: 1,
  },
  {
    id: 'mobile-app-banner',
    name: 'Mobile App Banner',
    description: 'Show mobile app download banner on mobile devices',
    enabled: true,
    rules: [
      {
        id: 'rule-3',
        condition: 'device.isMobile',
        value: true,
        percentage: 75,
      },
    ],
    createdAt: '2024-01-12T11:00:00Z',
    updatedAt: '2024-01-19T13:20:00Z',
    version: 4,
  },
  {
    id: 'experimental-feature',
    name: 'Experimental Feature',
    description: 'Access to experimental features for testing',
    enabled: false,
    rules: [
      {
        id: 'rule-4',
        condition: 'user.segments.includes("internal")',
        value: true,
        userSegments: ['internal'],
      },
    ],
    createdAt: '2024-01-22T15:00:00Z',
    updatedAt: '2024-01-22T15:00:00Z',
    version: 1,
  },
];

// Simulate network delay
const simulateDelay = (min = 50, max = 200): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Mock API implementation
export class MockApiServer {
  private flags: Map<string, FeatureFlag>;

  constructor() {
    this.flags = new Map(mockFlags.map(flag => [flag.id, flag]));
  }

  async getAllFlags(): Promise<ApiResponse<FeatureFlag[]>> {
    await simulateDelay();
    
    return {
      data: Array.from(this.flags.values()),
      success: true,
      timestamp: Date.now(),
    };
  }

  async getFlag(flagId: string): Promise<ApiResponse<FeatureFlag>> {
    await simulateDelay();
    
    const flag = this.flags.get(flagId);
    if (!flag) {
      return {
        data: null as any,
        success: false,
        error: `Flag with ID '${flagId}' not found`,
        timestamp: Date.now(),
      };
    }

    return {
      data: flag,
      success: true,
      timestamp: Date.now(),
    };
  }

  async getBatchFlags(flagIds: string[]): Promise<ApiResponse<FeatureFlag[]>> {
    await simulateDelay();
    
    const flags = flagIds
      .map(id => this.flags.get(id))
      .filter((flag): flag is FeatureFlag => flag !== undefined);

    return {
      data: flags,
      success: true,
      timestamp: Date.now(),
    };
  }

  async updateFlag(flagId: string, updates: Partial<FeatureFlag>): Promise<ApiResponse<FeatureFlag>> {
    await simulateDelay();
    
    const flag = this.flags.get(flagId);
    if (!flag) {
      return {
        data: null as any,
        success: false,
        error: `Flag with ID '${flagId}' not found`,
        timestamp: Date.now(),
      };
    }

    const updatedFlag: FeatureFlag = {
      ...flag,
      ...updates,
      updatedAt: new Date().toISOString(),
      version: flag.version + 1,
    };

    this.flags.set(flagId, updatedFlag);

    return {
      data: updatedFlag,
      success: true,
      timestamp: Date.now(),
    };
  }
}

// Global mock server instance
export const mockApiServer = new MockApiServer();

// Mock fetch implementation for development
export const setupMockApi = () => {
  if (typeof window === 'undefined' || import.meta.env.PROD) {
    return; // Don't mock in production or SSR
  }

  const originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input.toString();
    
    // Intercept API calls
    if (url.includes('/api/flags')) {
      try {
        let result: ApiResponse<any>;

        if (url.endsWith('/api/flags')) {
          result = await mockApiServer.getAllFlags();
        } else if (url.includes('/api/flags/batch')) {
          // Extract flag IDs from request body
          const body = init?.body ? JSON.parse(init.body as string) : {};
          result = await mockApiServer.getBatchFlags(body.flagIds || []);
        } else {
          // Single flag request
          const flagId = url.split('/api/flags/')[1];
          result = await mockApiServer.getFlag(flagId);
        }

        return new Response(JSON.stringify(result), {
          status: result.success ? 200 : 404,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({
          data: null,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now(),
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Fall back to original fetch for other requests
    return originalFetch(input, init);
  };

  console.log('🔧 Mock API server initialized for development');
};