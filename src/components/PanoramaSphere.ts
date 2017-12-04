import {
  textureLoader,
  imageLoader,
  SPHERE_LOW_SHARPEN,
  transparentTex
} from './constants'

import oss from '../Utils/oss'
import { Texture, Mesh, NearestFilter, LinearFilter, SphereGeometry, MeshBasicMaterial, FrontSide, Event, DoubleSide } from 'three';

export default class PanoramaSphere extends Mesh {

  private _radius: number
  private _sphereTexture: Texture
  private _tmpTexture: Texture
  public material: MeshBasicMaterial

  private _successCallback: Function
  private _progressCallback: Function
  private _errorCallback: Function

  constructor (
    radius = 100,
  ) {
    super()
    this.geometry = new SphereGeometry(radius, 60, 40)
    this.material = new MeshBasicMaterial({
      map: transparentTex,
      side: DoubleSide,
      color: 0xffffff
    })

    // this.material = new ShaderMaterial({
    //   uniforms: {
    //     texture1: {
    //       value: transparentTex
    //     },
    //     texture2: {
    //       value: transparentTex
    //     }
    //   },
    //   vertexShader: [
    //     ""
    //   ].join('\n'),
    //   fragmentShader: [
    //     ""
    //   ].join()
    // })
    this.name = 'panoramaSphere'
    this._radius = radius
  }

  loadTextureImage (src = '', imageConfig = SPHERE_LOW_SHARPEN, loadSuccessCallback: Function, loadProgressCallback: Function, loadErrorCallback: Function) {
    if (this.material.map && !src || this.material.map && src === this.material.map.image.src) {
      return this.material.map
    }

    if (loadSuccessCallback) {
      this._successCallback = loadSuccessCallback
    }
    if (loadProgressCallback) {
      this._progressCallback = loadProgressCallback
    }
    if (loadErrorCallback) {
      this._errorCallback = loadErrorCallback
    }

    let _tmpTexture = textureLoader.load(
      oss(src, imageConfig),
      this.loadSuccess.bind(this, loadSuccessCallback),
      this.loadProgress.bind(this, loadProgressCallback),
      this.loadError.bind(this, loadErrorCallback)
    )
    _tmpTexture.magFilter = NearestFilter
    _tmpTexture.minFilter = LinearFilter

    if (this.material.map) {
      this.dispose()
    }

    return _tmpTexture
  }

  dispose () {
    this.material.map.dispose()
    this.material.map = transparentTex
    this.visible = false
  }

  setOpacity (opacity: number) {
    if (this.material) {
      if (opacity === 1) {
        this.material.transparent = false
      } else {
        this.material.transparent = true
      }
      this.material.opacity = opacity
    }
    return this
  }

  setVisible (visible: boolean) {
    if (visible === undefined || visible === null) {
      return false;
    }
    this.visible = visible
  }

  setTexture (texture: Texture = this._tmpTexture) {
    this.visible = true
    this.material.map = texture
    this.material.map.needsUpdate = true
  }

  // 加载全景图结束的回调
  loadSuccess (callback = this._successCallback, texture: Texture) {
    this._tmpTexture = texture
    callback()
  }

  // 加载全景图的过程回调
  loadProgress (callback = this._progressCallback, e: Event) {
    callback()
  }

  // 加载全景图失败的回调
  loadError (callback = this._errorCallback, e: Event) {
    callback()
  }

  get loadSuccessCallback () {
    return this._successCallback
  }

  set loadSuccessCallback (cb) {
    this._successCallback = cb
  }

  get loadProgressCallback () {
    return this._progressCallback
  }

  set loadProgressCallback (cb) {
    this._progressCallback = cb
  }

  get loadErrorCallback () {
    return this._errorCallback
  }

  set loadErrorCallback (cb) {
    this._errorCallback = cb
  }
}
