import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const HomePage = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const navigate = useNavigate();

	return (
		<>
			<div className='homepage-container'>
				<div className='homepage-title'>Dry Utilities</div>
				<img
					className='utility_pole_img'
					src='utility_pole.jpg'
				></img>
				<button
					className='map-button'
					onClick={() => navigate('/map')}
				>
					Map
				</button>
			</div>
		</>
	);
};

export default HomePage;
