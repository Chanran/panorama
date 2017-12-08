import { Scene, PerspectiveCamera, Color, WebGLRenderer, WebGLRendererParameters, Clock } from 'three'

import Sphere from './PanoramaSphere'

import setting from '../settings/viewer.json'
import { SPHERE_LOW_SHARPEN } from './constants';

let clock = new Clock()
let clockDelta = 0
let fpsLimit = 0
window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame

export class Viewer {

  private _dom: HTMLElement
  private _littlePlanet: boolean
  private _autoRotate: boolean
  private _radius: number

  private _scene: Scene
  private _camera: PerspectiveCamera
  private _renderer: WebGLRenderer
  private _sphere: Sphere
  
  constructor(webglParameters: WebGLRendererParameters, panoramaParameters: ViewerParameters, dom?: HTMLElement) {
    const {
      littlePlanet = setting.littlePlanet,
      autoRotate = setting.autoRotate,
      radius = setting.radius
    } = panoramaParameters

    this._dom = dom || document.body
    this._radius = radius
    this._littlePlanet = littlePlanet
    this._autoRotate = autoRotate
    
    this.initCamera(this._littlePlanet, this._dom)
    this.initScene()
    this.initRenderer(webglParameters, this._dom)

    window.addEventListener('resize', this.handleResize.bind(this, this._dom), false)
  }

  private initCamera (littlePlanet: boolean, dom: HTMLElement): Viewer {
    let parameters: CameraParameters = {
      fov: 65,
      aspect: dom.clientWidth / dom.clientHeight,
      near: 0.1,
      far: 1100,
      position: {
        x: 0,
        y: 0,
        z: 0
      },
      quaternion: {
        x: 0,
        y: 0,
        z: 0,
        w: 1
      }
    }

    if (littlePlanet) {
      parameters = {
        ...parameters,
        fov: 140,
        position: {
          x: 0,
          y: this._radius - 10,
          z: 0
        },
      }
    }

    const {
      fov,
      aspect,
      near,
      far,
      position = {x : 0, y : 0, z : 0}
    } = parameters
    this._camera = new PerspectiveCamera(
      fov,
      aspect,
      near,
      far,
    )
    this._camera.position.set(position.x, position.y, position.z)
    return this
  }

  private initScene() : Viewer {
    this._scene = new Scene()
    this._scene.background = new Color(0x000000)
    return this
  }

  private initRenderer(webglParameters: WebGLRendererParameters, dom: HTMLElement): Viewer {
    this._renderer = new WebGLRenderer(webglParameters)
    this._renderer.setClearColor(0xEEEEEE, 1.0)
    this._renderer.setPixelRatio(window.devicePixelRatio || 1)
    this._renderer.setSize(dom.clientWidth, dom.clientHeight)
    dom.appendChild(this._renderer.domElement)
    return this
  }

  private handleResize(dom: HTMLElement) : void {
    this._camera.aspect = dom.clientWidth / dom.clientHeight
    this._camera.updateProjectionMatrix()

    this._renderer.setSize(dom.clientWidth, dom.clientHeight)
  }

  public startAnimate (): Viewer {
    requestAnimationFrame(this.animate.bind(this))
    return this
  }

  private animate () : void {
    this.renderUpdate()
    requestAnimationFrame(this.animate.bind(this))
  }

  private renderUpdate(): void {
    clockDelta += clock.getDelta()
    if (clockDelta < fpsLimit) {
      return
    }
    if (this._autoRotate) {
      this._camera.rotation.y -= Math.PI / 2 / (60 * 50)
    }
    this._renderer.render(this._scene, this._camera)
  }

  public panoramaSphere (src = '', imageConfig?: any, radius?: number, successCallback?: Function, progressCallback?: Function, errorCallback?: Function): Viewer {
    if (!imageConfig) {
      imageConfig = SPHERE_LOW_SHARPEN
    }
    if (!radius) {
      radius = this._radius
    }
    
    if (!this._sphere) {
      const success = () => {
        this._sphere.setTexture()
        this._renderer.render(this._scene, this._camera)
        successCallback && successCallback()
      }
      this._sphere = new Sphere(radius, this._dom)
      this._sphere.loadTextureImage(src, imageConfig, success, progressCallback, errorCallback)
      this._scene.add(this._sphere)
    } else {
      let flag = true
      const onMixUpdate = (progress: number) => {
        if (flag) {
          console.log(flag);
          // this._camera.rotation.y += Math.PI / 2
          flag = false
        }
      }

      const success = () => {
        this._sphere.setMixTexture(undefined, onMixUpdate)
        this._renderer.render(this._scene, this._camera)
        successCallback && successCallback()
      }
      this._sphere.loadTextureImage(src, imageConfig, success, progressCallback, errorCallback)
    }
    return this
  }

  public get littlePlanet(): boolean {
		return this._littlePlanet
	}

	public set littlePlanet(value: boolean) {
		this._littlePlanet = value
	}

  public get autoRotate(): boolean {
		return this._autoRotate
	}

	public set autoRotate(value: boolean) {
		this._autoRotate = value
  }
}

interface ViewerParameters {
  littlePlanet?: boolean,
  autoRotate?: boolean,
  radius?: number
}

interface CameraParameters {
  fov?: number,
  aspect?: number,
  near?: number,
  far?: number,
  position?: {
    x: number,
    y: number,
    z: number
  },
  quaternion?: {
    x: number,
    y: number,
    z: number,
    w: number
  }
}