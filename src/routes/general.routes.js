/**
 * Rutas de general
 *
 * Pantalla de entrada y utilidades sueltas.
 */
import { Router } from "express";
import { asyncHandler } from "../middleware/errores.js";
import * as controlador from "../controllers/general.controller.js";

export const router = Router();

router.get("/", asyncHandler(controlador.inicio));
