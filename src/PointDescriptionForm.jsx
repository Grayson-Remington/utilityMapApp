import React, { useEffect, useState } from 'react';
import './PointDescriptionForm.css';

const PointDescriptionForm = ({ onSubmit, onClose, graphic }) => {
	console.log('graphic submitted', graphic);
	const [pointDescription, setPointDescription] = useState({
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
											value={pointDescription.poleNumber}
											onChange={handleChange}
										/>
									</td>
									<td>
										<input
											type='text'
											name='poleOwner'
											value={pointDescription.poleOwner}
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
												pointDescription.domPowerPhase
											}
											onChange={handleChange}
										/>
									</td>
									<td>
										<input
											type='text'
											name='domPowerEquipment'
											value={
												pointDescription.domPowerEquipment
											}
											onChange={handleChange}
										/>
									</td>
									<td>
										<input
											type='text'
											name='domPowerLaterals'
											value={
												pointDescription.domPowerLaterals
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
												pointDescription.cityPowerPhase
											}
											onChange={handleChange}
										/>
									</td>
									<td>
										<input
											type='text'
											name='cityPowerEquipment'
											value={
												pointDescription.cityPowerEquipment
											}
											onChange={handleChange}
										/>
									</td>
									<td>
										<input
											type='text'
											name='cityPowerLaterals'
											value={
												pointDescription.cityPowerLaterals
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
							<thead>
								<tr>
									<th>Utility Owner</th>
									<th>Equipment</th>
									<th>Laterals</th>
								</tr>
							</thead>
							{pointDescription.utilityAttachments.map(
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

export default PointDescriptionForm;
