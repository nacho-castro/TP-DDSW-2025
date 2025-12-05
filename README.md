# 🛒 Tienda Sol - E-commerce Marketplace

> **Plataforma de comercio electrónico Full Stack diseñada para conectar emprendedores locales con compradores, gestionando el ciclo completo de ventas, stock y notificaciones.**

Este proyecto fue desarrollado como Trabajo Práctico Integrador para la materia **Desarrollo de Software** (UTN FRBA), simulando un entorno profesional con metodologías ágiles, control de versiones (GitFlow) y despliegue continuo (CI/CD).

Documentación: [PDF DOCS](https://drive.google.com/file/d/1Dump6Qczm56wKiWscbf-qt_LchhuD9SH/view?usp=sharing)

_Nota: Este repositorio es un mirror público del proyecto original desarrollado en el entorno privado de la Universidad (UTN FRBA). Se publica con fines demostrativos y de portafolio personal._

---

## 🚀 Stack MERN

Stack moderno enfocado en escalabilidad, rendimiento y experiencia de usuario.

### **Frontend**
* **Framework:** [Next.js](https://nextjs.org/) (React) para SSR y optimización.
* **UI/UX:** Material UI & Tailwind CSS para diseño responsive y accesible.
* **State Management:** Context API para manejo global del Carrito de Compras.
* **Cliente HTTP:** Axios.

### **Backend**
* **Runtime:** Node.js + Express.
* **Base de Datos:** MongoDB Atlas (NoSQL) con Mongoose para modelado de datos flexible.
* **API:** RESTful API documentada con **Swagger/OpenAPI**.
* **Seguridad:** Autenticación y gestión de sesiones mediante **Clerk**.

### **DevOps & QA**
* **Testing:** Jest (Unit Testing) y Cypress (E2E Testing).
* **Infraestructura:** Docker para contenedorización del Backend.
* **CI/CD:** GitHub Actions para despliegue automático.
* **Deploy:** Vercel (Frontend) y Render (Backend).

---

## 💡 Principales Funcionalidades

El sistema soporta dos roles principales (**Comprador** y **Vendedor**) con flujos de trabajo diferenciados:

* 🛍️ **Gestión de Productos:** ABM completo de productos con control de stock en tiempo real, categorización y carga de imágenes.
* 🔍 **Búsqueda Avanzada:** Filtros por categoría, rango de precios y ordenamiento (SQL/Mongo sort logic) con paginación optimizada.
* 🛒 **Carrito & Checkout:** Lógica de carrito persistente (localStorage + Context) y validación de stock previa a la confirmación de compra.
* 📦 **Gestión de Pedidos:** Ciclo de vida completo (Pendiente -> Confirmado -> Enviado -> Cancelado) con auditoría de estados.
* 🔔 **Centro de Notificaciones:** Sistema de alertas para actualizaciones de pedidos (envíos, cancelaciones) y estado de lectura.

---

## 🏗️ Arquitectura y Flujo de Trabajo

El proyecto utiliza una arquitectura de **Monorepo** para facilitar la gestión unificada del código.

* **GitFlow:** Estrategia de ramas (`main`, `develop`, `feature/*`, `hotfix`) para asegurar la integridad del código en producción.
* **API First:** Diseño robusto de endpoints REST con validaciones (Zod/Middleware) y manejo de errores estandarizado.
* **Persistencia:** Modelado de datos documental (Schemas para Usuarios, Productos, Pedidos) optimizado para evitar joins complejos.

---

## 🧪 Calidad de Software

* **Tests Unitarios:** Validación de lógica de negocio en la capa de servicios (ej: validación de stock).
* **Tests E2E:** Simulación de flujo crítico de usuario: *Login Vendedor -> Crear Producto -> Compra de Usuario -> Validación de descuento de Stock*.

---

### 👥 Equipo - Grupo 6 (2C 2025)
* Alex Fiorenza
* Ian Gabriel Sanna
* Facundo Tomasetti
* Ignacio Alejo Scarfo
* Ignacio Castro Planas
