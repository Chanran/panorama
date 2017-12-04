export default class NavigationBar {
  private _dom : HTMLElement
  constructor(clickCallback?: Function) {
    this._dom = document.querySelector('#navigation-bar')
    this._dom.addEventListener('click', this.handleClick.bind(this, clickCallback), false)
  }

  public handleClick(clickCallback: Function, e: Event): void {
    if (!clickCallback) {
      return 
    }
    e.preventDefault()
    e.stopPropagation()
    const element = <HTMLElement> event.target
    clickCallback(parseInt(element.dataset.key))
  }
}