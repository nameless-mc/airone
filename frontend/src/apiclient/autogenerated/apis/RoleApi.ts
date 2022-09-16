/* tslint:disable */
/* eslint-disable */
/**
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 0.0.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import * as runtime from "../runtime";
import { Role, RoleFromJSON, RoleToJSON } from "../models";

export interface RoleApiV2RetrieveRequest {
  id: number;
}

/**
 *
 */
export class RoleApi extends runtime.BaseAPI {
  /**
   */
  async roleApiV2ListListRaw(
    initOverrides?: RequestInit
  ): Promise<runtime.ApiResponse<Array<Role>>> {
    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (
      this.configuration &&
      (this.configuration.username !== undefined ||
        this.configuration.password !== undefined)
    ) {
      headerParameters["Authorization"] =
        "Basic " +
        btoa(this.configuration.username + ":" + this.configuration.password);
    }
    if (this.configuration && this.configuration.apiKey) {
      headerParameters["Authorization"] =
        this.configuration.apiKey("Authorization"); // tokenAuth authentication
    }

    const response = await this.request(
      {
        path: `/role/api/v2/list`,
        method: "GET",
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides
    );

    return new runtime.JSONApiResponse(response, (jsonValue) =>
      jsonValue.map(RoleFromJSON)
    );
  }

  /**
   */
  async roleApiV2ListList(initOverrides?: RequestInit): Promise<Array<Role>> {
    const response = await this.roleApiV2ListListRaw(initOverrides);
    return await response.value();
  }

  /**
   */
  async roleApiV2RetrieveRaw(
    requestParameters: RoleApiV2RetrieveRequest,
    initOverrides?: RequestInit
  ): Promise<runtime.ApiResponse<Role>> {
    if (requestParameters.id === null || requestParameters.id === undefined) {
      throw new runtime.RequiredError(
        "id",
        "Required parameter requestParameters.id was null or undefined when calling roleApiV2Retrieve."
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (
      this.configuration &&
      (this.configuration.username !== undefined ||
        this.configuration.password !== undefined)
    ) {
      headerParameters["Authorization"] =
        "Basic " +
        btoa(this.configuration.username + ":" + this.configuration.password);
    }
    if (this.configuration && this.configuration.apiKey) {
      headerParameters["Authorization"] =
        this.configuration.apiKey("Authorization"); // tokenAuth authentication
    }

    const response = await this.request(
      {
        path: `/role/api/v2/{id}`.replace(
          `{${"id"}}`,
          encodeURIComponent(String(requestParameters.id))
        ),
        method: "GET",
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides
    );

    return new runtime.JSONApiResponse(response, (jsonValue) =>
      RoleFromJSON(jsonValue)
    );
  }

  /**
   */
  async roleApiV2Retrieve(
    requestParameters: RoleApiV2RetrieveRequest,
    initOverrides?: RequestInit
  ): Promise<Role> {
    const response = await this.roleApiV2RetrieveRaw(
      requestParameters,
      initOverrides
    );
    return await response.value();
  }
}
