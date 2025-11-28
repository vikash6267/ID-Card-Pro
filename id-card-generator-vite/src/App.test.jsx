import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from './test/utils';
import App from './App';

describe('App', () => {
  it('should render the app title', () => {
    renderWithProviders(<App />);
    expect(screen.getByText('ID Card Generator')).toBeInTheDocument();
  });

  it('should render the app description', () => {
    renderWithProviders(<App />);
    expect(screen.getByText(/Modern ID card design and batch generation tool/i)).toBeInTheDocument();
  });
});
