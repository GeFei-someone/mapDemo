// 高德map
export default function MapLoader () {
    return new Promise((resolve, reject) => {
      if (window.AMap) {
        resolve(window.AMap)
      } else {
        var script = document.createElement('script')
        script.type = 'text/javascript'
        script.async = true
        // script.src = 'http://webapi.amap.com/maps?v=1.4.14&callback=initAMap&key=79c0b7675b2543c3669f9ace221c2ece';
        script.src = 'https://webapi.amap.com/maps?v=1.4.9&callback=initAMap&key=e58075dd18017f888581dec30dd3c01c&plugin=AMap.DistrictSearch,AMap.Circle,AMap.LngLat,AMap.Polyline,AMap.LngLat,AMap.Text,AMap.Geocoder';
        script.onerror = reject
        document.head.appendChild(script)
      }
      window.initAMap = () => {
        resolve(window.AMap)
      }
    })
}