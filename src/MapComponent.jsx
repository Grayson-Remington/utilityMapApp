import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import MapView from '@arcgis/core/views/MapView';

import Search from '@arcgis/core/widgets/Search';

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

const MapComponent = () => {
	const mapDiv = useRef(null);
	const viewRef = useRef(null);
	const editorRef = useRef(null);
	const pointLayerRef = useRef(null);
	const polylineLayerRef = useRef(null);
	const [editorState, setEditorState] = useState('');
	const [showPointForm, setShowPointForm] = useState(false);
	const [showPolylineForm, setShowPolylineForm] = useState(false);

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
			const pointSymbol = {
				type: 'picture-marker',
				url: imageOptions[0].url, // Use the selected image URL
				width: '48px',
				height: '48px',
				yoffset: '24px',
			};
			const polylineSymbol = {
				type: 'simple-line', // Symbol type
				color: [226, 119, 40, 0.8], // RGBA color value
				width: 4, // Line width in pixels
				style: 'solid', // Line style: solid, dashed, etc.
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
<br/>
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
				<h3>Pole Information</h3>
					   <table id="customers">
  <tr>
    <th>Dominion Power Phase</th>
    <th>City Power Phase</th>
		<th>City Power Laterals</th>
  </tr>
  <tr>
    <td>${attributes.domPowerPhase || ''}</td>
    <td>${attributes.cityPowerPhase || ''}</td>
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

			const renderer = new SimpleRenderer({
				symbol: pointSymbol,
			});
			const polylineRenderer = new SimpleRenderer({
				symbol: polylineSymbol,
			});
			const pointLayer = new FeatureLayer({
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
					actions: [pointEditThisAction, pointDeleteThisAction],
					content: pointPopupContent,
				},
				renderer: renderer,
				minScale: 5000,
			});
			pointLayerRef.current = pointLayer;
			const polylineLayer = new FeatureLayer({
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
					actions: [polylineEditThisAction, polylineDeleteThisAction], // Define actions if needed
					content: polylinePopupContent, // Define content for the popup
				},
				renderer: polylineRenderer, // Define your renderer as needed
				minScale: 5000,
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
					console.log('fetched Points', fetchedPolylines);
				} catch (error) {
					console.error('Error fetching points:', error);
				}
			};
			polylineLayer.when(() => {
				fetchPolylines();
			});
			polylineLayerRef.current = polylineLayer;
			const view = new MapView({
				container: mapDiv.current,
				map: {
					basemap: 'satellite',
					layers: [pointLayer, polylineLayer],
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
						{ layer: polylineLayer, enabled: true },
					],
				},
				layerInfos: [
					{
						layer: pointLayer,
						title: 'NCNG MOS Vacancy',
						formTemplate: {
							// autocastable to FormTemplate
							elements: [
								{
									// autocastable to FieldElement
									type: 'field',
									fieldName: 'poleNumber',
									label: 'Pole Number',
								},
								{
									type: 'field',
									fieldName: 'poleOwner',
									label: 'Pole Owner',
								},
							],
						},
					},
					{
						layer: polylineLayer,
						formTemplate: {
							// autocastable to FormTemplate
							elements: [
								{
									// autocastable to FieldElement
									type: 'field',
									fieldName: 'domPowerPhase',
									label: 'Dominion Power Phase',
								},
								{
									type: 'field',
									fieldName: 'cityPowerPhase',
									label: 'City Power Phase',
								},
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
							graphic.layer = pointLayer;
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

			var search = new Search({
				view: view,
			});

			view.ui.add(editor, 'top-right');
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
								console.error('Error posting point:', error);
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
						if (event.action.id === 'polyline-delete-this') {
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
		}
	}, []);

	return (
		<>
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
};

export default MapComponent;
