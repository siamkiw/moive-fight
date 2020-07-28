const autocompleteConfig = {
    renderOption(movie) {
        const imgSrc = movie.Poster === 'N/A' ? '' : movie.Poster
        return `
        <img src="${imgSrc}" />
        ${movie.Title} (${movie.Year})
    `
    },
    inputValue(movie) {
        return movie.Title
    },
    async fetchData(searchTerm) {
        const res = await axios.get('http://www.omdbapi.com', {
            params: {
                apikey: 'f29a4c38',
                s: searchTerm
            }
        })
        if (res.data.Error) return []
        return res.data.Search
    }
}

createAutoComplete({
    ...autocompleteConfig,
    root: document.querySelector('#left-autocomplete'),
    onOptionSelect(movie) {
        document.querySelector('.tutorial').classList.add('is-hidden')
        onMovieSelect(movie, document.querySelector('#left-summary'), 'left')
    }

})

createAutoComplete({
    ...autocompleteConfig,
    root: document.querySelector('#right-autocomplete')
    ,
    onOptionSelect(movie) {
        document.querySelector('.tutorial').classList.add('is-hidden')
        onMovieSelect(movie, document.querySelector('#right-summary'), 'right')
    }
})

let leftMoive
let rightMoive
const onMovieSelect = async (movie, summaryElement, side) => {
    const response = await axios.get('http://www.omdbapi.com', {
        params: {
            apikey: 'f29a4c38',
            i: movie.imdbID
        }
    })
    summaryElement.innerHTML = movieTemplate(response.data)

    if (side === 'left') {
        leftMoive = response.data
    } else {
        rightMoive = response.data
    }

    if (leftMoive && rightMoive) {
        runComparison()
    }
}

const runComparison = () => {
    const leftSideStats = document.querySelectorAll('#left-summary .notification')
    const rightSideStats = document.querySelectorAll('#right-summary .notification')

    leftSideStats.forEach((leftStat, index) => {
        const rightStat = rightSideStats[index]

        const leftSideValue = parseInt(leftStat.dataset.value)
        const rightSideValue = parseInt(rightStat.dataset.value)

        if (leftSideValue > rightSideValue) {
            leftStat.classList.remove('is-primary')
            leftStat.classList.add('is-warning')
        } else {
            rightStat.classList.remove('is-primary')
            rightStat.classList.add('is-warning')
        }
    })
}

const movieTemplate = (movieDetail) => {

    const { Poster, Title, Genre, Plot, Awards, BoxOffice, Metascore, imdbRating, imdbVotes } = movieDetail

    const dollars = parseInt(BoxOffice.replace(/\$/g, '').replace(/,/g, ''))
    const metaScore = parseInt(Metascore)
    const imdbRatingScore = parseFloat(imdbRating)
    const imdbVotesScore = parseInt(imdbVotes.replace(/,/g, ''))
    const awards = Awards.split(' ').reduce((prev, word) => {
        const value = parseInt(word)
        if (isNaN(value)) {
            return prev
        } else {
            return prev + value
        }
    }, 0);


    // console.log(dollars, metaScore, imdbRatingScore, imdbVotesScore)

    return `
    <article class="media">
    <figure class="meds-left">
      <p class="image">
        <img src="${Poster}">
      </p>
    </figure>
    <div class="media-cotent">
      <div class="content">
        <h1>${Title}</h1>
        <h4>${Genre}</h4>
        <p>${Plot}</p>
      </div>
    </div>
    </article>

    <article data-value="${awards}" data-point="${111}" class="notification is-primary">
        <p class="title">${Awards}</p>
        <p class="suptitle">Awards</p>
    </article>

    <article data-value="${dollars}" class="notification is-primary">
        <p class="title">${BoxOffice}</p>
        <p class="suptitle">Box Office</p>
    </article>

    <article data-value="${metaScore}" class="notification is-primary">
        <p class="title">${Metascore}</p>
        <p class="suptitle">Metascore</p>
    </article>

    <article data-value="${imdbRatingScore}" class="notification is-primary">
        <p class="title">${imdbRating}</p>
        <p class="suptitle">IMDB Rating</p>
    </article>

    <article data-value="${imdbVotesScore}" class="notification is-primary">
        <p class="title">${imdbVotes}</p>
        <p class="suptitle">IMDB Votes</p>
      </article>
    `
}