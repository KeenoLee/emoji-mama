
document.querySelector('.btn-play').addEventListener('click', () => {
    gameStart()
})


function gameStart() {
    fetch('/lobby', { method: 'POST'})
    .then((res) => res.json())
    .catch((err) => ({
        error: String(err)
    }))
    
}