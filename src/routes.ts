import { Router } from "express";
import { authenticate } from "./auth/authenticate.middleware";
import authRoutes from "./auth/auth.routes";
import mapRoutes from "./map/map.routes";
import messageRoutes from "./message/message.routes";
import roomRoutes from "./room/room.routes";
import userRoutes from "./user/user.routes";

export const routerV1 = Router();

routerV1.use("/auth", authRoutes);
routerV1.use("/map", authenticate, mapRoutes);
routerV1.use("/messages", authenticate, messageRoutes);
routerV1.use("/rooms", authenticate, roomRoutes);
routerV1.use("/users", authenticate, userRoutes);
