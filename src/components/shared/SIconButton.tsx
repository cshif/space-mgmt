import type { MouseEventHandler } from 'react';
import RBButton from 'react-bootstrap/Button';
import type { ButtonVariant } from 'react-bootstrap/types';

interface ComponentProps {
  variant?: ButtonVariant;
  iconName: string;
  iconColor?: string;
  iconSize?: string;
  disabled?: boolean;
  onClick?: MouseEventHandler;
}

function SIconButton(props: ComponentProps) {
  const {
    variant,
    iconName,
    iconColor = '#333',
    iconSize = '1rem',
    disabled = false,
    onClick
  } = props;

  return (
    <RBButton onClick={onClick} variant={variant} disabled={disabled}>
      <i
        className={`bi bi-${iconName}`}
        style={{ color: iconColor, fontSize: iconSize }}
      />
    </RBButton>
  );
}

export default SIconButton;
