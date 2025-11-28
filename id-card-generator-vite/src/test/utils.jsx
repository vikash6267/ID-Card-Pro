import React from 'react';
import { render } from '@testing-library/react';

/**
 * Custom render function that wraps components with necessary providers
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Render options
 * @returns {Object} Render result with utilities
 */
export function renderWithProviders(ui, options = {}) {
  const { wrapper, ...renderOptions } = options;

  function Wrapper({ children }) {
    // Add providers here as needed (e.g., Zustand stores, theme providers)
    return wrapper ? wrapper({ children }) : children;
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

/**
 * Create a mock element for testing
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock element
 */
export function createMockElement(overrides = {}) {
  return {
    id: 'test-element-1',
    type: 'text',
    position: { x: 0, y: 0 },
    size: { width: 100, height: 50 },
    rotation: 0,
    visible: true,
    locked: false,
    name: 'Test Element',
    style: {
      opacity: 1,
      zIndex: 0,
      strokeWidth: 0,
      strokeColor: '#000000',
      shadowBlur: 0,
      shadowColor: '#000000',
      shadowOffsetX: 0,
      shadowOffsetY: 0,
    },
    ...overrides,
  };
}

/**
 * Create mock CSV data for testing
 * @param {number} rows - Number of rows to generate
 * @returns {Object} Mock CSV data
 */
export function createMockCSVData(rows = 3) {
  const headers = ['name', 'id', 'department'];
  const data = Array.from({ length: rows }, (_, i) => ({
    name: `Person ${i + 1}`,
    id: `ID${String(i + 1).padStart(3, '0')}`,
    department: `Dept ${(i % 3) + 1}`,
  }));

  return {
    headers,
    rows: data,
  };
}

/**
 * Create a mock project for testing
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock project
 */
export function createMockProject(overrides = {}) {
  return {
    id: 'test-project-1',
    name: 'Test Project',
    template: {
      id: 'template-1',
      front: {
        elements: [],
        background: '',
        backgroundMode: 'static',
      },
      back: {
        elements: [],
        background: '',
        backgroundMode: 'static',
      },
      size: { width: 85.6, height: 53.98 }, // CR80 standard
      orientation: 'horizontal',
    },
    csvData: {
      headers: [],
      rows: [],
    },
    photos: {},
    maskSrc: null,
    applyMask: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Wait for a condition to be true
 * @param {Function} condition - Function that returns boolean
 * @param {number} timeout - Maximum time to wait in ms
 * @returns {Promise<void>}
 */
export async function waitForCondition(condition, timeout = 1000) {
  const startTime = Date.now();
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
