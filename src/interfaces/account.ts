export interface WhoAmIResult {
  /** IP address and port the request came from, as seen by the API. */
  requestOriginIpAddress: string;
  /** How the caller authenticated: "ApiKey", "Bearer" (OAuth) or "HMAC". */
  authenticationType: string;
  /** Roles granted to the caller, e.g. "Account Admin" or "Application". */
  roles: string[];
  /** Id of the application (integration) when authenticated with an API key. */
  appId?: string;
  /** Name of the application (integration) when authenticated with an API key. */
  appName?: string;
  /** Status of the account, e.g. "active". */
  status: string;
  /** Id of the tenant (company) the caller belongs to. */
  companyId: string;
  /** Name of the tenant (company) the caller belongs to. */
  companyName: string;
  /** Id of the signed-in user; empty or all zeros for applications. */
  userId: string;
  /** Login name of the signed-in user; empty for applications. */
  userName: string;
  /** First name of the signed-in user; empty for applications. */
  name: string;
  /** Last name of the signed-in user; empty for applications. */
  lastName: string;
}
