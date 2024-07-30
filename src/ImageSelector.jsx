import React from 'react';

const ImageSelector = ({
	imageOptions,
	selectedImage,
	handleSelectImage,
	createPoint,
}) => {
	return (
		<div className='imageOptionsDiv'>
			{imageOptions.map((option, index) => (
				<img
					key={index}
					className={`optionsImage ${
						selectedImage === option.url ? 'selectedImage' : ''
					}`}
					src={option.url}
					alt={option.label}
					onClick={() => {
						handleSelectImage(option);
						createPoint();
					}}
				/>
			))}
		</div>
	);
};

export default ImageSelector;
