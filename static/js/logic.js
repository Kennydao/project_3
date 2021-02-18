//https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.{ext}
// define variables
var map;
var lyrOSM;
var lyrTopo;
var lyrImagery;
var lyrPopulation;
var ctlLayers;

var selSuburb, selYear, selBedroom, popuValue, subPopuVal, covCaseVal;
var subIncome, avgIncomeVal;
var arSuburbs = [];

var housePriceData= {};
var covidCases = {};
var suburbPopulation = {};
var suburbIncome ={};
var ttlIncomeVal;
var ttlMedianHousePrice;
var calMedianHousePrice;
var name, houseName, medHousePrice;


map = L.map("map", {center:[-37.8136, 144.9631], zoom: 6, minZoom: 6, maxZoom: 15, attributionControl: false});

// lyrStamen = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//   attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//   // subdomains: 'abcd',
//   // ext: 'png'
// });

lyrOSM = L.tileLayer.provider('OpenStreetMap.Mapnik');
// lyrOSM.addTo(map);
lyrOSM = L.tileLayer.provider('OpenStreetMap.Mapnik');
// lyrOSM.addTo(map);

lyrTopo = L.tileLayer.provider('OpenTopoMap');
// lyrTopo.addTo(map);

lyrImagery = L.tileLayer.provider('Esri.WorldImagery');
lyrImagery.addTo(map);


// use d3 to load population data in 2019
d3.csv('../static/data/Vic_Subs_Popu_2019.csv', function(popuData) {

  // console.log(popuData);

  popuData['Value'] = +popuData['Value'];

  for (var i = 0; i < popuData.length; i++) {
    var att = popuData[i];

    subName = att.Suburb;
    // console.log(subName)
    suburbPopulation[subName] = att.Value;

    arSuburbs.push(subName);

  // sort the suburb array
  arSuburbs.sort();
  }
});



// console.log(suburbPopulation);

// loading median income data
d3.csv('../static/data/Median_Income.csv', function(incomeData) {

  // console.log(incomeData);

  incomeData['Median Income'] = +incomeData['Median Income'] ;

  ttlIncomeVal = 0
  for (var i = 0; i < incomeData.length; i++) {

    var att = incomeData[i];

    subName = att.Suburb;
    suburbIncome[subName] = att['Median Income'];

    ttlIncomeVal = ttlIncomeVal + parseFloat(att['Median Income']);
    // suburbPopulation['Value'] = att['Value'];
    // suburbPopulation.push(subName,att.Value)

    }
  avgIncomeVal = (ttlIncomeVal/i).toFixed(0);

  });


// console.log(suburbIncome);

// covid data
d3.csv('../static/data/cleaned_covid19_cases.csv', function(covidData) {


  covidData['cases'] = +covidData['cases'];

  for (var i = 0; i < covidData.length; i++) {

    var att = covidData[i];

    subName = att.Suburb;
    covidCases[subName] = att.cases;

    }

  });

// console.log(covidCases);


d3.csv('../static/data/Vic_House_Median_Price.csv', function(houseData) {

  // console.log(houseData)
  houseData['Median Price'] = +houseData['Median Price'];
  // houseData = {}
  ttlMedianHousePrice = 0.0;
  calMedHousePrice = 0.0

  for (var i = 0; i < houseData.length; i++) {
    var att = houseData[i];

    subName = att.Suburb;
    // console.log(subName, att['Median Price']);


    housePriceData[subName] = att['Median Price'];

    // total median house price
    // console.log(att['Median Price']);
    ttlMedianHousePrice = ttlMedianHousePrice + parseFloat(att['Median Price']);
  }

  // ttlMedianHousePrice = ttlMedianHousePrice.toFixed(0)
  // console.log('total med price', ttlMedianHousePrice);

  // calculating median house price based on the entire dataset
  calMedHousePrice = ((ttlMedianHousePrice/i)/2).toFixed(0);

  });

// console.log(housePriceData);


// use d3 to load house price data from json file
/*
d3.json('../data/vic_suburb_stats.json', function(jsonData) {

  // console.log(jsonData);
  // console.log(jsonData['ABBOTSFORD-3067']['details']['suburb_name']);
  // console.log(jsonData['ABBOTSFORD-3067']['details']);

    // total cases
    // ttlCases = ttlCases + parseFloat(att.cases);
  });

// console.log(houseData);

*/
$(document).ready(function(){
  // use jQuery to load boundaries data
  $.getJSON("../static/data/suburb-2-vic.geojson", function(data) {

    // console.log(data);

    var info = L.control();

    // console.log(info);
    // console.log(data);

    info.update = function (props, name) {

      cleanedName(name);

      subPopuVal = suburbPopulation[name];
       if (isNaN(subPopuVal)){
        this._div.innerHTML = (props ? '<b>' + name + '</b>' + '<i>' + " Population Data Not Found!" +'</i>' : '<i>Hover over a suburb</i>');
        }
      else {
        this._div.innerHTML = (props ? '<b>' + name + ": " + numberWithCommas(subPopuVal) + ' people'+'</b>' : '<i>Hover over a suburb</i>');
      }

    };

    info.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
      this.update();
      return this._div;
    };

    info.addTo(map);

    var lyrPopulation = L.geoJson(data, { style: myStyle,

      onEachFeature: function (feature, layer) {

        // acquiring the list of suburbs name

        // feature.properties['vic_loca_2'] = toUpper(feature.properties['vic_loca_2']);

        // medHousePrice = housePriceData[feature.properties.vic_loca_2];
        // popuValue = suburbPopulation[feature.properties.vic_loca_2]
        // subPopuVal = suburbPopulation[feature.properties.vic_loca_2];
        // covCaseVal = covidCases[feature.properties.vic_loca_2];
        // incomeVal = suburbIncome[feature.properties.vic_loca_2];


        if (isNaN(subPopuVal)) {

          layer.bindTooltip("<h4 style = 'text-align: center; background-color: #ffcc66'><b>" +
                                          feature.properties['vic_loca_2'] + "</h4></b>" +
                                          "• Population: " + 'Data Not Found!')
          }

        else {
          if (isNaN(medHousePrice)) {
              medHousePrice = ' unavailable!';//calMedHousePrice;
          }

          if (isNaN(incomeVal)) {

            incomeVal = 'Data unavailable'; //avgIncomeVal;
            }

          if (isNaN(covCaseVal)) {
            covCaseVal = 0;
          }

          layer.bindTooltip("<h4 style = 'text-align: center; background-color: #ffcc66'><b>" +
                                          feature.properties['vic_loca_2'] + "</h4></b>" +
                                          "• Population: " + numberWithCommas(subPopuVal) + '<br>' +
                                          "• Median Income: $" + numberWithCommas(incomeVal) +'<br>' +
                                          "• Median House Price: $" + numberWithCommas(medHousePrice) +'<br>' +
                                          "• Covid Cases: " + covCaseVal);
          }
        layer
        .on('mouseover', function(e) {


          layer.setStyle({
            weight: 2,
            color: '#bbff33', //'#99e600'
            dashArray: '3',
            fillOpacity: 0.5
          });

          // refresh suburb name

          info.update(layer.feature.properties, layer.feature.properties['vic_loca_2']);

          })

        .on('mouseout', function(e) {
          lyrPopulation.resetStyle(e.target); //layer geojson
          info.update();
        })
      }

      });


    lyrPopulation.addTo(map);

    // var bounds = lyrPopulation.getBounds();
    // map.fitBounds(bounds);
    // map.options.maxBounds = bounds;
    // map.options.minZoom = map.getZoom();


    // console.log(arSuburbs);
    // use autocomplete plugin to display suburbs name
    $("#txtSubHouse").autocomplete({
      source: arSuburbs
    });


  });


  /*
  // setup layer control
  objBasemaps = {
    "Topo Map": lyrTopo,
    "Open Street Map": lyrOSM,
    "Imagery": lyrImagery

  };

  objOverlays ={
    "Population Distribution": geojson,
    "Covid Cases": lyrCovid
  }
  */
});

// ctlLayers = L.control.layers(objBasemaps, objOverlays).addTo(map);


// function style
function myStyle(feature) {

  // console.log('bf: ', feature.properties['vic_loca_2']);
  feature.properties['vic_loca_2'] = toUpper(feature.properties['vic_loca_2']);

  cleanedName(feature.properties['vic_loca_2']);

  // console.log('after:' ,feature.properties['vic_loca_2']);

  // acquire the suburb's population
  subPopuVal = suburbPopulation[feature.properties.vic_loca_2];
  covCaseVal = covidCases[feature.properties.vic_loca_2];
  incomeVal = suburbIncome[feature.properties.vic_loca_2];
  medHousePrice = housePriceData[feature.properties.vic_loca_2];

  // assigne medHousePrice in case there is no value in the dataset
  if (medHousePrice == 0) {
    medHousePrice = calMedianHousePrice;
  }

  return {
        fillColor: getColor(subPopuVal),
        weight: 1,
        color: '#c2c2d6', // light dark
        dashArray: '2',
        fillOpacity: 0.5
      };
}

// function to assign most suitable suburb name
function cleanedName(name) {
  var nameEast = name + " East";
  var nameWest = name + " West";
  var nameSouth = name + " South";
  var nameNorth = name + " North";

  subPopuVal = suburbPopulation[nameEast];

  if (! isNaN(subPopuVal)) {
    name = nameEast;
    return name;
  }
  else {
    subPopuVal = suburbPopulation[nameWest];
    if (! isNaN(subPopuVal)) {
      name = nameWest;
      return name;
    }
    else {
      subPopuVal = suburbPopulation[nameSouth];
      if (! isNaN(subPopuVal)) {
        name = nameSouth;
        return name;
      }
      else {
        subPopuVal = suburbPopulation[nameNorth];
        if (! isNaN(subPopuVal)) {
          name = nameNorth;
          return name;
        }
      }
    }
  }
}

// Function to convert Upper Case Letter
function toUpper(str) {
  return str
      .toLowerCase()
      .split(' ')
      .map(function(word) {
          return word[0].toUpperCase() + word.substr(1);
      })
      .join(' ');
   }

// Function number with comma
function numberWithCommas(x) {
  if (isNaN(x)) {
    return 0;
  }
  else {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}


/*
$("#btnPrediHouse").click(function() {

  alert('Housing Price Prediction');

  selSuburb = $("#txtSubHouse").val();
  selYear = $("#txtYearHouse").val();
  selBedroom = $("#txtBedroom").val();

  console.log(selSuburb, selBedroom, selYear);


});

$("#btnPopuGrowth").click(function() {


  selSuburb = $("#txtSubHouse").val();
  selYear = $("#txtYearHouse").val();
  selBedroom = $("#txtBedroom").val();
  console.log(selSuburb, selBedroom, selYear);
  $

  //  d3.select("divPopuResult").selectAll("<p>")
  //   .append("<p>")
  //   .html(`{popuPrediction}`)
});
*/

// function to parse data from csv file
function parseData(parData) {

  parData.cases = +parData.cases;
  ttlCases = 0;

  for (var i = 0; i < parData.length; i++) {
    var att = parData[i];
    covCases[att.postcode] = att.cases;

  }
}

// function to assign suitable color depend up export value
function getColor(val) {

  return val < 0   ? ' #111a00':
          val < 10    ? '#223300':
          val < 100   ? '#334d00':
          val < 1000  ? '#558000':
          val < 5000  ? '#669900':
          val < 10000 ?  '#88cc00':
          val < 20000 ?  '#b3ff1a':
          val < 30000 ?  '#ccff66':
          val < 50000 ?  '#eeffcc':
                        ' #111a00';
/*
    return val < 0   ? '#e6ffb3':
          val < 10    ? '#e6ffb3':
          val < 100   ? '#ccff66':
          val < 1000  ? '#b3ff1a':
          val < 5000  ? '#88cc00':
          val < 10000 ? '#669900':
          val < 20000 ? '#558000':
          val < 30000 ? '#334d00':
          val < 50000 ? '#223300':
                        '#f7ffe6';
*/
}


