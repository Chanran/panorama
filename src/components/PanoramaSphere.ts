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
      w: 4096, //dom.clientWidth,
      h: 2048 //dom.clientHeight
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
        },
        direction: {
          type: 'v',
          value: new Vector2(1, 1)
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
        'varying vec2 uvVec2;',
        'uniform float alpha;',
        'uniform vec2 resolution;',
        'vec4 blur5(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {',
        '  vec4 color = vec4(0.0);',
        '  vec2 off1 = vec2(1.3333333333333333) * direction;',
        '  //color += texture2D(image, uv) * 1.0;',
        '  color += texture2D(image, uv + (off1 / resolution)) * 0.5;',
        '  color += texture2D(image, uv - (off1 / resolution)) * 0.5;',
        '  return color;',
        '}',
        'vec4 blurtest(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {',
        '  vec4 color = vec4(0.0);',
        '  vec2 off1 = vec2(1.3333333333333333) * direction;',
        '  //color += texture2D(image, uv) * 1.0;',
        '  color += texture2D(image, uv + (off1 / resolution)) * 0.25;',
        '  color += texture2D(image, uv - (off1 / resolution)) * 0.25;',
        '  return color;',
        '}',
        'void main() {',
        '  vec4 t0 = texture2D(texture0,uvVec2);',
        '  vec4 t1 = texture2D(texture1,uvVec2);',
        // '  if (alpha < 0.3 || alpha > 0.7) {',
        // '    gl_FragColor = mix(t0, t1, alpha);',
        // '  } else {',
        '    vec4 blurT0 = texture2D(texture0, uvVec2) / 4.0;',
        '    vec4 blurT1 = vec4(0.0);',
        '    blurT0 += 1.0 / 4.0 * blur5(texture0, uvVec2, resolution, vec2(1,0));',
        '    blurT0 += 1.0 / 4.0 * blur5(texture0, uvVec2, resolution, vec2(0,1));',
        '    blurT0 += 1.0 / 4.0 * blurtest(texture0, uvVec2, resolution, vec2(1,1));',
        '    blurT0 += 1.0 / 4.0 * blurtest(texture0, uvVec2, resolution, vec2(1,-1));',
        '    blurT1 += 1.0 / 4.0 * blur5(texture1, uvVec2, resolution, vec2(1,0));',
        '    blurT1 += 1.0 / 4.0 * blur5(texture1, uvVec2, resolution, vec2(0,1));',
        '    blurT1 += 1.0 / 4.0 * blur5(texture1, uvVec2, resolution, vec2(1,1));',
        '    blurT1 += 1.0 / 4.0 * blur5(texture1, uvVec2, resolution, vec2(1,-1));',
        '    gl_FragColor = mix(blurT0, blurT1, alpha);',
        // '  }',
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
        .easing(TWEEN.Easing.Cubic.InOut)
        // .easing(TWEEN.Easing.Linear.None)
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
