const url = 'https://market-intelligence-competitors-lookalikes-and-more.p.rapidapi.com/';
const options = {
	method: 'GET',
	headers: {
		'x-rapidapi-key': 'fff2633613mshdff0212483e5a8dp1fb6b2jsnebcfe705a834',
		'x-rapidapi-host': 'market-intelligence-competitors-lookalikes-and-more.p.rapidapi.com'
	}
};

try {
	const response = await fetch(url, options);
	const result = await response.text();
	console.log(result);
} catch (error) {
	console.error(error);
}