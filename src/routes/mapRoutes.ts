import { Router } from "express";
import MapController from "../controllers/mapController";

const router = Router();

// GET /api/map/users
router.get("/users", MapController.getUsers);

export default router;
