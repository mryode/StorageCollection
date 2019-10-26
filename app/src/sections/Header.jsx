import React from 'react';

import {
	AppBar,
	Toolbar,
	Typography,
	Button,
	IconButton,
} from '@material-ui/core';
import { AccountCircle } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

const useStyle = makeStyles(theme => ({
	root: {
		flexGrow: 1,
	},
	appbar: {
		background: '#574f7d',
	},
	title: {
		flexGrow: 1,
	},
}));

function Header({ title, isLoggedIn, onLoginClick }) {
	const classes = useStyle();
	return (
		<header className={classes.root}>
			<AppBar position="sticky" className={classes.appbar}>
				<Toolbar>
					<Typography variant="h6" className={classes.title}>
						{title}
					</Typography>
					{isLoggedIn ? (
						<IconButton color="inherit">
							<AccountCircle />
						</IconButton>
					) : (
						<Button color="inherit" onClick={onLoginClick}>
							Login
						</Button>
					)}
				</Toolbar>
			</AppBar>
		</header>
	);
}

export default Header;
