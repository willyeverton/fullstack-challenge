import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/test-utils';
import ErrorMessage from '../ErrorMessage';

describe('ErrorMessage', () => {
  it('should render the error message', () => {
    const message = 'This is an error message';
    render(<ErrorMessage message={message} />);
    
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('should render children when provided', () => {
    const message = 'Error occurred';
    const childText = 'Try again';
    
    render(
      <ErrorMessage message={message}>
        <button>{childText}</button>
      </ErrorMessage>
    );
    
    expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.getByText(childText)).toBeInTheDocument();
  });
}); 