const validate = (message = '') => {
  if (!(message || '').trim()) {
    throw new SyntaxError('Message is Empty.');
  }
  if (typeof message !== 'string') {
    throw new TypeError('Message must be a String.');
  }
  // Accept both single bracket {variable} and double bracket {{variable}} interpolation
  if (
    (message.includes('{') || message.includes('}')) &&
    !/{{ ?(?:- |\w+?)(, ?)?\w+? ?}}|{ ?\w+ ?}/g.test(message)
  ) {
    throw new SyntaxError(
      'Interpolation error. See: https://www.i18next.com/misc/json-format'
    );
  }
  if (message.includes('$t(') && !/\$t\([\w]+:\w+(?:\.\w+)*\)/g.test(message)) {
    throw new SyntaxError(
      'Nesting error. See: https://www.i18next.com/misc/json-format'
    );
  }
};

module.exports = validate;
