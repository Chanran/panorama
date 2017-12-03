import {
  Texture,
  ImageLoader,
  TextureLoader
} from 'three'

export const SPHERE_LOW_SHARPEN = [{
  resize: {
    w: 2048,
    h: 1024
  },
  sharpen: 50,
  quality: {
    Q: 90
  }
}]

export const SPHERE_ORIGIN_SHARPEN = [{
  sharpen: 50,
  quality: {
    Q: 80
  }
}]

export const transparentTex = (() => {
  let bitmap = document.createElement('canvas')
  bitmap.width = 16
  bitmap.height = 16
  let ctx = bitmap.getContext('2d')
  ctx.fillStyle = 'rgba(0,0,0,0)'
  ctx.fillRect(0,0,16,16)
  return new Texture(bitmap)
})()

export const imageLoader = (() => {
  let loader = new ImageLoader()
  loader.setCrossOrigin('Anonymous')
  return loader
})()

export const textureLoader = (() => {
  let loader = new TextureLoader()
  loader.setCrossOrigin('Anonymous')
  return loader
})()
