// Import stylesheets
import "./style.css";
import $ from "jquery";

document.getElementById("qty").value = 2;
document.getElementById("dia").value = 20;
document.getElementById("hydration").value = 60;
document.getElementById("yeast").value = 1;
document.getElementById("salt").value = 2;
document.getElementById("sugar").value = 2;
document.getElementById("olive").value = 3;

$("form").submit(function (event) {
	$("#results").empty();
	let data = $(this).serializeArray();
	console.log(data.dia);
	var temp_array = data.map(function (item) {
		return item.value;
	});
	console.log(data);
	console.log(temp_array);

	let weight = Math.round(
		4.017908525 * Math.pow(10, -5) * Math.pow(temp_array[1], 5) -
			6.721341349 * Math.pow(10, -3) * Math.pow(temp_array[1], 4) +
			0.431223152 * Math.pow(temp_array[1], 3) -
			13.09562775 * Math.pow(temp_array[1], 2) +
			194.6689912 * temp_array[1] -
			970.1543255
	);

	console.log(weight);

	var hydration = temp_array[2] / 100;
	console.log(hydration);
	var yeast = temp_array[3] / 100;
	var salt = temp_array[4] / 100;
	var sugar = temp_array[5] / 100;
	var olive = temp_array[6] / 100;
	var sum = temp_array[0] * weight;
	var flour = Math.round(sum / (1 + hydration));
	flour = Math.round(flour / 5) * 5;
	var water = sum - flour;
	yeast = Math.round(flour * yeast * 5) / 5;
	salt = Math.round(flour * salt * 5) / 5;
	sugar = Math.round(flour * sugar * 5) / 5;
	olive = Math.round(flour * olive * 5) / 5;

	$("#results").append(
		"Flour: " +
			flour +
			"g</br>Water: " +
			water +
			"ml</br>Yeast: " +
			yeast +
			"g / " +
			(yeast / 2.83).toFixed(2) +
			"tsp</br>Salt: " +
			salt +
			"g / " +
			(salt / 5.69).toFixed(2) +
			"tsp</br>Sugar: " +
			sugar +
			"g / " +
			(sugar / 4.167).toFixed(2) +
			"tsp</br>Olive: " +
			olive +
			"ml / " +
			(olive / 4.929).toFixed(2) +
			"tsp / " +
			(olive / 14.7868).toFixed(2) +
			"tbsp</br>Weight of doughball: " +
			weight +
			"g"
	);
	event.preventDefault();
});

/*
document.getElementById("qty").value = 2;
document.getElementById("dia").value = 20;
document.getElementById("hydration").value = 60;
document.getElementById("yeast").value = 1;
document.getElementById("salt").value = 2;
document.getElementById("sugar").value = 2;
document.getElementById("olive").value = 3;
function calculate() {
	var qty = document.getElementById("qty").value;
	var dia = document.getElementById("dia").value;
	var weight = Math.round(
		4.017908525 * Math.pow(10, -5) * Math.pow(dia, 5) -
			6.721341349 * Math.pow(10, -3) * Math.pow(dia, 4) +
			0.431223152 * Math.pow(dia, 3) -
			13.09562775 * Math.pow(dia, 2) +
			194.6689912 * dia -
			970.1543255
	);
	var hydration = document.getElementById("hydration").value / 100;
	var yeast = document.getElementById("yeast").value / 100;
	var salt = document.getElementById("salt").value / 100;
	var sugar = document.getElementById("sugar").value / 100;
	var olive = document.getElementById("olive").value / 100;
	var sum = qty * weight;
	flour = Math.round(sum / (1 + hydration));
	flour = Math.round(flour / 5) * 5;
	water = sum - flour;
	yeast = Math.round(flour * yeast * 5) / 5;
	salt = Math.round(flour * salt * 5) / 5;
	sugar = Math.round(flour * sugar * 5) / 5;
	olive = Math.round(flour * olive * 5) / 5;
	document.getElementById("results").innerHTML =
		"Flour: " +
		flour +
		"g</br>Water: " +
		water +
		"ml</br>Yeast: " +
		yeast +
		"g / " +
		(yeast / 2.83).toFixed(2) +
		"tsp</br>Salt: " +
		salt +
		"g / " +
		(salt / 5.69).toFixed(2) +
		"tsp</br>Sugar: " +
		sugar +
		"g / " +
		(sugar / 4.167).toFixed(2) +
		"tsp</br>Olive: " +
		olive +
		"ml / " +
		(olive / 4.929).toFixed(2) +
		"tsp / " +
		(olive / 14.7868).toFixed(2) +
		"tbsp</br>Weight of doughball: " +
		weight +
		"g";
	preventDefault();
}

*/
