import { bus } from '@/lib/shared/bus';

bus.on('page.scroll', ({ direction, pixels }) => {
	console.log('Сработала комманда scroll');

	switch (direction) {
		case 'top':
			window.scrollTo({
				top: 0,
				behavior: 'smooth',
			});
			break;

		case 'bottom':
			window.scrollTo({
				top: document.body.scrollHeight,
				behavior: 'smooth',
			});
			break;

		case 'far-left':
			window.scrollTo({
				left: 0,
				behavior: 'smooth',
			});
			break;

		case 'far-right':
			window.scrollTo({
				left: document.body.scrollWidth,
				behavior: 'smooth',
			});
			break;

		case 'up':
			window.scrollBy({
				top: -pixels,
				behavior: 'smooth',
			});
			break;

		case 'down':
			window.scrollBy({
				top: pixels,
				behavior: 'smooth',
			});
			break;

		case 'left':
			window.scrollBy({
				left: -pixels,
				behavior: 'smooth',
			});
			break;

		case 'right':
			window.scrollBy({
				left: pixels,
				behavior: 'smooth',
			});
			break;
	}
});
