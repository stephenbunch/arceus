/**
 * @param {String} dirname
 * @returns {Object}
 */
export default function( dirname, params = {} ) {
  return {
    sourceRoot: dirname,
    presets: [],
    plugins: [],
    sourceMaps: true
  };
};
