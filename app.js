// Global selections and variables 

const colorDivs = document.querySelectorAll('.color');
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
const popup = document.querySelector('.copy-container');
const adjustButton = document.querySelectorAll('.adjust');
const lockButton = document.querySelectorAll('.lock');
const closeAdjustments = document.querySelectorAll('.close-adjustments');
const sliderContainers = document.querySelectorAll('.sliders');
let initialColors;

// Event listeners

generateBtn.addEventListener('click', randomColors);

sliders.forEach(slider => {
    slider.addEventListener("input", hslControls);
});

colorDivs.forEach((slider, index) => {
    slider.addEventListener("change", () => {
        updateTextUI(index);
    });
});

currentHexes.forEach(hex => {
    hex.addEventListener('click', () => {
        copyToClipboard(hex);
    })
});

popup.addEventListener('transitionend', () => {
    const popupBox = popup.children[0];
    popup.classList.remove('active');
    popupBox.classList.remove('active');
});

adjustButton.forEach((button, index) => {
    button.addEventListener('click', () => {
        openAdjustmentPanel(index);
    });
    
});


// Functions

// Color Generator
function generateHex() {
     const hexColor = chroma.random();
     return hexColor;
}



function randomColors() {

    initialColors = [];
    colorDivs.forEach((div, index) => {
        const hexText = div.children[0];
        const randomColor = generateHex();
// add it to the array
        if (div.classList.contains('locked')){
           initialColors.push(hexText.innerText);
           return; 
        }
        else {
            initialColors.push(chroma(randomColor).hex())

        };

        lockButton.forEach(lock => {
            lock.addEventListener('click', () => {
                let div = lock.parentElement.parentElement;
                let icon = lock.firstChild;
                div.classList.toggle("locked");
                icon.classList.toggle("fa-lock-open");
                icon.classList.toggle("fa-lock");
            });
        });

// Add the color to the background 

        div.style.backgroundColor = randomColor;
        hexText.innerText = randomColor;
// Check for contrast 
        checkTextContrast(randomColor, hexText);
// Initial colorize sliders
        const color = chroma(randomColor);
        const sliders = div.querySelectorAll(".sliders input");
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];

        colorizeSliders(color, hue, brightness, saturation);

    });
// reset inputs

resetInputs();
//Check for button contrast 
adjustButton.forEach((button, index) => {
    checkTextContrast(initialColors[index], button);
    checkTextContrast(initialColors[index], lockButton[index]);
});

}

function checkTextContrast(color, text) {
    const luminance = chroma(color).luminance();
    if(luminance > 0.5) {
        text.style.color = "black";
    }
    else {
        text.style.color = "white";
    }
    
}

function colorizeSliders(color, hue, brightness, saturation) {
// scale saturation
    const noSat = color.set('hsl.s', 0);
    const fullSat = color.set('hsl.s', 1);
    const scaleSat = chroma.scale([noSat, color, fullSat]);
// Scale brightness
    const midBright = color.set('hsl.l', 0.5);
    const scaleBright = chroma.scale(['black', midBright, 'white']);

// Update Input Colors
    saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(0)}, ${scaleSat(1)})`;

    brightness.style.backgroundImage = `linear-gradient(to right,${scaleBright(0)}, ${scaleBright(0.5)} ,${scaleBright(1)})`;

    hue.style.backgroundImage = `linear-gradient(to right, #FF0000, #FFFF00, #00FF00, #00FFFF, #0000FF, #FF00FF, #FF0000)`;

    saturation.value = color.hsl()[1];
    brightness.value = color.hsl()[2];
    hue.value = color.hsl()[0];
    
}

function hslControls(e) {
    const index = 
    e.target.getAttribute("data-bright") || 
    e.target.getAttribute("data-sat") || 
    e.target.getAttribute("data-hue") ;

    let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');

    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    const bgColor = initialColors[index];

    let color = chroma(bgColor)
    .set('hsl.s', saturation.value)
    .set('hsl.l', brightness.value)
    .set('hsl.h', hue.value);

    colorDivs[index].style.backgroundColor = color;

// colorize inputs

colorizeSliders(color, hue, brightness, saturation);

}
 

function updateTextUI(index) {
    const activeDiv = colorDivs[index];
    const color = chroma(activeDiv.style.backgroundColor);
    const textHex = activeDiv.querySelector('h2');
    const icons = activeDiv.querySelectorAll('.controls button');
    textHex.innerText = color.hex();
    //Check contrast
    checkTextContrast(color, textHex);
    for (icon of icons) {
        checkTextContrast(color, icon)
    };
};

function resetInputs(){
    const sliders = document.querySelectorAll('.sliders input');
};

function copyToClipboard(hex) {
    navigator.clipboard.writeText(hex.innerText);
    const popupBox = popup.children[0];
    popup.classList.toggle('active');
    popupBox.classList.add('active');
};


function openAdjustmentPanel(index) {
    sliderContainers[index].classList.toggle("active");
    sliderContainers[index].children[0].addEventListener("click", (e) => {
      sliderContainers[index].classList.remove("active");
    });
  }

randomColors()



