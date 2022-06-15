const galleryList = document.querySelector(".gallery-container")
let galleryTemplate = galleryList.querySelector(".gallery");
const score = document.querySelector('.score')
galleryTemplate.remove();

fetch("/result")
    .then((res) => res.json())
    .catch((error) => ({
        error: String(error),
    }))
    .then((json) => {
        console.log('DATAS:', json)
        if (json.error) {
            console.log(json.error);
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
    galleryContainer.querySelector('.icon').textContent = gallery.icon
    // galleryContainer.querySelector(".icon").src = gallery.image
    return galleryContainer;
}

function showScore(result) {
    score.textContent = result.score
}