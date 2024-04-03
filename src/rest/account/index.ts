import { AlfredClient } from "..";

class Account {
  constructor(private client: AlfredClient) {}

  /**
   * Returns basic information about user/appliication
   * authenticated.
   */
  async whoAmI() {
    return this.client._http.get("/api/tagshelf/who-am-i");
  }
}

export = Account;
