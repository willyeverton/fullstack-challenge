import type { ReactNode } from 'react';

interface ErrorMessageProps {
  message: string;
  children?: ReactNode;
}

const ErrorMessage = ({ message, children }: ErrorMessageProps) => {
  return (
    <div className="error-container">
      <p className="error-message">{message}</p>
      {children}
    </div>
  );
};

export default ErrorMessage; 