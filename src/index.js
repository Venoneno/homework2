import "babel-polyfill";
import Chart from "chart.js";

const meteoURL = "/xml.meteoservice.ru/export/gismeteo/point/140.xml";
const dTime = [];
const dTemp= [];
const dTempH= [];

async function loadTemperature() {
  const response = await fetch(meteoURL);
  const xmlTest = await response.text();
  const parser = new DOMParser();
  const weatherData = parser.parseFromString(xmlTest, "text/xml");
  const temp = weatherData.querySelectorAll("TEMPERATURE[max][min]");
  const hour = weatherData.querySelectorAll("FORECAST[hour]");
  const tempH = weatherData.querySelectorAll("HEAT[max][min]");

    for (let i = 0; i < hour.length; i++) {
      const rateTag1 = hour.item(i);
      const time = rateTag1.getAttribute("hour");
      dTime[i] = (time+ ":00");

      const rateTag2 = temp.item(i);
      const min = rateTag2.getAttribute("min");
      const max = rateTag2.getAttribute("max");
      dTemp[i] = avg(max,min);

      const rateTag3 = tempH.item(i);
      const minH = rateTag3.getAttribute("min");
      const maxH = rateTag3.getAttribute("max");
      dTempH[i] = avg(maxH,minH);
    }
}

const buttonBuild = document.getElementById("btn");
const canvasCtx = document.getElementById("out").getContext("2d");
buttonBuild.addEventListener("click", async function() {
  await loadTemperature();
  const chartConfig = {
    type: "line",
    data: {
      labels: dTime,
      datasets: [
        {
          label: "Температура",
          backgroundColor: "rgba(255, 0, 0, 0.5)",
          borderColor: "rgba(255, 0, 0, 0.5)",
          data: dTemp
        },
        {
          label: "Температура по ощущениям",
          backgroundColor: "rgba(0, 0, 255, 0.5)",
          borderColor: "rgba(0, 0, 255, 0.5)",
          data: dTempH
        }
      ]
    },
    options: {
      responsive: true,
      title:{
        display:true,
        text:'Уфа'
      },
      scales: {
        xAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Время'
          }
        }],
        yAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Температура, °С'
          },
        }]
      }
    }
  };

  if (window.chart) {
    chart.data.labels = chartConfig.data.labels;
    chart.data.datasets[0].data = chartConfig.data.datasets[0].data;
    chart.update({
      duration: 800,
      easing: "easeOutBounce"
    });
  } else {
    window.chart = new Chart(canvasCtx, chartConfig);
  }
});

function avg(a, b) {
  return (a/2+b/2);
}