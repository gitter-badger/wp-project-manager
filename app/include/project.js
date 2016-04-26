'use strict';

import _        from 'lodash';
import fs       from 'fs-extra';
import path     from 'path';
import yargs    from 'yargs';
import upsearch from 'utils-upsearch';

import helpers  from './helpers';

if ( ! _.upperSnakeCase ) {
	_.upperSnakeCase = ( string ) => (
		_.startCase( string ).replace( / /g, '_' )
	);
}

/**
 * Project config settings and helper methods.
 */
class Project {

	/**
	 * Gets project paths.
	 *
	 * @since 0.3.0
	 *
	 * @return {object}
	 */
	static get paths() {

		if ( ! this._paths ) {

			const rootPath = path.join( __appPath, '..' );

			this._paths = {
				app:       __appPath,
				root:      rootPath,
				cwd:       process.cwd(),
				project:   process.cwd(),
				includes:  path.join( __appPath, 'include' ),
				assets:    path.join( rootPath, 'project-files', 'assets' ),
				templates: path.join( rootPath, 'project-files', 'templates' ),
				plugins:   path.join( rootPath, 'project-files', 'plugins' ),
				test:      path.join( rootPath, 'test' ),
				config:    upsearch.sync( 'project.yml' ),
			};

			if ( this._paths.root === this._paths.project ) {
				this._paths.project = path.join( this._paths.root, '_test-project' );
			}

			if ( ! this._paths.config ) {
				this._paths.config = path.join( this._paths.project, 'project.yml' );
			}
		}

		return this._paths;
	}

	/**
	 * Gets config.
	 *
	 * @since 0.1.0
	 *
	 * @return {object}
	 */
	static get config() {

		if ( ! this._config ) {
			this._config = this.loadConfig();
		}

		return this._config;
	}

	/**
	 * Sets config.
	 *
	 * @since 0.1.0
	 *
	 * @param {object} config The new config settings.
	 */
	static set config( config ) {
		this._config = this.parseConfig( config );
	}

	/**
	 * Gets default config settings.
	 *
	 * @since 0.1.0
	 *
	 * @return {object}
	 */
	static get defaultConfig() {
		return {
			vvv: true,
			debug: false,
			token: '',
			project: {
				title: '',
				slug:  '',
				url:   '',
			},
			repo: {
				create: false,
				url:    '',
			},
			plugin: {
				scaffold: true,
				name:     '',
				slug:     '',
			},
			theme: {
				scaffold: true,
				name:     '',
				slug:     '',
			},
			admin: {
				user:  'admin',
				pass:  'admin_password',
				email: 'admin@localhost.dev',
			},
			db: {
				name:      '',
				user:      'wp',
				pass:      'wp',
				host:      'localhost',
				root_user: 'root',
				root_pass: 'root',
				prefix:    '',
			},
			secret: {
				auth_key:         '',
				auth_salt:        '',
				secure_auth_key:  '',
				secure_auth_salt: '',
				logged_in_key:    '',
				logged_in_salt:   '',
				nonce_key:        '',
				nonce_salt:       '',
			},
		};
	}

	/**
	 * Loads and parses a YAML config file. If no file is passed, or the
	 * specified file doesn't exist or is empty, the default config file path
	 * is used.
	 *
	 * @since 0.1.0
	 *
	 * @param  {string} file The path to the config file.
	 * @return {object}      The resulting config object.
	 */
	static loadConfig( file = null ) {

		let config;

		// Try to load the config file if one was passed and it exists.
		if ( file && helpers.fileExists( file ) ) {
			config = helpers.loadYAML( file );
		}

		// If we don't have a config object (or the config object is empty)
		// fall back to the default config file.
		if ( _.isEmpty( config ) && helpers.fileExists( this.paths.config ) ) {
			config = helpers.loadYAML( this.paths.config );
		}

		config = _.merge( config, yargs.argv );

		return this.parseConfig( config );
	}

	/**
	 * Parses the project config. Missing values are filled in from the default
	 * config object.
	 *
	 * @since 0.1.0
	 *
	 * @param  {object} config The config object to parse.
	 * @return {object}        The parsed config object.
	 */
	static parseConfig( config ) {

		// Merge config with defaults.
		config = _.pickBy(
			_.defaultsDeep( config, this.defaultConfig ),
			( value, key ) => _.has( this.defaultConfig, key )
		);

		// Fill in any dynamic config values that aren't set.
		if ( ! config.project.title && config.project.slug ) {
			config.project.title = _.startCase( config.project.slug );
		}

		if ( ! config.project.slug && config.project.title ) {
			config.project.slug = _.kebabCase( config.project.title );
		}

		if ( ! config.project.url ) {
			config.project.url = `${ config.project.slug }.dev`;
		}

		if ( ! config.plugin.name ) {
			if ( config.plugin.slug ) {
				config.plugin.name = _.startCase( config.plugin.slug );
			} else {
				config.plugin.name = config.project.title;
			}
		}

		if ( ! config.plugin.slug ) {
			config.plugin.slug = _.kebabCase( config.plugin.name );
		}

		if ( ! config.theme.name ) {
			if ( config.theme.slug ) {
				config.theme.name = _.startCase( config.theme.slug );
			} else {
				config.theme.name = config.project.title;
			}
		}

		if ( ! config.theme.slug ) {
			config.theme.slug = _.kebabCase( config.theme.name );
		}

		if ( ! config.db.name ) {
			config.db.name = config.project.slug;
		}

		if ( ! config.db.prefix ) {
			config.db.prefix = helpers.randomString( 8 ) + '_';
		}

		[ 'auth', 'secureAuth', 'loggedIn', 'nonce' ].forEach(( type ) => {
			if ( ! config.secret[ `${type}Key` ] ) {
				config.secret[ `${type}Key` ] = helpers.randomString( 64, 'base64' );
			}
			if ( ! config.secret[ `${type}Salt` ] ) {
				config.secret[ `${type}Salt` ] = helpers.randomString( 64, 'base64' );
			}
		});

		// Set internal config values.
		config.project.folder = path.basename( this.paths.project );

		config.plugin.id      = _.snakeCase( config.plugin.name );
		config.plugin.class   = _.upperSnakeCase( config.plugin.name );
		config.plugin.package = _.upperSnakeCase( config.plugin.name );

		config.theme.id       = _.snakeCase( config.theme.name );
		config.theme.class    = _.upperSnakeCase( config.theme.name );
		config.theme.package  = _.upperSnakeCase( config.theme.name );

		// Return the updated config settings.
		return config;
	}

	/**
	 * Creates a new `project.yml` file with the default settings.
	 *
	 * @since 0.3.0
	 *
	 * @param {bool} [force] If true and a config file already exists, it will
	 *                       be deleted and a new file will be created.
	 */
	static createConfigFile( force = false ) {

		if ( force && helpers.fileExists( this.paths.config ) ) {
			fs.removeSync( this.paths.config );
		}

		if ( ! helpers.fileExists( this.paths.config ) ) {
			helpers.writeYAML( this.paths.config, this.defaultConfig );
		}
	}
}

export default Project;
