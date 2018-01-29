<?php
/**
 * Minerva.hooks.php
 */

/**
 * Hook handlers for Minerva skin.
 *
 * Hook handler method names should be in the form of:
 *	on<HookName>()
 */
use MediaWiki\MediaWikiServices;

class MinervaHooks {
	/**
	 * ResourceLoaderGetLessVars hook handler
	 *
	 * Add the context-based less variables.
	 *
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ResourceLoaderGetLessVars
	 * @param array &$lessVars Variables already added
	 */
	public static function onResourceLoaderGetLessVars( &$lessVars ) {
		$config = MediaWikiServices::getInstance()->getConfigFactory()
			->makeConfig( 'minerva' );

		$lessVars['wgMinervaApplyKnownTemplateHacks'] = $config->get( 'MinervaApplyKnownTemplateHacks' );
	}

	/**
	 * Skin registration callback.
	 */
	public static function onRegistration() {
		// Set LESS importpath
		global $wgResourceLoaderLESSImportPaths;
		$wgResourceLoaderLESSImportPaths[] = dirname( __DIR__ ) . "/minerva.less/";
	}

	/**
	 * ResourceLoaderTestModules hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ResourceLoaderTestModules
	 *
	 * @param array &$testModules
	 * @param ResourceLoader &$resourceLoader
	 * @return bool
	 */
	public static function onResourceLoaderTestModules( array &$testModules,
		ResourceLoader &$resourceLoader
	) {
		$testModule = [
			'dependencies' => [
				'mobile.startup',
				'skins.minerva.notifications.badge'
			],
			'localBasePath' => dirname( __DIR__ ),
			'remoteSkinPath' => 'MinervaNeue',
			'targets' => [ 'mobile', 'desktop' ],
			'scripts' => [
				// additional scaffolding (minus initialisation scripts)
				'resources/skins.minerva.scripts/DownloadIcon.js',
				// test files
				'tests/qunit/skins.minerva.scripts/test_DownloadIcon.js',
				'tests/qunit/skins.minerva.notifications.badge/test_NotificationBadge.js'
			],
		];

		// Expose templates module
		$testModules['qunit']["tests.skins.minerva"] = $testModule;
	}

	/**
	 * Invocation of hook SpecialPageBeforeExecute
	 *
	 * We use this hook to ensure that login/account creation pages
	 * are redirected to HTTPS if they are not accessed via HTTPS and
	 * $wgSecureLogin == true - but only when using the
	 * mobile site.
	 *
	 * @param SpecialPage $special
	 * @param string $subpage
	 * @return bool
	 */
	public static function onSpecialPageBeforeExecute( SpecialPage $special, $subpage ) {
		$name = $special->getName();
		$out = $special->getOutput();
		$skin = $out->getSkin();
		$request = $special->getRequest();

		if ( $skin instanceof SkinMinerva ) {
			switch ( $name ) {
				case 'MobileMenu':
					$out->addModuleStyles( [
						'skins.minerva.mainMenu.icons',
						'skins.minerva.mainMenu.styles',
					] );
					$out->addModules( [
						'skins.minerva.mainMenu'
					] );
					break;
				case 'Userlogin':
				case 'CreateAccount':
					// FIXME: Note mobile.ajax.styles should not be necessary here.
					// It's used by the Captcha extension (see T162196)
					$out->addModuleStyles( [ 'mobile.ajax.styles' ] );
					// Add default warning message to Special:UserLogin and Special:UserCreate
					// if no warning message set.
					if (
						!$request->getVal( 'warning', null ) &&
						!$special->getUser()->isLoggedIn() &&
						!$request->wasPosted()
					) {
						$request->setVal( 'warning', 'mobile-frontend-generic-login-new' );
					}
					break;
			}
		}
	}

	/**
	 * BeforePageDisplayMobile hook handler.
	 *
	 * @param MobileContext $mobileContext
	 * @param Skin $skin
	 */
	public static function onRequestContextCreateSkinMobile(
		MobileContext $mobileContext, Skin $skin
	) {
		// setSkinOptions is not available
		if ( $skin instanceof SkinMinerva ) {
			$skin->setSkinOptions( [
				SkinMinerva::OPTIONS_MOBILE_BETA
					=> $mobileContext->isBetaGroupMember(),
				SkinMinerva::OPTION_CATEGORIES
					=> $mobileContext->getConfigVariable( 'MinervaShowCategoriesButton' ),
				SkinMinerva::OPTION_BACK_TO_TOP
					=> $mobileContext->getConfigVariable( 'MinervaEnableBackToTop' ),
				SkinMinerva::OPTION_TOGGLING => true,
				SkinMinerva::OPTION_MOBILE_OPTIONS => true,
			] );
		}
	}
}
