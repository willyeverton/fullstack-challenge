import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/test-utils';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render with default message', () => {
    render(<LoadingSpinner />);
    
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
    expect(document.querySelector('.spinner')).toBeInTheDocument();
  });

  it('should render with custom message', () => {
    const customMessage = 'Processando dados...';
    render(<LoadingSpinner message={customMessage} />);
    
    expect(screen.getByText(customMessage)).toBeInTheDocument();
    expect(document.querySelector('.spinner')).toBeInTheDocument();
  });
}); 