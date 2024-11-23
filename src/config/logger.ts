import winston, { Logger } from "winston";
import {
  ElasticsearchTransformer,
  ElasticsearchTransport,
  LogData,
  TransformedData,
} from "winston-elasticsearch";

import { envConfig } from "@review/config";

const esTransformer = (logData: LogData): TransformedData => {
  return ElasticsearchTransformer(logData);
};

export const winstonLogger = (name: string, level: string): Logger => {
  const options = {
    console: {
      level,
      handleExceptions: true,
      json: false,
      colorize: true,
    },
    elasticsearch: {
      level,
      transformer: esTransformer,
      clientOpts: {
        node: envConfig.elastic_search_url,

        maxRetries: 2,
        requestTimeout: 10000,
        sniffOnStart: false,
      },
    },
  };
  const esTransport: ElasticsearchTransport = new ElasticsearchTransport(
    options.elasticsearch
  );
  const logger: Logger = winston.createLogger({
    exitOnError: false,
    defaultMeta: { service: name },
    transports: [new winston.transports.Console(options.console), esTransport],
  });
  return logger;
};