import { AlertType } from '../types';

interface AlertContainerProps {
  message: string | null;
  type: AlertType;
  onClose: () => void;
}

export function AlertContainer({ message, type, onClose }: AlertContainerProps) {
  if (!message) {
    return <div id="alert-container" className="alert-container hidden"></div>;
  }

  return (
    <div className={`alert-container alert-${type}`}>
      <div className="alert-content">
        <span>{message}</span>
        <button className="alert-close" onClick={onClose} aria-label="Close alert">
          ×
        </button>
      </div>
    </div>
  );
}
