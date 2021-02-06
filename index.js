let loadMatch = function () {
    var matches = [];
    fetch('mainData.json')
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
            document.getElementsByClassName('loader')[0].style.display = 'none';
            document.getElementsByClassName('main')[0].style.display = 'block';
        });
}

loadMatch();

document.getElementById('reloadBtn').addEventListener('click', function () {
    loadMatch();
})