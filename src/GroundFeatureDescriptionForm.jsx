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
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
						}}
					>
						<h3>Pole Information</h3>
						<table id='customers'>
							<thead>
								<tr>
									<th>Pole Number</th>
									<th>Pole Owner</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>
										<input
											type='text'
											name='poleNumber'
											value={
												groundFeatureDescription.poleNumber
											}
											onChange={handleChange}
										/>
									</td>
									<td>
										<input
											type='text'
											name='poleOwner'
											value={
												groundFeatureDescription.poleOwner
											}
											onChange={handleChange}
										/>
									</td>
								</tr>
							</tbody>
						</table>

						<h3>Dominion Power</h3>
						<table id='customers'>
							<thead>
								<tr>
									<th>Power Phase</th>
									<th>Equipment</th>
									<th>Power Laterals</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>
										<input
											type='text'
											name='domPowerPhase'
											value={
												groundFeatureDescription.domPowerPhase
											}
											onChange={handleChange}
										/>
									</td>
									<td>
										<input
											type='text'
											name='domPowerEquipment'
											value={
												groundFeatureDescription.domPowerEquipment
											}
											onChange={handleChange}
										/>
									</td>
									<td>
										<input
											type='text'
											name='domPowerLaterals'
											value={
												groundFeatureDescription.domPowerLaterals
											}
											onChange={handleChange}
										/>
									</td>
								</tr>
							</tbody>
						</table>

						<h3>City Power</h3>
						<table id='customers'>
							<thead>
								<tr>
									<th>Power Phase</th>
									<th>Equipment</th>
									<th>Power Laterals</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>
										<input
											type='text'
											name='cityPowerPhase'
											value={
												groundFeatureDescription.cityPowerPhase
											}
											onChange={handleChange}
										/>
									</td>
									<td>
										<input
											type='text'
											name='cityPowerEquipment'
											value={
												groundFeatureDescription.cityPowerEquipment
											}
											onChange={handleChange}
										/>
									</td>
									<td>
										<input
											type='text'
											name='cityPowerLaterals'
											value={
												groundFeatureDescription.cityPowerLaterals
											}
											onChange={handleChange}
										/>
									</td>
								</tr>
							</tbody>
						</table>
						<br />
						<h3>Utilities</h3>

						<table id='customers'>
							<colgroup>
								<col />
								<col />
								<col />
								<col style={{ width: '50px' }} />
							</colgroup>
							<thead>
								<tr>
									<th>Utility Owner</th>
									<th>Equipment</th>
									<th>Laterals</th>
									<th></th>
								</tr>
							</thead>
							{groundFeatureDescription.utilityAttachments.map(
								(attachment, index) => (
									<tbody key={index}>
										<tr>
											<td>
												<input
													type='text'
													name={`utilityAttachments.${index}.utilityOwner`}
													value={
														attachment.utilityOwner
													}
													onChange={handleChange}
												/>
											</td>
											<td>
												<input
													type='text'
													name={`utilityAttachments.${index}.utilityEquipment`}
													value={
														attachment.utilityEquipment
													}
													onChange={handleChange}
												/>
											</td>
											<td>
												<input
													type='text'
													name={`utilityAttachments.${index}.utilityLaterals`}
													value={
														attachment.utilityLaterals
													}
													onChange={handleChange}
												/>
											</td>
											<td>
												<button
													className='esri-icon-trash'
													onClick={() =>
														handleDeleteAttachment(
															index
														)
													}
												></button>
											</td>
										</tr>
									</tbody>
								)
							)}
						</table>
					</div>
					<button
						type='button'
						onClick={handleAddAttachment}
					>
						Add Utility Attachment
					</button>
					<div className='modal-buttons'>
						<button type='submit'>Submit</button>
						<button
							type='button'
							onClick={onClose}
						>
							Cancel
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default GroundFeatureDescriptionForm;
