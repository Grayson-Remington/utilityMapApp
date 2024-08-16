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
												undergroundLineDescription.domPowerPhase
											}
											onChange={handleChange}
										/>
									</td>
									<td>
										<input
											type='text'
											name='cityPowerPhase'
											value={
												undergroundLineDescription.cityPowerPhase
											}
											onChange={handleChange}
										/>
									</td>
									<td>
										<input
											type='text'
											name='cityPowerLaterals'
											value={
												undergroundLineDescription.cityPowerLaterals
											}
											onChange={handleChange}
										/>
									</td>
								</tr>
							</tbody>
						</table>

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
							{undergroundLineDescription.utilityAttachments.map(
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

export default UndergroundLineDescriptionForm;
