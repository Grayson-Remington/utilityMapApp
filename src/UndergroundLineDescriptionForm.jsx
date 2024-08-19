import React, { useEffect, useState } from 'react';
import './UndergroundLineDescriptionForm.css';
const UndergroundLineDescriptionForm = ({ onSubmit, onClose, graphic }) => {
	console.log(graphic);
	const [undergroundLineDescription, setUndergroundLineDescription] =
		useState({
			utilityType: '',
			domPowerPhase: '',
			cityPowerPhase: '',
			cityPowerLaterals: '',
			utilityAttachments: [
				{
					utilityOwner: '',
					utilityEquipment: '',
					utilityLaterals: '',
				},
			],
		});

	useEffect(() => {
		if (graphic.attributes) {
			console.log('Graphic received:', graphic); // Log graphic to verify
			setUndergroundLineDescription({
				utilityType: graphic.attributes.utilityType || '',
				domPowerPhase: graphic.attributes.domPowerPhase || '',
				cityPowerPhase: graphic.attributes.cityPowerPhase || '',
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
			setUndergroundLineDescription((prevUndergroundLineDescription) => {
				const newUtilityAttachments = [
					...prevUndergroundLineDescription.utilityAttachments,
				];
				newUtilityAttachments[index] = {
					...newUtilityAttachments[index],
					[key]: value,
				};
				return {
					...prevUndergroundLineDescription,
					utilityAttachments: newUtilityAttachments,
				};
			});
		} else {
			setUndergroundLineDescription((prevUndergroundLineDescription) => ({
				...prevUndergroundLineDescription,
				[name]: value,
			}));
		}
	};
	const handleAddAttachment = () => {
		setUndergroundLineDescription((prevUndergroundLineDescription) => ({
			...prevUndergroundLineDescription,
			utilityAttachments: [
				...prevUndergroundLineDescription.utilityAttachments,
				{ utilityOwner: '', spliceCase: '' },
			],
		}));
	};

	const handleDeleteAttachment = (index) => {
		setUndergroundLineDescription((prevUndergroundLineDescription) => {
			// Create a copy of the current utilityAttachments array
			const newAttachments = [
				...prevUndergroundLineDescription.utilityAttachments,
			];
			// Remove the attachment at the specified index
			newAttachments.splice(index, 1);
			// Return the new state with the updated utilityAttachments array
			return {
				...prevUndergroundLineDescription,
				utilityAttachments: newAttachments,
			};
		});
	};
	const handleSubmit = (event) => {
		event.preventDefault();

		// Create a new undergroundLineDescription object
		const updatedUndergroundLineDescription = {
			...undergroundLineDescription, // Spread existing properties
			utilityAttachments: JSON.stringify(
				undergroundLineDescription.utilityAttachments
			), // Update utilityAttachments
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
							<label>
								<input
									type='radio'
									name='utilityType'
									value='Power'
									checked={
										undergroundLineDescription.utilityType ===
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
										undergroundLineDescription.utilityType ===
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
										undergroundLineDescription.utilityType ===
										'Power + Telco'
									}
									onChange={handleChange}
								/>
								Power + Telco
							</label>
						</div>

						{/* Dominion Power - conditionally rendered */}
						{(undergroundLineDescription.utilityType === 'Power' ||
							undergroundLineDescription.utilityType ===
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
												undergroundLineDescription.domPowerPhase
											}
											onChange={handleChange}
										/>
									</div>
								</div>
							</>
						)}

						{/* City Power - conditionally rendered */}
						{(undergroundLineDescription.utilityType === 'Power' ||
							undergroundLineDescription.utilityType ===
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
												undergroundLineDescription.cityPowerPhase
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
												undergroundLineDescription.cityPowerEquipment
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
												undergroundLineDescription.cityPowerLaterals
											}
											onChange={handleChange}
										/>
									</div>
								</div>
							</>
						)}

						{/* Utilities - conditionally rendered */}
						{(undergroundLineDescription.utilityType === 'Telco' ||
							undergroundLineDescription.utilityType ===
								'Power + Telco') && (
							<>
								<h3>Utilities</h3>
								{undergroundLineDescription.utilityAttachments.map(
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

export default UndergroundLineDescriptionForm;
