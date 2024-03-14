var slideChaix = 1;
showSlides(slideChaix);

function plusSlides(n) {
    showSlides(slideChaix += n);
}

function currentSlide(n) {
    showSlides(slideChaix = n);
}

function showSlides(n) {
    var i;
    var slides = document.getElementsByClassName("mySlides");
    var dots = document.getElementsByClassName("dot");
    if (n > slides.length) { slideChaix = 1 }
    if (n < 1) { slideChaix = slides.length }
    for ( i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
        }
        slides[slideChaix - 1].style.display = "block";
        dots[slideChaix - 1].className += "active";
}

