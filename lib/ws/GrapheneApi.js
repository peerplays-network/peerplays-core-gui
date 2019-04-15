class GrapheneApi {
  constructor(ws_rpc, api_name) {
    this.ws_rpc = ws_rpc;
    this.api_name = api_name;
  }

  init() {
    return this.ws_rpc.call([1, this.api_name, []]).then((response) => {
      this.api_id = response;
      return this;
    });
  }

  exec(method, params) {
    return this.ws_rpc.call([this.api_id, method, params]).catch((error) => {
      console.log('!!! GrapheneApi error: ', method, params, error, JSON.stringify(error));
      throw error;
    });
  }
}

export default GrapheneApi;
