'use client'

import { useEffect } from 'react'

/**
 * Componente que injeta o CSS do Leaflet globalmente.
 * Deve ser renderizado uma vez na árvore de componentes que usa mapas.
 */
export default function LeafletCSS() {
  useEffect(() => {
    // Verifica se o CSS já foi injetado
    if (document.getElementById('leaflet-css')) return

    const link = document.createElement('link')
    link.id = 'leaflet-css'
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
    link.crossOrigin = ''
    document.head.appendChild(link)

    // CSS customizado para os marcadores
    const style = document.createElement('style')
    style.id = 'leaflet-custom-css'
    style.textContent = `
      .leaflet-container {
        font-family: inherit;
        z-index: 1;
      }
      .custom-marker-pin {
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        background: #e11d48;
        position: absolute;
        transform: rotate(-45deg);
        left: 50%;
        top: 50%;
        margin: -18px 0 0 -18px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      }
      .custom-marker-pin::after {
        content: '';
        width: 20px;
        height: 20px;
        margin: 2px 0 0 2px;
        background: white;
        position: absolute;
        border-radius: 50%;
      }
      .workshop-marker {
        background: none;
        border: none;
      }
      .workshop-marker-content {
        display: flex;
        align-items: center;
        gap: 4px;
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 9999px;
        padding: 6px 10px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
        font-size: 12px;
        font-weight: 600;
        color: #1f2937;
      }
      .workshop-marker-content:hover {
        border-color: #3b82f6;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        transform: scale(1.05);
      }
      .workshop-marker-content.selected {
        border-color: #3b82f6;
        background: #3b82f6;
        color: white;
      }
      .workshop-marker-arrow {
        position: absolute;
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%) rotate(45deg);
        width: 10px;
        height: 10px;
        background: white;
        border-right: 2px solid #e5e7eb;
        border-bottom: 2px solid #e5e7eb;
      }
      .location-picker-marker {
        background: none;
        border: none;
      }
      .location-pulse {
        width: 14px;
        height: 14px;
        background: #3b82f6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
        animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
      }
      @keyframes pulse-ring {
        0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
        70% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
        100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
      }
      .leaflet-popup-content-wrapper {
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        padding: 0;
        overflow: hidden;
      }
      .leaflet-popup-content {
        margin: 0;
        min-width: 220px;
      }
      .leaflet-popup-tip {
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
    `
    document.head.appendChild(style)

    return () => {
      // Cleanup opcional (normalmente não removemos pois outros componentes podem precisar)
    }
  }, [])

  return null
}
