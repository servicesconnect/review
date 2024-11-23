import { review } from "@review/controllers/create";
import { reviewsByProjectId, reviewsBySellerId } from "@review/controllers/get";
import express, { Router } from "express";

const router: Router = express.Router();

const reviewRoutes = (): Router => {
  router.get("/project/:projectId", reviewsByProjectId);
  router.get("/seller/:sellerId", reviewsBySellerId);
  router.post("/", review);

  return router;
};

export { reviewRoutes };
