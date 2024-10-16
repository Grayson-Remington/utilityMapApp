import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { GrNotes } from 'react-icons/gr';
import { LuHardHat } from 'react-icons/lu';
import { FaDrawPolygon } from 'react-icons/fa';
const HomePage = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const navigate = useNavigate();

	return (
		<div className='relative h-full w-full px-4 lg:px-48 pt-24'>
			<div className=' relative h-max w-full flex flex-col items-center gap-20 py-8'>
				<div className='relative w-full flex flex-col gap-4 items-center'>
					<h1 className='mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl lg:text-5xl text-center'>
						What are Dry Utilities?
					</h1>
					<div className='flex flex-col md:flex-row gap-4 items-center max-w-[550px] text-xl'>
						<img
							className='shadow-2xl rounded-lg w-64'
							src='/utility_pole.jpg'
							alt=''
						/>
						<p className='text-wrap tracking-tighter text-left'>
							To put it frankly, a mess... but it doesn't have to
							be! With the right tools, you can navigate this wild
							west industry with ease.
						</p>
					</div>

					<div className='flex flex-col md:flex-row gap-8'>
						<div className='relative w-56 group'>
							<img
								className='w-full h-full grayscale'
								src='/power2.jpg'
								alt='Power'
							/>
							<div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 hover:cursor-default'>
								<span className='text-white text-xl opacity-100 transition-opacity duration-150 group-hover:opacity-0 absolute'>
									Power
								</span>
								<span className='text-white text-xl opacity-0 transition-opacity duration-150 group-hover:opacity-100'>
									<li>Primary Power</li>
									<li>City Power</li>
									<li>Streetlights</li>
								</span>
							</div>
						</div>

						<div className='relative w-56 group'>
							<img
								className='w-full h-full grayscale'
								src='/gas.jpg'
								alt='Gas'
							/>
							<div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 hover:cursor-default'>
								<span className='text-white text-xl opacity-100 transition-opacity duration-150 group-hover:opacity-0 absolute'>
									Gas
								</span>
								<span className='text-white text-xl opacity-0 transition-opacity duration-150 group-hover:opacity-100'>
									<li>Gas Mains</li>
									<li>Gas Laterals</li>
								</span>
							</div>
						</div>

						<div className='relative w-56 group'>
							<img
								className='w-full h-full grayscale'
								src='/telecom2.jpg'
								alt='Telecom'
							/>
							<div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 hover:cursor-default'>
								<span className='text-white text-xl opacity-100 transition-opacity duration-150 group-hover:opacity-0 absolute'>
									Telecom
								</span>
								<span className='text-white text-xl opacity-0 transition-opacity duration-150 group-hover:opacity-100'>
									<li>Fiber Optic</li>
									<li>Telephone</li>
								</span>
							</div>
						</div>
					</div>
				</div>
				<div className='w-full flex flex-col gap-4 items-center'>
					<h1 className='mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl lg:text-5xl text-center'>
						What are Dry Utility Services?
					</h1>
					<div className='flex flex-col md:flex-row gap-4 lg:gap-8 w-min md:w-full justify-between px-8 items-center max-w-[1800px] '>
						<div className='flex items-center justify-end  w-full gap-4'>
							<div>
								<h1 className='text-2xl font-semibold text-gray-900 text-right'>
									Coordination
								</h1>
								<p className='tracking-tighter text-right'>
									Organizing and documenting to plan ahead
								</p>
							</div>

							<GrNotes className='w-16 h-16 min-h-16 min-w-16 text-gray-900' />
						</div>
						<div className='flex items-center justify-end  w-full gap-4'>
							<div>
								<h1 className='text-2xl font-semibold text-gray-900 text-right'>
									Design
								</h1>
								<p className='tracking-tighter text-right'>
									Planning ahead to ensure smooth construction
								</p>
							</div>

							<FaDrawPolygon className='w-16 h-16 min-h-16 min-w-16 text-gray-900' />
						</div>

						<div className='flex items-center justify-end w-full gap-4  '>
							<div>
								<h1 className='text-2xl font-semibold text-gray-900 text-right'>
									Const. Admin
								</h1>
								<p className='tracking-tighter text-right'>
									Monitoring install for quality that lasts
								</p>
							</div>

							<LuHardHat className='w-16 h-16 min-h-16 min-w-16 text-gray-900' />
						</div>
					</div>
				</div>
				<div className='w-full flex flex-col gap-4 items-center'>
					<h1 className='mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl lg:text-5xl text-center'>
						What Developments Benefit from Dry Utility Coordination?
					</h1>
					<div className='border rounded-lg border-slate-700 px-8 py-4 max-w-[500px] w-120 grid grid-cols-2'>
						<div className='flex justify-center'>
							<ul className='list-disc gap-2'>
								<li className=''>Urban*</li>
								<li>Mixed Use</li>
								<li>Zero-lot Line</li>
								<li>Residential</li>
							</ul>
						</div>
						<div className='flex justify-center'>
							<ul className='list-disc gap-2'>
								<li>Education</li>
								<li>Roadway Improvements</li>
								<li>Recreational</li>
								<li>Subdivisions</li>
							</ul>
						</div>

						<div className='col-span-2 flex justify-center pt-2'>
							<ul className='list-disc '>
								<li className='font-bold italic'>
									Every Development!
								</li>
							</ul>
						</div>
					</div>
					<div className='w-full flex flex-col lg:flex-row justify-center items-center gap-4 text-xl font-semibold text-gray-900 text-center'>
						<p className='text-wrap max-w-64'>
							Check out the Map and see if your area has been
							surveyed!
						</p>

						<img
							onClick={() => navigate('/map')}
							className='w-48 rounded-lg hover:scale-110 transition-transform duration-400 hover:cursor-pointer border-2 border-slate-700'
							src='map2.PNG'
							alt=''
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default HomePage;
