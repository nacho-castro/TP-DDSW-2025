'use client';

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import ProductCard, { Product } from "@/components/ProductCard/ProductCard";
import Pagination from "@/components/Pagination/Pagination";

import {
  Container,
  Box,
  Typography,
  Divider,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FilterListIcon from "@mui/icons-material/FilterList";

import axios from "axios";
import { useCart } from "../../store/CartContext";
import { formatNumber } from "../../utils/formatPrice";

function ProductosPageContent() {
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  
  // -----------------------------------------------------------------------
  // 1. INICIALIZACIÓN DE ESTADO BASADA EN URL (Persistencia al recargar)
  // -----------------------------------------------------------------------
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categorias, setCategorias] = useState<{ _id: string; nombre: string }[]>([]);
  
  // Filtros: Si hay algo en la URL, arrancamos con eso. Si no, string vacío.
  const [precioMin, setPrecioMin] = useState(searchParams.get("precioMin") || "");
  const [precioMax, setPrecioMax] = useState(searchParams.get("precioMax") || "");
  const [categoria, setCategoria] = useState(searchParams.get("categoria") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

  // Rangos dinámicos y Slider
  const [precioRangoMin, setPrecioRangoMin] = useState<number>(0);
  const [precioRangoMax, setPrecioRangoMax] = useState<number>(10000); 
  const [precioSliderValue, setPrecioSliderValue] = useState<number[]>([0, 10000]);

  const pageSize = 6;

  // Función auxiliar para actualizar la URL sin recargar la página entera
  const updateURL = (newParams: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });

    router.push(`?${params.toString()}`, { scroll: false });
  };

  // -----------------------------------------------------------------------
  // 2. FETCH PRODUCTOS CON SOPORTE DE "OVERRIDE" (Para limpieza instantánea)
  // -----------------------------------------------------------------------
  const fetchProducts = async (
    page = currentPage, 
    search = searchTerm,
    // filtersOverride permite forzar valores vacíos ignorando el estado actual visual
    filtersOverride?: {
      precioMin?: string;
      precioMax?: string;
      categoria?: string;
      sort?: string;
    }
  ) => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: pageSize.toString(),
      };

      // Lógica de Prioridad: Override > Estado Actual
      const pMin = filtersOverride ? (filtersOverride.precioMin || "") : precioMin;
      const pMax = filtersOverride ? (filtersOverride.precioMax || "") : precioMax;
      const cat = filtersOverride ? (filtersOverride.categoria || "") : categoria;
      const srt = filtersOverride ? (filtersOverride.sort || "") : sort;

      if (search) params.nombre = search;
      if (pMin) params.precioMin = pMin;
      if (pMax) params.precioMax = pMax;
      if (cat) params.categoria = cat;
      if (srt) params.sort = srt;

      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/productos`, { params });

      setProducts(res.data.data || []);
      setTotalPages(res.data.totalPaginas || 1);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los productos.");
    } finally {
      setLoading(false);
    }
  };

  // Efecto principal: Cargar cuando cambia página o sort
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, sort]);

  // Cargar Categorías
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/productos/categorias`);
        setCategorias(res.data || []);
      } catch (err) {
        console.error("Error al cargar categorías", err);
      }
    };
    fetchCategorias();
  }, []);

  // -----------------------------------------------------------------------
  // 3. OBTENER RANGO DE PRECIOS Y SINCRONIZAR SLIDER
  // -----------------------------------------------------------------------
  useEffect(() => {
    const fetchPriceRange = async () => {
      try {
        const resMin = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/productos`, {
          params: { sort: 'precio_asc', limit: 1 }
        });
        const resMax = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/productos`, {
          params: { sort: 'precio_desc', limit: 1 }
        });

        const minPrice = resMin.data.data?.[0]?.precio ?? 0;
        const maxPrice = resMax.data.data?.[0]?.precio ?? 10000;

        setPrecioRangoMin(minPrice);
        setPrecioRangoMax(maxPrice);

        // Si NO hay filtros en la URL, seteamos el slider al rango completo
        if (!searchParams.get("precioMin") && !searchParams.get("precioMax")) {
          setPrecioSliderValue([minPrice, maxPrice]);
        } else {
          // Si HAY filtros en la URL, seteamos el slider acorde a ellos
          setPrecioSliderValue([
            Number(searchParams.get("precioMin")) || minPrice,
            Number(searchParams.get("precioMax")) || maxPrice
          ]);
        }

      } catch (err) {
        console.error("Error al cargar rango de precios", err);
      }
    };
    fetchPriceRange();
  }, []); // Solo al montar

  // Búsqueda con Debounce
  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchTerm !== (searchParams.get("search") || "")) {
        setCurrentPage(1);
        fetchProducts(1, searchTerm);
        updateURL({ search: searchTerm, page: 1 });
      }
    }, 500);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  // -----------------------------------------------------------------------
  // MANEJADORES DE EVENTOS
  // -----------------------------------------------------------------------

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    const vals = newValue as number[];
    setPrecioSliderValue(vals);
    // Solo actualizamos visualmente los inputs, no disparamos el fetch aún
    setPrecioMin(vals[0].toString());
    setPrecioMax(vals[1].toString());
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchProducts(1);
    updateURL({
      precioMin,
      precioMax,
      categoria,
      sort,
      page: 1
    });
  };

  const handleClearFilters = () => {
    // 1. Resetear estados visuales
    setPrecioMin("");
    setPrecioMax("");
    setCategoria("");
    setSort("");
    setSearchTerm("");
    setCurrentPage(1);
    
    // Resetear slider al rango original del backend
    setPrecioSliderValue([precioRangoMin, precioRangoMax]);

    // 2. FORZAR fetch con valores vacíos (Override) para respuesta instantánea
    fetchProducts(1, "", {
      precioMin: "",
      precioMax: "",
      categoria: "",
      sort: ""
    });

    // 3. Limpiar la URL completamente
    router.push("?"); 
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchProducts(page);
    updateURL({ page });
  };

  const FiltersContent = () => (
    <>
      <Typography variant="h6" fontWeight={700} mb={2}>Precio</Typography>

      {/* Slider Visual */}
      <Box sx={{ px: 1, mb: 2 }}>
        <Slider
          getAriaLabel={() => 'Rango de Precio'}
          value={precioSliderValue}
          onChange={handleSliderChange}
          valueLabelDisplay="auto"
          min={precioRangoMin}
          max={precioRangoMax}
          sx={{ color: 'primary.main' }}
          disableSwap
        />
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Min: ${formatNumber(precioSliderValue[0])}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Max: ${formatNumber(precioSliderValue[1])}
          </Typography>
        </Box>
      </Box>

      {/* Inputs Manuales (Sincronizados con el slider) */}
      <Box display="flex" gap={2} mb={1}>
        <TextField
          fullWidth size="small" label="Min" type="number"
          value={precioMin} 
          onChange={(e) => {
             const val = Number(e.target.value);
             setPrecioMin(e.target.value);
             setPrecioSliderValue([val, precioSliderValue[1]]);
          }}
        />

        <TextField
          fullWidth size="small" label="Max" type="number"
          value={precioMax} 
          onChange={(e) => {
            const val = Number(e.target.value);
            setPrecioMax(e.target.value);
            setPrecioSliderValue([precioSliderValue[0], val]);
          }}
        />
      </Box>

      <Divider sx={{ my: 3 }} />

      <FormControl fullWidth size="small">
        <InputLabel>Categoría</InputLabel>
        <Select value={categoria} label="Categoría" onChange={(e) => setCategoria(e.target.value)}>
          <MenuItem value="">Todas</MenuItem>
          {categorias.map((cat) => (
            <MenuItem key={cat._id} value={cat._id}>{cat.nombre}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" fontWeight={700} mb={2}>Ordenar por</Typography>

      <FormControl fullWidth size="small">
        <InputLabel>Orden</InputLabel>
        <Select
          value={sort}
          label="Orden"
          onChange={(e) => {
            const newSort = e.target.value;
            setSort(newSort);
            setCurrentPage(1);
            // Al ordenar, actualizamos URL y Fetch via useEffect
            updateURL({ sort: newSort, page: 1 });
          }}
        >
          <MenuItem value="">Predeterminado</MenuItem>
          <MenuItem value="mas_vendidos">Más vendidos</MenuItem>
          <MenuItem value="precio_asc">Menor precio</MenuItem>
          <MenuItem value="precio_desc">Mayor precio</MenuItem>
        </Select>
      </FormControl>

      <Button variant="contained" fullWidth sx={{ mt: 3 }} onClick={handleApplyFilters}>
        Aplicar filtros
      </Button>
      <Button variant="outlined" fullWidth sx={{ mt: 2 }} onClick={handleClearFilters}>
        Limpiar filtros
      </Button>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-platinum">
      <Navbar showSearch={true} searchPlaceholder="Buscar productos..." onSearch={setSearchTerm} />

      <main className="flex-grow py-12">
        <Container maxWidth="lg" className="flex flex-col md:flex-row gap-8 items-stretch">
          
          {/* FILTROS MOBILE (Accordion) */}
          <Box className="md:hidden w-full mb-8 mt-2">
            <Accordion sx={{ borderRadius: "8px", overflow: "hidden" }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ backgroundColor: "white", "&:before": { display: "none" } }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <FilterListIcon />
                  <Typography fontWeight={600}>Filtros y Ordenamiento</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ backgroundColor: "white", mt: 1 }}>
                {FiltersContent()}
              </AccordionDetails>
            </Accordion>
          </Box>

          {/* FILTROS DESKTOP (Sidebar) */}
          <aside className="w-60 hidden md:block bg-white p-4 rounded-lg shadow h-fit">
            {FiltersContent()}
          </aside>

          {/* LISTA DE PRODUCTOS */}
          <Box className="flex-1">
            {loading && <Typography align="center" mt={4}>Cargando productos...</Typography>}
            {error && <Typography color="error" align="center" mt={4}>{error}</Typography>}

            {!loading && !error && products.length === 0 && (
              <Typography align="center" mt={4}>No se encontraron productos.</Typography>
            )}

            {!loading && !error && products.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 justify-items-center">
                {products.map((prod) => (
                  <ProductCard key={prod._id} product={prod} userType="buyer" />
                ))}
              </div>
            )}
          </Box>
        </Container>

        {!loading && !error && products.length > 0 && (
          <Container maxWidth="lg">
            <Box sx={{ marginTop: 4 }}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </Box>
          </Container>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function ProductosPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ProductosPageContent />
    </Suspense>
  );
}
