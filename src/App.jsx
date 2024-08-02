import React, { useRef, useEffect, useState } from 'react';
import MapComponent from './MapComponent';
import UnAuthMapComponent from './UnAuthMapComponent';
function App() {
	const [authenticated, setAuthenticated] = useState(false);

	const handleLoginSuccess = () => {
		setAuthenticated(true);
	};

	return (
		<>
			{authenticated ? (
				<MapComponent />
			) : (
				<UnAuthMapComponent onLoginSuccess={handleLoginSuccess} />
			)}
		</>
	);
}

export default App;
