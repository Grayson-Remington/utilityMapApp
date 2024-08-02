import React, { useEffect, useState } from 'react';
import './PolylineDescriptionForm.css';
const PolylineDescriptionForm = ({ onSubmit, onClose, graphic }) => {
	console.log(graphic);
	const [polylineDescription, setPolylineDescription] = useState({
		domPowerPhase: '',
		cityPowerPhase: '',
		cityPowerLaterals: '',
		utilityAttachments: [
			{
				utilityOwner: 'Verizon',
				utilityEquipment: 'yes',
				utilityLaterals: '',
			},
		],
	});

	useEffect(() => {
		if (graphic.attributes) {
			console.log('Graphic received:', graphic); // Log graphic to verify
			setPolylineDescription({
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
									<th>Dominion Power Phase</th>
									<th>City Power Phase</th>
									<th>City Power Laterals</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>
										<input
											type='text'
											name='domPowerPhase'
											value={
												polylineDescription.domPowerPhase
											}
											onChange={handleChange}
										/>
									</td>
									<td>
										<input
											type='text'
											name='cityPowerPhase'
											value={
												polylineDescription.cityPowerPhase
											}
											onChange={handleChange}
										/>
									</td>
									<td>
										<input
											type='text'
											name='cityPowerLaterals'
											value={
												polylineDescription.cityPowerLaterals
											}
											onChange={handleChange}
										/>
									</td>
								</tr>
							</tbody>
						</table>

						<h3>Utilities</h3>

						<table id='customers'>
							<thead>
								<tr>
									<th>Utility Owner</th>
									<th>Equipment</th>
									<th>Laterals</th>
								</tr>
							</thead>
							{polylineDescription.utilityAttachments.map(
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

export default PolylineDescriptionForm;
