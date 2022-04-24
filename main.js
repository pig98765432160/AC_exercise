const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}

const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

const view = {
  getCardElement (index) {
    return `<div data-index="${index}" class="card back"></div>`
  },
  getCardContent (index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
      <p>${number}</p>
      <img src="${symbol}" />
      <p>${number}</p>
    `
  },
  transformNumber (number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  displayCards (indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },
  flipCards (...cards) {
    cards.map(card => {
      // console.log(card)
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      card.classList.add('back')
      card.innerHTML = null
    })
  },
  pairCards (...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },
  renderScore (score) {
    document.querySelector(".score").innerHTML = `
      Score: ${score}
    `
  },
  renderTriedTimes (times) {
    document.querySelector(".tried").innerHTML = `
      You've tried: ${times} times
    `
  },
  appendWrongAnimations (...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationEnd', event =>
        card.classList.remove('wrong'),
        {once: true} 
      )
    })
  },
  // Game finish
  showGameFinish () {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p class="fw-bold">Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

// 代表被翻開的卡片
const model = {
  revealedCards: [],
  isRevealedCardMatched(){
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },
  score: 0,
  triedTimes: 0,
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards () {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  dispatchCardAction (card) {
    if(!card.classList.contains('back')) {
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)
        // 判斷配對是否成功
        // console.log(model.isRevealedCardMatched())
        if(model.isRevealedCardMatched()) {
          view.renderScore(model.score += 10) 
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 10) {
            // console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinish()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          this.currentState = GAME_STATE.CardsMatchFailed
          // 失敗動畫
          view.appendWrongAnimations(...model.revealedCards)
          // setTimeout(() => {
          //   view.flipCards(model.revealedCards[0])
          //   view.flipCards(model.revealedCards[1])
          //   model.revealedCards = []
          //   this.currentState = GAME_STATE.FirstCardAwaits
          // }, 1000)
          setTimeout(this.resetCards, 1000)
        }
        break
    }
    // console.log('this.currentState', this.currentState)
    // console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))
  },
  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}

const utility = {
  getRandomNumberArray (count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

// view.displayCards()
controller.generateCards()

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    // console.log(card)
    // view.flipCard(card)
    controller.dispatchCardAction(card)
  })
})