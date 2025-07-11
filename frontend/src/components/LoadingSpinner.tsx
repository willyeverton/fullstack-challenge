interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner = ({ message = 'Carregando...' }: LoadingSpinnerProps) => {
  return (
    <div className="loading">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
};

export default LoadingSpinner; 