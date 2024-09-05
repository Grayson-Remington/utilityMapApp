import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const HomePage = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const navigate = useNavigate();

	return (
		<>
			<h1>Welcome</h1>
			<button onClick={() => navigate('/map')}>Map</button>
		</>
	);
};

export default HomePage;
