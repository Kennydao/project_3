//
//https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.{ext}
// define variables
var map;
var lyrOSM;
var lyrTopo;
var lyrImagery;
var lyrBoundaries;
// var lyrPopulation;
// var lyrCovid;
// var ctlLayers;

var selSuburb, selYear, selBedroom, popuValue, subPopuVal, covCaseVal;
var subIncome;
var arSuburbs = [];

var houseData = {};
var covidCases = {};
var ttlCases;

var suburbPopulation= {};
var suburbIncome = {};




// lyrStamen = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//   attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//   // subdomains: 'abcd',
//   // ext: 'png'
// });

lyrOSM = L.tileLayer.provider('OpenStreetMap.Mapnik');
// lyrOSM.addTo(map);

lyrTopo = L.tileLayer.provider('OpenTopoMap');
// lyrTopo.addTo(map);

lyrImagery = L.tileLayer.provider('Esri.WorldImagery');
// lyrImagery.addTo(map);

// use d3 to load population data in 2019
d3.csv('../static/data/Vic_Subs_Popu_2019.csv', function(popuData) {

  // console.log(popuData);

  popuData['Value'] = +popuData['Value'];

  for (var i = 0; i < popuData.length; i++) {
    var att = popuData[i];

    subName = att.Region;
    suburbPopulation[subName] = att.Value;
    // suburbPopulation['Value'] = att['Value'];
    // suburbPopulation.push(subName,att.Value)

  }
});

// console.log(suburbPopulation);

// loadind median income data
d3.csv('../static/data/Median_Income.csv', function(incomeData) {

  // console.log(incomeData);

  incomeData['Median Income'] = +incomeData['Median Income'] ;

  for (var i = 0; i < incomeData.length; i++) {

    var att = incomeData[i];

    subName = att.Suburb;
    suburbIncome[subName] = att['Median Income'];
    // suburbPopulation['Value'] = att['Value'];
    // suburbPopulation.push(subName,att.Value)

    }
  });

// console.log(suburbIncome);

d3.csv('../static/data/cleaned_covid19_cases.csv', function(covidData) {


  covidData['cases'] = +covidData['cases'];
  covidData['Suburb'] = covidData['Suburb'];

  // console.log('parsing covid data')
  // console.log(covidData);


  for (var i = 0; i < covidData.length; i++) {

    var att = covidData[i];

    subName = att.Suburb;
    covidCases[subName] = att.cases;

    }

  });

// console.log(covidCases)

/*
// loading & parsing housing data
d3.csv('../static/data/Melbourne_housing_FULL.csv', function(houseData) {

  // console.log(houseData)
  houseData.Price = +houseData.Price;
  houseData = {}

  for (var i = 0; i < houseData.length; i++) {
    var att = houseData[i];
    houseData[att.Suburb] = att.Price;


    // total cases
    // ttlCases = ttlCases + parseFloat(att.cases);
  }
});

*/



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
    lyrBoundaries = L.geoJSON.ajax("../static/data/suburb-2-vic.geojson", {style: myStyle,
      onEachFeature: function(feature, layer) {

        // console.log('onEachFeature:',subPopuVal)

        if (isNaN(subPopuVal)) {
            layer.bindTooltip("<h4 style = 'text-align: center; background-color: #ffcc66'><b>" +
            feature.properties['vic_loca_2'] + "</h4></b>" + "Data unavailable!");

            // layer.on({
            //   mouseover: highlightFeature,
            //   mouseout: resetStyle(e.target)
            //   });
            }
        else {

          layer.bindTooltip("<h4 style = 'text-align: center; background-color: #ffcc66'><b>" +
                                          feature.properties['vic_loca_2'] + "</h4></b>" +
                                          "• Population: " + numberWithCommas(subPopuVal) + '<br>' +
                                          "• Median Income: " + incomeVal +'<br>' +
                                          "• Covid Cases: " + covCaseVal);
          // layer.on({
          //   mouseover: highlightFeature,
          //   mouseout: resetStyle(e.target) //resetHighlight
          //   });
        }
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetStyle(e.target) //resetHighlight
            });

      }
    });//.addTo(map);

    console.log(arSuburbs);

    // use autocomplete plugin to display suburbs name
    $("#txtSubHouse").autocomplete({
      source: arSuburbs
    });



    // Set up the legend
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend');

        var lgdInfo = [100, 1000, 5000, 10000, 20000, 50000];

        var labels = ['1K', '5K', '10K', '20K', '30K', '50K'];

        div.innerHTML += "<ul>" + labels.join("&ndash;&ndash;&ndash;&ndash;&ndash;") + "</ul>";

        for (var i = 0; i < lgdInfo.length; i++) {
            // Horizontal
            div.innerHTML += '<i style="background-color:' + getColor(lgdInfo[i]) +'" ></i>'

          }
        return div;
      };

    // Add legend to the map
    // legend.addTo(map);

    // setup layer control
    objBasemaps = {
        "Topo Map": lyrTopo,
        "Open Street Map": lyrOSM,
        "Imagery": lyrImagery

    };

    objOverlays ={

        "Population": lyrBoundaries
        // "Covid Cases": lyrCovid,
        // "Population Distribution": lyrPopulation

    }
    map = L.map("map", {minZoom: 6, maxZoom: 15, layers: [lyrTopo, lyrBoundaries],
        attributionControl: false}).setView([-37.5536, 144.9631], 7);

    ctlLayers = L.control.layers(objBasemaps, objOverlays).addTo(map);

});

// function style
function myStyle(feature) {
    feature.properties['vic_loca_2'] = toUpper(feature.properties['vic_loca_2']);
    cleanedName(feature.properties['vic_loca_2']);
    // store suburb name to an array
    arSuburbs.push(feature.properties['vic_loca_2']);

    // acquire the suburb's population
    subPopuVal = suburbPopulation[feature.properties.vic_loca_2];
    covCaseVal = covidCases[feature.properties.vic_loca_2];
    incomeVal = suburbIncome[feature.properties.vic_loca_2];

    if (isNaN(subPopuVal)) {
      // try to assign most suitable suburb name

      // subPopuVal = suburbPopulation[feature.properties.vic_loca_2];
      // covCaseVal = covidCases[feature.properties.vic_loca_2];
      // incomeVal = suburbIncome[feature.properties.vic_loca_2];
      return {
          fillColor: getColor(subPopuVal),
          weight: 0.3,
          color: 'brown', //'beige',
          // dashArray: '2',
          fillOpacity: 0.6
      };
    }
    else {
      return {
          fillColor: getColor(subPopuVal),
          weight: 1,
          color: 'white',
          dashArray: '3',
          fillOpacity: 0.6
        };
      }
  }
/*
// covidStyle function
function covidStyle(feature) {
  feature.properties['vic_loca_2'] = toUpper(feature.properties['vic_loca_2']);
  //   // store suburb name to an array
  //   arSuburbs.push(feature.properties['vic_loca_2']);

  // acquire the suburb's population

  covCaseVal = covidCases[feature.properties.vic_loca_2];


  if (isNaN(covCaseVal)) {
      // try to assign most suitable suburb name
      // cleanedName(feature.properties['vic_loca_2']);

      return {
          fillColor: 'red', //getColorCovid(covCaseVal),
          weight: 0.3,
          color: 'red',
          dashArray: '5',
          fillOpacity: 1
      };
  }
  else {
    return {
        fillColor: getColorCovid(covCaseVal),
        weight: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.6
      };
    }
}

// covidStyle function
function incomeStyle(feature) {
  // tmpName = feature.properties['vic_loca_2'];
  // console.log(tmpName);

  feature.properties['vic_loca_2'] = toUpper(feature.properties['vic_loca_2']);
  // tmpName = feature.properties['vic_loca_2'];
  // console.log(tmpName);

  //   // store suburb name to an array
  //   arSuburbs.push(feature.properties['vic_loca_2']);

  // acquire the suburb's population

  incomeVal = suburbIncome[feature.properties.vic_loca_2];

  console.log('incomeStyle function', incomeVal)

  if (isNaN(incomeVal)) {
      // try to assign most suitable suburb name
      // cleanedName(feature.properties['vic_loca_2']);

      return {
          fillColor: getColorIncome(incomeVal),
          weight: 0.3,
          color: 'brown',
          dashArray: '2',
          fillOpacity: 0.9
      };
  }
  else {
    return {
        fillColor: getColorCovid(incomeVal),
        weight: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.6
      };
    }
}
*/
// function to assign suitable color
function getColor(val) {

    // console.log('inside getColor!', val);

    // use conditional operator (?:) to return suitable color scheme
    if (isNaN(val)) {
      console.log('am NaN', val)

       return '#bfbfbf';
    }
    else {
      console.log('am NOT NaN', val)
      return  val > 50000 ? '#800026' :
              val > 20000 ? '#BD0026' :
              val > 10000 ? '#E31A1C' :
              val > 5000  ? '#FC4E2A' :
              val > 1000  ? '#FD8D3C' :
              val < 100   ? '#FEB24C' :
                            '#FFEDA0';


        /*return val == NaN  ? '#e0e0eb':
            val < 100   ? '#ddff99':
            val < 1000  ? '#bbff33':
            val < 5000  ? '#99e600':
            val < 10000 ? '#77b300':
            val < 20000 ? '#669900':
            val < 50000 ? '#558000':
                          '#223300';
        */
        }
}

/*
// function to set color depends upon number of covid case
function getColorCovid(val) {

  // console.log('inside getColor!', val);

  // use conditional operator (?:) to return suitable color scheme
  if (isNaN(val)) {
      // console.log('am NaN')

      return '#bfbfbf';
  }
  else {
    return  d > 100 ? '#800026' :
            d > 50  ? '#BD0026' :
            d > 20  ? '#E31A1C' :
            d > 10  ? '#FC4E2A' :
            d > 5   ? '#FD8D3C' :
            d > 1   ? '#FEB24C' :
                      '#FFEDA0';
      }
}

// function to assign suitable color for median income
function getColorIncome(val) {

  // console.log('inside getColor!', val);

  // use conditional operator (?:) to return suitable color scheme
  if (isNaN(val)) {
      // console.log('am NaN')

      return '#bfbfbf';
  }
  else {
      return val == NaN  ? '#e0e0eb':
          val < 100   ? '#ddff99':
          val < 500  ? '#bbff33':
          val < 1000  ? '#99e600':
          val < 2000 ? '#77b300':
          val < 5000 ? '#669900':
                        '#223300';
      }
}

*/

// function higlight Feature
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 2,
        color: '#666',
        dashArray: '3',
        fillOpacity: 0.7
    });

    // if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    //     layer.bringToFront();
    // }
  }

// function reset highlight
function resetHighlight(e) {
    lyrBoundaries.resetStyle(e.target);
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

// Function to format number with dollar sign
function formatDollar(num) {
    var p = num.toFixed(2).split(".");

    return "$" + p[0].split("").reverse().reduce(function(acc, num, i, orig) {
        return  num=="-" ? acc : num + (i && !(i % 3) ? "," : "") + acc;
    }, "") + "." + p[1];
  }

// Function number with comma
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// use JQuery to handle mouse click on button
$("#btnPrediHouse").click(function() {

  // alert('Housing Price Prediction');
  selSuburb = $("#txtSubHouse").val();
  selYear = $("#txtYearHouse").val();
  selBedroom = $("#txtBedroom").val();

  console.log(selSuburb, selBedroom, selYear);

  // calling on prediction function
  // housingPricePrediction();
  // console.log(housePriceModel)
});

$("#btnPopuGrowth").click(function() {

  // alert('Population Growth Prediction')
  // selSuburb = $("#txtSubHouse").val();
  selYear = $("#txtYearHouse").val();
  // selBedroom = $("#txtBedroom").val();
  // console.log(selSuburb, selBedroom, selYear);
  d3.json('/prediction?Year='+selSuburb+'&selBedroom='+selBedroom)
  // d3.select("divResults").selectAll("<p>")
  //   .append("<p>")
  //   .html(`${prediction}`)
});

$("#btnLivingCost").click(function() {

  alert('Population Growth Prediction')
  selSuburb = $("#txtSubHouse").val();
  selYear = $("#txtYearHouse").val();
  selBedroom = $("#txtBedroom").val();
  console.log(selSuburb, selBedroom, selYear);

});

$('#example').DataTable();
// $('#table_id').DataTable( {
//   data: suburbIncome
// } );

// function to parse data from csv file
function parseData(parData) {

  parData.cases = +parData.cases;
  ttlCases = 0;

  for (var i = 0; i < parData.length; i++) {
    var att = parData[i];
    covCases[att.postcode] = att.cases;


    // total cases
    ttlCases = ttlCases + parseFloat(att.cases);
  }
}

// console.log(covCases);
// console.log('total cases: ', ttlCases);





/*
// Use Thunderforest.Outdoors layer as basemap
var lyrOutdoors = L.tileLayer.provider('Thunderforest.Outdoors');
var lyrBoundaries;

myMap.addLayer(lyrOutdoors);

*/


