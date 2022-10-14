var $body = document.querySelector('body');
var scrollPosition = 0;

function scrollLock() {
	scrollPosition = window.pageYOffset;
	$body.style.overflowY = 'hidden';
	$body.style.position = 'fixed';
	$body.style.top = `-${scrollPosition}px`;
	$body.style.width = '100%';
}

function scrollUnLock() {
	$body.style.removeProperty('overflow');
	$body.style.removeProperty('position');
	$body.style.removeProperty('top');
	$body.style.removeProperty('width');
	window.scrollTo(0, scrollPosition);
}