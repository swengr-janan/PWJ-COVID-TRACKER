var countryData = [];
var map;
var markers = [];
var infoWindow;
var locationSelect;
var coronaGlobalCases;
let mapCircles = [];
const worldWideSelection = {
  name: "Worldwide",
  value: "www",
  selected: true,
};
var casesTypeColors = {
  cases: "#ff0000",
  active: "#fdfd96",
  recovered: "#77dd77",
  deaths: "#b39eb5",
};

const urlAll = "https://disease.sh/v3/covid-19/all";
const urlCountries = "https://disease.sh/v3/covid-19/countries/";
const urlHistory = "https://disease.sh/v3/covid-19/historical/";

window.onload = () => {
  getData(urlAll);
  getCountriesData();
  getWorldCoronaData();
  getHistoricalData(urlHistory, "all");

  var mydate = new Date();
  var month = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ][mydate.getMonth()];
  var finalDate =
    month +
    " " +
    mydate.getDate() +
    " " +
    mydate.getFullYear() +
    " " +
    mydate.getHours() +
    ":" +
    mydate.getMinutes();

  document.getElementById("timezone").innerText = finalDate;
};

formatNumber = (num) => {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
};

const mapCenter = {
  lat: 34.80746,
  lng: -40.4796,
};

function initMap() {
  var manila = {
    lat: 4.36122,
    lng: 18.55496,
  };
  map = new google.maps.Map(document.getElementById("map"), {
    center: mapCenter,
    zoom: 2,
    styles: mapStyle,
  });
  infoWindow = new google.maps.InfoWindow();
}

const getCountriesData = () => {
  fetch("https://corona.lmao.ninja/v2/countries")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      coronaGlobalCases = data;
      setSearchList(data);
      showDataOnMap(data);
      showDataInTable(data);
    });
};

const getCountryData = (countryIso) => {
  getNews(countryIso);
  countryIso == "www" ? (countryIso = "") : countryIso;
  const url = "https://disease.sh/v3/covid-19/countries/" + countryIso;
  fetch(url)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      setMapCenter(data.countryInfo.lat, data.countryInfo.long, 4);
      setStatsData(data);
    });
};

const getWorldCoronaData = () => {
  $("#myChart").remove();
  $("#graph-container-main").append('<canvas id="myChart"><canvas>');

  fetch("https://disease.sh/v2/all")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      getData(urlAll);
      setStatsData(data);
      setMapCenter(mapCenter.lat, mapCenter.lng, 2);
    });
};

const getHistoricalData = (url, query) => {
  fetch(url + query)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      data.cases === undefined ? (data = data.timeline) : "";
      $("#myChart").remove();
      $("#graph-container-main").append('<canvas id="myChart"><canvas>');
      let chartData = buildChartData(data);
      buildChart(chartData);
    });
};

const changeDataSelection = (casesType) => {
  if (casesType.toString() === "cases") {
    $(".total-cases-card").addClass("active-card-cases");
    $(".recovered-cases-card").removeClass("active-card-recovered");
    $(".deaths-cases-card").removeClass("active-card-deaths");
  } else if (casesType.toString() === "recovered") {
    $(".recovered-cases-card").addClass("active-card-recovered");
    $(".total-cases-card").removeClass("active-card-cases");
    $(".deaths-cases-card").removeClass("active-card-deaths");
  } else if (casesType.toString() === "deaths") {
    $(".deaths-cases-card").addClass("active-card-deaths");
    $(".total-cases-card").removeClass("active-card-cases");
    $(".recovered-cases-card").removeClass("active-card-recovered");
  }
  clearTheMap();
  showDataOnMap(coronaGlobalCases, casesType);
};

const clearTheMap = () => {
  for (let circle of mapCircles) {
    circle.setMap(null);
  }
};

const setMapCenter = (lat, long, zoom) => {
  map.setZoom(zoom);
  map.panTo({
    lat: lat,
    lng: long,
  });
};

const initDropdown = (searchList) => {
  $(".ui.dropdown").dropdown({
    values: searchList,
    onChange: function (value, text) {
      if (value !== worldWideSelection.value) {
        findByCountry(value);
        getCountryData(value);
      } else {
        getCountryData(value);
        getWorldCoronaData();
        getHistoricalData(urlHistory, "all");
      }
    },
  });
};

const setSearchList = (data) => {
  let searchList = [];
  searchList.push(worldWideSelection);
  data.forEach((countryData) => {
    searchList.push({
      name: countryData.country,
      value: countryData.countryInfo.iso2,
      flag: countryData.countryInfo.flag,
    });
  });

  initDropdown(searchList);
};

const showDataOnMap = (data, casesType = "cases") => {
  data.map((country) => {
    let countryCenter = {
      lat: country.countryInfo.lat,
      lng: country.countryInfo.long,
    };

    var countryCircle = new google.maps.Circle({
      strokeColor: casesTypeColors[casesType],
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: casesTypeColors[casesType],
      fillOpacity: 0.35,
      map: map,
      center: countryCenter,
      radius: country[casesType],
    });

    mapCircles.push(countryCircle);

    var html = `
          <div class="info-container">
              <div class="info-flag" style="background-image: url('${
                country.countryInfo.flag
              }')" >
              </div>
              <div class="info-name">
                  ${country.country}
              </div>
              <div class="info-confirmed">
                  <strong>Total:</strong> ${formatNumber(country.cases)}
              </div>
              <div class="info-recovered">
              <strong>Recovered:</strong> ${formatNumber(country.recovered)}
              </div>
              <div class="info-deaths">
              <strong>Deaths:</strong> ${formatNumber(country.deaths)}
              </div>
          </div>
          `;
    var infoWindow = new google.maps.InfoWindow({
      content: html,
      position: countryCircle.center,
    });

    google.maps.event.addListener(countryCircle, "mouseover", () => {
      infoWindow.open(map);
    });

    google.maps.event.addListener(countryCircle, "mouseout", () => {
      infoWindow.close(map);
    });
  });
};

//Make the data's in the function dynamic

const showDataInTable = (data) => {
  var html = "";

  data.map((country) => {
    html += `
            <tr>
            <th class="table-heading"><img src="${
              country.countryInfo.flag
            }" /> ${country.country}</th>
            <th>${numWithComma(country.todayCases)}</th>
            <th>${numWithComma(country.cases)}</th>
            <th>${numWithComma(country.deaths)}</th>
            <th>${numWithComma(country.recovered)}</th>
            </tr>
        `;
  });

  document.getElementById("table-data").innerHTML = html;
  const table = $("#example").DataTable({
    responsive: true,
  });
  new $.fn.dataTable.FixedHeader(table);
};

//7-10-20

/* convert numbers with comma */
const numWithComma = (num) => {
  let numString = num.toString();
  return numString.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const getData = async (url) => {
  await fetch(url)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      let addedCases = numeral(data.todayCases).format("+0,0");
      let addedRecovered = numeral(data.todayRecovered).format("+0,0");
      let addedDeaths = numeral(data.todayDeaths).format("+0,0");

      /* clear */
      document.getElementById("total_case").innerHTML = "";
      document.getElementById("recovered_case").innerHTML = "";
      document.getElementById("deaths_case").innerHTML = "";
      document.querySelector(".total-number").innerHTML = "";
      document.querySelector(".recovered-number").innerHTML = "";
      document.querySelector(".deaths-number").innerHTML = "";

      /* append */
      document
        .getElementById("total_case")
        .append(data.cases ? numWithComma(data.cases) : 0);
      document
        .getElementById("recovered_case")
        .append(data.recovered ? numWithComma(data.recovered) : 0);
      document
        .getElementById("deaths_case")
        .append(data.deaths ? numWithComma(data.deaths) : 0);
      document
        .querySelector(".total-number")
        .append(addedCases ? addedCases : 0);
      document
        .querySelector(".recovered-number")
        .append(addedRecovered ? addedRecovered : 0);
      document
        .querySelector(".deaths-number")
        .append(addedDeaths ? addedDeaths : 0);
      /* chart */
    });
};

/* 7-11-20 */

const findByCountry = (query) => {
  query == "www" ? (query = "") : query;
  if (query) {
    // Historical Chart Clear
    $("#myChart").remove();
    $("#graph-container-main").append('<canvas id="myChart"><canvas>');
    getData(urlCountries + query);
    getHistoricalData(urlHistory, query);
  } else {
    getData(urlAll);
  }
};

const setStatsData = (data) => {
  let addedCases = numeral(data.todayCases).format("+0,0");
  let addedRecovered = numeral(data.todayRecovered).format("+0,0");
  let addedDeaths = numeral(data.todayDeaths).format("+0,0");
  document.querySelector(".total-number").innerHTML = addedCases;
  document.querySelector(".recovered-number").innerHTML = addedRecovered;
  document.querySelector(".deaths-number").innerHTML = addedDeaths;
};

// News Section

const getNews = (countryIso) => {
  if (countryIso === "www") {
    fetch("https://www.who.int/rss-feeds/news-english.xml")
      .then((response) => {
        return response.text();
      })
      .then((data) => {
        let parser = new DOMParser(),
          xmlDoc = parser.parseFromString(data, "text/xml");
        showNewsGlobal(xmlDoc);
      });
  } else {
    //38bd6037f3614f30a346dec8771d0e01
    fetch(
      `https://api.smartable.ai/coronavirus/news/${countryIso}?Subscription-Key=38bd6037f3614f30a346dec8771d0e01`
    )
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        showNewsLocal(data);
      });
  }
};

const showNewsGlobal = (xmlDoc) => {
  var finalNews = "";

  let item = xmlDoc.getElementsByTagName("item");
  let link = xmlDoc.getElementsByTagName("link");
  let title = xmlDoc.getElementsByTagName("title");
  let description = xmlDoc.getElementsByTagName("description");
  let pubDate = xmlDoc.getElementsByTagName("pubDate");

  for (let i = 1; i < item.length; i++) {
    let pubDateX = Date.parse(pubDate[i].textContent);
    let newPubDate = new Date(pubDateX).toUTCString();
    newPubDate = newPubDate.toString().split(" ");
    newPubDate[0] = newPubDate[0].toString().replace(",", "");
    newPubDate.pop();
    newPubDate.join(" ");
    finalNews += `
    <a class="news-link" href="${link[i].firstChild.nodeValue}">
    <div class="our-recent-news module">
        	<div class="row">
                <div class="news-wrapper">         
                    <div class="medium-6 small-12 columns small-posts">
                    
                    	<div class="post-wrapper">
                        	<div class="featured-image-2">
                                	<img src="https://i.pinimg.com/originals/2e/2a/fa/2e2afaada41190a439c6f06d83971497.jpg" alt="Post Thumbnail" />
                            </div> <!-- Thumbnail Ends /-->
                            <div class="post-meta">
                            	<h5><strong>${title[i].firstChild.nodeValue}</strong></h5>
                              <div class="pub">Published: ${newPubDate}</div> 
                              <div class="short-text">  
                              <p>${description[i].firstChild.nodeValue}</p>
                              </div>
                              <div>
                              <p style=><i>(Click for more details)</i></p>
                              </div>
                            </div><!-- post meta Ends /-->
                        </div><!-- Post Ends /-->
                    </div><!-- Small Posts Ends /-->
                </div><!-- News Wrapper Ends /-->
                
            </div><!-- Row Ends /-->
        </div><!-- Our Recent News /-->
        </a>
                `;
  }
  document.getElementById("country-name-news").innerText = `Worldwide`;

  document.getElementById("country-name-graph").innerText = `Worldwide`;

  document.querySelector(".news-data").innerHTML = finalNews;
};

const showNewsLocal = (data) => {
  const dataLength = Object.keys(data.news).length;
  var newsHtml = "";
  if (dataLength === 0) {
    newsHtml += `
    <div class="no-news">
    <i class="fas fa-exclamation-circle"></i>
      <h4>No news available in this country at this time.</h4>
    </div>
              `;
  } else {
    for (let i = 0; i < dataLength; i++) {
      let newPubDate = new Date(Date.parse(data.updatedDateTime));
      newPubDate = newPubDate.toUTCString();
      newPubDate = newPubDate.split(" ");
      newPubDate[0] = newPubDate[0].toString().replace(",", "");
      newPubDate.pop();
      newPubDate.join(" ");
      let thumbnail =
        data.news[i].images === null
          ? "https://images.unsplash.com/flagged/photo-1584036561584-b03c19da874c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1489&q=80"
          : data.news[i].images[0].url;
      newsHtml += `
      
      <a class="news-link" href="${data.news[i].webUrl}">
      <div class="our-recent-news module" style="padding-bottom: 1rem;">
            <div class="row">
                  <div class="news-wrapper">         
                      <div class="medium-6 small-12 columns small-posts">
                      
                        <div class="post-wrapper">
                            <div class="featured-image">
                                <img src="${thumbnail}" alt="Post Thumbnail" />
                              </div> <!-- Thumbnail Ends /-->
                              <div class="post-meta">
                                <h5><strong>${data.news[i].title}</strong></h5>
                                <div class="pub">Published: ${newPubDate}</div> 
                                <div class="short-text">  
                                <p>${data.news[i].excerpt}</p>
                                <p><i>(Click for more details)</i></p>
                                </div>
                              </div><!-- post meta Ends /-->
                          </div><!-- Post Ends /-->
                      </div><!-- Small Posts Ends /-->
                  </div><!-- News Wrapper Ends /-->
                  
              </div><!-- Row Ends /-->
          </div><!-- Our Recent News /-->
          </a>
                  `;
    }
  }

  document.getElementById(
    "country-name-news"
  ).innerText = `for ${data.location.countryOrRegion}`;

  document.getElementById(
    "country-name-graph"
  ).innerText = `for ${data.location.countryOrRegion}`;
  document.querySelector(".news-data").innerHTML = newsHtml;
};

//!! TODO
//!! Images per news fixing
//!! default global news from WHO at first loading
//!! Fix design for stats card

const searchCountry = () => {
  $(".dropdown").click();
};
