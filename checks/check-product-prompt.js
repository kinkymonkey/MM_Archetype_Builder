// Self-check: Product/Props prompts carry product details and no human-only text.
// Run: node checks/check-product-prompt.js
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
console.log("product prompt checks passed");
