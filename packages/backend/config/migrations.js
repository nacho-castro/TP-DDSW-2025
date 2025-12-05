import { Categoria } from '../models/Producto.js';

export async function runMigrations() {
  try {
    console.log('🔄 Ejecutando migraciones...');

    await migrateCategorias();

    console.log('✅ Migraciones completadas exitosamente');
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error);
    throw error;
  }
}

async function migrateCategorias() {
  const categoriasBase = [
    { nombre: 'Calzado' },
    { nombre: 'Indumentaria' },
    { nombre: 'Accesorios' }
  ];

  for (const categoriaData of categoriasBase) {
    const categoriaExistente = await Categoria.findOne({ nombre: categoriaData.nombre });

    if (!categoriaExistente) {
      await Categoria.create(categoriaData);
      console.log(`  ✓ Categoría creada: ${categoriaData.nombre}`);
    } else {
      console.log(`  ⊙ Categoría ya existe: ${categoriaData.nombre}`);
    }
  }
}
