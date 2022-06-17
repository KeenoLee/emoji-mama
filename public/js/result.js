const galleryList = document.querySelector(".gallery-container")
let galleryTemplate = galleryList.querySelector(".gallery");
const score = document.querySelector('.score')
galleryTemplate.remove();

fetch("/result")
<<<<<<< HEAD
    .then((res) => {
        console.log('res?: ', res.json())
        res.json()
        console.log(typeof res);
=======
    .then(async(res) => {
        let result = await res.json()
        return result
>>>>>>> c477569b13c1fdbd9129cd8952137e4676f2f5d7
    })
    // .catch((error) => ({
    //     error: String(error)
    // }))
    .then((json) => {
        console.log('DATAS:', json)
        if (json.error || !json) {
            score.textContent = 0
            console.log(json.error);
            return
        }
        let galleries = json.result;
        console.log(galleries);
        galleries.forEach((gallery) => {
            showGallery(gallery)
        });
        showScore(json)
    })



document.querySelector('.play-again').addEventListener("click", () => {
    location.href = './index.html'
})

function showGallery(gallery) {
    const galleryContainer = createPost(gallery)
    galleryList.appendChild(galleryContainer);

}

function createPost(gallery) {
    let galleryContainer = galleryTemplate.cloneNode(true);
    console.log(gallery.image)
    galleryContainer.querySelector(".upload").src = gallery.image
    galleryContainer.querySelector('.icon-emoji').textContent = gallery.icon
    // galleryContainer.querySelector(".icon").src = gallery.image
    return galleryContainer;
}

function showScore(result) {
    if (result.score == 0) {
        score.textContent = 0
        return
    }
    score.textContent = result.score
    return
}