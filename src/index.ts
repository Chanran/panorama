import { Viewer } from './components/Viewer'
import { SPHERE_ORIGIN_SHARPEN } from './components/constants';
import NavigationBar from './ui/NavigationBar/NavigationBar';

const data = initData()
const ui = initUI()
const viewer = initViewer()

function initViewer() {
  const viewer =  new Viewer({
      antialias: false
    }, {
      autoRotate: false,
    }
  )

  const src = 'https://ossgw.alicdn.com/v3d-scene-go/cubemap/af5fb903afe6eeabd1ab7e78bd2add0c/image_panorama/pano.jpg'

  viewer.panoramaSphere(src, SPHERE_ORIGIN_SHARPEN)
  viewer.startAnimate()

  return viewer
}

function initUI () {
  const navClickCallback = handleNavClick
  const navigationBar = new NavigationBar(navClickCallback)
  return {
    NavigationBar
  }
}

function initData () {

}

function handleNavClick (key: number) {
  let src = ''
  if (key === 1) {
    src = 'https://ossgw.alicdn.com/v3d-scene-go/cubemap/af5fb903afe6eeabd1ab7e78bd2add0c/image_panorama/pano.jpg'
  } else if (key === 2) {
    src = 'https://ossgw.alicdn.com/scenego-inner/cubemap/376296fd-fb47-442b-ba29-4a0f8d0b80eb/image_panorama/pano.jpg'
  }
  viewer.panoramaSphere(src, SPHERE_ORIGIN_SHARPEN)
}