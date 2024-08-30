import React, { useEffect, useState } from 'react';
import './PointDescriptionForm.css';

const PointDescriptionForm = ({ onSubmit, onClose, graphic }) => {
	console.log('graphic submitted', graphic);
	const [pointDescription, setPointDescription] = useState({
		utilityType: '',
		poleNumber: '',
		poleOwner: '',
		domPowerPhase: '',
		domPowerEquipment: '',
		domPowerLaterals: '',
		cityPowerPhase: '',
		cityPowerEquipment: '',
		cityPowerLaterals: '',
		domStreetlight: '',
		utilityAttachments: [],
	});

	useEffect(() => {
		if (graphic.attributes) {
			console.log('Graphic received:', graphic); // Log graphic to verify
			setPointDescription({
				utilityType: graphic.attributes.utilityType || '',
				poleNumber: graphic.attributes.poleNumber || '',
				poleOwner: graphic.attributes.poleOwner || '',
				domPowerPhase: graphic.attributes.domPowerPhase || '',
				domPowerEquipment: graphic.attributes.domPowerEquipment || '',
				domPowerLaterals: graphic.attributes.domPowerLaterals || '',
				cityPowerPhase: graphic.attributes.cityPowerPhase || '',
				cityPowerEquipment: graphic.attributes.cityPowerEquipment || '',
				cityPowerLaterals: graphic.attributes.cityPowerLaterals || '',
				domStreetlight: graphic.attributes.domStreetlight || '',
				cityStreetlight: graphic.attributes.cityStreetlight || '',
				utilityAttachments:
					typeof graphic.attributes.utilityAttachments === 'string'
						? JSON.parse(graphic.attributes.utilityAttachments)
						: [],
			});
		}
	}, [graphic]);

	const handleChange = (event) => {
		const { name, value, checked } = event.target;
		if (name.startsWith('utilityAttachments')) {
			const [_, index, key] = name.split('.');
			setPointDescription((prevPointDescription) => {
				const newUtilityAttachments = [
					...prevPointDescription.utilityAttachments,
				];
				newUtilityAttachments[index] = {
					...newUtilityAttachments[index],
					[key]: value,
				};
				return {
					...prevPointDescription,
					utilityAttachments: newUtilityAttachments,
				};
			});
		} else if (name.startsWith('domStreetlight')) {
			console.log(checked);
			setPointDescription((prevPointDescription) => ({
				...prevPointDescription,
				[name]: checked ? 'Yes' : 'No',
			}));
		} else if (name.startsWith('cityStreetlight')) {
			console.log(checked);
			setPointDescription((prevPointDescription) => ({
				...prevPointDescription,
				[name]: checked ? 'Yes' : 'No',
			}));
		} else {
			setPointDescription((prevPointDescription) => ({
				...prevPointDescription,
				[name]: value,
			}));
		}
	};

	const handleAddAttachment = () => {
		setPointDescription((prevPointDescription) => ({
			...prevPointDescription,
			utilityAttachments: [
				...prevPointDescription.utilityAttachments,
				{ utilityOwner: '', utilityEquipment: '', utilityLaterals: '' },
			],
		}));
	};
	const handleDeleteAttachment = (index) => {
		setPointDescription((prevPointDescription) => {
			// Create a copy of the current utilityAttachments array
			const newAttachments = [...prevPointDescription.utilityAttachments];
			// Remove the attachment at the specified index
			newAttachments.splice(index, 1);
			// Return the new state with the updated utilityAttachments array
			return {
				...prevPointDescription,
				utilityAttachments: newAttachments,
			};
		});
	};
	const handleSubmit = (event) => {
		event.preventDefault();

		// Create a new pointDescription object
		const updatedPointDescription = {
			...pointDescription, // Spread existing properties
			utilityAttachments: JSON.stringify(
				pointDescription.utilityAttachments
			), // Update utilityAttachments
		};

		// Call onSubmit with the updated object
		onSubmit(updatedPointDescription);
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
								value={pointDescription.utilityType}
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
						<div className='input-row'>
							<div className='input-field'>
								<label>Pole Number</label>
								<input
									type='text'
									name='poleNumber'
									value={pointDescription.poleNumber}
									onChange={handleChange}
								/>
							</div>

							<div className='input-field'>
								<label>Pole Owner</label>
								<input
									type='text'
									name='poleOwner'
									value={pointDescription.poleOwner}
									onChange={handleChange}
								/>
							</div>
						</div>

						{/* Dominion Power - conditionally rendered */}
						{(pointDescription.utilityType === 'Dom Power' ||
							pointDescription.utilityType ===
								'Dom Power + Telco' ||
							pointDescription.utilityType ===
								'Dom Power + City Power' ||
							pointDescription.utilityType ===
								'Dom Power + City Power + Telco') && (
							<>
								<h3>Dominion Power</h3>
								<div className='input-row'>
									<div className='input-field'>
										<label>Power Phase</label>
										<input
											type='text'
											name='domPowerPhase'
											value={
												pointDescription.domPowerPhase
											}
											onChange={handleChange}
										/>
									</div>
									<div className='input-field'>
										<label>Equipment</label>
										<input
											type='text'
											name='domPowerEquipment'
											value={
												pointDescription.domPowerEquipment
											}
											onChange={handleChange}
										/>
									</div>
									<div className='input-field'>
										<label>Power Laterals</label>
										<input
											type='text'
											name='domPowerLaterals'
											value={
												pointDescription.domPowerLaterals
											}
											onChange={handleChange}
										/>
									</div>

									<label>
										Dom Streetlight
										<input
											type='checkbox'
											name='domStreetlight'
											checked={
												pointDescription.domStreetlight ===
												'Yes'
											}
											onChange={handleChange}
										/>
									</label>
								</div>
							</>
						)}

						{/* City Power - conditionally rendered */}
						{(pointDescription.utilityType === 'City Power' ||
							pointDescription.utilityType ===
								'City Power + Telco' ||
							pointDescription.utilityType ===
								'Dom Power + City Power' ||
							pointDescription.utilityType ===
								'Dom Power + City Power + Telco') && (
							<>
								<h3>City Power</h3>
								<div className='input-row'>
									<div className='input-field'>
										<label>Power Phase</label>
										<input
											type='text'
											name='cityPowerPhase'
											value={
												pointDescription.cityPowerPhase
											}
											onChange={handleChange}
										/>
									</div>
									<div className='input-field'>
										<label>Equipment</label>
										<input
											type='text'
											name='cityPowerEquipment'
											value={
												pointDescription.cityPowerEquipment
											}
											onChange={handleChange}
										/>
									</div>
									<div className='input-field'>
										<label>Power Laterals</label>
										<input
											type='text'
											name='cityPowerLaterals'
											value={
												pointDescription.cityPowerLaterals
											}
											onChange={handleChange}
										/>
									</div>
									<label>
										City Streetlight
										<input
											type='checkbox'
											name='cityStreetlight'
											checked={
												pointDescription.cityStreetlight ===
												'Yes'
											}
											onChange={handleChange}
										/>
									</label>
								</div>
							</>
						)}

						{/* Utilities - conditionally rendered */}
						{(pointDescription.utilityType === 'Telco' ||
							pointDescription.utilityType ===
								'Dom Power + Telco' ||
							pointDescription.utilityType ===
								'City Power + Telco' ||
							pointDescription.utilityType ===
								'Dom Power + City Power + Telco') && (
							<>
								<h3>Utilities</h3>
								{pointDescription.utilityAttachments.map(
									(attachment, index) => (
										<>
											<div
												className='input-row'
												key={index}
											>
												<div
													style={{
														textDecoration:
															'underline',
													}}
												>
													{index + 1}
												</div>
												<div className='input-field'>
													<label>Utility Owner</label>
													<input
														type='text'
														name={`utilityAttachments.${index}.utilityOwner`}
														value={
															attachment.utilityOwner
														}
														onChange={handleChange}
													/>
												</div>
												<div className='input-field'>
													<label>Equipment</label>
													<input
														type='text'
														name={`utilityAttachments.${index}.utilityEquipment`}
														value={
															attachment.utilityEquipment
														}
														onChange={handleChange}
													/>
												</div>
												<div className='input-field'>
													<label>Laterals</label>
													<input
														type='text'
														name={`utilityAttachments.${index}.utilityLaterals`}
														value={
															attachment.utilityLaterals
														}
														onChange={handleChange}
													/>
												</div>
												<button
													className='esri-icon-trash'
													style={{ height: '30px' }}
													onClick={() =>
														handleDeleteAttachment(
															index
														)
													}
												></button>
											</div>
										</>
									)
								)}
								<button
									style={{ width: '100%' }}
									type='button'
									onClick={handleAddAttachment}
								>
									Add Utility Attachment
								</button>
							</>
						)}

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

export default PointDescriptionForm;
