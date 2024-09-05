import React, { useEffect, useState } from 'react';
import './GroundFeatureDescriptionForm.css';

const GroundFeatureDescriptionForm = ({ onSubmit, onClose, graphic }) => {
	console.log('graphic submitted', graphic);
	const [groundFeatureDescription, setGroundFeatureDescription] = useState({
		utilityType: '',
		featureType: '',
		featureOwner: '',
		featureDimensions: '',
		featureDescription: '',
		laterals: '',
		notes: '',
	});

	useEffect(() => {
		if (graphic.attributes) {
			console.log('Graphic received:', graphic); // Log graphic to verify
			setGroundFeatureDescription({
				utilityType: graphic.attributes.utilityType || '',
				featureType: graphic.attributes.featureType || '',
				featureOwner: graphic.attributes.featureOwner || '',
				featureDimensions: graphic.attributes.featureDimensions || '',
				featureDescription: graphic.attributes.featureDescription || '',
				laterals: graphic.attributes.laterals || '',
				notes: graphic.attributes.notes || '',
			});
		}
	}, [graphic]);

	const handleChange = (event) => {
		const { name, value } = event.target;

		setGroundFeatureDescription((prevGroundFeatureDescription) => ({
			...prevGroundFeatureDescription,
			[name]: value,
		}));
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
						<h3>Ground Feature Information</h3>
						<div className='utility-options'>
							<label htmlFor='utilityType'>Utility Type:</label>
							<select
								name='utilityType'
								value={groundFeatureDescription.utilityType}
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
						<div className='utility-options'>
							<label htmlFor='featureType'>Feature Type:</label>
							<select
								name='featureType'
								value={groundFeatureDescription.featureType}
								onChange={handleChange}
							>
								<option value='Handhole'>Handhole</option>
								<option value='Pedestal'>Pedestal</option>
								<option value='Transformer'>Transformer</option>
								<option value='Switch'>Switch</option>
							</select>
						</div>
						<div className='input-row'>
							<div className='input-field'>
								<label>Feature Owner</label>
								<input
									type='text'
									name='featureOwner'
									value={
										groundFeatureDescription.featureOwner
									}
									onChange={handleChange}
								/>
							</div>
							<div className='input-field'>
								<label>Feature Dimensions</label>
								<input
									type='text'
									name='featureDimensions'
									value={
										groundFeatureDescription.featureDimensions
									}
									onChange={handleChange}
								/>
							</div>
							<div className='input-field'>
								<label>Laterals</label>
								<input
									type='text'
									name='laterals'
									value={groundFeatureDescription.laterals}
									onChange={handleChange}
								/>
							</div>
						</div>
						<div className='input-row'>
							<div className='input-field'>
								<label>Feature Description</label>
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
									name='featureDescription'
									value={
										groundFeatureDescription.featureDescription
									}
									onChange={handleChange}
								/>
							</div>
						</div>
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
									value={groundFeatureDescription.notes}
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

export default GroundFeatureDescriptionForm;
