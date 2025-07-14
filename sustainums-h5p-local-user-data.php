<?php
/**
 * Plugin Name: Sustainums's Local User Data for H5P
 * Plugin URI: https://github.com/otacke/sustainums-local-user-data-for-h5p
 * Text Domain: sustainums-local-user-data-for-h5p
 * Description: Store H5P user data in local storage.
 * Version: 1.0.3
 * Author: Sustainum, Oliver Tacke (SNORDIAN)
 * Author URI: https://snordian.de
 * License: MIT
 *
 * @package sustainums-local-user-data-for-h5p
 */

namespace Sustainum\LocalUserDataForH5P;

// as suggested by the WordPress community.
defined( 'ABSPATH' ) || die( 'No script kiddies please!' );

if ( ! defined( 'SUSTAINUMSLOCALUSERDATAFORH5P_VERSION' ) ) {
	define( 'SUSTAINUMSLOCALUSERDATAFORH5P_VERSION', '1.0.3' );
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
		SUSTAINUMSLOCALUSERDATAFORH5P_VERSION,
		true
	);

	wp_enqueue_script(
		'shlud-sustainums-local-user-data-for-h5p',
		plugins_url( '/js/sustainums_local_user_data_for_h5p.js', __FILE__ ),
		array(),
		SUSTAINUMSLOCALUSERDATAFORH5P_VERSION,
		true
	);

	wp_enqueue_script(
		'shlud-local-storage-handler',
		plugins_url( '/js/local_storage_handler.js', __FILE__ ),
		array(),
		SUSTAINUMSLOCALUSERDATAFORH5P_VERSION,
		true
	);

	wp_enqueue_script(
		'shlud-h5p-holder',
		plugins_url( '/js/h5p_holder.js', __FILE__ ),
		array(),
		SUSTAINUMSLOCALUSERDATAFORH5P_VERSION,
		true
	);

	wp_localize_script(
		'shlud-main',
		'sustainumsLocalUserDataForH5P',
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
				'shlud-sustainums-local-user-data-for-h5p',
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

add_action( 'the_post', 'Sustainum\LocalUserDataForH5P\initialize' );
