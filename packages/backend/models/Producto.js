import mongoose from "mongoose";

//Cada producto apunta a una o varias categorías 
//ya guardadas en la colección Categoria.
const categoriaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    }
});

export const Categoria = mongoose.model("Categoria", categoriaSchema);

const productoSchema = new mongoose.Schema({
    vendedor: {
        type: String,
        required: true,
        index: true
    },
    titulo: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: {
        type: String,
        trim: true,
    },
    categorias: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Categoria",
        },
    ],
    precio: {
        type: Number,
        required: true,
        min: 0,
    },
    moneda: {
        type: String,
        enum: ["PESO_ARG", "DOLAR_USA", "REAL"],
        required: true
    },
    stock: {
        type: Number,
        default: 0,
        min: 0,
    },
    totalVendido:{
        type: Number,
        default: 0,
        min: 0,
    },
    fotos: [
        {
            type: String, //URLs
        },
    ],
    activo: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
    versionKey: false
});

export const Producto = mongoose.model('Producto', productoSchema);