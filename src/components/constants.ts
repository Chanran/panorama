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
  // blur: {
  //   r: 10,
  //   s: 10
  // },
  resize: {
    w: 4096,
    h: 2048
  },
  sharpen: 50,
  quality: {
    Q: 80
  }
}]

export const transparentTex = (() => {
  let bitmap: HTMLCanvasElement = document.createElement('canvas')
  bitmap.width = 16
  bitmap.height = 16
  let ctx: CanvasRenderingContext2D | null = bitmap.getContext('2d')
  if (ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0)'
    ctx.fillRect(0,0,16,16)
  }
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
