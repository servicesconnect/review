import { pool } from "@review/config";
import { publishFanoutMessage } from "@review/queues/review.producer";
import { reviewChannel } from "@review/server";
import { IReviewDocument, IReviewMessageDetails } from "@review/interfaces";
import { map } from "lodash";
import { QueryResult } from "pg";

interface IReviewerObjectKeys {
  [key: string]: string | number | Date | undefined;
}

const objKeys: IReviewerObjectKeys = {
  review: "review",
  rating: "rating",
  country: "country",
  projectid: "projectId",
  reviewerid: "reviewerId",
  createdat: "createdAt",
  orderid: "orderId",
  sellerid: "sellerId",
  reviewerimage: "reviewerImage",
  reviewerusername: "reviewerUsername",
  reviewtype: "reviewType",
};

const addReview = async (data: IReviewDocument): Promise<IReviewDocument> => {
  const {
    projectId,
    reviewerId,
    reviewerImage,
    sellerId,
    review,
    rating,
    orderId,
    reviewType,
    reviewerUsername,
    country,
  } = data;
  const createdAtDate = new Date();
  const { rows } = await pool.query(
    `INSERT INTO reviews(projectId, reviewerId, reviewerImage, sellerId, review, rating, orderId, reviewType, reviewerUsername, country, createdAt)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `,
    [
      projectId,
      reviewerId,
      reviewerImage,
      sellerId,
      review,
      rating,
      orderId,
      reviewType,
      reviewerUsername,
      country,
      createdAtDate,
    ]
  );
  const messageDetails: IReviewMessageDetails = {
    projectId: data.projectId,
    reviewerId: data.reviewerId,
    sellerId: data.sellerId,
    review: data.review,
    rating: data.rating,
    orderId: data.orderId,
    createdAt: `${createdAtDate}`,
    type: `${reviewType}`,
  };
  await publishFanoutMessage(
    reviewChannel,
    "servicesconnect-review",
    JSON.stringify(messageDetails),
    "Review details sent to order and users services"
  );
  const result: IReviewDocument = Object.fromEntries(
    Object.entries(rows[0]).map(([key, value]) => [objKeys[key] || key, value])
  );
  return result;
};

const getReviewsByProjectId = async (
  projectId: string
): Promise<IReviewDocument[]> => {
  const reviews: QueryResult = await pool.query(
    "SELECT * FROM reviews WHERE reviews.projectId = $1",
    [projectId]
  );
  const mappedResult: IReviewDocument[] = map(reviews.rows, (key) => {
    return Object.fromEntries(
      Object.entries(key).map(([key, value]) => [objKeys[key] || key, value])
    );
  });
  return mappedResult;
};

const getReviewsBySellerId = async (
  sellerId: string
): Promise<IReviewDocument[]> => {
  const reviews: QueryResult = await pool.query(
    "SELECT * FROM reviews WHERE reviews.sellerId = $1 AND reviews.reviewType = $2",
    [sellerId, "seller-review"]
  );
  const mappedResult: IReviewDocument[] = map(reviews.rows, (key) => {
    return Object.fromEntries(
      Object.entries(key).map(([key, value]) => [objKeys[key] || key, value])
    );
  });
  return mappedResult;
};

export { addReview, getReviewsByProjectId, getReviewsBySellerId };
