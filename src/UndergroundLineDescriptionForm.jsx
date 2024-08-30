import React, { useEffect, useState } from 'react';
import './UndergroundLineDescriptionForm.css';
const UndergroundLineDescriptionForm = ({ onSubmit, onClose, graphic }) => {
	console.log(graphic);
	const [undergroundLineDescription, setUndergroundLineDescription] =
		useState({
			utilityType: '',
			concreteEncased: '',
			lateral: '',
			utilityConduits: [
				{
					utilityOwner: '',
					utilityConduits: '',
					utilityWires: '',
				},
			],
		});

	useEffect(() => {
		if (graphic.attributes) {
			console.log('Graphic received:', graphic); // Log graphic to verify
			setUndergroundLineDescription({
				utilityType: graphic.attributes.utilityType || '',
				concreteEncased: graphic.attributes.concreteEncased || '',
				lateral: graphic.attributes.lateral || '',
				utilityConduits:
					typeof graphic.attributes.utilityConduits === 'string'
						? JSON.parse(graphic.attributes.utilityConduits)
						: [],
			});
		}
	}, [graphic]);

	const handleChange = (event) => {
		const { name, value, checked } = event.target;
		if (name.startsWith('utilityConduits')) {
			const [_, index, key] = name.split('.');
			setUndergroundLineDescription((prevUndergroundLineDescription) => {
				const newUtilityConduits = [
					...prevUndergroundLineDescription.utilityConduits,
				];
				newUtilityConduits[index] = {
					...newUtilityConduits[index],
					[key]: value,
				};
				return {
					...prevUndergroundLineDescription,

					utilityConduits: newUtilityConduits,
				};
			});
		} else if (name.startsWith('lateral')) {
			console.log(checked);
			setUndergroundLineDescription((prevUndergroundLineDescription) => ({
				...prevUndergroundLineDescription,
				[name]: checked ? 'Yes' : 'No',
			}));
		} else if (name.startsWith('concreteEncased')) {
			console.log(checked);
			setUndergroundLineDescription((prevUndergroundLineDescription) => ({
				...prevUndergroundLineDescription,
				[name]: checked ? 'Yes' : 'No',
			}));
		} else {
			setUndergroundLineDescription((prevUndergroundLineDescription) => ({
				...prevUndergroundLineDescription,
				[name]: value,
			}));
		}
	};
	const handleAddConduit = () => {
		setUndergroundLineDescription((prevUndergroundLineDescription) => ({
			...prevUndergroundLineDescription,
			utilityConduits: [
				...prevUndergroundLineDescription.utilityConduits,
				{ utilityOwner: '', utilityConduits: '', utilityWires: '' },
			],
		}));
	};

	const handleDeleteConduit = (index) => {
		setUndergroundLineDescription((prevUndergroundLineDescription) => {
			// Create a copy of the current utilityConduits array
			const newConduits = [
				...prevUndergroundLineDescription.utilityConduits,
			];
			// Remove the conduit at the specified index
			newConduits.splice(index, 1);
			// Return the new state with the updated utilityConduits array
			return {
				...prevUndergroundLineDescription,
				utilityConduits: newConduits,
			};
		});
	};
	const handleSubmit = (event) => {
		event.preventDefault();

		// Create a new undergroundLineDescription object
		const updatedUndergroundLineDescription = {
			...undergroundLineDescription, // Spread existing properties
			utilityConduits: JSON.stringify(
				undergroundLineDescription.utilityConduits
			), // Update utilityConduits
		};

		// Call onSubmit with the updated object
		onSubmit(updatedUndergroundLineDescription);
	};

	return (
		<div className='modal-overlay'>
			<div className='modal-content'>
				<form
					className='modal-form'
					onSubmit={handleSubmit}
				>
					<div className='form-container'>
						{/* Radio buttons for utility type */}

						{/* Pole information */}
						<h3>Pole Information</h3>
						<div className='utility-options'>
							<label htmlFor='utilityType'>Utility Type:</label>
							<select
								name='utilityType'
								value={undergroundLineDescription.utilityType}
								onChange={handleChange}
							>
								<option value='Telco'>Telco</option>
								<option value='City Power'>City Power</option>
								<option value='Dom Power'>Dom Power</option>
								<option value='Dom Power + City Power'>
									Dom Power + City Power
								</option>
								<option value='Dom Power + Telco'>
									Dom Power + Telco
								</option>

								<option value='City Power + Telco'>
									City Power + Telco
								</option>
								<option value='Dom Power + City Power + Telco'>
									Dom Power + City Power + Telco
								</option>
							</select>
						</div>
						<label>
							<input
								type='checkbox'
								name='concreteEncased'
								checked={
									undergroundLineDescription.concreteEncased ===
									'Yes'
								}
								onChange={handleChange}
							/>
							Concrete Encased
						</label>
						<label>
							<input
								type='checkbox'
								name='lateral'
								checked={
									undergroundLineDescription.lateral === 'Yes'
								}
								onChange={handleChange}
							/>
							Lateral
						</label>
						{/* Utilities - conditionally rendered */}

						<h3>Utilities</h3>
						{undergroundLineDescription.utilityConduits.map(
							(conduit, index) => (
								<>
									<div
										className='input-row'
										key={index}
									>
										<div
											style={{
												textDecoration: 'underline',
											}}
										>
											{index + 1}
										</div>
										<div className='input-field'>
											<label>Utility Owner</label>
											<input
												type='text'
												name={`utilityConduits.${index}.utilityOwner`}
												value={conduit.utilityOwner}
												onChange={handleChange}
											/>
										</div>
										<div className='input-field'>
											<label>Conduits</label>
											<input
												type='text'
												name={`utilityConduits.${index}.utilityConduits`}
												value={conduit.utilityConduits}
												onChange={handleChange}
											/>
										</div>
										<div className='input-field'>
											<label>Wires</label>
											<input
												type='text'
												name={`utilityConduits.${index}.utilityWires`}
												value={conduit.utilityWires}
												onChange={handleChange}
											/>
										</div>
										<button
											className='esri-icon-trash'
											style={{ height: '30px' }}
											onClick={() =>
												handleDeleteConduit(index)
											}
										></button>
									</div>
								</>
							)
						)}
						<button
							style={{ width: '100%' }}
							type='button'
							onClick={handleAddConduit}
						>
							Add Utility Conduit
						</button>

						{/* Form buttons */}
						<div className='modal-buttons'>
							<button type='submit'>Submit</button>
							<button
								type='button'
								onClick={onClose}
							>
								Cancel
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
};

export default UndergroundLineDescriptionForm;
