import dotenv from "dotenv";

dotenv.config();

if (process.env.ENABLE_APM === "1") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("elastic-apm-node").start({
    serviceName: "jobber-review",
    serverUrl: process.env.ELASTIC_APM_SERVER_URL,
    secretToken: process.env.ELASTIC_APM_SECRET_TOKEN,
    environment: process.env.NODE_ENV,
    active: true,
    captureBody: "all",
    errorOnAbortedRequests: true,
    captureErrorLogStackTraces: "always",
  });
}

class EnvConfig {
  public port: string | undefined;
  public app_name: string | undefined;
  public node_env: string | undefined;
  public elastic_search_url: string | undefined;
  public jwt_token: string | undefined;
  public gateway_jwt_token: string | undefined;
  public api_gateway_url: string | undefined;
  public rabbitmq_endpoint: string | undefined;
  public cloud_name: string | undefined;
  public cloud_api_key: string | undefined;
  public cloud_api_secret: string | undefined;
  public database_host: string | undefined;
  public database_user: string | undefined;
  public database_password: string | undefined;
  public database_name: string | undefined;
  public cluster_type: string | undefined;

  constructor() {
    this.port = process.env.PORT || "";
    this.app_name = process.env.APP_NAME || "";
    this.node_env = process.env.NODE_ENV || "";
    this.elastic_search_url = process.env.ELASTIC_SEARCH_URL || "";
    this.database_host = process.env.DATABASE_HOST || "";
    this.database_user = process.env.DATABASE_USER || "";
    this.database_password = process.env.DATABASE_PASSWORD || "";
    this.database_name = process.env.DATABASE_NAME || "";
    this.gateway_jwt_token = process.env.GATEWAY_JWT_TOKEN || "";
    this.jwt_token = process.env.JWT_TOKEN || "";
    this.api_gateway_url = process.env.API_GATEWAY_URL || "";
    this.rabbitmq_endpoint = process.env.RABBITMQ_ENDPOINT || "";
    this.cloud_name = process.env.CLOUD_NAME || "";
    this.cloud_api_key = process.env.CLOUD_API_KEY || "";
    this.cloud_api_secret = process.env.CLOUD_API_SECRET || "";
  }
}

export const envConfig: EnvConfig = new EnvConfig();
