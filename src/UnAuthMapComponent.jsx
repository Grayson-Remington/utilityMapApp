import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import MapView from '@arcgis/core/views/MapView';

import Search from '@arcgis/core/widgets/Search';
import UniqueValueRenderer from '@arcgis/core/renderers/UniqueValueRenderer.js';

import Graphic from '@arcgis/core/Graphic';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils.js';
import Point from '@arcgis/core/geometry/Point';
import Polyline from '@arcgis/core/geometry/Polyline';
import PictureMarkerSymbol from '@arcgis/core/symbols/PictureMarkerSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import { v4 as uuidv4 } from 'uuid';
import './App.css';
import PointDescriptionForm from './PointDescriptionForm';
import PolylineDescriptionForm from './PolylineDescriptionForm';
import DrawLineWidget from './DrawLineWidget'; // Import the custom widget
import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer.js';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer.js';
import Editor from '@arcgis/core/widgets/Editor.js';
const imageOptions = [
	{ label: 'Gas', url: '/electricity2.png' },
	// Add more images here
];

function UnAuthMapComponent({ onLoginSuccess }) {
	const mapDiv = useRef(null);
	const viewRef = useRef(null);
	const editorRef = useRef(null);
	const pointLayerRef = useRef(null);
	const polylineLayerRef = useRef(null);
	const [editorState, setEditorState] = useState('');
	const [showPointForm, setShowPointForm] = useState(false);
	const [showPolylineForm, setShowPolylineForm] = useState(false);

	const [password, setPassword] = useState('');

	const handlePasswordSubmit = async (event) => {
		event.preventDefault();
		if (password.toUpperCase() == 'DU') onLoginSuccess();
	};

	const getPointDescription = (graphic) => {
		return new Promise((resolve, reject) => {
			const handleFormSubmit = (description) => {
				resolve(description);
				setShowPointForm(false);
			};

			const handleFormClose = () => {
				reject('User canceled');
				setShowPointForm(false);
			};

			setShowPointForm({
				onSubmit: handleFormSubmit,
				onClose: handleFormClose,
				graphic: graphic,
			});
		});
	};
	const getPolylineDescription = (graphic) => {
		return new Promise((resolve, reject) => {
			const handleFormSubmit = (description) => {
				resolve(description);
				setShowPolylineForm(false);
			};

			const handleFormClose = () => {
				reject('User canceled');
				setShowPolylineForm(false);
			};

			setShowPolylineForm({
				onSubmit: handleFormSubmit,
				onClose: handleFormClose,
				graphic: graphic,
			});
		});
	};
	let isProgrammaticEdit = false;
	useEffect(() => {
		if (mapDiv.current) {
			function pointPopupContent(feature) {
				const attributes = feature.graphic.attributes;
				let utilityAttachmentsHTML;
				console.log(attributes);
				if (attributes.utilityAttachments == null) {
					utilityAttachmentsHTML = '';
				} else {
					utilityAttachmentsHTML = JSON.parse(
						attributes.utilityAttachments
					)
						.map((attachment) => {
							return `<tr>
				      <td> ${attachment.utilityOwner || ''}</td>
				      <td> ${attachment.utilityEquipment || ''}</td>
							<td> ${attachment.utilityLaterals || ''}</td>
				    </tr>`;
						})
						.join('');
				}

				const div = document.createElement('div');
				// div.innerHTML = `
				// 	   <div style="display: flex; flex-direction: row; align-items: center; gap: 20px;">
				// 	     <h3>Pole Number: ${attributes.poleNumber || ''}</h3>
				// 	     <p><strong>Pole Owner:</strong> ${attributes.poleOwner || ''}</p></div>
				// 			 <div>
				// 	     <p><strong>Power Phase:</strong> ${attributes.powerPhase || ''}</p></div>
				// 	    <p><strong>Power Attachment:</strong> ${
				// 			attributes.powerAttachment || ''
				// 		}</p>
				// 	     <div><strong>Utility Attachments:</strong><ol>${utilityAttachmentsHTML}</ol></div>

				// 	 `;
				div.innerHTML = `
				<div style="display: flex; flex-direction: column; align-items: center;">
				<h3>Pole Information</h3>
					   <table id="customers">
  <tr>
    <th>Pole Number</th>
    <th>Pole Owner</th>
  </tr>
  <tr>
    <td>${attributes.poleNumber || ''}</td>
    <td>${attributes.poleOwner || ''}</td>
  </tr>  
</table>

<br/>
${
	attributes.utilityType == 'Dom Power' ||
	attributes.utilityType == 'Dom Power + Telco' ||
	attributes.utilityType == 'Dom Power + City Power' ||
	attributes.utilityType == 'Dom Power + City Power + Telco'
		? `
<h3>Dominion Power</h3>
<table id="customers">
  <tr>
    <th>Power Phase</th>
		<th>Equipment</th>
		<th>Power Laterals</th>
  </tr>
  <tr>
    <td>${attributes.domPowerPhase || ''}</td>
    <td>${attributes.domPowerEquipment || ''}</td>
		<td>${attributes.domPowerLaterals || ''}</td>
  </tr>  

</table>
Streetlight: ${attributes.domStreetlight || ''}
<br/>
`
		: ''
}

${
	attributes.utilityType == 'City Power' ||
	attributes.utilityType == 'City Power + Telco' ||
	attributes.utilityType == 'Dom Power + City Power' ||
	attributes.utilityType == 'Dom Power + City Power + Telco'
		? `
<h3>City Power</h3>
<table id="customers">
  <tr>
    <th>Power Phase</th>
		<th>Equipment</th>
		<th>Power Laterals</th>
  </tr>
  <tr>
    <td>${attributes.cityPowerPhase || ''}</td>
    <td>${attributes.cityPowerEquipment || ''}</td>
		<td>${attributes.cityPowerLaterals || ''}</td>
  </tr>  

</table>
Streetlight: ${attributes.cityStreetlight || ''}
<br/>
`
		: ''
}
${
	attributes.utilityType == 'Telco' ||
	attributes.utilityType == 'Dom Power + Telco' ||
	attributes.utilityType == 'City Power + Telco' ||
	attributes.utilityType == 'Dom Power + City Power + Telco'
		? `
<h3>Utilities</h3>
<table id="customers">
  <tr>
    <th>Utility Owner</th>
    <th>Equipment</th>
		<th>Laterals</th>
  </tr>
  
    ${utilityAttachmentsHTML}
    
	
</table>`
		: ''
}</div>
					  `;
				return div;
			}
			function groundFeaturePopupContent(feature) {
				const attributes = feature.graphic.attributes;
				let utilityAttachmentsHTML;
				console.log(attributes);
				if (attributes.utilityAttachments == null) {
					utilityAttachmentsHTML = '';
				} else {
					utilityAttachmentsHTML = JSON.parse(
						attributes.utilityAttachments
					)
						.map((attachment) => {
							return `<tr>
				      <td> ${attachment.utilityOwner || ''}</td>
				      <td> ${attachment.utilityEquipment || ''}</td>
							<td> ${attachment.utilityLaterals || ''}</td>
				    </tr>`;
						})
						.join('');
				}

				const div = document.createElement('div');
				// div.innerHTML = `
				// 	   <div style="display: flex; flex-direction: row; align-items: center; gap: 20px;">
				// 	     <h3>Pole Number: ${attributes.poleNumber || ''}</h3>
				// 	     <p><strong>Pole Owner:</strong> ${attributes.poleOwner || ''}</p></div>
				// 			 <div>
				// 	     <p><strong>Power Phase:</strong> ${attributes.powerPhase || ''}</p></div>
				// 	    <p><strong>Power Attachment:</strong> ${
				// 			attributes.powerAttachment || ''
				// 		}</p>
				// 	     <div><strong>Utility Attachments:</strong><ol>${utilityAttachmentsHTML}</ol></div>

				// 	 `;
				div.innerHTML = `
				<div style="display: flex; flex-direction: column; align-items: center;">
				<h3>Ground Feature Information</h3>
				Feature Type: ${attributes.featureType || ''}
					   <table id="customers">
  <tr>
    
    <th>Feature Owner</th>
		<th>Feature Dimensions</th>
		<th>Laterals</th>
  </tr>
  <tr>
    
    <td>${attributes.featureOwner || ''}</td>
		 <td>${attributes.featureDimensions || ''}</td>
		 <td>${attributes.laterals || ''}</td>
  </tr>  
</table>
Feature Description: ${attributes.featureDescription || ''}
<br/>



</div>
					  `;
				return div;
			}
			function polylinePopupContent(feature) {
				const attributes = feature.graphic.attributes;
				let utilityAttachmentsHTML;
				console.log(attributes);
				if (attributes.utilityAttachments == null) {
					utilityAttachmentsHTML = '';
				} else {
					utilityAttachmentsHTML = JSON.parse(
						attributes.utilityAttachments
					)
						.map((attachment) => {
							return `<tr>
				      <td> ${attachment.utilityOwner || ''}</td>
				      <td> ${attachment.utilityEquipment || ''}</td>
							<td> ${attachment.utilityLaterals || ''}</td>
				    </tr>`;
						})
						.join('');
				}

				const div = document.createElement('div');
				// div.innerHTML = `
				// 	   <div style="display: flex; flex-direction: row; align-items: center; gap: 20px;">
				// 	     <h3>Pole Number: ${attributes.poleNumber || ''}</h3>
				// 	     <p><strong>Pole Owner:</strong> ${attributes.poleOwner || ''}</p></div>
				// 			 <div>
				// 	     <p><strong>Power Phase:</strong> ${attributes.powerPhase || ''}</p></div>
				// 	    <p><strong>Power Attachment:</strong> ${
				// 			attributes.powerAttachment || ''
				// 		}</p>
				// 	     <div><strong>Utility Attachments:</strong><ol>${utilityAttachmentsHTML}</ol></div>

				// 	 `;
				div.innerHTML = `
				<div style="display: flex; flex-direction: column; align-items: center;">
				<h3>Power Information</h3>
				Dominion Power Phase: ${attributes.domPowerPhase || ''}
					   <table id="customers">
  <tr>
    <th>City Power Phase</th>
    <th>City Power Equipment</th>
		<th>City Power Laterals</th>
  </tr>
  <tr>
    
    <td>${attributes.cityPowerPhase || ''}</td>
		<td>${attributes.cityPowerEquipment || ''}</td>
		<td>${attributes.cityPowerLaterals || ''}</td>
		
  </tr>  
</table>
<br/>

<h3>Utilities</h3>
<table id="customers">
  <tr>
    <th>Utility Owner</th>
    <th>Equipment</th>
		<th>Laterals</th>
  </tr>
  
    ${utilityAttachmentsHTML}
    
	
</table></div>
					  `;
				return div;
			}
			function undergroundLinePopupContent(feature) {
				const attributes = feature.graphic.attributes;
				let utilityConduitsHTML;
				console.log(attributes);
				if (attributes.utilityConduits == null) {
					utilityConduitsHTML = '';
				} else {
					utilityConduitsHTML = JSON.parse(attributes.utilityConduits)
						.map((conduit) => {
							return `<tr>
				      <td> ${conduit.utilityOwner || ''}</td>
				      <td> ${conduit.utilityConduits || ''}</td>
							<td> ${conduit.utilityWires || ''}</td>
				    </tr>`;
						})
						.join('');
				}

				const div = document.createElement('div');
				// div.innerHTML = `
				// 	   <div style="display: flex; flex-direction: row; align-items: center; gap: 20px;">
				// 	     <h3>Pole Number: ${attributes.poleNumber || ''}</h3>
				// 	     <p><strong>Pole Owner:</strong> ${attributes.poleOwner || ''}</p></div>
				// 			 <div>
				// 	     <p><strong>Power Phase:</strong> ${attributes.powerPhase || ''}</p></div>
				// 	    <p><strong>Power Conduit:</strong> ${
				// 			attributes.powerConduit || ''
				// 		}</p>
				// 	     <div><strong>Utility Conduits:</strong><ol>${utilityConduitsHTML}</ol></div>

				// 	 `;
				div.innerHTML = `
				<div style="display: flex; flex-direction: column; align-items: center;">
				<h3>Underground Line Information</h3>
					   <div>Concrete Encased: ${attributes.concreteEncased}</div>
						 <div>Lateral: ${attributes.lateral}</div>
<br/>

<h3>Utilities</h3>
<table id="customers">
  <tr>
    <th>Utility Owner</th>
    <th>Conduits</th>
		<th>Wires</th>
  </tr>
  
    ${utilityConduitsHTML}
    
	
</table></div>
					  `;
				return div;
			}
			const pointRenderer = new UniqueValueRenderer({
				field: 'utilityType', // replace with the attribute field name
				uniqueValueInfos: [
					{
						label: 'Telco',
						value: 'Telco', // replace with the first unique value
						symbol: {
							type: 'simple-marker', // autocasts as new SimpleMarkerSymbol()
							style: 'circle',
							color: 'orange', // color for the first unique value
							size: '16px', // size of the circle
						}, // replace with the symbol corresponding to value1
					},
					{
						label: 'Dom Power',
						value: 'Dom Power', // replace with the second unique value
						symbol: {
							type: 'simple-marker', // autocasts as new SimpleMarkerSymbol()
							style: 'circle',
							color: 'red', // color for the first unique value
							size: '16px', // size of the circle
						}, // replace with the symbol corresponding to value2
					},
					{
						label: 'Dom Power',
						value: 'Power', // replace with the second unique value
						symbol: {
							type: 'simple-marker', // autocasts as new SimpleMarkerSymbol()
							style: 'circle',
							color: 'red', // color for the first unique value
							size: '16px', // size of the circle
						}, // replace with the symbol corresponding to value2
					},

					// Add more unique values and symbols as needed
				],
				defaultSymbol: {
					type: 'simple-marker',
					style: 'circle',
					color: 'purple', // color for the third unique value
					size: '16px',
				}, // Optional: symbol for unmatched values
				defaultLabel: 'Unknown',
			});

			const groundFeatureRenderer = new UniqueValueRenderer({
				field: 'utilityType', // replace with the attribute field name
				uniqueValueInfos: [
					{
						label: 'Telco',
						value: 'Telco', // replace with the first unique value
						symbol: {
							type: 'simple-marker', // autocasts as new SimpleMarkerSymbol()
							style: 'square',
							color: 'orange', // color for the first unique value
							size: '16px', // size of the circle
						}, // replace with the symbol corresponding to value1
					},
					{
						label: 'Power',
						value: 'Power', // replace with the second unique value
						symbol: {
							type: 'simple-marker', // autocasts as new SimpleMarkerSymbol()
							style: 'square',
							color: 'red', // color for the first unique value
							size: '16px', // size of the circle
						}, // replace with the symbol corresponding to value2
					},

					// Add more unique values and symbols as needed
				],
				defaultSymbol: {
					type: 'simple-marker',
					style: 'square',
					color: 'purple', // color for the third unique value
					size: '16px',
				}, // Optional: symbol for unmatched values
				defaultLabel: 'Unknown',
			});

			const undergroundLineRenderer = new UniqueValueRenderer({
				field: 'utilityType', // Attribute field name
				uniqueValueInfos: [
					{
						label: 'Telco',
						value: 'Telco', // First unique value
						symbol: {
							type: 'cim',
							// CIM Line Symbol
							data: {
								type: 'CIMSymbolReference',
								symbol: {
									type: 'CIMLineSymbol',
									symbolLayers: [
										// {
										// 	// white dashed layer at center of the line
										// 	type: 'CIMSolidStroke',
										// 	effects: [
										// 		{
										// 			type: 'CIMGeometricEffectDashes',
										// 			dashTemplate: [16, 16, 16, 16], // width of dashes and spacing between the dashes
										// 			lineDashEnding: 'NoConstraint',
										// 			controlPointEnding: 'NoConstraint',
										// 		},
										// 	],
										// 	enable: true, // must be set to true in order for the symbol layer to be visible
										// 	capStyle: 'Butt',
										// 	joinStyle: 'Round',
										// 	width: 4,

										// 	color: [255, 165, 0, 255],
										// },
										{
											// lighter green line layer that surrounds the dashes
											type: 'CIMSolidStroke',

											enable: true,
											capStyle: 'Butt',
											joinStyle: 'Round',
											width: 6,
											color: [255, 165, 0, 255],
										},

										// {
										// 	// darker green outline around the line symbol
										// 	type: 'CIMSolidStroke',
										// 	enable: true,
										// 	capStyle: 'Butt',
										// 	joinStyle: 'Round',
										// 	width: 6,
										// 	color: [0, 115, 76, 255],
										// },
									],
								},
							},
						}, // Optional: symbol for unmatched values
					},
					{
						label: 'Dom Power',
						value: 'Dom Power', // Second unique value
						symbol: {
							type: 'cim',
							// CIM Line Symbol
							data: {
								type: 'CIMSymbolReference',
								symbol: {
									type: 'CIMLineSymbol',
									symbolLayers: [
										// {
										// 	// white dashed layer at center of the line
										// 	type: 'CIMSolidStroke',
										// 	effects: [
										// 		{
										// 			type: 'CIMGeometricEffectDashes',
										// 			dashTemplate: [16, 16, 16, 16], // width of dashes and spacing between the dashes
										// 			lineDashEnding: 'NoConstraint',
										// 			controlPointEnding: 'NoConstraint',
										// 		},
										// 	],
										// 	enable: true, // must be set to true in order for the symbol layer to be visible
										// 	capStyle: 'Butt',
										// 	joinStyle: 'Round',
										// 	width: 4,

										// 	color: [255, 165, 0, 255],
										// },

										{
											// lighter green line layer that surrounds the dashes
											type: 'CIMSolidStroke',
											enable: true,
											capStyle: 'Butt',
											joinStyle: 'Round',
											width: 6,
											color: [255, 0, 0, 255],
										},

										// {
										// 	// darker green outline around the line symbol
										// 	type: 'CIMSolidStroke',
										// 	enable: true,
										// 	capStyle: 'Butt',
										// 	joinStyle: 'Round',
										// 	width: 6,
										// 	color: [0, 115, 76, 255],
										// },
									],
								},
							},
						}, // Optional: symbol for unmatched values
					},

					// Add more unique values and symbols as needed
				],
				defaultLabel: 'Dom Power + City Power + Telco',
				defaultSymbol: {
					type: 'cim',
					// CIM Line Symbol
					data: {
						type: 'CIMSymbolReference',
						symbol: {
							type: 'CIMLineSymbol',
							symbolLayers: [
								// {
								// 	// white dashed layer at center of the line
								// 	type: 'CIMSolidStroke',
								// 	effects: [
								// 		{
								// 			type: 'CIMGeometricEffectDashes',
								// 			dashTemplate: [16, 16, 16, 16], // width of dashes and spacing between the dashes
								// 			lineDashEnding: 'NoConstraint',
								// 			controlPointEnding: 'NoConstraint',
								// 		},
								// 	],
								// 	enable: true, // must be set to true in order for the symbol layer to be visible
								// 	capStyle: 'Butt',
								// 	joinStyle: 'Round',
								// 	width: 4,

								// 	color: [255, 165, 0, 255],
								// },
								{
									// lighter green line layer that surrounds the dashes
									type: 'CIMSolidStroke',
									enable: true,
									capStyle: 'Butt',
									joinStyle: 'Round',
									width: 3,
									color: [255, 0, 0, 255],
								},
								{
									// lighter green line layer that surrounds the dashes
									type: 'CIMSolidStroke',
									// effects: [
									// 	{
									// 		type: 'CIMGeometricEffectDashes',
									// 		dashTemplate: [6, 6, 6, 6], // width of dashes and spacing between the dashes
									// 		lineDashEnding: 'NoConstraint',
									// 		controlPointEnding: 'NoConstraint',
									// 	},
									// ],
									enable: true,
									capStyle: 'Butt',
									joinStyle: 'Round',
									width: 6,
									color: [255, 165, 0, 255],
								},

								// {
								// 	// darker green outline around the line symbol
								// 	type: 'CIMSolidStroke',
								// 	enable: true,
								// 	capStyle: 'Butt',
								// 	joinStyle: 'Round',
								// 	width: 6,
								// 	color: [0, 115, 76, 255],
								// },
							],
						},
					},
				}, // Optional: symbol for unmatched values
			});
			const polylineRenderer = new UniqueValueRenderer({
				field: 'utilityType', // Attribute field name
				uniqueValueInfos: [
					{
						label: 'Telco',
						value: 'Telco', // First unique value
						symbol: {
							type: 'cim',
							// CIM Line Symbol
							data: {
								type: 'CIMSymbolReference',
								symbol: {
									type: 'CIMLineSymbol',
									symbolLayers: [
										// {
										// 	// white dashed layer at center of the line
										// 	type: 'CIMSolidStroke',
										// 	effects: [
										// 		{
										// 			type: 'CIMGeometricEffectDashes',
										// 			dashTemplate: [16, 16, 16, 16], // width of dashes and spacing between the dashes
										// 			lineDashEnding: 'NoConstraint',
										// 			controlPointEnding: 'NoConstraint',
										// 		},
										// 	],
										// 	enable: true, // must be set to true in order for the symbol layer to be visible
										// 	capStyle: 'Butt',
										// 	joinStyle: 'Round',
										// 	width: 4,

										// 	color: [255, 165, 0, 255],
										// },
										{
											// lighter green line layer that surrounds the dashes
											type: 'CIMSolidStroke',
											effects: [
												{
													type: 'CIMGeometricEffectDashes',
													dashTemplate: [6, 6, 6, 6], // width of dashes and spacing between the dashes
													lineDashEnding:
														'NoConstraint',
													controlPointEnding:
														'NoConstraint',
												},
											],
											enable: true,
											capStyle: 'Butt',
											joinStyle: 'Round',
											width: 6,
											color: [255, 165, 0, 255],
										},

										// {
										// 	// darker green outline around the line symbol
										// 	type: 'CIMSolidStroke',
										// 	enable: true,
										// 	capStyle: 'Butt',
										// 	joinStyle: 'Round',
										// 	width: 6,
										// 	color: [0, 115, 76, 255],
										// },
									],
								},
							},
						}, // Optional: symbol for unmatched values
					},
					{
						label: 'Dom Power',
						value: 'Dom Power', // Second unique value
						symbol: {
							type: 'cim',
							// CIM Line Symbol
							data: {
								type: 'CIMSymbolReference',
								symbol: {
									type: 'CIMLineSymbol',
									symbolLayers: [
										// {
										// 	// white dashed layer at center of the line
										// 	type: 'CIMSolidStroke',
										// 	effects: [
										// 		{
										// 			type: 'CIMGeometricEffectDashes',
										// 			dashTemplate: [16, 16, 16, 16], // width of dashes and spacing between the dashes
										// 			lineDashEnding: 'NoConstraint',
										// 			controlPointEnding: 'NoConstraint',
										// 		},
										// 	],
										// 	enable: true, // must be set to true in order for the symbol layer to be visible
										// 	capStyle: 'Butt',
										// 	joinStyle: 'Round',
										// 	width: 4,

										// 	color: [255, 165, 0, 255],
										// },

										{
											// lighter green line layer that surrounds the dashes
											type: 'CIMSolidStroke',
											effects: [
												{
													type: 'CIMGeometricEffectDashes',
													dashTemplate: [6, 6, 6, 6], // width of dashes and spacing between the dashes
													lineDashEnding:
														'NoConstraint',
													controlPointEnding:
														'NoConstraint',
												},
											],
											enable: true,
											capStyle: 'Butt',
											joinStyle: 'Round',
											width: 6,
											color: [255, 0, 0, 255],
										},

										// {
										// 	// darker green outline around the line symbol
										// 	type: 'CIMSolidStroke',
										// 	enable: true,
										// 	capStyle: 'Butt',
										// 	joinStyle: 'Round',
										// 	width: 6,
										// 	color: [0, 115, 76, 255],
										// },
									],
								},
							},
						}, // Optional: symbol for unmatched values
					},

					// Add more unique values and symbols as needed
				],
				defaultLabel: 'Dom Power + City Power + Telco',
				defaultSymbol: {
					type: 'cim',
					// CIM Line Symbol
					data: {
						type: 'CIMSymbolReference',
						symbol: {
							type: 'CIMLineSymbol',
							symbolLayers: [
								// {
								// 	// white dashed layer at center of the line
								// 	type: 'CIMSolidStroke',
								// 	effects: [
								// 		{
								// 			type: 'CIMGeometricEffectDashes',
								// 			dashTemplate: [16, 16, 16, 16], // width of dashes and spacing between the dashes
								// 			lineDashEnding: 'NoConstraint',
								// 			controlPointEnding: 'NoConstraint',
								// 		},
								// 	],
								// 	enable: true, // must be set to true in order for the symbol layer to be visible
								// 	capStyle: 'Butt',
								// 	joinStyle: 'Round',
								// 	width: 4,

								// 	color: [255, 165, 0, 255],
								// },
								{
									// lighter green line layer that surrounds the dashes
									type: 'CIMSolidStroke',
									effects: [
										{
											type: 'CIMGeometricEffectDashes',
											dashTemplate: [6, 6, 6, 6], // width of dashes and spacing between the dashes
											lineDashEnding: 'NoConstraint',
											controlPointEnding: 'NoConstraint',
										},
									],
									enable: true,
									capStyle: 'Butt',
									joinStyle: 'Round',
									width: 3,
									color: [255, 0, 0, 255],
								},
								{
									// lighter green line layer that surrounds the dashes
									type: 'CIMSolidStroke',
									effects: [
										{
											type: 'CIMGeometricEffectDashes',
											dashTemplate: [6, 6, 6, 6], // width of dashes and spacing between the dashes
											lineDashEnding: 'NoConstraint',
											controlPointEnding: 'NoConstraint',
										},
									],
									enable: true,
									capStyle: 'Butt',
									joinStyle: 'Round',
									width: 6,
									color: [255, 165, 0, 255],
								},

								// {
								// 	// darker green outline around the line symbol
								// 	type: 'CIMSolidStroke',
								// 	enable: true,
								// 	capStyle: 'Butt',
								// 	joinStyle: 'Round',
								// 	width: 6,
								// 	color: [0, 115, 76, 255],
								// },
							],
						},
					},
				}, // Optional: symbol for unmatched values
			});
			const pointLayer = new FeatureLayer({
				title: 'Poles',
				source: [], // This is required to create an empty layer
				outFields: ['*'],
				fields: [
					{
						name: 'ObjectID',
						alias: 'ObjectID',
						type: 'oid',
						editable: false,
					},
					{ name: 'id', alias: 'ID', type: 'string', editable: true },
					{
						name: 'utilityType',
						alias: 'Utility Type',
						type: 'string',
						editable: true,
						defaultValue: 'Dom Power',
					},
					{
						name: 'poleOwner',
						alias: 'Pole Owner',
						type: 'string',
						editable: true,
					},
					// {
					// 	name: 'poleType',
					// 	alias: 'poleType',
					// 	type: 'binary',
					// 	editable: true,
					// },
					{
						name: 'poleNumber',
						alias: 'Pole Number',
						type: 'string',
						editable: true,
					},
					{
						name: 'poleOwner',
						alias: 'Pole Owner',
						type: 'string',
						editable: true,
					},
					{
						name: 'domPowerPhase',
						alias: 'Power Phase',
						type: 'string',
						editable: true,
					},
					{
						name: 'domPowerEquipment',
						alias: 'Power Attachment',
						type: 'string',
						editable: true,
					},
					{
						name: 'domPowerLaterals',
						alias: 'Power Attachment',
						type: 'string',
						editable: true,
					},
					{
						name: 'cityPowerPhase',
						alias: 'Power Phase',
						type: 'string',
						editable: true,
					},
					{
						name: 'cityPowerEquipment',
						alias: 'Power Attachment',
						type: 'string',
						editable: true,
					},
					{
						name: 'cityPowerLaterals',
						alias: 'Power Attachment',
						type: 'string',
						editable: true,
					},
					{
						name: 'domStreetlight',
						alias: 'Dom Streetlight',
						type: 'string',
						editable: true,
						defaultValue: 'No',
					},
					{
						name: 'cityStreetlight',
						alias: 'City Streetlight',
						type: 'string',
						editable: true,
						defaultValue: 'No',
					},
					{
						name: 'utilityAttachments',
						alias: 'Utility Attachments 2',
						type: 'string',
						editable: true,
					},
				],
				objectIdField: 'ObjectID',
				geometryType: 'point',
				spatialReference: { wkid: 4326 }, // Set your spatial reference
				popupTemplate: {
					title: `{poleNumber}`,

					content: pointPopupContent,
				},
				renderer: pointRenderer,
				// minScale: 5000,
			});
			const groundFeatureLayer = new FeatureLayer({
				title: 'Ground Features',
				source: [], // This is required to create an empty layer
				outFields: ['*'],
				fields: [
					{
						name: 'ObjectID',
						alias: 'ObjectID',
						type: 'oid',
						editable: false,
					},
					{ name: 'id', alias: 'ID', type: 'string', editable: true },
					{
						name: 'utilityType',
						alias: 'Utility Type',
						type: 'string',
						editable: true,
						defaultValue: 'Telco',
					},
					{
						name: 'featureType',
						alias: 'Ground Feature Type',
						type: 'string',
						editable: true,
						defaultValue: 'Handhole',
					},
					{
						name: 'featureOwner',
						alias: 'Ground Feature Owner',
						type: 'string',
						editable: true,
					},
					{
						name: 'featureDimensions',
						alias: 'Ground Feature Dimensions',
						type: 'string',
						editable: true,
					},
					{
						name: 'laterals',
						alias: 'Laterals',
						type: 'string',
						editable: true,
					},
					{
						name: 'featureDescription',
						alias: 'Ground Feature Description',
						type: 'string',
						editable: true,
					},
				],
				objectIdField: 'ObjectID',
				geometryType: 'point',
				spatialReference: { wkid: 4326 }, // Set your spatial reference
				popupTemplate: {
					title: `{groundFeatureType}`,

					content: groundFeaturePopupContent,
				},
				renderer: groundFeatureRenderer,
				// minScale: 5000,
			});

			const polylineLayer = new FeatureLayer({
				title: 'Overhead Lines',
				source: [], // This is required to create an empty layer
				outFields: ['*'],
				fields: [
					{
						name: 'ObjectID',
						alias: 'ObjectID',
						type: 'oid',
						editable: false,
					},
					{ name: 'id', alias: 'ID', type: 'string', editable: true },
					{
						name: 'utilityType',
						alias: 'Utility Type',
						type: 'string',
						editable: true,
						defaultValue: 'Dom Power',
					},
					{
						name: 'lateral',
						alias: 'lateral',
						type: 'string',
						editable: true,
						defaultValue: 'No',
					},
					{
						name: 'domPowerPhase',
						alias: 'Dominion Power Phase',
						type: 'string',
						editable: true,
					},
					{
						name: 'cityPowerPhase',
						alias: 'City Power Phase',
						type: 'string',
						editable: true,
					},
					{
						name: 'cityPowerLaterals',
						alias: 'City Power Phase',
						type: 'string',
						editable: true,
					},
					{
						name: 'utilityAttachments',
						alias: 'Utility Attachments',
						type: 'string',
						editable: true,
					},
				],
				objectIdField: 'ObjectID',
				geometryType: 'polyline',
				spatialReference: { wkid: 4326 }, // Set your spatial reference
				popupTemplate: {
					title: 'Polyline',

					content: polylinePopupContent, // Define content for the popup
				},
				renderer: polylineRenderer, // Define your renderer as needed
				// minScale: 5000,
			});

			const undergroundLinesLayer = new FeatureLayer({
				title: 'Underground Lines',
				source: [], // This is required to create an empty layer
				outFields: ['*'],
				fields: [
					{
						name: 'ObjectID',
						alias: 'ObjectID',
						type: 'oid',
						editable: false,
					},
					{ name: 'id', alias: 'ID', type: 'string', editable: true },
					{
						name: 'utilityType',
						alias: 'Utility Type',
						type: 'string',
						editable: true,
						defaultValue: 'Telco',
					},
					{
						name: 'lateral',
						alias: 'lateral',
						type: 'string',
						editable: true,
						defaultValue: 'No',
					},
					{
						name: 'concreteEncased',
						alias: 'Concrete Encased',
						type: 'string',
						editable: true,
						defaultValue: 'No',
					},

					{
						name: 'utilityConduits',
						alias: 'Utility Conduits',
						type: 'string',
						editable: true,
					},
				],
				objectIdField: 'ObjectID',
				geometryType: 'polyline',
				spatialReference: { wkid: 4326 }, // Set your spatial reference
				popupTemplate: {
					title: 'Polyline',

					content: undergroundLinePopupContent, // Define content for the popup
				},
				renderer: undergroundLineRenderer, // Define your renderer as needed
				// minScale: 5000,
			});
			const fetchPoints = async () => {
				console.log('fired');
				try {
					const response = await axios.get(
						`${process.env.DATABASE_URL}/points`
					);
					console.log(response);
					const fetchedPoints = response.data;
					console.log(fetchedPoints);
					const graphics = fetchedPoints.map((pointData) => {
						const graphicObject = JSON.parse(
							pointData.graphic
						).graphic;
						console.log('graphic Object', graphicObject);

						// Create a Point geometry
						const pointGeometry = new Point({
							x: graphicObject.geometry.x,
							y: graphicObject.geometry.y,
							spatialReference:
								graphicObject.geometry.spatialReference,
						});

						// Create a Graphic object
						return new Graphic({
							geometry: pointGeometry,
							attributes: {
								...graphicObject.attributes,
							},
						});
					});
					pointLayer
						.applyEdits({
							addFeatures: graphics,
						})
						.then(async (result) => {
							pointLayer.refresh();
							console.log('works');
						})
						.catch((error) => {
							console.error('Error updating features:', error);
						});
					console.log('fetched Points', fetchedPoints);
				} catch (error) {
					console.error('Error fetching points:', error);
				}
			};
			pointLayer.when(() => {
				fetchPoints();
			});
			const fetchGroundFeatures = async () => {
				console.log('fired');
				try {
					const response = await axios.get(
						`${process.env.DATABASE_URL}/groundfeatures`
					);
					console.log(response);
					const fetchedGroundFeatures = response.data;
					console.log(fetchedGroundFeatures);
					const graphics = fetchedGroundFeatures.map(
						(groundFeatureData) => {
							const graphicObject = JSON.parse(
								groundFeatureData.graphic
							).graphic;
							console.log('graphic Object', graphicObject);

							// Create a Point geometry
							const groundFeatureGeometry = new Point({
								x: graphicObject.geometry.x,
								y: graphicObject.geometry.y,
								spatialReference:
									graphicObject.geometry.spatialReference,
							});

							// Create a Graphic object
							return new Graphic({
								geometry: groundFeatureGeometry,
								attributes: {
									...graphicObject.attributes,
								},
							});
						}
					);
					groundFeatureLayer
						.applyEdits({
							addFeatures: graphics,
						})
						.then(async (result) => {
							groundFeatureLayer.refresh();
							console.log('works');
						})
						.catch((error) => {
							console.error('Error updating features:', error);
						});
					console.log(
						'fetched GroundFeatures',
						fetchedGroundFeatures
					);
				} catch (error) {
					console.error('Error fetching ground features:', error);
				}
			};
			groundFeatureLayer.when(() => {
				fetchGroundFeatures();
			});
			const fetchPolylines = async () => {
				try {
					const response = await axios.get(
						`${process.env.DATABASE_URL}/polylines`
					);

					const fetchedPolylines = response.data;
					console.log(fetchedPolylines);
					const graphics = fetchedPolylines.map((polylineData) => {
						const graphicObject = JSON.parse(
							polylineData.graphic
						).graphic;
						console.log('graphic Object', graphicObject);
						var graphicData = {
							geometry: new Polyline({
								paths: graphicObject.geometry.paths,
								spatialReference:
									graphicObject.geometry.spatialReference,
							}),
						};

						// Create a Graphic object
						return new Graphic({
							geometry: graphicData.geometry,
							attributes: {
								...graphicObject.attributes,
							},
						});
					});
					polylineLayer
						.applyEdits({
							addFeatures: graphics,
						})
						.then(async (result) => {
							polylineLayer.refresh();
							console.log('works');
						})
						.catch((error) => {
							console.error('Error updating features:', error);
						});
					console.log('fetched overhead lines', fetchedPolylines);
				} catch (error) {
					console.error('Error fetching overhead lines:', error);
				}
			};

			polylineLayer.when(() => {
				fetchPolylines();
			});
			const fetchUndergroundLines = async () => {
				try {
					const response = await axios.get(
						`${process.env.DATABASE_URL}/undergroundlines`
					);

					const fetchedUndergroundLines = response.data;
					console.log(fetchedUndergroundLines);
					const graphics = fetchedUndergroundLines.map(
						(undergroundLineData) => {
							const graphicObject = JSON.parse(
								undergroundLineData.graphic
							).graphic;
							console.log('graphic Object', graphicObject);
							var graphicData = {
								geometry: new Polyline({
									paths: graphicObject.geometry.paths,
									spatialReference:
										graphicObject.geometry.spatialReference,
								}),
							};

							// Create a Graphic object
							return new Graphic({
								geometry: graphicData.geometry,
								attributes: {
									...graphicObject.attributes,
								},
							});
						}
					);
					undergroundLinesLayer
						.applyEdits({
							addFeatures: graphics,
						})
						.then(async (result) => {
							undergroundLinesLayer.refresh();
							console.log('works');
						})
						.catch((error) => {
							console.error('Error updating features:', error);
						});
					console.log('fetched Points', fetchedUndergroundLines);
				} catch (error) {
					console.error('Error fetching points:', error);
				}
			};
			undergroundLinesLayer.when(() => {
				fetchUndergroundLines();
			});
			const view = new MapView({
				container: mapDiv.current,
				map: {
					basemap: 'satellite',
					layers: [
						undergroundLinesLayer,
						polylineLayer,
						groundFeatureLayer,
						pointLayer,
					],
				},
				center: [-77.436, 37.5407],
				zoom: 12,
			});

			viewRef.current = view;

			function refreshPopup() {
				// Get the currently selected feature
				const selectedFeature = view.popup.selectedFeature;

				if (selectedFeature) {
					// Close the popup

					// Re-open the popup with the updated feature
					view.popup.open({
						features: [selectedFeature],
						// Optional: Set the location to where you want the popup to appear
					});
				}
			}

			// Fires when feature is created in the Point Layer

			var search = new Search({
				view: view,
			});

			view.ui.add(search, {
				position: 'top-left',
			});
			view.when(() => {
				reactiveUtils.on(
					() => view.popup,
					'click',
					async (event) => {
						console.log(event);
					}
				);
			});
		}
	}, []);

	return (
		<>
			<form onSubmit={handlePasswordSubmit}>
				<input
					type='password'
					placeholder='Password'
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<button type='submit'>Login</button>
			</form>
			{showPointForm && (
				<PointDescriptionForm
					onSubmit={showPointForm.onSubmit}
					onClose={showPointForm.onClose}
					graphic={showPointForm.graphic}
				/>
			)}
			{showPolylineForm && (
				<PolylineDescriptionForm
					onSubmit={showPolylineForm.onSubmit}
					onClose={showPolylineForm.onClose}
					graphic={showPolylineForm.graphic}
				/>
			)}
			<div
				className='mapDiv'
				ref={mapDiv}
			></div>
		</>
	);
}

export default UnAuthMapComponent;
