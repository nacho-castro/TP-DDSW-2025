'use client';
import React from 'react';
import MainNavbar from './MainNavbar';
import { NavLink } from './MainNavbar';
import { Link, Box } from '@mui/material';

interface NavbarProps {
  links?: NavLink[];
  showSearch?: boolean;
  searchPlaceholder?: string;
  minimal?: boolean;
  onSearch?: (value: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  links,
  showSearch,
  searchPlaceholder,
  minimal = false,
  onSearch,
}) => {
  const NAVBAR_HEIGHT = 64;

  if (minimal) {
    return (
      <>
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            zIndex: 1200,
            backgroundColor: 'var(--oxford-blue)',
            px: { xs: 2, md: 3 },
            py: { xs: 1, md: 2 },
          }}
        >
          <Link
            href="/home"
            sx={{
              color: 'white',
              fontSize: { xs: '18px', md: '22px' },
              fontWeight: 'bold',
              textDecoration: 'none',
            }}
          >
            Tienda Sol
          </Link>
        </Box>
        <Box sx={{ height: `${NAVBAR_HEIGHT}px` }} />
      </>
    );
  }

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 1200,
        }}
      >
        <MainNavbar
          links={links}
          showSearch={showSearch}
          searchPlaceholder={searchPlaceholder}
          onSearch={onSearch}
        />
      </Box>
      <Box sx={{ height: `${NAVBAR_HEIGHT}px` }} />
    </>
  );
};

export default Navbar;