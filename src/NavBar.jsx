import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { LuMail } from 'react-icons/lu';

const NavBar = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const navigate = useNavigate();

	return (
		<>
			<nav className='fixed w-full bg-green-700 h-20 min-h-20 flex justify-between px-4 md:px-24 lg:px-44 items-center text-white z-50'>
				<div className='flex items-center gap-4'>
					<img
						className='w-10 h-10'
						src='/electricity.png'
						alt=''
					/>
					<h1 className='text-3xl'>Dry Utilities</h1>
				</div>

				<div className='flex gap-4'>
					<button
						className='text-2xl hover:scale-110'
						onClick={() => navigate('/')}
					>
						Home
					</button>
					<button
						className='text-2xl hover:scale-110'
						onClick={() => navigate('/map')}
					>
						Map
					</button>
				</div>
			</nav>
		</>
	);
};

export default NavBar;
