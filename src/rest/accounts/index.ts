import { AlfredClient } from "..";
import { WhoAmIResult } from "../../interfaces";

export class Accounts {
  constructor(private client: AlfredClient) {}

  /**
   * Returns basic information about user/application
   * authenticated.
   *
   * The result is the account itself. Reading `.data` on it still works
   * but is deprecated and will be removed in the next major version.
   */
  async whoAmI(): Promise<
    WhoAmIResult & {
      /**
       * @deprecated The result is the account itself; `.data` will be
       * removed in the next major version.
       */
      data: WhoAmIResult;
    }
  > {
    const resp = await this.client._http.get("/api/tagshelf/who-am-i");
    const result: WhoAmIResult & { data?: WhoAmIResult } = resp.data;

    // Backwards compatibility: code written against the old return value
    // (the whole axios response) reads `.data`. Keep it non-enumerable so it
    // never shows up in Object.keys() or JSON.stringify().
    Object.defineProperty(result, "data", { value: result, enumerable: false });

    return result as WhoAmIResult & { data: WhoAmIResult };
  }
}

export default Accounts;
