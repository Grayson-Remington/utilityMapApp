import React, { useRef, useEffect } from 'react';
import MapView from '@arcgis/core/views/MapView';
import Sketch from '@arcgis/core/widgets/Sketch';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import axios from 'axios';

const MapComponent = ({
	selectedImage,
	setShowForm,
	setGraphics,
	graphicsLayerRef,

	viewRef,
	sketchRef,
	isEditMode,
	handleGraphicDelete,
	addSketchCreateEvent,
	removeSketchCreateEvent,
}) => {
	const mapDiv = useRef(null);

	useEffect(() => {
		if (mapDiv.current) {
			const graphicsLayer = new GraphicsLayer({
				minScale: 50000,
			});
			graphicsLayerRef.current = graphicsLayer;

			const view = new MapView({
				container: mapDiv.current,
				map: {
					basemap: 'satellite',
					layers: [graphicsLayer],
				},
				center: [-77.436, 37.5407],
				zoom: 12,
			});

			viewRef.current = view;

			const sketch = new Sketch({
				view: view,
				layer: graphicsLayer,
				creationMode: 'single',
				availableCreateTools: ['point'],
				updateOnGraphicClick: false,
				visibleElements: {
					createTools: {
						point: true,
						polygon: false,
						polyline: false,
						rectangle: false,
						circle: false,
					},
					selectionTools: {
						'rectangle-selection': false,
						'lasso-selection': false,
					},
					settingsMenu: false,
				},
				visible: false,
			});
			sketchRef.current = sketch;

			addSketchCreateEvent(selectedImage);

			sketch.on('delete', handleGraphicDelete);

			view.on('click', (event) => {
				view.hitTest(event).then((response) => {
					const graphic = response.results.filter((result) => {
						return (
							result.graphic.layer === graphicsLayerRef.current
						);
					})[0]?.graphic;

					if (graphic) {
						view.openPopup({
							features: [graphic],
							location: event.mapPoint,
						});
					}
				});
			});

			if (isEditMode) {
				view.ui.add(sketch, 'top-right');
			} else {
				view.ui.remove(sketch);
			}

			view.ui.add(document.getElementById('customTextDiv'), 'top-right');
			view.ui.add(
				document.getElementById('customTextDiv2'),
				'bottom-right'
			);
		}

		return () => {
			removeSketchCreateEvent();
		};
	}, [isEditMode, selectedImage]);

	useEffect(() => {
		const fetchPoints = async () => {
			try {
				const response = await axios.get(
					'http://localhost:5000/points'
				);
				const fetchedPoints = response.data;
				const customSymbol = {
					type: 'picture-marker',
					url: selectedImage, // Use the selected image URL
					width: '48px',
					height: '48px',
					yoffset: '24px',
				};

				const graphics = fetchedPoints.map((point) => {
					const graphicObject = JSON.parse(point.graphic);
					const graphicData = {
						geometry: new Graphic({
							x: graphicObject.geometry.x,
							y: graphicObject.geometry.y,
							spatialReference:
								graphicObject.geometry.spatialReference,
						}),
						symbol: customSymbol,
						attributes: {
							description: graphicObject.description,
						},
						popupTemplate: {
							title: graphicObject.popupTemplate.title,
							content: graphicObject.popupTemplate.description,
						},
					};
					const graphic = new Graphic({
						isEditable: false,
						geometry: graphicData.geometry,
						symbol: graphicData.symbol,
						attributes: graphicData.attributes,
						popupTemplate: graphicData.popupTemplate,
					});

					graphicsLayerRef.current.add(graphic);
					return {
						geometry: graphic.geometry,
						description: point.description,
					};
				});

				setGraphics(graphics);
			} catch (error) {
				console.error('Error fetching points:', error);
			}
		};

		fetchPoints();
	}, []);

	return (
		<div
			className='mapDiv'
			ref={mapDiv}
		></div>
	);
};

export default MapComponent;
