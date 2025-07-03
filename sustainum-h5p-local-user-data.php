<?php
/**
 * Plugin Name: Sustainum H5P Local User Data
 * Plugin URI: https://github.com/otacke/sustainum-h5p-local-user-data
 * Text Domain: sustainum-h5p-local-user-data
 * Description: Store H5P user data in local storage.
 * Version: 1.0.2
 * Author: Sustainum, Oliver Tacke (SNORDIAN)
 * Author URI: https://snordian.de
 * License: MIT
 *
 * @package sustainum-h5p-local-user-data
 */

namespace Sustainum\H5PLocalUserData;

// as suggested by the WordPress community.
defined( 'ABSPATH' ) || die( 'No script kiddies please!' );

if ( ! defined( 'SUSTAINUMH5PLOCALUSERDATA_VERSION' ) ) {
	define( 'SUSTAINUMH5PLOCALUSERDATA_VERSION', '1.0.2' );
}

/**
 * Initialize the resize pulse script.
 *
 * @since 1.0
 */
function initialize() {
	if ( is_admin() ) {
		return;
	}

	// WordPress 6.5+ (04/2024) allows to use wp_enqueue_script_module, but we try to still support some older versions.

	wp_enqueue_script(
		'shlud-main',
		plugins_url( '/js/main.js', __FILE__ ),
		array(),
		SUSTAINUMH5PLOCALUSERDATA_VERSION,
		true
	);

	wp_enqueue_script(
		'shlud-sustainum-h5p-local-user-data',
		plugins_url( '/js/sustainum_h5p_local_user_data.js', __FILE__ ),
		array(),
		SUSTAINUMH5PLOCALUSERDATA_VERSION,
		true
	);

	wp_enqueue_script(
		'shlud-local-storage-handler',
		plugins_url( '/js/local_storage_handler.js', __FILE__ ),
		array(),
		SUSTAINUMH5PLOCALUSERDATA_VERSION,
		true
	);

	wp_enqueue_script(
		'shlud-h5p-holder',
		plugins_url( '/js/h5p_holder.js', __FILE__ ),
		array(),
		SUSTAINUMH5PLOCALUSERDATA_VERSION,
		true
	);

	wp_localize_script(
		'shlud-main',
		'sustainumH5PLocalUserData',
		array(
			'wpBlogId'       => get_current_blog_id(),
			'isUserLoggedIn' => is_user_logged_in(),
		)
	);

	// Ensure the script is treated as a module.
	add_filter(
		'script_loader_tag',
		function ( $tag, $handle ) {
			$module_scripts = array(
				'shlud-main',
				'shlud-sustainum-h5p-local-user-data',
				'shlud-local-storage-handler',
				'shlud-h5p-holder',
			);

			if ( in_array( $handle, $module_scripts, true ) ) {
				if ( strpos( $tag, 'type=' ) === false ) {
					$tag = str_replace( ' src', ' type="module" src', $tag );
				} else {
					// Workaround for outdated type that is not required since HTML5/2014.
					$tag = str_replace( 'type="text/javascript"', 'type="module"', $tag );
				}
				return $tag;
			}
			return $tag;
		},
		10,
		3
	);
}

add_action( 'the_post', 'Sustainum\H5PLocalUserData\initialize' );
