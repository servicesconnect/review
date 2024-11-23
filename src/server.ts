import http from "http";

import "express-async-errors";
import { IAuthPayload } from "@review/interfaces";
import { Logger } from "winston";
import {
  envConfig,
  startAndCheckElasticConnection,
  winstonLogger,
  IErrorResponse,
  createQueueConnection,
  CustomError,
} from "@review/config";
import {
  Application,
  Request,
  Response,
  NextFunction,
  json,
  urlencoded,
} from "express";
import hpp from "hpp";
import helmet from "helmet";
import cors from "cors";
import { verify } from "jsonwebtoken";
import compression from "compression";
import { appRoutes } from "@review/routes";
import { Channel } from "amqplib";

const log: Logger = winstonLogger("reviewServer", "debug");
let reviewChannel: Channel;

const start = (app: Application): void => {
  securityMiddleware(app);
  standardMiddleware(app);
  routesMiddleware(app);
  startQueues();
  startElasticSearch();
  reviewErrorHandler(app);
  startServer(app);
};

const securityMiddleware = (app: Application): void => {
  app.set("trust proxy", 1);
  app.use(hpp());
  app.use(helmet());
  app.use(
    cors({
      origin: envConfig.api_gateway_url,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    })
  );
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      const payload: IAuthPayload = verify(
        token,
        envConfig.jwt_token!
      ) as IAuthPayload;
      req.currentUser = payload;
    }
    next();
  });
};

const standardMiddleware = (app: Application): void => {
  app.use(compression());
  app.use(json({ limit: "200mb" }));
  app.use(urlencoded({ extended: true, limit: "200mb" }));
};

const routesMiddleware = (app: Application): void => {
  appRoutes(app);
};

const startQueues = async (): Promise<void> => {
  reviewChannel = (await createQueueConnection()) as Channel;
};

const startElasticSearch = (): void => {
  startAndCheckElasticConnection();
};

const reviewErrorHandler = (app: Application): void => {
  app.use(
    (
      error: IErrorResponse,
      _req: Request,
      res: Response,
      next: NextFunction
    ) => {
      log.log("error", `ReviewService ${error.comingFrom}:`, error);
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(error.serializeErrors());
      }
      next();
    }
  );
};

const startServer = async (app: Application): Promise<void> => {
  try {
    const httpServer: http.Server = new http.Server(app);
    log.info(`Review server has started with process id ${process.pid}`);
    httpServer.listen(envConfig.port, () => {
      log.info(`Review server running on port ${envConfig.port}`);
    });
  } catch (error) {
    log.log("error", "ReviewService startServer() method error:", error);
  }
};

export { start, reviewChannel };
