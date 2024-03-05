"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const BASE_URL = "http://api.tvmaze.com/"


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  const resp = await axios.get(`${BASE_URL}search/shows`, {params: {q: term}});

  const shows = [];

  for (let showData of resp.data) {
    const show = {};
    show.id = showData.show.id;
    show.name = showData.show.name;
    show.summary = showData.show.summary;
    show.image = showData.show.image?.medium || "https://tinyurl.com/tv-missing";
    shows.push(show);
  }
  return shows;
}


/** Given array of shows, create markup for each and append to DOM.
 *
 * A show is {id, name, summary, image}
 * */

function displayShows(shows) {
  $showsList.empty();

  for (const show of shows) {
    const $show = $(`
        <div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
          <div class="media">
            <img src=${show.image} alt=${show.name} class="w-25 me-3">
            <div class="media-body">
              <h5 class="text-primary">${show.name}</h5>
              <div><small>${show.summary}</small></div>
              <button class="btn btn-outline-light btn-sm Show-getEpisodes">
                Episodes
              </button>
            </div>
          </div>
        </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchShowsAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  displayShows(shows);
}

$searchForm.on("submit", async function handleSearchForm (evt) {
  evt.preventDefault();
  await searchShowsAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const resp = await axios.get(`${BASE_URL}shows/${id}/episodes`);

  const episodes = [];

  for (let epData of resp.data) {
    const episode = {};
    episode.id = epData.id;
    episode.name = epData.name;
    episode.season = epData.season;
    episode.number = epData.number;

    episodes.push(episode);
  }
  return episodes;
}


/** Given array of episodes, create a list of episodes and append to DOM.
 *
 * An episode is { id, name, season, number }
 */

function displayEpisodes(episodes) {
  $episodesArea.empty();

  const $episodes = $("<ul>");
  for (let episode of episodes) {
    const { name, season, number } = episode;
    const $episode = $(`<li>${name} (season ${season}, number ${number})</li>`);
    $episodes.append($episode);
  }
  $episodesArea.append($episodes);
}


/** Handle "Get Episodes" button clicks. Get episodes from API and display.
 *    Takes show id.
 *    Display episodes area.
 */

async function searchEpisodesAndDisplay(id) {
  const episodes = await getEpisodesOfShow(id);

  $episodesArea.show();
  displayEpisodes(episodes);
}


$showsList.on("click", "button", async function handleSearchForm (evt) {

  const $button = $(evt.target);
  const id = $button.closest(".Show").data("show-id");
  await searchEpisodesAndDisplay(id);
});