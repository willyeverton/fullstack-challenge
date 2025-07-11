import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/test-utils';
import SuccessMessage from '../SuccessMessage';

describe('SuccessMessage', () => {
  it('should render the success message', () => {
    const message = 'Operation completed successfully';
    render(<SuccessMessage message={message} />);
    
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('should render children when provided', () => {
    const message = 'Success';
    const childText = 'Continue';
    
    render(
      <SuccessMessage message={message}>
        <button>{childText}</button>
      </SuccessMessage>
    );
    
    expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.getByText(childText)).toBeInTheDocument();
  });
}); 