const names = document.querySelectorAll('.names');
const scores = document.querySelectorAll('.scores');

fetch('/rank')
    .then(res => res.json())
    .then(json => {
        for (let i = 0; i < json.topTen.length; i++) {
            names[i].textContent = json.topTen[i].name;
            scores[i].textContent = json.topTen[i].score;
        }
    })
    .catch(error => console.error('error: ', error));
