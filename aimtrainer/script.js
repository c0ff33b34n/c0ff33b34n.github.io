const startBtn = document.querySelector( '#start' )
const screens = document.querySelectorAll( '.screen' )
const timeList = document.querySelector( '#time-list' )
const timeEl = document.querySelector( '#time' )
const board = document.querySelector( '#board' )
const colors = [ '#2400F9', '#84fab0', '#eb5f84', '#fa0038',
    '#ec5a39', '#209cff', '#d72301', '#017e8b' ,
    '#16D9E3', '#30C7EC', '#46AEF7' ]

let time = 0
let score = 0
startBtn.addEventListener( 'click', ( event ) => {
    event.preventDefault()
    screens[0].classList.add( 'up' )
})

timeList.addEventListener( 'click', ( event ) => {

    if ( event.target.classList.contains( 'time-btn' ) ) {
        time = parseInt( event.target.getAttribute( 'data-time' ) )
        screens[1].classList.add( 'up' )
        startGame()
    }
} )

board.addEventListener( 'click', ( event ) => {
    if ( event.target.classList.contains( 'circle' ) ) {
        score++
        event.target.remove()
        createRandomCircle()
    }
})

function startGame() {
    const interval = setInterval( decreaseTime, 1000 )
    setTime( time )
    createRandomCircle()
}

function decreaseTime() {
    if ( time === 0 ) {
        finishGame()
    } else {
        let current = --time
        if ( current < 10 ) {
            current = `0${ current }`
        }
        setTime( current )
    }
}

function setTime( value ) {
    timeEl.innerHTML = `00:${ value }`
}

function finishGame() {
    board.innerHTML = `<h1>Score: <span class="primary" >${ score }</span></h1>`
    timeEl.parentElement.classList.add( 'hidden' )
}

function createRandomCircle() {
    const circle = document.createElement( 'div' )
    const circleSize = getRandomNumber( 10, 60 )
    const { width, height } = board.getBoundingClientRect()

    // поправка на размер circle, чтобы он не вывалился за пределы доски board
    const x = getRandomNumber( 0, width - circleSize )
    const y = getRandomNumber( 0, height - circleSize )

    circle.classList.add( 'circle' )
    circle.style.width = `${ circleSize }px`
    circle.style.height = `${ circleSize }px`
    circle.style.left = `${ x }px`
    circle.style.top = `${ y }px`
    circle.style.background = `linear-gradient(90deg, ${ getRandomColor() } 0%, ${ getRandomColor() } 50%, ${ getRandomColor() } 100%)`

    board.append( circle )
}

// Math. round() - rounds to the nearest integer
// (if the fraction is 0.5 or greater - rounds up)
// Math. floor() - rounds down.
function getRandomNumber( min, max ) {
    return Math.round( Math.random() * ( max - min ) + min )
}

function getRandomColor() {
    const index = Math.floor( Math.random() * colors.length )
    return colors[ index ]
}