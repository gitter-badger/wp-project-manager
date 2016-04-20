'use strict';

var _scaffold = require('../include/scaffold');

var _scaffold2 = _interopRequireDefault(_scaffold);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
	command: 'project create',
	describe: 'scaffold new project',
	builder: {},
	handler: function handler(argv) {
		_scaffold2.default.init();
	}
};