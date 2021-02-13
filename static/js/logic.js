//
//https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.{ext}
// define variables
var map;
var lyrOSM;
var lyrCovid;
var ctlLayers;

var selSuburb, selYear, selBedroom, popuValue, subPopuVal;
var subIncome;
var arSuburbs = [];

var houseData, covCases = {};
var ttlCases;

var suburbPopulation = {}, suburbIncome ={};


map = L.map("map", {center:[-37.8136, 144.9631], zoom: 6, minZoom: 6, maxZoom: 15, attributionControl: false});

// lyrStamen = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//   attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//   // subdomains: 'abcd',
//   // ext: 'png'
// });

lyrOSM = L.tileLayer.provider('OpenStreetMap.Mapnik');
lyrOSM.addTo(map);

/*
lyrOSM = L.tileLayer.provider('OpenStreetMap.Mapnik');
map.addLayer(lyrCovid);


// setup layer control
objBasemaps = {
  "Outdoor": lyrStamen,
  "Open Street Map": lyrOSM
};

objOverlays ={
  "Population Distribution": geojson,
  "Covid Cases": lyrCovid

}

ctlLayers = L.control.layers(objBasemaps, objOverlays).addTo(map);
*/

// use d3 to load csv file and create dictionary to hold key/value pairs
// d3.csv('../static/data/COVID19 Data Viz Postcode data - postcode.csv', function(parData) {

//   parseData(parData);

// });

// use d3 to load population data in 2019
d3.csv('../data/Vic_Subs_Popu_2019.csv', function(popuData) {

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

console.log(suburbPopulation);

// loadind median income data
d3.csv('../data/Median_Income.csv', function(incomeData) {

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
d3.json('../data/vic_suburb_stats.json', function(jsonData) {

  // console.log(jsonData);
  // console.log(jsonData['ABBOTSFORD-3067']['details']['suburb_name']);
  // console.log(jsonData['ABBOTSFORD-3067']['details']);

    // total cases
    // ttlCases = ttlCases + parseFloat(att.cases);
  });

// console.log(houseData);

// use jQuery to load boundaries data
$.getJSON("../data/suburb-2-vic.geojson", function(data) {

  var info = L.control();

  // console.log(info);
  // console.log(data);

  info.update = function (props, name) {

    console.log(name);
    console.log(suburbIncome[name]);

    if (isNaN(suburbPopulation[name])) {
      // console.log(name);
      // cleanedName(name)
      // console.log(suburbPopulation[name]);
      // popuValue = 0; //suburbPopulation[name];
      this._div.innerHTML = (props ? '<b>' + name + '</b>' + '<i>' + " Data Not Available!" +'</i>' : '<i>Hover over a suburb</i>');

    }

    else {
      popuValue = suburbPopulation[name];
      this._div.innerHTML = (props ? '<b>' + name + ": " + numberWithCommas(popuValue) + ' people'+'</b>' : '<i>Hover over a suburb</i>');

    // display stats data about the suburb on table
    // console.log()
      }
  };

  info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
  };

  info.addTo(map);

  var geojson = L.geoJson(data, { style: myStyle,

    onEachFeature: function (feature, layer) {

      // layer.bindPopup(feature.properties['vic_loca_2']);

      // acquiring the list of suburbs name

      // feature.properties['vic_loca_2'] = toUpper(feature.properties['vic_loca_2']);
      arSuburbs.push(feature.properties['vic_loca_2']);


      layer
      .on('mouseover', function(e) {
        // console.log(suburbPopulation[feature.properties['vic_loca_2']]);


        layer.setStyle({
          weight: 2,
          color: '#99e600',//#bbff33',
          dashArray: '3',
          fillOpacity: 0.6
        });


        // refresh suburb name

        info.update(layer.feature.properties, layer.feature.properties['vic_loca_2']);

      })

      .on('mouseout', function(e) {
        geojson.resetStyle(e.target); //layer geojson
        info.update();
      })

    }

  })

  geojson.addTo(map);

  var bounds = geojson.getBounds();

  map.fitBounds(bounds);

  map.options.maxBounds = bounds;
  map.options.minZoom = map.getZoom();

  arSuburbs.sort();

  // console.log(arSuburbs);

  // use autocomplete plugin to display suburbs name
  $("#txtSubHouse").autocomplete({
    source: arSuburbs
  });

});


// function (feature) {
//   return {
//     fillColor: getColor(popuValue), //'white'
//     color: 'brown', //'beige'
//     weight: 1.0,
//     fillOpacity: 0.5
//   };

// function style
function myStyle(feature) {

  // var subName =
  feature.properties['vic_loca_2'] = toUpper(feature.properties['vic_loca_2']);


  subPopuVal = suburbPopulation[feature.properties.vic_loca_2];

  if (isNaN(subPopuVal)) {
    // try to assign most suitable suburb name
    cleanedName(feature.properties['vic_loca_2']);
  }

  // console.log('inside myStyle',subPopuVal);

  return {
    // fillColor: getColor(subPopuVal),
    weight: 0.6,
    color: 'beige',
    // dashArray: '2',
    fillOpacity: 0.3
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
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function housingPricePrediction() {
  console.log(housePriceModel);

}

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

// function to assign suitable color depend up export value
function getColor(val) {

  // console.log('inside getColor!', val);

  // use conditional operator (?:) to return suitable color scheme
  if (isNaN(val)) {
    return '#cccccc';
  }
  else {
    return val < 1   ? '#e0e0eb':
          val < 1000   ? '#ddff99':
          val < 5000  ? '#ccff66':
          val < 10000  ? '#bbff33':
          val < 20000 ? '#99e600':
          val < 50000 ? '#77b300':
          val < 100000 ? '#669900':
          val < 200000 ? '#558000':
                        '#446600';
    }
}



/*
// Use Thunderforest.Outdoors layer as basemap
var lyrOutdoors = L.tileLayer.provider('Thunderforest.Outdoors');
var lyrBoundaries;

myMap.addLayer(lyrOutdoors);

const geoData = '../static/data/countries.geojson';

var expDict = {};
var impDict = {};

var expVal, impVal, defVal, selYear, ctyExpVal, ttlExpVal;

// use d3 to load csv file and create dictionary to hold key/value pairs
d3.csv('../static/data/export_data_2018.csv', function(expData) {

  parseData(expData);

});

// setup tooltip for each country and display on map
setTooltip();

clickHandler();


// setting tooltip for layerBoundaries
function setTooltip() {
  lyrBoundaries = new L.LayerGroup();

  lyrBoundaries = L.geoJSON.ajax('../static/data/countries.geojson',{ style: myStyle,
    onEachFeature: function(feature, layer) {

    if (isNaN(ctyExpVal)) {
      layer.bindTooltip("<h4 style = 'text-align: center; background-color: #ffcc66'><b>" +
      feature.properties.ADMIN + "</h4></b>" + "Data unavailable!");
      }
    else {

      var expVal = parseFloat(ctyExpVal).toFixed(2);
      var impNum = parseFloat(impVal).toFixed(2);

      var trdDefi = expVal - impNum;
      trdDefi.toFixed(2);

      pctExpVal = expVal*100/ttlExpVal;
      pctExpVal = pctExpVal.toFixed(3);

      expVal = numberWithCommas(expVal);
      impNum = numberWithCommas(impNum);
      pctExpVal = numberWithCommas(pctExpVal);

      layer.bindTooltip("<h4 style = 'text-align: center; background-color: #ffcc66'><b>" + feature.properties.ADMIN + "</h4></b>" +
        "• Export: " + '$' + expVal + '<br>' + '• Import: ' + '$' + impNum + '<br>' +
        '• Surplus: ' + (trdDefi < 0 ? '-' + formatDollar(trdDefi) : formatDollar(trdDefi)) + '<br>' +
        '• Contribution: ' + pctExpVal +'%',{interactive:false});

      layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight
        });
      }
    }
  });
  // refresh layer boundaries with respective tooltip data to map
  lyrBoundaries.addTo(myMap);
}

// use jQuery library to acquire the selected year in radio button
$("input[name=fltYear]").click(function(e){

  // e.layer.resetStyle()
  myMap.removeLayer(lyrBoundaries);
  // lyrBoundaries.resetStyle();

  selYear = $("input[name=fltYear]:checked").val();

  switch(selYear) {
    case '2016':
      d3.csv('../static/data/export_data_2016.csv', function(expData) {

        parseData(expData);

      });


      break;

    case '2017':
      d3.csv('../static/data/export_data_2017.csv', function(expData) {

        parseData(expData);

      });

      break;

    case '2018':
      d3.csv('../static/data/export_data_2018.csv', function(expData) {

        parseData(expData);

      });

      break;
  }

  // set tooltip for each country
  setTooltip();

  // assign country data
  clickHandler();
});

// function to parse data from csv file

function parseData(expData) {

  expData.export_value = +expData.export_value;
  expData.import_value = +expData.import_value;
  ttlExpVal = 0;

  for (var i = 0; i < expData.length; i++) {
    var att = expData[i];
    expDict[att.location_code] = att.export_value;
    impDict[att.location_code] = att.import_value;

    // total export value
    ttlExpVal = ttlExpVal + parseFloat(att.export_value);
  }
}
// function style
function myStyle(feature) {

  if (feature.properties.ISO_A3 != "-99") {
    ctyExpVal = expDict[feature.properties.ISO_A3];
    impVal = impDict[feature.properties.ISO_A3];

    return {
        fillColor: getColor(ctyExpVal),
        weight: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
      };
    }
  else {
    return {
        fillColor: '#f0f0f5', //getColor(ctyExpVal),
        weight: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
      };
    }
}

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

// function to assign suitable color depend up export value
function getColor(val) {
  if (val == 'NaN') {
    return '#f0f0f5';
  }

  // use conditional operator (?:) to return suitable color scheme
    return  val < 1000000   ? '#eeffcc':
            val < 10000000   ? '#ddff99':
            val < 100000000  ? '#ccff66':
            val < 1000000000  ? '#bbff33':
            val < 10000000000 ? '#99e600':
            val < 100000000000 ? '#88cc00':
            val < 1000000000000 ? '#669900':
            val < 2000000000000 ? '#446600':
            val < 3000000000000 ? '#223300':
                                  '#f0f0f5';
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

// Set up the legend
var legend = L.control({position: 'bottomleft'});

  legend.onAdd = function () {

    var div = L.DomUtil.create('div', 'info legend');

    var lgdInfo = [1000000, 10000000, 100000000,
                  1000000000, 10000000000, 100000000000,
                  1000000000000, 2000000000000];

    var labels = ['$1M', '$10M', '$100M', '$1B', '$100B', '$1T', '$2T', '$2T+'];

    div.innerHTML += "<ul>" + labels.join("&ndash;&ndash;&ndash;&ndash;&ndash;&ndash;") + "</ul>";
    for (var i = 0; i < lgdInfo.length; i++) {
      div.innerHTML += '<i style="background-color:' + getColor(lgdInfo[i]) +'" ></i>'
    }
    return div;
  };

// Add legend to the map
legend.addTo(myMap);

// Default country table values
country = "Australia";

d3.json(`/data/${country}`, function(data) {

  var keys = Object.keys(data);
  var values = Object.values(data);

  keys.shift();

  var a = [];

  keys.forEach(function(x) {
    a.push({x: data[x]});
  });

  d3.select("tbody").selectAll("tr")
    .data(a)
    .enter()
    .append("tr")
    .html(function(d, i) {
      return `<th scope="row">${keys[i]}</th><td>${d.x}</td>`
    });
});

function clickHandler() {
  lyrBoundaries.on('click', function(e){

    // highlightFeature(e);
    // resetHighlight(e);

    var country = e.layer.feature.properties.ADMIN;

    d3.json(`/data/${country}`, function(data) {
      var keys = Object.keys(data);
      var values = Object.values(data);

    keys.shift();

      var a = [];

      keys.forEach(function(x) {
        a.push({x: data[x]});
      });

      d3.select("tbody").html("");

      d3.select("tbody").selectAll("tr")
        .data(a)
        .enter()
        .append("tr")
        .html(function(d, i) {
          return `<th scope="row">${keys[i]}</th><td>${d.x}</td>`
        });
    });
  });
}
*/