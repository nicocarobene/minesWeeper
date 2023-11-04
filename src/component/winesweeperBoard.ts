import { LitElement, PropertyValueMap, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { BOARD_SIZE, MINES_NUMBER } from '../utils/const'
import { audioPlayer } from '../minesweeper'
import { map } from 'lit/directives/map.js'

 

@customElement('minesweeper-board')
export class minesweeperBoard extends LitElement {
  static styles = css`
    button{
      cursor: pointer
    }
    input[type='range'] {
      cursor: pointer
    }
    .board{
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      place-items: center 
    }  
    .cell{
      border: 1px solid black;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 25px;
      transition : background-color .1s ease-in-out ;
    }
    .cell.disabled{
      background-color: #d36464;
      content: '😈';
    }
    .cell.used{
      background-color: #a5a5a5;
    }
    .controls{
      display: flex;
      gap: 10px;
      margin-top: 10px;
    }
    `

  @property({ type: Array })
  board: (string | number)[][] = Array.from({ length: BOARD_SIZE}, () => Array.from({ length: BOARD_SIZE }, () => 0))
  
  @property({ type: Array })
  markUserBoard: number[][] = [] 
  
  @property({ type: Array })
  bombsBoard: number[][] = [] 

  @property({ type: Boolean })
  isGameOver = false

  @property({type: HTMLAudioElement})
  audioAtmosfer = audioPlayer.ATMOSFERES_AUDIO()

  @property({type: HTMLAudioElement})
  audioLose = audioPlayer.playLose()

  connectedCallback(): void {
    super.connectedCallback()
    this.startGame()
    this.audioAtmosfer.play()
    this.audioAtmosfer.loop = true
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    super.firstUpdated(_changedProperties)
    this.shadowRoot?.querySelectorAll('.cell').forEach(cell => {
      cell.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        if(this.isGameOver) return
        const target = e.target as HTMLElement;
        const celRow= Number(target.getAttribute('data-row'))
        const celCol= Number(target.getAttribute('data-col'))
        this.checkWin(celRow,celCol)
        target.classList.toggle('disabled')
      });
    })
  }
  
  eventGameOver() {
    const event = new CustomEvent('game-over', {
      detail: { mensaje: false },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
  private startGame(){
    for(let mine= MINES_NUMBER; mine > 0; mine--){
      const row = Math.floor(Math.random() * BOARD_SIZE)
      const col = Math.floor(Math.random() * BOARD_SIZE)
      this.board[row][col]= '🎃'
      this.bombsBoard.push([row,col])
    }  
  }
  
  private handleVolume(e: Event) {
    const inputElement = e.target as HTMLInputElement;
    const button = this.shadowRoot?.querySelector('.mute');
    if (inputElement) {
      const vol = Number(inputElement.value);
      this.audioAtmosfer.volume = vol;
      if(button?.innerHTML){
        vol === 0 
        ? button.innerHTML = '🔈' 
        : button.innerHTML = '🔊';
      }
    }
  }
  
  private handleMuted(){
    this.audioAtmosfer.muted = !this.audioAtmosfer.muted
    const button = this.shadowRoot?.querySelector('.mute');
    if (button) {
      button.innerHTML = this.audioAtmosfer.muted ? '🔇' : '🔊';
    }
  }
  
  private toggleClassUsed(button : HTMLButtonElement){
    button.classList.remove('unused')
    button.classList.add('used')
  }
  
  private selectUserCell(rowIndex: number, cellIndex: number, e:Event){
    if(this.isGameOver){
      return
    }
    const button= e.target as HTMLButtonElement
    this.toggleClassUsed(button)
    const newBoard= structuredClone(this.board)
    if(this.board[rowIndex][cellIndex] === '🎃'){
      this.gameOver(button)
    }else{
      const count = this.countBombsAround(rowIndex, cellIndex)
      newBoard[rowIndex][cellIndex] = count
      this.board= newBoard
    } 
    button.innerHTML = this.board[rowIndex][cellIndex] as string
  }
  private gameOver(button: HTMLButtonElement){
    button.innerHTML = '🎃'
    this.audioLose.play()
    setTimeout(()=>this.isGameOver = true, 1000)
  }
  
  checkWin(celRow: number, celCol: number){
    const checkIncludesCell= this.markUserBoard.some(item=>{
      return item.toString() === [celRow,celCol].toString()
    })
    if(checkIncludesCell){
      this.markUserBoard= this.markUserBoard.filter(item=>item.toString() !== [celRow,celCol].toString())
      return false
    }
    this.markUserBoard= [...this.markUserBoard, [celRow,celCol]]
    const win = this.bombsBoard.every(bomb=>{
      return this.markUserBoard.some(userMark=>{
        return userMark.toString() === bomb.toString()
      })
    })
    if(win){
      alert('YOU WIN')
      this.isGameOver = true
    }
  }

  countBombsAround(row: number, col: number){
    let count = 0
    for(let i = -1; i <= 1; i++){
      for(let j = -1; j <= 1; j++){
        const rowToCheck = row + i
        const colToCheck = col + j
        if(rowToCheck < 0 || rowToCheck >= BOARD_SIZE || colToCheck < 0 || colToCheck >= BOARD_SIZE){
          continue
        }
        if(this.board[rowToCheck][colToCheck] === '🎃'){
          count++
        }
      }
    }
    return count
  }

  renderBoard(){
    return map(this.board, (row, rowIndex) =>(
      map(row, (_cell, cellIndex)=>(
        html`
          <button  
            data-row='${rowIndex}' 
            data-col='${cellIndex}' 
            class='cell unused' 
            @click="${(e:Event) => this.selectUserCell(rowIndex, cellIndex, e)}"></button>
        `)
    )))
  }
 
  render() {
    return html`
      <div class="board">
      ${this.renderBoard()}
    </div>
    <div class="controls">
      <button class="mute" @click="${() =>this.handleMuted()}">🔊</button>
      <input @input="${(e: Event)=>this.handleVolume(e)}" value="0.5" type="range" name="vol" id="vol" min="0" max="1" step="0.1">
    </div>
    ${this.isGameOver ? html`<button class="restart" @click="${() => this.eventGameOver()}">Restart</button>`: null}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'minesweeper-board': minesweeperBoard
  }
}
