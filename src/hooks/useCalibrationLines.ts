import * as Cesium from "cesium"

export type CalibrationSite = {
  id: number
  name: string
  lat: number
  lng: number
}

const calibrationSites: CalibrationSite[] = [
  { id: 5, name: "定标场5", lat: 40.18, lng: 94.27 },
  { id: 7, name: "定标场7", lat: 40.14, lng: 89.12 },
  { id: 2, name: "定标场2", lat: 24.42, lng: 13.35 },
]

export function showCalibrationSites(viewer: Cesium.Viewer) {
  calibrationSites.forEach(site => {
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(site.lng, site.lat),
      point: {
        pixelSize: 8,
        color: Cesium.Color.ORANGE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
      },
      label: {
        text: site.name,
        font: "14px sans-serif",
        pixelOffset: new Cesium.Cartesian2(0, -20),
        fillColor: Cesium.Color.WHITE,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      },
    })
  })
}

export function drawLinkToNearestSite(viewer: Cesium.Viewer, groundPosition: Cesium.Cartesian3) {
  let minDist = Number.MAX_VALUE
  let nearestSite: CalibrationSite | null = null

  calibrationSites.forEach(site => {
    const sitePos = Cesium.Cartesian3.fromDegrees(site.lng, site.lat)
    const dist = Cesium.Cartesian3.distance(groundPosition, sitePos)
    if (dist < minDist) {
      minDist = dist
      nearestSite = site
    }
  })

  if (nearestSite !== null && minDist < 3000000) {
    const sitePos = Cesium.Cartesian3.fromDegrees((nearestSite as CalibrationSite).lng, (nearestSite as CalibrationSite).lat)
    viewer.entities.add({
      polyline: {
        positions: [groundPosition, sitePos],
        width: 2,
        material: Cesium.Color.YELLOW.withAlpha(0.8),
      },
    })
  }
}