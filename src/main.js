import * as THREE from 'three';

/* ════════════════════════════════════════════
   HERO BACKGROUND CANVAS — floating particles
   & ambient 3D gift box
════════════════════════════════════════════ */
(function() {
  const canvas = document.getElementById('canvas-hero');
  if (!canvas) return;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 6);

  // Lighting
  const ambient = new THREE.AmbientLight(0xffeedd, 0.4);
  scene.add(ambient);

  const dir = new THREE.DirectionalLight(0xfff0cc, 1.2);
  dir.position.set(5, 8, 5);
  dir.castShadow = true;
  scene.add(dir);

  const goldPoint = new THREE.PointLight(0xc9a84c, 2.5, 12);
  goldPoint.position.set(2, 1, 3);
  scene.add(goldPoint);

  const rimLight = new THREE.PointLight(0x3366aa, 0.8, 15);
  rimLight.position.set(-4, -2, -3);
  scene.add(rimLight);

  // Gift box group
  const boxGroup = new THREE.Group();
  scene.add(boxGroup);

  // Box body
  const boxMat = new THREE.MeshStandardMaterial({
    color: 0x0d1a2e,
    roughness: 0.7,
    metalness: 0.1
  });
  const boxGeo = new THREE.BoxGeometry(1.6, 1.1, 1.6);
  const boxBody = new THREE.Mesh(boxGeo, boxMat);
  boxBody.position.y = -0.2;
  boxBody.castShadow = true;
  boxGroup.add(boxBody);

  // Box lid
  const lidMat = new THREE.MeshStandardMaterial({
    color: 0x0a1220,
    roughness: 0.6,
    metalness: 0.15
  });
  const lidGeo = new THREE.BoxGeometry(1.65, 0.3, 1.65);
  const lid = new THREE.Mesh(lidGeo, lidMat);
  lid.position.y = 0.4;
  lid.castShadow = true;
  boxGroup.add(lid);

  // Gold ribbon on lid
  const ribbonMat = new THREE.MeshStandardMaterial({
    color: 0xc9a84c,
    roughness: 0.2,
    metalness: 0.8
  });

  const r1 = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.06, 0.12), ribbonMat);
  r1.position.y = 0.56;
  boxGroup.add(r1);

  const r2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 1.68), ribbonMat);
  r2.position.y = 0.56;
  boxGroup.add(r2);

  // Gold logo emboss (torus as stand-in)
  const emboss = new THREE.Mesh(
    new THREE.TorusGeometry(0.18, 0.025, 8, 32),
    new THREE.MeshStandardMaterial({ color: 0xe8c97a, roughness: 0.1, metalness: 1.0 })
  );
  emboss.rotation.x = Math.PI / 2;
  emboss.position.set(0, 0.58, 0);
  boxGroup.add(emboss);

  boxGroup.position.set(0, 0, 0);
  boxGroup.rotation.y = Math.PI / 6;

  // Floating particles
  const particles = [];
  const particleGeo = new THREE.SphereGeometry(0.025, 6, 6);
  const particleMat = new THREE.MeshBasicMaterial({ color: 0xc9a84c, transparent: true, opacity: 0.5 });

  for (let i = 0; i < 60; i++) {
    const p = new THREE.Mesh(particleGeo, particleMat.clone());
    p.position.set(
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 6 - 2
    );
    p.material.opacity = Math.random() * 0.4 + 0.05;
    p.userData = {
      vx: (Math.random() - 0.5) * 0.003,
      vy: (Math.random() - 0.5) * 0.003
    };
    scene.add(p);
    particles.push(p);
  }

  // Mouse parallax
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.008;

    // Box float
    boxGroup.position.y = Math.sin(t * 0.8) * 0.08;
    boxGroup.rotation.y = Math.PI / 6 + mouseX * 0.25;
    boxGroup.rotation.x = mouseY * 0.12;

    // Gold light orbit
    goldPoint.position.x = Math.cos(t * 0.5) * 3;
    goldPoint.position.z = Math.sin(t * 0.5) * 3 + 2;

    // Particles drift
    particles.forEach(p => {
      p.position.x += p.userData.vx;
      p.position.y += p.userData.vy;
      if (Math.abs(p.position.x) > 6) p.userData.vx *= -1;
      if (Math.abs(p.position.y) > 4) p.userData.vy *= -1;
    });

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

/* ════════════════════════════════════════════
   UNBOX CANVAS — animated compartment view
════════════════════════════════════════════ */
(function() {
  const canvas = document.getElementById('canvas-unbox');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;

  function resize() {
    const w = canvas.parentElement.clientWidth;
    const h = canvas.parentElement.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
  camera.position.set(0, 4.5, 4);
  camera.lookAt(0, 0, 0);

  const ambient = new THREE.AmbientLight(0xfff5e0, 0.6);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xfff8e0, 1.5);
  sun.position.set(3, 6, 4);
  sun.castShadow = true;
  scene.add(sun);

  const gold2 = new THREE.PointLight(0xc9a84c, 1.5, 10);
  gold2.position.set(0, 3, 2);
  scene.add(gold2);

  // Open box base
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x0c1829, roughness: 0.8 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.15, 3.2), baseMat);
  base.receiveShadow = true;
  scene.add(base);

  // Inner velvet lining
  const liningMat = new THREE.MeshStandardMaterial({ color: 0x1a0a00, roughness: 0.95 });
  const lining = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.1, 3.0), liningMat);
  lining.position.y = 0.1;
  scene.add(lining);

  // Dividers
  const divMat = new THREE.MeshStandardMaterial({ color: 0xc9a84c, roughness: 0.2, metalness: 0.7 });
  const divH = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.15, 0.06), divMat);
  divH.position.y = 0.12;
  scene.add(divH);
  const divV = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.15, 3.2), divMat);
  divV.position.y = 0.12;
  scene.add(divV);

  // Nut colors per compartment
  const nutColors = [0xd4922a, 0xf0e0c0, 0x4a8c3f, 0x4a1f0e];
  const positions = [[-0.78, 0, -0.78], [0.78, 0, -0.78], [-0.78, 0, 0.78], [0.78, 0, 0.78]];
  const nutMeshes = [];

  positions.forEach((pos, i) => {
    const mat = new THREE.MeshStandardMaterial({
      color: nutColors[i],
      roughness: 0.6 + (i === 1 ? 0.2 : 0),
      metalness: i === 3 ? 0.15 : 0.05
    });

    // cluster of small spheres per compartment
    const cluster = new THREE.Group();
    const count = 18;
    for (let k = 0; k < count; k++) {
      const r = 0.08 + Math.random() * 0.06;
      const geo = i === 2
        ? new THREE.SphereGeometry(r, 8, 8) // pistachios — oval
        : new THREE.SphereGeometry(r, 8, 8);
      const m = new THREE.Mesh(geo, mat);
      m.position.set(
        (Math.random() - 0.5) * 1.0,
        0.18 + Math.random() * 0.12,
        (Math.random() - 0.5) * 1.0
      );
      if (i === 0) m.scale.set(1, 0.7, 1); // almonds flatter
      if (i === 2) m.scale.set(0.8, 1.3, 0.8); // pistachios taller
      m.castShadow = true;
      cluster.add(m);
    }
    cluster.position.set(...pos);
    scene.add(cluster);
    nutMeshes.push(cluster);
  });

  // Active step highlight ring
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xc9a84c, transparent: true, opacity: 0.6 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.03, 8, 32), ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.35;
  scene.add(ring);

  resize();
  window.addEventListener('resize', resize);

  let activeStep = 0;
  const camTargets = [
    new THREE.Vector3(-0.78, 3.2, -0.78 + 2.5),
    new THREE.Vector3(0.78, 3.2, -0.78 + 2.5),
    new THREE.Vector3(-0.78, 3.2, 0.78 + 2.5),
    new THREE.Vector3(0.78, 3.2, 0.78 + 2.5),
  ];

  let camTarget = new THREE.Vector3(0, 4.5, 4);
  let ringTarget = new THREE.Vector3(-0.78, 0.35, -0.78);

  function setStep(i) {
    activeStep = i;
    camTarget.copy(camTargets[i]);
    ringTarget.set(positions[i][0], 0.35, positions[i][2]);

    document.querySelectorAll('.unbox-step').forEach((el, idx) => {
      el.classList.toggle('active', idx === i);
    });
  }

  // Auto-cycle every 2.5s
  let interval = setInterval(() => {
    setStep((activeStep + 1) % 4);
  }, 2500);

  document.querySelectorAll('.unbox-step').forEach((el, idx) => {
    el.addEventListener('click', () => {
      clearInterval(interval);
      setStep(idx);
      interval = setInterval(() => setStep((activeStep + 1) % 4), 2500);
    });
  });

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.01;

    camera.position.lerp(camTarget, 0.03);
    camera.lookAt(0, 0, 0);

    ring.position.lerp(ringTarget, 0.06);
    ring.position.y = 0.35 + Math.sin(t * 2) * 0.04;

    gold2.position.x = Math.cos(t * 0.6) * 2;
    gold2.position.z = Math.sin(t * 0.6) * 2 + 2;

    renderer.render(scene, camera);
  }
  animate();
})();

/* ════════════════════════════════════════════
   NAV SCROLL BEHAVIOUR
════════════════════════════════════════════ */
window.addEventListener('scroll', () => {
  document.getElementById('main-nav').classList.toggle('scrolled', window.scrollY > 60);
});

/* ════════════════════════════════════════════
   REVEAL ON SCROLL
════════════════════════════════════════════ */
const revealEls = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObs.observe(el));

/* ════════════════════════════════════════════
   SUBMIT HANDLER
════════════════════════════════════════════ */
const submitBtn = document.getElementById('submit-btn');
if (submitBtn) {
  submitBtn.addEventListener('click', function() {
    this.classList.add('sent');
    this.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <polyline points="2,9 7,14 16,4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>Enquiry Sent — We'll be in touch</span>`;
    this.disabled = true;
  });
}
