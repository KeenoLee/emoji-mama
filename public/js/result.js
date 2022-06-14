let postTemplate = document.querySelector(".gallery-container");
postTemplate.remove();


document.querySelector('.play-again').addEventListener("click", () => {
    //TODO: clear indexedDB
    location.href = './index.html'
})

function showPost(post) {
    const postContainer = createPost(post)
    postList.appendChild(postContainer);

}


    // store.put({ id: 1, screenshots: '123' })

    // const idQuery = store.get(1)

    // idQuery.onsuccess = function () {
    //     console.log('idQuery', store.get(1).result)
    // }

function createPost(post) {
    let postContainer = postTemplate.cloneNode(true);
    postContainer.querySelector(".gallery").textContent = 'FIXME:'
    return postContainer;
}
getImageFromIndexedDB()