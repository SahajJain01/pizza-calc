document.getElementById("qty").value = 2;
document.getElementById("dia").value = 20;
document.getElementById("hydration").value = 60;
document.getElementById("yeast").value = 1;
document.getElementById("salt").value = 2;
document.getElementById("sugar").value = 2;
document.getElementById("olive").value = 3;

function frac(dec) {
	var no = Math.floor(dec);
	if (no == 0) no = '';
	dec = dec % 1;
	if(dec < 1 && dec >= 0.875) {
		return no + 1;
	} else if(dec < 0.875 && dec >= 0.625) {
		return no + ' ¾'
	} else if(dec < 0.625 && dec >= 0.375) {
		return no + ' ½'
	} else if (dec < 0.375 && dec >= 0.125) {
		return no + ' ¼'
	} else {
		return no;
	}
}

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
			frac((yeast / 2.83)) +
			" tsp</br>Salt: " +
			frac((salt / 5.69)) +
			" tsp</br>Sugar: " +
			frac((sugar / 4.167)) +
			" tsp</br>Olive: " +
			frac((olive / 4.929)) +
			" tsp / " +
			frac((olive / 14.7868)) +
			" tbsp</br>Weight of doughball: " +
			weight +
			"g"
	);
	event.preventDefault();
});