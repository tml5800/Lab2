// WebGL Graph with Multiple Backgrounds and Points
class WebGLGraph {
    constructor() {
        this.canvas = document.getElementById('webglCanvas');
        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        
        if (!this.gl) {
            alert('WebGL not supported');
            return;
        }
        
        this.init();
    }
    
    init() {
        this.setupShaders();
        this.setupBuffers();
        this.setupBackgrounds();
        this.setupPoints();
        this.render();
    }
    
    setupShaders() {
        // Vertex shader source
        const vertexShaderSource = `
            attribute vec2 a_position;
            attribute vec4 a_color;
            uniform vec2 u_resolution;
            varying vec4 v_color;
            
            void main() {
                vec2 zeroToOne = a_position / u_resolution;
                vec2 zeroToTwo = zeroToOne * 2.0;
                vec2 clipSpace = zeroToTwo - 1.0;
                gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
                v_color = a_color;
            }
        `;
        
        // Fragment shader source
        const fragmentShaderSource = `
            precision mediump float;
            varying vec4 v_color;
            
            void main() {
                gl_FragColor = v_color;
            }
        `;
        
        // Create shaders
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
        
        // Create program
        this.program = this.createProgram(vertexShader, fragmentShader);
        
        // Get attribute and uniform locations
        this.positionAttributeLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.colorAttributeLocation = this.gl.getAttribLocation(this.program, 'a_color');
        this.resolutionUniformLocation = this.gl.getUniformLocation(this.program, 'u_resolution');
    }
    
    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }
    
    createProgram(vertexShader, fragmentShader) {
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Program linking error:', this.gl.getProgramInfoLog(program));
            this.gl.deleteProgram(program);
            return null;
        }
        
        return program;
    }
    
    setupBuffers() {
        // Create position buffer
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        
        // Create color buffer
        this.colorBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
    }
    
    setupBackgrounds() {
        // Define multiple background rectangles with simple RGB colors
        this.backgrounds = [
            // Background 1 - Red
            {   // background [top left, top right, bottom left, bottom right]  x,y coordinates
                positions: [0, 0, 800, 0, 0, 200, 800, 200],
                //color 1,1,0,1 dark yellow
                colors: [1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1]
            },
            // Background 2 - light blue
            {
                positions: [0, 200, 800, 200, 0, 400, 800, 400],
                colors: [0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1]
            },
            // Background 3 - Blue
            {
                positions: [0, 400, 800, 400, 0, 600, 800, 600],
                colors: [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1]
            }
        ];
    }
    
    setupPoints() {
        // Define 5 points with different positions, sizes, and colors
        this.points = [
            { x: 150, y: 100, size: 20, color: [1.0, 1.0, 1.0, 1.0] }, // white
            { x: 300, y: 150, size: 15, color: [0.0, 1.0, 0.0, 1.0] }, // Green
            { x: 450, y: 120, size: 25, color: [0.0, 0.0, 1.0, 1.0] }, // Blue
            { x: 200, y: 300, size: 18, color: [1.0, 1.0, 0.0, 1.0] }, // Yellow
            { x: 500, y: 350, size: 22, color: [1.0, 0.0, 1.0, 1.0] }  // Magenta
        ];
    }
    
    drawBackground(background) {
        // Set up position buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(background.positions), this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(this.positionAttributeLocation);
        this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
        
        // Set up color buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(background.colors), this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(this.colorAttributeLocation);
        this.gl.vertexAttribPointer(this.colorAttributeLocation, 4, this.gl.FLOAT, false, 0, 0);
        
        // Draw the background
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }
    
    drawPoint(point) {
        const halfSize = point.size / 2;
        const positions = [
            point.x - halfSize, point.y - halfSize,
            point.x + halfSize, point.y - halfSize,
            point.x - halfSize, point.y + halfSize,
            point.x + halfSize, point.y + halfSize
        ];
        
        const colors = [
            ...point.color, ...point.color, ...point.color, ...point.color
        ];
        
        // Set up position buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(this.positionAttributeLocation);
        this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
        
        // Set up color buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(this.colorAttributeLocation);
        this.gl.vertexAttribPointer(this.colorAttributeLocation, 4, this.gl.FLOAT, false, 0, 0);
        
        // Draw the point
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }
    
    render() {
        // Set viewport
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        
        // Clear the canvas
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        
        // Use our shader program
        this.gl.useProgram(this.program);
        
        // Set resolution uniform
        this.gl.uniform2f(this.resolutionUniformLocation, this.canvas.width, this.canvas.height);
        
        // Draw backgrounds
        this.backgrounds.forEach(background => {
            this.drawBackground(background);
        });
        
        // Draw points
        this.points.forEach(point => {
            this.drawPoint(point);
        });
    }
    
}

// Initialize the WebGL graph when the page loads
window.addEventListener('load', () => {
    const graph = new WebGLGraph();
});
