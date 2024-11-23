import { winstonLogger } from "./logger";
import { Logger } from "winston";
import { envConfig } from "./env";
import { Pool } from "pg";

const log: Logger = winstonLogger("reviewDatabaseServer", "debug");

const pool: Pool = new Pool({
  host: `${envConfig.database_host}`,
  user: `${envConfig.database_user}`,
  password: `${envConfig.database_password}`,
  port: 5432,
  database: `${envConfig.database_name}`,
});

pool.on("error", (error: Error) => {
  log.log("error", "pg client error", error);
  process.exit(-1);
});

const createTableText = `
  CREATE TABLE IF NOT EXISTS public.reviews (
    id SERIAL UNIQUE,
    projectId text NOT NULL,
    reviewerId text NOT NULL,
    orderId text NOT NULL,
    sellerId text NOT NULL,
    review text NOT NULL,
    reviewerImage text NOT NULL,
    reviewerUsername text NOT NULL,
    country text NOT NULL,
    reviewType text NOT NULL,
    rating integer DEFAULT 0 NOT NULL,
    createdAt timestamp DEFAULT CURRENT_DATE,
    PRIMARY KEY (id)
  );

  CREATE INDEX IF NOT EXISTS projectId_idx ON public.reviews (projectId);

  CREATE INDEX IF NOT EXISTS sellerId_idx ON public.reviews (sellerId);
`;

const databaseConnection = async (): Promise<void> => {
  try {
    await pool.connect();
    log.info("Review service successfully connected to postgresql database.");
    await pool.query(createTableText);
  } catch (error) {
    log.error("ReviewService - Unable to connecto to database");
    log.log("error", "ReviewService () method error:", error);
  }
};

export { databaseConnection, pool };
