import { Client } from "@elastic/elasticsearch";
import { ClusterHealthResponse } from "@elastic/elasticsearch/lib/api/types";
import { envConfig, winstonLogger } from "@review/config";
import { Logger } from "winston";

const log: Logger = winstonLogger("reviewElasticSearchServer", "debug");

const elasticSearchClient = new Client({
  node: `${envConfig.elastic_search_url}`,
});

async function startAndCheckElasticConnection(): Promise<void> {
  let isConnected = false;
  while (!isConnected) {
    log.info("ReviewService connecting to ElasticSearch...");
    try {
      const health: ClusterHealthResponse =
        await elasticSearchClient.cluster.health({});
      log.info(`ReviewService Elasticsearch health status - ${health.status}`);
      isConnected = true;
    } catch (error) {
      log.error("Connection to Elasticsearch failed. Retrying...");
      log.log("error", "ReviewService checkConnection() method:", error);
    }
  }
}

export { elasticSearchClient, startAndCheckElasticConnection };
