'use strict';

import fs     from 'fs';
import YAML   from 'js-yaml';
import crypto from 'crypto';

class Helpers {

	/**
	 * Logs a message indicating that the current check passed.
	 *
	 * @since 0.1.0
	 *
	 * @param {string} message An optional message to display after the checkmark.
	 */
	logSuccess( message = '' ) {
		message = message.toString();
		console.log( `✔ ${ message }`.trim() );
	}

	/**
	 * Logs a message indicating that the current check failed.
	 *
	 * @since 0.1.0
	 *
	 * @param {string} message An optional message to display after the cross..
	 */
	logFailure( message = '' ) {
		message = message.toString();
		console.log( `✘ ${ message }`.trim() );
	}

	/**
	 * Checks if the specified file or directory exists.
	 *
	 * @since 0.1.0
	 *
	 * @param  {string} path The path to check.
	 * @param  {string} type Optional. A type to check the path against.
	 * @return {bool}        True if path exists and is `type`; false if not.
	 */
	pathExists( path, type = 'any' ) {
		try {
			const info = fs.statSync( path );

			switch ( type ) {
				case 'file' :
					return info.isFile();
				case 'folder' :
				case 'directory' :
					return info.isDirectory();
				default:
					return info ? true : false;
			}
		} catch ( error ) {
			return false;
		}
	}

	/**
	 * Checks if the specified file exists.
	 *
	 * @since 0.1.0
	 *
	 * @param  {string} path The path to the file to check.
	 * @return {bool}        True the file exists; false if not.
	 */
	fileExists( path ) {
		return this.pathExists( path, 'file' );
	}

	/**
	 * Checks if the specified directory exists.
	 *
	 * @since 0.1.0
	 *
	 * @param  {string} path The path to the directory to check.
	 * @return {bool}        True the directory exists; false if not.
	 */
	directoryExists( path ) {
		return this.pathExists( path, 'directory' );
	}

	/**
	 * Tries to load a YAML config file and parse it into JSON.
	 *
	 * @since 0.1.0
	 *
	 * @param  {string} filePath The path to the YAML file.
	 * @return {object}          The parsed results. If the file is blank or
	 *                           doesn't exist, we return an empty object.
	 */
	loadYAML( filePath ) {
		try {
			// Get file contents as JSON.
			const json = YAML.safeLoad( fs.readFileSync( filePath, 'utf8' ) );

			// Make sure the config isn't empty.
			if ( json ) {
				return json;
			}
		} catch ( error ) {
			console.log( `Error: ${error}` );
		}

		// If the file doesn't exist or is empty, return an empty object.
		return {};
	}

	/**
	 * Generates a random string in hexadecimal format.
	 *
	 * @since 0.1.0
	 *
	 * @param  {int}    length  The number of characters to include in the string.
	 * @param  {string} format  The string format to use (hex, base64, etc).
	 * @return {string}         The randomly generated string.
	 */
	randomString( length, format = 'hex' ) {
		try {

			let numBytes;

			// Adjust number of bytes based on desired string format.
			if ( 'hex' === format ) {
				// 1 byte = 2 hex characters.
				numBytes = Math.ceil( length / 2 );
			} else if ( 'base64' === format ) {
				// 1 byte = 4/3 base64 characters.
				numBytes = Math.ceil( length / ( 4 / 3 ) );
			}

			return crypto
				.randomBytes( numBytes )
				.toString( format )
				.slice( 0, length );

		} catch ( error ) {
			console.log( error );
			return '';
		}
	}
}

export default new Helpers();
