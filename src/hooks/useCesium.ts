import * as cesium from "cesium"

cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_TOKEN
export const options: cesium.Viewer.ConstructorOptions = {
  infoBox: true,
  selectionIndicator: true,
  animation: true,
  baseLayerPicker: true,
  geocoder: true,
  navigationHelpButton: true,
  fullscreenButton: true,
  homeButton: true,
  sceneModePicker: true,
  timeline: true,
  shadows: true,
  shouldAnimate: true,
}

export async function useCesium(element: HTMLElement) {
  const viewer = new cesium.Viewer(element, {
    ...options,
    terrainProvider: await cesium.createWorldTerrain,
  })
  viewer.scene.globe.depthTestAgainstTerrain = true
  //清除版权信息
  const creditContainer = viewer.cesiumWidget.creditContainer as HTMLElement
  creditContainer.style.display = "none"
  return { viewer }
}
