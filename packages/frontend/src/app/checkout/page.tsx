"use client";

import { 
  Card, 
  TextField, 
  Button, 
  Typography, 
  Divider, 
  Box, 
  Dialog, 
  DialogContent, 
  DialogActions, 
  Slide,
  CircularProgress
} from "@mui/material";
import { TransitionProps } from '@mui/material/transitions';
import { useRouter } from "next/navigation";
import { useForm } from "../hooks/useForm";
import { useCart } from "../../store/CartContext";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { useState, useEffect, forwardRef } from "react";
import { formatPrice } from "../../utils/formatPrice";

// Transición para que el modal aparezca suavemente desde abajo
const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const initialValues = {
  calle: "",
  altura: "",
  piso: "",
  departamento: "",
  codPostal: "",
  ciudad: "",
  provincia: "",
  pais: "",
};

function validate(values: any) {
  const errors: any = {};

  if (!values.calle) errors.calle = "La calle es obligatoria";
  if (!values.altura) errors.altura = "La altura es obligatoria";
  if (!values.codPostal) errors.codPostal = "El código postal es obligatorio";
  if (!values.ciudad) errors.ciudad = "La ciudad es obligatoria";
  if (!values.provincia) errors.provincia = "La provincia es obligatoria";
  if (!values.pais) errors.pais = "El país es obligatorio";

  return errors;
}

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  // Estado para controlar la redirección y evitar el parpadeo de "carrito vacío"
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Agrupar subtotales por moneda
  const subtotalesPorMoneda = cart.reduce((acc: any, p: any) => {
    const moneda = p.moneda;
    if (!acc[moneda]) {
      acc[moneda] = 0;
    }
    acc[moneda] += p.precio * p.cantidad;
    return acc;
  }, {} as Record<string, number>);

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    showError,
    resetForm,
    setValues,
  } = useForm(
    initialValues,
    async () => {
      try {
        setError("");
        const token = await getToken();

        // Preparar items del pedido
        const items = cart.map((item: any) => ({
          productoId: item._id,
          cantidad: item.cantidad,
        }));

        // Determinar la moneda
        const moneda = cart[0]?.moneda || "PESO_ARG";

        // Preparar dirección de entrega
        const direccionEntrega = {
          calle: values.calle,
          altura: parseInt(values.altura),
          piso: values.piso || undefined,
          departamento: values.departamento || undefined,
          codPostal: values.codPostal,
          ciudad: values.ciudad,
          provincia: values.provincia,
          pais: values.pais,
          lat: 0,
          lon: 0,
        };

        // Crear el pedido
        const payload = {
          items,
          moneda,
          direccionEntrega,
        };

        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/pedidos`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.status === 201 || res.status === 200) {
          // AQUÍ: Abrimos el modal en lugar del alert
          setOpenModal(true);
        }
      } catch (err: any) {
        console.error("Error al crear el pedido:", err);
        setError(
          err.response?.data?.message || "Error al procesar el pedido. Intente nuevamente."
        );
      }
    },
    validate
  );

  const handleCloseModal = () => {
    // 1. Activamos el estado de redirección para mostrar el spinner
    setIsRedirecting(true);
    
    // 2. Cerramos el modal
    setOpenModal(false);
    
    // 3. Limpiamos el carrito (ya no se verá la pantalla de vacío gracias al isRedirecting)
    clearCart();
    resetForm();
    
    // 4. Redirigimos
    router.push("/home");
  };

  // Pre-rellenar el formulario con los datos del usuario
  useEffect(() => {
    if (user?.publicMetadata?.direccion) {
      const direccion = user.publicMetadata.direccion as any;
      setValues((prev: any) => ({
        ...prev,
        calle: direccion.calle || "",
        codPostal: direccion.codigoPostal || "",
        ciudad: direccion.ciudad || "",
      }));
    }
  }, [user]);

  // Si estamos redirigiendo, mostramos el spinner en lugar de "Carrito vacío"
  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center px-4">
        <CircularProgress size={60} thickness={4} />
      </div>
    );
  }

  // Si el carrito está vacío y NO se acaba de completar una compra (modal abierto), mostrar mensaje de vacío
  if (cart.length === 0 && !openModal) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center px-4">
        <Card className="p-8 shadow-lg rounded-2xl text-center">
          <Typography variant="h5" className="mb-4">
            Tu carrito está vacío
          </Typography>
          <Button variant="contained" onClick={() => router.push("/home")}>
            Ir a comprar
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start pt-16 px-4">
      
      {/* GRID GENERAL */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* RESUMEN DEL PEDIDO */}
        <Card className="p-6 shadow-lg rounded-2xl h-fit">
          <Typography variant="h5" className="font-semibold mb-4 text-gray-800">
            Resumen del pedido
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {cart.map((item: any) => (
            <div
              key={item._id}
              className="flex justify-between py-2 border-b text-gray-700"
            >
              <span>
                {item.titulo} × {item.cantidad}
              </span>
              <span className="font-medium">
                {formatPrice(item.precio * item.cantidad, item.moneda)}
              </span>
            </div>
          ))}

          <Divider sx={{ my: 2 }} />

          <div className="mt-4">
            {Object.entries(subtotalesPorMoneda).map(([moneda, total]) => (
              <div key={moneda} className="flex justify-between text-lg font-semibold text-gray-900 mb-2">
                <span>Total:</span>
                <span>{formatPrice(total as number, moneda)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* FORMULARIO */}
        <Card className="p-6 shadow-lg rounded-2xl">
          <Typography variant="h5" className="font-semibold text-gray-800 mb-4">
            Dirección de entrega
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {error && (
            <Box className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </Box>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              name="calle"
              label="Calle"
              fullWidth
              variant="outlined"
              value={values.calle || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!showError("calle")}
              helperText={showError("calle")}
              sx={{ mb: 3 }}
            />

            <div className="grid grid-cols-2 gap-3 mb-3">
              <TextField
                name="altura"
                label="Altura"
                type="number"
                fullWidth
                variant="outlined"
                value={values.altura || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!showError("altura")}
                helperText={showError("altura")}
              />

              <TextField
                name="piso"
                label="Piso (opcional)"
                fullWidth
                variant="outlined"
                value={values.piso || ""}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <TextField
                name="departamento"
                label="Departamento (opcional)"
                fullWidth
                variant="outlined"
                value={values.departamento || ""}
                onChange={handleChange}
                onBlur={handleBlur}
              />

              <TextField
                name="codPostal"
                label="Código Postal"
                fullWidth
                variant="outlined"
                value={values.codPostal || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!showError("codPostal")}
                helperText={showError("codPostal")}
              />
            </div>

            <TextField
              name="ciudad"
              label="Ciudad"
              fullWidth
              variant="outlined"
              value={values.ciudad || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!showError("ciudad")}
              helperText={showError("ciudad")}
              sx={{ mb: 3 }}
            />

            <TextField
              name="provincia"
              label="Provincia"
              fullWidth
              variant="outlined"
              value={values.provincia || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!showError("provincia")}
              helperText={showError("provincia")}
              sx={{ mb: 3 }}
            />

            <TextField
              name="pais"
              label="País"
              fullWidth
              variant="outlined"
              value={values.pais || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!showError("pais")}
              helperText={showError("pais")}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || Object.keys(errors).length > 0}
              fullWidth
              sx={{
                py: 1.5,
                fontSize: "1rem",
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: "bold"
              }}
            >
              {isSubmitting ? "Procesando..." : "Finalizar compra"}
            </Button>
          </form>
        </Card>
      </div>

      {/* --- MODAL DE ÉXITO --- */}
      <Dialog
        open={openModal}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleCloseModal}
        aria-describedby="alert-dialog-slide-description"
        PaperProps={{
          style: { borderRadius: 20, padding: "20px", maxWidth: "400px" }
        }}
      >
        <DialogContent className="flex flex-col items-center text-center">
          {/* Icono SVG de Check Animado o Estático */}
          <Box className="bg-green-100 rounded-full p-4 mb-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={2} 
              stroke="currentColor" 
              className="w-12 h-12 text-green-600"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </Box>
          
          <Typography variant="h5" className="font-bold text-gray-800 mb-2">
            ¡Pedido Exitoso!
          </Typography>
          
          <Typography variant="body1" className="text-gray-600 mb-4">
            Hemos recibido tu orden correctamente. Te enviaremos un correo con los detalles.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button 
            onClick={handleCloseModal}
            variant="contained" 
            color="primary"
            sx={{ px: 4, borderRadius: 10, textTransform: "none" }}
          >
            Volver al inicio
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
}