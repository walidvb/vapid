const Utils = require('../utils');

/**
 * Defaults
 *
 * @attr {string} [class=''] - <img> class attribute
 * @attr {string} [alt=''] - <img> alt attribute
 * @options {boolean} [tag=true] - render <img> or return raw src
 * @options {boolean} [multiple=true] - add multiple images
 */
const DEFAULTS = {
  attrs: {
    class: '',
    alt: '',
    width: '',
    height: '',
  },
  options: {
    tag: true,
    multiple: false,
  },
};

module.exports = (BaseDirective) => {
  /*
   * Upload and render images
   */
  class ImageDirective extends BaseDirective {
    /**
     * @static
     *
     * @return {Object} default attrs and options
     */
    static get DEFAULTS() {
      return DEFAULTS;
    }

    /**
     * Renders inputs necessary to upload, preview, and optionally remove images
     *
     * @param {string} name
     * @param {string} [value=this.options.default]
     * @return {string} rendered HTML
     *
     * eslint-disable class-methods-use-this
     */

    input(name, value) {
      return this.options.multiple ? this.multipleInputs(name, value) :
        this.singleInput(name, value);
    }

    /**
     * Renders an HTML input
     * Typically used in the dashboard forms, or front-end contact forms
     *
     * @param {string} name
     * @param {array} [values=[this.options.default]]
     * @return {string}
     */
    multipleInputs(name, values = [this.options.default]) {
      const _values = Array.isArray(values) ? values : [values];
      if (_values.length === 0) {
        _values.push(this.options.default);
      }
      this.attrs.required = false;
      const inputs = _values.map((val, i) => this.singleInput(`${name}[${i}]`, val)).join('');
      return `<div class="multiple-input">
        ${inputs}
        <div class="adder button" data-template='${JSON.stringify(this.singleInput(`${name}[]`))}'>Add new</div>
      </div>`;
    }

    /**
     * Renders an HTML input
     * Typically used in the dashboard forms, or front-end contact forms
     *
     * @param {string} name
     * @param {array} [values=[this.options.default]]
     * @return {string}
     */
    singleInput(name, value = '') {
      const inputs = `<input type="file" name="${name}" accept="image/*">
                    <input type="hidden" name="${name}" value="${value}">`;
      const preview = value ? `<img class="preview" src="/uploads/${value}">` : '';
      const destroy = !this.attrs.required && preview
        ? `<div class="ui checkbox">
             <input type="checkbox" name="${name.replace('content', '_destroy')}">
             <label>Delete</label>
           </div>`
        : '';

      return `
        <div class="previewable">
          ${inputs}
          ${preview}
          ${destroy}
        </div>`;
    }

    /* eslint-enable class-methods-use-this */

    /**
     * Renders <img> tag or raw src
     *
     * @param {string|array} fileName
     * @return {string}
     */
    render(fileName) {
      if (this.options.multiple) {
        const fileNames = fileName || [];
        return fileNames.map(this.renderSingle.bind(this));
      }
      return this.renderSingle(fileName);
    }

    renderSingle(fileName) {
      if (!fileName) return null;

      if (this.options.tag) {
        return `<img src="/uploads/${fileName}${this._queryString}" ${this._tagAttrs}>`;
      }

      return `/uploads/${fileName}${this._queryString}`;
    }

    /**
     * A preview of the image
     *
     * @param {string} fileName
     * @return {string}
     */
    preview(fileName) {
      // Always render a tag
      this.options.tag = true;
      return this.render(fileName);
    }

    /**
     * @private
     *
     * Converts attrs to img tag attrs
     *
     * @return {string}
     */
    get _tagAttrs() {
      return Utils.chain(this.attrs)
        .keys()
        .map((key) => {
          const val = this.attrs[key];
          return val && `${key}="${Utils.escape(val)}"`;
        })
        .compact()
        .value()
        .join(' ');
    }

    /**
     * @private
     *
     * Converts width/height to a query string
     *
     * @return {string}
     */
    get _queryString() {
      const qs = Utils.chain(['width', 'height'])
        .map((key) => {
          const val = this.attrs[key];
          return val && `${key[0]}=${Number(val)}`;
        })
        .compact()
        .value()
        .join('&');
      return qs ? `?${qs}` : '';
    }
  }

  return ImageDirective;
};
