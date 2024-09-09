import React, { useEffect, useState } from 'react';
import './PolylineDescriptionForm.css';
const PolylineDescriptionForm = ({ onSubmit, onClose, graphic }) => {
	console.log(graphic);
	const [polylineDescription, setPolylineDescription] = useState({
		utilityType: '',
		lateral: '',
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
		notes: '',
	});

	useEffect(() => {
		if (graphic.attributes) {
			console.log('Graphic received:', graphic); // Log graphic to verify
			setPolylineDescription({
				utilityType: graphic.attributes.utilityType || '',
				lateral: graphic.attributes.lateral || '',
				domPowerPhase: graphic.attributes.domPowerPhase || '',
				cityPowerPhase: graphic.attributes.cityPowerPhase || '',
				cityPowerLaterals: graphic.attributes.cityPowerLaterals || '',
				utilityAttachments:
					typeof graphic.attributes.utilityAttachments === 'string'
						? JSON.parse(graphic.attributes.utilityAttachments)
						: [],
				notes: graphic.attributes.notes || '',
			});
		}
	}, [graphic]);

	const handleChange = (event) => {
		const { name, value, checked } = event.target;
		if (name.startsWith('utilityAttachments')) {
			const [_, index, key] = name.split('.');
			setPolylineDescription((prevPolylineDescription) => {
				const newUtilityAttachments = [
					...prevPolylineDescription.utilityAttachments,
				];
				newUtilityAttachments[index] = {
					...newUtilityAttachments[index],
					[key]: value,
				};
				return {
					...prevPolylineDescription,
					utilityAttachments: newUtilityAttachments,
				};
			});
		} else if (name.startsWith('lateral')) {
			console.log(checked);
			setPolylineDescription((prevPolylineDescription) => ({
				...prevPolylineDescription,
				[name]: checked ? 'Yes' : 'No',
			}));
		} else {
			setPolylineDescription((prevPolylineDescription) => ({
				...prevPolylineDescription,
				[name]: value,
			}));
		}
	};
	const handleAddAttachment = () => {
		setPolylineDescription((prevPolylineDescription) => ({
			...prevPolylineDescription,
			utilityAttachments: [
				...prevPolylineDescription.utilityAttachments,
				{ utilityOwner: '', spliceCase: '' },
			],
		}));
	};

	const handleDeleteAttachment = (index) => {
		setPolylineDescription((prevPolylineDescription) => {
			// Create a copy of the current utilityAttachments array
			const newAttachments = [
				...prevPolylineDescription.utilityAttachments,
			];
			// Remove the attachment at the specified index
			newAttachments.splice(index, 1);
			// Return the new state with the updated utilityAttachments array
			return {
				...prevPolylineDescription,
				utilityAttachments: newAttachments,
			};
		});
	};
	const handleSubmit = (event) => {
		event.preventDefault();

		// Create a new polylineDescription object
		const updatedPolylineDescription = {
			...polylineDescription, // Spread existing properties
			utilityAttachments: JSON.stringify(
				polylineDescription.utilityAttachments
			), // Update utilityAttachments
		};

		// Call onSubmit with the updated object
		onSubmit(updatedPolylineDescription);
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
						<h3>Overhead Line Information</h3>
						<div className='utility-options'>
							<label htmlFor='utilityType'>Utility Type:</label>
							<select
								name='utilityType'
								value={polylineDescription.utilityType}
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
								name='lateral'
								checked={polylineDescription.lateral === 'Yes'}
								onChange={handleChange}
							/>
							Lateral
						</label>
						{/* Dominion Power - conditionally rendered */}
						{(polylineDescription.utilityType === 'Dom Power' ||
							polylineDescription.utilityType ===
								'Dom Power + Telco' ||
							polylineDescription.utilityType ===
								'Dom Power + City Power' ||
							polylineDescription.utilityType ===
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
												polylineDescription.domPowerPhase
											}
											onChange={handleChange}
										/>
									</div>
								</div>
							</>
						)}

						{/* City Power - conditionally rendered */}
						{(polylineDescription.utilityType === 'City Power' ||
							polylineDescription.utilityType ===
								'City Power + Telco' ||
							polylineDescription.utilityType ===
								'Dom Power + City Power' ||
							polylineDescription.utilityType ===
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
												polylineDescription.cityPowerPhase
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
												polylineDescription.cityPowerEquipment
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
												polylineDescription.cityPowerLaterals
											}
											onChange={handleChange}
										/>
									</div>
								</div>
							</>
						)}

						{/* Utilities - conditionally rendered */}
						{(polylineDescription.utilityType === 'Telco' ||
							polylineDescription.utilityType ===
								'Dom Power + Telco' ||
							polylineDescription.utilityType ===
								'City Power + Telco' ||
							polylineDescription.utilityType ===
								'Dom Power + City Power + Telco') && (
							<>
								<h3>Utilities</h3>
								{polylineDescription.utilityAttachments.map(
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
						<div className='input-row'>
							<div className='input-field'>
								<label>Notes</label>
								<input
									style={{
										height: '60px',
										whiteSpace: 'pre-wrap', // Wrap text inside the input
										overflow: 'auto', // Allow scrolling if needed
										padding: '8px',
										fontFamily: 'inherit',
										fontSize: 'inherit',
										lineHeight: '1.5',
										borderRadius: '4px',
										border: '1px solid #ccc',
									}}
									type='text' // Use 'text' instead of 'textarea' for the input type
									name='notes'
									value={polylineDescription.notes}
									onChange={handleChange}
								/>
							</div>
						</div>
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

export default PolylineDescriptionForm;
