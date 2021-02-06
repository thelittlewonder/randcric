let loadMatch = function () {
    var matches = [];
    fetch('./res/mainData.json')
        .then(response => response.json())
        .then(data => {
            //load JSON data to a new variable
            matches = data[1].data

            //load random match
            let randomMatch = matches[Math.floor(Math.random() * matches.length)];

            //update the frontend with random match's data
            let matchTitle = document.getElementById('matchTitle')
            let matchLink = document.getElementById('matchLink')

            matchTitle.innerHTML = randomMatch.title;
            matchLink.innerHTML = randomMatch.url
            matchLink.href = randomMatch.url

            //hide the loader
            let loader = document.getElementsByClassName('loader')[0]
            loader.style.visibility = 'hidden'
            loader.style.opacity = 0

            let mainContent = document.getElementsByClassName('main')[0]
            mainContent.style.visibility = 'visible'
            mainContent.style.opacity = 1

        });
}

loadMatch();

document.getElementById('reloadBtn').addEventListener('click', function () {
    loadMatch();
})