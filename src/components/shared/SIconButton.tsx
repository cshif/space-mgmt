import type { ReactElement, MouseEventHandler } from 'react';
import { IconContext } from 'react-icons';
import RBButton from 'react-bootstrap/Button';
import type { ButtonVariant } from 'react-bootstrap/types';

interface ComponentProps {
  variant?: ButtonVariant;
  iconName: ReactElement;
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
    <RBButton
      onClick={onClick}
      variant={variant}
      disabled={disabled}
      style={{
        padding: '.25rem',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <IconContext.Provider value={{ color: iconColor, size: iconSize }}>
        {iconName}
      </IconContext.Provider>
    </RBButton>
  );
}

export default SIconButton;
