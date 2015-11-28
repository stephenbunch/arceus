export default class AutoResetEvent {
  constructor() {
    this._reset();
  }

  set() {
    this._resolve.apply( undefined, arguments );
    this._reset();
  }

  _reset() {
    this.handle = new Promise( resolve => {
      this._resolve = resolve;
    });
  }
};
