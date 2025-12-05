'use client';
import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Badge from '@mui/material/Badge';
import { useCart } from '../../src/store/CartContext';
import { useCartPanel } from '../../src/store/CartPanelContext';
import NotificationPanel from '@/components/NotificationPanel/NotificationPanel';
import CartPanel from '@/components/CartPanel/CartPanel';
import {
  AppBar,
  Toolbar,
  Typography,
  TextField,
  IconButton,
  InputAdornment,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
  Link
} from '@mui/material';
import { FiShoppingCart, FiBell, FiSearch, FiMenu, FiUser } from 'react-icons/fi';
import NextLink from 'next/link';
import UsuarioMenu from '@/components/UsuarioMenu/usuarioMenu';
import { useUser, useAuth } from '@clerk/nextjs';
import { Skeleton } from '@mui/material';
import axios from 'axios';

export interface NavLink {
  name: string;
  link: string;
}

interface MainNavbarProps {
  links?: NavLink[];
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearch?: (text: string) => void;
}

const MainNavbar: React.FC<MainNavbarProps> = ({
  links: linksProp,
  showSearch = true,
  searchPlaceholder = 'Buscar productos, marcas y más...',
  onSearch
}) => {
  const pathname = usePathname();
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width:980px)');
  const isNotifications = pathname === '/notificaciones';
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const { cartAnchorEl, openCartPanel, closeCartPanel, setCartIconRef } = useCartPanel();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [links, setLinks] = useState<NavLink[]>([
    { name: 'MIS PEDIDOS', link: '/mis-pedidos' }
  ]);

  const cartIconMobileRef = useRef<HTMLButtonElement>(null);
  const cartIconDesktopRef = useRef<HTMLButtonElement>(null);

  // Registrar el ícono del carrito apropiado cuando cambia el tamaño de pantalla
  useEffect(() => {
    const activeRef = isMobile ? cartIconMobileRef.current : cartIconDesktopRef.current;
    if (activeRef) {
      setCartIconRef(activeRef);
    }
  }, [isMobile, setCartIconRef]);

  useEffect(() => {
    if (linksProp) {
      setLinks(linksProp);
      return;
    }

    if (isLoaded && user) {
      const tipoUsuario = user.publicMetadata?.tipoUsuario as string;
      const isVendedor = tipoUsuario === 'vendedor';

      const baseLinks: NavLink[] = [
        { name: 'MIS PEDIDOS', link: '/mis-pedidos' }
      ];

      if (isVendedor) {
        baseLinks.push({ name: 'PANEL DE VENDEDOR', link: '/seller' });
      }

      setLinks(baseLinks);
    }
  }, [linksProp, user, isLoaded]);

  // Polling de notificaciones no leídas
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const token = await getToken();
        if (!token) {
          console.log('[Navbar] No hay token disponible');
          return;
        }

        console.log('[Navbar] Fetching unread count...');
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/usuarios/notificaciones/no-leidas`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { page: 1, limit: 1 },
          }
        );

        console.log('[Navbar] Response data:', response.data);
        const total = response.data.totalColecciones || response.data.total || 0;
        console.log('[Navbar] Setting unread count to:', total);
        setUnreadCount(total);
      } catch (error) {
        console.error('[Navbar] Error al obtener conteo de notificaciones:', error);
        if (axios.isAxiosError(error)) {
          console.error('[Navbar] Error details:', {
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url
          });
        }
      }
    };

    // Fetch inicial
    if (isLoaded && user) {
      console.log('[Navbar] User is loaded, starting notification polling');
      fetchUnreadCount();

      // Polling cada 30 segundos
      const interval = setInterval(() => {
        console.log('[Navbar] Polling notificaciones...');
        fetchUnreadCount();
      }, 30000);

      return () => {
        console.log('[Navbar] Cleaning up notification polling');
        clearInterval(interval);
      };
    } else {
      console.log('[Navbar] User not loaded yet:', { isLoaded, hasUser: !!user });
    }
  }, [isLoaded, user, getToken]);

  const handleNotifClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotifClose = () => {
    setAnchorEl(null);
  };

  const handleCartClick = (event: React.MouseEvent<HTMLElement>) => {
    openCartPanel(event.currentTarget);
  };

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const { totalItems } = useCart();

  // Debug: ver el valor de unreadCount
  useEffect(() => {
    console.log('[Navbar] unreadCount changed to:', unreadCount);
  }, [unreadCount]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    if (onSearch) onSearch(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchText.trim();
    if (query) {
      router.push(`/products?search=${encodeURIComponent(query)}`);
    } else {
      router.push('/products');
    }
  };

  const getLinkStyles = (path: string) => ({
    color: pathname === path ? theme.palette.primary.main : 'inherit',
    backgroundColor: pathname === path ? theme.palette.background.paper : 'transparent',
    textDecoration: 'none',
    padding: '6px 12px',
    fontSize: '14px',
    fontWeight: 400,
    borderRadius: 1,
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor:
        pathname === path ? theme.palette.background.paper : 'rgba(252, 163, 17, 0.15)',
    },
  });

  const SearchField = (
    <Box
      component="form"
      onSubmit={handleSearchSubmit}
      sx={{ width: isMobile ? '100%' : '380px' }}
    >
      <TextField
        fullWidth
        size="small"
        placeholder={searchPlaceholder}
        variant="outlined"
        value={searchText}
        onChange={handleSearchChange}
        aria-label="Buscar productos, marcas y más"
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: 1,
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: 'transparent' },
            '&:hover fieldset': { borderColor: 'transparent' },
            '&.Mui-focused fieldset': { borderColor: 'transparent' },
          },
          '& .MuiInputBase-input': {
            padding: '8px 12px',
            fontSize: '14px',
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconButton type="submit" aria-label="Buscar">
                <FiSearch size={18} style={{ color: '#666' }} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );

  return (
    <>
      <AppBar position="static" role="navigation" color="inherit" elevation={1}>
        <Toolbar sx={{ px: { xs: 2, md: 3 }, py: 1 }}>
          {isMobile ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                maxWidth: '1400px',
                mx: 'auto',
                gap: 1,
              }}
            >
              {/* Header superior móvil */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <IconButton
                  aria-label="Abrir menú de navegación"
                  title="Menú"
                  onClick={toggleDrawer(true)}
                >
                  <FiMenu size={22} />
                </IconButton>

                <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Link href="/home" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Typography
                      variant="h5"
                      component="div"
                      sx={{ fontWeight: 'bold', fontSize: '20px' }}
                    >
                      Tienda Sol
                    </Typography>
                  </Link>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton aria-label="Ver notificaciones" title="Notificaciones" onClick={handleNotifClick}>
                    <Badge badgeContent={unreadCount} color="error" overlap="circular" invisible={unreadCount === 0}>
                      <FiBell size={20} />
                    </Badge>
                  </IconButton>

                  <NotificationPanel
                    anchorEl={anchorEl}
                    onClose={handleNotifClose}
                    onUnreadCountChange={setUnreadCount}
                  />

                  <IconButton
                    ref={cartIconMobileRef}
                    aria-label="Ver carrito"
                    title="Carrito"
                    onClick={handleCartClick}
                  >
                    <Badge
                      badgeContent={totalItems}
                      color="error"
                      overlap="circular"
                      invisible={totalItems === 0}
                    >
                      <FiShoppingCart size={20} />
                    </Badge>
                  </IconButton>

                  {isLoaded ? (
                    <UsuarioMenu />
                  ) : (
                    <Skeleton variant="circular" width={32} height={32} />
                  )}
                </Box>
              </Box>

              {/* Barra de búsqueda móvil */}
              {showSearch && SearchField}
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                maxWidth: '1400px',
                mx: 'auto',
              }}
            >
              <Link href="/home" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography
                  variant="h5"
                  component="div"
                  sx={{ fontWeight: 'bold', marginRight: '24px' }}
                >
                  Tienda Sol
                </Typography>
              </Link>

              {showSearch && SearchField}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto' }}>
                {links.map((navLink) => (
                  <Box
                    key={navLink.link}
                    component="a"
                    href={navLink.link}
                    role="link"
                    aria-label={`Ir a ${navLink.name}`}
                    sx={getLinkStyles(navLink.link)}
                  >
                    {navLink.name}
                  </Box>
                ))}

                  <IconButton aria-label="Ver notificaciones" title="Notificaciones" onClick={handleNotifClick}>
                    <Badge badgeContent={unreadCount} color="error" overlap="circular" invisible={unreadCount === 0}>
                      <FiBell size={20} />
                    </Badge>
                  </IconButton>

                  <NotificationPanel
                    anchorEl={anchorEl}
                    onClose={handleNotifClose}
                    onUnreadCountChange={setUnreadCount}
                  />
                  <IconButton
                    ref={cartIconDesktopRef}
                    aria-label="Ver carrito"
                    title="Carrito"
                    onClick={handleCartClick}
                  >
                    <Badge
                      badgeContent={totalItems}
                      color="error"
                      overlap="circular"
                      invisible={totalItems === 0}
                    >
                      <FiShoppingCart size={20} />
                    </Badge>
                  </IconButton>

                {isLoaded ? (
                  <UsuarioMenu />
                ) : (
                  <Skeleton variant="circular" width={32} height={32} />
                )}
              </Box>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer lateral móvil */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        aria-label="Menú de navegación móvil"
      >
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
          <List>
            {links.map((navLink) => (
              <ListItem key={navLink.link} disablePadding>
                <ListItemButton component={NextLink} href={navLink.link}>
                  <ListItemText primary={navLink.name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* CartPanel global - renderizado una sola vez */}
      <CartPanel
        anchorEl={cartAnchorEl}
        onClose={closeCartPanel}
      />
    </>
  );
};

export default MainNavbar;
