let layer, layer1, layer2;
let currentShaderIndex = 0;
let images = [];
let customShaders = [];
let imageCount = 2;
let bmode = 0;

const downloadBtn = document.getElementById("downloadBtn");

function getvalue(){
    const blendvalue=document.getElementById("blendselect").value;
    bmode=blendvalue;
}

downloadBtn.addEventListener("click", downloadImage);

function preload() {
    // Load the shaders during preload
    customShaders.push(createShader(fip.defaultVert, fip.blend));
}

function setup() {
    let canvasContainer = document.getElementById('canvas-container');
    let containerWidth = canvasContainer.offsetWidth;
    let containerHeight = containerWidth * (600 / 600); // Maintain aspect ratio
    let canvas = createCanvas(containerWidth, containerHeight, WEBGL);
    canvas.parent('canvas-container');
    windowResized(); // Call once to set initial size
    layer = createFramebuffer();
    layer1 = createFramebuffer();
    layer2 = createFramebuffer();
    noStroke();
    
    // Add event listener for file input
    const imageUpload1 = document.getElementById('imageUpload1');
    imageUpload1.addEventListener('change', (event) => handleImageUpload(event, 0));
    
    const imageUpload2 = document.getElementById('imageUpload2');
    imageUpload2.addEventListener('change', (event) => handleImageUpload(event, 1));
}

function handleImageUpload(event, index) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            images[index] = loadImage(e.target.result, () => {
                console.log("Image loaded successfully");
                // Redraw the canvas after the image is loaded
                redraw();
            }, (err) => {
                console.error("Failed to load image", err);
            });
        };
        reader.readAsDataURL(file);
    }
}

function draw() {
    if (images.length < imageCount) {
        return; // Wait until both images are loaded
    }
    
    background(0);
    
    // Draw images to framebuffers
    layer1.begin();
    clear();
    lights();
    scale(1, -1);
    image(images[0], -width / 2, -height / 2, width, height);
    layer1.end();
    
    layer2.begin();
    clear();
    lights();
    scale(1, -1);
    image(images[1], -width / 2, -height / 2, width, height);
    layer2.end();
    
    // Apply the shader
    shader(customShaders[currentShaderIndex]);
    
    customShaders[currentShaderIndex].setUniform('texture1', layer1.color); // Blend
    customShaders[currentShaderIndex].setUniform('texture2', layer2.color);
    customShaders[currentShaderIndex].setUniform('mixFactor', 0.5);
    customShaders[currentShaderIndex].setUniform('blendingMode', bmode);
    
    // Uniforms that most shaders need
    customShaders[currentShaderIndex].setUniform("texture", layer.color);
    customShaders[currentShaderIndex].setUniform('resolution', [width, height]);
    customShaders[currentShaderIndex].setUniform('uTextureSize', [width, height]);
    
    rect(0, 0, width, height);
    resetShader();
}

function windowResized() {
    let canvasContainer = document.getElementById('canvas-container');
    let containerWidth = canvasContainer.offsetWidth;
    let containerHeight = containerWidth * (600 / 600); // Maintain aspect ratio
    resizeCanvas(containerWidth, containerHeight);
}

function downloadImage() {
    saveCanvas('edited_image', 'png');
}
