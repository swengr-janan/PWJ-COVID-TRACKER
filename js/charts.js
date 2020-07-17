const buildChartData = (data) => {
  let chartDataCases = [];
  let chartDataRecovered = [];
  let chartDataDeaths = [];
  let chartObj = {};
  for (let date in data.cases) {
    let newDataPoint = {
      x: date,
      y: data.cases[date],
    };
    chartDataCases.push(newDataPoint);
  }

  for (let date in data.recovered) {
    let newDataPoint = {
      x: date,
      y: data.recovered[date],
    };
    chartDataRecovered.push(newDataPoint);
  }

  for (let date in data.deaths) {
    let newDataPoint = {
      x: date,
      y: data.deaths[date],
    };
    chartDataDeaths.push(newDataPoint);
  }


  chartObj = {
    cases: chartDataCases,
    recovered: chartDataRecovered,
    deaths: chartDataDeaths,
  }
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
          label: "Total Cases",
          borderColor: "#db3d3d",
          data: chartData.cases,
        },
        {
          label: "Total Recovered",
          borderColor: "#308630",
          data: chartData.recovered,
        },
        {
          label: "Total Deaths",
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
