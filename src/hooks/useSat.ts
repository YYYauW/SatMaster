/**
 * @file useUav.ts
 * @description Vue composable for satellite flight control, trajectory updating, and Pareto result application.
 * @author Wei Yao
 * @email yyyauw@whu.edu.cn
 * @date 2025-04-27
 * @license MIT
 */


import { reactive, ref } from "vue"
import * as Cesium from "cesium"
import waypoints1 from "../../public/models/waypoints1.json"
import waypoints2 from "../../public/models/waypoints2.json"

// Add type definition for waypoints
interface Waypoint {
  time: string;
  lat: number;
  lng: number;
  alt: number;
}

export type FlightParamsType = {
  lat: number
  lng: number
  altitude: number
  heading: number
  pitch: number
  roll: number
  correction: number
  speed: number
}

export function useUav(viewer: Cesium.Viewer, uri: string, id: string, index: number) {
  const DIRECTION_ENUM = {
    UP: "w",
    DOWN: "s",
    LEFT: "a",
    RIGHT: "d",
    SPEED_UP: "q",
    SPEED_DOWN: "e",
  }
  const keysMap = Object.fromEntries(Object.values(DIRECTION_ENUM).map(k => [k, false]))

  const flightParamsList = [reactive<FlightParamsType>({
    lat: 30, lng: 120, altitude: 2000,
    heading: 0, pitch: 0, roll: 0,
    correction: 1, speed: 1224,
  }), reactive<FlightParamsType>({
    lat: 35, lng: 110, altitude: 2000,
    heading: 0, pitch: 0, roll: 0,
    correction: 1, speed: 1224,
  })]

  const autoFly = ref(true)
  const manualAttitudeOverride = ref(false)
  const sensorVisible = ref(true)
  const currentControlled = ref<0 | 1>(0)

  const waypointList: Waypoint[][] = [waypoints1 as Waypoint[], waypoints2 as Waypoint[]]
  const models: Cesium.Entity[] = []
  const groundPoints: Cesium.Entity[] = []
  const pathPositionsList: Cesium.Cartesian3[][] = []

  const clockStart = Cesium.JulianDate.fromIso8601("2021-06-01T00:00:00Z")
  const clockStop = Cesium.JulianDate.fromIso8601("2021-06-10T00:00:00Z")
  viewer.clock.startTime = clockStart.clone()
  viewer.clock.stopTime = clockStop.clone()
  viewer.clock.currentTime = clockStart.clone()
  viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP
  viewer.clock.multiplier = 60
  viewer.timeline.zoomTo(clockStart, clockStop)

  for (let i = 0; i < 2; i++) {
    const pos = Cesium.Cartesian3.fromDegrees(flightParamsList[i].lng, flightParamsList[i].lat, flightParamsList[i].altitude)
    const hpr = new Cesium.HeadingPitchRoll()
    const ori = Cesium.Transforms.headingPitchRollQuaternion(pos, hpr)
    const model = viewer.entities.add({
      id: `uax-${i}`,
      name: `卫星${i + 1}`,
      position: pos,
      //@ts-ignore
      orientation: ori,
      model: {
        uri,
        minimumPixelSize: 128,
        maximumScale: 20000,
        runAnimations: true,
      },
    })
    models.push(model)

    groundPoints.push(viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(0, 0, 0),
      point: { pixelSize: 6, color: Cesium.Color.YELLOW, outlineColor: Cesium.Color.BLACK, outlineWidth: 2 },
      label: { text: `Ground ${i + 1}`, font: "12px sans-serif", pixelOffset: new Cesium.Cartesian2(0, -16) },
    }))

    pathPositionsList.push([])

    viewer.entities.add({
      polyline: {
        positions: new Cesium.CallbackProperty(() => pathPositionsList[i], false),
        width: 2,
        material: i === 0 ? Cesium.Color.CYAN : Cesium.Color.PINK.withAlpha(0.7),
      },
    })

    // Sensor Cone
    viewer.entities.add({
      name: `Sensor Cone ${i + 1}`,
      show: sensorVisible.value,
      position: new Cesium.CallbackProperty(() => {
        const t = viewer.clock.currentTime
        const sat = models[i].position?.getValue(t)
        const gnd = groundPoints[i].position?.getValue(t)
        if (!sat || !gnd) return Cesium.Cartesian3.ZERO
        return Cesium.Cartesian3.lerp(sat, gnd, 0.5, new Cesium.Cartesian3())
      }, false) as unknown as Cesium.PositionProperty,

      orientation: new Cesium.CallbackProperty(() => {
        const t = viewer.clock.currentTime
        const satPos = model.position?.getValue(t)
        if (!satPos) return Cesium.Quaternion.IDENTITY
      
        const hpr = new Cesium.HeadingPitchRoll(
          flightParamsList[i].heading,
          flightParamsList[i].pitch,
          flightParamsList[i].roll
        )
      
        return Cesium.Transforms.headingPitchRollQuaternion(satPos, hpr)
      }, false),
      
      cylinder: {
        length: new Cesium.CallbackProperty(() => {
          const t = viewer.clock.currentTime
          const sat = models[i].position?.getValue(t)
          const gnd = groundPoints[i].position?.getValue(t)
          return sat && gnd ? Cesium.Cartesian3.distance(sat, gnd) : 1
        }, false),

        topRadius: 0,
        bottomRadius: new Cesium.CallbackProperty(() => {
          const t = viewer.clock.currentTime
          const sat = models[i].position?.getValue(t)
          const gnd = groundPoints[i].position?.getValue(t)
          if (!sat || !gnd) return 1
          const d = Cesium.Cartesian3.distance(sat, gnd)
          return Math.tan(Cesium.Math.toRadians(45)) * d
        }, false),

        material: Cesium.Color.SKYBLUE.withAlpha(0.35),
      },
    })
  }

  const adjustFlightParams = () => {
    const idx = currentControlled.value
    const p = flightParamsList[idx]

    if (keysMap[DIRECTION_ENUM.SPEED_UP]) p.speed += 100
    if (keysMap[DIRECTION_ENUM.SPEED_DOWN] && p.speed >= 500) p.speed -= 100
    if (keysMap[DIRECTION_ENUM.UP] && p.pitch <= 0.3) p.pitch += 0.005
    if (keysMap[DIRECTION_ENUM.DOWN] && p.pitch >= -0.3) p.pitch -= 0.01
    if (keysMap[DIRECTION_ENUM.LEFT]) p.roll -= 0.005
    if (keysMap[DIRECTION_ENUM.RIGHT]) p.roll += 0.005

    const { heading, pitch, roll } = p
    const { abs, cos } = Math
    p.correction = abs(cos(heading) * cos(pitch))
    if (abs(pitch) < 0.001) p.pitch = 0
    if (abs(roll) < 0.001) p.roll = 0
    if (abs(heading) < 0.001) p.heading = 0
  }

  const adjustFlightAttitude = () => {
    const timeNow = viewer.clock.currentTime
    for (let i = 0; i < 2; i++) {
      const waypoints = waypointList[i]
      const fp = flightParamsList[i]
      if (waypoints.length < 2) continue

      const now = Cesium.JulianDate.toDate(timeNow)
      const elapsed = now.getTime() - new Date("2021-06-01T00:00:00Z").getTime()
      let j = 1
      while (j < waypoints.length && new Date(waypoints[j].time).getTime() - new Date("2021-06-01T00:00:00Z").getTime() < elapsed) j++
      if (j >= waypoints.length) continue

      const p0 = waypoints[j - 1]
      const p1 = waypoints[j]
      const t0 = new Date(p0.time).getTime()
      const t1 = new Date(p1.time).getTime()
      const ratio = (elapsed - t0 + new Date("2021-06-01T00:00:00Z").getTime()) / (t1 - t0)

      const lerp = (a: number, b: number) => a + (b - a) * ratio
      const lat = lerp(p0.lat, p1.lat)
      const lng = lerp(p0.lng, p1.lng)
      const alt = lerp(p0.alt, p1.alt)

      fp.lat = lat
      fp.lng = lng
      fp.altitude = alt

      const dLat = Cesium.Math.toRadians(p1.lat - p0.lat)
      const dLng = Cesium.Math.toRadians(p1.lng - p0.lng)
      const autoHeading = Math.atan2(dLng, dLat) + Cesium.Math.toRadians(85)


      if (!manualAttitudeOverride.value) {
        if (i === currentControlled.value) {
          // ✅ 当前选中卫星：平滑调整 heading
          const delta = autoHeading - fp.heading
          const shortest = Math.atan2(Math.sin(delta), Math.cos(delta))
          fp.heading += shortest * 0.1
        } else {
          // ✅ 非选中卫星：直接对齐
          fp.heading = autoHeading
        }
      }

      const cartesian = Cesium.Cartesian3.fromDegrees(lng, lat, alt)
      const hpr = new Cesium.HeadingPitchRoll(fp.heading, fp.pitch, fp.roll)
      const orientation = Cesium.Transforms.headingPitchRollQuaternion(cartesian, hpr)

      //@ts-ignore
      models[i].position = cartesian
      //@ts-ignore
      models[i].orientation = orientation
      //@ts-ignore
      groundPoints[i].position = Cesium.Cartesian3.fromDegrees(lng, lat, 0)

      // pathPositionsList[i].push(cartesian)
      // if (pathPositionsList[i].length > 1000) pathPositionsList[i].shift()

      const t = Cesium.JulianDate.toDate(viewer.clock.currentTime).getTime()
      
      const start = new Date("2021-06-01T00:00:00Z").getTime()
      
      if (t >= start) {
        pathPositionsList[i].push(cartesian)
        if (pathPositionsList[i].length > 1000) pathPositionsList[i].shift()
      }
      



    }
  }

  const openKeysListener = () => {
    document.addEventListener("keydown", (e: KeyboardEvent) => {
      if (keysMap[e.key] !== undefined) keysMap[e.key] = true
      if (e.key === "m") autoFly.value = !autoFly.value
      if (e.key === "1") currentControlled.value = 0
      if (e.key === "2") currentControlled.value = 1
    })
    document.addEventListener("keyup", (e: KeyboardEvent) => {
      if (keysMap[e.key] !== undefined) keysMap[e.key] = false
    })
  }
// 点击模型选中控制目标
const setupClickSelection = () => {
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  handler.setInputAction((movement: { position: Cesium.Cartesian2 }) => {
    const pickedObject = viewer.scene.pick(movement.position)
    if (Cesium.defined(pickedObject) && pickedObject.id?.id) {
      const id = pickedObject.id.id
      if (id === "uax-0") currentControlled.value = 0
      if (id === "uax-1") currentControlled.value = 1
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
}


// const applyParetoResult = (index: 0 | 1, time: string, roll: number, pitch: number) => {
//   const sat = models[index]
//   if (!sat) return

//   // 设置姿态角
//   flightParamsList[index].roll = roll
//   flightParamsList[index].pitch = pitch

//   // 设置时间
//   const targetDate = new Date(time)
//   viewer.clock.currentTime = Cesium.JulianDate.fromDate(targetDate)

//   viewer.clock.currentTime = Cesium.JulianDate.fromDate(targetDate)
//   const waypoints = waypointList[index]
//   const tTarget = targetDate.getTime()
//   let closestIdx = 0
//   let minDiff = Infinity
//   for (let i = 0; i < waypoints.length; i++) {
//     const t = new Date(waypoints[i].time).getTime()
//     const diff = Math.abs(t - tTarget)
//     if (diff < minDiff) {
//       closestIdx = i
//       minDiff = diff
//     }
//   }

//   // 更新飞行参数到对应点
//   const nearest = waypoints[closestIdx]
//   flightParamsList[index].lat = nearest.lat
//   flightParamsList[index].lng = nearest.lng
//   flightParamsList[index].altitude = nearest.alt

//   // 位置与方向更新
//   const satPos = Cesium.Cartesian3.fromDegrees(nearest.lng, nearest.lat, nearest.alt)
//   const hpr = new Cesium.HeadingPitchRoll(flightParamsList[index].heading, flightParamsList[index].pitch, flightParamsList[index].roll)
//   const orientation = Cesium.Transforms.headingPitchRollQuaternion(satPos, hpr)

//   // 更新实体
//   //@ts-ignore
//   sat.position = satPos
//   //@ts-ignore
//   sat.orientation = orientation
//   //@ts-ignore
//   groundPoints[index].position = Cesium.Cartesian3.fromDegrees(nearest.lng, nearest.lat, 0)

//   // 清空轨迹，从这个点开始继续绘制
//   pathPositionsList[index].length = 0
//   pathPositionsList[index].push(satPos)

//   // 聚焦到该卫星
//   viewer.trackedEntity = undefined
//   const cameraPos = sat.position?.getValue(viewer.clock.currentTime)
//   if (cameraPos) {
//     viewer.camera.flyTo({
//       destination: cameraPos,
//       duration: 1.5,
//     })
//   }
// }
// const applyParetoResult = (index: 0 | 1, time: string, roll: number, pitch: number) => {
//   const sat = models[index]
//   if (!sat) return

//   // 将时间字符串转为 Date 对象
//   const targetDate = new Date(time)
//   viewer.clock.currentTime = Cesium.JulianDate.fromDate(targetDate)

//   // ✅ 查找最接近的轨迹点（基于时间）
//   const waypoints = waypointList[index]
//   const targetTime = targetDate.getTime()
//   let closestIdx = 0
//   let minDiff = Infinity

//   for (let i = 0; i < waypoints.length; i++) {
//     const wpTime = new Date(waypoints[i].time).getTime()
//     const diff = Math.abs(wpTime - targetTime)
//     if (diff < minDiff) {
//       minDiff = diff
//       closestIdx = i
//     }
//   }

//   // ✅ 重置 flightParams 到该轨迹点
//   const targetWaypoint = waypoints[closestIdx]
//   flightParamsList[index].lat = targetWaypoint.lat
//   flightParamsList[index].lng = targetWaypoint.lng
//   flightParamsList[index].altitude = targetWaypoint.alt

//   // ✅ 设置姿态角（角度转弧度）
//   flightParamsList[index].roll = Cesium.Math.toRadians(roll)
//   flightParamsList[index].pitch = Cesium.Math.toRadians(pitch)

//   // ✅ 清除旧轨迹
//   pathPositionsList[index].length = 0

//   // ✅ 相机飞过去
//   const pos = Cesium.Cartesian3.fromDegrees(
//     targetWaypoint.lng,
//     targetWaypoint.lat,
//     targetWaypoint.alt
//   )
//   viewer.camera.flyTo({
//     destination: pos,
//     duration: 1.5,
//   })
// }


const applyParetoResult = (index: 0 | 1, time: string, roll: number, pitch: number) => {
  const sat = models[index]
  if (!sat) return
  
  pathPositionsList[index].length = 0  // 清空轨迹并立即更新一次姿态和轨迹

  // 设置姿态角（注意角度转弧度）
  flightParamsList[index].roll = Cesium.Math.toRadians(roll)
  flightParamsList[index].pitch = Cesium.Math.toRadians(pitch)

  // 设置时间
  const newTime = Cesium.JulianDate.fromIso8601(time)
  viewer.clock.currentTime = newTime

  
  adjustFlightAttitude() // 💡 强制更新轨迹和位置

  // ✅ 重新获取新轨迹下的实体位置
  const pos = models[index].position?.getValue(viewer.clock.currentTime)
  if (pos) {
    viewer.camera.flyTo({
      destination: pos,
      duration: 1.5,
    })
  }

  
}

const clearTrajectory = (index: 0 | 1) => {
  pathPositionsList[index].length = 0
}


const calibrationSites = [
  { id: 5, lat: 40.18, lng: 94.27 },
  { id: 7, lat: 40.14, lng: 89.12 },
  { id: 2, lat: 24.42, lng: 13.35 },
]


const addCalibrationSites = () => {
  calibrationSites.forEach(site => {
    viewer.entities.add({
      name: `定标场${site.id}`,
      position: Cesium.Cartesian3.fromDegrees(site.lng, site.lat, 0),
      point: {
        pixelSize: 10,
        color: Cesium.Color.YELLOW,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
      },
      label: {
        text: `定标场${site.id}`,
        font: "14px sans-serif",
        fillColor: Cesium.Color.WHITE,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        pixelOffset: new Cesium.Cartesian2(0, -25),
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      },
    })
  })
}



const renderer = () => {
  adjustFlightParams()
  adjustFlightAttitude()
  requestAnimationFrame(renderer)
  addCalibrationSites()
}

renderer()
openKeysListener()
setupClickSelection()  // ✅ 只调用一次（不要放 renderer 里）




  return {
    flightParams: flightParamsList[0],
    flightParams2: flightParamsList[1],
    autoFly,
    manualAttitudeOverride,
    sensorVisible,
    currentControlled,
    applyParetoResult,
    clearTrajectory,
  }
}
