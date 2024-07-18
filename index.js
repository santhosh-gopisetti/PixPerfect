let layer, currentShaderIndex = 0, currentImageIndex = 0, images = [], customShaders = [];
const shaderNames = ["Brightness", "differenceOfGaussian", "Deform", "Glitch", "Grayscale", "MotionBlur", "Saturation", "Sepia", "Sharpen", "Sketch", "Vignette"];

let bool_fliph = false;
let bool_flipv = false;
const editedimage = document.getElementById("editedImage");
const chooseFile = document.getElementById("imageUpload");
const downloadBtn = document.getElementById("downloadBtn");
const fliph = document.getElementById("fliph");
const flipv = document.getElementById("flipv");

function getvalue() {
    const filter = document.getElementById("filterselect").value;
    currentShaderIndex = shaderNames.indexOf(filter);
    redraw();
}

chooseFile.addEventListener("change", function () {
    getImgData();
});

downloadBtn.addEventListener("click", downloadImage);
fliph.addEventListener("click", fliphorizontal);
flipv.addEventListener("click", flipvertical);

function fliphorizontal() {
    bool_fliph = !bool_fliph;
    redraw();
}

function flipvertical() {
    bool_flipv = !bool_flipv;
    redraw();
}

function getImgData() {
    const files = chooseFile.files[0];
    if (files) {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(files);
        fileReader.addEventListener("load", function () {
            imgpreview.style.display = "block";
            imgpreview.innerHTML = '<img src="' + this.result + '" />';
        });
    }
}

function preload() {
    customShaders.push(createShader(fip.defaultVert, fip.brightness));
    customShaders.push(createShader(fip.defaultVert, fip.differenceOfGaussian));
    customShaders.push(createShader(fip.defaultVert, fip.deform));
    customShaders.push(createShader(fip.defaultVert, fip.glitch));
    customShaders.push(createShader(fip.defaultVert, fip.grayscale));
    customShaders.push(createShader(fip.defaultVert, fip.motionBlur));
    customShaders.push(createShader(fip.defaultVert, fip.saturation));
    customShaders.push(createShader(fip.defaultVert, fip.sepia));
    customShaders.push(createShader(fip.defaultVert, fip.sharpen));
    customShaders.push(createShader(fip.defaultVert, fip.sketch));
    customShaders.push(createShader(fip.defaultVert, fip.vignette));
}

function setup() {
    let container = select('#canvasContainer');
    let canvas = createCanvas(600, 600, WEBGL);
    canvas.parent('canvasContainer');
    layer = createFramebuffer();
    noStroke();

    const imageUpload = document.getElementById('imageUpload');
    imageUpload.addEventListener('change', handleImageUpload);
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            loadImage(e.target.result, (img) => {
                images[currentImageIndex] = img;
                resizeCanvasToImage(img);
                console.log("Image loaded successfully");
                redraw();
            }, (err) => {
                console.error("Failed to load image", err);
            });
        }
        reader.readAsDataURL(file);
    }
}

function resizeCanvasToImage(img) {
    const containerWidth = select('#canvasContainer').width;
    const containerHeight = select('#canvasContainer').height;
    
    let newWidth = img.width;
    let newHeight = img.height;
    
    // Scale down if image is larger than the container
    if (newWidth > containerWidth || newHeight > containerHeight) {
        const ratio = Math.min(containerWidth / newWidth, containerHeight / newHeight);
        newWidth *= ratio;
        newHeight *= ratio;
    }
    
    resizeCanvas(newWidth, newHeight);
    console.log(`Canvas resized to ${newWidth}x${newHeight}`);
    
    // Recreate the framebuffer with the new size
    layer = createFramebuffer({ width: newWidth, height: newHeight });
}

function draw() {
    background(0);
    layer.begin();
    clear();
    lights();
    
    if (images[currentImageIndex]) {
        push();
        scale(1, -1); // Flip vertically
        translate(-width / 2, -height / 2);
        scale(bool_fliph ? -1 : 1, bool_flipv ? -1 : 1); // Apply horizontal and vertical flipping
        image(images[currentImageIndex], bool_fliph ? -width : 0, bool_flipv ? -height : 0, width, height);
        pop();
    } else {
        console.log("No image loaded");
    }
    layer.end();
    
    shader(customShaders[currentShaderIndex]);

    switch (currentShaderIndex) {
        case 0:
            customShaders[currentShaderIndex].setUniform('brightness', 2.1);
            break;
        case 1:
            customShaders[currentShaderIndex].setUniform('radius1', 1.0); 
            customShaders[currentShaderIndex].setUniform('radius2', 2.0);
            break;
        case 2:
            customShaders[currentShaderIndex].setUniform('deformationAmount', 0.1);
            break;
        case 3:
            customShaders[currentShaderIndex].setUniform('glitchIntensity', 0.8);
            break;
        case 6:
            customShaders[currentShaderIndex].setUniform('saturation', 5.5);
            break;
        case 8:
            customShaders[currentShaderIndex].setUniform('sharpness', 1.5);
            break;
        case 9:
            customShaders[currentShaderIndex].setUniform('threshold', 0.2);
            customShaders[currentShaderIndex].setUniform('stippleDensity', 0.99);
            break;
        case 10:
            customShaders[currentShaderIndex].setUniform('vignetteStrength', 0.3);
            customShaders[currentShaderIndex].setUniform('vignetteFalloff', 1.0);
            customShaders[currentShaderIndex].setUniform('vignetteSign', 1.0);
            customShaders[currentShaderIndex].setUniform('vignetteSize', 1.0);
            break;
        default:
            break;
    }

    customShaders[currentShaderIndex].setUniform("texture", layer.color);
    customShaders[currentShaderIndex].setUniform('resolution', [width, height]);
    customShaders[currentShaderIndex].setUniform('uTextureSize', [width, height]);

    rect(-width/2, -height/2, width, height);
    resetShader();
}

function downloadImage() {
    if (images[currentImageIndex]) {
        saveCanvas('edited_image', 'png');
    } else {
        console.log("No image to download");
    }
}