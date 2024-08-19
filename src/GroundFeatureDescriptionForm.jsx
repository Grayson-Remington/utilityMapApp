import React, { useEffect, useState } from 'react';
import './GroundFeatureDescriptionForm.css';

const GroundFeatureDescriptionForm = ({ onSubmit, onClose, graphic }) => {
	console.log('graphic submitted', graphic);
	const [groundFeatureDescription, setGroundFeatureDescription] = useState({
		utilityType: '',
		groundFeatureType: '',
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
			setGroundFeatureDescription({
				utilityType: graphic.attributes.utilityType || '',
				groundFeatureType: graphic.attributes.groundFeatureType || '',
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
			setGroundFeatureDescription((prevGroundFeatureDescription) => {
				const newUtilityAttachments = [
					...prevGroundFeatureDescription.utilityAttachments,
				];
				newUtilityAttachments[index] = {
					...newUtilityAttachments[index],
					[key]: value,
				};
				return {
					...prevGroundFeatureDescription,
					utilityAttachments: newUtilityAttachments,
				};
			});
		} else {
			setGroundFeatureDescription((prevGroundFeatureDescription) => ({
				...prevGroundFeatureDescription,
				[name]: value,
			}));
		}
	};

	const handleAddAttachment = () => {
		setGroundFeatureDescription((prevGroundFeatureDescription) => ({
			...prevGroundFeatureDescription,
			utilityAttachments: [
				...prevGroundFeatureDescription.utilityAttachments,
				{ utilityOwner: '', utilityEquipment: '', utilityLaterals: '' },
			],
		}));
	};
	const handleDeleteAttachment = (index) => {
		setGroundFeatureDescription((prevGroundFeatureDescription) => {
			// Create a copy of the current utilityAttachments array
			const newAttachments = [
				...prevGroundFeatureDescription.utilityAttachments,
			];
			// Remove the attachment at the specified index
			newAttachments.splice(index, 1);
			// Return the new state with the updated utilityAttachments array
			return {
				...prevGroundFeatureDescription,
				utilityAttachments: newAttachments,
			};
		});
	};
	const handleSubmit = (event) => {
		event.preventDefault();

		// Create a new groundFeatureDescription object
		const updatedGroundFeatureDescription = {
			...groundFeatureDescription, // Spread existing properties
			utilityAttachments: JSON.stringify(
				groundFeatureDescription.utilityAttachments
			), // Update utilityAttachments
		};

		// Call onSubmit with the updated object
		onSubmit(updatedGroundFeatureDescription);
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
										groundFeatureDescription.utilityType ===
										'Power'
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
										groundFeatureDescription.utilityType ===
										'Telco'
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
										groundFeatureDescription.utilityType ===
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
									value={groundFeatureDescription.poleNumber}
									onChange={handleChange}
								/>
							</div>

							<div className='input-field'>
								<label>Pole Owner</label>
								<input
									type='text'
									name='poleOwner'
									value={groundFeatureDescription.poleOwner}
									onChange={handleChange}
								/>
							</div>
						</div>

						{/* Dominion Power - conditionally rendered */}
						{(groundFeatureDescription.utilityType === 'Power' ||
							groundFeatureDescription.utilityType ===
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
												groundFeatureDescription.domPowerPhase
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
												groundFeatureDescription.domPowerEquipment
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
												groundFeatureDescription.domPowerLaterals
											}
											onChange={handleChange}
										/>
									</div>
								</div>
							</>
						)}

						{/* City Power - conditionally rendered */}
						{(groundFeatureDescription.utilityType === 'Power' ||
							groundFeatureDescription.utilityType ===
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
												groundFeatureDescription.cityPowerPhase
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
												groundFeatureDescription.cityPowerEquipment
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
												groundFeatureDescription.cityPowerLaterals
											}
											onChange={handleChange}
										/>
									</div>
								</div>
							</>
						)}

						{/* Utilities - conditionally rendered */}
						{(groundFeatureDescription.utilityType === 'Telco' ||
							groundFeatureDescription.utilityType ===
								'Power + Telco') && (
							<>
								<h3>Utilities</h3>
								{groundFeatureDescription.utilityAttachments.map(
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

export default GroundFeatureDescriptionForm;
