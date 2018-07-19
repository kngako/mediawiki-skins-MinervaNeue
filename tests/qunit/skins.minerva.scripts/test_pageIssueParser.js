( function ( M ) {
	var pageIssueParser = M.require( 'skins.minerva.scripts/pageIssueParser' );

	QUnit.module( 'pageIssueParser' );

	/**
	 * @param {string} className
	 * @return {Element}
	 */
	function newBox( className ) {
		var box = document.createElement( 'div' );
		box.className = className;
		return box;
	}

	QUnit.test( 'parseSeverity', function ( assert ) {
		var tests = [
			[ '', 'DEFAULT', 'empty' ],
			[ 'foo', 'DEFAULT', 'unknown' ],
			[ 'ambox-style', 'LOW', 'style' ],
			[ 'ambox-content', 'MEDIUM', 'content' ],
			[ 'ambox-speedy', 'HIGH', 'speedy' ],
			[ 'ambox-delete', 'HIGH', 'delete' ],
			// Move has an "unknown" severity and falls into DEFAULT.
			[ 'ambox-move', 'DEFAULT', 'move' ],
			// Point of view uses ambox-content to identify correct severity.
			[ 'ambox-content ambox-POV', 'MEDIUM', 'point of view' ]
			// Mixed severities such as 'ambox-style ambox-content' are not prioritized.
		];
		tests.forEach( function ( params, i ) {
			var
				className = params[0],
				expect = params[1],
				test = params[2],
				box = newBox( className );
			assert.strictEqual(
				pageIssueParser.test.parseSeverity( box ),
				expect,
				'Result should be the correct severity; case ' + i + ' failed: ' + test + '.'
			);
		} );
	} );

	QUnit.test( 'parseType', function ( assert ) {
		var tests = [
			[ '', 'DEFAULT', 'issue-generic', 'empty' ],
			[ 'foo', 'DEFAULT', 'issue-generic', 'unknown' ],
			[ 'ambox-move', 'DEFAULT', 'issue-type-move', 'move' ],
			[ 'ambox-POV', 'MEDIUM', 'issue-type-point-of-view', 'point of view' ],
			[ '', 'DEFAULT', 'issue-generic', 'Default severity' ],
			[ '', 'LOW', 'issue-severity-low', 'Low severity' ],
			[ '', 'MEDIUM', 'issue-severity-medium', 'Medium severity' ],
			[ '', 'HIGH', 'issue-generic', 'HIGH severity' ]
		];
		tests.forEach( function ( params, i ) {
			var
				className = params[0],
				severity = params[1],
				expect = {
					name: params[2],
					severity: severity
				},
				test = params[3],
				box = newBox( className );
			assert.propEqual(
				pageIssueParser.test.parseType( box, severity ),
				expect,
				'Result should be the correct icon type; case ' + i + ' failed: ' + test + '.'
			);
		} );
	} );

	QUnit.test( 'iconName', function ( assert ) {
		var tests = [
			[ '', 'DEFAULT', 'issue-generic-defaultColor' ],
			[ '', 'LOW', 'issue-severity-low-lowColor' ],
			[ '', 'MEDIUM', 'issue-severity-medium-mediumColor' ],
			[ '', 'HIGH', 'issue-generic-highColor' ],
			[ 'ambox-move', 'DEFAULT', 'issue-type-move-defaultColor' ],
			[ 'ambox-POV', 'MEDIUM', 'issue-type-point-of-view-mediumColor' ],
			// ResourceLoader only supplies color variants for the generic type. Ensure impossible
			// combinations are forbidden.
			[ 'ambox-style ambox-POV', 'LOW', 'issue-type-point-of-view-mediumColor' ],
			[ 'ambox-content ambox-move', 'MEDIUM', 'issue-type-move-defaultColor' ]
		];
		tests.forEach( function ( params, i ) {
			var
				className = params[0],
				severity = params[1],
				expect = params[2],
				box = newBox( className );
			assert.strictEqual(
				pageIssueParser.iconName( box, severity ),
				expect,
				'Result should be the correct ResourceLoader icon name; case ' + i + ' failed: ' + severity + '.'
			);
		} );
	} );

	QUnit.test( 'maxSeverity', function ( assert ) {
		var tests = [
			[ [], 'DEFAULT' ],
			[ [ 'DEFAULT' ], 'DEFAULT' ],
			[ [ 'DEFAULT', 'LOW' ], 'LOW' ],
			[ [ 'DEFAULT', 'LOW', 'MEDIUM' ], 'MEDIUM' ],
			[ [ 'DEFAULT', 'LOW', 'MEDIUM', 'HIGH' ], 'HIGH' ],
			[ [ 'HIGH', 'DEFAULT', 'LOW', 'MEDIUM' ], 'HIGH' ],
			[ [ 'DEFAULT', 'HIGH', 'LOW', 'MEDIUM' ], 'HIGH' ]
		];
		tests.forEach( function ( params, i ) {
			var
				severities = params[0],
				expect = params[1];
			assert.strictEqual(
				pageIssueParser.maxSeverity( severities.map( function ( severity ) {
					return { severity: severity };
				} ) ),
				expect,
				'Result should be the highest severity in the array; case ' + i + ' failed.'
			);
		} );
	} );

}( mw.mobileFrontend ) );
