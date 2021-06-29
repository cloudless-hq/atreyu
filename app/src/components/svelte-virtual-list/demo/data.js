import getName from 'namey-mcnameface';

function rand(min, max) {
	return min + ~~(Math.random() * (max - min));
}

function fill(len, fn) {
	return Array(len).fill().map((_, i) => fn(i));
}

function createRandomGarbage() {
	const numWords = rand(4, 50);
	return fill(numWords, () => {
		const numLetters = rand(3, 12);
		return fill(numLetters, () => String.fromCharCode(rand(97,122))).join('')
	}).join(' ');
}

const avatars = [
	// images from https://www.pexels.com/search/dog/
	'https://images.pexels.com/photos/356378/pexels-photo-356378.jpeg?auto=compress&cs=tinysrgb&h=75',
	'https://images.pexels.com/photos/59523/pexels-photo-59523.jpeg?auto=compress&cs=tinysrgb&h=75',
	'https://images.pexels.com/photos/406014/pexels-photo-406014.jpeg?auto=compress&cs=tinysrgb&h=75',
	'https://images.pexels.com/photos/460823/pexels-photo-460823.jpeg?auto=compress&cs=tinysrgb&h=75',
	'https://images.pexels.com/photos/58997/pexels-photo-58997.jpeg?auto=compress&cs=tinysrgb&h=75',
	'https://images.pexels.com/photos/374906/pexels-photo-374906.jpeg?auto=compress&cs=tinysrgb&h=75',
	'https://images.pexels.com/photos/434090/pexels-photo-434090.jpeg?auto=compress&cs=tinysrgb&h=75',
	'https://images.pexels.com/photos/551628/pexels-photo-551628.jpeg?auto=compress&cs=tinysrgb&h=75',
	'https://images.pexels.com/photos/532310/pexels-photo-532310.jpeg?auto=compress&cs=tinysrgb&h=75'
];

export default fill(1000, (i) => {
	return {
		key: `_${i}`,
		name: getName(),
		content: createRandomGarbage(),
		avatar: avatars[rand(0, avatars.length)]
	};
});
