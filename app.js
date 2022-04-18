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
let initialColors
// for local storage
let savedPalettes = [];

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

  // Implement save to palette and local storage
  
  const saveBtn = document.querySelector('.save');
  const submitSave = document.querySelector('.submit-save');
  const closeSave = document.querySelector('.close-save');
  const saveContainer = document.querySelector('.save-container');
  const saveInput = document.querySelector('.save-container input');
  const libraryContainer = document.querySelector(".library-container");
  const libraryBtn = document.querySelector(".library");
  const closeLibraryBtn = document.querySelector(".close-library");
  

  //Event Listeners
  saveBtn.addEventListener("click", openPalette);
  closeSave.addEventListener("click", closePalette);
  submitSave.addEventListener("click", savePalette);
  libraryBtn.addEventListener("click", openLibrary);
  closeLibraryBtn.addEventListener("click", closeLibrary);
  

  function openPalette(e) {
      const popup = saveContainer.children[0];
      saveContainer.classList.add('active');
      popup.classList.add('active');
  }

  function closePalette(e) {
    const popup = saveContainer.children[0];
    saveContainer.classList.remove('active');
    popup.classList.remove('remove');
  }
  
  function savePalette(e) {
      saveContainer.classList.remove('active');
      popup.classList.remove('active');
      const name = saveInput.value;
      const colors = [];
      currentHexes.forEach(hex => {
          colors.push(hex.innerText);
      });
// generate object 
        let paletteNr = savedPalettes.length;
        const paletteObj = {name, colors, nr : paletteNr};
        savedPalettes.push(paletteObj);
// save to local storage
      savetoLocal(paletteObj);
      saveInput.value = '';
// generate the palette for the library
      const palette = document.createElement('div');
      palette.classList.add('custom-palette');
      const title = document.createElement('h4');
      title.innerText = paletteObj.name;
      const preview = document.createElement('div');
      preview.classList.add('small-preview');
      paletteObj.colors.forEach(smallColor => {
          const smallDiv = document.createElement('div');
          smallDiv.style.backgroundColor = smallColor;
          preview.appendChild(smallDiv);
      });
    
      const paletteBtn = document.createElement('button');
      paletteBtn.classList.add('pick-palette-btn');
      paletteBtn.classList.add(paletteObj.nr);
      paletteBtn.innerText = 'Select';

// attach event to the button 

      paletteBtn.addEventListener('click', e => {
        closeLibrary();
        const paletteIndex = e.target.classList[1];
        initialColors = [];
        savedPalettes[paletteIndex].colors.forEach((color, index) => {
            initialColors.push(color);
            colorDivs[index].style.backgroundColor = color;
            const text = colorDivs[index].children[0];
            checkTextContrast(color, text);
            updateTextUI(index);
        });
            resetInputs()
      });

// Append to library
      palette.appendChild(title);
      palette.appendChild(preview);
      palette.appendChild(paletteBtn);
      libraryContainer.children[0].appendChild(palette);
  }

  function savetoLocal(paletteObj) {
      let localPalettes;
      if (localStorage.getItem('palettes') === null) {
         localPalettes = []; 
      } else {
          localPalettes = JSON.parse(localStorage.getItem("palettes"));
      }
      localPalettes.push(paletteObj);
      localStorage.setItem("palettes", JSON.stringify(localPalettes));
  }

  function openLibrary() {
      const popup = libraryContainer.children[0];
      libraryContainer.classList.add('active');
      popup.classList.add('active');     
  }

  function closeLibrary() {
    const popup = libraryContainer.children[0];
    libraryContainer.classList.remove('active');
    popup.classList.remove('active');     
}

function getLocal() {
    if (localStorage.getItem('palettes') === null) {
        localStorage = []
    } else {
        const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
        paletteObjects.forEach(paletteObj => {
            // generate the palette for the library
      const palette = document.createElement('div');
      palette.classList.add('custom-palette');
      const title = document.createElement('h4');
      title.innerText = paletteObj.name;
      const preview = document.createElement('div');
      preview.classList.add('small-preview');
      paletteObj.colors.forEach(smallColor => {
          const smallDiv = document.createElement('div');
          smallDiv.style.backgroundColor = smallColor;
          preview.appendChild(smallDiv);
      });
    
      const paletteBtn = document.createElement('button');
      paletteBtn.classList.add('pick-palette-btn');
      paletteBtn.classList.add(paletteObj.nr);
      paletteBtn.innerText = 'Select';

// attach event to the button 

      paletteBtn.addEventListener('click', e => {
        closeLibrary();
        const paletteIndex = e.target.classList[1];
        initialColors = [];
        savedPalettes[paletteIndex].colors.forEach((color, index) => {
            initialColors.push(color);
            colorDivs[index].style.backgroundColor = color;
            const text = colorDivs[index].children[0];
            checkTextContrast(color, text);
            updateTextUI(index);
        });
            resetInputs()
      });

// Append to library
      palette.appendChild(title);
      palette.appendChild(preview);
      palette.appendChild(paletteBtn);
      libraryContainer.children[0].appendChild(palette);
        });
    }
}

localStorage.clear()

getLocal();
randomColors();



