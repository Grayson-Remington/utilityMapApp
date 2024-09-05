import React, { useRef, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import MapComponent from './MapComponent';
import UnAuthMapComponent from './UnAuthMapComponent';
function App() {
	const [authenticated, setAuthenticated] = useState(false);

	const handleLoginSuccess = () => {
		setAuthenticated(true);
	};

	return (
		<Router>
			<Routes>
				<Route
					path='/'
					element={
						<UnAuthMapComponent
							onLoginSuccess={handleLoginSuccess}
						/>
					}
				/>
				<Route
					path='/edit-map'
					element={<MapComponent />}
				/>
			</Routes>
		</Router>
	);
}

export default App;
