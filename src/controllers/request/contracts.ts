import { Query } from 'express-serve-static-core';
import { Request } from 'express';

// export interface ISearchForCosignerRequest {
//   search?: string;
//   requesterCustomerId: number;
// }

export interface TypedRequestBody<T> extends Request {
  body: T;
}

export interface TypedRequestQuery<T extends Query> extends Request {
  query: T;
}

export interface TypedRequest<Q extends Query, B> extends Request {
  body: B;
  query: Q;
}
