/**
 * External dependencies
 */
import config from 'config';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import test from 'selenium-webdriver/testing';
import { WebDriverManager } from 'wp-e2e-webdriver';

/**
 * Internal dependencies
 */
import { PageMap, UserFlow } from '../../src/index';

chai.use( chaiAsPromised );

// Shortcut.
const assert = chai.assert;
const PAGE = PageMap.PAGE;

const userFlowArgs = {
	baseUrl: config.get( 'url' ),
	username: config.get( 'users.admin.username' ),
	password: config.get( 'users.admin.password' ),
};
const testTags = [
	{ name: 'Tag ' + new Date().getTime() + ' #1' },
	{ name: 'Tag ' + new Date().getTime() + ' #2' },
];

let manager;
let driver;
let user;

test.describe( 'WPAdminTagEdit', function() {
	// open browser
	test.before( function() {
		this.timeout( config.get( 'startBrowserTimeoutMs' ) );

		manager = new WebDriverManager( 'chrome', { baseUrl: config.get( 'url' ) } );
		driver = manager.getDriver();
	} );

	this.timeout( config.get( 'mochaTimeoutMs' ) );

	// create tags
	test.before( () => {
		user = new UserFlow( driver, userFlowArgs );

		testTags.forEach( tag => {
			user.createTag( tag );
		} );
	} );

	test.it( 'can edit tag', () => {
		testTags.forEach( ( tag, i ) => {
			const tagsList = user.open( PAGE.WP_ADMIN_TAGS );
			tagsList.search( tag.name );

			const editTag = tagsList.editTagWithName( tag.name );
			assert.eventually.ok( editTag.titleContains( 'Edit Tag' ) );

			// Also update the tag in testTags so it can be deleted
			// after test finishes.
			testTags[ i ].name = testTags[ i ].name + ' updated!';
			testTags[ i ].description = 'Updated description!';
			tag = testTags[ i ];

			editTag.setName( tag.name );
			editTag.setDescription( tag.description );
			editTag.update();

			assert.eventually.ok( editTag.hasNotice( 'Tag updated.' ) );
		} );
	} );

	// delete tags and quit browser
	test.after( () => {
		testTags.forEach( tag => {
			const tagsList = user.open( PAGE.WP_ADMIN_TAGS );
			tagsList.deleteTagWithName( tag.name );
		} );

		manager.quitBrowser();
	} );
} );
