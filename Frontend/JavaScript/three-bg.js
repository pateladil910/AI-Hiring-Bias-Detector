// 3D Organic Particle Wave background using Three.js
document.addEventListener("DOMContentLoaded", () => {
    // Check if THREE is loaded
    if (typeof THREE === 'undefined') {
        console.warn('Three.js is not loaded. 3D background will be disabled.');
        return;
    }

    // Create background canvas container
    const canvas = document.createElement('canvas');
    canvas.id = 'three-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.display = 'block';
    
    // Add canvas as the first child of body to stay in background
    document.body.insertBefore(canvas, document.body.firstChild);

    // Scene & Camera setup
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Position the camera to look down slightly at the wave surface
    camera.position.z = 9;
    camera.position.y = 3.5;
    camera.position.x = 0;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Wave configurations
    const amountX = 60;
    const amountY = 60;
    const separation = 0.38;
    const numParticles = amountX * amountY;

    const positions = new Float32Array(numParticles * 3);
    const scales = new Float32Array(numParticles);
    const colors = new Float32Array(numParticles * 3);

    // Soft modern pastel palette: Lavender/Periwinkle, soft Rose/Pink, clean Mint/Teal, soft Peach/Coral
    const palette = [
        new THREE.Color('#93c5fd'), // soft blue
        new THREE.Color('#c084fc'), // soft purple
        new THREE.Color('#f472b6'), // soft pink
        new THREE.Color('#a7f3d0'), // soft mint
        new THREE.Color('#fed7aa')  // soft peach
    ];

    let i = 0, c = 0;
    for (let ix = 0; ix < amountX; ix++) {
        for (let iy = 0; iy < amountY; iy++) {
            // Coordinate mapping (centering the wave grid in the 3D world)
            positions[i] = ix * separation - (amountX * separation) / 2; // X
            positions[i + 1] = 0; // Y (height, dynamically animated)
            positions[i + 2] = iy * separation - (amountY * separation) / 2; // Z

            // Smoothly distribute pastel colors based on positions for a soft gradient flow
            const xRatio = ix / amountX;
            const yRatio = iy / amountY;
            
            // Blend colors based on grid location
            let finalColor;
            if (xRatio < 0.5 && yRatio < 0.5) {
                finalColor = palette[0].clone().lerp(palette[1], xRatio * 2);
            } else if (xRatio >= 0.5 && yRatio < 0.5) {
                finalColor = palette[1].clone().lerp(palette[2], (xRatio - 0.5) * 2);
            } else if (xRatio < 0.5 && yRatio >= 0.5) {
                finalColor = palette[0].clone().lerp(palette[3], yRatio * 2);
            } else {
                finalColor = palette[2].clone().lerp(palette[4], (yRatio - 0.5) * 2);
            }

            colors[c] = finalColor.r;
            colors[c + 1] = finalColor.g;
            colors[c + 2] = finalColor.b;

            scales[ix * amountY + iy] = 1.0;

            i += 3;
            c += 3;
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom Shader for soft, glowing, anti-aliased circular particles
    const material = new THREE.ShaderMaterial({
        vertexShader: `
            attribute float scale;
            attribute vec3 color;
            varying vec3 vColor;
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                // Adjust size based on scale attribute and distance to achieve depth
                gl_PointSize = scale * (22.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            void main() {
                // Calculate distance from center of the point sprite
                float dist = length(gl_PointCoord - vec2(0.5, 0.5));
                
                // Discard pixels outside the circle radius
                if (dist > 0.5) discard;
                
                // Create a soft glowing falloff edge
                float alpha = smoothstep(0.5, 0.08, dist) * 0.65;
                
                gl_FragColor = vec4(vColor, alpha);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Mouse interactive target and current interpolation variables
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    window.addEventListener('mousemove', (event) => {
        // Map viewport coords to [-1, 1] range
        targetMouseX = (event.clientX / window.innerWidth) * 2 - 1;
        targetMouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('touchmove', (event) => {
        if (event.touches.length > 0) {
            targetMouseX = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
            targetMouseY = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
        }
    });

    // Wave animation variable
    let count = 0;

    function animate() {
        requestAnimationFrame(animate);

        count += 0.008; // speed of the wave ripples

        // Lerp mouse coordinates for organic deceleration feel
        mouseX += (targetMouseX - mouseX) * 0.035;
        mouseY += (targetMouseY - mouseY) * 0.035;

        const positionsArray = particles.geometry.attributes.position.array;
        const scalesArray = particles.geometry.attributes.scale.array;

        let index = 0;
        for (let ix = 0; ix < amountX; ix++) {
            for (let iy = 0; iy < amountY; iy++) {
                const xVal = positionsArray[index];
                const zVal = positionsArray[index + 2];

                // Combination of sine waves to form a smooth, multi-directional flow
                let yHeight = (Math.sin((ix + count * 10) * 0.18) * 0.35) + 
                              (Math.sin((iy + count * 8) * 0.22) * 0.35);

                // Mouse interaction: push/elevate wave slightly if mouse coordinates are close in 2D space
                const distToMouse = Math.sqrt(Math.pow(xVal - mouseX * 5.0, 2) + Math.pow(zVal - mouseY * 4.0, 2));
                const maxRange = 3.5;
                if (distToMouse < maxRange) {
                    const intensity = (1.0 - distToMouse / maxRange);
                    // Add interactive swelling ripple
                    yHeight += Math.sin(count * 15 + distToMouse * 2) * intensity * 0.45;
                }

                positionsArray[index + 1] = yHeight; // Update Y position

                // Set particle scale based on current wave height to add volumetric texture
                scalesArray[ix * amountY + iy] = (Math.sin((ix + count * 5) * 0.2) + 1.2) * 1.5 + 
                                                 (Math.sin((iy + count * 6) * 0.2) + 1.2) * 1.5;

                index += 3;
            }
        }

        // Notify Three.js that buffer properties have changed
        particles.geometry.attributes.position.needsUpdate = true;
        particles.geometry.attributes.scale.needsUpdate = true;

        // Camera movements (slight parallax tilt based on mouse)
        camera.position.x = mouseX * 2.0;
        camera.position.y = 3.5 + (mouseY * 1.2);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        renderer.render(scene, camera);
    }

    // Responsive window scaling
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
});
