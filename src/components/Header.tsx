/**
 * Floating settings button
 */

import { Button } from './shared/Button';

interface HeaderProps {
  onSettingsClick: () => void;
}

export function Header({ onSettingsClick }: HeaderProps) {
  return (
    <Button
      className="settings-button"
      onClick={onSettingsClick}
      title="Settings"
      ariaLabel="Open settings"
    >
      ⚙️
    </Button>
  );
}
