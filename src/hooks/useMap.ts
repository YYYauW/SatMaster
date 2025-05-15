import * as L from "leaflet"
import "leaflet/dist/leaflet.css"
import { onMounted, shallowRef, type Ref } from "vue"

export function useMap(element: Ref<HTMLElement | undefined>) {
  const map = shallowRef<L.Map>()
  const tile = shallowRef<L.TileLayer>()
  onMounted(() => {
    const container = element.value as HTMLElement
    map.value = L.map(container, {
      center: [30, 120],
      zoom: 10,
      zoomControl: false,
      attributionControl: false,
    })
    tile.value = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png")
    map.value!.addLayer(tile.value)
  })
  return {
    map,
  }
}
