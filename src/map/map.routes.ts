import { Router } from 'express';
import MapController from './map.controller';

const router = Router();

// GET /api/map/users
router.get('/users/:id', MapController.getUsers);

export default router;
