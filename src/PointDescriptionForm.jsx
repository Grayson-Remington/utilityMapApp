import React, { useEffect, useState } from 'react';
import './PointDescriptionForm.css';

const PointDescriptionForm = ({ onSubmit, onClose, graphic }) => {
	console.log('graphic submitted', graphic);
	const [pointDescription, setPointDescription] = useState({
		poleNumber: '',
		poleOwner: '',
		powerPhase: '',
		powerAttachment: '',
		utilityAttachments: [{ utilityOwner: 'Verizon', spliceCase: 'yes' }],
	});

	useEffect(() => {
		if (graphic.attributes) {
			console.log('Graphic received:', graphic); // Log graphic to verify
			setPointDescription({
				poleNumber: graphic.attributes.poleNumber || '',
				poleOwner: graphic.attributes.poleOwner || '',
				powerPhase: graphic.attributes.powerPhase || '',
				powerAttachment: graphic.attributes.powerAttachment || '',
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
				{ utilityOwner: '', spliceCase: '' },
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
					<label>
						Pole Number:
						<input
							type='text'
							name='poleNumber'
							value={pointDescription.poleNumber}
							onChange={handleChange}
						/>
					</label>
					<label>
						Pole Owner:
						<input
							type='text'
							name='poleOwner'
							value={pointDescription.poleOwner}
							onChange={handleChange}
						/>
					</label>
					<label>
						Power Phase:
						<input
							type='text'
							name='powerPhase'
							value={pointDescription.powerPhase}
							onChange={handleChange}
						/>
					</label>
					<label>
						Power Attachment:
						<input
							type='text'
							name='powerAttachment'
							value={pointDescription.powerAttachment}
							onChange={handleChange}
						/>
					</label>
					{pointDescription.utilityAttachments.map(
						(attachment, index) => (
							<div key={index}>
								<label>
									Utility Owner {index + 1}:
									<input
										type='text'
										name={`utilityAttachments.${index}.utilityOwner`}
										value={attachment.utilityOwner}
										onChange={handleChange}
									/>
								</label>
								<label>
									Splice Case {index + 1}:
									<input
										type='text'
										name={`utilityAttachments.${index}.spliceCase`}
										value={attachment.spliceCase}
										onChange={handleChange}
									/>
								</label>
							</div>
						)
					)}
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
