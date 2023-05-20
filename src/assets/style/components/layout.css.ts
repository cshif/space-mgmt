import { style } from '@vanilla-extract/css';

export const navbar = style({
  minWidth: '160px',
  padding: '.3rem .75rem'
});

export const rbNavbar = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0.75rem 1rem'
});

export const rbContainer = style({
  display: 'flex',
  flexBasis: 'fit-content',
  alignItems: 'center',
  gap: '0.75rem',
  margin: 0,
  padding: '0.5rem 1rem',
  borderRadius: '0.5rem',
  boxShadow: '0 2px 10px rgba(5, 0, 56, 0.08)',
  background: '#fff'
});

export const navbarTitle = style({
  minWidth: 'fit-content',
  marginBottom: 0,
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#333'
});
