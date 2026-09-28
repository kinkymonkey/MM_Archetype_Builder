// Self-check: every option id the kind and location-type presets pick exists in catalogs.json.
// Run: node checks/check-preset-ids.js
var fs = require("fs");
var path = require("path");
var c = require("../catalogs.json");
var src = fs.readFileSync(path.join(__dirname, "../app.js"), "utf8");
var map = {
  format: ["formatsImage", "formatsVideo"], size: ["sizes"], crop: ["crops"], angle: ["angles"],
  cameraAngle: ["cameraAngles"], camera: ["cameras"], lens: ["lenses"], dof: ["depthsOfField"],
  lighting: ["lighting"], studioBackground: ["studioBackgrounds"], entityType: ["entityTypes"],
  headcount: ["headcounts"], style: ["styles"], settingType: ["settingTypes"], weatherTime: ["weatherTimes"],
  colorTemp: ["colorTemps"], heldBy: ["heldBy"], condition: ["conditions"], aperture: ["apertures"],
  composition: ["compositions"], productView: ["productViews"], locationType: ["locationTypes"],
  geometry: ["geometries"],
};
function between(a, b) {
  return src.slice(src.indexOf(a), src.indexOf(b, src.indexOf(a)));
}
var body = between("function kindPreset", "function setField") + between("function locationTypePreset", "function applyLocationTypePreset");
var re = /(\w+): (?:video \? "([^"]+)" : )?"([^"]+)"/g;
var m, bad = [], seen = 0;
while ((m = re.exec(body))) {
  if (!map[m[1]]) continue;
  [m[2], m[3]].filter(Boolean).forEach(function (v) {
    seen++;
    var ok = map[m[1]].some(function (k) {
      return c[k].some(function (i) { return i.id === v; });
    });
    if (!ok) bad.push(m[1] + "=" + v);
  });
}
if (seen < 50) throw new Error("parsed only " + seen + " preset values; check the slice");
if (bad.length) throw new Error("missing ids: " + bad.join(", "));
console.log("preset ids ok (" + seen + " checked)");
