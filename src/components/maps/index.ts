// Barrel export para componentes de mapa
// Todos usam Leaflet + OpenStreetMap (100% gratuito)

export { default as BaseMap } from './BaseMap'
export { default as LocationPicker } from './LocationPicker'
export { default as WorkshopMapLeaflet } from './WorkshopMapLeaflet'
export { default as OfficeDetailMapLeaflet } from './OfficeDetailMapLeaflet'
export { default as LeafletCSS } from './LeafletCSS'

// Tipos e utilitários
export type { MapPosition, GeocodingResult } from './BaseMap'
export type { LocationPickerResult } from './LocationPicker'
export { reverseGeocode, geocodeAddress } from './BaseMap'
