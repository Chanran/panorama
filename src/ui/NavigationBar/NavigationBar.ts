export default class NavigationBar {
  private _dom : HTMLElement
  constructor(clickCallback?: Function) {
    this._dom = <HTMLElement> document.querySelector('#navigation-bar')
    this._dom.addEventListener('click', this.handleClick.bind(this, clickCallback), false)
  }

  public handleClick(clickCallback: Function, e: Event): void {
    if (!clickCallback || !e || !e.target) {
      return 
    }
    e.preventDefault()
    e.stopPropagation()
    const element = <HTMLElement> e.target
    const key: string = element.dataset.key || ''
    clickCallback(parseInt(key))
  }
}