import React, { useState, useEffect } from 'react';

import queryString from 'query-string';

import Header from './sections/Header';

/**
 * Renders all app sections
 */
function App() {
	const [token, setToken] = useState('');

	const handleLogin = () => (window.location = 'http://localhost:5000/dropbox');

	useEffect(() => {
		setToken(queryString.parse(window.location.search).access_token);
	}, []);

	return (
		<div className="App">
			<Header
				title={'Storage Collection'}
				isLoggedIn={Boolean(token)}
				onLoginClick={handleLogin}
			/>
		</div>
	);
}

export default App;
