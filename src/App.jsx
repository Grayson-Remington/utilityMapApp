import React, { useRef, useEffect, useState } from 'react';
import NavBar from './NavBar'; // Your navigation bar component
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import MapComponent from './MapComponent';
import UnAuthMapComponent from './UnAuthMapComponent';
import { Outlet } from 'react-router-dom'; // Outlet for nested routes

function Layout() {
	return (
		<div
			style={{
				height: '100%',
				minHeight: '100%',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<NavBar /> {/* This will take up as much height as needed */}
			<Outlet />{' '}
			{/* This will take up the remaining height and prevent overflow */}
		</div>
	);
}
function App() {
	const [authenticated, setAuthenticated] = useState(false);

	const handleLoginSuccess = () => {
		setAuthenticated(true);
	};

	return (
		<Router>
			<Routes>
				{/* Apply the Layout for all routes */}
				<Route element={<Layout />}>
					<Route
						path='/'
						element={<HomePage />}
					/>
					<Route
						path='/map'
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
				</Route>
			</Routes>
		</Router>
	);
}

export default App;
