import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import authHelper from '../helpers/authHelper.js';
import Logout from '../components/modals/logout.jsx';
import { useModal } from './modals/ModalContext.jsx';

export default function MainMenu() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const { openModal } = useModal();
  const isLoggedIn = authHelper.isLoggedIn();
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    openModal(<Logout />);
    handleClose();
  };
  const navigate = useNavigate();

  // separate function to handle navigation
  const handleNavigation = (route) => {
    navigate(route);
    handleClose(); // close the menu afterward
  };

  return (
    <div>
      <Button
        id="basic-button"
        aria-controls={open ? 'Menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        className="p-4"
      >
        <FontAwesomeIcon
          className="p-2 text-highlight-foreground bg-highlight rounded-lg shadow hover:bg-highlight-hover"
          icon={faBars}
          size="xl"
        />
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            'aria-labelledby': 'basic-button',
          },
          paper: {
            sx: {
              bgcolor: 'var(--color-panel-highlight)',
              color: 'var(--color-highlight-foreground)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--color-highlight)',
              minWidth: 180,
            },
          },
        }}
      >
        <MenuItem
          sx={{
            color: 'var(--color-accent-foreground)',
            '&:hover': {
              bgcolor: 'var(--color-highlight-hover)',
              color: 'var(--color-accent-foreground)',
            },
          }}
          onClick={() => handleNavigation('/')}
        >
          Home
        </MenuItem>

        {!isLoggedIn && (
          <MenuItem
            sx={{
              color: 'var(--color-accent-foreground)',
              '&:hover': {
                bgcolor: 'var(--color-highlight-hover)',
                color: 'var(--color-accent-foreground)',
              },
            }}
            onClick={() => handleNavigation('/login')}
          >
            Login
          </MenuItem>
        )}
        {isLoggedIn && [
          <MenuItem
            sx={{
              color: 'var(--color-accent-foreground)',
              '&:hover': {
                bgcolor: 'var(--color-highlight-hover)',
                color: 'var(--color-accent-foreground)',
              },
            }}
            key="logout"
            onClick={() => handleLogout()}
          >
            Logout
          </MenuItem>,
          <MenuItem
            sx={{
              color: 'var(--color-accent-foreground)',
              '&:hover': {
                bgcolor: 'var(--color-highlight-hover)',
                color: 'var(--color-accent-foreground)',
              },
            }}
            key="todo"
            onClick={() => handleNavigation('/todo')}
          >
            Todo
          </MenuItem>,
          <MenuItem
            sx={{
              color: 'var(--color-accent-foreground)',
              '&:hover': {
                bgcolor: 'var(--color-highlight-hover)',
                color: 'var(--color-accent-foreground)',
              },
            }}
            key="contact"
            onClick={() => handleNavigation('/contact')}
          >
            Contact
          </MenuItem>,
          <MenuItem
            sx={{
              color: 'var(--color-accent-foreground)',
              '&:hover': {
                bgcolor: 'var(--color-highlight-hover)',
                color: 'var(--color-accent-foreground)',
              },
            }}
            key="product"
            onClick={() => handleNavigation('/product')}
          >
            Product
          </MenuItem>,
          <MenuItem
            sx={{
              color: 'var(--color-accent-foreground)',
              '&:hover': {
                bgcolor: 'var(--color-highlight-hover)',
                color: 'var(--color-accent-foreground)',
              },
            }}
            key="invoice"
            onClick={() => handleNavigation('/invoice')}
          >
            Invoice
          </MenuItem>,
          <MenuItem
            sx={{
              color: 'var(--color-accent-foreground)',
              '&:hover': {
                bgcolor: 'var(--color-highlight-hover)',
                color: 'var(--color-accent-foreground)',
              },
            }}
            key="stock"
            onClick={() => handleNavigation('/stock')}
          >
            Stock
          </MenuItem>,
        ]}
      </Menu>
    </div>
  );
}
