const buildChartData = (data) => {
  let chartDataCases = [];
  let chartDataRecovered = [];
  let chartDataDeaths = [];

  let chartObj = {};

  let lastDataPoint_cases;
  let lastDataPoint_recovered;
  let lastDataPoint_deaths;

  for (let date in data.cases) {
    if (lastDataPoint_cases) {
      let newDataPoint_cases = {
        x: date,
        y: data.cases[date] - lastDataPoint_cases,
      };
      chartDataCases.push(newDataPoint_cases);
    }
    lastDataPoint_cases = data.cases[date];
  }

  for (let date in data.recovered) {
    if (lastDataPoint_recovered) {
      let newDataPoint_recovered = {
        x: date,
        y: data.recovered[date] - lastDataPoint_recovered,
      };

      if (newDataPoint_recovered.y < 0) {
        newDataPoint_recovered.y = 0;
      }
      chartDataRecovered.push(newDataPoint_recovered);
    }
    lastDataPoint_recovered = data.recovered[date];
  }

  for (let date in data.deaths) {
    if (lastDataPoint_deaths) {
      let newDataPoint_deaths = {
        x: date,
        y: data.deaths[date] - lastDataPoint_deaths,
      };

      if (newDataPoint_deaths.y < 0) {
        newDataPoint_deaths.y = 0;
      }
      chartDataDeaths.push(newDataPoint_deaths);
    }
    lastDataPoint_deaths = data.deaths[date];
  }

  chartObj = {
    cases: chartDataCases,
    recovered: chartDataRecovered,
    deaths: chartDataDeaths,
  };
  return chartObj;
};

const buildChart = (chartData) => {
  var timeFormat = "MM/DD/YY";
  var ctx = document.getElementById("myChart").getContext("2d");
  var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: "line",

    // The data for our dataset
    data: {
      datasets: [
        {
          label: "Cases",
          borderColor: "#db3d3d",
          data: chartData.cases,
        },
        {
          label: "Recovered",
          borderColor: "#308630",
          data: chartData.recovered,
        },
        {
          label: "Deaths",
          borderColor: "#0c0c0c",
          data: chartData.deaths,
        },
      ],
    },

    // Configuration options go here
    options: {
      maintainAspectRatio: false,
      legend: {
        labels: {
          // This more specific font property overrides the global property
          fontColor: "#fff",
        },
      },
      tooltips: {
        mode: "index",
        intersect: false,
      },
      scales: {
        xAxes: [
          {
            ticks: {
              fontColor: "#fff",
            },
            type: "time",
            time: {
              format: timeFormat,
              tooltipFormat: "ll",
            },
          },
        ],
        yAxes: [
          {
            gridLines: {
              display: false,
            },
            ticks: {
              fontColor: "#fff",
              callback: function (value, index, values) {
                return numeral(value).format("0a");
              },
            },
          },
        ],
      },
    },
  });
};
