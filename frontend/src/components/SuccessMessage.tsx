import type { ReactNode } from 'react';

interface SuccessMessageProps {
  message: string;
  children?: ReactNode;
}

const SuccessMessage = ({ message, children }: SuccessMessageProps) => {
  return (
    <div className="success-container">
      <p className="success-message">{message}</p>
      {children}
    </div>
  );
};

export default SuccessMessage; 