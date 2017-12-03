import { Viewer } from './components/Viewer';

initUI()
initViewer()

function initViewer() {
  let viewer =  new Viewer({
      antialias: true
    }, {
      autoRotate: true,
    }
  )

  let src = "https://ossgw.alicdn.com/v3d-scene-go/cubemap/af5fb903afe6eeabd1ab7e78bd2add0c/image_panorama/pano.jpg"

  viewer.panoramaSphere(src)
  viewer.startAnimate()
  console.log(viewer);
}

function initUI () {
  let html = document.documentElement
  let body = document.body
}
