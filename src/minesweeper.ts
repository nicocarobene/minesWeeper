import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import './component/winesweeperBoard.ts'
const audioAtmosfer=new Audio('sound/ThisIsHalloween.mp3')
const loseAudio = new Audio('sound/lose.mp3')
export const audioPlayer = {
  ATMOSFERES_AUDIO: ()=> audioAtmosfer,
  playLose: () => loseAudio
}
@customElement('mines-weeper')
export class minesweeper extends LitElement {
  static styles = css` 
    :host {
      width: 100%;
      gap: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 25px;
      font-family: 'Montserrat', sans-serif;
    }
    button{
      padding: 1rem;
      font-size: 1rem;
      cursor: pointer;
      width: 130px;
      border: 1px solid black;
      border-radius: 5px;
    }
    button:hover{
      font-weight: bold;
      background-color: #6b6b6b7d;
    }
  `

  handleCustomEvent(event:CustomEvent<any>) {
    this.isGameOver = event.detail.mensaje;
    
  }
 constructor() {
    super()
    document
      .addEventListener('game-over', this.handleCustomEvent.bind(this) as EventListener);
  }

  @property({type: Boolean})
  isGameOver = false

  render() {
    return html`
      <h1>Minesweeper</h1>
      <section>
        ${this.isGameOver 
          ? html`<minesweeper-board ></minesweeper-board>`
          : html`<button @click="${() => this.isGameOver = !this.isGameOver}">Start Game</button>`
        }
      </section>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mines-weeper': minesweeper
  }
}