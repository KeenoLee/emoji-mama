let galleryTemplate = document.querySelector(".gallery-container");
galleryTemplate.remove();

fetch("/result")
    .then((res) => res.json())
    .catch((error) => ({
        error: String(error),
    }))
    .then((json) => {
        if (json.error) {
            console.log(json.error);
        }
        let gallery = json.result;
        gallery.forEach((gallery) => showGallery(gallery));
    });

document.querySelector('.play-again').addEventListener("click", () => {
    location.href = './index.html'
})

function showGallery(gallery) {
    const galleryContainer = createPost(gallery)
    galleryList.appendChild(galleryContainer);

}


function createPost(gallery) {
    let galleryContainer = galleryTemplate.cloneNode(true);
    galleryContainer.querySelector(".gallery").textContent = gallery
    return galleryContainer;
}
getImageFromIndexedDB()