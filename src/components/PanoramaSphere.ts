import {
  textureLoader,
  SPHERE_LOW_SHARPEN,
  transparentTex
} from './constants'

const TWEEN: any = require('@tweenjs/tween.js')

import oss from '../Utils/oss'
import { Texture, Mesh, NearestFilter, LinearFilter, SphereGeometry, Event, DoubleSide, ShaderMaterial, RepeatWrapping, Vector2 } from 'three';

export default class PanoramaSphere extends Mesh {

  private _radius: number
  private _sphereTexture: Texture
  public material: ShaderMaterial
  public geometry: SphereGeometry

  private _successCallback: Function
  private _progressCallback: Function
  private _errorCallback: Function

  constructor (
    radius = 100,
    dom: HTMLElement = document.body
  ) {
    super()
    this._radius = radius
    this.geometry = new SphereGeometry(this._radius, 60, 40)
    this.geometry.scale(-1, 1, 1);
    let resolution = {
      w: dom.clientWidth,
      h: dom.clientHeight
    }
    this.material = new ShaderMaterial({
      uniforms: {
        texture0: {
          value: transparentTex
        },
        texture1: {
          value: transparentTex
        },
        alpha: {
          type: 'f',
          value: 1.0
        },
        resolution: {
          type: 'v',
          value: new Vector2(resolution.w, resolution.h)
        }
      },
      vertexShader: [
        'varying vec2 uvVec2;',
        'void main () {',
        '  uvVec2 = uv;',
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);',
        '}'
      ].join('\n'),
      fragmentShader: [
        'precision mediump float;',
        'uniform sampler2D texture0;',
        'uniform sampler2D texture1;',
        'uniform float alpha;',
        'uniform vec2 resolution;',
        'varying vec2 uvVec2;',
        'void main() {',
        '  vec4 t0 = texture2D(texture0,uvVec2);',
        '  vec4 t1 = texture2D(texture1,uvVec2);',
        // '  gl_FragColor = mix(t0, t1, alpha);',
          'if (alpha < 1.0) {',
            'float sRadius = sqrt(pow(resolution.x, 2.0) + pow(resolution.y, 2.0)) / 2.0;',  // screen half of Diagonal
            'float iRadius = sRadius * (alpha * 0.5 );', // inner circle radius
            'float oRadius = sRadius * alpha;',  // outer circle radius
            'float ioDistance = oRadius - iRadius;',
            'float vDistance = distance(gl_FragCoord.xy, resolution / 2.0);',
            'if (vDistance < iRadius) {',
              'gl_FragColor = mix(t0,t1,1.0);',
            '} else if ( vDistance < oRadius && vDistance > iRadius ) {',
              'float tmpAlpha = 1.0 - (vDistance - iRadius) / ioDistance;',
              'gl_FragColor = mix(t0,t1,tmpAlpha);',
            '} else {',
              'gl_FragColor = mix(t0,t1,0.0);',
            '}',
          '}',
          // '} else {',
          //   'if (alpha <= 0.2) {',
          //     'gl_FragColor = mix(t0, t1, alpha);',
          //   '} else if (alpha >=0.8) {',
          //   '  gl_FragColor = mix(t0,t1,alpha);',
          //   '} else {',
          //   '  vec4 white = vec4(0, 0.25, 0.88, 0.4);',
          //   '  gl_FragColor = mix(white, t1, 0.1);',
          //   '}',
          // '}',
        '}'
      ].join('\n'),
      wireframe: false,
      side: DoubleSide
    })
    this.name = 'panoramaSphere'
  }

  loadTextureImage (src = '', imageConfig = SPHERE_LOW_SHARPEN, loadSuccessCallback?: Function, loadProgressCallback?: Function, loadErrorCallback?: Function) {
    if (this._sphereTexture && !src || this._sphereTexture && src === this._sphereTexture.image.src) {
      return this._sphereTexture
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

    let _sphereTexture = textureLoader.load(
      oss(src, imageConfig),
      this.loadSuccess.bind(this, loadSuccessCallback),
      this.loadProgress.bind(this, loadProgressCallback),
      this.loadError.bind(this, loadErrorCallback)
    )
    _sphereTexture.magFilter = NearestFilter
    _sphereTexture.minFilter = LinearFilter

    // if (this._sphereTexture) {
    //   this.dispose()
    // }

    return _sphereTexture
  }

  dispose () {
    if (this._sphereTexture) {
      this._sphereTexture.dispose()
      this._sphereTexture = transparentTex
      this.visible = false
      return true
    } else {
      return false;
    }
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
    return this.visible
  }

  setTexture (texture: Texture = this._sphereTexture) {
    this.dispose()
    this.visible = true
    this._sphereTexture = texture
    this._sphereTexture.needsUpdate = true
    this.material.uniforms.alpha.value = 0
    this.material.uniforms.texture0.value = texture
    this.material.uniforms.texture0.value.wrapS = RepeatWrapping
    this.material.uniforms.texture0.value.wrapT = RepeatWrapping
  }

  setMixTexture (texture: Texture = this._sphereTexture, onUpdateCallback?: Function) {
    this.material.uniforms.texture1.value = texture
    this.material.uniforms.texture1.value.wrapS = RepeatWrapping
    this.material.uniforms.texture1.value.wrapT = RepeatWrapping
    let alpha = {
      value: 0
    }
    console.log('alpha:', alpha.value);
    new TWEEN.Tween(alpha)
        .to({value: 1}, 800)
        // .easing(TWEEN.Easing.Cubic.InOut)
        .easing(TWEEN.Easing.Linear.None)
        .onUpdate(() => {
          console.log(alpha.value);
          this.material.uniforms.alpha.value = alpha.value
          onUpdateCallback && onUpdateCallback(alpha.value)
        })
        .onComplete(() => {
          const uniforms = this.material.uniforms
          uniforms.texture0.value = uniforms.texture1.value
          uniforms.alpha.value = 0
        })
        .start()
    this.mixAnimate()
  }

  mixAnimate () {
    requestAnimationFrame(this.mixAnimate.bind(this))
    TWEEN.update()
  }

  // 加载全景图结束的回调
  loadSuccess (callback = this._successCallback, texture: Texture) {
    this._sphereTexture = texture
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
