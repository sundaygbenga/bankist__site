'use strict';

const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.btn--close-modal');
const btnsOpenModal = document.querySelectorAll('.btn--show-modal');
const btnScrollTo = document.querySelector('.btn--scroll-to');
const section1 = document.querySelector('#section--1');
const nav = document.querySelector('.nav');
const tabsContainer = document.querySelector('.operations__tab-container');
const tabs = document.querySelectorAll('.operations__tab');
const tabsContent = document.querySelectorAll('.operations__content');

///////////////////////////////////////
// Modal window

const openModal = function (e) {
  e.preventDefault();
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

const closeModal = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

btnsOpenModal.forEach(btn => btn.addEventListener('click', openModal));

btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

// Button scroll
btnScrollTo.addEventListener('click', function (e) {
  section1.scrollIntoView({ behavior: 'smooth' });
});

//////////////////////////////////////////////////////////////////////////////////////
// PAGE NAVIGATION: SMOOTH SCROLL

// Rough method
// document.querySelectorAll('.nav__link').forEach(function (el) {
//   el.addEventListener('click', function (e) {
//     e.preventDefault();

//     const id = this.getAttribute('href');
//     console.log(id);
//     document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
//   });
// });

// Using EVENT DELEGATION
// step 1:Add event listener to the common parent of all the elements we are interested in.
// step 2: Determine what element originated the event

document.querySelector('.nav__links').addEventListener('click', function (e) {
  e.preventDefault();

  // Matching strategy
  if (e.target.classList.contains('nav__link')) {
    const id = e.target.getAttribute('href');
    console.log(id);
    document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
  }
});

///////////////////////////////////////////
/// BUILDING A TABBED COMPONENT ///////////

// Not good enough:
// tabs.forEach(t => t.addEventListener('click', () => console.log('TAB')));

//  Use event delegation
tabsContainer.addEventListener('click', function (e) {
  const clicked = e.target.closest('.operations__tab');
  //   console.log(clicked);

  // Guard clause
  if (!clicked) return;

  // Remove active classes: for other components actually when a component is clicked
  tabs.forEach(t => t.classList.remove('operations__tab--active'));
  tabsContent.forEach(c => c.classList.remove('operations__content--active'));

  // Activate tab
  clicked.classList.add('operations__tab--active');

  // Activate tab content
  // console.log(clicked.dataset.tab);
  document
    .querySelector(`.operations__content--${clicked.dataset.tab}`)
    .classList.add('operations__content--active');
});

/////////// PASSING ARGUMENTS TO EVENT HANDLER FUNCTION //////////////////////////
// Menu fade animation
const handleHover = function (e) {
  //   console.log(this, e.currentTarget);

  if (e.target.classList.contains('nav__link')) {
    const link = e.target;
    const siblings = link.closest('.nav').querySelectorAll('.nav__link');
    const logo = link.closest('.nav').querySelector('img');

    siblings.forEach(el => {
      if (el !== link) el.style.opacity = this;
    });
    logo.style.opacity = this;
  }
};

//Passing "argument" into handler
nav.addEventListener('mouseover', handleHover.bind(0.5));
nav.addEventListener('mouseout', handleHover.bind(1));

///////////////////////////////////////////
//////STICKY NAVIGATION  //////////////////

// The scroll event
// Scroll event is not really efficient for performance because it fires up all the time no matter how small the event is: should be avoided
// const initialCoords = section1.getBoundingClientRect();
// console.log(initialCoords);

// window.addEventListener('scroll', function (e) {
//   console.log(window.scrollY);

//   if (this.window.scrollY > initialCoords.top) nav.classList.add('sticky');
//   else nav.classList.remove('sticky');
// });

// A BETTER WAY FOR STICKY NAVIGATION
////// THE INTERSECTION OBSERVER API///////
// This API allows our code to basically observe changes to the way that a certain target element intersect another element or the the viewport.
// threshold is the % at which the observer callback, will be called
// root : the element that our target element is intersecting

// const obsCallback = function (entries, observer) {
//   entries.forEach(entry => {
//     // entry.target.closest()
//     console.log(entry);
//   });
// };

// const obsOptions = {
//   root: null,
//   threshold: [0, 0.2],
// };

// const observer = new IntersectionObserver(obsCallback, obsOptions);
// observer.observe(section1);
const header = document.querySelector('.header');
const navHeight = nav.getBoundingClientRect().height;
// console.log(navHeight);

const stickyNav = function (entries, headerObserver) {
  const [entry] = entries;
  //   console.log(entry);

  if (!entry.isIntersecting) nav.classList.add('sticky');
  else nav.classList.remove('sticky');

  if (window.screen.width <= 992) nav.classList.remove('sticky');
};
const obsOptions = {
  root: null,
  threshold: 0,
  rootMargin: `-${navHeight}px`,
};

const headerObserver = new IntersectionObserver(stickyNav, obsOptions);
headerObserver.observe(header);

/////////////////////////////////////////////////// REVEALING SECTIONS ON SCROLL//////
const allSections = document.querySelectorAll('.section');

const revealSection = function (entries, observer) {
  const [entry] = entries;
  //   console.log(entry);

  // implementing the observation
  if (!entry.isIntersecting) return;
  entry.target.classList.remove('section--hidden');

  // un-observe
  observer.unobserve(entry.target);
};

const onsOptions = {
  root: null,
  threshold: 0.15,
};

const sectionObserver = new IntersectionObserver(revealSection, obsOptions);

allSections.forEach(function (section) {
  sectionObserver.observe(section);
  //   section.classList.add('section--hidden');
});

////////////////////////////////////////////////
// LAZY LOADING IMAGES
// Best for performance incase of poor network, low data usage etc
const imgTargets = document.querySelectorAll('img[data-src]');

const loadImg = function (entries, observer) {
  const [entry] = entries;
  //   console.log(entry);

  if (!entry.isIntersecting) return;

  // Replace src with data-src
  entry.target.src = entry.target.dataset.src;

  entry.target.addEventListener('load', function () {
    entry.target.classList.remove('lazy-img');
  });

  observer.unobserve(entry.target);
};

const imgObserver = new IntersectionObserver(loadImg, {
  root: null,
  threshold: 0,
  roothMargin: '-200px',
});

imgTargets.forEach(img => imgObserver.observe(img));

//////////////////////////////////////////
//// SLIDER COMPONENT PART 1//////////
const slider = function () {
  const slides = document.querySelectorAll('.slide');
  const btnLeft = document.querySelector('.slider__btn--left');
  const btnRight = document.querySelector('.slider__btn--right');
  const dotContainer = document.querySelector('.dots');

  let curSlide = 0;
  const maxSlide = slides.length;

  // Functions
  const goToSlide = function (slide) {
    slides.forEach(
      (s, i) => (s.style.transform = `translateX(${100 * (i - slide)}%)`)
    );
  };

  // Next slide
  const nextSlide = function (e) {
    if (curSlide === maxSlide - 1) {
      curSlide = 0;
    } else {
      curSlide++;
    }

    goToSlide(curSlide);
    activateDot(curSlide);
  };

  //Previous slide
  const prevSlide = function () {
    if (curSlide === 0) {
      curSlide = maxSlide - 1;
    } else {
      curSlide--;
    }

    goToSlide(curSlide);
    activateDot(curSlide);
  };

  const createDots = function () {
    slides.forEach((_, i) => {
      dotContainer.insertAdjacentHTML(
        'beforeend',
        `<button class="dots__dot" data-slide="${i}"></button>`
      );
    });
  };

  const activateDot = function (slide) {
    document
      .querySelectorAll('.dots__dot')
      .forEach(dot => dot.classList.remove('dots__dot--active'));

    document
      .querySelector(`.dots__dot[data-slide= "${slide}"]`)
      .classList.add('dots__dot--active');
  };

  const init = function () {
    goToSlide(0);
    createDots();
    activateDot(0);
  };
  init();

  // Event handlers
  btnRight.addEventListener('click', nextSlide);

  btnLeft.addEventListener('click', prevSlide);
  // -100%, 0%, 100%, 200%, 300%

  // Keyborad event
  document.addEventListener('keydown', function (e) {
    // console.log(e.key);
    if (e.key === 'ArrowRight') nextSlide();
    e.key === 'ArrowLeft' && prevSlide();
  });

  dotContainer.addEventListener('click', function (e) {
    if (e.target.classList.contains('dots__dot')) {
      const { slide } = e.target.dataset;
      goToSlide(slide);
      activateDot(slide);
    }
  });
};
slider();

// Close the toggler after clicking an action
const menu = document.querySelector('.menu');
const toggler = document.querySelector('input[type="checkbox"]');

function removeChecked() {
  toggler.checked = false;
}

menu.addEventListener('click', function (e) {
  e.preventDefault();
  removeChecked();
});

//////////////////////////////////////////////////////////////////////////////////////
// SELECTING CREATING AND DELETING ELEMENTS
/*
// SELECTING ELEMENTS
console.log(document.documentElement);
console.log(document.head);
console.log(document.body);

const header = document.querySelector('.header');
const allSections = document.querySelectorAll('.section'); // returns Nodelist: does not update as the HTMLCollection bcos the variable was created by the time the element still existed. and it dosen't update itself even if we delete the element
console.log(allSections);

document.getElementById('section--1');
const allButtons = document.getElementsByTagName('button'); // returns HTMLCollection: an HTMLCollection is a so-called life collection. If the DOM changes, the collection is immediately updated automatically. i.e if we delete an element
console.log(allButtons);

console.log(document.getElementsByClassName('btn'));

// CREATING AND INSERTING ELEMENTS PROGRAMATICALLY
//  .insertAdjacentHTML()

const message = document.createElement('div');
message.classList.add('cookie-message');
// message.textContent =
//   'We use cookies for improved functionality and analytics.';
message.innerHTML =
  'We use cookies for improved functionality and analytics. <button class="btn btn--close-cookie"> Got it! </button>';

// header.prepend(message);
header.append(message);
// header.append(message.cloneNode(true));

// header.before(message);
// header.after(message);

// info
document.queryselector('.header).inserAdjacentHTML('beforeend', '<div class="cookie-message"> We use cookies for improved functionality and analytics. <button class="btn btn--close-cookie">OK! Close message</button></div>')

// DELETE / CLOSE ELEMENTS
// message
document
  .querySelector('.btn--close-cookie')
  .addEventListener('click', function () {
    //   message.remove();
    message.parentElement.removeChild(message);
  });

// info
// document.querySelector('.btn--close-qi').addEventListener('click', function () {
//   info.remove();
// });
document.queryselector('.btn--close-cookie').addEventListener('click', function(e){
    document.querySelector('.cookie-message').remove()
})
////////////////////////////////////////////////
// STYLES ATTRIBUTES AND CLASSES ///////////

// STYLES : always inline styles
message.style.background = '#37383d';
message.style.width = '110%';
message.style.margin = 'auto';
// message.style.marginBottom = '50px';
message.style.padding = '10px 0 10px 0';

// We can only get the value of a inline style property with this but not the configured style

console.log(message.style.color); // no result
console.log(message.style.background); // yes, because we set it by ourself

// Getting computed style
console.log(getComputedStyle(message).color);
console.log(getComputedStyle(message).height);

message.style.height =
  Number.parseFloat(getComputedStyle(message).height, 10) + 40 + 'px';
// message.style.height = '40px';

document.documentElement.style.setProperty('--color-primary', 'orangered');

// ATTRIBUTES
const logo = document.querySelector('.nav__logo');
console.log(logo.alt);
console.log(logo.src);
console.log(logo.id);
console.log(logo.className);

// setting attributes
logo.alt = 'Beautiful minimalist logo';

// Non-standard
console.log(logo.designer); // undefined
console.log(logo.getAttribute('designer'));
logo.setAttribute('company', 'Bankist');

console.log(logo.src); // Absolute value
console.log(logo.getAttribute('src')); // Relative value

const link = document.querySelector('.twitter-link');
console.log(link.href);
console.log(link.getAttribute('href'));

const link2 = document.querySelector('.nav__link--btn');
console.log(link2.href);
console.log(link2.getAttribute('href'));

// Data attributes
console.log(logo.dataset.versionNumber);

// CLASSES
logo.classList.add('c', 'j');
logo.classList.remove('c', 'j');
logo.classList.toggle('c', 'j');
logo.classList.contains('c', 'j'); // not includes

// we can set a className : but don't use
logo.className = 'jonas';
*/

//////////////////////////////////////////
//// IMPLEMENTING SMOOTH SCROLLING  //////

// Elements

// // Old method
// btnScrollTo.addEventListener('click', function (e) {
//   // get coordinates of the element we want to scroll to
//   const s1coords = section1.getBoundingClientRect();
//   console.log(s1coords);

//   console.log(e.target.getBoundingClientRect());

//   // current scroll position
//   //   console.log('Currrent scroll (X/Y)', window.pageXOffset, window.pageYOffset);
//   console.log('Currrent scroll (X/Y)', window.scrollX, window.scrollY);

//   // viewport height and width
//   console.log(
//     'height/width viewport',
//     document.documentElement.clientHeight,
//     document.documentElement.clientWidth
//   );

//   // Scrolling
//   //   window.scrollTo(
//   //     s1coords.left + window.scrollX,
//   //     s1coords.top + window.scrollY
//   //   );

//   window.scrollTo({
//     left: s1coords.left + window.scrollX,
//     top: s1coords.top + window.scrollY,
//     behavior: 'smooth',
//   });
// });

// Modern method
// btnScrollTo.addEventListener('click', function (e) {
//   section1.scrollIntoView({ behavior: 'smooth' });
// });

/*
///////////////////////////////////////////
// TYPES OF EVENTS AND EVENT HANDLERS /////

// An event is basically a signal that is generated by a certain DOM node: signal means that something has happened i.e click, mouseover, triggers and anything importance that happenon our web page generate an event. We can then listen for these events in our code using event listeners, we can then handle them if we want

const h1 = document.querySelector('h1');

// h1.addEventListener('mouseenter', function (e) {
//   alert('addEventListener: Great! You are reading the heading :D');
// });

// old method
// h1.onmouseenter = function (e) {
//   alert('onMouseenter: Great! You are reading the heading :D');
// };

// Deleting event listener
// const alertH1 = function (e) {
//   alert('addEventListener: Great! You are reading the heading :D');

//   h1.removeEventListener('mouseenter', alertH1);
// };
// h1.addEventListener('mouseenter', alertH1);

// delete with timeout
const alertH1 = function (e) {
  alert('addEventListener: Great! You are reading the heading :D');
};
h1.addEventListener('mouseenter', alertH1);

// delete timeout
setTimeout(() => h1.removeEventListener('mouseenter', alertH1), 5000);

// Third way to handle event : old method
// adding the event directly  in the HTML page
//  <h1 onclick="alert('HTML alert')">
*/

///////////////////////////////////////////
////// EVENT PROPAGATION: BUBBLING AND CAPTURING /////////////////////////////

// Properties of javascript events: Capturing phase and Bubbling phase

{
  /*
  <html>
  <body>
  <section>
    <p>
      {' '}
      A paragraph with a <a href="#">Link</a>
    </p>
    <p>A second paragraph</p>
  </section>
</body>
</html>; */
}
//  When a click happens on the link: the DOM generates a click event right away: However this event is not generated at the target element. instead it is genersted a the root of the document, at the top of the DOM tree.
//And from there CAPTURING phase happens, where the events then travel all the way down from the document root to the target element.
// As the event travels down the tree, it will pass through every single parent element of the target element.i.e <html>-><body>-><section>-><p>-><a>

// As soon as the event reaches the target, the TARGET phase begins: where events can be handled right at the target. i.e with event listeners on the anchor element. As soon as the event occures, it runs the attached callback function.

// After reaching the target, the event then travels all the way up to the document root again in the BUBBLING phase (event bubble up from the target to the document root). so the event passes up through all the parent elements up again.

// By default, event can only be handled in the TARGET and in the BUBBLING phase. but we can set up event listener to listen to event in the CAPTURING phase instead.

// Also not all types of events have capturing and bubbling phase, some of them are created right on the target elements, so we can only handle them there.

/*
///////////////////////////////////////////
/// EVENT PROPAGATION IN PRACTICE  ////////

// rgb(255,255,255)
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);

const randomColor = () =>
  `rgb(${randomInt(0, 255)},${randomInt(0, 255)},${randomInt(0, 255)})`;

console.log(randomColor(0, 255));

document.querySelector('.nav__link').addEventListener('click', function (e) {
  this.style.background = randomColor();
  this.style.borderRadius = '5px';
  console.log('LINK', e.target, e.currentTarget);

  // Stop propagation
  //   e.stopPropagation();
});

document.querySelector('.nav__links').addEventListener('click', function (e) {
  this.style.background = randomColor();
  this.style.borderRadius = '5px';
  console.log('LINK', e.target, e.currentTarget);
});
document.querySelector('.nav').addEventListener('click', function (e) {
  this.style.background = randomColor();
  this.style.borderRadius = '5px';
  console.log('NAV', e.target, e.currentTarget);
});

// Phase 1- Capture phase
// Events are captured when they come down from the document route all the way to the target.
// We catch events during the capturing phase by defining a third parameter in the addeventListener: to true /false

// document.querySelector('.nav').addEventListener(
//   'click',
//   function (e) {
//     this.style.background = randomColor();
//     this.style.borderRadius = '5px';
//     console.log('NAV', e.target, e.currentTarget);
//   },
//   true
// );
*/
/*
///////////////////////////////////////////
/////////// EVENT DELEGATION: IMPLEMENTING PAGE NAVIGATION /////////////////////

///////////////////////////////////////////
/// DOM TRAVERSING ///////////////////////
// DOM traversing is simply walking through the DOM

const h1 = document.querySelector('h1');

// Going downwards: child
console.log(h1.querySelectorAll('.highlight'));
console.log(h1.childNodes);
console.log(h1.children);
h1.firstElementChild.style.color = 'white';
h1.lastElementChild.style.color = 'orangered';

// Going upwards: parents
console.log(h1.parentNode);
console.log(h1.parentElement);

// FInding a far away parent element in the DOM tree
h1.closest('.header').style.background = 'var(--gradient-secondary)';

h1.closest('h1').style.background = 'var(--gradient-primary)';

// Going sideways: siblings
console.log(h1.previousElementSibling);
console.log(h1.nextElementSibling);

console.log(h1.previousSibling);
console.log(h1.nextSibling);

console.log(h1.parentElement.children);
[...h1.parentElement.children].forEach(function (el) {
  if (el !== h1) el.style.transform = 'scale(0.5)';
});
*/
/*
// BEST METHOD TO INSERT HTML ELEMENT
document
  .querySelector('.header')
  .insertAdjacentHTML(
    'beforeend',
    '<div class="cookie-message"> We use cookies for improved functionality and analytics. <button class="btn btn--close-cookie">OK! Close message</button></div>'
  );

document
  .querySelector('.btn--close-cookie')
  .addEventListener('click', function (e) {
    document.querySelector('.cookie-message').remove();
  });
*/

////////////////////////////////////////////////////////////////////////////////////
// LIFECYCLE DOM EVENTS /////
//1).  DOM content loaded: this event is fired by the document as soon as the HTML is completely parsed: [html has been downloaded and converted to the DOM tree]......All scripts must be downloaded and executed before the DOM content loaded event can happen.
// This event does not wait for image and other external resources  to load, just HTML and JS need to be loaded
// Now we can excute the code that needs to be ececuted after the DOM is available:
document.addEventListener('DOMContentLoaded', function (e) {
  console.log('HTML parsed and DOM tree built!', e);
});

//2). Load event is fired by window as soon as all the images and all external resources are completely loaded
window.addEventListener('load', function (e) {
  console.log('Page fully loaded', e);
});

// 3).Beforeunload is fired when a user is about to leave a page
// we can then use this event to ask the user if they really want to leave the page: in the case of user filling a form, a data that can be lost in the process, then we shld use this kind of prompt
// window.addEventListener('beforeunload', function (e) {
//   e.preventDefault();
//   console.log(e);
//   e.returnValue = '';
// });

//////////////////////////////////////////
// EFFICIENT SCRIPT LOADING: DEFER AND ASYNC
// we both as attribute to our script link in the HTML file.

//

//  ASYNC (IN HEAD) fetches the JS file as the HTML file is being parsed and get executed imediately: Scripts are fetched asynchronously and executed immediately
// Ususally the DOMContentLoaded event waits for all scripts to execute, except for async scripts.
// Scripts do not execute in order
//INFO USE FOR 3rd PARTY SCRIPTS WHERE ORDER DOSEN'T MATTER (e.g. Google Analytics)

// while DEFER (IN HEAD) also fetches and loads the JS file during the parsing period pf the HTML but waits until after the HTML has been fully parsed before execution: Scripts are fetched asynchronously and executed  after HTML is completely parsed
// Ususally the DOMContentLoaded event waits fire after defer script is executed
// Scripts are executed in order
//INFO THIS IS OVERALL THE BEST SOLUTION! USE FOR YOUR OWN SCRIPTS, AND WHEN ORDER MATTERS (e.g. including a libarary)

// NOTE Defer and Async does not suport old browser: in this case we have to use the regular script loading by adding our scripts directly at the end of the body
