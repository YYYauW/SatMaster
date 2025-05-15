<template>
  <BasePanel title="实时定位">
    <div class="base-map-preview" ref="container"> </div>
  </BasePanel>
</template>
<script setup lang="ts">
  import { onMounted, ref } from "@vue/runtime-core"
  import { useMap } from "@/hooks/useMap"
  import * as L from "leaflet"
  import BasePanel from "@/components/BasePanel.vue"
  import type { LineString, MultiLineString } from "geojson"
  interface PropsType {
    data: {
      lat: number
      lng: number
      altitude: number
      heading: number
      pitch: number
      roll: number
      correction: number
      speed: number
    }
  }
  const props = defineProps<PropsType>()
  const container = ref<HTMLElement>()
  const polyline = ref<L.Polyline<LineString | MultiLineString, any>>()
  const points: L.LatLngExpression[] = []
  const { map } = useMap(container)
  const update = () => {
    if (polyline.value) {
      polyline.value.addLatLng([props.data.lat, props.data.lng])
      map.value?.panTo([props.data.lat, props.data.lng])
    }
  }
  onMounted(() => {
    polyline.value = L.polyline(points, { color: "blue" }).addTo(map.value!)
    setInterval(() => {
      update()
    }, 1000 * 0.5)
  })
</script>
<style lang="scss" scoped>
  .base-map-preview {
    width: 100%;
    height: 200px;
  }
</style>
