"use strict";
var _a;
const { Engine, Scene, ArcRotateCamera, Vector3, MeshBuilder, PBRMaterial, PointLight, SolidParticleSystem, SolidParticle, DefaultRenderingPipeline, ReflectionProbe } = BABYLON;
const canvas = document.querySelector('canvas');
const engine = new Engine(canvas);
const scene = new Scene(engine);
const camera = new ArcRotateCamera('', -Math.PI / 2, Math.PI / 2, 1e2, new Vector3(), scene);
camera.attachControl(canvas);
scene.clearColor.set(0, 0, 0, 1);
const light = new PointLight('', new Vector3(), scene);
light.intensity = 2e5;
const pp = new DefaultRenderingPipeline('');
pp.bloomEnabled = true;
pp.depthOfFieldEnabled = true;
pp.depthOfField.focusDistance = 4e3;
const mat = new PBRMaterial('', scene);
mat.roughness = 0.5;
mat.metallic = 0.2;
const urnd = (a = 0, b = 1) => a + Math.random() * (b - a);
const rnd = (a = 0, b = 1) => urnd(a, b) * (Math.random() - 0.5) * 2;
const box = MeshBuilder.CreatePolyhedron('', { type: 4, size: 6 });
const sps = new SolidParticleSystem('', scene);
const w = new WeakMap();
sps.addShape(box, 1e3);
sps.initParticles = () => {
    var _a;
    let a = 0, v = new Vector3(), S = 40;
    for (const p of sps.particles) {
        a = rnd(0, Math.PI * 2);
        v.x = Math.sin(a * 3) * S;
        v.y = Math.sin(a * 2) * S;
        v.z = Math.cos(a * 5) * S;
        p.position.set(v.x, v.y, v.z);
        p.rotation.set(Math.random() * Math.PI, 0, 0);
        p.scaling.setAll(v.lengthSquared() / ((S ** 2) * 3 * 0.5));
        (_a = p.color) === null || _a === void 0 ? void 0 : _a.set(urnd(0, 0.2), urnd(0.2, 0.4), urnd(0.5, 1), 1);
        w.set(p, urnd(0.01, 0.02));
    }
};
sps.updateParticle = (p) => (p.rotation.y += w.get(p), p);
sps.initParticles();
sps.buildMesh();
box.dispose();
sps.mesh.material = mat;
const pearl = MeshBuilder.CreateSphere('', { diameter: 50 });
const refl = new ReflectionProbe('', 128, scene, false);
(_a = refl.renderList) === null || _a === void 0 ? void 0 : _a.push(sps.mesh);
const mat2 = new PBRMaterial('', scene);
mat2.roughness = 1;
mat2.metallic = 0;
mat2.reflectionTexture = refl.cubeTexture;
mat2.clearCoat.isEnabled = true;
mat2.clearCoat.intensity = 1;
mat2.clearCoat.isTintEnabled = true;
mat2.emissiveColor.set(0.5, 0.5, 0.5);
pearl.material = mat2;
scene.onBeforeRenderObservable.add(() => {
    sps.setParticles();
    sps.mesh.rotation.y += 5e-3;
});
window.onresize = () => engine.resize();
engine.runRenderLoop(() => scene.render());