// Self-check: each kind's prompt carries its own details and none of the other kinds' text.
// Run: node checks/check-prompts.js
var assert = require("assert");
require("../stitch.js");
var catalogs = require("../catalogs.json");
var S = globalThis.PromptStitch;

function state(extra) {
  var base = {
    catalogs: catalogs, medium: "image", kind: "prop", format: "lookbook", size: "4-5",
    crop: "product-close-up", productView: "front-label", cameraAngle: "eye-level",
    camera: "sony-a7r-v", lens: "90-105mm-macro-f-2-8", dof: "deep", aperture: "f-8-11-e-commerce-standard",
    lighting: "softbox-key-from-camera-left", colorTemp: "5600k", colorGrade: "none", studioBackground: "white",
    style: "photoreal", headcount: "0", entityType: "object", name: "Solstice SPF 50",
    productType: "pump-bottle", productFinish: "frosted-amber-glass", surfaceRiser: "wet-travertine-riser",
    supportProp: "raw-coral", stylingEffect: "glycerin-droplets-beading", composition: "single-hero-centered",
    shadowStyle: "hard-long-shadow", reflection: "none", propScale: "hero", condition: "new", heldBy: "nobody",
    envMotion: "water-ripples-expanding", frameRate: "120fps-ultra-slow-motion", cameraMove: "slow-orbital-arc",
    duration: "6", dialogue: "Buy now", stages: [],
  };
  return Object.assign(base, extra || {});
}

var img = S.stitch(state()).primary;
["Solstice SPF 50, a pump bottle", "frosted amber glass", "wet beige travertine", "raw coral",
 "droplets beading", "shot at f/8", "front view, label facing", "single hero product", "Product realism",
 "no people in this frame", "misspelled label"].forEach(function (t) { assert(img.includes(t), "image missing: " + t); });
["iris", "Skin:", "chin is level", "facial structure", "portrait", "plastic skin"].forEach(function (t) {
  assert(!img.includes(t), "image has human text: " + t);
});

var vid = S.stitch(state({ medium: "video", format: "commercial", camera: "sony-fx3-video" })).primary;
["Slow orbital arc", "water ripples gently expanding", "120fps", "shape, label, colour and finish locked"].forEach(function (t) {
  assert(vid.includes(t), "video missing: " + t);
});
["Buy now", "facial structure", "full-body shifts"].forEach(function (t) { assert(!vid.includes(t), "video has: " + t); });

var hand = S.stitch(state({ heldBy: "right" })).primary;
assert(hand.includes("held in the right hand, only the hands in frame"), "hand line");
assert(hand.includes("Keep faces, extra hands"), "hand exclusions");

var character = S.stitch(Object.assign(state({ kind: "character", entityType: "person", sex: "female", headcount: "1" }))).primary;
assert(character.includes("iris fibers"), "character keeps human realism");

// Location
function loc(extra) {
  return state(Object.assign({
    kind: "location", format: "landscape-photography", size: "16-9", crop: "wide-panoramic-vista",
    camera: "hasselblad-h6d-100c", lens: "21mm-wide-angle", aperture: "loc-f8", lighting: "golden-hour-sun-low-on-the-horizon",
    entityType: "landscape", name: "Cliff Sanctuary", locationType: "outdoor-landscape-vista", geometry: "layered-foreground-to-horizon",
    season: "autumn-foliage", foreground: "wild-grasses", locationCondition: "weathered", surfaceMaterial: "raw-concrete-with-formwork-lines",
    accentMaterial: "weathered-cedar-wood", architecture: "brutalist sanctuary in the cliff face", envMotion: "waves-breaking",
    frameRate: "time-lapse", cameraMove: "drone-flyover",
  }, extra));
}
var li = S.stitch(loc()).primary;
["Cliff Sanctuary, an outdoor landscape", "Hasselblad H6D-100c", "21mm wide-angle", "f/8, razor-sharp focus from foreground to horizon",
 "golden hour sunlight low on the horizon", "raw concrete with formwork lines with weathered cedar wood", "autumn", "wild grasses",
 "Location realism", "Geometry: clear foreground", "warped architectural lines", "no people"].forEach(function (t) {
  assert(li.includes(t), "location image missing: " + t);
});
["iris", "chin is level", "Product realism", "facial structure", "plastic skin", "packaging"].forEach(function (t) {
  assert(!li.includes(t), "location image has: " + t);
});
var lv = S.stitch(loc({ medium: "video", format: "cinematic-scene", camera: "sony-fx3-video" })).primary;
["drone flyover", "ocean waves breaking", "time-lapse", "architecture, layout, materials and light direction locked",
 "architecture and layout unchanged", "terrain shift"].forEach(function (t) { assert(lv.toLowerCase().includes(t.toLowerCase()), "location video missing: " + t); });
["Buy now", "full-body shifts", "holding any prop"].forEach(function (t) { assert(!lv.includes(t), "location video has: " + t); });

// Grammar checks across kinds
[img, vid, li, lv, character].forEach(function (text) {
  assert(!/\ba [aeiou]/i.test(text.replace(/a user|a one/gi, "")), "article 'a' before vowel: " + (text.match(/.{20}\ba [aeiou].{20}/i) || [""])[0]);
  assert(!/\.\./.test(text), "double period: " + (text.match(/.{30}\.\./) || [""])[0]);
});

// Scene: no forced gaze at camera; non-human realism for a creature
var scene = S.stitch(state({ kind: "scene", entityType: "person", sex: "male", headcount: "1", crop: "wide", angle: "front", propInHands: "a lantern", name: "Rey" })).primary;
assert(!scene.includes("face pointed directly at the camera"), "scene forces gaze");
assert(scene.includes("Rey holds a lantern"), "scene prop in hands");
var creature = S.stitch(state({ kind: "character", entityType: "creature", headcount: "1" })).primary;
assert(creature.includes("scales or metal") && !creature.includes("iris fibers"), "creature realism");
console.log("prompt checks passed");
