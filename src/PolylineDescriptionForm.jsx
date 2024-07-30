import React, { useEffect, useState } from 'react';
import './PolylineDescriptionForm.css';
const PolylineDescriptionForm = ({ onSubmit, onClose, graphic }) => {
	console.log(graphic);
	const [polylineDescription, setPolylineDescription] = useState({
		poleNumber: '',
		poleOwner: '',
		powerPhase: '',
		powerAttachment: '',
		utilityAttachments: [{ utilityOwner: 'Verizon', spliceCase: 'yes' }],
	});

	useEffect(() => {
		if (graphic.attributes) {
			console.log('Graphic received:', graphic); // Log graphic to verify
			setPolylineDescription({
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
					<label>
						Polyline Number:
						<input
							type='text'
							name='poleNumber'
							value={polylineDescription.poleNumber}
							onChange={handleChange}
						/>
					</label>
					<label>
						Pole Owner:
						<input
							type='text'
							name='poleOwner'
							value={polylineDescription.poleOwner}
							onChange={handleChange}
						/>
					</label>
					<label>
						Power Phase:
						<input
							type='text'
							name='powerPhase'
							value={polylineDescription.powerPhase}
							onChange={handleChange}
						/>
					</label>
					<label>
						Power Attachment:
						<input
							type='text'
							name='powerAttachment'
							value={polylineDescription.powerAttachment}
							onChange={handleChange}
						/>
					</label>
					{polylineDescription.utilityAttachments.map(
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

export default PolylineDescriptionForm;
