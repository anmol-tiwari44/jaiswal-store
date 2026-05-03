import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import shopRouter from "./shop";
import authRouter from "./auth";
import uploadRouter from "./upload";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(shopRouter);
router.use(authRouter);
router.use(uploadRouter);

export default router;
