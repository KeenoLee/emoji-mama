let postTemplate = document.querySelector(".gallery-container");
postTemplate.remove();

fetch("/result")
    .then((res) => res.json())
    .catch((error) => ({
        error: String(error),
    }))
    .then((json) => {
        if (json.error) {
            console.log(json.error);
        }
        let posts = json.result;
        posts.forEach((post) => showPost(post));
    });

document.querySelector('.play-again').addEventListener("click", () => {
    //TODO: clear indexedDB
    location.href = './index.html'
})

function showPost(post) {
    const postContainer = createPost(post)
    postList.appendChild(postContainer);

}


function createPost(post) {
    let postContainer = postTemplate.cloneNode(true);
    postContainer.querySelector(".gallery").textContent = 'FIXME:'
    return postContainer;
}
getImageFromIndexedDB()