
var lyrStamen = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  // subdomains: 'abcd',
  // ext: 'png'
});


var map = L.map("map", {attributionControl: false, minZoom: 6, maxZoom: 12}); //center: [50.378472, 14.970598]
lyrStamen.addTo(map);

// define variables

var selSuburb, selYear, selBedroom;
var arSuburbs = [];

var houseData={}, covCases = {};
var ttlCases;

var subPopulation = {};

const geoQuery = '../static/data/suburb-2-vic.geojson';

var lyrSubBoundaries;

var expDict = {};
var impDict = {};
var expVal, impVal, defVal;
var ttlExpVal;
var selYear;
var ctyExpVal;

var subPopuVal, subIncome, subHousePrice;

// use d3 to load csv file and create dictionary to hold key/value pairs
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
  setTooltip();

  // add layer to map
  lyrSubBoundaries.addTo(myMap);


});

lyrSubBoundaries = new L.LayerGroup();

/*
d3.csv('../static/data/export_data_2018.csv', function(expData) {

  // parsing data
  parseData(expData);

  // set tooltip for each country
  setTooltip();

  // add layer to map
  lyrBoundaries.addTo(myMap);
});

// setup bindPopup for each country
lyrBoundaries = new L.LayerGroup();
*/
// function setting tooltip for layerBoundaries
function setTooltip() {

  lyrSubBoundaries = L.geoJSON.ajax(geoQuery, { style: myStyle,
    onEachFeature: function(feature, layer) {

    // console.log(feature);
    var expVal = parseFloat(ctyExpVal).toFixed(2);

    // var expVal = ctyExpVal;
    // console.log(expVal);

    var impNum = parseFloat(impVal).toFixed(2);

    // check if the data is available
    if (isNaN(expVal)) {
      layer.bindTooltip("<h4 style = 'text-align: center; background-color: #ffcc66'><b>" +
      feature.properties.ADMIN + "</h4></b>" + "Data unavailable!");
    }

    else {

      subPopuVal.toFixed(2);
      subIncome.toFixed(2);
      subHousePrice.toFixed(2);

      // pctExpVal = expVal*100/ttlExpVal;
      // pctExpVal = pctExpVal.toFixed(3);

      subIncome = numberWithCommas(subIncome);
      subHousePrice = numberWithCommas(subHousePrice);


      // bindtooltip of each feature to layer

      layer.bindTooltip("<h4 style = 'text-align: center; background-color: #ffcc66'><b>" +
        feature.properties.vic_loca_2 + "</h4></b>" +
        "• Population: " + subPopuVal + '<br>' + '• Median Household Income: ' + '$' + subIncome + '<br>' +
        '• House Price: ' + subHousePrice);
      }

      layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight
      });
    }
  });

}

// use jQuery library to acquire the selected year in radio button
$("input[name=fltYear]").click(function(){

  // remove existing layer prior to adding layerBoundaries with new bindtooltip data back
  myMap.removeLayer(lyrBoundaries);

  var selYear = $("input[name=fltYear]:checked").val();
  // console.log(selYear);

  expDict = {};
  impDict = {};

  switch(selYear) {
    case '2016':

      d3.csv('./static/data/export_data_2016.csv', function(expData) {

        parseData(expData);

      });

      setTooltip();
      break;

    case '2017':

      d3.csv('./static/data/export_data_2017.csv', function(expData) {

        parseData(expData);

      });

      setTooltip();
      break;

    case '2018':

      d3.csv('./static/data/export_data_2018.csv', function(expData) {

        parseData(expData);

      });

      setTooltip();
      break;

  }

  // refresh layer boundaries with respective tooltip data to map
  lyrBoundaries.addTo(myMap);

});

// function to parse data from csv file
function parseData(expData) {

  expData.export_value = +expData.export_value;
  expData.import_value = +expData.import_value;

  ttlExpVal = 0;

  // looping through each row to assign export/import value to dictionaries
  for (var i = 0; i < expData.length; i++) {

    var att = expData[i];
    expDict[att.location_code] = att.export_value;
    impDict[att.location_code] = att.import_value;

    // total export value
    ttlExpVal = ttlExpVal + parseFloat(att.export_value);
  }
};

// function style
function myStyle(feature) {
  // mark down the outlier data points
  if (feature.properties.vic_loca_2 != "") {

    subPopuVal = suburbPopulation[feature.properties.vic_loca_2];

    impVal = impDict[feature.properties.ISO_A3];
    // console.log(ctyExpVal);
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
    fillColor: getColor(ctyExpVal),
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

}

// function reset highlight
function resetHighlight(e) {
  lyrBoundaries.resetStyle(e.target);
}

// function to assign suitable color depend up export value
function getColor(val) {
  if (val === 'NaN') {
    return '#f0f0f5'
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

// Default country table values
country = "Australia";

d3.json(`/data/${country}`, function(data) {

  var keys = Object.keys(data);
  var values = Object.values(data);

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

console.log(lyrBoundaries);

lyrBoundaries.on('click', function(e){
  console.log("Hi");

  var country = e.layer.feature.properties.ADMIN;

  d3.json(`/data/${country}`, function(data) {
    var keys = Object.keys(data);
    var values = Object.values(data);

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

// define basemaps
objBasemaps = {
  "Outdoors": lyrOutdoors
};

// define overlays
objOverlays = {
  "Boundary":lyrBoundaries
};