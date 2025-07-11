import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';

// Estende os matchers do Jest com os matchers do testing-library
expect.extend(matchers);

// Limpa o DOM após cada teste
afterEach(() => {
  cleanup();
}); 