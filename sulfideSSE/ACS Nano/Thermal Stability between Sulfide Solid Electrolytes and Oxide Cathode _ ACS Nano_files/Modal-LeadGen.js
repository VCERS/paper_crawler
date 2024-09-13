document.addEventListener("DOMContentLoaded", function () {
    const modalContainer = document.querySelector(".my-main-container");


    // Function to show the modal
    function showModal() {
        modalContainer.style.display = 'flex';
        document.querySelector('.overlay').style.display = 'block';
    }

    // Function to hide the modal when the close button is clicked
    function hideModal() {
        modalContainer.style.display = 'none';
        document.querySelector('.overlay').style.display = 'none';
    }

    // Hide the modal initially
    hideModal();


    // Function to handle clicks outside the modal
    function handleClickOutside(event) {
        // const modalContainer = document.querySelector(".my-main-container");
        // Check if the click target is not a child of the modal container
        if (!modalContainer.contains(event.target)) {
            hideModal();
        }
    }

    // Add a click event listener to the close button
    document.querySelector(".close-button").addEventListener("click", hideModal);

    // Add a click event listener to the document to handle clicks outside the modal
    document.addEventListener("click", handleClickOutside);


    const screenHeight = window.innerHeight;
    function updateModalPosition() {
        const scrollY = window.scrollY;
        // console.log("scrollY= " + scrollY);
        // modalContainer.style.top = `${50 + scrollY}px`;
        modalContainer.style.top = `${scrollY + (screenHeight / 2)}px`;
        // console.log("new top= " + modalContainer.style.top);
    }

    // Update the modal position when the user scrolls
    window.addEventListener('scroll', updateModalPosition);

    // Initialize the modal position
    updateModalPosition();

    //---Cookie---
    // Function to set the cookie with a given name, value, and expiration time in days
    function setCookie(name, value, days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
            console.log(expires + "this is expires dateUTC");
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
        // console.log("document.cookie is: " + document.cookie);
    }

    if (!document.cookie.includes('modalAd')) {
        console.log("cookie does not exist")

        // Show Modal
        showModal();

        // Set the cookie with the name "modalAd", value "true", and expiration of 3 day
        setCookie('modalAd', 'true', 3);
    } else {
        console.log("cookie exists");
        console.log("The cookie is: " + "\n" + document.cookie);
        console.log("Hiding modal");
        hideModal();
    }
});