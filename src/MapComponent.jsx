import React, { useRef, useEffect, useState, act } from 'react';
import axios from 'axios';
import MapView from '@arcgis/core/views/MapView';
import Expand from '@arcgis/core/widgets/Expand.js';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import Search from '@arcgis/core/widgets/Search';
import FieldElement from '@arcgis/core/form/elements/FieldElement.js';
import Graphic from '@arcgis/core/Graphic';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils.js';
import Point from '@arcgis/core/geometry/Point';
import Polyline from '@arcgis/core/geometry/Polyline';
import PictureMarkerSymbol from '@arcgis/core/symbols/PictureMarkerSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import { v4 as uuidv4 } from 'uuid';
import './App.css';
import PointDescriptionForm from './PointDescriptionForm';
import GroundFeatureDescriptionForm from './GroundFeatureDescriptionForm';
import PolylineDescriptionForm from './PolylineDescriptionForm';
import UndergroundLineDescriptionForm from './UndergroundLineDescriptionForm';

import DrawLineWidget from './DrawLineWidget'; // Import the custom widget
import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer.js';
import UniqueValueRenderer from '@arcgis/core/renderers/UniqueValueRenderer.js';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer.js';
import Editor from '@arcgis/core/widgets/Editor.js';
import Legend from '@arcgis/core/widgets/Legend.js';
const imageOptions = [
	{ label: 'Gas', url: '/electricity2.png' },
	// Add more images here
];

const MapComponent = () => {
	const mapDiv = useRef(null);
	const viewRef = useRef(null);
	const editorRef = useRef(null);
	const pointLayerRef = useRef(null);
	const groundFeatureLayerRef = useRef(null);
	const polylineLayerRef = useRef(null);
	const undergroundLinesLayerRef = useRef(null);
	const [editorState, setEditorState] = useState('');
	const [utilityTypeFilterState, setUtilityTypeFilterState] = useState([
		'None',
		'Dom Power',
		'City Power',
		'Telco',
	]);
	const [featureLayerFilterState, setFeatureLayerFilterState] = useState([
		'None',
		'pointLayer',
		'undergroundLinesLayer',
		'polylineLayer',
		'groundFeatureLayer',
	]);
	const [showPointForm, setShowPointForm] = useState(false);
	const [showGroundFeatureForm, setShowGroundFeatureForm] = useState(false);

	const [showPolylineForm, setShowPolylineForm] = useState(false);
	const [showUndergroundLineForm, setShowUndergroundLineForm] =
		useState(false);

	const location = useLocation();
	const { authentication } = location.state || 'false';
	const navigate = useNavigate();
	console.log(authentication, 'authenticated');

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
	const getGroundFeatureDescription = (graphic) => {
		return new Promise((resolve, reject) => {
			const handleFormSubmit = (description) => {
				resolve(description);
				setShowGroundFeatureForm(false);
			};

			const handleFormClose = () => {
				reject('User canceled');
				setShowGroundFeatureForm(false);
			};

			setShowGroundFeatureForm({
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
	const getUndergroundLineDescription = (graphic) => {
		return new Promise((resolve, reject) => {
			const handleFormSubmit = (description) => {
				resolve(description);
				setShowUndergroundLineForm(false);
			};

			const handleFormClose = () => {
				reject('User canceled');
				setShowUndergroundLineForm(false);
			};

			setShowUndergroundLineForm({
				onSubmit: handleFormSubmit,
				onClose: handleFormClose,
				graphic: graphic,
			});
		});
	};
	let isProgrammaticEdit = false;
	useEffect(() => {
		if (authentication !== 'true') {
			navigate('/map');
		}
		if (mapDiv.current) {
			const pointEditThisAction = {
				title: 'Edit feature',
				id: 'point-edit-this',
				className: 'esri-icon-edit',
			};
			const pointDeleteThisAction = {
				title: 'Delete feature',
				id: 'point-delete-this',
				className: 'esri-icon-trash',
			};
			const groundFeatureEditThisAction = {
				title: 'Edit feature',
				id: 'groundFeature-edit-this',
				className: 'esri-icon-edit',
			};
			const groundFeatureDeleteThisAction = {
				title: 'Delete feature',
				id: 'groundFeature-delete-this',
				className: 'esri-icon-trash',
			};
			const polylineEditThisAction = {
				title: 'Edit feature',
				id: 'polyline-edit-this',
				className: 'esri-icon-edit',
			};
			const polylineDeleteThisAction = {
				title: 'Delete feature',
				id: 'polyline-delete-this',
				className: 'esri-icon-trash',
			};
			const undergroundLineEditThisAction = {
				title: 'Edit feature',
				id: 'undergroundLine-edit-this',
				className: 'esri-icon-edit',
			};
			const undergroundLineDeleteThisAction = {
				title: 'Delete feature',
				id: 'undergroundLine-delete-this',
				className: 'esri-icon-trash',
			};

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
}
Notes: ${attributes.notes || ''}</div>
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
Notes: ${attributes.notes || ''}



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
				<h3>Overhead Line Information</h3>
				Lateral: ${attributes.lateral || ''}
				<br/>
				${
					attributes.utilityType == 'Dom Power' ||
					attributes.utilityType == 'Dom Power + Telco' ||
					attributes.utilityType == 'Dom Power + City Power' ||
					attributes.utilityType == 'Dom Power + City Power + Telco'
						? `
				Dominion Power Phase: ${attributes.domPowerPhase || ''}
				`
						: ''
				}
				${
					attributes.utilityType == 'City Power' ||
					attributes.utilityType == 'City Power + Telco' ||
					attributes.utilityType == 'Dom Power + City Power' ||
					attributes.utilityType == 'Dom Power + City Power + Telco'
						? `
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
    `
						: ''
				}
	
</table> Notes: ${attributes.notes || ''}</div>
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
    
	
</table> Notes: ${attributes.notes || ''}</div>
					  `;
				return div;
			}
			const pointRenderer = new UniqueValueRenderer({
				valueExpression: `When(
					$feature.utilityType == 'Telco' && ($feature.domStreetlight == 'No' && $feature.cityStreetlight == 'No'), 'Telco', 
					$feature.utilityType == 'Dom Power' && ($feature.domStreetlight == 'No' && $feature.cityStreetlight == 'No'), 'Dom Power', 
					$feature.utilityType == 'City Power' && ($feature.cityStreetlight == 'No'), 'City Power', 
					$feature.utilityType == 'Dom Power + City Power' && ($feature.domStreetlight == 'No' && $feature.cityStreetlight == 'No'), 'Dom Power + City Power', 
					$feature.utilityType == 'Dom Power + Telco' && ($feature.domStreetlight == 'No'), 'Dom Power + Telco', 
					$feature.utilityType == 'City Power + Telco' && ($feature.domStreetlight == 'No' && $feature.cityStreetlight == 'No'), 'City Power + Telco', 
					$feature.utilityType == 'Dom Power + City Power + Telco' && ($feature.domStreetlight == 'No' && $feature.cityStreetlight == 'No'), 'Dom Power + City Power + Telco', 
					$feature.utilityType == 'Telco' && ($feature.domStreetlight == 'Yes' || $feature.cityStreetlight == 'Yes'), 'Telco + Streetlight', 
					$feature.utilityType == 'Dom Power' && ($feature.domStreetlight == 'Yes'), 'Dom Power + Streetlight', 
					$feature.utilityType == 'City Power' && ($feature.domStreetlight == 'Yes' || $feature.cityStreetlight == 'Yes'), 'City Power + Streetlight', $feature.utilityType == 'Dom Power + City Power' && ($feature.domStreetlight == 'Yes' || $feature.cityStreetlight == 'Yes'), 'Dom Power + City Power + Streetlight', 
					$feature.utilityType == 'Dom Power + Telco' && ($feature.domStreetlight == 'Yes'), 'Dom Power + Telco + Streetlight', 
					$feature.utilityType == 'City Power + Telco' && ($feature.cityStreetlight == 'Yes'), 'City Power + Telco + Streetlight', 
					$feature.utilityType == 'Dom Power + City Power + Telco' && ($feature.domStreetlight == 'Yes' || $feature.cityStreetlight == 'Yes'), 'Dom Power + City Power + Telco + Streetlight', 'Unknown')`,
				uniqueValueInfos: [
					{
						label: 'Telco',
						value: 'Telco', // replace with the first unique value
						symbol: {
							type: 'cim',
							data: {
								type: 'CIMSymbolReference',
								symbol: {
									type: 'CIMPointSymbol',
									symbolLayers: [
										{
											type: 'CIMVectorMarker',
											enable: true,
											size: 26, // size of the circle
											markerGraphics: [
												{
													type: 'CIMMarkerGraphic',
													geometry: {
														rings: [
															[
																[8, 0],
																[5.656, -5.656],
																[0, -8],
																[
																	-5.656,
																	-5.656,
																],
																[-8, 0],
																[-5.656, 5.656],
																[0, 8],
																[5.656, 5.656],
																[8, 0],
															],
														],
													},
													symbol: {
														type: 'CIMPolygonSymbol',
														symbolLayers: [
															{
																type: 'CIMSolidFill',
																enable: true,
																color: [
																	255, 165, 0,
																	255,
																], // orange color
															},
														],
													},
												},
											],
										},
									],
								},
							},
						},
					},
					{
						label: 'City Power',
						value: 'City Power', // replace with the second unique value
						symbol: {
							type: 'cim',
							data: {
								type: 'CIMSymbolReference',
								symbol: {
									type: 'CIMPointSymbol',
									symbolLayers: [
										{
											type: 'CIMVectorMarker',
											enable: true,
											size: 26, // size of the circle
											markerGraphics: [
												{
													type: 'CIMMarkerGraphic',
													geometry: {
														rings: [
															[
																[8, 0],
																[5.656, -5.656],
																[0, -8],
																[
																	-5.656,
																	-5.656,
																],
																[-8, 0],
																[-5.656, 5.656],
																[0, 8],
																[5.656, 5.656],
																[8, 0],
															],
														],
													},
													symbol: {
														type: 'CIMPolygonSymbol',
														symbolLayers: [
															{
																type: 'CIMSolidFill',
																enable: true,
																color: [
																	128, 0, 128,
																	255,
																], // purple color
															},
														],
													},
												},
											],
										},
									],
								},
							},
						},
					},

					{
						label: 'Dom Power',
						value: 'Dom Power', // replace with the second unique value
						symbol: {
							type: 'cim',
							data: {
								type: 'CIMSymbolReference',
								symbol: {
									type: 'CIMPointSymbol',
									symbolLayers: [
										{
											type: 'CIMVectorMarker',
											enable: true,
											size: 26, // size of the circle
											markerGraphics: [
												{
													type: 'CIMMarkerGraphic',
													geometry: {
														rings: [
															[
																[8, 0],
																[5.656, -5.656],
																[0, -8],
																[
																	-5.656,
																	-5.656,
																],
																[-8, 0],
																[-5.656, 5.656],
																[0, 8],
																[5.656, 5.656],
																[8, 0],
															],
														],
													},
													symbol: {
														type: 'CIMPolygonSymbol',
														symbolLayers: [
															{
																type: 'CIMSolidFill',
																enable: true,
																color: [
																	255, 0, 0,
																	255,
																], // red color
															},
														],
													},
												},
											],
										},
									],
								},
							},
						},
					},
					{
						label: 'Dom Power + City Power',
						value: 'Dom Power + City Power', // replace with the second unique value
						symbol: {
							type: 'cim',
							data: {
								type: 'CIMSymbolReference',
								symbol: {
									type: 'CIMPointSymbol',
									symbolLayers: [
										{
											type: 'CIMVectorMarker',
											enable: true,
											anchorPoint: {
												x: 0,
												y: 0,
											},
											anchorPointUnits: 'Relative',
											dominantSizeAxis3D: 'Y',
											size: 12,
											billboardMode3D: 'FaceNearPlane',
											frame: {
												xmin: 0,
												ymin: 0,
												xmax: 17,
												ymax: 17,
											},
											markerGraphics: [
												{
													type: 'CIMMarkerGraphic',
													geometry: {
														rings: [
															[
																[8.5, 0],
																[7.02, 0.13],
																[5.59, 0.51],
																[4.25, 1.14],
																[3.04, 1.99],
																[1.99, 3.04],
																[1.14, 4.25],
																[0.51, 5.59],
																[0.13, 7.02],
																[0, 8.5],
																[0.13, 9.98],
																[0.51, 11.41],
																[1.14, 12.75],
																[1.99, 13.96],
																[3.04, 15.01],
																[4.25, 15.86],
																[5.59, 16.49],
																[7.02, 16.87],
																[8.5, 17],
																[9.98, 16.87],
																[11.41, 16.49],
																[12.75, 15.86],
																[13.96, 15.01],
																[15.01, 13.96],
																[15.86, 12.75],
																[16.49, 11.41],
																[16.87, 9.98],
																[17, 8.5],
																[16.87, 7.02],
																[16.49, 5.59],
																[15.86, 4.25],
																[15.01, 3.04],
																[13.96, 1.99],
																[12.75, 1.14],
																[11.41, 0.51],
																[9.98, 0.13],
																[8.5, 0],
															],
														],
													},
													symbol: {
														type: 'CIMPolygonSymbol',
														symbolLayers: [
															{
																type: 'CIMSolidStroke',
																enable: true,
																capStyle:
																	'Round',
																joinStyle:
																	'Round',
																lineStyle3D:
																	'Strip',
																miterLimit: 10,
																width: 3,
																color: [
																	128, 0, 128,
																	255,
																], // purple color

																colorLocked: true,
															},
															{
																type: 'CIMSolidFill',
																enable: true,
																color: [
																	255, 0, 0,
																	255,
																],
															},
														],
													},
												},
											],
											scaleSymbolsProportionally: true,
											respectFrame: true,
										},
									],
								},
							},
						},
					},
					{
						label: 'City Power + Telco',
						value: 'City Power + Telco', // replace with the second unique value
						symbol: {
							type: 'cim',
							data: {
								type: 'CIMSymbolReference',
								symbol: {
									type: 'CIMPointSymbol',
									symbolLayers: [
										{
											type: 'CIMVectorMarker',
											enable: true,
											anchorPoint: {
												x: 0,
												y: 0,
											},
											anchorPointUnits: 'Relative',
											dominantSizeAxis3D: 'Y',
											size: 12,
											billboardMode3D: 'FaceNearPlane',
											frame: {
												xmin: 0,
												ymin: 0,
												xmax: 17,
												ymax: 17,
											},
											markerGraphics: [
												{
													type: 'CIMMarkerGraphic',
													geometry: {
														rings: [
															[
																[8.5, 0],
																[7.02, 0.13],
																[5.59, 0.51],
																[4.25, 1.14],
																[3.04, 1.99],
																[1.99, 3.04],
																[1.14, 4.25],
																[0.51, 5.59],
																[0.13, 7.02],
																[0, 8.5],
																[0.13, 9.98],
																[0.51, 11.41],
																[1.14, 12.75],
																[1.99, 13.96],
																[3.04, 15.01],
																[4.25, 15.86],
																[5.59, 16.49],
																[7.02, 16.87],
																[8.5, 17],
																[9.98, 16.87],
																[11.41, 16.49],
																[12.75, 15.86],
																[13.96, 15.01],
																[15.01, 13.96],
																[15.86, 12.75],
																[16.49, 11.41],
																[16.87, 9.98],
																[17, 8.5],
																[16.87, 7.02],
																[16.49, 5.59],
																[15.86, 4.25],
																[15.01, 3.04],
																[13.96, 1.99],
																[12.75, 1.14],
																[11.41, 0.51],
																[9.98, 0.13],
																[8.5, 0],
															],
														],
													},
													symbol: {
														type: 'CIMPolygonSymbol',
														symbolLayers: [
															{
																type: 'CIMSolidStroke',
																enable: true,
																capStyle:
																	'Round',
																joinStyle:
																	'Round',
																lineStyle3D:
																	'Strip',
																miterLimit: 10,
																width: 3,
																color: [
																	237, 116, 2,
																	255,
																],
																colorLocked: true,
															},
															{
																type: 'CIMSolidFill',
																enable: true,
																color: [
																	255, 0, 0,
																	255,
																],
															},
														],
													},
												},
											],
											scaleSymbolsProportionally: true,
											respectFrame: true,
										},
									],
								},
							},
						},
					},
					{
						label: 'Dom Power + Telco',
						value: 'Dom Power + Telco', // replace with the second unique value
						symbol: {
							type: 'cim',
							data: {
								type: 'CIMSymbolReference',
								symbol: {
									type: 'CIMPointSymbol',
									symbolLayers: [
										{
											type: 'CIMVectorMarker',
											enable: true,
											anchorPoint: {
												x: 0,
												y: 0,
											},
											anchorPointUnits: 'Relative',
											dominantSizeAxis3D: 'Y',
											size: 12,
											billboardMode3D: 'FaceNearPlane',
											frame: {
												xmin: 0,
												ymin: 0,
												xmax: 17,
												ymax: 17,
											},
											markerGraphics: [
												{
													type: 'CIMMarkerGraphic',
													geometry: {
														rings: [
															[
																[8.5, 0],
																[7.02, 0.13],
																[5.59, 0.51],
																[4.25, 1.14],
																[3.04, 1.99],
																[1.99, 3.04],
																[1.14, 4.25],
																[0.51, 5.59],
																[0.13, 7.02],
																[0, 8.5],
																[0.13, 9.98],
																[0.51, 11.41],
																[1.14, 12.75],
																[1.99, 13.96],
																[3.04, 15.01],
																[4.25, 15.86],
																[5.59, 16.49],
																[7.02, 16.87],
																[8.5, 17],
																[9.98, 16.87],
																[11.41, 16.49],
																[12.75, 15.86],
																[13.96, 15.01],
																[15.01, 13.96],
																[15.86, 12.75],
																[16.49, 11.41],
																[16.87, 9.98],
																[17, 8.5],
																[16.87, 7.02],
																[16.49, 5.59],
																[15.86, 4.25],
																[15.01, 3.04],
																[13.96, 1.99],
																[12.75, 1.14],
																[11.41, 0.51],
																[9.98, 0.13],
																[8.5, 0],
															],
														],
													},
													symbol: {
														type: 'CIMPolygonSymbol',
														symbolLayers: [
															{
																type: 'CIMSolidStroke',
																enable: true,
																capStyle:
																	'Round',
																joinStyle:
																	'Round',
																lineStyle3D:
																	'Strip',
																miterLimit: 10,
																width: 3,
																color: [
																	237, 116, 2,
																	255,
																],
																colorLocked: true,
															},
															{
																type: 'CIMSolidFill',
																enable: true,
																color: [
																	255, 0, 0,
																	255,
																],
															},
														],
													},
												},
											],
											scaleSymbolsProportionally: true,
											respectFrame: true,
										},
									],
								},
							},
						},
					},
					{
						label: 'Dom Power + City Power + Telco',
						value: 'Dom Power + City Power + Telco', // replace with the second unique value
						symbol: {
							type: 'cim',
							data: {
								type: 'CIMSymbolReference',
								symbol: {
									type: 'CIMPointSymbol',
									symbolLayers: [
										{
											type: 'CIMVectorMarker',
											enable: true,
											anchorPoint: {
												x: 0.0,
												y: 0.0,
											},
											anchorPointUnits: 'Relative',
											dominantSizeAxis3D: 'Y',
											size: 5, // Smaller size for the orange circle
											billboardMode3D: 'FaceNearPlane',
											frame: {
												xmin: 0,
												ymin: 0,
												xmax: 17,
												ymax: 17,
											},
											markerGraphics: [
												{
													type: 'CIMMarkerGraphic',
													geometry: {
														rings: [
															[
																[8.5, 0],
																[7.02, 0.13],
																[5.59, 0.51],
																[4.25, 1.14],
																[3.04, 1.99],
																[1.99, 3.04],
																[1.14, 4.25],
																[0.51, 5.59],
																[0.13, 7.02],
																[0, 8.5],
																[0.13, 9.98],
																[0.51, 11.41],
																[1.14, 12.75],
																[1.99, 13.96],
																[3.04, 15.01],
																[4.25, 15.86],
																[5.59, 16.49],
																[7.02, 16.87],
																[8.5, 17],
																[9.98, 16.87],
																[11.41, 16.49],
																[12.75, 15.86],
																[13.96, 15.01],
																[15.01, 13.96],
																[15.86, 12.75],
																[16.49, 11.41],
																[16.87, 9.98],
																[17, 8.5],
																[16.87, 7.02],
																[16.49, 5.59],
																[15.86, 4.25],
																[15.01, 3.04],
																[13.96, 1.99],
																[12.75, 1.14],
																[11.41, 0.51],
																[9.98, 0.13],
																[8.5, 0],
															],
														],
													},
													symbol: {
														type: 'CIMPolygonSymbol',
														symbolLayers: [
															{
																type: 'CIMSolidStroke',
																enable: true,
																capStyle:
																	'Round',
																joinStyle:
																	'Round',
																lineStyle3D:
																	'Strip',
																miterLimit: 10,
																width: 0,
																color: [
																	255, 165, 0,
																	255,
																], // Orange color for the stroke
															},
															{
																type: 'CIMSolidFill',
																enable: true,
																color: [
																	255, 165, 0,
																	255,
																], // Orange color for the fill
															},
														],
													},
												},
											],
											scaleSymbolsProportionally: true,
											respectFrame: true,
										},

										{
											type: 'CIMVectorMarker',
											enable: true,
											anchorPoint: {
												x: 0,
												y: 0,
											},
											anchorPointUnits: 'Relative',
											dominantSizeAxis3D: 'Y',
											size: 10,
											billboardMode3D: 'FaceNearPlane',
											frame: {
												xmin: 0,
												ymin: 0,
												xmax: 17,
												ymax: 17,
											},
											markerGraphics: [
												{
													type: 'CIMMarkerGraphic',
													geometry: {
														rings: [
															[
																[8.5, 0],
																[7.02, 0.13],
																[5.59, 0.51],
																[4.25, 1.14],
																[3.04, 1.99],
																[1.99, 3.04],
																[1.14, 4.25],
																[0.51, 5.59],
																[0.13, 7.02],
																[0, 8.5],
																[0.13, 9.98],
																[0.51, 11.41],
																[1.14, 12.75],
																[1.99, 13.96],
																[3.04, 15.01],
																[4.25, 15.86],
																[5.59, 16.49],
																[7.02, 16.87],
																[8.5, 17],
																[9.98, 16.87],
																[11.41, 16.49],
																[12.75, 15.86],
																[13.96, 15.01],
																[15.01, 13.96],
																[15.86, 12.75],
																[16.49, 11.41],
																[16.87, 9.98],
																[17, 8.5],
																[16.87, 7.02],
																[16.49, 5.59],
																[15.86, 4.25],
																[15.01, 3.04],
																[13.96, 1.99],
																[12.75, 1.14],
																[11.41, 0.51],
																[9.98, 0.13],
																[8.5, 0],
															],
														],
													},
													symbol: {
														type: 'CIMPolygonSymbol',
														symbolLayers: [
															{
																type: 'CIMSolidStroke',
																enable: true,
																capStyle:
																	'Round',
																joinStyle:
																	'Round',
																lineStyle3D:
																	'Strip',
																miterLimit: 10,
																width: 0,
																color: [
																	255, 0, 0,
																	255,
																],
															},
															{
																type: 'CIMSolidFill',
																enable: true,
																color: [
																	255, 0, 0,
																	255,
																],
															},
														],
													},
												},
											],
											scaleSymbolsProportionally: true,
											respectFrame: true,
										},
										{
											type: 'CIMVectorMarker',
											enable: true,
											anchorPoint: {
												x: 0,
												y: 0,
											},
											anchorPointUnits: 'Relative',
											dominantSizeAxis3D: 'Y',
											size: 14,
											billboardMode3D: 'FaceNearPlane',
											frame: {
												xmin: 0,
												ymin: 0,
												xmax: 17,
												ymax: 17,
											},
											markerGraphics: [
												{
													type: 'CIMMarkerGraphic',
													geometry: {
														rings: [
															[
																[8.5, 0],
																[7.02, 0.13],
																[5.59, 0.51],
																[4.25, 1.14],
																[3.04, 1.99],
																[1.99, 3.04],
																[1.14, 4.25],
																[0.51, 5.59],
																[0.13, 7.02],
																[0, 8.5],
																[0.13, 9.98],
																[0.51, 11.41],
																[1.14, 12.75],
																[1.99, 13.96],
																[3.04, 15.01],
																[4.25, 15.86],
																[5.59, 16.49],
																[7.02, 16.87],
																[8.5, 17],
																[9.98, 16.87],
																[11.41, 16.49],
																[12.75, 15.86],
																[13.96, 15.01],
																[15.01, 13.96],
																[15.86, 12.75],
																[16.49, 11.41],
																[16.87, 9.98],
																[17, 8.5],
																[16.87, 7.02],
																[16.49, 5.59],
																[15.86, 4.25],
																[15.01, 3.04],
																[13.96, 1.99],
																[12.75, 1.14],
																[11.41, 0.51],
																[9.98, 0.13],
																[8.5, 0],
															],
														],
													},
													symbol: {
														type: 'CIMPolygonSymbol',
														symbolLayers: [
															{
																type: 'CIMSolidStroke',
																enable: true,
																capStyle:
																	'Round',
																joinStyle:
																	'Round',
																lineStyle3D:
																	'Strip',
																miterLimit: 10,
																width: 0,
																color: [
																	128, 0, 128,
																	255,
																],
															},
															{
																type: 'CIMSolidFill',
																enable: true,
																color: [
																	128, 0, 128,
																	255,
																],
															},
														],
													},
												},
											],
											scaleSymbolsProportionally: true,
											respectFrame: true,
										},
									],
								},
							},
						},
					},
					{
						label: 'Telco + Streetlight',
						value: 'Telco + Streetlight', // replace with the first unique value
						symbol: {
							type: 'cim',
							data: {
								type: 'CIMSymbolReference',
								symbol: {
									type: 'CIMPointSymbol',
									symbolLayers: [
										{
											type: 'CIMVectorMarker',
											enable: true,
											size: 26, // size of the circle
											markerGraphics: [
												{
													type: 'CIMMarkerGraphic',
													geometry: {
														rings: [
															[
																[8, 0],
																[5.656, -5.656],
																[0, -8],
																[
																	-5.656,
																	-5.656,
																],
																[-8, 0],
																[-5.656, 5.656],
																[0, 8],
																[5.656, 5.656],
																[8, 0],
															],
														],
													},
													symbol: {
														type: 'CIMPolygonSymbol',
														symbolLayers: [
															{
																type: 'CIMSolidFill',
																enable: true,
																color: [
																	255, 165, 0,
																	255,
																], // orange color
															},
														],
													},
												},
											],
										},
									],
								},
							},
						},
					},
					{
						label: 'City Power + Streetlight',
						value: 'City Power + Streetlight', // replace with the second unique value
						symbol: {
							type: 'cim',
							data: {
								type: 'CIMSymbolReference',
								symbol: {
									type: 'CIMPointSymbol',
									symbolLayers: [
										{
											type: 'CIMVectorMarker',
											enable: true,
											anchorPointUnits: 'Relative',
											dominantSizeAxis3D: 'Y',
											size: 10,
											billboardMode3D: 'FaceNearPlane',
											frame: {
												xmin: 0,
												ymin: 0,
												xmax: 17,
												ymax: 17,
											},
											markerGraphics: [
												{
													type: 'CIMMarkerGraphic',
													geometry: {
														rings: [
															[
																[0, 0.65],
																[8.5, 16.35],
																[17, 0.65],
																[0, 0.65],
															],
														],
													},
													symbol: {
														type: 'CIMPolygonSymbol',
														symbolLayers: [
															{
																type: 'CIMSolidStroke',
																enable: true,
																capStyle:
																	'Round',
																joinStyle:
																	'Round',
																lineStyle3D:
																	'Strip',
																miterLimit: 10,
																width: 0,
																color: [
																	0, 0, 0,
																	255,
																],
															},
															{
																type: 'CIMSolidFill',
																enable: true,
																color: [
																	255, 234, 5,
																	255,
																],
															},
														],
													},
												},
											],
											scaleSymbolsProportionally: true,
											respectFrame: true,
											rotation: 180,
											anchorPoint: {
												x: 0,
												y: 0,
											},
											offsetY: 6,
										},

										{
											type: 'CIMVectorMarker',
											enable: true,
											anchorPoint: {
												x: 0,
												y: 0,
											},
											anchorPointUnits: 'Relative',
											dominantSizeAxis3D: 'Y',
											size: 14,
											billboardMode3D: 'FaceNearPlane',
											frame: {
												xmin: 0,
												ymin: 0,
												xmax: 17,
												ymax: 17,
											},
											markerGraphics: [
												{
													type: 'CIMMarkerGraphic',
													geometry: {
														rings: [
															[
																[8.5, 0],
																[7.02, 0.13],
																[5.59, 0.51],
																[4.25, 1.14],
																[3.04, 1.99],
																[1.99, 3.04],
																[1.14, 4.25],
																[0.51, 5.59],
																[0.13, 7.02],
																[0, 8.5],
																[0.13, 9.98],
																[0.51, 11.41],
																[1.14, 12.75],
																[1.99, 13.96],
																[3.04, 15.01],
																[4.25, 15.86],
																[5.59, 16.49],
																[7.02, 16.87],
																[8.5, 17],
																[9.98, 16.87],
																[11.41, 16.49],
																[12.75, 15.86],
																[13.96, 15.01],
																[15.01, 13.96],
																[15.86, 12.75],
																[16.49, 11.41],
																[16.87, 9.98],
																[17, 8.5],
																[16.87, 7.02],
																[16.49, 5.59],
																[15.86, 4.25],
																[15.01, 3.04],
																[13.96, 1.99],
																[12.75, 1.14],
																[11.41, 0.51],
																[9.98, 0.13],
																[8.5, 0],
															],
														],
													},
													symbol: {
														type: 'CIMPolygonSymbol',
														symbolLayers: [
															{
																type: 'CIMSolidStroke',
																enable: true,
																capStyle:
																	'Round',
																joinStyle:
																	'Round',
																lineStyle3D:
																	'Strip',
																miterLimit: 10,
																width: 0,
																color: [
																	0, 0, 0,
																	255,
																],
															},
															{
																type: 'CIMSolidFill',
																enable: true,
																color: [
																	115, 0, 168,
																	255,
																],
															},
														],
													},
												},
											],
											scaleSymbolsProportionally: true,
											respectFrame: true,
										},
									],
								},
							},
						},
					},

					{
						label: 'Dom Power + Streetlight',
						value: 'Dom Power + Streetlight', // replace with the second unique value
						symbol: {
							type: 'cim',
							data: {
								type: 'CIMSymbolReference',
								symbol: {
									type: 'CIMPointSymbol',
									symbolLayers: [
										{
											type: 'CIMVectorMarker',
											enable: true,
											anchorPointUnits: 'Relative',
											dominantSizeAxis3D: 'Y',
											size: 10,
											billboardMode3D: 'FaceNearPlane',
											frame: {
												xmin: 0,
												ymin: 0,
												xmax: 17,
												ymax: 17,
											},
											markerGraphics: [
												{
													type: 'CIMMarkerGraphic',
													geometry: {
														rings: [
															[
																[0, 0.65],
																[8.5, 16.35],
																[17, 0.65],
																[0, 0.65],
															],
														],
													},
													symbol: {
														type: 'CIMPolygonSymbol',
														symbolLayers: [
															{
																type: 'CIMSolidStroke',
																enable: true,
																capStyle:
																	'Round',
																joinStyle:
																	'Round',
																lineStyle3D:
																	'Strip',
																miterLimit: 10,
																width: 0,
																color: [
																	0, 0, 0,
																	255,
																],
															},
															{
																type: 'CIMSolidFill',
																enable: true,
																color: [
																	255, 234, 5,
																	255,
																],
															},
														],
													},
												},
											],
											scaleSymbolsProportionally: true,
											respectFrame: true,
											rotation: 180,
											anchorPoint: {
												x: 0,
												y: 0,
											},
											offsetY: 6,
										},

										{
											type: 'CIMVectorMarker',
											enable: true,
											anchorPoint: {
												x: 0,
												y: 0,
											},
											anchorPointUnits: 'Relative',
											dominantSizeAxis3D: 'Y',
											size: 14,
											billboardMode3D: 'FaceNearPlane',
											frame: {
												xmin: 0,
												ymin: 0,
												xmax: 17,
												ymax: 17,
											},
											markerGraphics: [
												{
													type: 'CIMMarkerGraphic',
													geometry: {
														rings: [
															[
																[8.5, 0],
																[7.02, 0.13],
																[5.59, 0.51],
																[4.25, 1.14],
																[3.04, 1.99],
																[1.99, 3.04],
																[1.14, 4.25],
																[0.51, 5.59],
																[0.13, 7.02],
																[0, 8.5],
																[0.13, 9.98],
																[0.51, 11.41],
																[1.14, 12.75],
																[1.99, 13.96],
																[3.04, 15.01],
																[4.25, 15.86],
																[5.59, 16.49],
																[7.02, 16.87],
																[8.5, 17],
																[9.98, 16.87],
																[11.41, 16.49],
																[12.75, 15.86],
																[13.96, 15.01],
																[15.01, 13.96],
																[15.86, 12.75],
																[16.49, 11.41],
																[16.87, 9.98],
																[17, 8.5],
																[16.87, 7.02],
																[16.49, 5.59],
																[15.86, 4.25],
																[15.01, 3.04],
																[13.96, 1.99],
																[12.75, 1.14],
																[11.41, 0.51],
																[9.98, 0.13],
																[8.5, 0],
															],
														],
													},
													symbol: {
														type: 'CIMPolygonSymbol',
														symbolLayers: [
															{
																type: 'CIMSolidStroke',
																enable: true,
																capStyle:
																	'Round',
																joinStyle:
																	'Round',
																lineStyle3D:
																	'Strip',
																miterLimit: 10,
																width: 0,
																color: [
																	0, 0, 0,
																	255,
																],
															},
															{
																type: 'CIMSolidFill',
																enable: true,
																color: [
																	255, 0, 0,
																	255,
																],
															},
														],
													},
												},
											],
											scaleSymbolsProportionally: true,
											respectFrame: true,
										},
									],
								},
							},
						},
					},
					{
						label: 'Dom Power + City Power + Streetlight',
						value: 'Dom Power + City Power + Streetlight', // replace with the second unique value
						symbol: {
							type: 'cim',
							data: {
								type: 'CIMSymbolReference',
								symbol: {
									type: 'CIMPointSymbol',
									symbolLayers: [
										{
											type: 'CIMVectorMarker',
											enable: true,
											anchorPointUnits: 'Relative',
											dominantSizeAxis3D: 'Y',
											size: 10,
											billboardMode3D: 'FaceNearPlane',
											frame: {
												xmin: 0,
												ymin: 0,
												xmax: 17,
												ymax: 17,
											},
											markerGraphics: [
												{
													type: 'CIMMarkerGraphic',
													geometry: {
														rings: [
															[
																[0, 0.65],
																[8.5, 16.35],
																[17, 0.65],
																[0, 0.65],
															],
														],
													},
													symbol: {
														type: 'CIMPolygonSymbol',
														symbolLayers: [
															{
																type: 'CIMSolidStroke',
																enable: true,
																capStyle:
																	'Round',
																joinStyle:
																	'Round',
																lineStyle3D:
																	'Strip',
																miterLimit: 10,
																width: 0,
																color: [
																	0, 0, 0,
																	255,
																],
															},
															{
																type: 'CIMSolidFill',
																enable: true,
																color: [
																	255, 234, 5,
																	255,
																],
															},
														],
													},
												},
											],
											scaleSymbolsProportionally: true,
											respectFrame: true,
											rotation: 180,
											anchorPoint: {
												x: 0,
												y: 0,
											},
											offsetY: 6,
										},
										{
											type: 'CIMVectorMarker',
											enable: true,
											anchorPoint: {
												x: 0,
												y: 0,
											},
											anchorPointUnits: 'Relative',
											dominantSizeAxis3D: 'Y',
											size: 10,
											billboardMode3D: 'FaceNearPlane',
											frame: {
												xmin: 0,
												ymin: 0,
												xmax: 17,
												ymax: 17,
											},
											markerGraphics: [
												{
													type: 'CIMMarkerGraphic',
													geometry: {
														rings: [
															[
																[8.5, 0],
																[7.02, 0.13],
																[5.59, 0.51],
																[4.25, 1.14],
																[3.04, 1.99],
																[1.99, 3.04],
																[1.14, 4.25],
																[0.51, 5.59],
																[0.13, 7.02],
																[0, 8.5],
																[0.13, 9.98],
																[0.51, 11.41],
																[1.14, 12.75],
																[1.99, 13.96],
																[3.04, 15.01],
																[4.25, 15.86],
																[5.59, 16.49],
																[7.02, 16.87],
																[8.5, 17],
																[9.98, 16.87],
																[11.41, 16.49],
																[12.75, 15.86],
																[13.96, 15.01],
																[15.01, 13.96],
																[15.86, 12.75],
																[16.49, 11.41],
																[16.87, 9.98],
																[17, 8.5],
																[16.87, 7.02],
																[16.49, 5.59],
																[15.86, 4.25],
																[15.01, 3.04],
																[13.96, 1.99],
																[12.75, 1.14],
																[11.41, 0.51],
																[9.98, 0.13],
																[8.5, 0],
															],
														],
													},
													symbol: {
														type: 'CIMPolygonSymbol',
														symbolLayers: [
															{
																type: 'CIMSolidStroke',
																enable: true,
																capStyle:
																	'Round',
																joinStyle:
																	'Round',
																lineStyle3D:
																	'Strip',
																miterLimit: 10,
																width: 0,
																color: [
																	128, 0, 128,
																	255,
																],
															},
															{
																type: 'CIMSolidFill',
																enable: true,
																color: [
																	128, 0, 128,
																	255,
																],
															},
														],
													},
												},
											],
											scaleSymbolsProportionally: true,
											respectFrame: true,
										},
										{
											type: 'CIMVectorMarker',
											enable: true,
											anchorPoint: {
												x: 0,
												y: 0,
											},
											anchorPointUnits: 'Relative',
											dominantSizeAxis3D: 'Y',
											size: 14,
											billboardMode3D: 'FaceNearPlane',
											frame: {
												xmin: 0,
												ymin: 0,
												xmax: 17,
												ymax: 17,
											},
											markerGraphics: [
												{
													type: 'CIMMarkerGraphic',
													geometry: {
														rings: [
															[
																[8.5, 0],
																[7.02, 0.13],
																[5.59, 0.51],
																[4.25, 1.14],
																[3.04, 1.99],
																[1.99, 3.04],
																[1.14, 4.25],
																[0.51, 5.59],
																[0.13, 7.02],
																[0, 8.5],
																[0.13, 9.98],
																[0.51, 11.41],
																[1.14, 12.75],
																[1.99, 13.96],
																[3.04, 15.01],
																[4.25, 15.86],
																[5.59, 16.49],
																[7.02, 16.87],
																[8.5, 17],
																[9.98, 16.87],
																[11.41, 16.49],
																[12.75, 15.86],
																[13.96, 15.01],
																[15.01, 13.96],
																[15.86, 12.75],
																[16.49, 11.41],
																[16.87, 9.98],
																[17, 8.5],
																[16.87, 7.02],
																[16.49, 5.59],
																[15.86, 4.25],
																[15.01, 3.04],
																[13.96, 1.99],
																[12.75, 1.14],
																[11.41, 0.51],
																[9.98, 0.13],
																[8.5, 0],
															],
														],
													},
													symbol: {
														type: 'CIMPolygonSymbol',
														symbolLayers: [
															{
																type: 'CIMSolidStroke',
																enable: true,
																capStyle:
																	'Round',
																joinStyle:
																	'Round',
																lineStyle3D:
																	'Strip',
																miterLimit: 10,
																width: 0,
																color: [
																	0, 0, 0,
																	255,
																],
															},
															{
																type: 'CIMSolidFill',
																enable: true,
																color: [
																	115, 0, 168,
																	255,
																],
															},
														],
													},
												},
											],
											scaleSymbolsProportionally: true,
											respectFrame: true,
										},
									],
								},
							},
						},
					},
					{
						label: 'City Power + Telco + Streetlight',
						value: 'City Power + Telco + Streetlight', // replace with the second unique value
						symbol: {
							type: 'cim',
							data: {
								type: 'CIMSymbolReference',
								symbol: {
									type: 'CIMPointSymbol',
									symbolLayers: [
										{
											type: 'CIMVectorMarker',
											enable: true,
											anchorPointUnits: 'Relative',
											dominantSizeAxis3D: 'Y',
											size: 10,
											billboardMode3D: 'FaceNearPlane',
											frame: {
												xmin: 0,
												ymin: 0,
												xmax: 17,
												ymax: 17,
											},
											markerGraphics: [
												{
													type: 'CIMMarkerGraphic',
													geometry: {
														rings: [
															[
																[0, 0.65],
																[8.5, 16.35],
																[17, 0.65],
																[0, 0.65],
															],
														],
													},
													symbol: {
														type: 'CIMPolygonSymbol',
														symbolLayers: [
															{
																type: 'CIMSolidStroke',
																enable: true,
																capStyle:
																	'Round',
																joinStyle:
																	'Round',
																lineStyle3D:
																	'Strip',
																miterLimit: 10,
																width: 0,
																color: [
																	0, 0, 0,
																	255,
																],
															},
															{
																type: 'CIMSolidFill',
																enable: true,
																color: [
																	255, 234, 5,
																	255,
																],
															},
														],
													},
												},
											],
											scaleSymbolsProportionally: true,
											respectFrame: true,
											rotation: 180,
											anchorPoint: {
												x: 0,
												y: 0,
											},
											offsetY: 6,
										},
										{
											type: 'CIMVectorMarker',
											enable: true,
											anchorPoint: {
												x: 0,
												y: 0,
											},
											anchorPointUnits: 'Relative',
											dominantSizeAxis3D: 'Y',
											size: 10,
											billboardMode3D: 'FaceNearPlane',
											frame: {
												xmin: 0,
												ymin: 0,
												xmax: 17,
												ymax: 17,
											},
											markerGraphics: [
												{
													type: 'CIMMarkerGraphic',
													geometry: {
														rings: [
															[
																[8.5, 0],
																[7.02, 0.13],
																[5.59, 0.51],
																[4.25, 1.14],
																[3.04, 1.99],
																[1.99, 3.04],
																[1.14, 4.25],
																[0.51, 5.59],
																[0.13, 7.02],
																[0, 8.5],
																[0.13, 9.98],
																[0.51, 11.41],
																[1.14, 12.75],
																[1.99, 13.96],
																[3.04, 15.01],
																[4.25, 15.86],
																[5.59, 16.49],
																[7.02, 16.87],
																[8.5, 17],
																[9.98, 16.87],
																[11.41, 16.49],
																[12.75, 15.86],
																[13.96, 15.01],
																[15.01, 13.96],
																[15.86, 12.75],
																[16.49, 11.41],
																[16.87, 9.98],
																[17, 8.5],
																[16.87, 7.02],
																[16.49, 5.59],
																[15.86, 4.25],
																[15.01, 3.04],
																[13.96, 1.99],
																[12.75, 1.14],
																[11.41, 0.51],
																[9.98, 0.13],
																[8.5, 0],
															],
														],
													},
													symbol: {
														type: 'CIMPolygonSymbol',
														symbolLayers: [
															{
																type: 'CIMSolidStroke',
																enable: true,
																capStyle:
																	'Round',
																joinStyle:
																	'Round',
																lineStyle3D:
																	'Strip',
																miterLimit: 10,
																width: 0,
																color: [
																	128, 0, 128,
																	255,
																],
															},
															{
																type: 'CIMSolidFill',
																enable: true,
																color: [
																	128, 0, 128,
																	255,
																],
															},
														],
													},
												},
											],
											scaleSymbolsProportionally: true,
											respectFrame: true,
										},
										{
											type: 'CIMVectorMarker',
											enable: true,
											anchorPoint: {
												x: 0,
												y: 0,
											},
											anchorPointUnits: 'Relative',
											dominantSizeAxis3D: 'Y',
											size: 14,
											billboardMode3D: 'FaceNearPlane',
											frame: {
												xmin: 0,
												ymin: 0,
												xmax: 17,
												ymax: 17,
											},
											markerGraphics: [
												{
													type: 'CIMMarkerGraphic',
													geometry: {
														rings: [
															[
																[8.5, 0],
																[7.02, 0.13],
																[5.59, 0.51],
																[4.25, 1.14],
																[3.04, 1.99],
																[1.99, 3.04],
																[1.14, 4.25],
																[0.51, 5.59],
																[0.13, 7.02],
																[0, 8.5],
																[0.13, 9.98],
																[0.51, 11.41],
																[1.14, 12.75],
																[1.99, 13.96],
																[3.04, 15.01],
																[4.25, 15.86],
																[5.59, 16.49],
																[7.02, 16.87],
																[8.5, 17],
																[9.98, 16.87],
																[11.41, 16.49],
																[12.75, 15.86],
																[13.96, 15.01],
																[15.01, 13.96],
																[15.86, 12.75],
																[16.49, 11.41],
																[16.87, 9.98],
																[17, 8.5],
																[16.87, 7.02],
																[16.49, 5.59],
																[15.86, 4.25],
																[15.01, 3.04],
																[13.96, 1.99],
																[12.75, 1.14],
																[11.41, 0.51],
																[9.98, 0.13],
																[8.5, 0],
															],
														],
													},
													symbol: {
														type: 'CIMPolygonSymbol',
														symbolLayers: [
															{
																type: 'CIMSolidStroke',
																enable: true,
																capStyle:
																	'Round',
																joinStyle:
																	'Round',
																lineStyle3D:
																	'Strip',
																miterLimit: 10,
																width: 0,
																color: [
																	0, 0, 0,
																	255,
																],
															},
															{
																type: 'CIMSolidFill',
																enable: true,
																color: [
																	255, 165, 0,
																	255,
																],
															},
														],
													},
												},
											],
											scaleSymbolsProportionally: true,
											respectFrame: true,
										},
									],
								},
							},
						},
					},
					{
						label: 'Dom Power + Telco + Streetlight',
						value: 'Dom Power + Telco + Streetlight', // replace with the second unique value
						symbol: {
							type: 'cim',
							data: {
								type: 'CIMSymbolReference',
								symbol: {
									type: 'CIMPointSymbol',
									symbolLayers: [
										{
											type: 'CIMVectorMarker',
											enable: true,
											anchorPointUnits: 'Relative',
											dominantSizeAxis3D: 'Y',
											size: 10,
											billboardMode3D: 'FaceNearPlane',
											frame: {
												xmin: 0,
												ymin: 0,
												xmax: 17,
												ymax: 17,
											},
											markerGraphics: [
												{
													type: 'CIMMarkerGraphic',
													geometry: {
														rings: [
															[
																[0, 0.65],
																[8.5, 16.35],
																[17, 0.65],
																[0, 0.65],
															],
														],
													},
													symbol: {
														type: 'CIMPolygonSymbol',
														symbolLayers: [
															{
																type: 'CIMSolidStroke',
																enable: true,
																capStyle:
																	'Round',
																joinStyle:
																	'Round',
																lineStyle3D:
																	'Strip',
																miterLimit: 10,
																width: 0,
																color: [
																	0, 0, 0,
																	255,
																],
															},
															{
																type: 'CIMSolidFill',
																enable: true,
																color: [
																	255, 234, 5,
																	255,
																],
															},
														],
													},
												},
											],
											scaleSymbolsProportionally: true,
											respectFrame: true,
											rotation: 180,
											anchorPoint: {
												x: 0,
												y: 0,
											},
											offsetY: 6,
										},
										{
											type: 'CIMVectorMarker',
											enable: true,
											anchorPoint: {
												x: 0,
												y: 0,
											},
											anchorPointUnits: 'Relative',
											dominantSizeAxis3D: 'Y',
											size: 10,
											billboardMode3D: 'FaceNearPlane',
											frame: {
												xmin: 0,
												ymin: 0,
												xmax: 17,
												ymax: 17,
											},
											markerGraphics: [
												{
													type: 'CIMMarkerGraphic',
													geometry: {
														rings: [
															[
																[8.5, 0],
																[7.02, 0.13],
																[5.59, 0.51],
																[4.25, 1.14],
																[3.04, 1.99],
																[1.99, 3.04],
																[1.14, 4.25],
																[0.51, 5.59],
																[0.13, 7.02],
																[0, 8.5],
																[0.13, 9.98],
																[0.51, 11.41],
																[1.14, 12.75],
																[1.99, 13.96],
																[3.04, 15.01],
																[4.25, 15.86],
																[5.59, 16.49],
																[7.02, 16.87],
																[8.5, 17],
																[9.98, 16.87],
																[11.41, 16.49],
																[12.75, 15.86],
																[13.96, 15.01],
																[15.01, 13.96],
																[15.86, 12.75],
																[16.49, 11.41],
																[16.87, 9.98],
																[17, 8.5],
																[16.87, 7.02],
																[16.49, 5.59],
																[15.86, 4.25],
																[15.01, 3.04],
																[13.96, 1.99],
																[12.75, 1.14],
																[11.41, 0.51],
																[9.98, 0.13],
																[8.5, 0],
															],
														],
													},
													symbol: {
														type: 'CIMPolygonSymbol',
														symbolLayers: [
															{
																type: 'CIMSolidStroke',
																enable: true,
																capStyle:
																	'Round',
																joinStyle:
																	'Round',
																lineStyle3D:
																	'Strip',
																miterLimit: 10,
																width: 0,
																color: [
																	255, 0, 0,
																	255,
																],
															},
															{
																type: 'CIMSolidFill',
																enable: true,
																color: [
																	255, 0, 0,
																	255,
																],
															},
														],
													},
												},
											],
											scaleSymbolsProportionally: true,
											respectFrame: true,
										},
										{
											type: 'CIMVectorMarker',
											enable: true,
											anchorPoint: {
												x: 0,
												y: 0,
											},
											anchorPointUnits: 'Relative',
											dominantSizeAxis3D: 'Y',
											size: 14,
											billboardMode3D: 'FaceNearPlane',
											frame: {
												xmin: 0,
												ymin: 0,
												xmax: 17,
												ymax: 17,
											},
											markerGraphics: [
												{
													type: 'CIMMarkerGraphic',
													geometry: {
														rings: [
															[
																[8.5, 0],
																[7.02, 0.13],
																[5.59, 0.51],
																[4.25, 1.14],
																[3.04, 1.99],
																[1.99, 3.04],
																[1.14, 4.25],
																[0.51, 5.59],
																[0.13, 7.02],
																[0, 8.5],
																[0.13, 9.98],
																[0.51, 11.41],
																[1.14, 12.75],
																[1.99, 13.96],
																[3.04, 15.01],
																[4.25, 15.86],
																[5.59, 16.49],
																[7.02, 16.87],
																[8.5, 17],
																[9.98, 16.87],
																[11.41, 16.49],
																[12.75, 15.86],
																[13.96, 15.01],
																[15.01, 13.96],
																[15.86, 12.75],
																[16.49, 11.41],
																[16.87, 9.98],
																[17, 8.5],
																[16.87, 7.02],
																[16.49, 5.59],
																[15.86, 4.25],
																[15.01, 3.04],
																[13.96, 1.99],
																[12.75, 1.14],
																[11.41, 0.51],
																[9.98, 0.13],
																[8.5, 0],
															],
														],
													},
													symbol: {
														type: 'CIMPolygonSymbol',
														symbolLayers: [
															{
																type: 'CIMSolidStroke',
																enable: true,
																capStyle:
																	'Round',
																joinStyle:
																	'Round',
																lineStyle3D:
																	'Strip',
																miterLimit: 10,
																width: 0,
																color: [
																	0, 0, 0,
																	255,
																],
															},
															{
																type: 'CIMSolidFill',
																enable: true,
																color: [
																	255, 165, 0,
																	255,
																],
															},
														],
													},
												},
											],
											scaleSymbolsProportionally: true,
											respectFrame: true,
										},
									],
								},
							},
						},
					},
					{
						label: 'Dom Power + City Power + Telco + Streetlight',
						value: 'Dom Power + City Power + Telco + Streetlight', // replace with the second unique value
						symbol: {
							type: 'cim',
							data: {
								type: 'CIMSymbolReference',
								symbol: {
									type: 'CIMPointSymbol',
									symbolLayers: [
										{
											type: 'CIMVectorMarker',
											enable: true,
											anchorPointUnits: 'Relative',
											dominantSizeAxis3D: 'Y',
											size: 10,
											billboardMode3D: 'FaceNearPlane',
											frame: {
												xmin: 0,
												ymin: 0,
												xmax: 17,
												ymax: 17,
											},
											markerGraphics: [
												{
													type: 'CIMMarkerGraphic',
													geometry: {
														rings: [
															[
																[0, 0.65],
																[8.5, 16.35],
																[17, 0.65],
																[0, 0.65],
															],
														],
													},
													symbol: {
														type: 'CIMPolygonSymbol',
														symbolLayers: [
															{
																type: 'CIMSolidStroke',
																enable: true,
																capStyle:
																	'Round',
																joinStyle:
																	'Round',
																lineStyle3D:
																	'Strip',
																miterLimit: 10,
																width: 0,
																color: [
																	0, 0, 0,
																	255,
																],
															},
															{
																type: 'CIMSolidFill',
																enable: true,
																color: [
																	255, 234, 5,
																	255,
																],
															},
														],
													},
												},
											],
											scaleSymbolsProportionally: true,
											respectFrame: true,
											rotation: 180,
											anchorPoint: {
												x: 0,
												y: 0,
											},
											offsetY: 6,
										},
										{
											type: 'CIMVectorMarker',
											enable: true,
											anchorPoint: {
												x: 0.0,
												y: 0.0,
											},
											anchorPointUnits: 'Relative',
											dominantSizeAxis3D: 'Y',
											size: 5, // Smaller size for the orange circle
											billboardMode3D: 'FaceNearPlane',
											frame: {
												xmin: 0,
												ymin: 0,
												xmax: 17,
												ymax: 17,
											},
											markerGraphics: [
												{
													type: 'CIMMarkerGraphic',
													geometry: {
														rings: [
															[
																[8.5, 0],
																[7.02, 0.13],
																[5.59, 0.51],
																[4.25, 1.14],
																[3.04, 1.99],
																[1.99, 3.04],
																[1.14, 4.25],
																[0.51, 5.59],
																[0.13, 7.02],
																[0, 8.5],
																[0.13, 9.98],
																[0.51, 11.41],
																[1.14, 12.75],
																[1.99, 13.96],
																[3.04, 15.01],
																[4.25, 15.86],
																[5.59, 16.49],
																[7.02, 16.87],
																[8.5, 17],
																[9.98, 16.87],
																[11.41, 16.49],
																[12.75, 15.86],
																[13.96, 15.01],
																[15.01, 13.96],
																[15.86, 12.75],
																[16.49, 11.41],
																[16.87, 9.98],
																[17, 8.5],
																[16.87, 7.02],
																[16.49, 5.59],
																[15.86, 4.25],
																[15.01, 3.04],
																[13.96, 1.99],
																[12.75, 1.14],
																[11.41, 0.51],
																[9.98, 0.13],
																[8.5, 0],
															],
														],
													},
													symbol: {
														type: 'CIMPolygonSymbol',
														symbolLayers: [
															{
																type: 'CIMSolidStroke',
																enable: true,
																capStyle:
																	'Round',
																joinStyle:
																	'Round',
																lineStyle3D:
																	'Strip',
																miterLimit: 10,
																width: 0,
																color: [
																	255, 165, 0,
																	255,
																], // Orange color for the stroke
															},
															{
																type: 'CIMSolidFill',
																enable: true,
																color: [
																	255, 165, 0,
																	255,
																], // Orange color for the fill
															},
														],
													},
												},
											],
											scaleSymbolsProportionally: true,
											respectFrame: true,
										},

										{
											type: 'CIMVectorMarker',
											enable: true,
											anchorPoint: {
												x: 0,
												y: 0,
											},
											anchorPointUnits: 'Relative',
											dominantSizeAxis3D: 'Y',
											size: 10,
											billboardMode3D: 'FaceNearPlane',
											frame: {
												xmin: 0,
												ymin: 0,
												xmax: 17,
												ymax: 17,
											},
											markerGraphics: [
												{
													type: 'CIMMarkerGraphic',
													geometry: {
														rings: [
															[
																[8.5, 0],
																[7.02, 0.13],
																[5.59, 0.51],
																[4.25, 1.14],
																[3.04, 1.99],
																[1.99, 3.04],
																[1.14, 4.25],
																[0.51, 5.59],
																[0.13, 7.02],
																[0, 8.5],
																[0.13, 9.98],
																[0.51, 11.41],
																[1.14, 12.75],
																[1.99, 13.96],
																[3.04, 15.01],
																[4.25, 15.86],
																[5.59, 16.49],
																[7.02, 16.87],
																[8.5, 17],
																[9.98, 16.87],
																[11.41, 16.49],
																[12.75, 15.86],
																[13.96, 15.01],
																[15.01, 13.96],
																[15.86, 12.75],
																[16.49, 11.41],
																[16.87, 9.98],
																[17, 8.5],
																[16.87, 7.02],
																[16.49, 5.59],
																[15.86, 4.25],
																[15.01, 3.04],
																[13.96, 1.99],
																[12.75, 1.14],
																[11.41, 0.51],
																[9.98, 0.13],
																[8.5, 0],
															],
														],
													},
													symbol: {
														type: 'CIMPolygonSymbol',
														symbolLayers: [
															{
																type: 'CIMSolidStroke',
																enable: true,
																capStyle:
																	'Round',
																joinStyle:
																	'Round',
																lineStyle3D:
																	'Strip',
																miterLimit: 10,
																width: 0,
																color: [
																	255, 0, 0,
																	255,
																],
															},
															{
																type: 'CIMSolidFill',
																enable: true,
																color: [
																	255, 0, 0,
																	255,
																],
															},
														],
													},
												},
											],
											scaleSymbolsProportionally: true,
											respectFrame: true,
										},
										{
											type: 'CIMVectorMarker',
											enable: true,
											anchorPoint: {
												x: 0,
												y: 0,
											},
											anchorPointUnits: 'Relative',
											dominantSizeAxis3D: 'Y',
											size: 14,
											billboardMode3D: 'FaceNearPlane',
											frame: {
												xmin: 0,
												ymin: 0,
												xmax: 17,
												ymax: 17,
											},
											markerGraphics: [
												{
													type: 'CIMMarkerGraphic',
													geometry: {
														rings: [
															[
																[8.5, 0],
																[7.02, 0.13],
																[5.59, 0.51],
																[4.25, 1.14],
																[3.04, 1.99],
																[1.99, 3.04],
																[1.14, 4.25],
																[0.51, 5.59],
																[0.13, 7.02],
																[0, 8.5],
																[0.13, 9.98],
																[0.51, 11.41],
																[1.14, 12.75],
																[1.99, 13.96],
																[3.04, 15.01],
																[4.25, 15.86],
																[5.59, 16.49],
																[7.02, 16.87],
																[8.5, 17],
																[9.98, 16.87],
																[11.41, 16.49],
																[12.75, 15.86],
																[13.96, 15.01],
																[15.01, 13.96],
																[15.86, 12.75],
																[16.49, 11.41],
																[16.87, 9.98],
																[17, 8.5],
																[16.87, 7.02],
																[16.49, 5.59],
																[15.86, 4.25],
																[15.01, 3.04],
																[13.96, 1.99],
																[12.75, 1.14],
																[11.41, 0.51],
																[9.98, 0.13],
																[8.5, 0],
															],
														],
													},
													symbol: {
														type: 'CIMPolygonSymbol',
														symbolLayers: [
															{
																type: 'CIMSolidStroke',
																enable: true,
																capStyle:
																	'Round',
																joinStyle:
																	'Round',
																lineStyle3D:
																	'Strip',
																miterLimit: 10,
																width: 0,
																color: [
																	128, 0, 128,
																	255,
																],
															},
															{
																type: 'CIMSolidFill',
																enable: true,
																color: [
																	128, 0, 128,
																	255,
																],
															},
														],
													},
												},
											],
											scaleSymbolsProportionally: true,
											respectFrame: true,
										},
									],
								},
							},
						},
					},
					// Add more unique values and symbols as needed
				],
				defaultSymbol: {
					type: 'simple-marker',
					style: 'circle',
					color: 'green', // color for the third unique value
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
										{
											type: 'CIMSolidStroke',
											enable: true,
											capStyle: 'Round',
											joinStyle: 'Round',
											lineStyle3D: 'Strip',
											miterLimit: 10,
											width: 6,
											color: [251, 148, 4, 255],
										},
									],
								},
							},
						}, // Optional: symbol for unmatched values
					},
					{
						label: 'City Power',
						value: 'City Power', // Second unique value
						symbol: {
							type: 'cim',
							// CIM Line Symbol
							data: {
								type: 'CIMSymbolReference',
								symbol: {
									type: 'CIMLineSymbol',
									symbolLayers: [
										{
											type: 'CIMSolidStroke',
											enable: true,
											capStyle: 'Round',
											joinStyle: 'Round',
											lineStyle3D: 'Strip',
											miterLimit: 10,
											width: 6,
											color: [128, 0, 128, 255],
										},
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
										{
											type: 'CIMSolidStroke',
											enable: true,
											capStyle: 'Round',
											joinStyle: 'Round',
											lineStyle3D: 'Strip',
											miterLimit: 10,
											width: 6,
											color: [255, 0, 0, 255],
										},
									],
								},
							},
						}, // Optional: symbol for unmatched values
					},
					{
						label: 'Dom Power + Telco',
						value: 'Dom Power + Telco', // Second unique value
						symbol: {
							type: 'cim',
							// CIM Line Symbol
							data: {
								type: 'CIMSymbolReference',
								symbol: {
									type: 'CIMLineSymbol',
									symbolLayers: [
										{
											type: 'CIMSolidStroke',
											enable: true,
											capStyle: 'Round',
											joinStyle: 'Round',
											lineStyle3D: 'Strip',
											miterLimit: 10,
											width: 3,
											color: [251, 148, 4, 255],
										},
										{
											type: 'CIMSolidStroke',
											enable: true,
											capStyle: 'Round',
											joinStyle: 'Round',
											lineStyle3D: 'Strip',
											miterLimit: 10,
											width: 8,
											color: [255, 0, 0, 255],
										},
									],
								},
							},
						}, // Optional: symbol for unmatched values
					},
					{
						label: 'City Power + Telco',
						value: 'City Power + Telco', // Second unique value
						symbol: {
							type: 'cim',
							// CIM Line Symbol
							data: {
								type: 'CIMSymbolReference',
								symbol: {
									type: 'CIMLineSymbol',
									symbolLayers: [
										{
											type: 'CIMSolidStroke',
											enable: true,
											capStyle: 'Round',
											joinStyle: 'Round',
											lineStyle3D: 'Strip',
											miterLimit: 10,
											width: 3,
											color: [251, 148, 4, 255],
										},
										{
											type: 'CIMSolidStroke',
											enable: true,
											capStyle: 'Round',
											joinStyle: 'Round',
											lineStyle3D: 'Strip',
											miterLimit: 10,
											width: 8,
											color: [128, 0, 128, 255],
										},
									],
								},
							},
						}, // Optional: symbol for unmatched values
					},
					{
						label: 'Dom Power + City Power',
						value: 'Dom Power + City Power', // Second unique value
						symbol: {
							type: 'cim',
							// CIM Line Symbol
							data: {
								type: 'CIMSymbolReference',
								symbol: {
									type: 'CIMLineSymbol',
									symbolLayers: [
										{
											type: 'CIMSolidStroke',
											enable: true,
											capStyle: 'Round',
											joinStyle: 'Round',
											lineStyle3D: 'Strip',
											miterLimit: 10,
											width: 3,
											color: [128, 0, 128, 255],
										},
										{
											type: 'CIMSolidStroke',
											enable: true,
											capStyle: 'Round',
											joinStyle: 'Round',
											lineStyle3D: 'Strip',
											miterLimit: 10,
											width: 8,
											color: [255, 0, 0, 255],
										},
									],
								},
							},
						},
						// Optional: symbol for unmatched values
					},
					{
						label: 'Dom Power + City Power + Telco',
						value: 'Dom Power + City Power + Telco', // Second unique value
						symbol: {
							type: 'cim',
							// CIM Line Symbol
							data: {
								type: 'CIMSymbolReference',
								symbol: {
									type: 'CIMLineSymbol',
									symbolLayers: [
										{
											type: 'CIMSolidStroke',
											enable: true,
											capStyle: 'Round',
											joinStyle: 'Round',
											lineStyle3D: 'Strip',
											miterLimit: 10,
											width: 2,
											color: [251, 148, 4, 255],
										},
										{
											type: 'CIMSolidStroke',
											enable: true,
											capStyle: 'Round',
											joinStyle: 'Round',
											lineStyle3D: 'Strip',
											miterLimit: 10,
											width: 8,
											color: [128, 0, 128, 255],
										},
										{
											type: 'CIMSolidStroke',
											enable: true,
											capStyle: 'Round',
											joinStyle: 'Round',
											lineStyle3D: 'Strip',
											miterLimit: 10,
											width: 12,
											color: [255, 0, 0, 255],
										},
									],
								},
							},
						}, // Optional: symbol for unmatched values
					},

					// Add more unique values and symbols as needed
				],
				defaultLabel: 'Unknown',
				defaultSymbol: {
					type: 'cim',
					// CIM Line Symbol
					data: {
						type: 'CIMSymbolReference',
						symbol: {
							type: 'CIMLineSymbol',
							symbolLayers: [
								{
									type: 'CIMSolidStroke',
									enable: true,
									capStyle: 'Round',
									joinStyle: 'Round',
									lineStyle3D: 'Strip',
									miterLimit: 10,
									width: 10,
									color: [0, 255, 0, 255],
								},
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
										{
											type: 'CIMSolidStroke',
											enable: true,
											capStyle: 'Round',
											joinStyle: 'Round',
											lineStyle3D: 'Strip',
											miterLimit: 10,
											width: 6,
											color: [251, 148, 4, 255],
										},
									],
									effects: [
										{
											type: 'CIMGeometricEffectDashes',
											dashTemplate: [12, 12, 12, 12], // width of dashes and spacing between the dashes
											lineDashEnding: 'NoConstraint',
											controlPointEnding: 'NoConstraint',
										},
									],
								},
							},
						}, // Optional: symbol for unmatched values
					},
					{
						label: 'City Power',
						value: 'City Power', // Second unique value
						symbol: {
							type: 'cim',
							// CIM Line Symbol
							data: {
								type: 'CIMSymbolReference',
								symbol: {
									type: 'CIMLineSymbol',
									symbolLayers: [
										{
											type: 'CIMSolidStroke',
											enable: true,
											capStyle: 'Round',
											joinStyle: 'Round',
											lineStyle3D: 'Strip',
											miterLimit: 10,
											width: 6,
											color: [128, 0, 128, 255],
										},
									],
									effects: [
										{
											type: 'CIMGeometricEffectDashes',
											dashTemplate: [12, 12, 12, 12], // width of dashes and spacing between the dashes
											lineDashEnding: 'NoConstraint',
											controlPointEnding: 'NoConstraint',
										},
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
										{
											type: 'CIMSolidStroke',
											enable: true,
											capStyle: 'Round',
											joinStyle: 'Round',
											lineStyle3D: 'Strip',
											miterLimit: 10,
											width: 6,
											color: [255, 0, 0, 255],
										},
									],
									effects: [
										{
											type: 'CIMGeometricEffectDashes',
											dashTemplate: [12, 12, 12, 12], // width of dashes and spacing between the dashes
											lineDashEnding: 'NoConstraint',
											controlPointEnding: 'NoConstraint',
										},
									],
								},
							},
						}, // Optional: symbol for unmatched values
					},
					{
						label: 'Dom Power + Telco',
						value: 'Dom Power + Telco', // Second unique value
						symbol: {
							type: 'cim',
							// CIM Line Symbol
							data: {
								type: 'CIMSymbolReference',
								symbol: {
									type: 'CIMLineSymbol',
									symbolLayers: [
										{
											type: 'CIMSolidStroke',
											enable: true,
											capStyle: 'Round',
											joinStyle: 'Round',
											lineStyle3D: 'Strip',
											miterLimit: 10,
											width: 3,
											color: [251, 148, 4, 255],
										},
										{
											type: 'CIMSolidStroke',
											enable: true,
											capStyle: 'Round',
											joinStyle: 'Round',
											lineStyle3D: 'Strip',
											miterLimit: 10,
											width: 8,
											color: [255, 0, 0, 255],
										},
									],
									effects: [
										{
											type: 'CIMGeometricEffectDashes',
											dashTemplate: [12, 12, 12, 12], // width of dashes and spacing between the dashes
											lineDashEnding: 'NoConstraint',
											controlPointEnding: 'NoConstraint',
										},
									],
								},
							},
						}, // Optional: symbol for unmatched values
					},
					{
						label: 'City Power + Telco',
						value: 'City Power + Telco', // Second unique value
						symbol: {
							type: 'cim',
							// CIM Line Symbol
							data: {
								type: 'CIMSymbolReference',
								symbol: {
									type: 'CIMLineSymbol',
									symbolLayers: [
										{
											type: 'CIMSolidStroke',
											enable: true,
											capStyle: 'Round',
											joinStyle: 'Round',
											lineStyle3D: 'Strip',
											miterLimit: 10,
											width: 3,
											color: [251, 148, 4, 255],
										},
										{
											type: 'CIMSolidStroke',
											enable: true,
											capStyle: 'Round',
											joinStyle: 'Round',
											lineStyle3D: 'Strip',
											miterLimit: 10,
											width: 8,
											color: [128, 0, 128, 255],
										},
									],
									effects: [
										{
											type: 'CIMGeometricEffectDashes',
											dashTemplate: [12, 12, 12, 12], // width of dashes and spacing between the dashes
											lineDashEnding: 'NoConstraint',
											controlPointEnding: 'NoConstraint',
										},
									],
								},
							},
						}, // Optional: symbol for unmatched values
					},
					{
						label: 'Dom Power + City Power',
						value: 'Dom Power + City Power', // Second unique value
						symbol: {
							type: 'cim',
							// CIM Line Symbol
							data: {
								type: 'CIMSymbolReference',
								symbol: {
									type: 'CIMLineSymbol',
									symbolLayers: [
										{
											type: 'CIMSolidStroke',
											enable: true,
											capStyle: 'Round',
											joinStyle: 'Round',
											lineStyle3D: 'Strip',
											miterLimit: 10,
											width: 3,
											color: [128, 0, 128, 255],
										},
										{
											type: 'CIMSolidStroke',
											enable: true,
											capStyle: 'Round',
											joinStyle: 'Round',
											lineStyle3D: 'Strip',
											miterLimit: 10,
											width: 8,
											color: [255, 0, 0, 255],
										},
									],
									effects: [
										{
											type: 'CIMGeometricEffectDashes',
											dashTemplate: [12, 12, 12, 12], // width of dashes and spacing between the dashes
											lineDashEnding: 'NoConstraint',
											controlPointEnding: 'NoConstraint',
										},
									],
								},
							},
						},
						// Optional: symbol for unmatched values
					},
					{
						label: 'Dom Power + City Power + Telco',
						value: 'Dom Power + City Power + Telco', // Second unique value
						symbol: {
							type: 'cim',
							// CIM Line Symbol
							data: {
								type: 'CIMSymbolReference',
								symbol: {
									type: 'CIMLineSymbol',
									symbolLayers: [
										{
											type: 'CIMSolidStroke',
											enable: true,
											capStyle: 'Round',
											joinStyle: 'Round',
											lineStyle3D: 'Strip',
											miterLimit: 10,
											width: 2,
											color: [251, 148, 4, 255],
										},
										{
											type: 'CIMSolidStroke',
											enable: true,
											capStyle: 'Round',
											joinStyle: 'Round',
											lineStyle3D: 'Strip',
											miterLimit: 10,
											width: 8,
											color: [128, 0, 128, 255],
										},
										{
											type: 'CIMSolidStroke',
											enable: true,
											capStyle: 'Round',
											joinStyle: 'Round',
											lineStyle3D: 'Strip',
											miterLimit: 10,
											width: 12,
											color: [255, 0, 0, 255],
										},
									],
									effects: [
										{
											type: 'CIMGeometricEffectDashes',
											dashTemplate: [12, 12, 12, 12], // width of dashes and spacing between the dashes
											lineDashEnding: 'NoConstraint',
											controlPointEnding: 'NoConstraint',
										},
									],
								},
							},
						}, // Optional: symbol for unmatched values
					},

					// Add more unique values and symbols as needed
				],
				defaultLabel: 'Unknown',
				defaultSymbol: {
					type: 'cim',
					// CIM Line Symbol
					data: {
						type: 'CIMSymbolReference',
						symbol: {
							type: 'CIMLineSymbol',
							symbolLayers: [
								{
									type: 'CIMSolidStroke',
									enable: true,
									capStyle: 'Round',
									joinStyle: 'Round',
									lineStyle3D: 'Strip',
									miterLimit: 10,
									width: 3,
									color: [251, 148, 4, 255],
								},
								{
									type: 'CIMSolidStroke',
									enable: true,
									capStyle: 'Round',
									joinStyle: 'Round',
									lineStyle3D: 'Strip',
									miterLimit: 10,
									width: 8,
									color: [128, 0, 128, 255],
								},
								{
									type: 'CIMSolidStroke',
									enable: true,
									capStyle: 'Round',
									joinStyle: 'Round',
									lineStyle3D: 'Strip',
									miterLimit: 10,
									width: 10,
									color: [255, 0, 0, 255],
								},
							],
							effects: [
								{
									type: 'CIMGeometricEffectDashes',
									dashTemplate: [12, 12, 12, 12], // width of dashes and spacing between the dashes
									lineDashEnding: 'NoConstraint',
									controlPointEnding: 'NoConstraint',
								},
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
					{
						name: 'notes',
						alias: 'Notes',
						type: 'string',
						editable: true,
					},
				],
				objectIdField: 'ObjectID',
				geometryType: 'point',
				spatialReference: { wkid: 4326 }, // Set your spatial reference
				popupTemplate: {
					title: `{poleNumber}`,
					actions: [pointEditThisAction, pointDeleteThisAction],
					content: pointPopupContent,
				},
				renderer: pointRenderer,
				// minScale: 5000,
			});
			pointLayerRef.current = pointLayer;
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
					{
						name: 'notes',
						alias: 'Notes',
						type: 'string',
						editable: true,
					},
				],
				objectIdField: 'ObjectID',
				geometryType: 'point',
				spatialReference: { wkid: 4326 }, // Set your spatial reference
				popupTemplate: {
					title: `{groundFeatureType}`,
					actions: [
						groundFeatureEditThisAction,
						groundFeatureDeleteThisAction,
					],
					content: groundFeaturePopupContent,
				},
				renderer: groundFeatureRenderer,
				// minScale: 5000,
			});
			groundFeatureLayerRef.current = groundFeatureLayer;
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
					{
						name: 'notes',
						alias: 'Notes',
						type: 'string',
						editable: true,
					},
				],
				objectIdField: 'ObjectID',
				geometryType: 'polyline',
				spatialReference: { wkid: 4326 }, // Set your spatial reference
				popupTemplate: {
					title: 'Overhead Line',
					actions: [polylineEditThisAction, polylineDeleteThisAction], // Define actions if needed
					content: polylinePopupContent, // Define content for the popup
				},
				renderer: polylineRenderer, // Define your renderer as needed
				// minScale: 5000,
			});
			polylineLayerRef.current = polylineLayer;

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
					{
						name: 'notes',
						alias: 'Notes',
						type: 'string',
						editable: true,
					},
				],
				objectIdField: 'ObjectID',
				geometryType: 'polyline',
				spatialReference: { wkid: 4326 }, // Set your spatial reference
				popupTemplate: {
					title: 'Polyline',
					actions: [
						undergroundLineEditThisAction,
						undergroundLineDeleteThisAction,
					], // Define actions if needed
					content: undergroundLinePopupContent, // Define content for the popup
				},
				renderer: undergroundLineRenderer, // Define your renderer as needed
				// minScale: 5000,
			});
			undergroundLinesLayerRef.current = undergroundLinesLayer;

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
			polylineLayerRef.current = polylineLayer;
			const view = new MapView({
				container: mapDiv.current,
				map: {
					basemap: 'satellite',
					layers: [
						undergroundLinesLayer,

						groundFeatureLayer,
						polylineLayer,
						pointLayer,
					],
				},
				center: [-77.436, 37.5407],
				zoom: 12,
			});

			viewRef.current = view;
			const editor = new Editor({
				view: view,
				snappingOptions: {
					enabled: true,
					featureSources: [
						{ layer: pointLayer, enabled: true },
						{ layer: groundFeatureLayer, enabled: true },
						{ layer: polylineLayer, enabled: true },
						{ layer: undergroundLinesLayer, enabled: true },
					],
				},
				visibleElements: {
					settingsMenu: false,
					editFeaturesSection: false,
				},

				layerInfos: [
					{
						layer: pointLayer,

						title: 'Point Layer',

						formTemplate: {
							// autocastable to FormTemplate
							elements: [
								new FieldElement({
									fieldName: 'utilityType', // Field that will accept a single value
									label: 'Utility Type',
									domain: {
										type: 'coded-value', // Use the domain defined in the layer
										codedValues: [
											{
												name: 'Telco',
												code: 'Telco',
											},
											{
												name: 'City Power',
												code: 'City Power',
											},
											{
												name: 'Dom Power',
												code: 'Dom Power',
											},

											{
												name: 'Dom Power + City Power',
												code: 'Dom Power + City Power',
											},

											{
												name: 'Dom Power + Telco',
												code: 'Dom Power + Telco',
											},
											{
												name: 'City Power + Telco',
												code: 'City Power + Telco',
											},
											{
												name: 'Dom Power + City Power + Telco',
												code: 'Dom Power + City Power + Telco',
											},
										],
									},
									input: {
										// Change input type to 'dropdown' to create a drop-down list
										type: 'dropdown',
										showNoValueOption: false,
									},
								}),
								,
							],
						},
					},
					{
						layer: groundFeatureLayer,

						title: 'Ground Feature Layer',
						formTemplate: {
							// autocastable to FormTemplate
							elements: [
								new FieldElement({
									fieldName: 'utilityType', // Field that will accept a single value
									label: 'Utility Type',
									domain: {
										type: 'coded-value', // Use the domain defined in the layer
										codedValues: [
											{
												name: 'Telco',
												code: 'Telco',
											},
											{
												name: 'City Power',
												code: 'City Power',
											},
											{
												name: 'Dom Power',
												code: 'Dom Power',
											},

											{
												name: 'Dom Power + City Power',
												code: 'Dom Power + City Power',
											},

											{
												name: 'Dom Power + Telco',
												code: 'Dom Power + Telco',
											},
											{
												name: 'City Power + Telco',
												code: 'City Power + Telco',
											},
											{
												name: 'Dom Power + City Power + Telco',
												code: 'Dom Power + City Power + Telco',
											},
										],
									},
									input: {
										// Change input type to 'dropdown' to create a drop-down list
										type: 'dropdown',
										showNoValueOption: false,
									},
								}),
								,
							],
						},
					},
					{
						layer: polylineLayer,

						formTemplate: {
							// autocastable to FormTemplate
							elements: [
								new FieldElement({
									fieldName: 'utilityType', // Field that will accept a single value
									label: 'Utility Type',
									domain: {
										type: 'coded-value', // Use the domain defined in the layer
										codedValues: [
											{
												name: 'Telco',
												code: 'Telco',
											},
											{
												name: 'City Power',
												code: 'City Power',
											},
											{
												name: 'Dom Power',
												code: 'Dom Power',
											},

											{
												name: 'Dom Power + City Power',
												code: 'Dom Power + City Power',
											},

											{
												name: 'Dom Power + Telco',
												code: 'Dom Power + Telco',
											},
											{
												name: 'City Power + Telco',
												code: 'City Power + Telco',
											},
											{
												name: 'Dom Power + City Power + Telco',
												code: 'Dom Power + City Power + Telco',
											},
										],
									},
									input: {
										// Change input type to 'dropdown' to create a drop-down list
										type: 'dropdown',
										showNoValueOption: false,
									},
								}),
								,
							],
						},
					},
					{
						layer: undergroundLinesLayer,

						formTemplate: {
							// autocastable to FormTemplate
							elements: [
								new FieldElement({
									fieldName: 'utilityType', // Field that will accept a single value
									label: 'Utility Type',
									domain: {
										type: 'coded-value', // Use the domain defined in the layer
										codedValues: [
											{
												name: 'Telco',
												code: 'Telco',
											},
											{
												name: 'City Power',
												code: 'City Power',
											},
											{
												name: 'Dom Power',
												code: 'Dom Power',
											},

											{
												name: 'Dom Power + City Power',
												code: 'Dom Power + City Power',
											},

											{
												name: 'Dom Power + Telco',
												code: 'Dom Power + Telco',
											},
											{
												name: 'City Power + Telco',
												code: 'City Power + Telco',
											},
											{
												name: 'Dom Power + City Power + Telco',
												code: 'Dom Power + City Power + Telco',
											},
										],
									},
									input: {
										// Change input type to 'dropdown' to create a drop-down list
										type: 'dropdown',
										showNoValueOption: false,
									},
								}),
								,
							],
						},
					},
				],
			});

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
			pointLayer.on('apply-edits', function (event) {
				console.log(event);
				console.log(pointLayer);
				event.result
					.then(async (result) => {
						// Call the function to check for features

						console.log('result', result);
						console.log(editorState);
						if (
							result.edits.addFeatures.length > 0 &&
							isProgrammaticEdit
						) {
							console.log(
								'Graphic added to the FeatureLayer',
								result.edits.addFeatures[0]
							);
							let graphic = result.edits.addFeatures[0];
							graphic.layer = pointLayer;
							const description = await getPointDescription(
								graphic
							);
							console.log('DESCRIPTION', description);
							graphic.attributes = {
								...graphic.attributes,
								...description,
								utilityAttachments:
									description.utilityAttachments,
							};
							graphic.attributes.id = uuidv4();
							pointLayer
								.applyEdits({
									updateFeatures: [graphic],
								})
								.then(async (result) => {
									if (
										result.updateFeatureResults.length > 0
									) {
										console.log(
											'Features updated successfully',
											result.updateFeatureResults
										);
										console.log(
											'graphic of interest',
											graphic
										);
										const data = {
											graphic: JSON.stringify({
												graphic,
											}),
											graphic_id: graphic.attributes.id, // Replace with your actual graphic_id
										};
										console.log('first created data', data);
										try {
											const response = await axios.post(
												`${process.env.DATABASE_URL}/points`,
												data
											);
											console.log(
												'Response from server:',
												response.data
											);
										} catch (error) {
											console.error(
												'Error posting point:',
												error
											);
										}
										// Your custom logic here
									}
								})
								.catch((error) => {
									console.error(
										'Error updating features:',
										error
									);
								});
						}
					})
					.catch(async (result, error) => {
						console.error('Error applying edits:', error, result);
						if (result == 'User canceled') {
							const graphic = event.result.edits?.addFeatures[0];
							pointLayer.applyEdits({
								deleteFeatures: [graphic],
							});
						}
					});
			});
			groundFeatureLayer.on('apply-edits', function (event) {
				console.log(event);
				console.log(groundFeatureLayer);
				event.result
					.then(async (result) => {
						// Call the function to check for features

						console.log('result', result);
						console.log(editorState);
						if (
							result.edits.addFeatures.length > 0 &&
							isProgrammaticEdit
						) {
							console.log(
								'Graphic added to the FeatureLayer',
								result.edits.addFeatures[0]
							);
							let graphic = result.edits.addFeatures[0];
							graphic.layer = groundFeatureLayer;
							const description =
								await getGroundFeatureDescription(graphic);
							graphic.attributes = {
								...graphic.attributes,
								...description,
								utilityAttachments:
									description.utilityAttachments,
							};
							graphic.attributes.id = uuidv4();
							groundFeatureLayer
								.applyEdits({
									updateFeatures: [graphic],
								})
								.then(async (result) => {
									if (
										result.updateFeatureResults.length > 0
									) {
										console.log(
											'Features updated successfully',
											result.updateFeatureResults
										);
										console.log(
											'graphic of interest',
											graphic
										);
										const data = {
											graphic: JSON.stringify({
												graphic,
											}),
											graphic_id: graphic.attributes.id, // Replace with your actual graphic_id
										};
										console.log('first created data', data);
										try {
											const response = await axios.post(
												`${process.env.DATABASE_URL}/groundfeatures`,
												data
											);
											console.log(
												'Response from server:',
												response.data
											);
										} catch (error) {
											console.error(
												'Error posting point:',
												error
											);
										}
										// Your custom logic here
									}
								})
								.catch((error) => {
									console.error(
										'Error updating features:',
										error
									);
								});
						}
					})
					.catch((error) => {
						console.error('Error applying edits:', error);
					});
			});
			polylineLayer.on('apply-edits', function (event) {
				console.log(event);
				console.log(polylineLayer);
				event.result
					.then(async (result) => {
						// Call the function to check for features

						console.log('result', result);
						console.log(editorState);
						if (
							result.edits.addFeatures.length > 0 &&
							isProgrammaticEdit
						) {
							console.log(
								'Graphic added to the FeatureLayer',
								result.edits.addFeatures[0]
							);
							let graphic = result.edits.addFeatures[0];
							const description = await getPolylineDescription(
								graphic
							);
							graphic.attributes = {
								...graphic.attributes,
								...description,
								utilityAttachments:
									description.utilityAttachments,
							};
							graphic.attributes.id = uuidv4();
							polylineLayer
								.applyEdits({
									updateFeatures: [graphic],
								})
								.then(async (result) => {
									if (
										result.updateFeatureResults.length > 0
									) {
										console.log(
											'Features updated successfully',
											result.updateFeatureResults
										);
										console.log(
											'graphic of interest',
											graphic
										);
										const data = {
											graphic: JSON.stringify({
												graphic,
											}),
											graphic_id: graphic.attributes.id, // Replace with your actual graphic_id
										};
										console.log('first created data', data);
										try {
											const response = await axios.post(
												`${process.env.DATABASE_URL}/polylines`,
												data
											);
											console.log(
												'Response from server:',
												response.data
											);
										} catch (error) {
											console.error(
												'Error posting polyline:',
												error
											);
										}
										// Your custom logic here
									}
								})
								.catch((error) => {
									console.error(
										'Error updating features:',
										error
									);
								});
						}
					})
					.catch((error) => {
						console.error('Error applying edits:', error);
					});
			});
			undergroundLinesLayer.on('apply-edits', function (event) {
				console.log(event);
				console.log(undergroundLinesLayer);
				event.result
					.then(async (result) => {
						// Call the function to check for features

						console.log('result', result);
						console.log(editorState);
						if (
							result.edits.addFeatures.length > 0 &&
							isProgrammaticEdit
						) {
							console.log(
								'Graphic added to the FeatureLayer',
								result.edits.addFeatures[0]
							);
							let graphic = result.edits.addFeatures[0];
							const description =
								await getUndergroundLineDescription(graphic);
							graphic.attributes = {
								...graphic.attributes,
								...description,
								utilityAttachments:
									description.utilityAttachments,
							};
							console.log('GRAPHIC', graphic);
							graphic.attributes.id = uuidv4();
							undergroundLinesLayer
								.applyEdits({
									updateFeatures: [graphic],
								})
								.then(async (result) => {
									if (
										result.updateFeatureResults.length > 0
									) {
										console.log(
											'Features updated successfully',
											result.updateFeatureResults
										);
										console.log(
											'graphic of interest',
											graphic
										);
										const data = {
											graphic: JSON.stringify({
												graphic,
											}),
											graphic_id: graphic.attributes.id, // Replace with your actual graphic_id
										};
										console.log('first created data', data);
										try {
											const response = await axios.post(
												`${process.env.DATABASE_URL}/undergroundlines`,
												data
											);
											console.log(
												'Response from server:',
												response.data
											);
										} catch (error) {
											console.error(
												'Error posting undergroundLines:',
												error
											);
										}
										// Your custom logic here
									}
								})
								.catch((error) => {
									console.error(
										'Error updating features:',
										error
									);
								});
						}
					})
					.catch((error) => {
						console.error('Error applying edits:', error);
					});
			});
			let editorVM = editor.viewModel;
			console.log(editorVM);
			editorVM.watch('state', (state) => {
				if (state == 'creating-features') {
					isProgrammaticEdit = true;
				} else {
					isProgrammaticEdit = false;
				}

				console.log('state', state);
				if (state === 'editing-existing-feature') {
					refreshPopup();
					console.log(state);
				} else if (state === 'creating-features') {
				}
			});
			editorVM.watch('state', (state) => {
				console.log('state', state);
				if (state === 'ready') {
					const labelDivs = document.querySelectorAll('div.label');
					console.log('labels', labelDivs);
					// Loop through each element and modify or access its content
					labelDivs.forEach((div, index) => {
						// Example: Change the text content of each div
						div.textContent = `New Content ${index + 1}`; // e.g., "New Content 1", "New Content 2", etc.
					});
				}
			});

			var search = new Search({
				view: view,
			});
			const legend = new Legend({
				style: {
					type: 'card',
					layout: 'stack',
				},
				view: view,
				layerInfos: [
					{
						layer: pointLayer,
						title: 'Poles', // Optional, set a custom title for the layer in the legend
						legendElements: [
							{
								type: 'symbol-table', // autocasts as new SymbolTableElement
								title: 'Unknown Pole Owner', // Custom title for the defaultSymbol
								infos: [
									{
										label: 'Other Poles', // Custom label for the defaultSymbol in the legend
										symbol: pointRenderer.defaultSymbol, // Refer to the defaultSymbol
									},
								],
							},
						],
					},
					{
						layer: groundFeatureLayer,
						title: 'Ground Features', // Optional, set a custom title for the layer in the legend
					},
					{
						layer: polylineLayer,
						title: 'Overhead Lines', // Optional, set a custom title for the layer in the legend
					},
					{
						layer: undergroundLinesLayer,
						title: 'Underground Lines', // Optional, set a custom title for the layer in the legend
					},
				],
			});
			const editorExpand = new Expand({
				view: view,
				content: editor,
			});
			const legendExpand = new Expand({
				view: view,
				content: legend,
			});

			const utilityTypeElement =
				document.getElementById('utilityType-filter');

			// click event handler for seasons choices

			// User clicked on Winter, Spring, Summer or Fall
			// set an attribute filter on flood warnings layer view
			// to display the warnings issued in that season

			const utilityTypeExpand = new Expand({
				view: view,
				content: utilityTypeElement,
				expandIcon: 'filter',
				group: 'bottom-left',
			});
			view.ui.add(utilityTypeExpand, 'bottom-left');
			view.ui.add(search, {
				position: 'top-right',
			});
			view.ui.add(editorExpand, 'top-right');

			view.ui.add(legendExpand, 'bottom-right');
			view.when(() => {});
			view.when(() => {});

			view.on('key-down', (event) => {
				// Check if the Escape key (key code 'Escape') was pressed
				if (event.key === 'Escape') {
					// If pressed, cancel the current feature creation or editing
					editor.cancelWorkflow();
					console.log('Feature creation cancelled.');
				}
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

			view.when(() => {
				reactiveUtils.on(
					() => view.popup,
					'trigger-action',
					async (event) => {
						if (event.action.id === 'point-edit-this') {
							const selectedFeature = view.popup.selectedFeature;
							// editor.startUpdateWorkflowAtFeatureEdit(
							// 	view.popup.selectedFeature
							// );
							console.log('selected Feature', selectedFeature);
							const description = await getPointDescription(
								selectedFeature
							);
							selectedFeature.attributes = {
								...selectedFeature.attributes,
								...description,
								utilityAttachments:
									description.utilityAttachments,
							};
							const updatedFeature = JSON.stringify({
								graphic: selectedFeature,
							});

							const data = {
								graphic: updatedFeature,

								graphic_id: selectedFeature.attributes.id,
							};
							console.log('updated data', data);
							try {
								const response = await axios.post(
									`${process.env.DATABASE_URL}/update-point`,
									data
								);
								console.log(
									'Response from server:',
									response.data
								);
							} catch (error) {
								console.error('Error posting point:', error);
							}
							// Apply the edits
							const editResult = await selectedFeature.layer
								.applyEdits({
									updateFeatures: [selectedFeature],
								})
								.then(async (result) => {
									refreshPopup();
								})
								.catch((error) => {
									console.error(
										'Error updating features:',
										error
									);
								});

							if (editResult.updateFeatureResults.length > 0) {
								console.log(
									'Feature updated successfully:',
									editResult.updateFeatureResults
								);
								refreshPopup();
							} else {
								console.error(
									'Failed to update feature:',
									editResult
								);
							}
						}
					}
				);
			});
			view.when(() => {
				reactiveUtils.on(
					() => view.popup,
					'trigger-action',
					async (event) => {
						if (event.action.id === 'groundFeature-edit-this') {
							const selectedFeature = view.popup.selectedFeature;
							// editor.startUpdateWorkflowAtFeatureEdit(
							// 	view.popup.selectedFeature
							// );
							console.log('selected Feature', selectedFeature);
							const description =
								await getGroundFeatureDescription(
									selectedFeature
								);
							selectedFeature.attributes = {
								...selectedFeature.attributes,
								...description,
								utilityAttachments:
									description.utilityAttachments,
							};
							const updatedFeature = JSON.stringify({
								graphic: selectedFeature,
							});

							const data = {
								graphic: updatedFeature,

								graphic_id: selectedFeature.attributes.id,
							};
							console.log('updated data', data);
							try {
								const response = await axios.post(
									`${process.env.DATABASE_URL}/update-groundfeature`,
									data
								);
								console.log(
									'Response from server:',
									response.data
								);
							} catch (error) {
								console.error(
									'Error posting ground feature:',
									error
								);
							}
							// Apply the edits
							const editResult = await selectedFeature.layer
								.applyEdits({
									updateFeatures: [selectedFeature],
								})
								.then(async (result) => {
									refreshPopup();
								})
								.catch((error) => {
									console.error(
										'Error updating features:',
										error
									);
								});

							if (editResult.updateFeatureResults.length > 0) {
								console.log(
									'Feature updated successfully:',
									editResult.updateFeatureResults
								);
								refreshPopup();
							} else {
								console.error(
									'Failed to update feature:',
									editResult
								);
							}
						}
					}
				);
			});
			view.when(() => {
				reactiveUtils.on(
					() => view.popup,
					'trigger-action',
					async (event) => {
						if (event.action.id === 'polyline-edit-this') {
							const selectedFeature = view.popup.selectedFeature;
							// editor.startUpdateWorkflowAtFeatureEdit(
							// 	view.popup.selectedFeature
							// );
							console.log('selected Feature', selectedFeature);
							const description = await getPolylineDescription(
								selectedFeature
							);
							selectedFeature.attributes = {
								...selectedFeature.attributes,
								...description,
								utilityAttachments:
									description.utilityAttachments,
							};
							const updatedFeature = JSON.stringify({
								graphic: selectedFeature,
							});

							const data = {
								graphic: updatedFeature,

								graphic_id: selectedFeature.attributes.id,
							};
							console.log('updated data', data);
							try {
								const response = await axios.post(
									`${process.env.DATABASE_URL}/update-polyline`,
									data
								);
								console.log(
									'Response from server:',
									response.data
								);
							} catch (error) {
								console.error(
									'Error posting overhead line:',
									error
								);
							}
							// Apply the edits
							const editResult = await selectedFeature.layer
								.applyEdits({
									updateFeatures: [selectedFeature],
								})
								.then(async (result) => {
									console.log('hello');
									refreshPopup();
								})
								.catch((error) => {
									console.error(
										'Error updating features:',
										error
									);
								});

							if (editResult.updateFeatureResults.length > 0) {
								console.log(
									'Feature updated successfully:',
									editResult.updateFeatureResults
								);
								refreshPopup();
							} else {
								console.error(
									'Failed to update feature:',
									editResult
								);
							}
						}
						if (event.action.id === 'undergroundLine-edit-this') {
							const selectedFeature = view.popup.selectedFeature;
							// editor.startUpdateWorkflowAtFeatureEdit(
							// 	view.popup.selectedFeature
							// );
							console.log('selected Feature', selectedFeature);
							const description =
								await getUndergroundLineDescription(
									selectedFeature
								);
							selectedFeature.attributes = {
								...selectedFeature.attributes,
								...description,
								utilityAttachments:
									description.utilityAttachments,
							};
							const updatedFeature = JSON.stringify({
								graphic: selectedFeature,
							});

							const data = {
								graphic: updatedFeature,

								graphic_id: selectedFeature.attributes.id,
							};
							console.log('updated data', data);
							try {
								const response = await axios.post(
									`${process.env.DATABASE_URL}/update-undergroundline`,
									data
								);
								console.log(
									'Response from server:',
									response.data
								);
							} catch (error) {
								console.error(
									'Error updating undergroundline:',
									error
								);
							}
							// Apply the edits
							const editResult = await selectedFeature.layer
								.applyEdits({
									updateFeatures: [selectedFeature],
								})
								.then(async (result) => {
									console.log('hello');
									refreshPopup();
								})
								.catch((error) => {
									console.error(
										'Error updating features:',
										error
									);
								});

							if (editResult.updateFeatureResults.length > 0) {
								console.log(
									'Feature updated successfully:',
									editResult.updateFeatureResults
								);
								refreshPopup();
							} else {
								console.error(
									'Failed to update feature:',
									editResult
								);
							}
						}
					}
				);
			});
			view.when(() => {
				reactiveUtils.on(
					() => view.popup,
					'trigger-action',
					async (event) => {
						if (event.action.id === 'point-delete-this') {
							const confirmDelete = window.confirm(
								'Are you sure you want to delete this Pole?'
							);

							if (!confirmDelete) {
								// If the user clicks "Cancel", stop the execution
								return;
							}
							const selectedFeature = view.popup.selectedFeature;
							// editor.startUpdateWorkflowAtFeatureEdit(
							// 	view.popup.selectedFeature
							// );
							console.log('selected Feature', selectedFeature);

							const updatedFeature = JSON.stringify({
								graphic: selectedFeature,
							});

							const data = {
								graphic: updatedFeature,

								graphic_id: selectedFeature.attributes.id,
							};
							console.log('updated data', data);
							try {
								const response = await axios.delete(
									`${process.env.DATABASE_URL}/points/${selectedFeature.attributes.id}`
								);
								console.log(
									'Response from server:',
									response.data
								);
							} catch (error) {
								console.error('Error posting point:', error);
							}
							// Apply the edits
							const editResult = await selectedFeature.layer
								.applyEdits({
									deleteFeatures: [selectedFeature],
								})
								.then(async (result) => {
									refreshPopup();
								})
								.catch((error) => {
									console.error(
										'Error updating features:',
										error
									);
								});

							if (editResult.updateFeatureResults.length > 0) {
								console.log(
									'Feature updated successfully:',
									editResult.updateFeatureResults
								);
								refreshPopup();
							} else {
								console.error(
									'Failed to update feature:',
									editResult
								);
							}
						}
					}
				);
			});
			view.when(() => {
				reactiveUtils.on(
					() => view.popup,
					'trigger-action',
					async (event) => {
						if (event.action.id === 'groundFeature-delete-this') {
							const confirmDelete = window.confirm(
								'Are you sure you want to delete this Ground Feature?'
							);

							if (!confirmDelete) {
								// If the user clicks "Cancel", stop the execution
								return;
							}
							const selectedFeature = view.popup.selectedFeature;
							// editor.startUpdateWorkflowAtFeatureEdit(
							// 	view.popup.selectedFeature
							// );
							console.log('selected Feature', selectedFeature);

							const updatedFeature = JSON.stringify({
								graphic: selectedFeature,
							});

							const data = {
								graphic: updatedFeature,

								graphic_id: selectedFeature.attributes.id,
							};
							console.log('updated data', data);
							try {
								const response = await axios.delete(
									`${process.env.DATABASE_URL}/groundfeatures/${selectedFeature.attributes.id}`
								);
								console.log(
									'Response from server:',
									response.data
								);
							} catch (error) {
								console.error('Error posting point:', error);
							}
							// Apply the edits
							const editResult = await selectedFeature.layer
								.applyEdits({
									deleteFeatures: [selectedFeature],
								})
								.then(async (result) => {
									refreshPopup();
								})
								.catch((error) => {
									console.error(
										'Error updating features:',
										error
									);
								});

							if (editResult.updateFeatureResults.length > 0) {
								console.log(
									'Feature updated successfully:',
									editResult.updateFeatureResults
								);
								refreshPopup();
							} else {
								console.error(
									'Failed to update feature:',
									editResult
								);
							}
						}
					}
				);
			});
			view.when(() => {
				reactiveUtils.on(
					() => view.popup,
					'trigger-action',
					async (event) => {
						if (event.action.id === 'polyline-delete-this') {
							const confirmDelete = window.confirm(
								'Are you sure you want to delete this Overhead Line?'
							);

							if (!confirmDelete) {
								// If the user clicks "Cancel", stop the execution
								return;
							}
							const selectedFeature = view.popup.selectedFeature;
							// editor.startUpdateWorkflowAtFeatureEdit(
							// 	view.popup.selectedFeature
							// );
							console.log('selected Feature', selectedFeature);

							const updatedFeature = JSON.stringify({
								graphic: selectedFeature,
							});

							const data = {
								graphic: updatedFeature,

								graphic_id: selectedFeature.attributes.id,
							};
							console.log('updated data', data);
							try {
								const response = await axios.delete(
									`${process.env.DATABASE_URL}/polylines/${selectedFeature.attributes.id}`
								);
								console.log(
									'Response from server:',
									response.data
								);
							} catch (error) {
								console.error('Error posting point:', error);
							}
							// Apply the edits
							const editResult = await selectedFeature.layer
								.applyEdits({
									deleteFeatures: [selectedFeature],
								})
								.then(async (result) => {
									result.preventDefault();
									refreshPopup();
								})
								.catch((error) => {
									console.error(
										'Error updating features:',
										error
									);
								});

							if (editResult.updateFeatureResults.length > 0) {
								console.log(
									'Feature updated successfully:',
									editResult.updateFeatureResults
								);
								refreshPopup();
							} else {
								console.error(
									'Failed to update feature:',
									editResult
								);
							}
						}
					}
				);
			});
			view.when(() => {
				reactiveUtils.on(
					() => view.popup,
					'trigger-action',
					async (event) => {
						if (event.action.id === 'undergroundLine-delete-this') {
							const confirmDelete = window.confirm(
								'Are you sure you want to delete this Underground Line?'
							);

							if (!confirmDelete) {
								// If the user clicks "Cancel", stop the execution
								return;
							}
							const selectedFeature = view.popup.selectedFeature;
							// editor.startUpdateWorkflowAtFeatureEdit(
							// 	view.popup.selectedFeature
							// );
							console.log('selected Feature', selectedFeature);

							const updatedFeature = JSON.stringify({
								graphic: selectedFeature,
							});

							const data = {
								graphic: updatedFeature,

								graphic_id: selectedFeature.attributes.id,
							};
							console.log('updated data', data);
							try {
								const response = await axios.delete(
									`${process.env.DATABASE_URL}/undergroundlines/${selectedFeature.attributes.id}`
								);
								console.log(
									'Response from server:',
									response.data
								);
							} catch (error) {
								console.error('Error posting point:', error);
							}
							// Apply the edits
							const editResult = await selectedFeature.layer
								.applyEdits({
									deleteFeatures: [selectedFeature],
								})
								.then(async (result) => {
									result.preventDefault();
									refreshPopup();
								})
								.catch((error) => {
									console.error(
										'Error updating features:',
										error
									);
								});

							if (editResult.updateFeatureResults.length > 0) {
								console.log(
									'Feature updated successfully:',
									editResult.updateFeatureResults
								);
								refreshPopup();
							} else {
								console.error(
									'Failed to update feature:',
									editResult
								);
							}
						}
					}
				);
			});
		}
		return () => {
			console.log('Cleanup due to dependency change:');
			pointLayerRef.current = null;
			undergroundLinesLayerRef.current = null;
			polylineLayerRef.current = null;
			groundFeatureLayerRef.current = null;
			window.location.reload();
		};
	}, []);

	const handleUtilityTypeFilter = (event) => {
		const selectedUtilityType = event.target.value;
		const checked = event.target.checked;

		setUtilityTypeFilterState((prev) => {
			if (checked) {
				// Add the selected utility type if checked
				return [...prev, selectedUtilityType];
			} else {
				// Remove the selected utility type if unchecked
				return prev.filter((item) => item !== selectedUtilityType);
			}
		});
	};
	const handleFeatureLayerFilter = (event) => {
		const selectedFeatureLayer = event.target.value;
		const checked = event.target.checked;

		setFeatureLayerFilterState((prev) => {
			if (checked) {
				// Add the selected utility type if checked
				return [...prev, selectedFeatureLayer];
			} else {
				// Remove the selected utility type if unchecked
				return prev.filter((item) => item !== selectedFeatureLayer);
			}
		});
	};
	const applyFilter = () => {
		// Get the current state of filterPhraseState
		const utilityTypeFilters = utilityTypeFilterState;
		const featureLayerFilters = featureLayerFilterState;
		// Build the definitionExpression by mapping and joining the filters
		const utilityTypeFilterLocal = utilityTypeFilters
			.map((type) => `utilityType LIKE '%${type}%'`)
			.join(' OR ');

		// Apply the filter to all layers
		pointLayerRef.current.definitionExpression = utilityTypeFilterLocal;
		undergroundLinesLayerRef.current.definitionExpression =
			utilityTypeFilterLocal;
		polylineLayerRef.current.definitionExpression = utilityTypeFilterLocal;
		groundFeatureLayerRef.current.definitionExpression =
			utilityTypeFilterLocal;

		pointLayerRef.current.visible =
			featureLayerFilters.includes('pointLayer');
		undergroundLinesLayerRef.current.visible = featureLayerFilters.includes(
			'undergroundLinesLayer'
		);
		polylineLayerRef.current.visible =
			featureLayerFilters.includes('polylineLayer');
		groundFeatureLayerRef.current.visible =
			featureLayerFilters.includes('groundFeatureLayer');
	};
	return (
		<>
			<div
				id='utilityType-filter'
				className='esri-widget'
			>
				<label>
					<input
						type='checkbox'
						name='utilityType'
						value='Telco'
						onChange={handleUtilityTypeFilter}
						defaultChecked
					/>
					Telco
				</label>
				<label>
					<input
						type='checkbox'
						name='utilityType'
						value='City Power'
						onChange={handleUtilityTypeFilter}
						defaultChecked
					/>
					City Power
				</label>
				<label>
					<input
						type='checkbox'
						name='utilityType'
						value='Dom Power'
						onChange={handleUtilityTypeFilter}
						defaultChecked
					/>
					Dom Power
				</label>
				<label>
					<input
						type='checkbox'
						name='utilityType'
						value='pointLayer'
						onChange={handleFeatureLayerFilter}
						defaultChecked
					/>
					Poles
				</label>
				<label>
					<input
						type='checkbox'
						name='utilityType'
						value='groundFeatureLayer'
						onChange={handleFeatureLayerFilter}
						defaultChecked
					/>
					Ground Features
				</label>
				<label>
					<input
						type='checkbox'
						name='utilityType'
						value='polylineLayer'
						onChange={handleFeatureLayerFilter}
						defaultChecked
					/>
					Overhead Lines
				</label>
				<label>
					<input
						type='checkbox'
						name='utilityType'
						value='undergroundLinesLayer'
						onChange={handleFeatureLayerFilter}
						defaultChecked
					/>
					Underground Lines
				</label>
				<button onClick={applyFilter}>Apply Filter</button>
			</div>

			{showPointForm && (
				<PointDescriptionForm
					onSubmit={showPointForm.onSubmit}
					onClose={showPointForm.onClose}
					graphic={showPointForm.graphic}
				/>
			)}
			{showGroundFeatureForm && (
				<GroundFeatureDescriptionForm
					onSubmit={showGroundFeatureForm.onSubmit}
					onClose={showGroundFeatureForm.onClose}
					graphic={showGroundFeatureForm.graphic}
				/>
			)}
			{showPolylineForm && (
				<PolylineDescriptionForm
					onSubmit={showPolylineForm.onSubmit}
					onClose={showPolylineForm.onClose}
					graphic={showPolylineForm.graphic}
				/>
			)}
			{showUndergroundLineForm && (
				<UndergroundLineDescriptionForm
					onSubmit={showUndergroundLineForm.onSubmit}
					onClose={showUndergroundLineForm.onClose}
					graphic={showUndergroundLineForm.graphic}
				/>
			)}
			<div
				className='mapDiv'
				ref={mapDiv}
			></div>
		</>
	);
};

export default MapComponent;
