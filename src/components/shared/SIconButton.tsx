import type { ReactElement, MouseEventHandler, CSSProperties } from 'react';
import { IconContext } from 'react-icons';
import RBButton from 'react-bootstrap/Button';
import type { ButtonVariant } from 'react-bootstrap/types';

interface ComponentProps {
  variant?: ButtonVariant;
  iconName: ReactElement;
  iconColor?: string;
  iconSize?: string;
  style?: CSSProperties;
  disabled?: boolean;
  onClick?: MouseEventHandler;
  onMouseEnter?: MouseEventHandler;
  onMouseLeave?: MouseEventHandler;
}

function SIconButton(props: ComponentProps) {
  const {
    variant,
    iconName,
    iconColor = '#333',
    iconSize = '1rem',
    style = {},
    disabled = false,
    onClick,
    onMouseEnter,
    onMouseLeave
  } = props;

  return (
    <RBButton
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      variant={variant}
      disabled={disabled}
      style={{
        padding: '.25rem',
        display: 'flex',
        alignItems: 'center',
        ...style
      }}
    >
      <IconContext.Provider value={{ color: iconColor, size: iconSize }}>
        {iconName}
      </IconContext.Provider>
    </RBButton>
  );
}

export default SIconButton;
