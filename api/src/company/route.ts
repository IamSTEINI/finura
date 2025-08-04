import { Router } from "express";

import infoRouter from "./info/route";

const companyRouter = Router();

companyRouter.use("/info", infoRouter);

export default companyRouter;
