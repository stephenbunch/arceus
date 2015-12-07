export default class ManualResetEvent {
  constructor() {
    this.reset();
  }

  set() {
    this._resolve.apply( undefined, arguments );
  }

  reset() {
    this.handle = new Promise( resolve => {
      this._resolve = resolve;
    });
  }
};
