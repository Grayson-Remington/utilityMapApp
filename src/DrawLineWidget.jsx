import React from 'react';

function DrawLineWidget({ onActivate }) {
	return (
		<div className='customWidget'>
			<button onClick={onActivate}>Draw Line</button>
		</div>
	);
}

export default DrawLineWidget;
