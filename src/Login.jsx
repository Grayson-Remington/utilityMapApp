import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLoginSuccess }) => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	const handleSubmit = async (event) => {
		event.preventDefault();
		if (password == 'password') {
			onLoginSuccess();
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<input
				type='password'
				placeholder='Password'
				value={password}
				onChange={(e) => setPassword(e.target.value)}
			/>
			<button type='submit'>Login</button>
		</form>
	);
};

export default Login;
