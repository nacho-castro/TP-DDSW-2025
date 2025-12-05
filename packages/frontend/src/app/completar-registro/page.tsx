'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Alert,
  CircularProgress
} from '@mui/material';

export default function CompletarRegistroPage() {
  const { getToken, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    calle: '',
    ciudad: '',
    codigoPostal: '',
    tipoUsuario: 'comprador'
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        nombre: user.fullName || '',
        email: user.primaryEmailAddress?.emailAddress || ''
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = await getToken();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuarios/registro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          telefono: formData.telefono,
          direccion: {
            calle: formData.calle,
            ciudad: formData.ciudad,
            codigoPostal: formData.codigoPostal
          },
          tipoUsuario: formData.tipoUsuario
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al completar registro');
      }

      await user?.reload();

      router.push('/home');
    } catch (err: any) {
      setError(err.message || 'Error al completar registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          Completar Registro
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
          Por favor completa tu información para continuar
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Nombre completo"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
            disabled
          />

          <TextField
            fullWidth
            label="Teléfono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Calle"
            name="calle"
            value={formData.calle}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Ciudad"
            name="ciudad"
            value={formData.ciudad}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Código Postal"
            name="codigoPostal"
            value={formData.codigoPostal}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
          />

          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <FormLabel component="legend">Tipo de Usuario</FormLabel>
            <RadioGroup
              name="tipoUsuario"
              value={formData.tipoUsuario}
              onChange={handleChange}
            >
              <FormControlLabel
                value="comprador"
                control={<Radio />}
                label="Comprador - Quiero comprar productos"
              />
              <FormControlLabel
                value="vendedor"
                control={<Radio />}
                label="Vendedor - Quiero vender mis productos"
              />
            </RadioGroup>
          </FormControl>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Completar Registro'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
