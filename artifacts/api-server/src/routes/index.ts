import { Router, type IRouter } from "express";
import healthRouter from "./health";
import geminiRouter from "./gemini";
import quranRouter from "./quran";

const router: IRouter = Router();

router.use(healthRouter);
router.use(geminiRouter);
router.use(quranRouter);

export default router;
