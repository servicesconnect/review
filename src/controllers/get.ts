import {
  getReviewsByProjectId,
  getReviewsBySellerId,
} from "@review/services/review.service";
import { IReviewDocument } from "@review/interfaces";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export const reviewsByProjectId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const reviews: IReviewDocument[] = await getReviewsByProjectId(
    req.params.projectId
  );
  res
    .status(StatusCodes.OK)
    .json({ message: "Project reviews by project id", reviews });
};

export const reviewsBySellerId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const reviews: IReviewDocument[] = await getReviewsBySellerId(
    req.params.sellerId
  );
  res
    .status(StatusCodes.OK)
    .json({ message: "Project reviews by seller id", reviews });
};
