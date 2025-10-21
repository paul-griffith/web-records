/**
 * Application header with settings button
 */

import { Button } from './shared/Button';

interface HeaderProps {
  onSettingsClick: () => void;
}

export function Header({ onSettingsClick }: HeaderProps) {
  return (
    <header className="header">
      <h1>Veterinary SOAP Note Generator</h1>
      <Button
        className="btn-icon"
        onClick={onSettingsClick}
        title="Settings"
        ariaLabel="Open settings"
      >
        ⚙️
      </Button>
    </header>
  );
}
