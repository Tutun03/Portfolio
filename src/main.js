import * as THREE from 'three';
import './style.css';
import './chatbot.js';


// ============================================================
// RESPONSIVE DEVICE STATE
// ============================================================

function getDeviceState() {

    const width = window.innerWidth;

    return {

        width,

        height: window.innerHeight,

        isSmallMobile: width <= 480,

        isMobile: width <= 768,

        isTablet: width > 768 && width <= 1100,

        isDesktop: width > 1100,

        isTouch: window.matchMedia(
            '(pointer: coarse)'
        ).matches

    };

}


let device = getDeviceState();


// ============================================================
// SCENE
// ============================================================

const scene = new THREE.Scene();


// ============================================================
// CAMERA
// ============================================================

const camera = new THREE.PerspectiveCamera(

    45,

    window.innerWidth /
    window.innerHeight,

    0.1,

    100

);


// ============================================================
// RESPONSIVE CAMERA
// ============================================================

function updateCamera() {

    device = getDeviceState();


    if (device.isSmallMobile) {

        camera.fov = 58;

        camera.position.z = 11;

    }

    else if (device.isMobile) {

        camera.fov = 54;

        camera.position.z = 10;

    }

    else if (device.isTablet) {

        camera.fov = 49;

        camera.position.z = 9.5;

    }

    else {

        camera.fov = 45;

        camera.position.z = 9;

    }


    camera.aspect =
        window.innerWidth /
        window.innerHeight;


    camera.updateProjectionMatrix();

}


updateCamera();


// ============================================================
// RENDERER
// ============================================================

const renderer =
    new THREE.WebGLRenderer({

        antialias: true,

        alpha: true

    });


renderer.setSize(

    window.innerWidth,

    window.innerHeight

);


function updatePixelRatio() {

    device = getDeviceState();


    let maxRatio = 2;


    if (device.isSmallMobile) {

        maxRatio = 1.25;

    }

    else if (device.isMobile) {

        maxRatio = 1.5;

    }

    else if (device.isTablet) {

        maxRatio = 1.75;

    }


    renderer.setPixelRatio(

        Math.min(

            window.devicePixelRatio,

            maxRatio

        )

    );

}


updatePixelRatio();


renderer.outputColorSpace =
    THREE.SRGBColorSpace;


renderer.domElement.style.position =
    'fixed';

renderer.domElement.style.inset =
    '0';

renderer.domElement.style.width =
    '100vw';

renderer.domElement.style.height =
    '100vh';

renderer.domElement.style.zIndex =
    '0';

renderer.domElement.style.pointerEvents =
    'none';


document.body.appendChild(
    renderer.domElement
);


// ============================================================
// MOUSE
// ============================================================

const mouseTarget =
    new THREE.Vector2(
        0.5,
        0.5
    );


const mouse =
    new THREE.Vector2(
        0.5,
        0.5
    );


const previousMouse =
    new THREE.Vector2(
        0.5,
        0.5
    );


const mouseVelocity =
    new THREE.Vector2(
        0,
        0
    );


// ============================================================
// TOUCH
// ============================================================

let touchActive = false;


// ============================================================
// MOUSE MOVE
// ============================================================

window.addEventListener(

    'mousemove',

    (event) => {

        if (device.isTouch) {

            return;

        }


        mouseTarget.x =
            event.clientX /
            window.innerWidth;


        mouseTarget.y =
            1 -
            event.clientY /
            window.innerHeight;

    }

);


// ============================================================
// TOUCH START
// ============================================================

window.addEventListener(

    'touchstart',

    (event) => {

        if (!event.touches.length) {

            return;

        }


        touchActive = true;


        const touch =
            event.touches[0];


        mouseTarget.x =
            touch.clientX /
            window.innerWidth;


        mouseTarget.y =
            1 -
            touch.clientY /
            window.innerHeight;

    },

    {
        passive: true
    }

);


// ============================================================
// TOUCH MOVE
// ============================================================

window.addEventListener(

    'touchmove',

    (event) => {

        if (!event.touches.length) {

            return;

        }


        const touch =
            event.touches[0];


        mouseTarget.x =
            touch.clientX /
            window.innerWidth;


        mouseTarget.y =
            1 -
            touch.clientY /
            window.innerHeight;

    },

    {
        passive: true
    }

);


// ============================================================
// TOUCH END
// ============================================================

window.addEventListener(

    'touchend',

    () => {

        touchActive = false;

    },

    {
        passive: true
    }

);


// ============================================================
// LIQUID BACKGROUND
// ============================================================

const liquidGeometry =
    new THREE.PlaneGeometry(
        30,
        20
    );


const liquidMaterial =
    new THREE.ShaderMaterial({

        depthWrite: false,

        depthTest: false,

        uniforms: {

            uTime: {

                value: 0

            },

            uMouse: {

                value:
                    new THREE.Vector2(
                        0.5,
                        0.5
                    )

            },

            uPreviousMouse: {

                value:
                    new THREE.Vector2(
                        0.5,
                        0.5
                    )

            },

            uVelocity: {

                value:
                    new THREE.Vector2(
                        0,
                        0
                    )

            },

            uResolution: {

                value:
                    new THREE.Vector2(

                        window.innerWidth,

                        window.innerHeight

                    )

            },

            uScroll: {

                value: 0

            }

        },


        // ====================================================
        // VERTEX SHADER
        // ====================================================

        vertexShader: `

            varying vec2 vUv;

            void main() {

                vUv = uv;

                gl_Position =
                    projectionMatrix *
                    modelViewMatrix *
                    vec4(
                        position,
                        1.0
                    );

            }

        `,


        // ====================================================
        // FRAGMENT SHADER
        // ====================================================

        fragmentShader: `

            uniform float uTime;

            uniform vec2 uMouse;

            uniform vec2 uPreviousMouse;

            uniform vec2 uVelocity;

            uniform vec2 uResolution;

            uniform float uScroll;

            varying vec2 vUv;


            float hash(vec2 p) {

                return fract(

                    sin(

                        dot(

                            p,

                            vec2(
                                127.1,
                                311.7
                            )

                        )

                    )

                    *

                    43758.5453123

                );

            }


            float noise(vec2 p) {

                vec2 i =
                    floor(p);

                vec2 f =
                    fract(p);


                f =
                    f *
                    f *
                    (
                        3.0 -
                        2.0 *
                        f
                    );


                float a =
                    hash(i);


                float b =
                    hash(
                        i +
                        vec2(
                            1.0,
                            0.0
                        )
                    );


                float c =
                    hash(
                        i +
                        vec2(
                            0.0,
                            1.0
                        )
                    );


                float d =
                    hash(
                        i +
                        vec2(
                            1.0,
                            1.0
                        )
                    );


                return mix(

                    mix(
                        a,
                        b,
                        f.x
                    ),

                    mix(
                        c,
                        d,
                        f.x
                    ),

                    f.y

                );

            }


            float fbm(vec2 p) {

                float value = 0.0;

                float amplitude = 0.5;


                for (
                    int i = 0;
                    i < 5;
                    i++
                ) {

                    value +=
                        amplitude *
                        noise(p);


                    p *= 2.0;

                    amplitude *= 0.5;

                }


                return value;

            }


            void main() {

                vec2 uv = vUv;


                float aspect =
                    uResolution.x /
                    uResolution.y;


                vec2 centered =
                    uv -
                    0.5;


                centered.x *= aspect;


                float time =
                    uTime;


                // --------------------------------------------
                // BASE FLOW
                // --------------------------------------------

                vec2 flow =
                    vec2(

                        time * 0.015,

                        time * 0.009

                    );


                vec2 p =
                    centered * 1.6;


                float n1 =
                    fbm(
                        p + flow
                    );


                // --------------------------------------------
                // DOMAIN WARP
                // --------------------------------------------

                vec2 warped = p;


                warped.x +=

                    sin(

                        p.y * 2.0 +

                        time * 0.12

                    ) * 0.25;


                warped.y +=

                    cos(

                        p.x * 1.8 -

                        time * 0.1

                    ) * 0.22;


                warped +=
                    n1 * 0.25;


                // --------------------------------------------
                // CURSOR
                // --------------------------------------------

                vec2 cursor =
                    uMouse -
                    0.5;


                cursor.x *= aspect;


                float distanceToCursor =
                    distance(
                        centered,
                        cursor
                    );


                float cursorInfluence =

                    exp(

                        -distanceToCursor *
                        3.2

                    );


                float cursorCore =

                    exp(

                        -distanceToCursor *
                        8.0

                    );


                vec2 direction =

                    normalize(

                        centered -
                        cursor +
                        0.0001

                    );


                warped +=

                    direction *

                    cursorInfluence *

                    0.34;


                // --------------------------------------------
                // VELOCITY
                // --------------------------------------------

                warped -=

                    uVelocity *

                    cursorInfluence *

                    1.8;


                // --------------------------------------------
                // RIPPLE
                // --------------------------------------------

                float ripple =

                    sin(

                        distanceToCursor *
                        24.0 -

                        time *
                        3.2

                    );


                ripple *=
                    cursorInfluence;


                warped.x +=
                    ripple * 0.15;


                warped.y +=
                    ripple * 0.11;


                float ripple2 =

                    sin(

                        distanceToCursor *
                        42.0 -

                        time *
                        4.5

                    );


                ripple2 *=
                    cursorCore *
                    0.055;


                warped +=
                    ripple2;


                // --------------------------------------------
                // FLUID
                // --------------------------------------------

                float fluid =
                    fbm(
                        warped + flow
                    );


                float fluid2 =
                    fbm(
                        warped * 1.7 - flow
                    );


                float fluid3 =
                    fbm(
                        warped * 2.5 + flow * 0.5
                    );


                float liquid =

                    smoothstep(

                        0.36,

                        0.72,

                        fluid

                    );


                float edge =

                    abs(

                        fluid -
                        fluid2

                    );


                edge =

                    smoothstep(

                        0.015,

                        0.13,

                        edge

                    );


                // --------------------------------------------
                // COLORS
                // --------------------------------------------

                vec3 background =

                    vec3(
                        0.006,
                        0.009,
                        0.018
                    );


                vec3 blue =

                    vec3(
                        0.025,
                        0.12,
                        0.75
                    );


                vec3 electricBlue =

                    vec3(
                        0.05,
                        0.35,
                        1.0
                    );


                vec3 violet =

                    vec3(
                        0.38,
                        0.06,
                        0.90
                    );


                vec3 cyan =

                    vec3(
                        0.01,
                        0.55,
                        0.95
                    );


                vec3 pink =

                    vec3(
                        0.85,
                        0.10,
                        0.55
                    );


                vec3 liquidColor =

                    mix(

                        blue,

                        violet,

                        fluid

                    );


                liquidColor =

                    mix(

                        liquidColor,

                        cyan,

                        fluid2 * 0.35

                    );


                liquidColor =

                    mix(

                        liquidColor,

                        electricBlue,

                        fluid3 * 0.25

                    );


                float iridescent =

                    smoothstep(

                        0.68,

                        0.95,

                        sin(

                            fluid * 14.0 +

                            time * 0.15

                        )

                    );


                liquidColor =

                    mix(

                        liquidColor,

                        pink,

                        iridescent * 0.10

                    );


                vec3 finalColor =

                    mix(

                        background,

                        liquidColor,

                        liquid * 0.48

                    );


                finalColor +=

                    edge *

                    vec3(
                        0.10,
                        0.25,
                        0.85
                    ) *

                    0.14;


                finalColor +=

                    cursorCore *

                    vec3(
                        0.08,
                        0.30,
                        1.0
                    ) *

                    0.25;


                finalColor +=

                    ripple *

                    cursorInfluence *

                    vec3(
                        0.05,
                        0.20,
                        0.80
                    ) *

                    0.12;


                float centerGlow =

                    1.0 -

                    smoothstep(

                        0.0,

                        1.4,

                        length(centered)

                    );


                finalColor +=

                    centerGlow *

                    vec3(
                        0.01,
                        0.03,
                        0.08
                    );


                float vignette =

                    smoothstep(

                        1.7,

                        0.35,

                        length(centered)

                    );


                finalColor *=

                    0.82 +

                    vignette * 0.18;


                gl_FragColor =

                    vec4(
                        finalColor,
                        1.0
                    );

            }

        `

    });


// ============================================================
// LIQUID MESH
// ============================================================

const liquidBackground =
    new THREE.Mesh(

        liquidGeometry,

        liquidMaterial

    );


liquidBackground.position.z =
    -5;


scene.add(
    liquidBackground
);


// ============================================================
// ENGINEERING CORE
// ============================================================

const heroRig =
    new THREE.Group();


scene.add(
    heroRig
);


const engineeringCore =
    new THREE.Group();


engineeringCore.position.set(
    2.7,
    0.25,
    0
);


heroRig.add(
    engineeringCore
);


// ============================================================
// CORE GEOMETRY
// ============================================================

const coreGeometry =
    new THREE.IcosahedronGeometry(
        1.45,
        2
    );


const coreMaterial =
    new THREE.MeshStandardMaterial({

        color:
            0x1d3f99,

        metalness:
            0.85,

        roughness:
            0.23,

        emissive:
            0x07152f,

        emissiveIntensity:
            0.75,

        transparent:
            true,

        opacity:
            1

    });


const core =
    new THREE.Mesh(

        coreGeometry,

        coreMaterial

    );


engineeringCore.add(
    core
);


// ============================================================
// CORE EDGES
// ============================================================

const edgeGeometry =
    new THREE.EdgesGeometry(
        coreGeometry
    );


const edgeMaterial =
    new THREE.LineBasicMaterial({

        color:
            0x7e96ff,

        transparent:
            true,

        opacity:
            0.85

    });


const edges =
    new THREE.LineSegments(

        edgeGeometry,

        edgeMaterial

    );


engineeringCore.add(
    edges
);


// ============================================================
// TEXT SPRITE
// ============================================================

function createTextSprite(
    text,
    options = {}
) {

    const {

        color = '#ffffff',

        glow = '#5577ff',

        font = 'bold 48px Arial',

        scale = 0.5

    } = options;


    const canvas =
        document.createElement(
            'canvas'
        );


    canvas.width = 512;

    canvas.height = 256;


    const context =
        canvas.getContext(
            '2d'
        );


    context.clearRect(
        0,
        0,
        512,
        256
    );


    context.font =
        font;


    context.textAlign =
        'center';


    context.textBaseline =
        'middle';


    context.shadowColor =
        glow;


    context.shadowBlur =
        20;


    context.fillStyle =
        color;


    context.fillText(
        text,
        256,
        128
    );


    const texture =
        new THREE.CanvasTexture(
            canvas
        );


    texture.colorSpace =
        THREE.SRGBColorSpace;


    const material =
        new THREE.SpriteMaterial({

            map:
                texture,

            transparent:
                true,

            depthWrite:
                false

        });


    const sprite =
        new THREE.Sprite(
            material
        );


    sprite.scale.set(

        scale * 2,

        scale,

        1

    );


    return sprite;

}


// ============================================================
// CODE SYMBOL
// ============================================================

const codeSymbol =
    createTextSprite(

        '</>',

        {

            color:
                '#dce4ff',

            glow:
                '#4168ff',

            font:
                'bold 95px Arial',

            scale:
                0.65

        }

    );


codeSymbol.position.set(
    0,
    0.28,
    1.14
);


engineeringCore.add(
    codeSymbol
);


// ============================================================
// JAVA LABEL
// ============================================================

const javaLabel =
    createTextSprite(

        'JAVA',

        {

            color:
                '#ffffff',

            glow:
                '#4168ff',

            font:
                'bold 48px Arial',

            scale:
                0.45

        }

    );


javaLabel.position.set(
    0,
    -0.55,
    1.14
);


engineeringCore.add(
    javaLabel
);


// ============================================================
// TECHNOLOGY LABELS
// ============================================================

const technologyData = [

    {

        text:
            'SPRING BOOT',

        position:
            [-2.05, 1.55, 0],

        scale:
            0.29

    },

    {

        text:
            'MICROSERVICES',

        position:
            [2.05, 1.55, 0],

        scale:
            0.26

    },

    {

        text:
            'AWS',

        position:
            [2.15, -1.30, 0],

        scale:
            0.34

    },

    {

        text:
            'AI / GENAI',

        position:
            [-2.15, -1.30, 0],

        scale:
            0.28

    },

    {

        text:
            'DATABASE',

        position:
            [0, 2.25, 0],

        scale:
            0.26

    }

];


const technologySprites = [];


technologyData.forEach(
    (item) => {

        const sprite =
            createTextSprite(

                item.text,

                {

                    color:
                        '#aebeff',

                    glow:
                        '#496cff',

                    font:
                        'bold 30px Arial',

                    scale:
                        item.scale

                }

            );


        sprite.position.set(
            ...item.position
        );


        engineeringCore.add(
            sprite
        );


        technologySprites.push(
            sprite
        );

    }
);


// ============================================================
// ORBITS
// ============================================================

function createOrbit(
    color,
    rotation
) {

    const geometry =
        new THREE.TorusGeometry(

            2.05,

            0.014,

            12,

            140

        );


    const material =
        new THREE.MeshBasicMaterial({

            color,

            transparent:
                true,

            opacity:
                0.42

        });


    const ring =
        new THREE.Mesh(

            geometry,

            material

        );


    ring.rotation.copy(
        rotation
    );


    engineeringCore.add(
        ring
    );


    return ring;

}


const orbitA =
    createOrbit(

        0x5d78ff,

        new THREE.Euler(

            Math.PI / 2.3,

            0,

            0.2

        )

    );


const orbitB =
    createOrbit(

        0x3658d2,

        new THREE.Euler(

            0,

            Math.PI / 3,

            -0.3

        )

    );


const orbitC =
    createOrbit(

        0x718cff,

        new THREE.Euler(

            Math.PI / 2,

            0.5,

            0

        )

    );


// ============================================================
// NODES
// ============================================================

function createNode() {

    const geometry =
        new THREE.SphereGeometry(

            0.065,

            16,

            16

        );


    const material =
        new THREE.MeshBasicMaterial({

            color:
                0x7690ff,

            transparent:
                true,

            opacity:
                1

        });


    return new THREE.Mesh(

        geometry,

        material

    );

}


const nodes = [];


const nodePositions = [

    [-1.8, 1.35, 0],

    [1.8, 1.35, 0],

    [2.2, -1.05, 0],

    [-2.2, -1.05, 0],

    [0, 2.0, 0],

    [0, -2.0, 0]

];


nodePositions.forEach(
    (position) => {

        const node =
            createNode();


        node.position.set(
            ...position
        );


        engineeringCore.add(
            node
        );


        nodes.push(
            node
        );

    }
);


// ============================================================
// CONNECTIONS
// ============================================================

function createConnection(
    start,
    end
) {

    const geometry =
        new THREE.BufferGeometry()
            .setFromPoints([

                start,

                end

            ]);


    const material =
        new THREE.LineBasicMaterial({

            color:
                0x4968d8,

            transparent:
                true,

            opacity:
                0.20

        });


    const line =
        new THREE.Line(

            geometry,

            material

        );


    engineeringCore.add(
        line
    );


    return line;

}


const connections = [];


const connectionPairs = [

    [0, 1],

    [1, 2],

    [2, 3],

    [3, 0],

    [0, 4],

    [1, 4],

    [2, 5],

    [3, 5],

    [4, 5]

];


connectionPairs.forEach(
    (pair) => {

        connections.push(

            createConnection(

                nodes[pair[0]].position,

                nodes[pair[1]].position

            )

        );

    }
);


// ============================================================
// LIGHTING
// ============================================================

const ambientLight =
    new THREE.AmbientLight(
        0xffffff,
        0.35
    );


scene.add(
    ambientLight
);


const keyLight =
    new THREE.DirectionalLight(
        0xffffff,
        2.0
    );


keyLight.position.set(
    4,
    6,
    5
);


scene.add(
    keyLight
);


const blueLight =
    new THREE.PointLight(
        0x496bff,
        18,
        15
    );


blueLight.position.set(
    2,
    2,
    3
);


scene.add(
    blueLight
);


// ============================================================
// PROJECT STATES
// ============================================================

const projectStates = {

    careconsole: {

        color:
            0x2855b8,

        emissive:
            0x071942,

        light:
            0x4477ff

    },


    employment: {

        color:
            0x168c70,

        emissive:
            0x042c25,

        light:
            0x22bb91

    },


    ipl: {

        color:
            0xc85d2d,

        emissive:
            0x40150a,

        light:
            0xff6633

    }

};


let targetColor =
    new THREE.Color(
        projectStates
            .careconsole
            .color
    );


let targetEmissive =
    new THREE.Color(
        projectStates
            .careconsole
            .emissive
    );


// ============================================================
// PROJECT CARD INTERACTION
// ============================================================

document
    .querySelectorAll(
        '.project-card'
    )
    .forEach(
        (card) => {

            card.addEventListener(
                'mouseenter',
                () => {

                    const state =
                        projectStates[
                            card.dataset.project
                        ];


                    if (!state) {

                        return;

                    }


                    targetColor =
                        new THREE.Color(
                            state.color
                        );


                    targetEmissive =
                        new THREE.Color(
                            state.emissive
                        );


                    blueLight.color.setHex(
                        state.light
                    );

                }
            );


            card.addEventListener(
                'touchstart',
                () => {

                    const state =
                        projectStates[
                            card.dataset.project
                        ];


                    if (!state) {

                        return;

                    }


                    targetColor =
                        new THREE.Color(
                            state.color
                        );


                    targetEmissive =
                        new THREE.Color(
                            state.emissive
                        );


                    blueLight.color.setHex(
                        state.light
                    );

                },
                {
                    passive: true
                }
            );

        }
    );


// ============================================================
// SCROLL
// ============================================================

let scrollY =
    window.scrollY;


window.addEventListener(

    'scroll',

    () => {

        scrollY =
            window.scrollY;

    },

    {
        passive: true
    }

);


// ============================================================
// CURSOR LABEL
// ============================================================

const cursorLabel =
    document.querySelector(
        '.cursor-label'
    );


window.addEventListener(

    'mousemove',

    (event) => {

        if (
            !cursorLabel ||
            device.isTouch
        ) {

            return;

        }


        cursorLabel.style.opacity =
            '1';


        cursorLabel.style.transform =

            `translate(
                ${event.clientX + 15}px,
                ${event.clientY + 15}px
            )`;

    }

);


// ============================================================
// SECTION INDICATOR
// ============================================================

const currentSection =
    document.querySelector(
        '.current-section'
    );


const sections =
    document.querySelectorAll(
        '.section'
    );


function updateSectionIndicator() {

    if (!currentSection) {

        return;

    }


    let activeIndex = 0;


    sections.forEach(

        (section, index) => {

            const rect =
                section.getBoundingClientRect();


            if (

                rect.top <=
                window.innerHeight * 0.5

            ) {

                activeIndex =
                    index;

            }

        }

    );


    currentSection.textContent =

        String(
            activeIndex + 1
        )
        .padStart(
            2,
            '0'
        );

}


window.addEventListener(

    'scroll',

    updateSectionIndicator,

    {
        passive: true
    }

);


updateSectionIndicator();


// ============================================================
// MOBILE NAVIGATION
// ============================================================

const mobileMenuToggle =
    document.getElementById(
        'mobile-menu-toggle'
    );


const mobileNav =
    document.getElementById(
        'mobile-nav'
    );


function closeMobileMenu() {

    if (
        !mobileMenuToggle ||
        !mobileNav
    ) {

        return;

    }


    mobileMenuToggle.classList.remove(
        'active'
    );


    mobileNav.classList.remove(
        'open'
    );


    mobileMenuToggle.setAttribute(
        'aria-expanded',
        'false'
    );


    mobileNav.setAttribute(
        'aria-hidden',
        'true'
    );


    document.body.classList.remove(
        'menu-open'
    );

}


function openMobileMenu() {

    if (
        !mobileMenuToggle ||
        !mobileNav
    ) {

        return;

    }


    mobileMenuToggle.classList.add(
        'active'
    );


    mobileNav.classList.add(
        'open'
    );


    mobileMenuToggle.setAttribute(
        'aria-expanded',
        'true'
    );


    mobileNav.setAttribute(
        'aria-hidden',
        'false'
    );


    document.body.classList.add(
        'menu-open'
    );

}


function toggleMobileMenu() {

    if (
        !mobileMenuToggle ||
        !mobileNav
    ) {

        return;

    }


    const isOpen =
        mobileNav.classList.contains(
            'open'
        );


    if (isOpen) {

        closeMobileMenu();

    }

    else {

        openMobileMenu();

    }

}


// ------------------------------------------------------------
// HAMBURGER CLICK
// ------------------------------------------------------------

mobileMenuToggle?.addEventListener(

    'click',

    toggleMobileMenu

);


// ------------------------------------------------------------
// CLOSE AFTER NAV LINK CLICK
// ------------------------------------------------------------

mobileNav
    ?.querySelectorAll('a')
    .forEach(

        (link) => {

            link.addEventListener(

                'click',

                () => {

                    closeMobileMenu();

                }

            );

        }

    );


// ------------------------------------------------------------
// ESCAPE TO CLOSE
// ------------------------------------------------------------

document.addEventListener(

    'keydown',

    (event) => {

        if (
            event.key === 'Escape'
        ) {

            closeMobileMenu();

        }

    }

);


// ------------------------------------------------------------
// CLOSE ON DESKTOP RESIZE
// ------------------------------------------------------------

window.addEventListener(

    'resize',

    () => {

        if (
            window.innerWidth > 768
        ) {

            closeMobileMenu();

        }

    }

);


// ============================================================
// CLOCK
// ============================================================

const clock =
    new THREE.Clock();


// ============================================================
// ANIMATION
// ============================================================

function animate() {

    requestAnimationFrame(
        animate
    );


    const time =
        clock.getElapsedTime();


    // ========================================================
    // MOUSE
    // ========================================================

    previousMouse.copy(
        mouse
    );


    const mouseLerpSpeed =
        device.isMobile
            ? 0.08
            : 0.12;


    mouse.lerp(

        mouseTarget,

        mouseLerpSpeed

    );


    mouseVelocity
        .copy(mouse)
        .sub(previousMouse);


    mouseVelocity.multiplyScalar(

        device.isMobile
            ? 1.2
            : 1.8

    );


    mouseVelocity.clampLength(

        0,

        device.isMobile
            ? 0.045
            : 0.08

    );


    // ========================================================
    // LIQUID
    // ========================================================

    liquidMaterial
        .uniforms
        .uTime
        .value =
        time;


    liquidMaterial
        .uniforms
        .uMouse
        .value
        .lerp(

            mouse,

            device.isMobile
                ? 0.10
                : 0.15

        );


    liquidMaterial
        .uniforms
        .uPreviousMouse
        .value
        .lerp(

            previousMouse,

            0.12

        );


    liquidMaterial
        .uniforms
        .uVelocity
        .value
        .lerp(

            mouseVelocity,

            0.15

        );


    // ========================================================
    // HERO SCROLL
    // ========================================================

    const heroHeight =
        window.innerHeight;


    const heroProgress =
        THREE.MathUtils.clamp(

            scrollY /
            heroHeight,

            0,
            1

        );


    liquidMaterial
        .uniforms
        .uScroll
        .value =
        heroProgress;


    // ========================================================
    // CORE COLOR
    // ========================================================

    coreMaterial.color.lerp(

        targetColor,

        0.035

    );


    coreMaterial.emissive.lerp(

        targetEmissive,

        0.035

    );


    // ========================================================
    // FLOATING MOTION
    // ========================================================

    const floating =

        Math.sin(
            time * 0.8
        ) *

        (
            device.isMobile
                ? 0.035
                : 0.055
        );


    // ========================================================
    // CORE POSITION
    // ========================================================

    let targetX;

    let targetY;


    if (
        device.isSmallMobile
    ) {

        targetX =
            0;

        targetY =

            -0.55 +

            floating +

            heroProgress *
            0.25;

    }

    else if (
        device.isMobile
    ) {

        targetX =
            0;

        targetY =

            -0.25 +

            floating +

            heroProgress *
            0.30;

    }

    else if (
        device.isTablet
    ) {

        targetX =

            1.8 +

            heroProgress *
            0.6;


        targetY =

            0.15 +

            floating +

            heroProgress *
            0.35;

    }

    else {

        targetX =

            2.7 +

            heroProgress *
            1.1;


        targetY =

            0.25 +

            floating +

            heroProgress *
            0.45;

    }


    // ========================================================
    // SMOOTH POSITION
    // ========================================================

    engineeringCore.position.x =

        THREE.MathUtils.lerp(

            engineeringCore.position.x,

            targetX,

            device.isMobile
                ? 0.045
                : 0.035

        );


    engineeringCore.position.y =

        THREE.MathUtils.lerp(

            engineeringCore.position.y,

            targetY,

            device.isMobile
                ? 0.045
                : 0.035

        );


    // ========================================================
    // RESPONSIVE SCALE
    // ========================================================

    let targetScale;


    if (
        device.isSmallMobile
    ) {

        targetScale =
            0.43;

    }

    else if (
        device.isMobile
    ) {

        targetScale =
            0.55;

    }

    else if (
        device.isTablet
    ) {

        targetScale =
            0.78;

    }

    else {

        targetScale =
            1;

    }


    const desiredScale =
        new THREE.Vector3(

            targetScale,

            targetScale,

            targetScale

        );


    engineeringCore.scale.lerp(

        desiredScale,

        0.04

    );


    // ========================================================
    // CORE ROTATION
    // ========================================================

    engineeringCore.rotation.y +=

        device.isMobile
            ? 0.00055
            : 0.001;


    engineeringCore.rotation.x =

        THREE.MathUtils.lerp(

            engineeringCore.rotation.x,

            (mouse.y - 0.5) *

            (
                device.isMobile
                    ? 0.035
                    : 0.07
            ),

            0.025

        );


    engineeringCore.rotation.z =

        THREE.MathUtils.lerp(

            engineeringCore.rotation.z,

            (mouse.x - 0.5) *

            (
                device.isMobile
                    ? 0.025
                    : 0.045
            ),

            0.025

        );


    // ========================================================
    // ORBITS
    // ========================================================

    orbitA.rotation.z +=

        device.isMobile
            ? 0.00035
            : 0.0007;


    orbitB.rotation.x +=

        device.isMobile
            ? 0.00025
            : 0.0005;


    orbitC.rotation.y +=

        device.isMobile
            ? 0.0003
            : 0.0006;


    // ========================================================
    // NODE PULSE
    // ========================================================

    nodes.forEach(

        (node, index) => {

            const pulse =

                1 +

                Math.sin(

                    time *
                    1.8 +

                    index *
                    0.8

                ) *

                (
                    device.isMobile
                        ? 0.08
                        : 0.13
                );


            node.scale.setScalar(
                pulse
            );

        }

    );


    // ========================================================
    // LIGHT FOLLOW MOUSE
    // ========================================================

    blueLight.position.x =

        THREE.MathUtils.lerp(

            blueLight.position.x,

            1 +
            mouse.x * 3,

            0.025

        );


    blueLight.position.y =

        THREE.MathUtils.lerp(

            blueLight.position.y,

            1 +
            mouse.y * 2,

            0.025

        );


    // ========================================================
    // CAMERA PARALLAX
    // ========================================================

    const cameraX =

        device.isMobile

            ? (mouse.x - 0.5) * 0.08

            : (mouse.x - 0.5) * 0.18;


    const cameraY =

        device.isMobile

            ? (mouse.y - 0.5) * 0.06

            : (mouse.y - 0.5) * 0.12;


    camera.position.x =

        THREE.MathUtils.lerp(

            camera.position.x,

            cameraX,

            0.02

        );


    camera.position.y =

        THREE.MathUtils.lerp(

            camera.position.y,

            cameraY,

            0.02

        );


    camera.lookAt(
        0,
        0,
        0
    );


    // ========================================================
    // HERO FADE
    // ========================================================

    const visibility =

        1 -

        THREE.MathUtils.smoothstep(

            heroProgress,

            0.12,

            0.9

        );


    // ========================================================
    // CORE VISIBILITY
    // ========================================================

    coreMaterial.opacity =
        visibility;


    edgeMaterial.opacity =
        visibility * 0.85;


    codeSymbol.material.opacity =
        visibility;


    javaLabel.material.opacity =
        visibility;


    technologySprites.forEach(

        (sprite) => {

            sprite.material.opacity =
                visibility;

        }

    );


    nodes.forEach(

        (node) => {

            node.material.opacity =
                visibility;

        }

    );


    connections.forEach(

        (line) => {

            line.material.opacity =
                visibility * 0.20;

        }

    );


    orbitA.material.opacity =
        visibility * 0.42;


    orbitB.material.opacity =
        visibility * 0.38;


    orbitC.material.opacity =
        visibility * 0.42;


    // ========================================================
    // RENDER
    // ========================================================

    renderer.render(

        scene,

        camera

    );

}


// ============================================================
// START ANIMATION
// ============================================================

animate();


// ============================================================
// RESIZE
// ============================================================

let resizeTimer;


window.addEventListener(

    'resize',

    () => {

        clearTimeout(
            resizeTimer
        );


        resizeTimer =

            setTimeout(

                () => {

                    device =
                        getDeviceState();


                    updateCamera();


                    updatePixelRatio();


                    renderer.setSize(

                        window.innerWidth,

                        window.innerHeight

                    );


                    liquidMaterial
                        .uniforms
                        .uResolution
                        .value
                        .set(

                            window.innerWidth,

                            window.innerHeight

                        );


                    // --------------------------------------------
                    // Responsive core scale
                    // --------------------------------------------

                    if (
                        device.isSmallMobile
                    ) {

                        engineeringCore.scale.setScalar(
                            0.43
                        );

                    }

                    else if (
                        device.isMobile
                    ) {

                        engineeringCore.scale.setScalar(
                            0.55
                        );

                    }

                    else if (
                        device.isTablet
                    ) {

                        engineeringCore.scale.setScalar(
                            0.78
                        );

                    }

                    else {

                        engineeringCore.scale.setScalar(
                            1
                        );

                    }

                },

                100

            );

    }

);


// ===========================================================
// INITIAL RESPONSIVE SETUP
// ============================================================

updateCamera();

updatePixelRatio();


// ============================================================
// TOUCH DEVICE CURSOR LABEL
// ============================================================

if (
    device.isTouch &&
    cursorLabel
) {

    cursorLabel.style.display =
        'none';

}


// ============================================================
// PAGE VISIBILITY
// ============================================================

document.addEventListener(

    'visibilitychange',

    () => {

        if (
            document.hidden
        ) {

            clock.stop();

        }

        else {

            clock.start();

        }

    }

);