import { AxiosInstance } from 'axios';
import * as AxiosLogger from 'axios-logger';

type AddAxiosLogger = (
  client: AxiosInstance,
  config?: {
    request?: boolean;
    response?: boolean;
  }
) => AxiosInstance;

export const withAxiosLogger: AddAxiosLogger = (
  client,
  { request = true, response = false } = {}
) => {
  if (request) {
    client.interceptors.request.use(AxiosLogger.requestLogger);
  }
  if (response) {
    client.interceptors.response.use(AxiosLogger.responseLogger);
  }
  return client;
};
