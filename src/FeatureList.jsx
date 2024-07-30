import React from 'react';

const FeatureList = ({ graphics, viewRef }) => {
	return (
		<div className='featureList'>
			<h1>Drawn Features</h1>
			<ul className='featureListList'>
				{graphics.map((graphic, index) => (
					<li
						className='featureListItem'
						key={index}
					>
						Point {index + 1}
						<button
							className='goToButton'
							onClick={() => {
								if (viewRef.current) {
									const view = viewRef.current;
									view.goTo({
										target: graphic.geometry,
									});
								}
							}}
						>
							Zoom to
						</button>
					</li>
				))}
			</ul>
		</div>
	);
};

export default FeatureList;
