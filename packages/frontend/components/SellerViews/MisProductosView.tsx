"use client";
import React, { useState, useEffect } from "react";
import ProductCard, { Product } from "@/components/ProductCard/ProductCard";
import Pagination from "@/components/Pagination/Pagination";
import {
  Box,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from "axios";
import { useAuth } from "@clerk/nextjs";

const Moneda = Object.freeze({
  PESO_ARG: "PESO_ARG",
  DOLAR_USA: "DOLAR_USA",
  REAL: "REAL",
});

interface Categoria {
  _id: string;
  nombre: string;
}

export default function MisProductosView() {
  const { getToken } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [alerta, setAlerta] = useState({ open: false, tipo: "success", mensaje: "" });
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [nuevoProducto, setNuevoProducto] = useState({
    titulo: "",
    descripcion: "",
    precio: 0,
    moneda: "PESO_ARG",
    stock: 0,
    categorias: [] as string[],
    fotos: [] as string[],
    activo: true,
  });

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/categorias`);
        if (res.ok) {
          const data = await res.json();
          setCategorias(data);
        }
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    };

    fetchCategorias();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = await getToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/usuarios/productos?page=${currentPage}&limit=${pageSize}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (res.status === 204) {
          setProducts([]);
          setTotalPages(1);
          return;
        }

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = await res.json();

        const productsArray =
          Array.isArray(payload)
            ? payload
            : Array.isArray(payload.data)
              ? payload.data
              : Array.isArray(payload.productos)
                ? payload.productos
                : [];

        setProducts(productsArray);
        setTotalPages(payload.totalPaginas || 1);
      } catch (err) {
        console.error("Error al obtener productos:", err);
        setProducts([]);
        setTotalPages(1);
      }
    };

    fetchProducts();
  }, [currentPage, getToken]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEdit = (productId: string) => {
    const productToEdit = products.find((p) => p._id === productId);
    if (productToEdit) {
      setEditingProduct(productToEdit);
    }
  };

  const handleDeleteRequest = (productId: string) => {
    setProductToDelete(productId);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      const token = await getToken();
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/productos/${productToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 200 || res.status === 204) {
        setProducts((prev) => prev.filter((p) => p._id !== productToDelete));
        setAlerta({
          open: true,
          tipo: "success",
          mensaje: "Producto eliminado con éxito.",
        });
      }
    } catch (error: any) {
      console.error("Error al eliminar producto:", error);
      setAlerta({
        open: true,
        tipo: "error",
        mensaje: error.response?.data?.message || "Error al eliminar el producto",
      });
    } finally {
      setIsDeleting(false);
      setOpenDeleteDialog(false);
      setProductToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
    setProductToDelete(null);
  };

  const handleSaveChanges = async () => {
    if (!editingProduct) return;

    try {
      const token = await getToken();
      const payload = {
        titulo: editingProduct.titulo,
        descripcion: editingProduct.descripcion,
        precio: Number(editingProduct.precio),
        stock: Number(editingProduct.stock),
      };

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/productos/${editingProduct._id}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 200 || res.status === 204) {
        setProducts((prev) =>
          prev.map((p) => (p._id === editingProduct._id ? editingProduct : p))
        );
        setEditingProduct(null);
        setAlerta({
          open: true,
          tipo: "success",
          mensaje: "Producto actualizado con éxito.",
        });
      }
    } catch (error: any) {
      console.error("Error al actualizar producto:", error);
      setAlerta({
        open: true,
        tipo: "error",
        mensaje: error.response?.data?.message || "Error al actualizar el producto",
      });
    }
  };

  const isFormularioValido = () => {
    return (
      nuevoProducto.titulo.trim() !== "" &&
      nuevoProducto.descripcion.trim() !== "" &&
      nuevoProducto.precio > 0 &&
      nuevoProducto.stock >= 0 &&
      nuevoProducto.categorias.length > 0
    );
  };

  const handleGuardarProducto = async () => {
    try {
      const token = await getToken();
      const payload = {
        titulo: nuevoProducto.titulo,
        descripcion: nuevoProducto.descripcion,
        precio: Number(nuevoProducto.precio),
        moneda: nuevoProducto.moneda,
        stock: Number(nuevoProducto.stock),
        categorias: nuevoProducto.categorias,
        fotos: nuevoProducto.fotos,
        activo: nuevoProducto.activo,
      };

      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/productos`, payload, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      if (res.status === 201 || res.status === 200) {
        const creado = res.data && (res.data._id ? res.data : (res.data.producto || res.data.data || null));
        if (creado && creado._id) {
          setProducts((prev) => [creado, ...prev]);
        } else {
          const token = await getToken();
          const refetch = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/usuarios/productos?page=1&limit=${pageSize}`,
            {
              headers: { 'Authorization': `Bearer ${token}` }
            }
          );
          const data = await refetch.json();
          const lista = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
          setProducts(lista);
          setCurrentPage(1);
        }

        setOpenDialog(false);
        setNuevoProducto({
          titulo: "",
          descripcion: "",
          precio: 0,
          moneda: "PESO_ARG",
          stock: 0,
          categorias: [],
          fotos: [],
          activo: true,
        });
        setAlerta({
          open: true,
          tipo: "success",
          mensaje: "Producto creado con éxito.",
        });
      }
    } catch (error: any) {
      console.error("Error en POST /productos:", error);
      setAlerta({
        open: true,
        tipo: "error",
        mensaje: "Error al crear el producto",
      });
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        Catálogo de Productos
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenDialog(true)}
        sx={{ mb: 3 }}
      >
        Agregar producto
      </Button>

      <Box
        role="region"
        aria-label="Listado de productos"
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: 'white'
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '60px 80px 2fr 3fr 120px 100px 100px 120px',
            gap: 2,
            p: 2,
            bgcolor: 'grey.200',
            fontWeight: 'bold',
            borderBottom: '2px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="body2" fontWeight="bold">#</Typography>
          <Typography variant="body2" fontWeight="bold">Imagen</Typography>
          <Typography variant="body2" fontWeight="bold">Nombre</Typography>
          <Typography variant="body2" fontWeight="bold">Descripción</Typography>
          <Typography variant="body2" fontWeight="bold">Precio</Typography>
          <Typography variant="body2" fontWeight="bold">Stock</Typography>
          <Typography variant="body2" fontWeight="bold">Vendidos</Typography>
          <Typography variant="body2" fontWeight="bold" textAlign="center">Acciones</Typography>
        </Box>
        {products.map((prod, index) => (
          <Box
            key={prod._id}
            sx={{
              display: 'grid',
              gridTemplateColumns: '60px 80px 2fr 3fr 120px 100px 100px 120px',
              gap: 2,
              p: 2,
              alignItems: 'center',
              borderBottom: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            <Typography variant="body2">{(currentPage - 1) * pageSize + index + 1}</Typography>
            <Box
              component="img"
              src={prod.fotos?.[0] || '/placeholder.png'}
              alt={prod.titulo}
              sx={{
                width: 60,
                height: 60,
                objectFit: 'cover',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider'
              }}
            />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{prod.titulo}</Typography>
            <Typography
              variant="body2"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: 'text.secondary'
              }}
            >
              {prod.descripcion}
            </Typography>
            <Typography variant="body2">
              {prod.moneda === 'PESO_ARG' ? '$' : prod.moneda === 'DOLAR_USA' ? 'USD ' : 'R$ '}
              {prod.precio.toLocaleString()}
            </Typography>
            <Typography variant="body2">{prod.stock}</Typography>
            <Typography variant="body2">{prod.totalVendido || 0}</Typography>

            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              {/* Botón EDITAR */}
              <IconButton
                size="small"
                onClick={() => handleEdit(prod._id)}
                sx={{
                  bgcolor: "#e8852a",
                  color: "white",
                  borderRadius: 1.5,
                  width: 34,
                  height: 34,
                  '&:hover': {
                    bgcolor: "#cf741f"
                  }
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>

              {/* Botón BORRAR */}
              <IconButton
                size="small"
                onClick={() => handleDeleteRequest(prod._id)}
                sx={{
                  bgcolor: "#D32F2F",
                  color: "white",
                  borderRadius: 1.5,
                  width: 34,
                  height: 34,
                  '&:hover': {
                    bgcolor: "#b32727"
                  }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>

            </Box>

          </Box>
        ))}
      </Box>

      <Box sx={{ marginTop: 4 }} aria-label="Paginación de productos">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </Box>

      {/* --- DIALOG DE CONFIRMACIÓN DE ELIMINAR --- */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"¿Eliminar producto?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este producto permanentemente?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary" disabled={isDeleting}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus disabled={isDeleting}>
            {isDeleting ? <CircularProgress size={24} color="inherit" /> : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para crear producto */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Nuevo Producto</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Título"
            fullWidth
            value={nuevoProducto.titulo}
            onChange={(e) =>
              setNuevoProducto((prev) => ({ ...prev, titulo: e.target.value }))
            }
          />
          <TextField
            label="Descripción"
            fullWidth
            value={nuevoProducto.descripcion}
            onChange={(e) =>
              setNuevoProducto((prev) => ({ ...prev, descripcion: e.target.value }))
            }
          />
          <TextField
            label="Precio"
            type="number"
            fullWidth
            value={nuevoProducto.precio}
            onChange={(e) =>
              setNuevoProducto((prev) => ({ ...prev, precio: Number(e.target.value) }))
            }
          />
          <TextField
            select
            label="Moneda"
            fullWidth
            value={nuevoProducto.moneda}
            onChange={(e) =>
              setNuevoProducto((prev) => ({ ...prev, moneda: e.target.value }))
            }
          >
            <MenuItem value={Moneda.PESO_ARG}>Peso Argentino</MenuItem>
            <MenuItem value={Moneda.DOLAR_USA}>Dólar Estadounidense</MenuItem>
            <MenuItem value={Moneda.REAL}>Real Brasileño</MenuItem>
          </TextField>

          <TextField
            label="Stock"
            type="number"
            fullWidth
            value={nuevoProducto.stock}
            onChange={(e) =>
              setNuevoProducto((prev) => ({ ...prev, stock: Number(e.target.value) }))
            }
          />

          <TextField
            select
            label="Categoría"
            fullWidth
            value={nuevoProducto.categorias[0] || ""}
            onChange={(e) =>
              setNuevoProducto((prev) => ({ ...prev, categorias: [e.target.value] }))
            }
          >
            {categorias.map((cat) => (
              <MenuItem key={cat._id} value={cat._id}>
                {cat.nombre.charAt(0).toUpperCase() + cat.nombre.slice(1)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="URL de imágenes (separadas por coma)"
            fullWidth
            value={nuevoProducto.fotos.join(", ")}
            onChange={(e) =>
              setNuevoProducto((prev) => ({ ...prev, fotos: e.target.value.split(",").map((f) => f.trim()) }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleGuardarProducto}
            disabled={!isFormularioValido()}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de edición */}
      {editingProduct && (
        <Dialog
          open={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Editar producto</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Título"
              fullWidth
              value={editingProduct.titulo}
              onChange={(e) =>
                setEditingProduct(prev =>
                  prev ? { ...prev, titulo: e.target.value } : prev
                )
              }
            />
            <TextField
              label="Descripción"
              fullWidth
              value={editingProduct.descripcion}
              onChange={(e) =>
                setEditingProduct(prev =>
                  prev ? { ...prev, descripcion: e.target.value } : prev
                )
              }
            />
            <TextField
              label="Precio"
              type="number"
              fullWidth
              value={editingProduct.precio}
              onChange={(e) =>
                setEditingProduct(prev =>
                  prev ? { ...prev, precio: parseFloat(e.target.value) } : prev
                )
              }
            />
            <TextField
              label="Stock"
              type="number"
              fullWidth
              value={editingProduct.stock}
              onChange={(e) =>
                setEditingProduct(prev =>
                  prev ? { ...prev, stock: parseInt(e.target.value) } : prev
                )
              }
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setEditingProduct(null)}>Cancelar</Button>
            <Button variant="contained" onClick={handleSaveChanges}>
              Guardar
            </Button>
          </DialogActions>

        </Dialog>
      )}

      {/* Snackbar */}
      <Snackbar
        open={alerta.open}
        autoHideDuration={4000}
        onClose={() => setAlerta((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={alerta.tipo === "error" ? "error" : "success"}
          variant="filled"
          onClose={() => setAlerta((prev) => ({ ...prev, open: false }))}
        >
          {alerta.mensaje}
        </Alert>
      </Snackbar>
    </Box>
  );
}