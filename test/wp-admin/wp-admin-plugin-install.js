/**
 * External dependencies
 */
import config from 'config';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import test from 'selenium-webdriver/testing';
import { WebDriverManager, WebDriverHelper as helper } from 'wp-e2e-webdriver';

/**
 * Internal dependencies
 */
import { PageMap, WPLogin, WPAdminPlugins, WPAdminPluginInstall } from '../../src/index';

chai.use( chaiAsPromised );

// Shortcut.
const assert = chai.assert;
const PAGE = PageMap.PAGE;
const getPageUrl = PageMap.getPageUrl;

let manager;
let driver;
let page;

test.describe( 'WPAdminPluginInstall', function() {
	// open browser
	test.before( function() {
		this.timeout( config.get( 'startBrowserTimeoutMs' ) );

		manager = new WebDriverManager( 'chrome' );
		driver = manager.getDriver();
	} );

	this.timeout( config.get( 'mochaTimeoutMs' ) );

	// login and goes to install plugin page
	test.before( () => {
		helper.clearCookiesAndDeleteLocalStorage( driver );

		const wpLoginArgs = { url: getPageUrl( config.get( 'url' ), PAGE.WP_LOGIN ) };
		const wpLogin = new WPLogin( driver, wpLoginArgs );
		wpLogin.login(
			config.get( 'users.admin.username' ),
			config.get( 'users.admin.password' )
		);

		const pageArgs = { url: getPageUrl( config.get( 'url' ), PAGE.WP_ADMIN_NEW_PLUGIN ) };
		page = new WPAdminPluginInstall( driver, pageArgs );
	} );

	test.it( 'can search plugin "woocommerce"', () => {
		const pluginCard = page.search( 'woocommerce' );
		return assert.eventually.equal(
			pluginCard.displayed(),
			true
		);
	} );

	test.it( 'can install plugin "woocommerce"', () => {
		return assert.eventually.equal(
			page.install( 'woocommerce' ),
			true
		);
	} );

	test.it( 'can activate new installed plugin "woocommerce"', () => {
		return assert.eventually.equal(
			page.activate( 'woocommerce' ),
			true
		);
	} );

	// deactivate and delete plugin "woocommerce" then quit browser
	test.after( () => {
		const pageArgs = { url: getPageUrl( config.get( 'url' ), PAGE.WP_ADMIN_PLUGINS ) };
		const pagePlugins = new WPAdminPlugins( driver, pageArgs );

		pagePlugins.deactivate( 'woocommerce' );
		pagePlugins.delete( 'woocommerce' );

		manager.quitBrowser();
	} );
} );
