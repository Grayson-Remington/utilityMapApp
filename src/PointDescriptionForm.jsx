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
				utilityAttachments:
					typeof graphic.attributes.utilityAttachments === 'string'
						? JSON.parse(graphic.attributes.utilityAttachments)
						: [],
			});
		}
	}, [graphic]);

	const handleChange = (event) => {
		const { name, value } = event.target;
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
							<label>
								<input
									type='radio'
									name='utilityType'
									value='Power'
									checked={
										pointDescription.utilityType === 'Power'
									}
									onChange={handleChange}
								/>
								Power
							</label>
							<label>
								<input
									type='radio'
									name='utilityType'
									value='Telco'
									checked={
										pointDescription.utilityType === 'Telco'
									}
									onChange={handleChange}
								/>
								Telco
							</label>
							<label>
								<input
									type='radio'
									name='utilityType'
									value='Power + Telco'
									checked={
										pointDescription.utilityType ===
										'Power + Telco'
									}
									onChange={handleChange}
								/>
								Power + Telco
							</label>
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
						{(pointDescription.utilityType === 'Power' ||
							pointDescription.utilityType ===
								'Power + Telco') && (
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
								</div>
							</>
						)}

						{/* City Power - conditionally rendered */}
						{(pointDescription.utilityType === 'Power' ||
							pointDescription.utilityType ===
								'Power + Telco') && (
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
								</div>
							</>
						)}

						{/* Utilities - conditionally rendered */}
						{(pointDescription.utilityType === 'Telco' ||
							pointDescription.utilityType ===
								'Power + Telco') && (
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
