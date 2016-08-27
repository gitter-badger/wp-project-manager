/**
 * Performs all of the following:
 *   - Create project folder.
 *   - Create vvv-hosts, vvv-nginx.conf, and vvv-init.sh.
 *   - When vvv-init.sh runs: update Node to 6.x, install Gulp & Bower globally.
 *   - Initialize the Git repo.
 *   - Scaffold out a new project and install dependencies.
 *   - Install and configure wp-dev-lib.
 *   - Install and configure Bedrock.
 *   - Install and configure WordPress.
 *   - Create a custom plugin and activate it.
 *   - Create parent and child themes and activate them.
 *   - Install theme dependencies and compile assets.
 *
 * Default settings can be configured in `project.yml` or `package.json`.
 * Default settings can be overridden via command arguments.
 *
 * If no `project.yml` file is found in the project folder, but one is found
 * in a parent folder, that one will be used instead. This can be useful for
 * setting a default configuration that will apply to multiple projects.
 *
 * You can also specify the path using the `--config` argument. For example:
 *     `node wp-manager --config=/path/to/config.yml`.
 *
 * @todo Add argument validation and sanitization.
 * @todo Add description, usage, example, and copyright messages.
 * @todo Switch to using `async` / `await` instead of `*Sync()` methods.
 * @todo Add `deps` module to handle npm / Bower / Composer dependencies.
 * @todo Add `install-deps` command to install project, plugin, and theme deps.
 * @todo Replace `yargs` with a CLI framework that supports sub-commands.
 */

import yargs from 'yargs';

global.__appPath = __dirname;

export default yargs.help()
	.completion()
	.command( require( './commands/config.display' ) )
	.command( require( './commands/config.create' ) )
	.command( require( './commands/deps.install' ) )
	.command( require( './commands/plugin.create-tests' ) )
	.command( require( './commands/plugin.create' ) )
	.command( require( './commands/project.create' ) )
	.command( require( './commands/theme.create-tests' ) )
	.command( require( './commands/theme.create' ) )
	.command( require( './commands/wp.install' ) )
	.argv;
